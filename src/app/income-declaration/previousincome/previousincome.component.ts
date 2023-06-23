import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import 'bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
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
  userDetail: UserDetail = new UserDetail();

  constructor(private nav: iNavigation,
              private user: UserService,
              private local: ApplicationStorage,
              private http: AjaxService,
              private fb: FormBuilder) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    this.userDetail = this.user.getInstance() as UserDetail;
    let data = this.local.getByKey("EmployeeId");
    if (data)
      this.employeeId = data;
    else
      this.employeeId = this.userDetail.UserId;

    if (this.userDetail.RoleId == 1) {
      this.loadPrevioudIncome();
    } else {
      this.loadUserPrevioudIncomeModule();
    }
  }

  loadPrevioudIncome(): void {
    this.isRecordFound = false;
    this.currentYear = new Date().getFullYear();
    //this.employeeId = this.local.getByKey("EmployeeId");
    this.loadData();
  }

  loadUserPrevioudIncomeModule(): void {
    this.isRecordFound = false;
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid employee. Please login again");
      return;
    }
    this.http.get(`Declaration/GetPreviousEmployemnt/${this.userDetail.UserId}`).then(res => {
      this.bindPageData(res);
    })
  }

  bindPageData(res: any) {
    if (res.ResponseBody && res.ResponseBody.length > 0) {
      this.previousEmploymentDetail = res.ResponseBody;
      this.initForm();
      this.isRecordFound = true;
    } else {
      this.getPreviousIncome();
    }
    this.isPageReady = true;
  }

  getPreviousIncome() {
    let doj = new Date(this.userDetail.CreatedOn);
    let joiningMonth = doj.getMonth();
    let date = new Date();
    this.currentYear = date.getFullYear();
    if (doj.getFullYear() == date.getFullYear() && joiningMonth+1 != this.startingMonth ) {
      if (joiningMonth > this.startingMonth) {
        this.itemCount = joiningMonth - this.startingMonth;
        this.initForm();
        this.isRecordFound = true;
      } else {
        if (date.getMonth() < this.startingMonth) {
          this.currentYear--;
          this.itemCount = (12 - this.startingMonth) + joiningMonth;
          this.initForm();
          this.isRecordFound = true;
        }
      }
    } else if(doj.getFullYear() == (date.getFullYear()-1) && joiningMonth > this.startingMonth) {
      this.currentYear--;
      this.itemCount = joiningMonth - this.startingMonth;
      this.initForm();
      this.isRecordFound = true;
    } else {
      this.isRecordFound = false;
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
          OtherTaxable: new FormControl(this.previousEmploymentDetail[i].OtherTaxable),
          MonthNumber: new FormControl(this.previousEmploymentDetail[i].MonthNumber)
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
          MonthNumber: new FormControl(monthNumber),
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
        this.bindPageData(res);
        Toast("Previous employment details added/updated successfully");
        this.isLoading = false;
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
  MonthNumber: number = 0;
}
