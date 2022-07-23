import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Attendance, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;
import 'bootstrap'
import { AjaxService } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';

@Component({
  selector: 'app-manage-leaveplan',
  templateUrl: './manage-leaveplan.component.html',
  styleUrls: ['./manage-leaveplan.component.scss']
})
export class ManageLeaveplanComponent implements OnInit, AfterViewChecked {
  cachedData: any = null;
  configPageNo: number = 1;
  isPageReady: boolean = false;
  leaveDetailForm: FormGroup;
  leaveDetail: LeaveDetail = new LeaveDetail();
  leaveAccrualForm: FormGroup;
  leaveRestrictionForm: FormGroup;
  applyForLeaveForm: FormGroup;
  holidayWeekendOffForm: FormGroup;
  leaveApprovalForm: FormGroup;
  yearEndProcessForm: FormGroup;
  leaveAccrual: LeaveAccrual = new LeaveAccrual();
  appplyingForLeave: ApplyingForLeave = new ApplyingForLeave();
  leaveRestriction: LeaveRestriction = new LeaveRestriction();
  holidayWeekOffs: HolidayWeekOffs = new HolidayWeekOffs();
  yearEndProcess: YearEndProcess = new YearEndProcess();
  leaveApproval: LeaveApproval = new LeaveApproval();
  submit: boolean = false;
  isLoading: boolean = false;
  LeavePlanId: number = 0;
  isDataLoaded: boolean = false;

