import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-attendance-management',
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss']
})
export class AttendanceManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}
