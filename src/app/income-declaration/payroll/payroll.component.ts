import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
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
  'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  payDay: Array<any> = [];
  payPeriodMonth: string = null;
  payPeriodDate: string = null;
  isReady: boolean = false;
  compnayDetail: any = null;
  submitted: boolean = false;
  isPageReady: boolean = true;
  isLoading: boolean = false;
  agreeAction: boolean = false;

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
      this.loadPayrollSetting();
    } else {
      this.initForm();
      ErrorToast("Getter some internal issue. Please login again or contact to admin.");
    }
  }

  loadPayrollSetting() {
    this.isPageReady = false;
    this.http.get(`Settings/GetPayrollSetting/${this.compnayDetail.CompanyId}`).then(res => {
      if(res.ResponseBody) {
        this.payRoll = res.ResponseBody;
        this.initForm();
        this.isPageReady = true;
        Toast("Payroll detail fetched successfully.");
      } else {
        this.isPageReady = true;
        this.payRoll.CompanyId = this.compnayDetail.CompanyId;
        this.initForm();
        WarningToast("No data available. Please add payroll detail.");
      }
      this.isReady = true;
    }).catch(e => {
      this.isReady = true;
      this.isPageReady = true;
    });
  }

  agreeActionPayroll(e: any) {
    if (e.target.checked)
      this.agreeAction = true;
    else
      this.agreeAction = false;
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
      PayCycleMonth: new FormControl(this.payRoll.PayCycleMonth, [Validators.required]),
      OrganizationId: new FormControl(this.payRoll.OrganizationId),
      PayCycleDayOfMonth: new FormControl(this.payRoll.PayCycleDayOfMonth, [Validators.required]),
      PayCalculationId: new FormControl (this.payRoll.PayCalculationId, [Validators.required]),
      IsExcludeWeeklyOffs: new FormControl (this.payRoll.IsExcludeWeeklyOffs ? 'true': 'false'),
      IsExcludeHolidays: new FormControl (this.payRoll.IsExcludeHolidays ? 'true': 'false')
    })
  };

  savePayRollSetting() {
    this.submitted = true;
    this.isLoading = true;
    let value:PayRoll = this.payrollForm.value;
    let errorCounter = 0;
    if (this.payrollForm.get('PayFrequency').errors !== null)
      errorCounter++;
    if (this.payrollForm.get('PayCycleMonth').errors !== null)
      errorCounter++;
    if (this.payrollForm.get('PayCalculationId').errors !== null)
      errorCounter++;
    if (this.payrollForm.get('PayCycleDayOfMonth').errors !== null)
      errorCounter++;
    if (value && errorCounter === 0) {
      this.http.post('Settings/InsertUpdatePayrollSetting', value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Submitted Successfully.")
        }
        this.submitted = false;
        this.isLoading = false;
        $('#saveConfirmationModal').modal('hide');
      }).catch(e => {
        this.isLoading = false;
      })
    }
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


