import { AjaxService } from "src/providers/ajax.service";
import { iNavigation } from "src/providers/iNavigation";
import { Dashboard, UserDashboard, UserType } from "src/providers/constants";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { environment } from "src/environments/environment";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { ErrorToast, Toast } from "src/providers/common-service/common.service";
declare var $: any;

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  title = "Business manager";
  initialUrl: string = "";
  catagory: any = {};
  isLoading: boolean = false;
  isUserMode: boolean = true;
  userType: string = 'system';
  isLoginPage: boolean = true;
  registrationValue: any = {};
  loginValue: any = {};
  agreeWithTermsAndCondition: boolean = false;
  isRegistrationDone: boolean = false;
  isShowPassword: boolean = false;
  isLocal: boolean = false;

  @Output() userAuthState = new EventEmitter();

  UserForm = {
    UserId: "",
    Password: "",
    ConfirmPassword: "",
    RegistrationCode: "",
    ShopName: "",
    MobileNo: ""
  };

  showPassword() {
    document.getElementById('Password').setAttribute('type', 'text');
    this.isShowPassword = true;
  }

  hidePassword() {
    document.getElementById('Password').setAttribute('type', 'password');
    this.isShowPassword = false;
  }

  constructor(
    private http: AjaxService,
    private nav: iNavigation,
    private jwtService: JwtService
  ) { }

  ngOnInit() {
    if(environment.env == "local"){
      this.isLocal = true;
    }

    this.isRegistrationDone = false;
    localStorage.clear();
    sessionStorage.clear();
    this.nav.clearNavigation();
  }

  switchMode() {
    this.isUserMode = !this.isUserMode;
  }

  UserLogin() {
    this.isLoading = true;
    if (this.UserForm) {
      this.isLoading = true;
      this.loginValue = {
        Password: null,
        EmailId: null,
        Mobile: null,
        MediaName: null,
        AccessToken: null,
        UserTypeId: this.userType == 'employee' ? UserType.Employee : UserType.Admin
      };

      let userId: any = document.getElementById("EmailOrMobile");
      let password: any = document.getElementById("Password");
      let companyCode: any = document.getElementById("CompanyCode");

      if (!userId.value) {
        this.isLoading = false;
        ErrorToast("Please enter email or mobile");
        return;
      }

      if (!password.value) {
        this.isLoading = false;
        ErrorToast("Please enter the password");
        return;
      }

      if (!companyCode.value) {
        this.isLoading = false;
        ErrorToast("Please enter the password");
        return;
      }

      let termAndService: any = (document.getElementById("gridCheck") as HTMLInputElement).checked;
      if (!termAndService) {
        this.isLoading = false;
        ErrorToast("Please agree with our term and service");
        return;
      }

      if (userId.value !== "" && password.value !== "") {
        if(userId.value.indexOf("@") !== -1) {
          this.loginValue.EmailId = userId.value;
        } else {
          this.loginValue.Mobile = userId.value;
        }

        this.loginValue.Password = password.value;
        this.loginValue.CompanyCode = companyCode.value;
        this.http.login('Login/Authenticate', this.loginValue).then((result: ResponseModel) => {
          if (result.ResponseBody) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Please wait loading dashboard ...", 15);
            if(Data.UserTypeId == 1)
              this.nav.navigate(Dashboard, null);
            else
              this.nav.navigate(UserDashboard, null);
          } else {
            ErrorToast("Incorrect username or password. Please try again.");
          }
        }).catch(e => {
          this.isLoading = false;
        });
      }
    } else {
      this.isLoading = false;
    }
  }

  ResetSignUpForm() {
    this.UserForm.UserId = '';
    this.UserForm.Password = '';
    this.UserForm.ConfirmPassword = '';
    this.UserForm.RegistrationCode = '';
    this.UserForm.ShopName = '';
    this.UserForm.MobileNo = null;

    $("#signup").hide();
    $("#signin").fadeIn();
  }

  SignupUser() {
    this.isLoading = true;
    if (this.UserForm) {
      // let UserSighupData = this.UserForm.getRawValue();
      // if (UserSighupData.Password === UserSighupData.ConfirmPassword) {
      //   this.http.post("Authentication/ShopSigup", UserSighupData).then(
      //     result => {
      //       if (result.ResponseBody) {
      //         // this.commonService.ShowToast("Registration done successfully");
      //         this.ResetSignUpForm();
      //       }
      //       this.isLoading = false;
      //     },
      //     error => {
      //       this.isLoading = false;
      //       // this.commonService.ShowToast("Registration fail. Please contact to admin.");
      //     }
      //   );
      // } else {
      //   this.isLoading = false;
      //   // this.commonService.ShowToast("Password and Confirmpassword is not matching.");
      // }
    } else {
      this.isLoading = false;
    }
  }

  changePopup(status: string) {
    this.isRegistrationDone = false;
    if (status == 'loginPage') {
      this.isLoginPage = true;
      this.loginValue = null;
      this.registrationValue = null;
    }
    else {
      this.isLoginPage = false;
      this.loginValue = null;
      this.registrationValue = null;
    }
  }

  enableSignUp(e: any) {
    if (e.currentTarget.checked == true)
      this.agreeWithTermsAndCondition = true;
    else
      this.agreeWithTermsAndCondition = false;
  }

  userRegistration() {
    this.isLoading = true;
    this.registrationValue = {
      EmailId: null,
      Mobile: null,
      OrganizationName: null,
      CompanyName: null,
      AuthenticationCode: null,
    };
    this.registrationValue.EmailId = (<HTMLInputElement>document.getElementById("Email")).value;
    this.registrationValue.Mobile =(<HTMLInputElement>document.getElementById("Mobile")).value;
    this.registrationValue.CompanyName =(<HTMLInputElement>document.getElementById("CompanyName")).value;
    this.registrationValue.OrganizationName =(<HTMLInputElement>document.getElementById("OrganizationName")).value;
    this.registrationValue.AuthenticationCode =(<HTMLInputElement>document.getElementById("AuthenticationCode")).value;

    let errorCounter = 0;
    if (!this.registrationValue.EmailId || this.registrationValue.EmailId == "")
      errorCounter++;
    if (!this.registrationValue.Mobile || this.registrationValue.Mobile == "")
      errorCounter++;
    if (!this.registrationValue.CompanyName || this.registrationValue.CompanyName == "")
      errorCounter++;
    if (!this.registrationValue.OrganizationName || this.registrationValue.OrganizationName == "")
      errorCounter++;
    if (!this.registrationValue.AuthenticationCode || this.registrationValue.AuthenticationCode == '')
      errorCounter++;

    if (this.registrationValue && errorCounter === 0) {
      this.http.post('login/SignUpNew', this.registrationValue).then((result: ResponseModel) => {
        if (result.ResponseBody) {
          Toast("Registration done");
          this.isLoginPage = false;
          this.isRegistrationDone = true;
        } else {
          ErrorToast("Fail to registration. Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }

  validateEmail() {
    let value = (<HTMLInputElement>document.getElementById("Email")).value
    this.emailValidation(value);
  }

  emailValidation(value: any) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regex.test(value))
      return (true)
    else {
      ErrorToast("Invalid email address!")
      return (false)
    }
  }

  AllowMobilenoOnly(e: any) {
    let $e: any = event;
    // if (!this.commonService.MobileNumberFormat(e.which, $($e.currentTarget).val().length)) {
    //   if (e.which !== 9) $e.preventDefault();
    // }
  }

  EnableSignup() {
    $("#signin").hide();
    $("#signup").fadeIn();
  }

  isScrollbarBottom(container: any) {
    var height = container.outerHeight();
    var scrollHeight = container[0].scrollHeight;
    var scrollTop = container.scrollTop();
    if (scrollTop >= scrollHeight - height) {
      return true;
    }
    return false;
  }

  refreshToken(): void {
    // this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).then(user => {

    // });
  }

  onGoogleSignIn() {
    //this.isGoogleLogin = true;
    event.preventDefault();
    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: any) => {
    //   if(user !== null) {
    //     let userSignInDetail = {
    //       UserId: 0,
    //       FirstName: user.firstName,
    //       LastName: user.lastName,
    //       Mobile: null,
    //       EmailId: user.email,
    //       Address: null,
    //       CompanyName: null,
    //       MediaName: "google",
    //       AccessToken: user.response.access_token
    //     };

    //     this.http.post("login/SignUpViaSocialMedia", userSignInDetail).then((response: ResponseModel) => {
    //       if(response.ResponseBody !== null && response.ResponseBody !== "") {
    //         this.jwtService.setLoginDetail(response.ResponseBody);
    //         this.commonService.ShowToast("Registration done successfully");
    //         this.nav.navigate("/", null);
    //       }
    //       this.isGoogleLogin = false;
    //     }).catch(err => {
    //       this.isGoogleLogin = false;
    //       this.commonService.ShowToast("Got some internal error. Please contact admin.");
    //     });
    //   } else {
    //     this.commonService.ShowToast("Registration fail. Please contact to admin.");
    //   }
    // }).catch(e => {
    //   this.isGoogleLogin = false;
    // });
  }

  gotoLogin() {
    this.isLoginPage = true;
    this.isRegistrationDone = false;
  }

  backToHomePage() {
    this.nav.navigate("/", null);
  }

  enableSystem() {
    this.userType = "system";
  }

  enableEmployee() {
    this.userType = "employee";
  }

  forgotPasswordModal() {
    $('#ForgotPasswordModal').modal('show');
  }

  sendForgotPassword() {
    this.isLoading = true;
    let email: string = (<HTMLInputElement> document.getElementById('registeredEmailId')).value;
    let companyCode = (<HTMLInputElement> document.getElementById('RegisterCompanyCode')).value;
    if(email && email != '' && this.emailValidation(email) && companyCode) {
      let value = {
        EmailId: email,
        CompanyCode: companyCode
      }
      this.http.forgotPassword('Login/ForgotPassword', value, false).then(res => {
        if (res.ResponseBody) {
          Toast("Password send on your email id. Please check your email");
          $('#ForgotPasswordModal').modal('hide');
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }
}
