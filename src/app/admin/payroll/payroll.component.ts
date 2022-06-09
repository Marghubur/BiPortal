import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss']
})
export class PayrollComponent implements OnInit {
  payrollForm: FormGroup;
  payRoll:PayRoll = new PayRoll();
  days: Array<any> = [];
  enableDays: boolean = false;
  months: Array<any> = ['JANUARY', 'FEBUARY', 'MARCH', 'APRIL', 'MAY',
  'JUNE', 'JULY', 'AUGEST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  payDay: Array<any> = [];
  payPeriodMonth: string = null;
  nextMonth: string = null;
  payPeriodDate: string = null;
  isReady: boolean = false;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.loadPayrollSetting();
  }

  loadPayrollSetting() {
    this.http.get(`Settings/GetPayrollSetting/${1}`).then(res => {
      if(res.ResponseBody) {
        this.payRoll = res.ResponseBody;
        this.initForm();
        this.isReady = true;
        Toast("Payroll detail fetched successfully.");
      } else {
        ErrorToast("Fail to fetch payroll detail. Please contact to admin.");
      }
    });
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
      CompanyId: new FormControl(this.payRoll.CompanyId),
      PayrollCycleSettingId: new FormControl(this.payRoll.PayrollCycleSettingId),
      PayFrequency: new FormControl(this.payRoll.PayFrequency),
      PayCycleMonth: new FormControl(this.payRoll.PayCycleMonth),
      OrganizationId: new FormControl(this.payRoll.OrganizationId),
      PayCycleDayOfMonth: new FormControl(this.payRoll.PayCycleDayOfMonth),
      PayCalculationId: new FormControl (this.payRoll.PayCalculationId),
      IsExcludeWeeklyOffs: new FormControl (this.payRoll.IsExcludeWeeklyOffs),
      IsExcludeHolidays: new FormControl (this.payRoll.IsExcludeHolidays)
    })
  };

  savePayRollSetting() {
    let value:PayRoll = this.payrollForm.value;
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

class PayRoll {
  CompanyId: number = 1;
  PayrollCycleSettingId: number = 0;
  OrganizationId: number = 1;
  PayFrequency: number = 0;
  PayCycleMonth: number = 0;
  PayCycleDayOfMonth: number = 0;
  PayCalculationId: number = 0;
  IsExcludeWeeklyOffs: boolean = false;
  IsExcludeHolidays: boolean = false;
}
