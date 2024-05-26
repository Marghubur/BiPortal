import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/AjaxServices/ajax.service';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import {
  BillDetail,
  CharDashboard,
  Clients,
  Employees,
  ProjectList,
} from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  userId: number = 0;
  employeeUid: number = 0;
  isPageReady: boolean = false;
  userName: string = '';
  clientBillPayment: Array<any> = [];
  gstPaymentDetail: Array<any> = [];
  employeeAttandenceDetail: Array<any> = [];
  totalPendingPayment: number = 0;
  totalGSTAmount: number = 0;
  monthlyExpenses: Array<number> = [];
  monthlyProfit: Array<number> = [];
  months: Array<string> = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  isPaymenyPending: boolean = false;
  isLoading: boolean = false;
  leaveDetail: Array<any> = [];
  projectDetail: Array<any> = [];
  clientDetail: Array<any> = [];
  newJoinees: Array<any> = [];

  constructor(
    private http: CoreHttpService,
    private nav: iNavigation,
    private ajax: AjaxService
  ) {}

  ngOnInit() {
    // this.gemeniRequestTest = 'tell me about hyderabad in 10 lines';
    // this.generateResponse();
    this.getDeatils();
    this.LoadDoughnutchart();
    this.LeaveReportChart();
  }

  getDeatils() {
    this.isPageReady = false;
    this.isPaymenyPending = false;
    this.isLoading = true;
    let data = {
      UserId: 6,
      EmployeeUid: 6,
      AttendenceFromDay: '2021-09-03 20:49:08.000000',
      AttendenceToDay: '2022-02-24 20:49:08.000000',
    };
    this.http.post('Dashboard/GetSystemDashboard', data).then((response) => {
      if (response.ResponseBody) {
        this.totalPendingPayment = 0;
        this.totalGSTAmount = 0;
        this.clientBillPayment = response.ResponseBody.BillDetail;
        this.gstPaymentDetail = response.ResponseBody.GSTDetail;
        this.employeeAttandenceDetail = response.ResponseBody.AttendaceDetail;
        this.leaveDetail = response.ResponseBody.leaves;
        this.projectDetail = response.ResponseBody.projects;
        this.clientDetail = response.ResponseBody.clients;
        this.newJoinees = response.ResponseBody.newJoinees;
        let expenseDetail = response.ResponseBody.expensesModel;
        let profitDetail = response.ResponseBody.profitModel;
        if (expenseDetail && expenseDetail.length > 0) {
          let i = 1;
          let elem = null;
          let amount: number = 0;
          while (i <= expenseDetail.length) {
            elem = expenseDetail.find((x) => x.Month == i);
            if (elem != null) {
              amount = Number(elem['Amount']);
              if (!isNaN(amount)) {
                this.monthlyExpenses.push(amount);
              } else {
                this.monthlyExpenses.push(0);
              }
            } else {
              this.monthlyExpenses.push(0);
            }
            i++;
          }
        }

        if (profitDetail && profitDetail.length > 0) {
          let i = 1;
          let elem = null;
          let amount: number = 0;
          while (i <= profitDetail.length) {
            elem = profitDetail.find((x) => x.Month == i);
            if (elem != null) {
              amount = Number(elem['Amount']);
              if (!isNaN(amount)) {
                this.monthlyProfit.push(amount);
              } else {
                this.monthlyProfit.push(0);
              }
            } else {
              this.monthlyProfit.push(0);
            }
            i++;
          }
        }

        if (this.clientBillPayment && this.clientBillPayment.length > 0) {
          let i = 0;
          while (i < this.clientBillPayment.length) {
            this.totalPendingPayment += this.clientBillPayment[i].PaidAmount;
            this.isPaymenyPending = true;
            i++;
          }
        }

        if (this.gstPaymentDetail && this.gstPaymentDetail.length > 0) {
          let index = 0;
          while (index < this.gstPaymentDetail.length) {
            this.totalGSTAmount += this.gstPaymentDetail[index].amount;
            index++;
          }
        }

        this.LoadLineChart();
        this.isPageReady = true;
        this.isLoading = false;
        Toast('Your dashboard loaded successfully.', 1);
      } else {
        Toast('Fail to get dashboard data, please contact to admin.');
      }
    });
  }

  editPendingPayment() {
    let billDetails = {
      BillStatusId: this.clientBillPayment[0].BillStatusId,
      BillForMonth: this.clientBillPayment[0].BillForMonth,
    };
    this.nav.navigate(BillDetail, billDetails);
  }

  LoadLineChart() {
    let elem: any = document.getElementById('lineChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.months,
        datasets: [
          {
            label: 'monthly expense',
            backgroundColor: 'blue',
            borderColor: 'blue',
            data: this.monthlyExpenses,
          },
          {
            label: 'monthly profit',
            backgroundColor: 'red',
            borderColor: 'red',
            data: this.monthlyProfit,
          },
        ],
      },
    });
  }

  LeaveReportChart() {
    let elem: any = document.getElementById('leaveReportChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            barThickness: 30,
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  LoadDoughnutchart() {
    let elem: any = document.getElementById('doughnutchart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
          {
            label: 'My First dataset',
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
            ],
            borderColor: 'rgb(255, 99, 132)',
            data: [100, 100, 50],
            hoverOffset: 4,
          },
        ],
      },
    });
  }

  viewProjects() {
    this.nav.navigate(ProjectList, null);
  }

  viewClients() {
    this.nav.navigate(Clients, null);
  }

  viewNewJoinee() {
    this.nav.navigate(Employees, null);
  }

  switchtoChatDashboard() {
    this.nav.navigate(CharDashboard, null);
  }
}
