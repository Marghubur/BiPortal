import { Component, OnInit } from "@angular/core";
import { Chart } from "chart.js";
import { AjaxService } from "src/providers/ajax.service";
import { Toast } from "src/providers/common-service/common.service";
declare var $:any;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  userId: number = 0;
  employeeUid: number = 0;
  isPageReady: boolean = false;
  userName: string = "";
  clientBillPayment: Array<any> = [];
  gstPaymentDetail: Array<any> = [];
  employeeAttandenceDetail: Array<any> = [];
  totalPendingPayment: number = 0;

  constructor(private http: AjaxService) { }

  ngOnInit() {
    this.getDeatils();
    this.LoadChartData();
    this.LoadLineChart();
    this.LoadDoughnutchart();
    this.LeaveReportChart();
  }


  getDeatils() {
    this.isPageReady = false;
    let data = {
      "UserId" : 6,
      "EmployeeUid": 6,
      "AttendenceFromDay": "2021-09-03 20:49:08.000000",
      "AttendenceToDay": "2022-02-24 20:49:08.000000"
    }
    this.http.post("Dashboard/GetSystemDashboard", data)
    .then(response => {
      if (response.ResponseBody) {
        this.totalPendingPayment = 0;
        this.clientBillPayment = response.ResponseBody.BillDetail
        this.getDeatils = response.ResponseBody.GSTDetail
        this.employeeAttandenceDetail = response.ResponseBody.AttendaceDetail;
        let i = 0;
        while(i < this.clientBillPayment.length) {
          this.totalPendingPayment =
          i++;
        }
        Toast("Loaded successfully.");
        this.isPageReady = true;
      } else {
        Toast("Fail to inser/update, please contact to admin.");
      }
    })
  }

  LoadLineChart() {
    let elem: any = document.getElementById('lineChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['January','February','March','April','May','June'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45]
      }]
      }
    })
  }

  LeaveReportChart(){
    let elem: any = document.getElementById('leaveReportChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                barThickness: 30,
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }

  LoadDoughnutchart() {
    let elem: any = document.getElementById('doughnutchart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Red','Blue','Yellow'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          borderColor: 'rgb(255, 99, 132)',
          data: [100, 100, 50],
          hoverOffset: 4
      }]
      }
    })
  }

  LoadChartData() {
    let elem: any = document.getElementById('myChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Red', 'Blue', 'Yellow', 'Green'],
            datasets: [{
                label: '# of Votes',
                barThickness: 30,
                data: [12, 19, 3, 5, 2, 3, 4, 5, 6, 7],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }
}
