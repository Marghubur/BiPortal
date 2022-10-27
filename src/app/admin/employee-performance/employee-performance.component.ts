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
  userId: number = 0;
  employeeUid: number = 0;
  userName: string = "";
  isPageReady: boolean = false;
  employeeDetails: any = null;
  allocatedClients: any = null;
  performanceMonthsYears: Array<any> = [];
  currentPayslip: any = null;
  isActive: boolean = false;
  daysInMonth: Array<number> = [];
  graphInstances: Array<any> = [];
  performanecMonths: Array<string> = [];

  constructor(private nav:iNavigation,
              private http: AjaxService,
              private local: ApplicationStorage,
              private user: UserService) { }

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
    this.getAllMonthPerformance();
    this.DestroyGraphInstances();
    this.monthlyPerformaceChart();
    this.yearlyPerformaceChart();
    this.performanceMonthsYears[0].isActive = false;
    this.currentPayslip = {
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

  getAllMonthPerformance() {
    let month = new Date().getMonth()+1;
    let year = new Date().getFullYear();
    let i =0;
    while (i < new Date().getMonth()) {
      if (month == 1) {
        month = 12;
        year --;
      } else {
        month --;
      }
      let mnth = new Date(year, month-1, 1).toLocaleString("en-us", { month: "long"});
      this.performanceMonthsYears.push({
        months: mnth,
        years: year,
        isActive: true
      });
      this.performanecMonths.push(mnth)
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
        labels:  this.performanecMonths.reverse(),
        datasets: [{
          label: 'Yearly Performance',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45],
      }]
      }
    })
  };

  performanceMonth(index: number, item: any) {
    console.log(item);
    this.DestroyGraphInstances();
    this.isActive = false;
    this.currentPayslip = {
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
