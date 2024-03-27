import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timesheet-management',
  templateUrl: './timesheet-management.component.html',
  styleUrls: ['./timesheet-management.component.scss']
})
export class TimesheetManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}
