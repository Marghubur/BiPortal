import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToFixed } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminIncomeTax, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary, AdminTaxcalculation } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  active = 1;
  cachedData: any = null;
  myAnnualSalary: MyAnnualSalary = new MyAnnualSalary();
  isSalaryDetail: boolean = true;
  isLoading: boolean = false;
  currentYear: number = 0;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  isSalaryReady: boolean = false;
  EmployeeId: number = 0;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  salaryDetail: any = null;
  isReady: boolean = false;
  SectionIsReady: boolean = false;
  isEmployeeSelect: boolean = false;
  taxRegimeDetails: any = [];
  taxSlab: Array<any> = [];
  currentEmployee: any = null;

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private fb:FormBuilder) { }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.loadData();
  }

  newIncomeTaxRegimePopUp() {
    this.http.get("TaxRegime/GetAllRegime").then(res => {
      if (res.ResponseBody) {
        this.taxRegimeDetails = res.ResponseBody;
        this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
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
    this.isSalaryReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = GetEmployees();
        this.employeesList.placeholder = "Employee";
        this.employeesList.className = "";
        this.isSalaryReady = true;
      }
    });
  }

  getSalaryBreakup(e) {
    this.isEmployeeSelect = true;
    this.SectionIsReady= false;
    this.isReady = false;
    this.myAnnualSalary = new MyAnnualSalary();
    this.EmployeeId = e;
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
      this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
      if (singleDetail) {
        this.salaryComponents = singleDetail.SalaryBreakupDetails;
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
          Effective: this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId).UpdatedOn,
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
    this.isEmployeeSelect = false;
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
        let emp = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
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
        break;
      case "PaySlips":
        this.nav.navigateRoot(AdminPaySlip, this.cachedData);
        break;
      case "IncomeTax":
        this.nav.navigateRoot(AdminIncomeTax, this.cachedData);
        break;
    }
  }

  salaryStructureHistory() {
    $('#slaryStructureHistory').modal('show');
  }

  gotoTaxCalculation() {
    $('#newIncomeTaxRegime').modal('hide');
    this.nav.navigateRoot(AdminTaxcalculation, null);
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

