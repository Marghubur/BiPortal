import { ErrorToast, Toast } from "./../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Component, OnInit } from "@angular/core";
declare var $: any;
import { iNavigation } from "src/providers/iNavigation";
import { JwtService, ResponseModel } from './../../auth/jwtService'
import { Dashboard, UserDashboard, UserType } from "src/providers/constants";

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
  isLoginPage: boolean = false;
  registrationValue: any = {};
  loginValue: any = {};

  @Output() userAuthState = new EventEmitter();

  UserForm = {
    UserId: "",
    Password: "",
    ConfirmPassword: "",
    RegistrationCode: "",
    ShopName: "",
    MobileNo: ""
  };

  constructor(
    private http: AjaxService,
    private nav: iNavigation,
    private jwtService: JwtService
  ) { }

  ngOnInit() {
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

      if (userId.value !== "" && password.value !== "") {
        if(userId.value.indexOf("@") !== -1) {
          this.loginValue.EmailId = userId.value;
        } else {
          this.loginValue.Mobile = userId.value;
        }

        let url = null;
        switch(this.userType) {
          case 'system':
            url = 'Login/Authenticate';
            break
          case 'employee':
            url = 'Login/AuthenticateUser';
            break
        }

        this.loginValue.Password = password.value;
        this.http.login(url, this.loginValue).then((result: ResponseModel) => {
          if (result.ResponseBody) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Please wait loading dashboard ...", 15);
            if(this.userType == 'employee')
              this.nav.navigate(UserDashboard, null);
            else
              this.nav.navigate(Dashboard, null);
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

  userRegistration() {
    this.isLoading = true;
    this.registrationValue = {
      Password: null,
      EmailId: null,
      Mobile: null,
      OrganizationName: null,
      CompanyName: null,
      UserTypeId: UserType.Admin
    };
    this.registrationValue.EmailId = (<HTMLInputElement>document.getElementById("Email")).value;
    this.registrationValue.Password = (<HTMLInputElement>document.getElementById("NewPassword")).value;
    this.registrationValue.Mobile =(<HTMLInputElement>document.getElementById("Mobile")).value;
    this.registrationValue.CompanyName =(<HTMLInputElement>document.getElementById("CompanyName")).value;
    this.registrationValue.OrganizationName =(<HTMLInputElement>document.getElementById("OrganizationName")).value;
    let errorCounter = 0;
    if (this.registrationValue.EmailId == '' || this.registrationValue.EmailId == null)
      errorCounter++;
    if (this.registrationValue.Password == '' || this.registrationValue.Password == null)
      errorCounter++;
    if (this.registrationValue.CompanyName == '' || this.registrationValue.CompanyName == null)
      errorCounter++;
    if (this.registrationValue.Mobile == '' || this.registrationValue.Mobile == null)
      errorCounter++;
    if (this.registrationValue.OrganizationName == '' || this.registrationValue.OrganizationName == null)
      errorCounter++;
    if ((<HTMLInputElement>document.getElementById("acceptTerm")).checked == false)
      errorCounter++;

    if (this.registrationValue && errorCounter === 0) {
      this.http.post('', this.registrationValue).then((result: ResponseModel) => {
        if (result.ResponseBody) {
          Toast("Registration done");
        } else {
          ErrorToast("Fail to registration. Please contact to admin.");
        }
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }

  validateEmail() {
    let value = (<HTMLInputElement>document.getElementById("Email")).value
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

  backToHomePage() {
    this.nav.navigate("/", null);
  }

  enableSystem() {
    this.userType = "system";
  }

  enableEmployee() {
    this.userType = "employee";
  }
}
