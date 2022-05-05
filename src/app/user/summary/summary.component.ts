import { Component, OnInit } from '@angular/core';
import { Files } from 'src/app/admin/documents/documents.component';
import { BillDetails } from 'src/app/admin/files/files.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, Preferences, Salary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  cachedData: any = null;
  singleEmployee: Filter = null;
  placeholderName: string = "";
  employeeDetails: Array<any> = null;
  employeeId: number = 0;
  userFiles: Array<any> = [];
  billDetails: Array<BillDetails> = [];
  userDetail: UserDetail = new UserDetail();


  constructor(private nav: iNavigation,
              private http: AjaxService,
              private user: UserService,
              private local: ApplicationStorage,
  ) {
      this.singleEmployee = new Filter();
      this.placeholderName = "Select Employee";
      this.employeeDetails = [{
        value: '0',
        text: 'Select Employee'
      }];
    }

  ngOnInit(): void {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
      else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.userDetail = Master["UserDetail"];
        this.employeeId = this.userDetail.UserId;
        this.LoadFiles();
      } else {
        Toast("Invalid user. Please login again.")
      }
  }

  LoadFiles() {
    this.http.post(`OnlineDocument/GetFilesAndFolderById/employee/${this.employeeId}`, this.singleEmployee)
    .then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Record found.");
        this.userFiles = response.ResponseBody["Files"];
        this.billDetails = new Array<BillDetails>();
        let i =0;
        let bills : BillDetails = null;
        let GST: number = 0;

        if(this.userFiles !== null && this.userFiles.length > 0) {
          this.singleEmployee.TotalRecords = this.userFiles[0].Total;
          while (i < this.userFiles.length) {
            bills = new BillDetails();
            bills.Absent = this.userFiles[i].Absents;
            bills.NoOfDays = this.userFiles[i].NoOfDays;
            i++;
          }
        }
      } else {
        ErrorToast("No file or folder found");
      }
    });
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigate(Declaration, this.cachedData);
        break;
      case "salary-tab":
        this.nav.navigate(Salary, this.cachedData);
        break;
      case "summary-tab":
        break;
      case "preference-tab":
        this.nav.navigate(Preferences, this.cachedData);
        break;
    }
  }

}
