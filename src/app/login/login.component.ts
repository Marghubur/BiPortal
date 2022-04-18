import { CommonService, ErrorToast, Toast } from "./../../providers/common-service/common.service";
import { AjaxService } from "src/providers/ajax.service";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Component, OnInit } from "@angular/core";
declare var $: any;
import { iNavigation } from "src/providers/iNavigation";
import { JwtService, ResponseModel } from './../../auth/jwtService'
// import { SocialAuthService } from "angularx-social-login";
// import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
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
  // isGoogleLogin: boolean = false;
  // isGitHubLogin: boolean = false;
  isUserMode: boolean = true;
  userType: string = 'employee';

  @Output() userAuthState = new EventEmitter();

  UserForm = new FormGroup({
    UserId: new FormControl(""),
    Password: new FormControl(""),
    ConfirmPassword: new FormControl(""),
    RegistrationCode: new FormControl(""),
    ShopName: new FormControl(""),
    MobileNo: new FormControl("")
  });

  constructor(
    private http: AjaxService,
    private commonService: CommonService,
    private nav: iNavigation,
    // private authService: SocialAuthService,
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

  LoginProvider() {
    this.isLoading = true;
    if (this.UserForm.valid) {
      this.isLoading = true;
      let request = {
        Password: null,
        EmailId: null,
        Mobile: null,
        MediaName: null,
        AccessToken: null,
        UserTypeId: this.userType == 'employee' ? UserType.Employee : UserType.Admin
      };
      let userId = this.UserForm.controls['UserId'].value;
      let password = this.UserForm.controls['Password'].value;

      if (userId !== "" && password !== "") {
        if(userId.indexOf("@") !== -1) {
          request.EmailId = userId;
        } else {
          request.Mobile = userId;
        }

        request.Password = password;
        this.http.login("Login/AuthenticateProvider", request).then((result: ResponseModel) => {
          if (this.commonService.IsValid(result)) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Please wait loading dashboard ...");
            if(this.userType == 'employee')
              this.nav.navigate(UserDashboard, null);
            else
              this.nav.navigate(Dashboard, null);
          } else {
            ErrorToast("Incorrect username or password. Please try again.");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
        });
      }
    } else {
      this.isLoading = false;
    }
  }

  LoginUser() {
    this.isLoading = true;
    if (this.UserForm.valid) {
      this.isLoading = true;
      let request = {
        Password: null,
        EmailId: null,
        Mobile: null,
        MediaName: null,
        AccessToken: null,
        UserTypeId: UserType.Candidate,
      };
      let userId = this.UserForm.controls['UserId'].value;
      let password = this.UserForm.controls['Password'].value;

      if (userId !== "" && password !== "") {
        if(userId.indexOf("@") !== -1) {
          request.EmailId = userId;
        } else {
          request.Mobile = userId;
        }

        request.Password = password;
        this.http.login("Login/AuthenticateUser", request).then((result: ResponseModel) => {
          if (this.commonService.IsValid(result)) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Login done. Loading dashboard ...");
            this.nav.navigate(UserDashboard, null);
          } else {
            ErrorToast("Incorrect username or password. Please try again.");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
        });
      }
    } else {
      this.isLoading = false;
    }
  }

  ResetSignUpForm() {
    this.UserForm.controls["UserId"].setValue("");
    this.UserForm.controls["Password"].setValue("");
    this.UserForm.controls["ConfirmPassword"].setValue("");
    this.UserForm.controls["RegistrationCode"].setValue("");
    this.UserForm.controls["ShopName"].setValue("");
    this.UserForm.controls["Mobile"].setValue("");

    $("#signup").hide();
    $("#signin").fadeIn();
  }

  SignupUser() {
    this.isLoading = true;
    if (this.UserForm.valid) {
      let UserSighupData = this.UserForm.getRawValue();
      if (UserSighupData.Password === UserSighupData.ConfirmPassword) {
        this.http.post("Authentication/ShopSigup", UserSighupData).then(
          result => {
            if (this.commonService.IsValidString(result)) {
              this.commonService.ShowToast("Registration done successfully");
              this.ResetSignUpForm();
            }
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
            this.commonService.ShowToast(
              "Registration fail. Please contact to admin."
            );
          }
        );
      } else {
        this.isLoading = false;
        this.commonService.ShowToast(
          "Password and Confirmpassword is not matching."
        );
      }
    } else {
      this.isLoading = false;
    }
  }

  AllowMobilenoOnly(e: any) {
    let $e: any = event;
    if (!this.commonService.MobileNumberFormat(e.which, $($e.currentTarget).val().length)) {
      if (e.which !== 9) $e.preventDefault();
    }
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
}
