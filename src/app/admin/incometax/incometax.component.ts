import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
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
  grossEarning: Array<GrossEarning> = [];
  taxSlab: Array<TaxSlab> = [];
  monthlyTaxAmount: MonthlyTax;
  salaryDetail: any = null;
  allDeclarationSalaryDetails: any = null;
  salaryBreakup: Array<any> = [];
  TaxDetails: Array<any> = [];

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

    this.grossEarning.push({
      salaryBreakup: 'Basic',
      total: 849600,
      april: 70800,
      may: 70800,
      june: 70800,
      july: 70800,
      aug: 70800,
      sep: 70800,
      oct: 70800,
      nov: 70800,
      dec: 70800,
      jan: 70800,
      feb: 70800,
      march: 70800
    },
    {
      salaryBreakup: 'Conveyance Allowance',
      total: 19200,
      april: 1600,
      may: 1600,
      june: 1600,
      july: 1600,
      aug: 1600,
      sep: 1600,
      oct: 1600,
      nov: 1600,
      dec: 1600,
      jan: 1600,
      feb: 1600,
      march: 1600
    },
    {
      salaryBreakup: 'HRA',
      total: 339840,
      april: 28320,
      may: 28320,
      june: 28320,
      july: 28320,
      aug: 28320,
      sep: 28320,
      oct: 28320,
      nov: 28320,
      dec: 28320,
      jan: 28320,
      feb: 28320,
      march: 28320
    },
    {
      salaryBreakup: 'Medical Allowance',
      total: 15000,
      april: 1250,
      may: 1250,
      june: 1250,
      july: 1250,
      aug: 1250,
      sep: 1250,
      oct: 1250,
      nov: 1250,
      dec: 1250,
      jan: 1250,
      feb: 1250,
      march: 1250
    },
    {
      salaryBreakup: 'Car Running Allowance',
      total: 21600,
      april: 1800,
      may: 1800,
      june: 1800,
      july: 1800,
      aug: 1800,
      sep: 1800,
      oct: 1800,
      nov: 1800,
      dec: 1800,
      jan: 1800,
      feb: 1800,
      march: 1800
    },
    {
      salaryBreakup: 'Telephone and Internet Allowance',
      total: 18000,
      april: 1500,
      may: 1500,
      june: 1500,
      july: 1500,
      aug: 1500,
      sep: 1500,
      oct: 1500,
      nov: 1500,
      dec: 1500,
      jan: 1500,
      feb: 1500,
      march: 1500
    },
    {
      salaryBreakup: 'Travel Reimburesment(LTA)',
      total: 30000,
      april: 2500,
      may: 2500,
      june: 2500,
      july: 2500,
      aug: 2500,
      sep: 2500,
      oct: 2500,
      nov: 2500,
      dec: 2500,
      jan: 2500,
      feb: 2500,
      march: 2500
    },
    {
      salaryBreakup: 'Shfit Allowance',
      total: 18000,
      april: 1500,
      may: 1500,
      june: 1500,
      july: 1500,
      aug: 1500,
      sep: 1500,
      oct: 1500,
      nov: 1500,
      dec: 1500,
      jan: 1500,
      feb: 1500,
      march: 1500
    },
    {
      salaryBreakup: 'Special Allowance',
      total: 812760,
      april: 67730,
      may: 67730,
      june: 67730,
      july: 67730,
      aug: 67730,
      sep: 67730,
      oct: 67730,
      nov: 67730,
      dec: 67730,
      jan: 67730,
      feb: 67730,
      march: 67730
    },
    {
      salaryBreakup: 'Total earnings',
      total: 2124000,
      april: 177000,
      may: 177000,
      june: 177000,
      july: 177000,
      aug: 177000,
      sep: 177000,
      oct: 177000,
      nov: 177000,
      dec: 177000,
      jan: 177000,
      feb: 177000,
      march: 177000
    });

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


    this.monthlyTaxAmount = {
      april: 37050,
      may: 37050,
      june: 37050,
      july: 37050,
      aug: 37050,
      sep: 37050,
      oct: 37050,
      nov: 37050,
      dec: 37050,
      jan: 37050,
      feb: 37050,
      march: 37050
    };
    this.loadData();
  }

  loadData() {
    let EmployeeId = 30;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${EmployeeId}`)
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

class GrossEarning {
  salaryBreakup: string = '';
  total: number = 0;
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
