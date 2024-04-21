import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { Toast } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-free-trail',
  templateUrl: './free-trail.component.html',
  styleUrls: ['./free-trail.component.scss']
})
export class FreeTrailComponent implements OnInit {
  trailForm: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder,
              private http: CoreHttpService) {}

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
      Country: new FormControl(null, [Validators.required]),
      State: new FormControl(null, [Validators.required]),
      City: new FormControl(null, [Validators.required]),
      FullAddress: new FormControl(null, [Validators.required]),
      OrganizationName: new FormControl(null, [Validators.required])
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
    this.http.post("Price/AddFreeTrial", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Request submiited successfully");
        this.trailForm.reset();
        this.isLoading = false;
        this.submitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
      this.submitted = false;
    })
  }
}
