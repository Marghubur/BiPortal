import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { AjaxService } from "./../../providers/ajax.service";
import { CommonService, UserDetail } from "./../../providers/common-service/common.service";
import { AccessTokenExpiredOn, Blogs, BuildPdf, Doclist, Employees, Login } from "./../../providers/constants";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";
import { AutoPlayService } from "src/providers/AutoPlayService";
import { JwtService, ResponseModel } from "src/auth/jwtService";
import { UserService } from "src/providers/userService";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
  public sidebarOpened = false;
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
    private autoPlay: AutoPlayService,
    private tokenHelper: JwtService,
    private user: UserService
  ) {
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

  ViewUserProfile() {

  }

  landLoginPage() {
    //this.nav.navigate(Login, null);
    this.authentication.emit();
  }

  LoadDocFiles() {
    this.nav.navigate(Doclist, null);
  }

  Loademployees() {
    this.nav.navigate(Employees, null);
  }

  CleanUpDetail() {

  }

  LogoutUser() {

    this.nav.logout();
    this.commonService.ShowToast("Log out successfully");
    window.location.reload();
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
    // this.commonService.SetAutoPlayValue(true);
    // this.commonService.OperateAutoPlay();
    this.nav.navigate("/", null);
    setTimeout(() => {
      this.autoPlay.SetAutoPlayValue(true);
      this.autoPlay.InitAutoPlay();
    }, 100);
  }
}

interface PopOverDetail {
  imgName: string;
  name: string;
  time: string;
  message: string;
}
