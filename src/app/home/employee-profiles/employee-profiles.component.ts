import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-profiles',
  templateUrl: './employee-profiles.component.html',
  styleUrls: ['./employee-profiles.component.scss']
})
export class EmployeeProfilesComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}