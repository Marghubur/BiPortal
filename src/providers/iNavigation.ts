import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService, Toast } from "./common-service/common.service";
import { Filter } from "./userService";

const NAVPARAMNAME = "navigation_parameter";
@Injectable()
export class iNavigation {
  private pageRoute: PageRouteDetail = null;
  private IsNavigated: boolean = false;

  constructor(private route: Router, private common: CommonService) {
    this.pageRoute = new PageRouteDetail();
    console.log("Loaded...");
  }

  public pushRoute(route: string, value: string = null, filter: Filter = null) {
    if(this.IsNavigated)
      return;

    if(this.pageRoute.PageName === route) {
      let elem = this.pageRoute.RouteDetail.find(x => x.Key === route);
      if(elem) {
        this.popRoutes(route);
      } else {
        this.pageRoute.RouteDetail.push({
          Key: route,
          Value: value,
          Page1Query: filter
        });
      }
    } else {
      this.pageRoute.PageName = route;
      this.pageRoute.RouteDetail = [];
      this.pageRoute.RouteDetail.push({
        Key: route,
        Value: value,
        Page1Query: filter
      });
    }

    this.IsNavigated = false;
  }

  public pushNavRoute(route: string, value: string = null) {
    let elem = this.pageRoute.RouteDetail.find(x => x.Key === route);
    if(elem) {
      this.popRoutes(route);
    } else {
      this.pageRoute.RouteDetail.push({
        Key: route,
        Value: value
      });
    }
  }

  public popRoutes(route: string) {
    let i = 0;
    let newRouteData = [];
    while(i < this.pageRoute.RouteDetail.length) {
      if(this.pageRoute[i].Key === route) {
        newRouteData.push(this.pageRoute[i]);
        break;
      }
      newRouteData.push(this.pageRoute[i]);
      i++;
    }

    this.pageRoute.RouteDetail = newRouteData;
  }

  public getRoute(route: string) {
    return this.pageRoute.RouteDetail.find(x => x.Key === route);
  }

  public getRouteList() {
    return this.pageRoute.RouteDetail;
  }

  public navigate(Path: string, Parameter: any, filterObject: any = null) {
    if (Path !== null) {
      if (Parameter !== null && Parameter !== "") {
        localStorage.setItem(Path, JSON.stringify(Parameter));
        this.manageLocalSessionKey(Path);
        localStorage.setItem(NAVPARAMNAME, Path);
      }

      this.IsNavigated = true;
      this.pushNavRoute(Path, filterObject);
      this.route.navigate(["/" + Path, ]);
    } else {
      Toast("Invalid component path passed.");
    }
  }

  public navigateWithArgs(Path: string, args: string, Parameter: any = null) {
    if (Path !== null) {
      if (Parameter !== null && Parameter !== "") {
        localStorage.setItem(Path, JSON.stringify(Parameter));
        this.manageLocalSessionKey(Path);
        localStorage.setItem(NAVPARAMNAME, Path);
      }
      this.route.navigate(["/" + Path], { queryParams: { path: args } });
    } else {
      Toast("Invalid component path passed.");
    }
  }

  public manageLocalSessionKey(pageName: string) {
    let key = localStorage.getItem(NAVPARAMNAME);
    let path = pageName.split("?");
    if (path[0] != key) {
      if (key !== "") {
        localStorage.removeItem(key);
      }
    }
  }

  public getValue(): any {
    let ParsedData = null;
    let path = this.common.GetCurrentPageName().split("?");
    let Data: any = localStorage.getItem(path[0]);
    if (Data && Data !== "") {
      try {
        ParsedData = JSON.parse(Data);
      } catch (e) {
        console.log(JSON.stringify(e));
        Toast("Unable to get route data. Please contact admin.");
      }
    }
    return ParsedData;
  }

  public replaceValue(data: any) {
    if (data !== null && data !== "") {
      localStorage.setItem(this.common.GetCurrentPageName(), JSON.stringify(data));
    }
  }

  public resetValue() {
    localStorage.removeItem(this.common.GetCurrentPageName());
  }

  public logout() {
    localStorage.clear();
  }
}

class PageRouteDetail {
  PageName: string = null;
  RouteDetail: Array<any> = [];
}