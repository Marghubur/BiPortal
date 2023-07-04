import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;
import 'bootstrap';

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

  constructor(private http: AjaxService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
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
        if(elem)elem.focus();
      }
    });
  }

  resetFilter() {

  }

  bindData() {
    let currentMonth = new Date().getMonth() +1;
    this.employeeSalaries = [];
    this.employeeDetail.forEach(x => {
      let data = JSON.parse(x.CompleteSalaryDetail)
      let prsentMonth = data.find(x => x.MonthNumber == currentMonth);
      let prevMonth = data.find(x => x.MonthNumber == currentMonth - 1);
      this.employeeSalaries.push({
        FullName: x.FirstName + " " + x.LastName,
        EmployeeId: x.EmployeeId,
        Salary: prsentMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC"),
        Gross:prsentMonth.IsArrearMonth ? 0 : prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount,
        ArrearGross: prsentMonth.IsArrearMonth ? prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
        PreMonthGross: prevMonth ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0
      });
    });
    if (this.companySetting) {
      let currentMonth = new Date().getMonth();
      let currentYear = new Date().getFullYear();
      for (let i = 0; i < 12; i++) {
        let status = 0;  // 1 = previous, 2 = current, 3 = upcoming
        if (this.companySetting.DeclarationStartMonth > 12) {
          this.companySetting.DeclarationStartMonth = 1;
          this.companySetting.FinancialYear = this.companySetting.FinancialYear + 1;
        }
        if ((this.companySetting.DeclarationStartMonth-1) == currentMonth)
          status = 2;
        else if ((this.companySetting.DeclarationStartMonth-1) < currentMonth && this.companySetting.FinancialYear == currentYear)
          status = 1;
        else
          status = 3;

        this.payrollCalendar.push({
          MonthName: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth-1, 1).toLocaleString('default', { month: 'short' }),
          Month: this.companySetting.DeclarationStartMonth-1,
          Year: this.companySetting.FinancialYear,
          StartDate: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth-1, 1).getDate(),
          EndDate: new Date(this.companySetting.FinancialYear, this.companySetting.DeclarationStartMonth , 0).getDate(),
          Status: status
        });
        this.companySetting.DeclarationStartMonth = this.companySetting.DeclarationStartMonth +1;
      }
      this.selectedPayrollCalendar = this.payrollCalendar.find(x => x.Month == currentMonth);
    }
  }

  globalFilter() {
    let searchQuery = "";
    // this.employeeData.reset();
    searchQuery= `emp.FirstName like '%${this.anyFilter}%' OR emp.Email like '%${this.anyFilter}%' OR emp.Mobile like '%${this.anyFilter}%'`;
    // this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    // this.LoadData();
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
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
        let prsentMonth = data.find(x => x.MonthNumber == item.Month+1);
        let prevMonth = data.find(x => x.MonthNumber == item.Month);
        this.employeeSalaries.push({
          FullName: x.FirstName + " " + x.LastName,
          EmployeeId: x.EmployeeId,
          Salary: prsentMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC"),
          Gross:prsentMonth.IsArrearMonth ? 0 : prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount,
          ArrearGross: prsentMonth.IsArrearMonth ? prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0,
          PreMonthGross: prevMonth ? prevMonth.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount : 0
        });
      });
    }
  }

  downloadDeclaration() {
    this.isLoading = true;
    let empId = this.employeeSalaries.map(x => x.EmployeeId);
    this.http.post('Declaration/ExportEmployeeDeclaration', empId).then(res => {
      if (res.ResponseBody) {
        console.log(res.ResponseBody);
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
}
