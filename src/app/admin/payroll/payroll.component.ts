import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  payrollForm: FormGroup;
  payRoll:PayRollClass = new PayRollClass();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.payRoll = {
      PayFrequency : '0',
      PayCycleStart : '0',
      PayPeriodEnd : '0',
      PayDayinMonth : '0',
      PayDayPeriod : '0',
      IsExcludeWeekly: true,
      IsExcludeHoliday: true
    }
  }

  initForm() {
    this.payrollForm = this.fb.group({
      PayFrequency: new FormControl(this.payRoll.PayFrequency),
      PayCycleStart: new FormControl(this.payRoll.PayCycleStart),
      PayPeriodEnd: new FormControl(this.payRoll.PayPeriodEnd),
      PayDayinMonth: new FormControl(this.payRoll.PayDayinMonth),
      IsExcludeWeekly: new FormControl(this.payRoll.IsExcludeWeekly),
      IsExcludeHoliday: new FormControl(this.payRoll.IsExcludeHoliday? 'true' : ''),
      PayDayPeriod: new FormControl (this.payRoll.PayDayPeriod? 'true' : '')
    })
  };

  savePayRollSetting() {
    console.log(this.payrollForm.value);
    $('#saveConfirmationModal').modal('hide');
  }
  saveSettingModelOpen() {
    $('#saveConfirmationModal').modal('show');
  }

}

class PayRollClass {
  PayFrequency: string = '0';
  PayCycleStart: string = '0';
  PayPeriodEnd: string = '0';
  PayDayinMonth: string = '0';
  PayDayPeriod: string = '0';
  IsExcludeWeekly: boolean = null;
  IsExcludeHoliday: boolean = null;
}
