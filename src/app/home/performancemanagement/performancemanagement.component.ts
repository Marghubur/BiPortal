import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-performancemanagement',
  templateUrl: './performancemanagement.component.html',
  styleUrls: ['./performancemanagement.component.scss']
})
export class PerformancemanagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
