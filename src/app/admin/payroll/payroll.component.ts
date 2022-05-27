import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  payRollForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  initForm() {
    this.payRollForm = this.fb.group({

    })
  }

  saveSettingModelOpen() {
    $('#saveConfirmationModal').modal('show');
  }

}
