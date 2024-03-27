import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payroll-software',
  templateUrl: './payroll-software.component.html',
  styleUrls: ['./payroll-software.component.scss']
})
export class PayrollSoftwareComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