  constructor(private nav: iNavigation,
              private fb: FormBuilder,
              private http: AjaxService) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    $('[data-bs-toggle="tooltip"]').on('mouseleave', function() {
      $(this).tooltip('dispose');
    });
    $('[data-bs-toggle="tooltip"]').on('click', function() {
      $(this).tooltip('dispose');
    });
  }

  loadPlanDetail() {
    this.http.get(`leave/GetLeaveTypeDetailByPlan/${this.LeavePlanId}`).then(response => {
      if(response.ResponseBody) {
        this.initLeaveDetail();
        this.initLeaveAccrual();
        this.initApplyForLeave();
        this.initLeaveRestriction();
        this.initholidayWeekendOff();
        this.initleaveApproval();
        this.inityearEndProcess();

        Toast("Data loaded successfully")
        this.isDataLoaded = true;
      } else {
        ErrorToast("Unable to lead plan detail. Please contact to admin.");
      }
    });
  }

  ngOnInit(): void {
    let id = this.nav.getValue();
    if(id != null && !isNaN(Number(id))) {
      this.LeavePlanId = Number(id);
      this.loadPlanDetail();
    } else {
      ErrorToast("Invlaid plan selected please select again.");
      return;
    }

  }

  initLeaveDetail() {
    this.leaveDetailForm = this.fb.group({
      IsLeaveDaysLimit: new FormControl(this.leaveDetail.IsLeaveDaysLimit? 'true':'false'),
      LeaveLimit: new FormControl(this.leaveDetail.LeaveLimit),
      CanApplyExtraLeave: new FormControl(this.leaveDetail.CanApplyExtraLeave? 'true':'false'),
      ExtraLeaveLimit: new FormControl(this.leaveDetail.ExtraLeaveLimit),
      IsNoLeaveAfterDate: new FormControl(this.leaveDetail.IsNoLeaveAfterDate),
      LeaveNotAllocatedIfJoinAfter: new FormControl(this.leaveDetail.LeaveNotAllocatedIfJoinAfter),
      CanManagerAwardCausalLeave: new FormControl(this.leaveDetail.CanManagerAwardCausalLeave? 'true':'false'),
      CanCompoffAllocatedAutomatically: new FormControl(this.leaveDetail.CanCompoffAllocatedAutomatically? 'true':'false'),
      CanCompoffCreditedByManager: new FormControl(this.leaveDetail.CanCompoffCreditedByManager? 'true':'false')
    })
  }

  submitLeaveQuota() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveDetailForm.value;
    if (value && errorCounter == 0) {
      this.http.post(`Leave/AddUpdateLeaveQuota/${this.LeavePlanId}`, value).then((res:ResponseModel) => {
        if (res.ResponseBody)
          Toast("Leave Quota updated successfully.")
      })
      this.configPageNo = this.configPageNo + 1;
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
  }


  noLeaveDetailAllow(e: any) {
    let value = e.target.checked;
    if (value == false)
      document.querySelector('input[name="LeaveNotAllocatedIfJoinAfter"]').setAttribute('readonly', '');
    else
      document.querySelector('input[name="LeaveNotAllocatedIfJoinAfter"]').removeAttribute('readonly');
  }

  LeaveBalanceCalculated(e: any) {
    let value = e.target.value;
    if (value) {
      if (value == 'true')
        document.querySelector('div[name="LeaveBalanceCalculated"]').classList.add('d-none');
      else
        document.querySelector('div[name="LeaveBalanceCalculated"]').classList.remove('d-none');
    }
  }

  empJoinMiddle(e: any) {
    let value = e.target.value;
    let elem = document.querySelectorAll('div[name="EmpJoinMiddle"]');
    if (value) {
      if (value == 'true') {
        for (let i = 0; i < elem.length; i++) {
          elem[i].classList.add('d-none');
        }
      }
      else {
        for (let i = 0; i < elem.length; i++) {
          elem[i].classList.remove('d-none');
        }
      }
    }
  }

  EmpExitMiddle(e: any) {
    let value = e.target.value;
    let elem = document.querySelectorAll('div[name="EmpExitMiddle"]');
    if (value) {
      if (value == '2') {
        for (let i = 0; i < elem.length; i++) {
          elem[i].classList.remove('d-none');
        }
      }
      else {
        for (let i = 0; i < elem.length; i++) {
          elem[i].classList.add('d-none');
        }
      }
    }
  }

  AccrualLevelVary(e: any) {
    let value = e.target.value;
    if (value) {
      if (value == 'true')
        document.querySelector('div[name="AccrualLevelVary"]').classList.add('d-none');
      else
        document.querySelector('div[name="AccrualLevelVary"]').classList.remove('d-none');
    }
  }

  AccrualStart(e: any) {
    let value = e.target.value;
    if (value) {
      // if (value == 'true')
      //   document.querySelector('input[name="noLeaveQuotaAllow"]').setAttribute('readonly', '');
      // else
      //   document.querySelector('input[name="noLeaveQuotaAllow"]').removeAttribute('readonly');
    }
  }

  accrualRateBasedon(e: any) {
    let value = e.target.value;
    if (value) {
      switch (value) {
        case '2':
          document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'day of the Quarter'
          break;
        case '3':
          document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'day of the Half Year'
          break;
      }
    }
  }

  findDay(e: any) {
    let value = Number(e.target.value);
    if (value != 0) {
      let text = document.getElementsByName("AccrualRateBasedon")[0].innerHTML;
      if (value == 1 || value == 21 || value == 31)
        document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'st' +' '+ text;
      else if (value == 2 || value == 22)
        document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'nd' +' '+ text;
      else if (value == 3 || value == 23)
        document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'rd' +' '+ text;
      else if ((value > 3 && value < 21) || (value > 24 && value < 31))
        document.getElementsByName("AccrualRateBasedon")[0].innerHTML = 'th' +' '+ text;
    }
  }

  beyondAnnualQuota(e: any) {
    let value = e.target.value;
    if (value == 'true')
      document.getElementsByName('BeyondAnnualQuota')[0].removeAttribute('readonly');
    else
      document.getElementsByName('BeyondAnnualQuota')[0].setAttribute('readonly', '');
  }

  quotaLimit(e: any) {
    let value = e.target.value;
    if (value == 'true')
      document.getElementsByName('LeaveLimit')[0].removeAttribute('readonly');
    else
      document.getElementsByName('LeaveLimit')[0].setAttribute('readonly', '');
  }

  initLeaveAccrual() {
    this.leaveAccrualForm = this.fb.group({
      IsLeaveBalanceCalculated: new FormControl (this.leaveAccrual.IsLeaveBalanceCalculated),
      AccrualRateBasedon: new FormControl(this.leaveAccrual.AccrualRateBasedon),
      AccrualAnnualQuota: new FormControl(this.leaveAccrual.AccrualAnnualQuota),
      IsEmpJoinMiddle: new FormControl(this.leaveAccrual.IsEmpJoinMiddle),
      IsEmpExitMiddle: new FormControl(this.leaveAccrual.IsEmpExitMiddle),
      LeaveCreditBWJoiningDate: new FormArray([this.createFormBWJoiningDate()]),
      LeaveCreditBWExitDate: new FormArray([this.createFormBWExitDate()]),
      IsAccrualLevelVary: new FormControl(this.leaveAccrual.IsAccrualLevelVary),
      IsAccrualStart: new FormControl(this.leaveAccrual.IsAccrualStart),
      DaysAfterJoining: new FormControl(this.leaveAccrual.DaysAfterJoining),
      DaysAfterProbEnd: new FormControl(this.leaveAccrual.DaysAfterProbEnd),
      AccrualRateOnExp: new FormArray([this.createAccruralRateOnExp()]),
      IsLeaveAccrualImpacted: new FormControl(this.leaveAccrual.IsLeaveAccrualImpacted),
      WeeklyOffAsAbsent: new FormControl(this.leaveAccrual.WeeklyOffAsAbsent),
      HolidayOffAsAbsent: new FormControl(this.leaveAccrual.HolidayOffAsAbsent),
      IsLeaveforFutureDate: new FormControl(this.leaveAccrual.IsLeaveforFutureDate),
      IsLeaveBeyondBalance: new FormControl(this.leaveAccrual.IsLeaveBeyondBalance),
      LeaveBalanceLessThan: new FormControl(this.leaveAccrual.LeaveBalanceLessThan),
      EmpGoBeyondAccrueBal: new FormControl(this.leaveAccrual.EmpGoBeyondAccrueBal),
      IsAccrueLeaveTotalBal: new FormControl(this.leaveAccrual.IsAccrueLeaveEmpOnLeave),
      IsAccrueLeaveEmpOnLeave: new FormControl(this.leaveAccrual.IsAccrueLeaveEmpOnLeave),
      DaysInPrevMnth: new FormControl(this.leaveAccrual.DaysInPrevMnth),
      IsLeaveBalanceRounded: new FormControl(this.leaveAccrual.IsLeaveBalanceRounded),
      IsLeaveCredit: new FormControl(this.leaveAccrual.IsLeaveCredit),
      LeaveExpAfter: new FormControl(this.leaveAccrual.LeaveExpAfter)
    })
  }

  createAccruralRateOnExp(): FormGroup {
    return this.fb.group({
      YearOfJoining: new FormControl(),
      AccureDayMonth: new FormControl(),
      AccureDayYear: new FormControl()
    })
  }

  addAccruralRateOnExp() {
    let item = this.leaveAccrualForm.get('AccrualRateOnExp') as FormArray;
    item.push(this.createAccruralRateOnExp());
  }

  removeAccruralRateOnExp(i: number) {
    let item = this.leaveAccrualForm.get('AccrualRateOnExp') as FormArray;
    item.removeAt(i);
  }

  createFormBWJoiningDate(): FormGroup {
    return this.fb.group({
      FromJoiningDate: new FormControl(''),
      ToJoiningDate: new FormControl(''),
      AllocatedLeave: new FormControl('')
    });
  }

  get formBWJoiningDate() {
    return this.leaveAccrualForm.get('LeaveCreditBWJoiningDate') as FormArray;
  }

  addFormBWJoiningDate() {
    let item = this.leaveAccrualForm.get('LeaveCreditBWJoiningDate') as FormArray;
    item.push(this.createFormBWJoiningDate());
    let elem = document.querySelectorAll('div[name="EmpJoinMiddle"]');
    for (let i = 0; i < elem.length; i++) {
      elem[i].classList.remove('d-none');
    }
  }

  removeFormBWJoiningDate(i: number) {
    let item = this.leaveAccrualForm.get('LeaveCreditBWJoiningDate') as FormArray;
    item.removeAt(i);
    if (item.length === 0)
      this.addFormBWJoiningDate();
  }

  createFormBWExitDate(): FormGroup {
    return this.fb.group({
      FromExitDate: new FormControl(),
      ToExitDate: new FormControl(),
      LeaveDays: new FormControl()
    })
  }

  addFormBWExitDate() {
    let item = this.leaveAccrualForm.get('LeaveCreditBWExitDate') as FormArray;
    item.push(this.createFormBWExitDate());
    let elem = document.querySelectorAll('div[name="EmpExitMiddle"]');
    for (let i = 0; i < elem.length; i++) {
      elem[i].classList.remove('d-none');
    }
  }

  removeFormBWExitDate(i: number) {
    let item = this.leaveAccrualForm.get('LeaveCreditBWExitDate') as FormArray;
    item.removeAt(i);
  }

  initApplyForLeave() {
    this.applyForLeaveForm = this.fb.group({
      IsApplyHalfDay: new FormControl(this.appplyingForLeave.IsApplyHalfDay),
      IsEmpSeeLeave: new FormControl(this.appplyingForLeave.IsEmpSeeLeave),
      LeaveCredit: new FormArray([this.createLeaveCredit()]),
      IsEmpApplyLeave: new FormControl(this.appplyingForLeave.IsEmpApplyLeave),
      BeforeDays: new FormControl(this.appplyingForLeave.BeforeDays),
      IsEmpApplyPastDay: new FormControl(this.appplyingForLeave.IsEmpApplyPastDay),
      NoOfPastDay: new FormControl(this.appplyingForLeave.NoOfPastDay),
      NotApplyPastDay: new FormControl(this.appplyingForLeave.NotApplyPastDay),
      NotApplyPastDayAfter: new FormControl(this.appplyingForLeave.NotApplyPastDayAfter),
      IsCommentRequired: new FormControl(this.appplyingForLeave.IsCommentRequired),
      IsDocumentRequired: new FormControl(this.appplyingForLeave.IsDocumentRequired),
      IsReqdDocforLeave: new FormControl(this.appplyingForLeave.IsReqdDocforLeave),
      ReqdDocforLeaveAfter: new FormControl(this.appplyingForLeave.ReqdDocforLeaveAfter)
    })
  }

  createLeaveCredit(): FormGroup {
    return this.fb.group({
      DurationMoreThan: new FormControl(),
      NeedDays: new FormControl(),
      AtLeastWOrkingDays: new FormControl()
    })
  }

  addLeaveCredit() {
    let item = this.applyForLeaveForm.get('LeaveCredit') as FormArray;
    item.push(this.createLeaveCredit());
  }

  removeLeaveCredit(i: number) {
    let item = this.applyForLeaveForm.get('LeaveCredit') as FormArray;
    item.removeAt(i)
  }

  initLeaveRestriction() {
    this.leaveRestrictionForm = this.fb.group({
      IsNewJoineeApply: new FormControl(this.leaveRestriction.IsNewJoineeApply),
      AfterProbationEnd: new FormControl(this.leaveRestriction.AfterProbationEnd),
      AfterJoining: new FormControl(this.leaveRestriction.AfterJoining),
      IsLimitforConsecutiveDay: new FormControl(this.leaveRestriction.IsLimitforConsecutiveDay),
      LeaveDurationProbation: new FormControl(this.leaveRestriction.LeaveDurationProbation),
      IsLeaveDurationProbation: new FormControl(this.leaveRestriction.IsLeaveDurationProbation),
      ConsecutiveLeaveDay: new FormControl(this.leaveRestriction.ConsecutiveLeaveDay),
      IsMaxLeaveAvailed: new FormControl(this.leaveRestriction.IsMaxLeaveAvailed),
      ExtendsActualLeaveDays: new FormControl(this.leaveRestriction.ExtendsActualLeaveDays),
      IsManagerOverrideLeave: new FormControl(this.leaveRestriction.IsManagerOverrideLeave),
      IsEnforceMinGap: new FormControl(this.leaveRestriction.IsEnforceMinGap),
      EnforecMinGapDays: new FormControl(this.leaveRestriction.EnforecMinGapDays),
      IsAllowinLeaveCalendarYear: new FormControl(this.leaveRestriction.IsAllowinLeaveCalendarYear),
      AllowDaysinLeaveCalendarYear: new FormControl(this.leaveRestriction.AllowDaysinLeaveCalendarYear),
      IsAllowinLeaveCalendarMonth: new FormControl(this.leaveRestriction.IsAllowinLeaveCalendarMonth),
      AllowDaysinLeaveCalendarMonth: new FormControl(this.leaveRestriction.AllowDaysinLeaveCalendarMonth),
      IsAllowinLeaveEntireTenure: new FormControl(this.leaveRestriction.IsAllowinLeaveEntireTenure),
      AllowDaysinLeaveEntireTenure: new FormControl(this.leaveRestriction.AllowDaysinLeaveEntireTenure),
      IsAllowLeavesInSingleInstance: new FormControl(this.leaveRestriction.IsAllowLeavesInSingleInstance),
      AllowDaysLeavesInSingleInstance: new FormControl(this.leaveRestriction.AllowDaysLeavesInSingleInstance),
      LeaveBalanceQualOrGreater: new FormControl(this.leaveRestriction.LeaveBalanceQualOrGreater),
      IsRestrictEmpForLeave: new FormControl(this.leaveRestriction.IsRestrictEmpForLeave),
      RestrictLeaveInEveryMonth: new FormControl(this.leaveRestriction.RestrictLeaveInEveryMonth),
      IsLeaveTakenWith: new FormControl(this.leaveRestriction.IsLeaveTakenWith),
      LeaveTakenWith: new FormControl(this.leaveRestriction.LeaveTakenWith),
      IsLeaveAvailBalanceIn: new FormControl(this.leaveRestriction.IsLeaveAvailBalanceIn),
      LeaveAvailBalanceIn: new FormControl(this.leaveRestriction.LeaveAvailBalanceIn)
    })
  }

  initholidayWeekendOff() {
    this.holidayWeekendOffForm = this.fb.group({
      IsHolidayAdjoining: new FormControl(this.holidayWeekOffs.IsHolidayAdjoining),
      HolidayAdjoiningTotalLeave: new FormControl(this.holidayWeekOffs.HolidayAdjoiningTotalLeave),
      HolidayAdjoiningOn: new FormControl(this.holidayWeekOffs.HolidayAdjoiningOn),
      IsHolidayAccomLeave: new FormControl(this.holidayWeekOffs.IsHolidayAccomLeave),
      IsWeekoffDayAdjoining: new FormControl(this.holidayWeekOffs.IsWeekoffDayAdjoining),
      WeekoffDayAdjoiningTotalLeave: new FormControl(this.holidayWeekOffs.WeekoffDayAdjoiningTotalLeave),
      WeekoffDayAdjoiningOn: new FormControl(this.holidayWeekOffs.WeekoffDayAdjoiningOn),
      IsWeekOffAccomLeave: new FormControl(this.holidayWeekOffs.IsWeekOffAccomLeave),
      IsHolidayAccomLeaveHalfday: new FormControl(this.holidayWeekOffs.IsHolidayAccomLeaveHalfday),
      IsWeekOffAccomLeaveHalfday: new FormControl(this.holidayWeekOffs.IsWeekOffAccomLeaveHalfday),
      IsClubSandwich: new FormControl(this.holidayWeekOffs.IsClubSandwich)
    })
  }

  initleaveApproval() {
    this.leaveApprovalForm = this.fb.group({
      IsRequiredApproval: new FormControl(this.leaveApproval.IsRequiredApproval)
    })
  }

  inityearEndProcess() {
    this.yearEndProcessForm = this.fb.group({
      IsLeaveBalanceAtEnd: new FormControl(this.yearEndProcess.IsLeaveBalanceAtEnd),
      LeaveForPaymentBasedOn: new FormControl(this.yearEndProcess.LeaveForPaymentBasedOn),
      BalanceMoreThan: new FormControl(this.yearEndProcess.BalanceMoreThan),
      Pay: new FormControl(this.yearEndProcess.Pay),
      PercentRemainingDay: new FormControl(this.yearEndProcess.PercentRemainingDay),
      IsRestrictMaxDays: new FormControl(this.yearEndProcess.IsRestrictMaxDays),
      RestrictMaxDays: new FormControl(this.yearEndProcess.RestrictMaxDays),
      IsRestrictMaxCarryForward: new FormControl(this.yearEndProcess.IsRestrictMaxCarryForward),
      RestrictMaxCarryForwardDays: new FormControl(this.yearEndProcess.RestrictMaxCarryForwardDays),
      LeaveBalanceMoreThan: new FormControl(this.yearEndProcess.LeaveBalanceMoreThan),
      PayUptoDays: new FormControl(this.yearEndProcess.PayUptoDays),
      CarryForwardDaysUpto: new FormControl(this.yearEndProcess.CarryForwardDaysUpto),
      IsLeaveExpire: new FormControl(this.yearEndProcess.IsLeaveExpire),
      ExpireLeaveCarryForward: new FormControl(this.yearEndProcess.ExpireLeaveCarryForward),
      IsNegativeLeaveQuota: new FormControl(this.yearEndProcess.IsNegativeLeaveQuota),
      IsExpiraySettingUnchanged: new FormControl(this.yearEndProcess.IsExpiraySettingUnchanged)
    })
  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
        this.nav.navigate(Attendance, this.cachedData);
      break;
      case "timesheet-tab":
        this.nav.navigate(Timesheet, this.cachedData);
      break;
      case "leave-tab":
      break;
    }
  }

  // prevConfigPage() {
  //   this.configPageNo = this.configPageNo - 1;
  //   let tab = document.getElementById('leaveConfigModal');
  //   let elem = tab.querySelectorAll('div[name="tab-index"]');
  //     for (let i = 0; i < elem.length; i++) {
  //       elem[i].classList.remove('active-index');
  //     };
  //     tab.querySelector(`div[index='${this.configPageNo}']`).classList.add('active-index');
  //     tab.querySelector(`div[index='${this.configPageNo}']`).classList.remove('submitted-index');
  //     tab.querySelector(`div[index='${this.configPageNo + 1}']`).classList.remove('submitted-index');
  // }

  ConfigPageTab(index: number) {
    if (index > 0 && index <= 7) {
      this.configPageNo = index;
      let tab = document.getElementById('leaveConfigModal');
      let elem = tab.querySelectorAll('div[name="tab-index"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-index');
      };
      tab.querySelector(`div[index='${this.configPageNo}']`).classList.add('active-index');
      // if (this.configPageNo > 1)
      //   tab.querySelector(`div[index='${this.configPageNo - 1}']`).classList.add('submitted-index');
    }
  }

}

