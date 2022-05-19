import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import { confirmPasswordValidator } from './confirmedpassword.validator'
@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted: boolean = false;
  isLoading: boolean = false;
  isLogOut: boolean = false;
  isPasswordChanged: boolean = false;
  userDetail: UserDetail = new UserDetail();

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private local: ApplicationStorage,
              private user: UserService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
    this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
    } else {
      Toast("Invalid user. Please login again.")
    }
    this.initForm();
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      oldPassword: new FormControl ('', [Validators.required]),
      newPassword: new FormControl ('', [Validators.required, Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,20}$/)]),
      confirmPassword: new FormControl ('', [Validators.required, Validators.pattern(/^(?=\D*\d)(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z]).{6,20}$/)])
    }, {
      validator: confirmPasswordValidator('newPassword', 'confirmPassword')
    })
  }

  onSubmit() {
    this.submitted = true;
    this.isLoading = true;
    this.isPasswordChanged = false;
    if (this.resetPasswordForm.invalid) {
      this.isLoading = false;
      return;
    }
    let password = {
      Password: this.resetPasswordForm.controls['oldPassword'].value,
      NewPassword: this.resetPasswordForm.controls['newPassword'].value,
      UserTypeId: this.userDetail.UserTypeId,
      EmailId: this.userDetail.EmailId,
      Mobile: this.userDetail.Mobile,
      UserId: this.userDetail.UserId
    }
    this.http.post("login/ResetEmployeePassword", password)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        Toast(response.ResponseBody);
        this.onReset();
        this.isPasswordChanged = true;
      } else {
        ErrorToast("Unable to update your password");
      }
      this.isLoading = false;
    })
  }

  get f () {
    return this.resetPasswordForm.controls;
  }

  LogoutUser() {
    this.isLogOut = true
    this.nav.logout();
    Toast("Log out successfully");
    this.isLogOut = false;
    this.isPasswordChanged = false;
    this.nav.navigate("/", null);
  }

  onReset() {
    this.resetPasswordForm.reset();
    this.submitted = false;
    this.isLoading = false;
    this.isPasswordChanged = false;
  }

}
