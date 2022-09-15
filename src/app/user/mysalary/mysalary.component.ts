import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToFixed, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, AdminSalary, Declaration, IncomeTax, PaySlip, Preferences, Salary, Summary, Taxcalculation } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-mysalary',
  templateUrl: './mysalary.component.html',
  styleUrls: ['./mysalary.component.scss']
})
export class MysalaryComponent implements OnInit {
  active = 1;
  cachedData: any = null;
  myAnnualSalary: MyAnnualSalary = new MyAnnualSalary();
  salaryDetail: any = null;
  isLoading: boolean = false;
  salaryBreakup: any = {};
  salaryDeducation: Array<SalaryDeduction> = [];
  incomeTaxSlab: Array<IncomeTaxSlab> =[];
  currentYear: number = 0;
  EmployeeId: number = 0;
  userDetail: UserDetail = new UserDetail();
  salaryDetails: any = null;
  isSalaryDetail: boolean = true;
  applicationData: any = [];
  isSalaryReady: boolean = false;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  isReady: boolean = false;
  SectionIsReady: boolean = false;

  constructor(private nav: iNavigation,
              private user: UserService,
              private http: AjaxService,
              private local: ApplicationStorage,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();

    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
     this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.EmployeeId = this.userDetail.UserId;
      this.loadData();
    } else {
      ErrorToast("Invalid user. Please login again.")
    }
    this.myAnnualSalary = {
      Annual: 2124000,
      Bonus: 0,
      Other: 21600,
      Total: 2145600,
      Effective: new Date(),
      PFperMonth: 1800,
      Perks: 0,
      SalaryMonth: 177000
    }

    this.incomeTaxSlab.push({
      taxSlab: 'Income Upto 2,50,000',
      rate: 'NIL'
    },
    {
      taxSlab: 'Income between 2,50,001 to 5,00,000',
      rate: '5% (Tax rebate of Rs 12,500 available under secction 87A'
    },
    {
      taxSlab: 'Income between 5,00,001 to 7,50,000',
      rate: '10%'
    },
    {
      taxSlab: 'Income between 7,50,001 to 10,00,000',
      rate: '15%'
    },
    {
      taxSlab: 'Income between 10,00,001 to 12,50,000',
      rate: '20%'
    },
    {
      taxSlab: 'Income between 12,50,001 to 15,00,000',
      rate: '25%'
    },
    {
      taxSlab: 'Income above 15,00,000',
      rate: '30%'
    });
  }

  loadData() {
    this.SectionIsReady= false;
    this.isReady = false;
    this.myAnnualSalary = new MyAnnualSalary();
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`).then(res => {
      let completeSalaryDetail = [];
      if(res.ResponseBody) {
        this.salaryDetail = res.ResponseBody;
        if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}') {
          completeSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
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
      this.buildAndBindData(completeSalaryDetail);
    });
  }

  buildAndBindData(completeSalaryDetail: any) {
    if (completeSalaryDetail && completeSalaryDetail.length > 0) {
      let presentMonth = new Date().getMonth() + 1;
      let singleDetail = completeSalaryDetail.find(x => x.MonthNumber == presentMonth);

      if (singleDetail) {
        this.salaryComponents = singleDetail.SalaryBreakupDetails;
        this.myAnnualSalary = {
          Annual: ToFixed((this.salaryComponents.find(x => x.ComponentId == "Gross").FinalAmount * 12), 2),
          Bonus: 0,
          Other: ToFixed((this.salaryComponents.find(x => x.ComponentId == "EPER-PF").FinalAmount * 12), 2),
          Total: ToFixed((this.salaryComponents.find(x => x.ComponentId == "Gross").FinalAmount * 12) + (this.salaryComponents.find(x => x.ComponentId == "EPER-PF").FinalAmount * 12), 2),
          Effective:new Date(), //this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId).UpdatedOn,
          PFperMonth: ToFixed((this.salaryComponents.find(x => x.ComponentId == "EPER-PF").FinalAmount * 12), 2)/12,
          Perks: 0,
          SalaryMonth: ToFixed((this.salaryComponents.find(x => x.ComponentId == "Gross").FinalAmount), 2)
        }
        this.isReady = true;
      } else {
        ErrorToast("Fail to get salary detail. Please contact to admin.");
        return;
      }
    } else {
      this.salaryComponents = [];
    }
    this.initForm();
    this.SectionIsReady= true;
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

  continueCurrentTaxRegime() {
    $('#newIncomeTaxRegime').modal('hide');
    this.nav.navigate(AdminSalary, null);
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
        break;
      case "PaySlips":
        this.nav.navigateRoot(PaySlip, this.cachedData);
        break;
      case "IncomeTax":
        this.nav.navigateRoot(IncomeTax, this.cachedData);
        break;
    }
  }

  salaryStructureHistory() {
    $('#slaryStructureHistory').modal('show');
  }

  gotoTaxCalculation() {
    $('#newIncomeTaxRegime').modal('hide');
    this.nav.navigateRoot(Taxcalculation, null);
  }

  viewSalary() {
    this.isSalaryDetail = !this.isSalaryDetail;
  }

  salaryBreakupPopup() {
    $('#fullSalaryDetail').modal('show');
  }

  closeSalaryDetails() {
    $('#fullSalaryDetail').modal('hide');
  }

  newIncomeTaxRegimePopUp() {
    $('#newIncomeTaxRegime').modal('show');
  }

}



class MyAnnualSalary {
  Annual: number = 0;
  Bonus: number = 0;
  Other: number = 0;
  Total: number = 0;
  Effective: Date = null;
  PFperMonth: number = 0;
  Perks: number = 0;
  SalaryMonth: number = 0
}

class SalaryDeduction {
  Deduction: string = '';
  Monthly: number = 0;
  Annually: number = 0;
}

class IncomeTaxSlab {
  taxSlab: string = '';
  rate: string = '';
}
