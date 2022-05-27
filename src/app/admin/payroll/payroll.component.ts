import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  saveSettingModelOpen() {
    $('#saveConfirmationModal').modal('show');
  }

}
