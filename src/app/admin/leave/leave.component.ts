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
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [100, 100, 50],
          hoverOffset: 4
      }]
      },
      options: {
        maintainAspectRatio: false,
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
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [100, 100, 50],
          hoverOffset: 4,
        }]
      },
      options: {
        maintainAspectRatio: false,
    }
    })
  }

  EarnLeaveChart() {
    let elem: any = document.getElementById('earnLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['2 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [100, 100, 50],
          hoverOffset: 4,
        }]
      },
      options: {
        maintainAspectRatio: false,
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
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }

}
