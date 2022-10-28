import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-employee-performance',
  templateUrl: './employee-performance.component.html',
  styleUrls: ['./employee-performance.component.scss']
})
export class EmployeePerformanceComponent implements OnInit {
  employeeUid: number = 0;
  employeeDetails: any = null;
  allocatedClients: any = null;
  performanceMonthsYears: Array<any> = [];
  currentPerformance: any = null;
  isActive: boolean = false;
  daysInMonth: Array<number> = [];
  graphInstances: Array<any> = [];
  months: Array<string> = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private nav:iNavigation,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    let company = this.local.findRecord("Companies");
    console.log(data)
    if(data && data != null) {
      this.employeeDetails = data;
      this.employeeUid = data.EmployeeUid;
    } else
      ErrorToast("Invalid user. Please login again.");

    if(company)
      this.allocatedClients = company.find(x => x.CompanyId == this.employeeDetails.CompanyId);
    let date = new Date();
    this.findNoOfDaysinMonth(date.getMonth(), date.getFullYear());
    this.getLastFourMonth();
    this.DestroyGraphInstances();
    this.monthlyPerformaceChart();
    this.yearlyPerformaceChart();
    this.performanceMonthsYears[0].isActive = false;
    this.currentPerformance = {
        month: this.performanceMonthsYears[0].months,
        year: this.performanceMonthsYears[0].years,
      }
  }

  getAllocateCompany() {
    let data = this.local.findRecord("Companies");
    if (data) {
      this.allocatedClients = data.find(x => x.CompanyId == this.employeeDetails.CompanyId);
    }
  }

  getLastFourMonth() {
    let month = new Date().getMonth()+1;
    let year = new Date().getFullYear();
    let i =0;
    while (i < 4) {
      if (month == 1) {
        month = 12;
        year --;
      } else {
        month --;
      }
      this.performanceMonthsYears.push({
        months: new Date(year, month-1, 1).toLocaleString("en-us", { month: "long"}),
        years: year,
        isActive: true
      });
      i++;
    };
  }

  findNoOfDaysinMonth(month: number, year: number) {
    this.daysInMonth = [];
    let lastDate = new Date(year, month, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      this.daysInMonth.push(i);
    }
  }

  monthlyPerformaceChart() {
    let elem: any = document.getElementById('monthlyPerformance');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels:  this.daysInMonth,
        datasets: [{
          label: 'Monthly Performance',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
      }]
      }
    })
    this.graphInstances.push(myChart);
  };

  yearlyPerformaceChart() {
    let elem: any = document.getElementById('yearlyPerformance');
    const ctx = elem.getContext('2d');
    const yearlyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels:  this.months,
        datasets: [{
          label: 'Yearly Performance',
          backgroundColor: '#7570b3',
          borderColor: '#7570b3',
          pointBackgroundColor: '#443f7c',
          pointHoverBorderColor: '#443f7c',
          pointBorderColor: '#443f7c',
          pointHoverBackgroundColor: '#443f7c',
          data: [0, 10, 5, 2, 20, 30, 45],
        },{
          label: 'Yearly Performance',
          backgroundColor: '#66a61e',
          borderColor: '#66a61e',
          pointBackgroundColor: '#66a61e',
          pointHoverBorderColor: '#66a61e',
          pointBorderColor: '#66a61e',
          pointHoverBackgroundColor: '#66a61e',
          data: [5, 15, 25, 20, 20, 20, 15],
        },
        {
          label: 'Yearly Performance',
          backgroundColor: '#d95f02',
          borderColor: '#d95f02',
          pointBackgroundColor: '#d95f02',
          pointHoverBorderColor: '#d95f02',
          pointBorderColor: '#d95f02',
          pointHoverBackgroundColor: '#d95f02',
          data: [10, 25, 15, 10, 3, 5, 100],
        }]
      }
    })
  };

  performanceMonth(index: number, item: any) {
    console.log(item);
    this.DestroyGraphInstances();
    this.isActive = false;
    this.currentPerformance = {
      month: this.performanceMonthsYears[index].months,
      year: this.performanceMonthsYears[index].years
    };
    var value = document.querySelectorAll("ul .payslip");
    for (let i=0; i <value.length; i++) {
      value[i].classList.remove('active');
    }
    value[index].classList.add('active');

    var d = Date.parse(item.months + `1, ${item.years}`);
   if(!isNaN(d)){
    let month = new Date(d).getMonth() + 1;
    this.findNoOfDaysinMonth(month, item.years);
    this.monthlyPerformaceChart();
    console.log(this.daysInMonth)
  }
  }

  DestroyGraphInstances() {
    let i = 0;
    while(i < this.graphInstances.length) {
      this.graphInstances[i].destroy();
      i++;
    }

    this.graphInstances = [];
  }

}
