import { Component, OnInit } from '@angular/core';
import {
  Router,
  Event,
  NavigationStart,
} from "@angular/router";
import { JwtService, ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { AutoPlayService } from 'src/providers/AutoPlayService';
import { CommonService } from 'src/providers/common-service/common.service';
import { Login } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { PageCache } from 'src/providers/PageCache';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  title = "star-admin-angular";
  enableAuth: boolean = false;
  pageName: string = "";
  activePage:number = 0;

  displayActivePage(activePageNumber:number){
    this.activePage = activePageNumber
  }

  constructor(
    private tokenHelper: JwtService,
    private router: Router,
    private commonService: CommonService,
    private auto: AutoPlayService,
    private http: AjaxService,
    private nav: iNavigation,
    private cache: PageCache
  ) {
    this.GetScreenHeight();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.pageName = event.url.replace("/", "")
        this.commonService.ShowLoader();
        this.commonService.SetCurrentPageName(this.pageName);
        this.nav.manageLocalSessionKey(this.pageName);
        switch (event.url) {
          case "/login":
            this.enableAuth = true;
            break;
          default:
            this.enableAuth = false;
            break;
        }
      }
    });
  }

  doAuthentication() {
    this.enableAuth = true;
    this.nav.navigate(Login, null);
  }

  ngOnInit() {
    this.enableAuth = false;
  }

  GenerateNewtoken() {
    this.http.get("login/GenerateNewToken/0").then((res: ResponseModel) => {
      if (res.ResponseBody !== null) {
        this.tokenHelper.setJwtToken(res.ResponseBody["Token"], res.ResponseBody["TokenExpiryDuration"]);
        document.getElementById("sessionexpiredBox").classList.add('d-none');
      } else {
        this.tokenHelper.removeJwtToken();
        this.commonService.ShowToast("Your session got expired. Please login again.");
        document.getElementById("sessionexpiredBox").classList.add('d-none');
        this.nav.navigate(Login, null);
      }
    });
  }

  RemovePopup() {
    document.getElementById("sessionexpiredBox").classList.add('d-none');
  }

  GetScreenHeight() {
    var width = 0,
      height = 0;
    if (typeof window.innerWidth == "number") {
      //Non-IE
      width = window.innerWidth;
      height = window.innerHeight;
    } else if (
      document.documentElement &&
      (document.documentElement.clientWidth ||
        document.documentElement.clientHeight)
    ) {
      //IE 6+ in 'standards compliant mode'
      width = document.documentElement.clientWidth;
      height = document.documentElement.clientHeight;
    } else if (
      document.body &&
      (document.body.clientWidth || document.body.clientHeight)
    ) {
      //IE 4 compatible
      width = document.body.clientWidth;
      height = document.body.clientHeight;
    }
    this.commonService.SetWindowdDetail(height, width);
  }
}
