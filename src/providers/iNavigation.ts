import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService, Toast } from "./common-service/common.service";

const NAVPARAMNAME = "navigation_parameter";
@Injectable()
export class iNavigation {
  constructor(private route: Router, private common: CommonService) { }

  public navigate(Path: string, Parameter: any) {
    if (Path !== null) {
      if (Parameter !== null && Parameter !== "") {
        localStorage.setItem(Path, JSON.stringify(Parameter));
        this.manageLocalSessionKey(Path);
        localStorage.setItem(NAVPARAMNAME, Path);
      }
      this.route.navigate(["/" + Path]);
    } else {
      Toast("Invalid component path passed.");
    }
  }

  public manageLocalSessionKey(pageName: string) {
    let key = localStorage.getItem(NAVPARAMNAME);
    if (pageName != key) {
      if (key !== "") {
        localStorage.removeItem(key);
      }
    }
  }

  public getValue(): any {
    let ParsedData = null;
    let Data: any = localStorage.getItem(this.common.GetCurrentPageName());
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
