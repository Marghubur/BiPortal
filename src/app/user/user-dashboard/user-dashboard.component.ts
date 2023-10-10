import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";
import { ResponseModel } from "src/auth/jwtService";
import { AjaxService } from "src/providers/ajax.service";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { Toast, UserDetail } from "src/providers/common-service/common.service";
import { AccessTokenExpiredOn, AdminDeclaration, AdminIncomeTax } from "src/providers/constants";
import { iNavigation } from "src/providers/iNavigation";
import { UserService } from "src/providers/userService";
declare var $:any;

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  userId: number = 0;
  employeeUid: number = 0;
  userName: string = "";
  isPageReady: boolean = false;
  employeeDetails: any = null;
  allocatedClients: any = null;
  paySlipsmonth: Array<any> = [];
  currentPayslip: any = null;
  isActive: boolean = false;
  completeSalaryBreakup: any = null;
  completeSalaryDetail: Array<any> = [];
  taxDetails: Array<any> = [];
  employeeTaxDetail: any = null;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private nav: iNavigation,
              private user: UserService) { }

  ngOnInit() {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    let userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      userDetail["TokenExpiryDuration"] = new Date();
    else
      userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      userDetail = Master["UserDetail"];
      this.employeeUid = userDetail.UserId;
      this.employeeDetails = userDetail;
      this.getAllocateCompany();
    } else {
      Toast("Invalid user. Please login again.")
    }
    this.getAllPayslips();
    this.paySlipsChart();
    this.paySlipsmonth[0].isActive = false;
    this.currentPayslip = {
      month: this.paySlipsmonth[0].months,
      year: this.paySlipsmonth[0].years,
    }
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.employeeUid}`, false).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.completeSalaryBreakup = res.ResponseBody.completeSalaryBreakup;
        this.completeSalaryDetail = JSON.parse(this.completeSalaryBreakup.CompleteSalaryDetail);
        this.taxDetails = JSON.parse(this.completeSalaryBreakup.TaxDetail);
        let totalTaxAmt = this.taxDetails.map(x => x.TaxDeducted).reduce((acc, curr) => {return acc+curr;}, 0);
        let taxPaidAmt = this.taxDetails.filter(x => x.IsPayrollCompleted == true).map(x => x.TaxDeducted).reduce((acc, curr) => {return acc+curr;}, 0);
        this.employeeTaxDetail = {
          totalTaxAmount : totalTaxAmt,
          taxpaid : taxPaidAmt,
          remainingTax: totalTaxAmt - taxPaidAmt,
          percent: (taxPaidAmt * 100) / totalTaxAmt
        }
        this.isPageReady = true;
      }
    })
  }

  getAllocateCompany() {
    let data = this.local.findRecord("Companies");
    if (data) {
      this.allocatedClients = data.find(x => x.CompanyId == this.employeeDetails.CompanyId);
    }
  }

  getAllPayslips() {
    let month = new Date().getMonth()+1;
    let year = new Date().getFullYear();
    let date = new Date();
    let i =0;
    while (i < 4) {
      if (month == 1) {
        month = 12;
        year --;
      } else {
        month --;
      }
      this.paySlipsmonth.push({
        months: new Date(year, month-1, 1).toLocaleString("en-us", { month: "long"}),
        years: year,
        isActive: true
      })
      i++;
    };
  }

  paySlipsChart() {
    let elem: any = document.getElementById('paySlipChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        //labels: ['118 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(33, 85, 205)',
            'rgb(168, 92, 249)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [80, 20],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(33, 85, 205)',
            'rgb(168, 92, 249)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 65
    }
    })
  };

  yourPayslipMonth(index: number) {
    this.isActive = false;
    this.currentPayslip = {
      month: this.paySlipsmonth[index].months,
      year: this.paySlipsmonth[index].years
    };
    var value = document.querySelectorAll("ul .payslip");
    for (let i=0; i <value.length; i++) {
      value[i].classList.remove('active');
    }
    value[index].classList.add('active');
  }

  navIncometaxPage() {
    this.nav.navigate(AdminIncomeTax, null);
  }

  navDeclarationPage() {
    this.nav.navigate(AdminDeclaration, null);
  }
}
