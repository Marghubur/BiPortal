import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-incometax',
  templateUrl: './incometax.component.html',
  styleUrls: ['./incometax.component.scss']
})
export class IncometaxComponent implements OnInit {
  cachedData: any = null;
  taxCalender: Array<any> = [];
  currentYear: number = 0;
  taxSlab: Array<TaxSlab> = [];
  salaryDetail: any = null;
  allDeclarationSalaryDetails: any = null;
  salaryBreakup: Array<any> = [];
  TaxDetails: Array<any> = [];
  EmployeeId: number = 0;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    var month = 3;
    this.currentYear = dt.getFullYear();
    var years = dt.getFullYear();
    let i = 0;
    while( i < 12) {
      var mnth = Number((((month + 1) < 9 ? "" : "0") + month));
      if (month == 12) {
        month = 1;
        years ++
      } else {
        month ++;
      }
      this.taxCalender.push({
        month: new Date(years, mnth, 1).toLocaleString("en-us", { month: "short" }), // result: Aug
        year: Number(years.toString().slice(-2))
      });
      i++;
    }

    this.taxSlab.push({
      taxableincomeslab: '0% Tax on income up to 250000',
      taxamount: 0
    },
    {
      taxableincomeslab: '5% Tax on income between 250001 and 500000',
      taxamount: 12500
    },
    {
      taxableincomeslab: '20% Tax on income between 500001 and 1000000',
      taxamount: 100000
    },
    {
      taxableincomeslab: '30% Tax on income above 1000000',
      taxamount: 315000
    },
    {
      taxableincomeslab: 'Gross Income Tax',
      taxamount: 427500
    });

    this.EmployeeId = this.nav.getValue();
    if(this.EmployeeId == null || this.EmployeeId <= 0){
      ErrorToast("Unable to get data. Please contact to admin.");
      return;
    }
    this.loadData();
  }

  loadData() {
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        console.log(response.ResponseBody);
        this.allDeclarationSalaryDetails = response.ResponseBody;
        this.salaryDetail = response.ResponseBody.SalaryDetail;
        this.TaxDetails = JSON.parse(this.salaryDetail.TaxDetail);
        let value = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        for (let index = 0; index < 12; index++) {
          let total = (value.BasicAnnually + value.CarRunningAnnually+value.ConveyanceAnnually+value.HRAAnnually+value.InternetAnnually+value.TravelAnnually+value.ShiftAnnually+value.SpecialAnnually);
          value.Total = total;
          this.salaryBreakup.push(value);
        };
        Toast("Details get successfully")
      }
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
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "PaySlips":
        this.nav.navigateRoot(AdminPaySlip, this.cachedData);
        break;
      case "IncomeTax":
        break;
    }
  }

}

class TaxSlab {
  taxableincomeslab: string = '';
  taxamount: number = 0;
}

export class MonthlyTax {
  april: number = 0;
  may: number = 0;
  june: number = 0;
  july: number = 0;
  aug: number = 0;
  sep: number = 0;
  oct: number = 0;
  nov: number = 0;
  dec: number = 0;
  jan: number = 0;
  feb: number = 0;
  march: number = 0
}
