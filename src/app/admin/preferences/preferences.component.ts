import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { EmployeeDetail } from '../manageemployee/manageemployee.component';

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
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  isPreferenceReady: boolean = false;
  IsPageReady: boolean = false;
  employeeDetail: EmployeeDetail = new EmployeeDetail();
  EmployeeId: number = 0;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.PanInformation = {
      NameOnCard: "MD Istayaque",
      PANNumber: "ABPANF655A",
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
    this.getEmployees();
  }

  getPreference(id: any) {
    if (id > 0) {
      this.EmployeeId = id;
      this.LoadData();
    }else {
      ErrorToast("Unable to get data. Please contact to admin.");
    }
  }

  LoadData() {
    this.IsPageReady = false;
    if (this.EmployeeId > 0) {
      this.http.get(`employee/GetAllManageEmployeeDetail/${this.EmployeeId}`).then((response: ResponseModel) => {
        if(response.ResponseBody) {
          if (response.ResponseBody.Employee.length > 0) {
            this.employeeDetail = response.ResponseBody.Employee[0] as EmployeeDetail;
            this.IsPageReady = true;
            Toast("Record found.")
          } else {
            ErrorToast("Record not found");
          }
        }
      }).catch(e => {
        ErrorToast("No record found");
      });
    }
  }

  getEmployees() {
    this.isPreferenceReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        if(employees) {
          let i = 0;
          while(i < employees.length) {
            this.employeesList.data.push({
              text: `${employees[i].FirstName} ${employees[i].LastName}`,
              value: employees[i].EmployeeUid
            });
            i++;
          }
        }
        this.employeesList.className = "";

        this.isPreferenceReady = true;
      }
    });
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
        this.nav.navigateRoot(AdminSummary, this.cachedData);
      break;
      case "preference-tab":
        break;
    }
  }
}

class PANInformation {
  NameOnCard: string = '';
  PANNumber: string = '';
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
