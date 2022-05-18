import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { confirmPasswordValidator } from './confirmedpassword.validator'
@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  subitted: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.resetPasswordForm = this.fb.group({
      oldPassword: new FormControl ('', [Validators.required]),
      newPassword: new FormControl ('', [Validators.required, Validators.maxLength(20), Validators.minLength(6), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")]),
      confirmPassword: new FormControl ('', [Validators.required, Validators.maxLength(20), Validators.minLength(6), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")])
    }, {
      validator: confirmPasswordValidator('newPassword', 'confirmPassword')
    })
  }

  onSubmit() {
    this.subitted = true;
    if (this.resetPasswordForm.invalid)
      return;
    console.log(this.resetPasswordForm.value)
  }

  get f () {
    return this.resetPasswordForm.controls;
  }

}
