import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, ToFixed, WarningToast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminIncomeTax, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  currentYear: number = 0;
  EmployeeId: number = 0;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  salaryDetail: any = null;
  isReady: boolean = false;
  isPageReady: boolean = false;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  joiningDate: Date = null;
  paySlipDate: any = null;
  completeSalaryDetail: Array<any> = [];
  SectionIsReady: boolean = false;
  isEmployeeSelect: boolean = false;

  constructor(private nav: iNavigation,
              private fb:FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.loadData();
  }

  getPayslipList(e: any) {
    this.isEmployeeSelect = true;
    this.SectionIsReady= false;
    this.EmployeeId = e;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      this.salaryDetail = null;
      let employee = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
      this.joiningDate = new Date(employee.CreatedOn);
      this.isEmployeeSelect = false;
      this.SectionIsReady= true;
      if (this.joiningDate.getMonth() == new Date().getMonth() && this.joiningDate.getFullYear() == new Date().getFullYear()) {
        WarningToast("Joining month of the employee is current month");
        return;
      }
      if (this.joiningDate.getFullYear() == this.currentYear)
        this.allPaySlip(this.joiningDate.getFullYear());
      else
        this.allPaySlip(this.currentYear);
      this.getSalaryBreakup();
    }
  }

  getSalaryBreakup() {
    if (this.EmployeeId > 0) {
      this.isReady = false;
      this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`).then(res => {
        if(res.ResponseBody) {
          this.salaryDetail = res.ResponseBody;
          if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}') {
            this.completeSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
          } else {
            ErrorToast("Fail to get salary detail. Please contact to admin.");
            return;
          }
        } else {
          this.salaryDetail = {
            EmployeeId: 0,
            CTC: 0,
            GrossIncome: 0,
            NetSalary: 0,
            CompleteSalaryDetail: null,
            GroupId: 0,
            TaxDetail: null
          };
        }
        //this.buildAndBindData(completeSalaryDetail);
      });
    }
  }

  loadData() {
    this.isPageReady = false;
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
        this.isPageReady = true;
      }
    });
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "PaySlips":
        break;
      case "IncomeTax":
        this.nav.navigateRoot(AdminIncomeTax, this.cachedData);
        break;
    }
  }

  allPaySlip(e: any) {
    let yearValue = Number (e);
    var date = new Date();
    let years = date.getFullYear() - 1;
    if (yearValue == new Date().getFullYear()) {
      this.paySlipSchedule = [];
      this.payslip();
    } else if(this.joiningDate.getFullYear() == years) {
      this.paySlipSchedule = [];
      let mnth= 12;
      let i =0;
      if (this.joiningDate.getFullYear() == years)
        i = this.joiningDate.getMonth();
      while (i < 12) {
        if (mnth == 1) {
          mnth = 12;
        } else {
          mnth --;
        }
        this.paySlipSchedule.push({
          paySlipMonth: new Date(years, mnth, 1),  //.toLocaleString("en-us", { month: 'short'}),
          paySlipYear: years
        })
        i++;
      }
    }
  }

  payslip() {
    var date = new Date();
    let mnth= date.getMonth();
    let years = date.getFullYear();
    let i =0;
    if (this.joiningDate.getFullYear() == this.currentYear)
      i = this.joiningDate.getMonth();
    while (i < date.getMonth()) {
      if (mnth == 1) {
        mnth = 0;
        //years --
      } else {
        mnth --;
      }
      this.paySlipSchedule.push({
        paySlipMonth: new Date(years, mnth, 1),    //.toLocaleString("en-us", { month: 'short'}),
        paySlipYear: years
      })
      i++;
    }
  }

  getPaySlip(e: any) {
    let  date = e;
    this.paySlipDate = null;
    if (this.completeSalaryDetail && this.completeSalaryDetail.length > 0) {
      let singleDetail = this.completeSalaryDetail.find(x => x.MonthNumber == date.getMonth()+1);

      if (singleDetail) {
        this.salaryComponents = singleDetail.SalaryBreakupDetails;
        this.paySlipDate = {
          Month: new Date(e.getFullYear(), e.getMonth(), 1).toLocaleString("en-us", { month: 'long'}),
          Year: e.getFullYear()
        };
        this.isReady = true;
      } else {
        ErrorToast("Fail to get salary detail. Please contact to admin.");
        return;
      }
    }
    else
      this.salaryComponents = [];

    this.initForm();
  }

  initForm() {
    this.salaryBreakupForm = this.fb.group({
      Components: this.buildComponents()
    });
  }

  buildComponents(): FormArray {
    let i = 0;
    let elems = [];
    let flag = false;
    let finalItemArray: FormArray = this.fb.array([]);
    while(i < 6) {
      flag = false;
      switch(i) {
        case 0: // fixed
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 2);
          break;
        case 1: // special
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 102);
          flag = true;
          break;
        case 2: // perquisite
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 6);
          break;
        case 3: // gross
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 100);
          flag = true;
          break;
        case 4: // employer
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 7);
          break;
        case 5: // ctc
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 101);
          flag = true;
          break;
      }

      this.fb.array(
        elems.map((elem, index) => {
          finalItemArray.push(this.addGroupItems(elem, flag))
        })
      );

      i++;
    }

    return finalItemArray;
  }

  addGroupItems(item: any, flag: boolean): FormGroup {
    return this.fb.group({
      ComponentId: new FormControl(item.ComponentId),
      ComponentName: new FormControl(item.ComponentName),
      FinalAmount: new FormControl(item.FinalAmount * 12),
      MonthlyAmount: new FormControl(ToFixed(item.FinalAmount, 2)),
      ComponentTypeId: new FormControl(item.ComponentTypeId),
      IsHighlight: new FormControl(flag),
    });
  }

}
