import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";
import { AjaxService } from "src/providers/ajax.service";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { Toast, UserDetail } from "src/providers/common-service/common.service";
import { AccessTokenExpiredOn } from "src/providers/constants";
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
  allocatedClients: Array<any> = [];
  paySlipsmonth: Array<any> = [];
  currentPayslip: any = null;
  isActive: boolean = false;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
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
      this.getEmpDetails();
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

  getEmpDetails() {
    this.http.get(`Employee/GetManageEmployeeDetail/${this.employeeUid}`)
    .then(response => {
      if (response.ResponseBody) {
        if (response.ResponseBody) {
          let data = response.ResponseBody;
          this.employeeDetails = data.Employee[0];
          this.allocatedClients = data.AllocatedClients;
          Toast("Dashboard is loading ......");
        }
      } else {
        Toast("Fail to inser/update, please contact to admin.");
      }
    })
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
    value[index].classList.add('active')
  }
}
