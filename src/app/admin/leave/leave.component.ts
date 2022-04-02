import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.LeaveReportChart();
    this.LoadDoughnutchart();
    this.MonthlyStatusChart();
    this.CasualLeaveChart();
    this.EarnLeaveChart();
    this.SickLeaveChart();
    this.UnpaidLeaveChart();
    this.CompLeaveChart();
  }

  LeaveReportChart(){
    let elem: any = document.getElementById('weeklyPatternChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: '# of Pattern',
                barThickness: 20,
                data: [12, 19, 3, 5, 2, 3, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }

  LoadDoughnutchart() {
    let elem: any = document.getElementById('consumeLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Leave Types'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(192,146,146)',
            'rgb(143,178,168)',
            'rgb(109,209,255)'
          ],
          borderWidth: 0,
          data: [100, 100, 50],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(192,146,146)',
            'rgb(143,178,168)',
            'rgb(109,209,255)'
          ],
      }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        cutout: 50,
    }
    })
  }

  CasualLeaveChart() {
    let elem: any = document.getElementById('casualLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['2 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(219,112,147)',
            'rgb(123,104,238)'
          ],
          borderWidth: 0,
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(219,112,147)',
            'rgb(123,104,238)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  EarnLeaveChart() {
    let elem: any = document.getElementById('earnLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['1 Day Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(112,219,183)',
            'rgb(68,79,117)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(112,219,183)',
            'rgb(68,79,117)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  SickLeaveChart() {
    let elem: any = document.getElementById('sickLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['0.5 Day Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(32,178,170)',
            'rgb(0,0,139)'
          ],
          borderWidth: 0,
          data: [30, 70],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(32,178,170)',
            'rgb(0,0,139)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  UnpaidLeaveChart() {
    let elem: any = document.getElementById('unpaidLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['118 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(234,9,141)',
            'rgb(153,39,197)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(234,9,141)',
            'rgb(153,39,197)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  CompLeaveChart() {
    let elem: any = document.getElementById('compLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['118 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(123,166,255)',
            'rgb(249,203,156)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [1, 1],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(123,166,255)',
            'rgb(249,203,156)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  MonthlyStatusChart(){
    let elem: any = document.getElementById('MonthlyStatusChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: '# of Pattern',
                barThickness: 20,
                data: [12, 19, 3, 5, 2, 3, 10, 12, 19, 3, 5, 2, 3, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
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
          maintainAspectRatio: false,
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }

}
