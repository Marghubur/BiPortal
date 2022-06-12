import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Payroll } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
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
  months: Array<any> = ['JANUARY', 'FEBUARY', 'MARCH', 'APRIL', 'MAY',
  'JUNE', 'JULY', 'AUGEST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  payDay: Array<any> = [];
  payPeriodMonth: string = null;
  payPeriodDate: string = null;
  isReady: boolean = false;
  compnayDetail: any = null;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.prefixDays();
    this.compnayDetail = this.nav.getValue();
    this.payRoll = new PayRoll();
    if(this.compnayDetail != null) {
      this.isReady = true;
      this.loadPayrollSetting();
      this.initForm();
    } else {
      ErrorToast("Getter some internal issue. Please login again or contact to admin.");
    }
  }

  loadPayrollSetting() {
    this.http.get(`Settings/GetPayrollSetting/${this.compnayDetail.CompanyId}`).then(res => {
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
  }

  prefixDays() {
    let presentMonthDays = 31;
    this.days = [];

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
        text: `${i}${prefix}`
      });
      i++;
    }
  }

  get f() {
    return this.payrollForm.controls;
  }

  initForm() {
    this.payrollForm = this.fb.group({
      CompanyId: new FormControl(this.payRoll.CompanyId),
      PayrollCycleSettingId: new FormControl(this.payRoll.PayrollCycleSettingId),
      PayFrequency: new FormControl(this.payRoll.PayFrequency, [Validators.required]),
      PayCycleMonth: new FormControl(this.payRoll.PayCycleMonth),
      OrganizationId: new FormControl(this.payRoll.OrganizationId),
      PayCycleDayOfMonth: new FormControl(this.payRoll.PayCycleDayOfMonth),
      PayCalculationId: new FormControl (this.payRoll.PayCalculationId),
      IsExcludeWeeklyOffs: new FormControl (this.payRoll.IsExcludeWeeklyOffs ? 'true': 'false'),
      IsExcludeHolidays: new FormControl (this.payRoll.IsExcludeHolidays ? 'true': 'false')
    })
  };

  savePayRollSetting() {
    this.submitted = true;
    let value:PayRoll = this.payrollForm.value;
    if (this.payrollForm.invalid) {
    $('#saveConfirmationModal').modal('hide');
      return;
    }
    if (value) {
      this.http.post('Settings/InsertUpdatePayrollSetting', value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Submitted Successfully.")
        }
        this.submitted = false;
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
