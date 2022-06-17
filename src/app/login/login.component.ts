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
      let request = {
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
          request.EmailId = userId.value;
        } else {
          request.Mobile = userId.value;
        }

        request.Password = password.value;
        this.http.login("Login/AuthenticateUser", request).then((result: ResponseModel) => {
          if (result.ResponseBody) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Please wait loading dashboard ...", 10);
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
