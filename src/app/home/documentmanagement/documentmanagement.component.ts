import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentmanagement',
  templateUrl: './documentmanagement.component.html',
  styleUrls: ['./documentmanagement.component.scss']
})
export class DocumentmanagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}