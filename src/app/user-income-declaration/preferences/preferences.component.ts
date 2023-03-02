import { Component, OnInit } from '@angular/core';
import { EmployeeDetail } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  PanInformation: PANInformation = new PANInformation();
  salaryDeposit: SalaryDeposit = new SalaryDeposit();
  satutoryInformation: StatutoryInformation = new StatutoryInformation();
  cachedData: any = null;
  userDetail: UserDetail = new UserDetail();
  EmployeeId: number = 0;
  employeeDetail: EmployeeDetail = new EmployeeDetail();
  anInformation: PANInformation = new PANInformation();
  applicationData: any = [];
  isPreferenceReady: boolean = false;
  SectionIsReady: boolean = false;
  isEmployeeSelect: boolean = false;

  constructor(private local: ApplicationStorage,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
      else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.userDetail = Master["UserDetail"];
        this.EmployeeId = this.userDetail.UserId;
        this.LoadData();
      } else {
        Toast("Invalid user. Please login again.")
      }
    this.PanInformation = {
      NameOnCard: "MD Istayaque",
      PANNo: "ABPANF655A",
      DOB: new Date(),
      FatherName: "MD MUSTAQUE"
    };

    this.salaryDeposit = {
      PaymentMode: 'Bank Transfer',
      Bank: 'HDFC Bank',
      ACNumber: 123456789123,
      IFSCCode: "HDFC0000123",
      NameOnAccount: 'MD ISTAYAQUE'
    };

    this.satutoryInformation = {
      PFStatus: 'Enabled',
      PFNumber: 11,
      UniversalACNumber: 123456789123,
      PFJoinDate: new Date(),
      NameOfAcccount: 'MD ISTAYAQUE',
      ESIStatus: 'Not Eligible',
      State: 'Telangana',
      RegisteredLocation: 'Telangana',
      LWFStatus: "Disabled"
    }
  }

  LoadData() {
    this.isEmployeeSelect = true;
    this.SectionIsReady= false;
    if (this.EmployeeId > 0) {
      this.http.get(`employee/GetAllManageEmployeeDetail/${this.EmployeeId}`).then((response: ResponseModel) => {
        if(response.ResponseBody) {
          if (response.ResponseBody.Employee.length > 0) {
            this.employeeDetail = response.ResponseBody.Employee[0] as EmployeeDetail;
            Toast("Record found.")
          } else {
            ErrorToast("Record not found");
          }
          this.isEmployeeSelect = false;
          this.SectionIsReady= true;
        }
      }).catch(e => {
        ErrorToast("No record found");
      });
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
      break;
      case "salary-tab":
        this.nav.navigateRoot(Salary, this.cachedData);
      break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
      break;
      case "preference-tab":
        break;
    }
  }
}

class PANInformation {
  NameOnCard: string = '';
  PANNo: string = '';
  DOB: Date = null;
  FatherName : string = ''
}

class SalaryDeposit {
  PaymentMode: string = '';
  Bank: string = '';
  ACNumber: number = null;
  IFSCCode: string = '';
  NameOnAccount: string = ''
}

class StatutoryInformation {
  PFStatus: string = '';
  PFNumber: number = 0;
  UniversalACNumber: number = 0;
  PFJoinDate: Date = null;
  NameOfAcccount: string = '';
  ESIStatus: string = '';
  State: string = '';
  RegisteredLocation: string = '';
  LWFStatus: string = ''
}
