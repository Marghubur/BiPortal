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
  configPageNo: number = 2;
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
        if (res.ResponseBody) {
          Toast("Leave Quota updated successfully.")
          this.configPageNo = this.configPageNo + 1;
        }
      })
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
      LeaveCreditBWJoiningDate: new FormArray([this.createFormBWJoiningDate()]),
      LeaveCreditBWExitDate: new FormArray([this.createFormBWExitDate()]),
      AccrualRateOnExp: new FormArray([this.createAccruralRateOnExp()]),
      LeaveAccrualId: new FormControl(this.leaveAccrual.LeaveAccrualId),
      LeavePlanId: new FormControl(this.leaveAccrual.LeavePlanId),
      CanApplyEntireLeave: new FormControl(this.leaveAccrual.CanApplyEntireLeave),
      IsLeaveAccruedPatternAvail: new FormControl(this.leaveAccrual.IsLeaveAccruedPatternAvail),
      LeaveDistributionSequence: new FormControl(this.leaveAccrual.LeaveDistributionSequence),
      LeaveDistributionAppliedFrom: new FormControl(this.leaveAccrual.LeaveDistributionAppliedFrom),
      IsAllowLeavesForJoinigMonth: new FormControl(this.leaveAccrual.IsAllowLeavesForJoinigMonth),
      IsAllowLeavesProbationPeriod: new FormControl(this.leaveAccrual.IsAllowLeavesProbationPeriod),
      BreakMonthLeaveAllocationId: new FormControl(this.leaveAccrual.BreakMonthLeaveAllocationId),
      IsNoLeaveOnProbationPeriod: new FormControl(this.leaveAccrual.IsNoLeaveOnProbationPeriod),
      IsVaryOnProbationOrExprience: new FormControl(this.leaveAccrual.IsVaryOnProbationOrExprience),
      IsImpactedOnWorkDaysEveryMonth: new FormControl(this.leaveAccrual.IsImpactedOnWorkDaysEveryMonth),
      WeekOffAsAbsentIfAttendaceLessThen: new FormControl(this.leaveAccrual.WeekOffAsAbsentIfAttendaceLessThen),
      HolidayAsAbsentIfAttendaceLessThen: new FormControl(this.leaveAccrual.HolidayAsAbsentIfAttendaceLessThen),
      CanApplyForFutureDate: new FormControl(this.leaveAccrual.CanApplyForFutureDate),
      ExtraLeaveBeyondAccruedBalance: new FormControl(this.leaveAccrual.ExtraLeaveBeyondAccruedBalance),
      NoOfDaysForExtraLeave: new FormControl(this.leaveAccrual.NoOfDaysForExtraLeave),
      AllowOnlyIfAccrueBalanceIsAlleast: new FormControl(this.leaveAccrual.AllowOnlyIfAccrueBalanceIsAlleast),
      NotAllowIfAlreadyOnLeaveMoreThan: new FormControl(this.leaveAccrual.NotAllowIfAlreadyOnLeaveMoreThan),
      RoundOffLeaveBalance: new FormControl(this.leaveAccrual.RoundOffLeaveBalance),
      ToNearestHalfDay: new FormControl(this.leaveAccrual.ToNearestHalfDay),
      ToNearestFullDay: new FormControl(this.leaveAccrual.ToNearestFullDay),
      ToNextAvailableHalfDay: new FormControl(this.leaveAccrual.ToNextAvailableHalfDay),
      ToNextAvailableFullDay: new FormControl(this.leaveAccrual.ToNextAvailableFullDay),
      ToPreviousHalfDay: new FormControl(this.leaveAccrual.ToPreviousHalfDay),
      DoesLeaveExpireAfterSomeTime: new FormControl(this.leaveAccrual.DoesLeaveExpireAfterSomeTime),
      AfterHowManyDays: new FormControl(this.leaveAccrual.AfterHowManyDays)
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
      LeaveApplyDetailId: new FormControl(this.appplyingForLeave.LeaveApplyDetailId),
      LeavePlanId: new FormControl(this.appplyingForLeave.LeavePlanId),
      IsAllowForHalfDay: new FormControl(this.appplyingForLeave.IsAllowForHalfDay),
      EmployeeCanSeeAndApplyCurrentPlanLeave: new FormControl(this.appplyingForLeave.EmployeeCanSeeAndApplyCurrentPlanLeave),
      ApplyPriorBeforeLeaveDate: new FormControl(this.appplyingForLeave.ApplyPriorBeforeLeaveDate),
      BackDateLeaveApplyNotBeyondDays: new FormControl(this.appplyingForLeave.BackDateLeaveApplyNotBeyondDays),
      RestrictBackDateLeaveApplyAfter: new FormControl(this.appplyingForLeave.RestrictBackDateLeaveApplyAfter),
      CurrentLeaveRequiredComments: new FormControl(this.appplyingForLeave.CurrentLeaveRequiredComments),
      ProofRequiredIfDaysExceeds: new FormControl(this.appplyingForLeave.ProofRequiredIfDaysExceeds),
      NoOfDaysExceeded: new FormControl(this.appplyingForLeave.NoOfDaysExceeded),
      LeaveCredit: new FormArray([this.createLeaveCredit()])
    })
  }

  createLeaveCredit(): FormGroup {
    return this.fb.group({
      RemaningCalendarDayInNotice: new FormControl(this.appplyingForLeave.RemaningCalendarDayInNotice),
      RequiredCalendarDaysForLeaveApply: new FormControl(this.appplyingForLeave.RequiredCalendarDaysForLeaveApply),
      RemaningWorkingDaysInNotice: new FormControl(this.appplyingForLeave.RemaningWorkingDaysInNotice)
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
      LeavePlanRestrictionId: new FormControl(this.leaveRestriction.LeavePlanRestrictionId),
      LeavePlanId: new FormControl(this.leaveRestriction.LeavePlanId),
      NewJoineeCanApplyLeave: new FormControl(this.leaveRestriction.NewJoineeCanApplyLeave),
      DaysAfterInProbation: new FormControl(this.leaveRestriction.DaysAfterInProbation),
      DaysAfterJoining: new FormControl(this.leaveRestriction.DaysAfterJoining),
      LimitDaysLeaveInProbation: new FormControl(this.leaveRestriction.LimitDaysLeaveInProbation),
      IsConsecutiveLeaveLimit: new FormControl(this.leaveRestriction.IsConsecutiveLeaveLimit),
      ConsecutiveDaysLimit: new FormControl(this.leaveRestriction.ConsecutiveDaysLimit),
      IsLeaveInNoticeExtendsNoticePeriod: new FormControl(this.leaveRestriction.IsLeaveInNoticeExtendsNoticePeriod),
      NoOfTimesNoticePeriodExtended: new FormControl(this.leaveRestriction.NoOfTimesNoticePeriodExtended),
      CanManageOverrideLeaveRestriction: new FormControl(this.leaveRestriction.CanManageOverrideLeaveRestriction),
      GapBetweenTwoConsicutiveLeaveDates: new FormControl(this.leaveRestriction.GapBetweenTwoConsicutiveLeaveDates),
      LimitOfMaximumLeavesInCalendarMonth: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInCalendarMonth),
      LimitOfMaximumLeavesInCalendarYear: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInCalendarYear),
      LimitOfMaximumLeavesInEntireTenure: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInEntireTenure),
      IsLeaveRestrictionForEachMonth: new FormControl(this.leaveRestriction.IsLeaveRestrictionForEachMonth),
      RestrictFromDayOfMonth: new FormControl(this.leaveRestriction.RestrictFromDayOfMonth),
      RestrictToDayOfMonth: new FormControl(this.leaveRestriction.RestrictToDayOfMonth),
      CurrentLeaveCannotCombineWith: new FormControl(this.leaveRestriction.CurrentLeaveCannotCombineWith),
      CurrentLeaveCannotIfBalanceInPlan: new FormControl(this.leaveRestriction.CurrentLeaveCannotIfBalanceInPlan)
    })
  }

  initholidayWeekendOff() {
    this.holidayWeekendOffForm = this.fb.group({
      LeaveHolidaysAndWeekOffId:new FormControl(this.holidayWeekOffs.LeaveHolidaysAndWeekOffId),
      LeavePlanId:new FormControl(this.holidayWeekOffs.LeavePlanId),
      AdJoiningHolidayIsConsiderAsLeave:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffIsConsiderAsLeave),
      IfLeaveLieBetweenTwoHolidays:new FormControl(this.holidayWeekOffs.IfLeaveLieBetweenTwoHolidays),
      IfHolidayIsRightBeforLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsRightBeforLeave),
      IfHolidayIsRightAfterLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsRightAfterLeave),
      IfHolidayIsBetweenLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsBetweenLeave),
      IfHolidayIsRightBeforeAfterOrInBetween:new FormControl(this.holidayWeekOffs.IfHolidayIsRightBeforeAfterOrInBetween),
      AdjoiningHolidayRulesIsValidForHalfDay:new FormControl(this.holidayWeekOffs.AdjoiningHolidayRulesIsValidForHalfDay),
      AdjoiningWeekOffIsConsiderAsLeave:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffIsConsiderAsLeave),
      ConsiderLeaveIfIncludeDays:new FormControl(this.holidayWeekOffs.ConsiderLeaveIfIncludeDays),
      IfLeaveLieBetweenWeekOff:new FormControl(this.holidayWeekOffs.IfLeaveLieBetweenWeekOff),
      IfWeekOffIsRightBeforLeave:new FormControl(this.holidayWeekOffs.IfWeekOffIsRightBeforLeave),
      IfWeekOffIsRightAfterLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsRightAfterLeave),
      IfWeekOffIsBetweenLeave:new FormControl(this.holidayWeekOffs.IfWeekOffIsBetweenLeave),
      IfWeekOffIsRightBeforeAfterOrInBetween:new FormControl(this.holidayWeekOffs.IfWeekOffIsRightBeforeAfterOrInBetween),
      AdjoiningWeekOffRulesIsValidForHalfDay:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffRulesIsValidForHalfDay),
      ClubSandwichPolicy:new FormControl(this.holidayWeekOffs.ClubSandwichPolicy)
    })
  }

  initleaveApproval() {
    this.leaveApprovalForm = this.fb.group({
      IsLeaveRequiredApproval: new FormControl(this.leaveApproval.IsLeaveRequiredApproval)
    })
  }

  inityearEndProcess() {
    this.yearEndProcessForm = this.fb.group({
      IsLeaveBalanceExpiredOnEndOfYear: new FormControl(this.yearEndProcess.IsLeaveBalanceExpiredOnEndOfYear),
      AllConvertedToPaid: new FormControl(this.yearEndProcess.AllConvertedToPaid),
      AllLeavesCarryForwardToNextYear: new FormControl(this.yearEndProcess.AllLeavesCarryForwardToNextYear),
      PayFirstNCarryForwordRemaning: new FormControl(this.yearEndProcess.PayFirstNCarryForwordRemaning),
      CarryForwordFirstNPayRemaning: new FormControl(this.yearEndProcess.CarryForwordFirstNPayRemaning),
      PayNCarryForwardIfDaysBalance: new FormControl(this.yearEndProcess.PayNCarryForwardIfDaysBalance),
      PayPercent: new FormControl(this.yearEndProcess.PayPercent),
      CarryForwardPercent: new FormControl(this.yearEndProcess.CarryForwardPercent),
      IsMaximumPayableRequired: new FormControl(this.yearEndProcess.IsMaximumPayableRequired),
      MaximumPayableDays: new FormControl(this.yearEndProcess.MaximumPayableDays),
      IsMaximumCarryForwardRequired: new FormControl(this.yearEndProcess.IsMaximumCarryForwardRequired),
      MaximumCarryForwardDays: new FormControl(this.yearEndProcess.MaximumCarryForwardDays),
      RulesForLeaveBalanceIsMoreThan: new FormControl(this.yearEndProcess.RulesForLeaveBalanceIsMoreThan),
      PaybleForDays: new FormControl(this.yearEndProcess.PaybleForDays),
      CarryForwardForDays: new FormControl(this.yearEndProcess.CarryForwardForDays),
      DoestCarryForwardExpired: new FormControl(this.yearEndProcess.DoestCarryForwardExpired),
      ExpiredAfter: new FormControl(this.yearEndProcess.ExpiredAfter),
      DoesNegativeLeaveHasImpact: new FormControl(this.yearEndProcess.DoesNegativeLeaveHasImpact),
      DeductFromSalaryOnYearChange: new FormControl(this.yearEndProcess.DeductFromSalaryOnYearChange),
      ResetBalanceToZero: new FormControl(this.yearEndProcess.ResetBalanceToZero),
      CarryForwardToNextYear: new FormControl(this.yearEndProcess.CarryForwardToNextYear),
      PayNCarryForwardForFixedDays: new FormControl(this.yearEndProcess.PayNCarryForwardForFixedDays)
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

  LeaveAccrualId: number = 0;
  LeavePlanId: number = 0;
  CanApplyEntireLeave: boolean = null;
  IsLeaveAccruedPatternAvail: boolean = null;
  LeaveDistributionSequence: string = '';
  LeaveDistributionAppliedFrom: number = 0;
  IsAllowLeavesForJoinigMonth: boolean = null;
  IsAllowLeavesProbationPeriod: boolean = null;
  BreakMonthLeaveAllocationId: number = 0;
  IsNoLeaveOnProbationPeriod: boolean = null;
  IsVaryOnProbationOrExprience: boolean = null;
  IsImpactedOnWorkDaysEveryMonth: boolean = null;
  WeekOffAsAbsentIfAttendaceLessThen: number = 0;
  HolidayAsAbsentIfAttendaceLessThen: boolean = null;
  CanApplyForFutureDate: boolean = null;
  ExtraLeaveBeyondAccruedBalance: boolean = null;
  NoOfDaysForExtraLeave: number = 0;
  AllowOnlyIfAccrueBalanceIsAlleast: number = 0;
  NotAllowIfAlreadyOnLeaveMoreThan: number = 0;
  RoundOffLeaveBalance: boolean = null;
  ToNearestHalfDay: boolean = null;
  ToNearestFullDay: boolean = null;
  ToNextAvailableHalfDay: boolean = null;
  ToNextAvailableFullDay: boolean = null;
  ToPreviousHalfDay: boolean = null;
  DoesLeaveExpireAfterSomeTime: boolean = null;
  AfterHowManyDays: number = 0;
  Allocateleavebreakformonth: Allocateleavebreakformonth = new Allocateleavebreakformonth();
}

class ApplyingForLeave {
  LeaveApplyDetailId: number = 0;
  LeavePlanId: number = 0;
  IsAllowForHalfDay: boolean = null;
  EmployeeCanSeeAndApplyCurrentPlanLeave: boolean = null;
  RemaningCalendarDayInNotice: number = 0;
  RequiredCalendarDaysForLeaveApply: number = 0;
  RemaningWorkingDaysInNotice: number = 0;
  ApplyPriorBeforeLeaveDate: number = 0;
  BackDateLeaveApplyNotBeyondDays: number = 0;
  RestrictBackDateLeaveApplyAfter: number = 0;
  CurrentLeaveRequiredComments: boolean = null;
  ProofRequiredIfDaysExceeds: boolean = null;
  NoOfDaysExceeded: number = 0;
}

class LeaveRestriction {
  LeavePlanRestrictionId: number = 0;
  LeavePlanId: number = 0;
  NewJoineeCanApplyLeave: boolean = null;
  DaysAfterInProbation: number = 0;
  DaysAfterJoining: number = 0;
  LimitDaysLeaveInProbation: boolean = null;
  IsConsecutiveLeaveLimit: boolean = null;
  ConsecutiveDaysLimit: number = 0;
  IsLeaveInNoticeExtendsNoticePeriod: boolean = null;
  NoOfTimesNoticePeriodExtended: number = 0;
  CanManageOverrideLeaveRestriction: boolean = null;
  GapBetweenTwoConsicutiveLeaveDates: number = 0;
  LimitOfMaximumLeavesInCalendarMonth: number = 0;
  LimitOfMaximumLeavesInCalendarYear: number = 0;
  LimitOfMaximumLeavesInEntireTenure: number = 0;
  IsLeaveRestrictionForEachMonth: boolean = null;
  RestrictFromDayOfMonth: number = 0;
  RestrictToDayOfMonth: number = 0;
  CurrentLeaveCannotCombineWith: number = 0;
  CurrentLeaveCannotIfBalanceInPlan: number = 0;
}

class HolidayWeekOffs {
  LeaveHolidaysAndWeekOffId: number = 0;
  LeavePlanId: number = 0;
  AdJoiningHolidayIsConsiderAsLeave: boolean = null;
  IfLeaveLieBetweenTwoHolidays: boolean = null;
  IfHolidayIsRightBeforLeave: boolean = null;
  IfHolidayIsRightAfterLeave: boolean = null;
  IfHolidayIsBetweenLeave: boolean = null;
  IfHolidayIsRightBeforeAfterOrInBetween: boolean = null;
  AdjoiningHolidayRulesIsValidForHalfDay: boolean = null;
  AdjoiningWeekOffIsConsiderAsLeave: boolean = null;
  ConsiderLeaveIfIncludeDays: number = 0;
  IfLeaveLieBetweenWeekOff: boolean = null;
  IfWeekOffIsRightBeforLeave: boolean = null;
  IfWeekOffIsRightAfterLeave: boolean = null;
  IfWeekOffIsBetweenLeave: boolean = null;
  IfWeekOffIsRightBeforeAfterOrInBetween: boolean = null;
  AdjoiningWeekOffRulesIsValidForHalfDay: boolean = null;
  ClubSandwichPolicy: boolean = null;
}

class LeaveApproval {
  LeaveApprovalId: number = 0;
  LeavePlanId: number = 0;
  IsLeaveRequiredApproval: boolean = null;
  ApprovalLevels: number = 0;
  IsReportingManageIsDefaultForAction: boolean = null;
  CanHigherRankPersonsIsAvailForAction: boolean = null;
  IsReqioredAllLevelApproval: boolean = null;
  NoOfApprovalForConfirmation: number = 0;
}

class YearEndProcess {
  LeaveEndYearProcessingId: number = 0
  LeavePlanId: number = 0;
  IsLeaveBalanceExpiredOnEndOfYear: boolean = null;
  AllConvertedToPaid : boolean = null;
  AllLeavesCarryForwardToNextYear: boolean = null;
  PayFirstNCarryForwordRemaning : boolean = null;
  CarryForwordFirstNPayRemaning: boolean = null;
  PayNCarryForwardForFixedDays: boolean = null;
  PayNCarryForwardForPercent: boolean = null;
  PayNCarryForwardIfDaysBalance: number = 0;
  PayPercent: number = 0;
  CarryForwardPercent: number = 0;
  IsMaximumPayableRequired: boolean = null;
  MaximumPayableDays: number = 0;
  IsMaximumCarryForwardRequired: boolean = null;
  MaximumCarryForwardDays: number = 0;
  RulesForLeaveBalanceIsMoreThan: number = 0;
  PaybleForDays: number = 0;
  CarryForwardForDays: number = 0;
  DoestCarryForwardExpired: boolean = null;
  ExpiredAfter: number = 0;
  DoesNegativeLeaveHasImpact: boolean = null;
  DeductFromSalaryOnYearChange: boolean = null;
  ResetBalanceToZero: boolean = null;
  CarryForwardToNextYear: boolean = null;
}

class Allocateleavebreakformonth {
  BreakMonthLeaveAllocationId: number = 0;
  LeavePlanId: number = 0;
  LeavePlanDetailId: number = 0;
  FromDate: number = 0;
  ToDate: number = 0;
  AllocatedLeave: number = 0;
}
