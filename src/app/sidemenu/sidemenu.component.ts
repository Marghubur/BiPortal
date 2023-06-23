import { ApplicationStorage } from "../../providers/ApplicationStorage";
import { AjaxService } from "../../providers/ajax.service";
import { CommonService, ErrorToast, Toast, UserDetail } from "../../providers/common-service/common.service";
import { AccessTokenExpiredOn, AdminMasterData, AdminNotification, Blogs, BuildPdf, Documents, Employees, Login, OrganizationSetting } from "../../providers/constants";
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";
import { UserService } from "src/providers/userService";

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit {
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
  CatagoryPosition: number = 0;
  MenuName: string = '';
  isAdmin: boolean = false;

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
    private user: UserService
  ) {
  }

  ngOnInit() {
    this.IsLoggedIn = false;
    this.isAdmin = true;
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);

    if(this.userDetail.TokenExpiryDuration.getTime() - (new Date()).getTime() <= 0 && expiredOn !== null) {
      this.nav.navigate("/", null);
    } else {
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.IsLoggedIn = true;
        this.userDetail = Master["UserDetail"];
        if (this.userDetail.UserTypeId == 2) {
          this.isAdmin = false;
        }

        let menuItem = this.nav.getRouteList();
        this.MenuName = menuItem[menuItem.length - 1].Key;
        this.BuildMenu(Master["Menu"]);
      }
    }
  }

  BuildMenu(menu: any) {
    this.Menu = [];
    let isActive = false;
    if(menu) {
      let parentItems = menu.filter(x => x.Childs == null);
      if(parentItems.length > 0) {
        let filteredMenu = [];
        let menuItems = [];
        let i = 0;
        let index = 0;
        while(i < parentItems.length) {
          isActive = false;
          menuItems = menu.filter(x => x.Childs === parentItems[i].Catagory);
          index = menuItems.findIndex(x => x.Link === this.MenuName);
          if(index >= 0) {
            isActive = true;
          }
          filteredMenu.push({
            Name: parentItems[i].Catagory,
            ParentDetail: parentItems[i],
            Value: menuItems,
            IsActive: isActive
          });

          index = -1;
          i++;
        }

        this.Menu = filteredMenu.filter(x => x.Value.length > 0);
      } else {
        ErrorToast("Hmm! Looks login issue. Please Login again.");
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
    this.nav.navigate(Documents, null);
  }

  Loademployees() {
    this.nav.navigate(Employees, null);
  }

  CleanUpDetail() {

  }

  cleanupEmpId(link: string) {
    if (link == "accounts/declaration" || link == "accounts/salary" || link == "accounts/preferences")
      this.local.removeByKey("EmployeeId");
  }

  NavigatetoHome() {
    this.nav.navigate("", null);
  }

  GoToLoginPage() {
    this.nav.navigate(Login, null);
  }

  notification() {
    this.nav.navigate(AdminNotification, null);
  }

  GoBlogsPage() {
    this.nav.navigate(Blogs, null);
  }

  AutoDemo() {
    this.nav.navigate("/", null);
  }

  organizationSetting() {
    this.nav.navigate(OrganizationSetting, null)
  }

  toggleSection(e: any, index: number) {
    let elems: any = document.getElementById('menu-items');
    let h = elems.querySelectorAll('h4[name="menu-header"]');
    let d = elems.querySelectorAll('div[name="menu-body"]');
    let i = 0;
    while(i < h.length) {
      if(i === index) {
        h[i].classList.add('collapsed');
        d[i].classList.add('show');
      } else {
        h[i].classList.remove('collapsed');
        d[i].classList.remove('show');
      }
      i++;
    }
  }

  navToMasterDataPasge() {
    this.nav.navigate(AdminMasterData, null)
  }

  LogoutUser() {
    this.nav.logout();
    Toast("Log out successfully");
    this.nav.navigate("/", null);
  }
}

interface PopOverDetail {
  imgName: string;
  name: string;
  time: string;
  message: string;
}
