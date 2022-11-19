import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { Login } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;

@Component({
  selector: 'app-initialpage',
  templateUrl: './initialpage.component.html',
  styleUrls: ['./initialpage.component.scss']
})
export class InitialpageComponent implements OnInit {
  active = 1;
  submitted: boolean = false;
  isLoading: boolean = false;
  initialForm: FormGroup;
  openingmodel: NgbDateStruct;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.initCompany();
  }

  initCompany() {
    this.initialForm = this.fb.group({
      OrganizationName: new FormControl(null, [Validators.required]),
      CompanyName: new FormControl(null, [Validators.required]),
      FirstName: new FormControl(null, [Validators.required]),
      LastName: new FormControl(null, [Validators.required]),
      EmailId: new FormControl(null, [Validators.required, Validators.email]),
      EmailHost: new FormControl(null, [Validators.required]),
      PortNo: new FormControl(null, [Validators.required]),
      EnableSsl: new FormControl(true, [Validators.required]),
      DeliveryMethod: new FormControl(null),
      UserDefaultCredentials: new FormControl(false, [Validators.required]),
      Credentials: new FormControl(null, [Validators.required]),
      EmailName: new FormControl(null, [Validators.required]),
      IsPrimary: new FormControl(true, [Validators.required]),
      GSTNo: new FormControl(null, [Validators.required]),
      AccountNo: new FormControl(null, [Validators.required]),
      BankName: new FormControl(null, [Validators.required]),
      Branch: new FormControl(null, [Validators.required]),
      BranchCode: new FormControl(null, ),
      IFSC: new FormControl(null, [Validators.required]),
      IsPrimaryAccount: new FormControl (true, [Validators.required]),
      Mobile: new FormControl(null, [Validators.required])
    })
  }

  get f () {
    return this.initialForm.controls;
  }

  registerAccount() {
    this.isLoading = true;
    this.submitted = true;
    console.log(this.initialForm.value);
    if (this.initialForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.initialForm.value;
    this.http.post("InitialRegistration/InitialOrgRegistration", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Registration done successfully");
        $('#messageModal').modal('show');
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  gotoLoginPage() {
    $('#messageModal').modal('hide');
    this.nav.navigate(Login, null);
  }

}
