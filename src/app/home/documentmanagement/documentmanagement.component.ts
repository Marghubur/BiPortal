import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documentmanagement',
  templateUrl: './documentmanagement.component.html',
  styleUrls: ['./documentmanagement.component.scss']
})
export class DocumentmanagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}