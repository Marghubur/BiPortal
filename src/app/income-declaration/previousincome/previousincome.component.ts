import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminFreeTaxFilling, AdminPreferences, AdminSalary, AdminSummary, AdminDeclarationApprovalRule } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import 'bootstrap';
import { UserDetail } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-previousincome',
  templateUrl: './previousincome.component.html',
  styleUrls: ['./previousincome.component.scss']
})
export class PreviousincomeComponent implements OnInit {
  cachedData: any = null;
  previousEmploymentDetail: Array<PreviousEmploymentDetail> = [];
  currentYear: number = 0;
  total: number = 0;
  isRecordFound: boolean = false;
  userDetail: any = null;
  previousIncomForm: FormGroup;
  itemCount: number = 0;
  startingMonth: number = 4;

  constructor(private nav: iNavigation,
              private user: UserService,
              private fb: FormBuilder) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    this.isRecordFound = false;
    this.userDetail = this.user.getInstance() as UserDetail;
    this.getPreviousIncome();
  }

  getPreviousIncome() {
    let doj = new Date(this.userDetail.CreatedOn);
    let joiningMonth = doj.getMonth();
    this.currentYear = new Date().getFullYear()-1;
    if (doj.getFullYear() == new Date().getFullYear()) {
      this.itemCount = (12 - this.startingMonth) + joiningMonth;
      this.initForm();
      this.isRecordFound = true;
    } else if(doj.getFullYear() == (new Date().getFullYear()-1) && joiningMonth > this.startingMonth) {
      this.itemCount = joiningMonth - this.startingMonth;
      this.initForm();
      this.isRecordFound = true;
    }
  }

  initForm() {
    this.previousIncomForm = this.fb.group({
      PreviousIncomes: this.buildOldTaxSlab()
    })
  }

  buildOldTaxSlab(): FormArray {
    let data = null;
    let dataArray: FormArray = this.fb.array([]);
    let monthNumber = this.startingMonth;
    let i = 0;
    while(i <= this.itemCount) {
      dataArray.push(this.fb.group({
        Month: new FormControl(this.getMonthName(monthNumber)),
        Year: new FormControl(this.currentYear),
        Gross: new FormControl(0),
        Basic: new FormControl(null),
        HouseRent: new FormControl(null),
        EmployeePR: new FormControl(0),
        ESI: new FormControl(null),
        LWF: new FormControl(null),
        LWFEmp: new FormControl(null),
        Professional: new FormControl(0),
        IncomeTax: new FormControl(0),
        OtherTax: new FormControl(0),
        OtherTaxable: new FormControl(null)
      }));
      if (monthNumber > 11) {
        monthNumber = 0;
        this.currentYear = this.currentYear+1;
      }
      i++;
      monthNumber++;
    }
    this.total = dataArray.length;
    return dataArray;
  }

  getMonthName(number: number) {
    var result = new Date(`2020-${number}-01`).toLocaleString('en-us',{month:'short'});
    return result;
  }

  get previousIncome() {
    return this.previousIncomForm.get('PreviousIncomes') as FormArray;
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
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
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "previous-income-tab":
        break;
      case "form-12-tab":
        this.nav.navigateRoot(AdminForm12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(AdminFreeTaxFilling, this.cachedData);
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(AdminDeclarationApprovalRule, this.cachedData);
        break;
    }
  }

}

class PreviousEmploymentDetail {
  Month: string = '';
  Gross: number = 0;
  Basic: number = null;
  HouseRent: number = null;
  EmployeePR: number = 0;
  ESI: number = null;
  LWF: number = null;
  LWFEmp: number = null;
  Professional: number = 0;
  IncomeTax: number = 0;
  OtherTax: number = 0;
  OtherTaxable: number = null;
}
