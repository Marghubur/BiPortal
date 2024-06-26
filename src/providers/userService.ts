import { Injectable } from "@angular/core";
import { UserDetail } from "./common-service/common.service";
import { Master } from "./constants";

@Injectable()
export class UserService {
    private userModel: UserDetail = null;
    getInstance(): UserDetail {
        let localUserData = localStorage.getItem(Master);
        if (localUserData !== null && localUserData !== "") {
            localUserData = JSON.parse(localUserData);
            this.userModel = localUserData["UserDetail"] as UserDetail;
        } else {
            this.userModel = new UserDetail();
        }
        return this.userModel;
    }
}

export class Filter {
  EmployeeId?: number = 0;
  ClientId?: number = 0;
  SearchString: string = "1=1";
  PageIndex: number = 1;
  StartIndex?: number = 0;
  EndIndex?: number = 0;
  PageSize: number = 10;
  SortBy?: string = "";
  CompanyId: number = 0;
  TotalRecords?: number = 0;
  ShowPageNo?: number = 5;
  ActivePageNumber?: number = 1;
  isReUseSame?: boolean = false;
  isActive?: boolean = true;
  SortDirection?: string = null;
  ForYear?: number = 0;
  ForMonth?: number = 0;

  update(total: any) {
    if(!isNaN(Number(total))) {
      this.TotalRecords = total;
      this.StartIndex = 1;
      this.PageIndex = 1;
    }
  }

  reset() {
    this.TotalRecords = 0;
    this.StartIndex = 1;
    this.PageIndex = 1;
    this.ActivePageNumber = 1;
    this.SortDirection = null;
  }
}
