import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  payrollForm: FormGroup;
  payRoll:PayRollClass = new PayRollClass();
  days: Array<any> = [];
  enableDays: boolean = false;
  months: Array<any> = ['JANUARY', 'FEBUARY', 'MARCH', 'APRIL', 'MAY',
  'JUNE', 'JULY', 'AUGEST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  payDay: Array<any> = [];
  payPeriodMonth: string = null;
  nextMonth: string = null;
  payPeriodDate: string = null;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.initForm();
    this.payRoll = {
      PayFrequency : '0',
      PayCycleMonth : '0',
      PayPeriodEnd : '0',
      PayDayinMonth : '0',
      PayDayPeriod : '0',
      IsExcludeWeekly: true,
      IsExcludeHoliday: true
    }
  }

  onPayCycleChanged(e: any) {
    this.payPeriodMonth = e.target.value;
    if(this.payPeriodMonth) {
      let index = this.months.indexOf(this.payPeriodMonth);

      if(index == 11)
        this.nextMonth = this.months[1];
      else
        this.nextMonth = this.months[index + 1];
      let presentMonthDays = new Date(new Date().getFullYear(), index + 1, 0).getDate();
      this.enableDays = false;
      this.days = [];
      this.days.push({
        value: 32,
        text: 'Last day of month'
      }, {
        value: 33,
        text: 'First day of month'
      });

      let i = 1;
      let prefix = '';
      while(i <= presentMonthDays) {
        switch(i) {
        case 1:
        case 21:
          prefix = 'st';
          break;
        case 2:
        case 22:
          prefix = 'nd';
          break;
        case 3:
        case 33:
          prefix = 'rd';
          break;
        default:
          prefix = 'th';
          break;
        }
        this.days.push({
          value: i,
          text: `${i}${prefix} ${this.payPeriodMonth}`
        });
        i++;
      }

      this.enableDays = true;
    }
  }

  initForm() {
    this.payrollForm = this.fb.group({
      PayFrequency: new FormControl(this.payRoll.PayFrequency),
      PayCycleMonth: new FormControl(this.payRoll.PayCycleMonth),
      PayPeriodEnd: new FormControl(this.payRoll.PayPeriodEnd),
      PayDayinMonth: new FormControl(this.payRoll.PayDayinMonth),
      IsExcludeWeekly: new FormControl(this.payRoll.IsExcludeWeekly),
      IsExcludeHoliday: new FormControl(this.payRoll.IsExcludeHoliday? 'true' : ''),
      PayDayPeriod: new FormControl (this.payRoll.PayDayPeriod)
    })
  };

  savePayRollSetting() {
    let value:PayRollClass = this.payrollForm.value;
    if (value) {
      this.http.post('Settings/InsertUpdatePayrollSetting', value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Submitted Successfully.")
        }
      })
    }
    $('#saveConfirmationModal').modal('hide');
  }
  saveSettingModelOpen() {
    $('#saveConfirmationModal').modal('show');
  }

}

class PayRollClass {
  PayFrequency: string = '0';
  PayCycleMonth: string = '0';
  PayPeriodEnd: string = '0';
  PayDayinMonth: string = '0';
  PayDayPeriod: string = '0';
  IsExcludeWeekly: boolean = null;
  IsExcludeHoliday: boolean = null;
}
