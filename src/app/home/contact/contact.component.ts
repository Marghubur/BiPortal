import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactUsForm: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.contactUsForm = this.fb.group({
      Name: new FormControl(null, [Validators.required]),
      Email: new FormControl(null, [Validators.required, Validators.email]),
      PhoneNumber: new FormControl(null, [Validators.required]),
      CompanyName: new FormControl(null, [Validators.required]),
      Message: new FormControl(null, [Validators.required]),
      AgreeTermCondition: new FormControl(false, [Validators.requiredTrue])
    })
  }

  get f() {
    return this.contactUsForm.controls;
  }

  save() {
    this.submitted = true;
    this.isLoading = true;
    if (this.contactUsForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.contactUsForm.value;
    console.log(value);
  }

}
