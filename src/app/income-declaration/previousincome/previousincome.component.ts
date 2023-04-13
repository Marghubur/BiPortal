import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminFreeTaxFilling, AdminPreferences, AdminSalary, AdminSummary, AdminDeclarationApprovalRule, AccountsBaseRoute } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import 'bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
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
  employeeDetail: any = null;
  previousIncomForm: FormGroup;
  itemCount: number = 0;
  startingMonth: number = 4;
  isLoading: boolean = false;
  employeeId: number = 0;
  isPageReady: boolean = false;
  employeementDeatil: Array<any> = [];

  constructor(private nav: iNavigation,
              private local: ApplicationStorage,
              private http: AjaxService,
              private fb: FormBuilder) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    this.isRecordFound = false;
    this.employeeId = this.local.getByKey("EmployeeId");
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    if (this.employeeId <= 0) {
      ErrorToast("Invalid employee selected. Please select a valid employee");
      return;
    }
    this.http.get(`Declaration/GetPreviousEmployemntandEmp/${this.employeeId}`).then(res => {
      if (res.ResponseBody) {
        if (res.ResponseBody.EmployeeDetail)
          this.employeeDetail = res.ResponseBody.EmployeeDetail;
        if(res.ResponseBody.EmployementDetails && res.ResponseBody.EmployementDetails.length > 0) {
          this.employeementDeatil = res.ResponseBody.EmployementDetails;
          this.initForm();
          this.isRecordFound = true;
        }else {
          this.getPreviousIncome();
        }
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  getPreviousIncome() {
    let doj = new Date(this.employeeDetail.CreatedOn);
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
    if (this.employeementDeatil.length && this.employeementDeatil.length > 0) {
      let i = 0;
      while(i < this.employeementDeatil.length) {
        dataArray.push(this.fb.group({
          EmployeeId: new FormControl(this.employeementDeatil[i].EmployeeId),
          PreviousEmpDetailId: new FormControl(this.employeementDeatil[i].PreviousEmpDetailId),
          Month: new FormControl(this.employeementDeatil[i].Month),
          Year: new FormControl(this.employeementDeatil[i].Year),
          Gross: new FormControl(this.employeementDeatil[i].Gross),
          Basic: new FormControl(this.employeementDeatil[i].Basic),
          HouseRent: new FormControl(this.employeementDeatil[i].HouseRent),
          EmployeePR: new FormControl(this.employeementDeatil[i].EmployeePR),
          ESI: new FormControl(this.employeementDeatil[i].ESI),
          LWF: new FormControl(this.employeementDeatil[i].LWF),
          LWFEmp: new FormControl(this.employeementDeatil[i].LWFEmp),
          Professional: new FormControl(this.employeementDeatil[i].Professional),
          IncomeTax: new FormControl(this.employeementDeatil[i].IncomeTax),
          OtherTax: new FormControl(this.employeementDeatil[i].OtherTax),
          OtherTaxable: new FormControl(this.employeementDeatil[i].OtherTaxable)
        }));
        i++;
      }
    } else {
      let monthNumber = this.startingMonth;
      let i = 0;
      while(i <= this.itemCount) {
        dataArray.push(this.fb.group({
          EmployeeId: new FormControl(this.employeeId),
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

  savePreviousIncome() {
    this.isLoading = true;
    let value = this.previousIncomForm.value.PreviousIncomes;
    if (value) {
      this.http.post(`Declaration/PreviousEmployemnt/${this.employeeId}`, value).then(res => {
        if (res.ResponseBody) {
          Toast("Previous employment details added/updated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/"+ AdminSalary, this.cachedData);
        break;
      case "summary-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/"+ AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/"+ AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "declaration-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/"+ AdminDeclaration, this.cachedData);
        break;
      case "previous-income-tab":
        break;
      case "form-12-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/"+ AdminForm12B, this.cachedData);
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
