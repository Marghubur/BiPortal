import { ApplicationStorage } from "../../providers/ApplicationStorage";
import { AjaxService } from "../../providers/ajax.service";
import { CommonService, ErrorToast, Toast, UserDetail } from "../../providers/common-service/common.service";
import { AccessTokenExpiredOn, AdminMasterData, AdminNotification, Blogs, BuildPdf, Documents, Employees, Login, OrganizationSetting } from "../../providers/constants";
import { Component, OnInit, Output, EventEmitter, AfterViewChecked } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";
import { UserService } from "src/providers/userService";
declare var $: any;
import 'bootstrap';
import { ResponseModel } from "src/auth/jwtService";

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})
export class SidemenuComponent implements OnInit, AfterViewChecked {
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
  isLoading: boolean = false;
  isMinimize: boolean = false;
  isMenuExpanded: boolean = true;
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
    private local: ApplicationStorage,
    private user: UserService,
    private http: AjaxService
  ) {
    this.commonService.isLoading.subscribe(res => {
      this.isLoading = res;
    });
    this.commonService.isMinimize.subscribe(res => {
      this.isMinimize = res;
    })
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit() {
    let style: any = this.local.getMenuStyle();
    if (style) {
      this.isMenuExpanded = style.IsMenuExpanded;
      this.commonService.isMinimize.next(!this.isMenuExpanded);
    }
    console.log(JSON.stringify(style));
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
        this.MenuName = menuItem[0].Key;
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

  mimizeScreen() {
    this.isMinimize = !this.isMinimize;
    this.commonService.isMinimize.next(this.isMinimize);
  }

  activeTab(i: number) {
    let elem = document.getElementsByClassName("custom-accordion-btn");
    if (elem) {
      for (let j = 0; j < elem.length; j++) {
        if (elem[j].classList.contains("active-menu"))
          elem[j].classList.remove("active-menu");
      }
      elem[i].classList.add("active-menu");
    }
  }

  saveMenuStyle() {
    this.isMenuExpanded = !this.isMenuExpanded;
    this.http.post("Settings/LayoutConfigurationSetting", {
      IsMenuExpanded: this.isMenuExpanded
    }).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        Toast("User layout configuration save.");
        this.local.updateLayoutConfig(this.isMenuExpanded);
      }
    });
  }

  firstOpenToggle() {
    let accordionItemHeader = document.querySelector(".accordion-item-header");
    accordionItemHeader.classList.toggle("active");
    const accordionItemBody = accordionItemHeader.nextElementSibling;
     if(accordionItemHeader.classList.contains("active")) {
      (accordionItemBody as HTMLElement).style.maxHeight = accordionItemBody.scrollHeight + "px";
     }
     else {
       (accordionItemBody as HTMLElement).style.maxHeight = '0px';
     }
  }

  toogle(e: any) {
    let index = Number(e.currentTarget.getAttribute("data-index"));
    let elem = document.querySelectorAll(".accordion-item-header");
    elem.forEach(x => {
      let i = Number(x.getAttribute("data-index"));
      if (x.classList.contains("active") && i != index) {
        x.classList.toggle("active");
        let nextSibling = x.nextElementSibling;
        (nextSibling as HTMLElement).style.maxHeight = '0px';
      }
    })
    let accordionItemHeader = e.currentTarget;
    accordionItemHeader.classList.toggle("active");
    const accordionItemBody = accordionItemHeader.nextElementSibling;
     if(accordionItemHeader.classList.contains("active")) {
      accordionItemBody.style.maxHeight = accordionItemBody.scrollHeight + "px";
     }
     else {
       accordionItemBody.style.maxHeight = 0;
     }
  }
}

interface PopOverDetail {
  imgName: string;
  name: string;
  time: string;
  message: string;
}
