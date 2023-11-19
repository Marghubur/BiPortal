import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-free-trail',
  templateUrl: './free-trail.component.html',
  styleUrls: ['./free-trail.component.scss']
})
export class FreeTrailComponent implements OnInit {
  trailForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.trailForm = this.fb.group({
      FullName: new FormControl(""),
      Email: new FormControl(""),
      PhoneNumber: new FormControl(""),
      CompanyName: new FormControl(""),
      HeadCount: new FormControl("")
    })
  }

  save() {
    let value = this.trailForm.value;
    console.log(value);
  }
}