class LeaveDetail {
  LeaveDetailId: number = 0;
  LeavePlanId: number = 0;
  IsLeaveDaysLimit: boolean = false;
  LeaveLimit: number = 0;
  CanApplyExtraLeave: boolean = false;
  ExtraLeaveLimit: number = 0;
  LeaveNotAllocatedIfJoinAfter: number = 0;
  IsNoLeaveAfterDate: boolean = false;
  CanManagerAwardCausalLeave: boolean = false;
  CanCompoffAllocatedAutomatically: boolean = false;
  CanCompoffCreditedByManager: boolean = false;
}

class LeaveAccrual {
  IsLeaveBalanceCalculated: boolean = true;
  AccrualRateBasedon: number = 1;
  AccrualAnnualQuota:number = 0;
  IsEmpJoinMiddle: boolean = true;
  IsEmpExitMiddle:boolean = true;
  FromJoiningDate: number = null
  ToJoiningDate:number = null;
  AllocatedLeave: number = null;
  FromExitDate: number = null;
  ToExitDate: number = null;
  LeaveDays: number = null;
  IsAccrualLevelVary: boolean = true;
  IsAccrualStart: boolean = true;
  DaysAfterJoining: number = 0;
  DaysAfterProbEnd: number = 0;
  YearOfJoining: number = null;
  AccureDayMonth: number = null;
  AccureDayYear: number = null;
  IsLeaveAccrualImpacted: boolean = false;
  WeeklyOffAsAbsent: number = 0;
  HolidayOffAsAbsent: number = 0;
  IsLeaveforFutureDate: boolean = false;
  IsLeaveBeyondBalance: boolean = true;
  LeaveBalanceLessThan: number = 0;
  EmpGoBeyondAccrueBal: number = 0;
  IsAccrueLeaveTotalBal: boolean = false;
  IsAccrueLeaveEmpOnLeave: boolean = false;
  DaysInPrevMnth:number = 0;
  IsLeaveBalanceRounded: number = 1;
  IsLeaveCredit: boolean = false;
  LeaveExpAfter: number = 0;
}

