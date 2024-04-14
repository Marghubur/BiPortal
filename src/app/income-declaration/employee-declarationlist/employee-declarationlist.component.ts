import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;
import 'bootstrap';
import { autoCompleteModal, pairData } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';

@Component({
  selector: 'app-employee-declarationlist',
  templateUrl: './employee-declarationlist.component.html',
  styleUrls: ['./employee-declarationlist.component.scss']
})
export class EmployeeDeclarationlistComponent implements OnInit, AfterViewChecked {
  isEmpPageReady: boolean = false;
  anyFilter: string = "";
  employeeData: Filter = new Filter();
  employeeDetail: Array<any> = [];
  orderByNameAsc: boolean = null;
  orderByMobileAsc: boolean = null;
  orderByEmailAsc: boolean = null;
  employeeSalaries: Array<any> = null;
  payrollCalendar: Array<any> = [];
  selectedPayrollCalendar: any = null;
  companySetting: any = null;
  isLoading: boolean = false;
  downlodexcelFilePath: any = null;
  basePath: string = '';
  scrollDiv: any = null;
  excelTable: any = null;
  salaryComponents: Array<any> = [];
  isEmployeeSelected: boolean = false;
  autoCompleteModal: autoCompleteModal = null;
  employeeId: number = null;

  constructor(private http: CoreHttpService,
    private filterHttp: EmployeeFilterHttpService,
    private nav: iNavigation,
    private local: ApplicationStorage) { }

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
    this.salaryComponents = [
      { "ComponentId": "BS", "ComponentName": "BASIC SALARY" },
      { "ComponentId": "CA", "ComponentName": "CONVEYANCE ALLOWANCE" },
      { "ComponentId": "EPER-PF", "ComponentName": "EMPLOYER CONTRIBUTION TOWARDS PF" },
      { "ComponentId": "HRA", "ComponentName": "HOUSE RENT ALLOWANCE" },
      { "ComponentId": "MA", "ComponentName": "MEDICAL ALLOWANCE" },
      { "ComponentId": "SHA", "ComponentName": "SHIFT ALLOWANCE" },
      { "ComponentId": "LTA", "ComponentName": "TRAVEL REIMBURSSEMENT" },
      { "ComponentId": "CRA", "ComponentName": "CAR RUNNING ALLOWANCE" },
      { "ComponentId": "TIA", "ComponentName": "TELEPHONE AND INTERNET ALLOWANCE" },
      { "ComponentId": "SPA", "ComponentName": "SPECIAL ALLOWANCE" }
    ];
    this.autoCompleteModal = new autoCompleteModal();
    this.autoCompleteModal.data.push({
      text: 'All',
      value: 0
    });
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(GetEmployees()),
      placeholder: "Select Employee",
      className: "normal"
    };
    this.LoadData();
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });

    if (this.scrollDiv == null) {
      this.scrollDiv = document.getElementById("scroll-dv");
    }
    if (this.scrollDiv != null) {
      this.initHandler();
    }
  }

  initHandler() {
    this.scrollDiv.addEventListener('scroll', function (e) {
      var elem = document.getElementById("excel-table");
      var innerElem = document.getElementById("inner-scroller");
      var left = ((elem.clientWidth) / (innerElem.clientWidth)) * e.currentTarget.scrollLeft;
      if (e.currentTarget.scrollLeft > 0)
        elem.scrollLeft = left;
      else
        elem.scrollLeft = left;
      //console.log('Excel: ' + left + ', Inner: ' + e.currentTarget.scrollLeft);
    });
  }

  LoadData() {
    this.isEmpPageReady = false;
    this.http.post("SalaryComponent/GetAllSalaryDetail", this.employeeData).
      then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.employeeDetail = response.ResponseBody.SalaryDetail;
          this.companySetting = response.ResponseBody.CompanySetting[0];
          if (this.employeeDetail.length > 0) {
            this.employeeData.TotalRecords = this.employeeDetail[0].Total;
            this.isEmpPageReady = true;
          } else {
            this.employeeData.TotalRecords = 0;
          }
          this.bindData();
          this.isEmpPageReady = true;
          let elem = document.getElementById('namefilter');
          if (elem) elem.focus();
        }
      });
  }

  resetFilter() {
    this.employeeId = null;
    this.autoCompleteModal = {
      data: [],
      placeholder: "All result"
    };
    this.autoCompleteModal.data.push({
      text: 'All',
      value: 0
    });
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(GetEmployees()),
      placeholder: "Select Employee",
      className: "normal"
    };
    this.employeeSalaries = [];
  }

  bindData() {
    let currentMonth = new Date().getMonth() + 1;
    this.employeeSalaries = [];
    this.employeeDetail.forEach(x => {
      let data = JSON.parse(x.CompleteSalaryDetail)
      let prsentMonth = data.find(x => x.MonthNumber == currentMonth);
      let prevMonthNumber = currentMonth - 1;
      if (prevMonthNumber == 0)
        prevMonthNumber = 12;

      let prevMonth = null;
      if (prevMonthNumber != 3)
        prevMonth = data.find(x => x.MonthNumber == prevMonthNumber);
      let value = prsentMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC");
      this.employeeSalaries.push({
        FullName: x.FirstName + " " + x.LastName,
        EmployeeId: x.EmployeeId,
        Salary: this.buildSalaryDetail(value),
        Gross: prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount,
        ArrearGross: (prevMonth && prevMonth.IsArrearMonth) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
        PreMonthGross: (prevMonth && prevMonth.IsActive) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
        IsActive: prsentMonth.IsActive
      });
    });
    if (this.companySetting) {
      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      this.payrollCalendar = [];
      for (let i = 0; i < 12; i++) {
        let status = 0;  // 1 = previous, 2 = current, 3 = upcoming
        if (this.companySetting.DeclarationStartMonth > 12) {
          this.companySetting.DeclarationStartMonth = 1;
          this.companySetting.FinancialYear = this.companySetting.FinancialYear + 1;
        }
        if ((this.companySetting.DeclarationStartMonth - 1) == currentMonth)
          status = 2;
        else if ((this.companySetting.DeclarationStartMonth - 1) < currentMonth && this.companySetting.FinancialYear == currentYear)
          status = 1;
        else
          status = 3;

        this.payrollCalendar.push({
          MonthName: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth - 1, 1).toLocaleString('default', { month: 'short' }),
          Month: this.companySetting.DeclarationStartMonth - 1,
          Year: this.companySetting.FinancialYear,
          StartDate: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth - 1, 1).getDate(),
          EndDate: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth, 0).getDate(),
          Status: status
        });
        this.companySetting.DeclarationStartMonth = this.companySetting.DeclarationStartMonth + 1;
      }
      this.selectedPayrollCalendar = this.payrollCalendar.find(x => x.Month == currentMonth);
    }
  }

  buildSalaryDetail(Salary: Array<any>) {
    let salaryBreakup = [];
    if (Salary.length > 0) {
      this.salaryComponents.forEach(x => {
        let value = Salary.find(i => i.ComponentId == x.ComponentId);
        if (value) {
          salaryBreakup.push({
            ComponentId: value.ComponentId,
            FinalAmount: value.FinalAmount,
            IsIncludeInPayslip: value.IsIncludeInPayslip
          });
        } else {
          salaryBreakup.push({
            ComponentId: x.ComponentId,
            FinalAmount: 0,
            IsIncludeInPayslip: true
          });
        }
      });
      let otherAmount = 0;
      let others = Salary.filter(x => {
        return !this.salaryComponents.some(i => {
          return x.ComponentId === i.ComponentId;
        })
      });
      if (others && others.length > 0) {
        otherAmount = others.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
      }
      salaryBreakup.push({
        ComponentId: "Others",
        FinalAmount: otherAmount,
        IsIncludeInPayslip: false
      });
    }
    return salaryBreakup;
  }

  globalFilter() {
    let searchQuery = "";
    // this.employeeData.reset();
    searchQuery = `emp.FirstName like '%${this.anyFilter}%' OR emp.Email like '%${this.anyFilter}%' OR emp.Mobile like '%${this.anyFilter}%'`;
    // this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    // this.LoadData();
  }

  GetFilterResult(e: Filter) {
    if (e != null) {
      this.employeeData = e;
      this.LoadData();
    }
  }

  viewDeclaration(user: any) {
    this.nav.navigate(AdminDeclaration, user);
  }

  selectPayrollMonth(item: any) {
    if (item) {
      this.selectedPayrollCalendar = item;
      this.employeeSalaries = [];
      this.employeeDetail.forEach(x => {
        let data = JSON.parse(x.CompleteSalaryDetail)
        let prsentMonth = data.find(x => x.MonthNumber == item.Month + 1);
        let prevMonthNumber = item.Month;
        if (item.Month == 0)
          prevMonthNumber = 12;

        let prevMonth = null;
        if (prevMonthNumber != 3)
          prevMonth = data.find(x => x.MonthNumber == prevMonthNumber);

        let value = prsentMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC");
        this.employeeSalaries.push({
          FullName: x.FirstName + " " + x.LastName,
          EmployeeId: x.EmployeeId,
          Salary: this.buildSalaryDetail(value),
          Gross: prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount,
          ArrearGross: (prevMonth && prevMonth.IsArrearMonth) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
          PreMonthGross: (prevMonth && prevMonth.IsActive) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
          IsActive: prsentMonth.IsActive
        });
      });
    }
  }

  downloadDeclaration() {
    this.isLoading = true;
    let empId = this.employeeSalaries.map(x => x.EmployeeId);
    this.http.post('Declaration/ExportEmployeeDeclaration', empId).then(res => {
      if (res.ResponseBody) {
        let fileLocation = `${this.basePath}${res.ResponseBody}`;
        this.downlodexcelFilePath = fileLocation;
        $('#downloadAllDeclarationExcel').click();
        let link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('type', 'hidden');
        link.href = fileLocation;
        link.download = `${this.downlodexcelFilePath}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        Toast("Declaration exported successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.HttpStatusMessage);
      this.isLoading = false;
    })
  }

  onEmloyeeChanged(_: any) {
    this.employeeData.SearchString = "";
    if (this.employeeId != null && this.employeeId > 0)
      this.employeeData.SearchString = `1=1 and EmployeeId = ${this.employeeId}`;
    else
      this.employeeData.SearchString = "1=1";

    this.isEmployeeSelected = true;
    this.LoadData();
  }

  async serverFilter(query: string) {
    if (query == null) {
      query = "";
    }

    let filter: Filter = new Filter();
    filter.SearchString = query;
    filter.PageIndex = 1;
    filter.PageSize = 100;
    filter.CompanyId = 1;

    let result: Array<pairData> = await this.filterHttp.filter(filter);
    this.autoCompleteModal = {
      data: result,
      placeholder: "Select Employee",
      className: "normal"
    };
  }
}
