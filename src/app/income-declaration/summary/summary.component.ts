import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminPaySlip, AdminPreferences, AdminSalary } from 'src/providers/constants';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { BillDetails } from 'src/app/commonmodal/common-modals';
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
  currentMonth: number = 0;
  currentYear: number = 0;
  salarySummary: any = {};
  monthName: string = '';
  isSummaryReady: boolean = false;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  isRecordFound: boolean = false;

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
    let date = new Date();
    this.currentMonth = date.getMonth();
    this.currentYear = date.getFullYear();
    this.monthName = this.convertNumberToMonth(this.currentYear, this.currentMonth);
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    if(expiredOn === null || expiredOn === "")
    this.userDetail["TokenExpiryDuration"] = new Date();
    else
    this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.employeeId = this.userDetail.UserId;
      this.loadData();
      } else {
        Toast("Invalid user. Please login again.")
      }
  }

  LoadFiles() {
    this.isRecordFound = false;
    this.http.post(`OnlineDocument/GetFilesAndFolderById/employee/${this.employeeId}`, this.singleEmployee)
    .then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Record found.");
        this.userFiles = response.ResponseBody["Files"];
        if(this.userFiles !== null && this.userFiles.length > 0) {
          this.salarySummary = this.userFiles.filter(x => x.Month == this.currentMonth -1 && x.Status != 'Rejected')[0];
          this.isRecordFound = true;
        }
      } else {
        ErrorToast("No file or folder found");
      }
    });
  }

  loadData() {
    this.isSummaryReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";
      }

      if(this.employeeId != null){
        if (isNaN(Number(this.employeeId))) {
          WarningToast("Unable to fetch previous EmployeeId. Please selecte from given dropdown.");
        } else {
          this.LoadFiles();
        }
      }
    });
  }

  nextSummary() {
    if (this.currentMonth != new Date().getMonth()) {
      this.currentMonth = Number((((this.currentMonth + 1) < 9 ? "" : "0") + this.currentMonth));
      if (this.currentMonth == 12) {
        this.currentMonth = 1;
        this.currentYear ++
      } else {
        this.currentMonth ++;
      }
      this.monthName =  new Date(this.currentYear, this.currentMonth-1, 1).toLocaleString("en-us", { month: "short" }), // result: Aug
      this.LoadFiles();
    } else {
      ErrorToast("You can get only previous month Salary Summary")
    }
  }

  previousSummary() {
    if (this.currentMonth != new Date(new Date().setMonth(new Date().getMonth() - 2)).getMonth()) {
      this.currentMonth = Number((((this.currentMonth + 1) > 9 ? "" : "0") + this.currentMonth));
      if (this.currentMonth == 1) {
        this.currentMonth = 12;
        this.currentYear --
      } else {
        this.currentMonth --;
      }
      this.monthName = new Date(this.currentYear, this.currentMonth-1, 1).toLocaleString("en-us", { month: "short" }); // result: Aug
      this.LoadFiles();
    } else {
      ErrorToast("You can't get Salary Summary more than 3 month back.")
    }
  }

  convertNumberToMonth(year: number, mnth: number) {
    let value = new Date(year, mnth-1, 1).toLocaleString("en-us", { month: "short" });
    return value;
  }

  viewPaySlip() {
    this.nav.navigate(AdminPaySlip, null);
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "summary-tab":
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, this.cachedData);
        break;
    }
  }

}
