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
    SearchString: string = "";
    PageIndex: number = 1;
    PageSize: number = 10;
    SortBy: string = "";
    isReUseSame: boolean = false;
}