class ApplyingForLeave {
  IsApplyHalfDay: boolean = false;
  IsEmpSeeLeave: boolean = true;
  DurationMoreThan: number = null;
  NeedDays: number = null;
  AtLeastWOrkingDays: number = null;
  IsEmpApplyLeave: boolean = false;
  BeforeDays: number = 0;
  IsEmpApplyPastDay: boolean = false;
  NoOfPastDay: number = 0;
  NotApplyPastDay: boolean = false;
  NotApplyPastDayAfter: number = 0;
  IsCommentRequired: boolean = false;
  IsDocumentRequired: boolean = false;
  IsReqdDocforLeave: boolean = false;
  ReqdDocforLeaveAfter: number = 0;
}

class LeaveRestriction {
  IsNewJoineeApply: boolean = true;
  AfterProbationEnd: number =0;
  AfterJoining: number =0;
  IsLimitforConsecutiveDay: boolean = false;
  LeaveDurationProbation: number = 0;
  IsLeaveDurationProbation: boolean = false;
  ConsecutiveLeaveDay: number = 0;
  IsMaxLeaveAvailed: boolean = false;
  ExtendsActualLeaveDays:number = 0;
  IsManagerOverrideLeave: boolean = false;
  IsEnforceMinGap: boolean = false;
  EnforecMinGapDays: number = 0;
  IsAllowinLeaveCalendarYear: boolean = false;
  AllowDaysinLeaveCalendarYear: number = 0;
  IsAllowinLeaveCalendarMonth: boolean = false;
  AllowDaysinLeaveCalendarMonth: number = 0;
  IsAllowinLeaveEntireTenure: boolean = false;
  AllowDaysinLeaveEntireTenure: number = 0;
  IsAllowLeavesInSingleInstance: boolean = false;
  AllowDaysLeavesInSingleInstance: number = 0;
  LeaveBalanceQualOrGreater: number = 0;
  IsRestrictEmpForLeave: boolean = false;
  RestrictLeaveInEveryMonth: number = 0;
  IsLeaveTakenWith: boolean = false;
  LeaveTakenWith: number = 0;
  IsLeaveAvailBalanceIn: boolean = false;
  LeaveAvailBalanceIn: number = 0;
}

