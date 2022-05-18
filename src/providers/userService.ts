import { Injectable } from "@angular/core";
import { ColumnMapping } from "src/app/util/dynamic-table/dynamic-table.component";
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

    getColumns(pageName: string): Array<ColumnMapping> {
        let columns = null;
        if(pageName !== null && pageName !== "") {
            let localUserData = localStorage.getItem(Master);
            if (localUserData !== null && localUserData !== "") {
                localUserData = JSON.parse(localUserData);
                columns = localUserData["ReportColumnMapping"] as ColumnMapping;
                columns = columns.filter(x=>x.PageName === pageName);
            } else {
                columns = [];
            }
        }
        return columns;
    }
}

export class Filter {
    SearchString: string = "1=1";
    PageIndex: number = 1;
    StartIndex: number = 0;
    EndIndex: number = 0;
    PageSize: number = 10;
    SortBy: string = "";
    TotalRecords: number = 0;
    ShowPageNo: number = 5;
    ActivePageNumber: number = 1;
    isReUseSame: boolean = false;
    isActive?: boolean = true;

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
  }
}
