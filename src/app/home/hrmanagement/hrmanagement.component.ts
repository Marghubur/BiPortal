import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hrmanagement',
  templateUrl: './hrmanagement.component.html',
  styleUrls: ['./hrmanagement.component.scss']
})
export class HRManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}
