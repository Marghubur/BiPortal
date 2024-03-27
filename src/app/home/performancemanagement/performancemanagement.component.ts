import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-performancemanagement',
  templateUrl: './performancemanagement.component.html',
  styleUrls: ['./performancemanagement.component.scss']
})
export class PerformancemanagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}
