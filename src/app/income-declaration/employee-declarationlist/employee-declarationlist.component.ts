import { Component, OnInit } from '@angular/core';
import { employeeModel } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { AdminDeclaration } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

@Component({
  selector: 'app-employee-declarationlist',
  templateUrl: './employee-declarationlist.component.html',
  styleUrls: ['./employee-declarationlist.component.scss']
})
export class EmployeeDeclarationlistComponent implements OnInit {
  isEmpPageReady: boolean = false;
  anyFilter: string = "";
  employeeData: Filter = new Filter();
  employeeDetail: Array<any> = [];
  orderByNameAsc: boolean = null;
  orderByMobileAsc: boolean = null;
  orderByEmailAsc: boolean = null;
  employeeSalaries: Array<any> = null;

  constructor(private http: AjaxService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.LoadData();
  }

  LoadData() {
    this.isEmpPageReady = false;
    this.http.post("SalaryComponent/GetAllSalaryDetail", this.employeeData).
    then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.employeeDetail = response.ResponseBody.SalaryDetail;
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
      let nextMonth  = data.find(x => x.MonthNumber == currentMonth+1);
      let salaryComponent = prsentMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC");
      let currentSalary = salaryComponent.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
      let nextSalaryComponeny = nextMonth.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != "CTC");
      let nextSalary = nextSalaryComponeny.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
      this.employeeSalaries.push({
        Index: x.Index,
        FullName: x.FirstName + " " + x.LastName,
        EmployeeId: x.EmployeeId,
        CurrentCTC: prsentMonth.SalaryBreakupDetails.find(x => x.ComponentId == "CTC").FinalAmount,
        NextCTC: nextMonth.SalaryBreakupDetails.find(x => x.ComponentId == "CTC").FinalAmount,
        CurrentSalary: currentSalary,
        NextSalary: nextSalary
      })
    })
  }

  globalFilter() {
    let searchQuery = "";
    // this.employeeData.reset();
    searchQuery= `emp.FirstName like '%${this.anyFilter}%' OR emp.Email like '%${this.anyFilter}%' OR emp.Mobile like '%${this.anyFilter}%'`;
    // this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    // this.LoadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'FirstName') {
      this.orderByNameAsc = !flag;
      this.orderByMobileAsc = null;
      this.orderByEmailAsc = null;
    } else if (FieldName == 'Mobile') {
      this.orderByMobileAsc = !flag;
      this.orderByEmailAsc = null;
      this.orderByNameAsc = null;
    }
    if (FieldName == 'Email') {
      this.orderByEmailAsc = !flag;
      this.orderByNameAsc = null;
      this.orderByMobileAsc = null;
    }
    this.employeeData = new Filter();
    this.employeeData.SortBy = FieldName +" "+ Order;
    this.LoadData()
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
}
