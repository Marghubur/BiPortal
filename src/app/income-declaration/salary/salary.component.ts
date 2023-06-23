import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToFixed, UserDetail } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminIncomeTax, AdminPaySlip, AdminPreferences, AdminSummary, AdminTaxcalculation } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
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
  EmployeeId: number = 0;
  salaryBreakupForm: FormGroup = null;
  salaryComponents: Array<any> = [];
  salaryDetail: any = null;
  isReady: boolean = false;
  taxRegimeDetails: any = [];
  taxSlab: Array<any> = [];
  currentEmployee: any = null;
  model: NgbDateStruct;
  submitted: boolean = false;
  minDate: any = null;
  bonusForm: FormGroup;
  employeeName: string = null;
  bonusComponent: Array<any> = [];
  userDetail: UserDetail = new UserDetail();

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private user: UserService,
              private local: ApplicationStorage,
              private fb:FormBuilder) { }

  ngOnInit(): void {
    let empid = this.local.getByKey("EmployeeId");
    if (empid)
      this.EmployeeId = empid;
    else {
      this.userDetail = this.user.getInstance() as UserDetail;
      this.currentEmployee = this.userDetail;
      this.EmployeeId = this.userDetail.UserId;
    }
    this.currentYear = new Date().getFullYear();
    this.getSalaryBreakup();
    this.initBonusForm();

    this.minDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
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

  getSalaryBreakup() {
    this.isReady = false;
    this.myAnnualSalary = new MyAnnualSalary();
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`).then(res => {
      let completeSalaryDetail = [];
      if(res.ResponseBody) {
        this.salaryDetail = res.ResponseBody.completeSalaryBreakup;
        this.currentEmployee = res.ResponseBody.userDetail;
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
          Effective: this.salaryDetail.UpdatedOn,
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
        this.currentEmployee.EmployeeCurrentRegime = this.active;
        Toast("Tax regime switced successfully");
      }
      $('#newIncomeTaxRegime').modal('hide');
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
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
    this.submitted = false;
    $('#fullSalaryDetail').modal('hide');
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.bonusForm.controls["PayOutDate"].setValue(date);
  }

  initBonusForm() {
    this.bonusForm = this.fb.group({
      BonusId: new FormControl(1),
      ComponentId: new FormControl(null, [Validators.required]),
      Amount: new FormControl(null, [Validators.required]),
      PayOutDate: new FormControl(null, [Validators.required]),
      Status: new FormControl(2, [Validators.required]),
      Note: new FormControl('')
    })
  }

  get f() {
    return this.bonusForm.controls;
  }

  addBonus() {
    this.isLoading = true;
    this.submitted = true;
    if (this.bonusForm.invalid) {
      ErrorToast("Please fill all the manditory fields");
      this.isLoading = false;
      return;
    }
    let value = this.bonusForm.value;
    this.http.post("", value).then(res => {
      if (res.ResponseBody) {
        Toast("Bonus added successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getBonusComponent() {
    this.isLoading = true;
    this.http.get('SalaryComponent/GetBonusComponents').then(res => {
      if (res.ResponseBody) {
        this.bonusComponent = res.ResponseBody;
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  addBonusPopUp() {
    let user = this.currentEmployee;
    this.employeeName = user.FirstName + " " + user.LastName;
    this.getBonusComponent();
    $('#addBonus').modal('show');
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

