import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, ToFixed, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, IncomeTax, PaySlip, Preferences, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  currentYear: number = 0;
  EmployeeId: number = 0;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  salaryDetail: any = null;
  isReady: boolean = false;
  isPageReady: boolean = false;
  applicationData: any = [];
  joiningDate: Date = null;
  paySlipDate: any = null;
  completeSalaryDetail: Array<any> = [];
  SectionIsReady: boolean = false;
  userDetail: UserDetail = new UserDetail();

  constructor(private nav: iNavigation,
              private fb:FormBuilder,
              private user: UserService,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if (expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if (Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.EmployeeId = this.userDetail.UserId;
      this.loadData();
    } else {
      ErrorToast("Invalid user. Please login again.")
    }
  }

  loadData() {
    this.SectionIsReady= false;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      this.salaryDetail = null;
      this.joiningDate = new Date(this.userDetail.CreatedOn);
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



  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(Preferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(Salary, this.cachedData);
        break;
      case "PaySlips":
        break;
      case "IncomeTax":
        this.nav.navigateRoot(IncomeTax, this.cachedData);
        break;
    }
  }
}
