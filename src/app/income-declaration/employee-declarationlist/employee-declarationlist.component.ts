import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, MonthName, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, SalaryAdjustment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;
import 'bootstrap';
import { autoCompleteModal, pairData } from 'src/app/util/iautocomplete/iautocomplete.component';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
import { SalaryDeclarationHttpService } from 'src/providers/AjaxServices/salary-declaration-http.service';

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
              private salaryHttp: SalaryDeclarationHttpService) { }

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
    this.salaryComponents = [];
    this.autoCompleteModal = new autoCompleteModal();
    this.autoCompleteModal.data.push({
      text: 'All',
      value: 0
    });
    let empData = GetEmployees();
    empData.forEach(x => {
      x.text = `[${x.value}]` + " " + x.text;
    })
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(empData),
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
  }

  LoadData() {
    this.isEmpPageReady = false;
    this.salaryHttp.post("SalaryComponent/GetAllSalaryDetail", this.employeeData).
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
    let empData = GetEmployees();
    empData.forEach(x => {
      x.text = `[${x.value}]` + " " + x.text;
    })
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(empData),
      placeholder: "Select Employee",
      className: "normal"
    };
    this.employeeSalaries = [];
    this.isEmployeeSelected = false;
  }

  bindData() {
    let currentMonth = new Date().getMonth() + 1;
    this.employeeSalaries = [];
    this.getSalaryComponents();
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
        CTC: prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "CTC").FinalAmount,
        ArrearAmount: prsentMonth.ArrearAmount,
        PreMonthGross: (prevMonth && prevMonth.IsActive) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
        IsActive: prsentMonth.IsActivem,
        IsPayrollExecutedForThisMonth: prsentMonth.IsPayrollExecutedForThisMonth
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
            IsIncludeInPayslip: x.IsIncludeInPayslip
          });
        }
      });
    }
    return salaryBreakup;
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
      this.getSalaryComponents();
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
          CTC: prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "CTC").FinalAmount,
          ArrearAmount: prsentMonth.ArrearAmount,
          PreMonthGross: (prevMonth && prevMonth.IsActive) ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
          IsActive: prsentMonth.IsActive,
          IsPayrollExecutedForThisMonth: prsentMonth.IsPayrollExecutedForThisMonth
        });
      });
    }
  }

  downloadDeclaration() {
    this.isLoading = true;
    let empId = this.employeeSalaries.map(x => x.EmployeeId);
    this.salaryHttp.download(`Payroll/ExportPayrollRegister/${this.selectedPayrollCalendar.Month+1}`, empId).subscribe(res => {
      if (res) {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_register_${MonthName(this.selectedPayrollCalendar.Month+1)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        Toast("Payroll register exported successfully");
        this.isLoading = false;
      }
    }, error => {
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

  getSalaryComponents() {
    this.salaryComponents = [];
    let data = JSON.parse(this.employeeDetail[0].CompleteSalaryDetail);
    this.salaryComponents = data[0].SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC").map(x => {return {ComponentId:x.ComponentId, ComponentName:x.ComponentName};})
  }

  navToSalaryAdjustment(item: any) {
    if (item && item.IsPayrollExecutedForThisMonth) {
      let data = {
        EmployeeId: item.EmployeeId,
        Month: this.selectedPayrollCalendar.Month + 1,
        MonthName: this.selectedPayrollCalendar.MonthName,
        Year: this.selectedPayrollCalendar.Year,
        EmployeeName: item.FullName
      };
      this.nav.navigate(SalaryAdjustment, data);
    } else {
      WarningToast("Payrol doesn't run of this month");
    }
  }
}
