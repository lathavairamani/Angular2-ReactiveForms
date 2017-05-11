import { Component, OnInit } from '@angular/core';
import { FormGroup, /*FormControl,*/ FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';
import { Customer } from './customer';

import 'rxjs/add/operator/debounceTime';

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): {[key: string]: boolean} | null => {
    if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
     return { 'range' : true };
   }
      return null;
  };
}

function emailMatcher(c: AbstractControl): {[key: string]: boolean} | null {
  let emailControl = c.get('email');
  let confirmEmailControl = c.get('confirmEmail');
  if (emailControl.pristine || confirmEmailControl.pristine) {
    return null;
  }
  if (emailControl.value === confirmEmailControl.value) {
    return null;
  }
  return {'match': true};
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    customer: Customer= new Customer();
    emailMessage: string;

    private validationMessages = {
      required: 'Please enter your email address.',
      pattern: 'Please enter a valid email address.'
    };
    constructor(private formBuilder: FormBuilder) {}

    get addresses(): FormArray {
        return <FormArray>this.customerForm.get('addresses');
    }

    ngOnInit(): void {
       this.customerForm = this.formBuilder.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        // Way of validation 
        // lastName: {value:'n/a', disabled: true},
        emailGroup: this.formBuilder.group({
            email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            confirmEmail: ['', Validators.required],
        }, {validator: emailMatcher}),
        phone: '',
        notification: 'email',
        rating: ['', ratingRange(1, 5)],
        sendCatalog: true,
        addresses: this.formBuilder.array([ this.buildAddress() ])
      });

      this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value));
      const emailControl = this.customerForm.get('emailGroup.email');
      emailControl.valueChanges.debounceTime(1000).subscribe(value => this.setMessage(emailControl));

// Creating form using FormGroup
//      this.customerForm = new FormGroup({
//        firstName: new FormControl(),
//        lastName: new FormControl(),
//        email: new FormControl(),
//        sendCatalog: new FormControl(true)
//      });
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }

    populateTestData(): void {
      this.customerForm.setValue({
        firstName: 'Latha',
        lastName: 'Vairamani',
        email: 'lathavairamani@gmail.com',
        sendCatalog: false
      });
         // For partial values in form 
//          this.customerForm.patchValue({
//        firstName: 'Latha',
//        lastName: 'Vairamani',
//        sendCatalog: false
//      });
    }

    setNotification(notification: string): void {
      const phoneControl = this.customerForm.get('phone');
      if (notification === 'text') {
        phoneControl.setValidators(Validators.required);
      } else {
        phoneControl.clearValidators();
      }
      phoneControl.updateValueAndValidity();
    }

    setMessage(c: AbstractControl): void {
      this.emailMessage = '';
      if ((c.touched || c.dirty) && c.errors) {
        this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
      }
    }

    buildAddress(): FormGroup {
      return this.formBuilder.group({
          addressType: 'home',
          street1: '',
          street2: '',
          city: '',
          zip: '',
          state: ''
        });
    }

    addAddress(): void {
      this.addresses.push(this.buildAddress());
    }

}
