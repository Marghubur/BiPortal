import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Declaration, Form12B, FreeTaxFilling, Preferences, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import 'bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserService } from 'src/providers/userService';
import { ErrorToast, UserDetail } from 'src/providers/common-service/common.service';
import { AjaxService } from 'src/providers/ajax.service';
declare var $: any;

@Component({
  selector: 'app-previousincome',
  templateUrl: './previousincome.component.html',
  styleUrls: ['./previousincome.component.scss']
})
export class PreviousincomeComponent implements OnInit, AfterViewChecked {
  cachedData: any = null;
  previousEmploymentDetail: Array<PreviousEmploymentDetail> = [];
  currentYear: number = 0;
  total: number = 0;
  isRecordFound: boolean = false;
  userDetail: any = null;
  previousIncomForm: FormGroup;
  itemCount: number = 0;
  startingMonth: number = 4;
  isPageReady: boolean = false;

  constructor(private nav: iNavigation,
              private user: UserService,
              private http: AjaxService,
              private fb: FormBuilder) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    this.isRecordFound = false;
    this.userDetail = this.user.getInstance() as UserDetail;
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid employee. Please login again");
      return;
    }
    this.http.get(`Declaration/GetPreviousEmployemnt/${this.userDetail.UserId}`).then(res => {
      if (res.ResponseBody) {
          this.previousEmploymentDetail = res.ResponseBody;
          this.initForm();
          this.isRecordFound = true;
      } else {
        this.getPreviousIncome();
      }
      console.log(res.ResponseBody);
      this.isPageReady = true;
      }).catch(e => {
      this.isPageReady = true;
    })
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
    let dataArray: FormArray = this.fb.array([]);
    if (this.previousEmploymentDetail.length && this.previousEmploymentDetail.length > 0) {
      let i = 0;
      while(i < this.previousEmploymentDetail.length) {
        dataArray.push(this.fb.group({
          EmployeeId: new FormControl(this.previousEmploymentDetail[i].EmployeeId),
          PreviousEmpDetailId: new FormControl(this.previousEmploymentDetail[i].PreviousEmpDetailId),
          Month: new FormControl(this.previousEmploymentDetail[i].Month),
          Year: new FormControl(this.previousEmploymentDetail[i].Year),
          Gross: new FormControl(this.previousEmploymentDetail[i].Gross),
          Basic: new FormControl(this.previousEmploymentDetail[i].Basic),
          HouseRent: new FormControl(this.previousEmploymentDetail[i].HouseRent),
          EmployeePR: new FormControl(this.previousEmploymentDetail[i].EmployeePR),
          ESI: new FormControl(this.previousEmploymentDetail[i].ESI),
          LWF: new FormControl(this.previousEmploymentDetail[i].LWF),
          LWFEmp: new FormControl(this.previousEmploymentDetail[i].LWFEmp),
          Professional: new FormControl(this.previousEmploymentDetail[i].Professional),
          IncomeTax: new FormControl(this.previousEmploymentDetail[i].IncomeTax),
          OtherTax: new FormControl(this.previousEmploymentDetail[i].OtherTax),
          OtherTaxable: new FormControl(this.previousEmploymentDetail[i].OtherTaxable)
        }));
        i++;
      }
    } else {
      let monthNumber = this.startingMonth;
      let i = 0;
      while(i <= this.itemCount) {
        dataArray.push(this.fb.group({
          EmployeeId: new FormControl(this.userDetail.UserId),
          PreviousEmpDetailId: new FormControl(0),
          Month: new FormControl(this.getMonthName(monthNumber)),
          Year: new FormControl(this.currentYear),
          Gross: new FormControl(0),
          Basic: new FormControl(0),
          HouseRent: new FormControl(0),
          EmployeePR: new FormControl(0),
          ESI: new FormControl(0),
          LWF: new FormControl(0),
          LWFEmp: new FormControl(0),
          Professional: new FormControl(0),
          IncomeTax: new FormControl(0),
          OtherTax: new FormControl(0),
          OtherTaxable: new FormControl(0)
        }));
        if (monthNumber > 11) {
          monthNumber = 0;
          this.currentYear = this.currentYear+1;
        }
        i++;
        monthNumber++;
      }
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
        this.nav.navigateRoot(Salary, this.cachedData);
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
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "previous-income-tab":
        break;
      case "form-12-tab":
        this.nav.navigateRoot(Form12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(FreeTaxFilling, this.cachedData);
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(TaxSavingInvestment, this.cachedData);
        break;
    }
  }

}

class PreviousEmploymentDetail {
  Month: string = '';
  Gross: number = 0;
  Basic: number = 0;
  HouseRent: number = 0;
  EmployeePR: number = 0;
  ESI: number = 0;
  LWF: number = 0;
  LWFEmp: number = 0;
  Professional: number = 0;
  IncomeTax: number = 0;
  OtherTax: number = 0;
  OtherTaxable: number = 0;
  EmployeeId: number = 0;
  PreviousEmpDetailId: number = 0;
  Year: number = 0;
}
