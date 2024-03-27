import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shift-management',
  templateUrl: './shift-management.component.html',
  styleUrls: ['./shift-management.component.scss']
})
export class ShiftManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