class HolidayWeekOffs {
  IsHolidayAdjoining: boolean = false;
  HolidayAdjoiningTotalLeave: number = 0;
  HolidayAdjoiningOn: number = 0;
  IsHolidayAccomLeave: number = 0;
  IsWeekoffDayAdjoining: boolean = false;
  WeekoffDayAdjoiningTotalLeave: number = 0;
  WeekoffDayAdjoiningOn: number = 0;
  IsWeekOffAccomLeave: number = 0;
  IsHolidayAccomLeaveHalfday: boolean= false;
  IsClubSandwich: boolean = false;
  IsWeekOffAccomLeaveHalfday: boolean = false;
}

class LeaveApproval {
  IsRequiredApproval: boolean = false;
}

class YearEndProcess {
  IsLeaveBalanceAtEnd: number = 1;
  LeaveForPaymentBasedOn: number = 0;
  BalanceMoreThan: number = 0;
  Pay: number = 0;
  PercentRemainingDay: number = 0;
  IsRestrictMaxDays: boolean = false;
  RestrictMaxDays: number = 0;
  IsRestrictMaxCarryForward: boolean = false;
  RestrictMaxCarryForwardDays: number = 0;
  LeaveBalanceMoreThan: number = 0;
  PayUptoDays: number = 0;
  CarryForwardDaysUpto: number = 0;
  IsLeaveExpire: boolean = false;
  ExpireLeaveCarryForward: number = 0;
  IsNegativeLeaveQuota: boolean = false;
  IsExpiraySettingUnchanged: boolean = false;
}
