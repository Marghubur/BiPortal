import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { AjaxService } from "./../../providers/ajax.service";
import { CommonService, Toast, UserDetail } from "./../../providers/common-service/common.service";
import { AccessTokenExpiredOn, AdminResetPassword, Blogs, BuildPdf, CompanyLogo, CompanySettings, Documents, Employees, Login, Profile } from "./../../providers/constants";
import { Component, OnInit, Input, Output, EventEmitter, DoCheck } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { UserService } from "src/providers/userService";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, DoCheck {
  public sidebarOpened = false;
  public sizeOptions: Array<number> = [1,2, 3, 4, 5, 6, 7, 8, 9, 10];
  User: string;
  NotificationBadge: number = 0;
  InformationBadge: number = 0;
  NotificationDetail: Array<PopOverDetail> = [];
  InformationDetail: Array<PopOverDetail> = [];
  IsLoggedIn: boolean = false;
  PageName: string = BuildPdf;
  Messages: Array<string> = [];
  userDetail: UserDetail = new UserDetail();
  Menu: Array<any> = [];
  TineMenu: boolean = false;
  isAdmin: boolean = true;
  root: any = null;

  @Output() authentication = new EventEmitter();

  toggleOffcanvas() {
    let $doc: any = document;
    this.sidebarOpened = !this.sidebarOpened;
    if (this.sidebarOpened) {
      $doc.querySelector(".sidebar-offcanvas").classList.add("active");
    } else {
      $doc.querySelector(".sidebar-offcanvas").classList.remove("active");
    }
  }

  constructor(
    private nav: iNavigation,
    private commonService: CommonService,
    private http: AjaxService,
    private local: ApplicationStorage,
    private tokenHelper: JwtService,
    private user: UserService
  ) {
    this.root = document.body;
  }

  ngDoCheck(): void {
    let data = this.local.findRecord("UserDetail");
    if (data.UserTypeId == 1)
      this.isAdmin = true;
    else
      this.isAdmin = false;
  }

  ngOnInit() {
    this.IsLoggedIn = false;
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);

    if(this.userDetail.TokenExpiryDuration.getTime() - (new Date()).getTime() <= 0 && expiredOn !== null) {
      this.http.post("login/AuthenticateUser", this.userDetail).then(
        (response: ResponseModel) => {
          if(response.ResponseBody !== null) {
            this.IsLoggedIn = true;
            this.userDetail = response.ResponseBody["UserDetail"];
            this.Menu = response.ResponseBody["Menu"];
            this.local.set(response.ResponseBody);
            this.tokenHelper.setJwtToken(this.userDetail['Token'], this.userDetail.TokenExpiryDuration.toString());
          } else {
            this.IsLoggedIn = false;
            this.local.set("");
          }
        },
        error => {
          this.IsLoggedIn = false;
          this.commonService.ShowToast(
            "Your session expired. Please login again."
          );
        }
      );
    } else {
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.IsLoggedIn = true;
        this.userDetail = Master["UserDetail"];
        this.Menu = Master["Menu"];
      }
    }
  }

  navLogoPage() {
    this.nav.navigate(CompanyLogo, null);
  }

  ViewUserProfile() {

  }

  landLoginPage() {
    this.nav.navigate(Login, null);
  }

  LoadDocFiles() {
    this.nav.navigate(Documents, null);
  }

  Loademployees() {
    this.nav.navigate(Employees, null);
  }

  CleanUpDetail() {

  }

  LogoutUser() {
    this.nav.logout();
    Toast("Log out successfully");
    this.nav.navigate("/", null);
  }

  NavigatetoHome() {
    this.nav.navigate("", null);
  }

  GoToLoginPage() {
    this.nav.navigate(Login, null);
  }

  GoBlogsPage() {
    this.nav.navigate(Blogs, null);
  }

  AutoDemo() {
    this.nav.navigate("/", null);
  }

  navCompanySetting() {
    this.nav.navigate(CompanySettings, null);
  }

  resetPassword() {
    this.nav.navigate(AdminResetPassword, null);
  }

  mangeAccount() {
    this.nav.navigate(Profile, null);
  }

  toggleMenu() {
    let $e = document.getElementById("page-menu");
    if($e && !this.TineMenu) {
      $e.classList.add("d-block");
    } else {
      $e.classList.remove("d-block");
    }
    this.TineMenu = !this.TineMenu;
  }

  balanceZooming(e: any) {
    let value = Number(e.target.value);
    let size = this.commonService.GetDefaultFontSize();
    size += value * 0.01;
    this.root.setAttribute("style", `font-size: ${size}vw !important`);
    // this.commonService.SetDefaultFontSize(size);
  }

  undozooming() {
    let size = 0.80;
    this.root.setAttribute("style", `font-size: ${size}vw !important`);
    this.commonService.SetDefaultFontSize(size);
  }
}

interface PopOverDetail {
  imgName: string;
  name: string;
  time: string;
  message: string;
}
