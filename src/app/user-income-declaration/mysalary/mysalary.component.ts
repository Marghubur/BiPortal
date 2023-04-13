import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToFixed, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, AdminSalary, Declaration, IncomeTax, PaySlip, Preferences, Salary, Summary, Taxcalculation, UserAccountsBaseRoute } from 'src/providers/constants';
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
  incomeTaxSlab: Array<IncomeTaxSlab> =[];
  currentYear: number = 0;
  EmployeeId: number = 0;
  userDetail: UserDetail = new UserDetail();
  isSalaryDetail: boolean = true;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  isReady: boolean = false;
  SectionIsReady: boolean = false;
  taxRegimeDetails: any = [];
  taxSlab: Array<any> = [];
  currentEmployee: any = null;

  constructor(private nav: iNavigation,
              private user: UserService,
              private http: AjaxService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.currentEmployee = this.userDetail;
    this.EmployeeId = this.userDetail.UserId;
    this.loadData();
  }

  newIncomeTaxRegimePopUp() {
    this.http.get("TaxRegime/GetAllRegime").then(res => {
      if (res.ResponseBody) {
        this.taxRegimeDetails = res.ResponseBody;
        let empRegime = this.currentEmployee.EmployeeCurrentRegime;
        if (empRegime == 0 || empRegime == null)
          this.active = this.taxRegimeDetails.taxRegimeDesc.find(x => x.IsDefaultRegime == 1).TaxRegimeDescId;
        else
          this.active = empRegime;
        this.filterTaxSlab();
        $('#newIncomeTaxRegime').modal('show');
      }
    })
  }

  filterTaxSlab() {
    let dob = this.currentEmployee.DOB;
    let age = new Date().getFullYear() - new Date(dob).getFullYear();
    this.taxSlab = this.taxRegimeDetails.taxRegime.filter(x => x.RegimeDescId == this.active && x.StartAgeGroup < age && x.EndAgeGroup >= age);
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
        this.salaryComponents = this.salaryComponents.filter(x => x.IsIncludeInPayslip == true);
        let annual = 0;
        let other = 0;
        let salary = 0;
        if (this.salaryComponents.find(x => x.ComponentId == "Gross")) {
          salary = ToFixed((this.salaryComponents.find(x => x.ComponentId == "Gross").FinalAmount), 2);
          annual = ToFixed((salary * 12), 2);
        }

        if (this.salaryComponents.find(x => x.ComponentId == "EPER-PF"))
          other = ToFixed((this.salaryComponents.find(x => x.ComponentId == "EPER-PF").FinalAmount * 12), 2);

        this.myAnnualSalary = {
          Annual: annual,
          Bonus: 0,
          Other: other,
          Total: annual + other,
          Effective: this.currentEmployee.UpdatedOn,
          PFperMonth: other/12,
          Perks: 0,
          SalaryMonth: salary
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
    while(i < 5) {
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
        // case 4: // employer
        //   elems = this.salaryComponents.filter(x => x.ComponentTypeId == 7);
        //   break;
        case 4: // ctc
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

  switchTaxRegime() {
    this.isLoading = true;
    let value = {
      EmployeeId: this.EmployeeId,
      EmployeeCurrentRegime: this.active
    }
    this.http.post("Declaration/SwitchEmployeeTaxRegime", value).then(res => {
      if (res.ResponseBody) {
        let emp = this.currentEmployee;
        emp.EmployeeCurrentRegime = this.active;
        Toast("Tax regime switced successfully");
      }
      $('#newIncomeTaxRegime').modal('hide');
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(UserAccountsBaseRoute +"/" + Declaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(UserAccountsBaseRoute +"/" + Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(UserAccountsBaseRoute +"/" + Preferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        break;
      case "PaySlips":
        this.nav.navigateRoot(UserAccountsBaseRoute +"/" + PaySlip, this.cachedData);
        break;
      case "IncomeTax":
        this.nav.navigateRoot(UserAccountsBaseRoute +"/" + IncomeTax, this.cachedData);
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

class IncomeTaxSlab {
  taxSlab: string = '';
  rate: string = '';
}
