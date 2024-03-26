import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-free-trail',
  templateUrl: './free-trail.component.html',
  styleUrls: ['./free-trail.component.scss']
})
export class FreeTrailComponent implements OnInit {
  trailForm: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.trailForm = this.fb.group({
      FullName: new FormControl(null, [Validators.required]),
      Email: new FormControl(null, [Validators.required, Validators.email]),
      PhoneNumber: new FormControl(null, [Validators.required]),
      CompanyName: new FormControl(null, [Validators.required]),
      HeadCount: new FormControl(null, [Validators.required]),
    })
  }

  get f() {
    return this.trailForm.controls;
  }

  save() {
    this.submitted = true;
    this.isLoading = true;
    if (this.trailForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.trailForm.value;
    console.log(value);
  }
}
