import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hrmanagement',
  templateUrl: './hrmanagement.component.html',
  styleUrls: ['./hrmanagement.component.scss']
})
export class HRManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
