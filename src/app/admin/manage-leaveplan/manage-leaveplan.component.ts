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
  leavePlanTypeId: number = 0;
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

  bindPage(data) {
    if(data) {
      if(data.leaveDetail)
        this.leaveDetail = data.leaveDetail;

      if (data.leavePlanRestriction)
        this.leaveRestriction = data.leavePlanRestriction;

      if (data.leaveAccrual)
        this.leaveAccrual = data.leaveAccrual;

      if (data.leaveApplyDetail)
        this.appplyingForLeave = data.leaveApplyDetail;

      if(data.leaveHolidaysAndWeekoff)
        this.holidayWeekOffs = data.leaveHolidaysAndWeekoff;

      this.initLeaveAccrual();
      this.initApplyForLeave();
      this.initLeaveDetail();
      this.initLeaveRestriction();
      this.initholidayWeekendOff();
      this.initleaveApproval();
      this.inityearEndProcess();

      Toast("Data loaded successfully")
      this.isDataLoaded = true;
    } else {
      ErrorToast("Unable to lead plan detail. Please contact to admin.");
    }
  }

  loadPlanDetail() {
    this.http.get(`ManageLeavePlan/GetLeavePlanTypeConfiguration/${this.leavePlanTypeId}`).then(response => {
      this.bindPage(response.ResponseBody)
    });
  }

  ngOnInit(): void {
    let id = this.nav.getValue();
    if(id != null && !isNaN(Number(id))) {
      this.leavePlanTypeId = Number(id);
      this.loadPlanDetail();
    } else {
      ErrorToast("Invlaid plan selected please select again.");
      return;
    }

  }

  initLeaveDetail() {
    this.leaveDetailForm = this.fb.group({
      LeaveDetailId: new FormControl(this.leaveDetail.LeaveDetailId),
      LeavePlanTypeId: new FormControl(this.leavePlanTypeId),
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
      this.http.put(`ManageLeavePlan/UpdateLeaveDetail/${this.leavePlanTypeId}`, value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          Toast("Leave Quota updated successfully.")
          this.bindPage(res.ResponseBody);
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

  empJoinMiddle(flag: boolean) {
    let elem = document.getElementById("EmpJoinMiddle");
    if(flag)
      elem.classList.remove('d-none');
    else
      elem.classList.add('d-none');
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
      document.getElementsByName('CanApplyExtraLeave')[0].removeAttribute('readonly');
    else
      document.getElementsByName('CanApplyExtraLeave')[0].setAttribute('readonly', '');
  }

  quotaLimit(e: any) {
    let value = e.target.value;
    if (value == 'true')
      document.getElementsByName('LeaveLimit')[0].removeAttribute('readonly');
    else
      document.getElementsByName('LeaveLimit')[0].setAttribute('readonly', '');
  }

  submitLeaveAccrual() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveAccrualForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveAccrual/${this.leavePlanTypeId}`, value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          Toast("Leave Accrual updated successfully.")
          //this.configPageNo = this.configPageNo + 1;
        }
      })
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
  }

  initLeaveAccrual() {
    this.leaveAccrualForm = this.fb.group({
      LeaveAccrualId: new FormControl(this.leaveAccrual.LeaveAccrualId),
      LeavePlanTypeId: new FormControl(this.leavePlanTypeId),

      CanApplyEntireLeave: new FormControl(this.leaveAccrual.CanApplyEntireLeave ?'true' : 'false'),
      IsLeaveAccruedPatternAvail: new FormControl(this.leaveAccrual.IsLeaveAccruedPatternAvail?'true' : 'false'),
      LeaveDistributionSequence: new FormControl(this.leaveAccrual.LeaveDistributionSequence),
      LeaveDistributionAppliedFrom: new FormControl(this.leaveAccrual.LeaveDistributionAppliedFrom),

      IsLeavesProratedForJoinigMonth: new FormControl(this.leaveAccrual.IsLeavesProratedForJoinigMonth ? 'true' : 'false'),
      JoiningMonthLeaveDistribution: this.buildFormArrayBetweenJoiningDate(),

      IsLeavesProratedOnProbation: new FormControl(this.leaveAccrual.IsLeavesProratedOnProbation?'true' : 'false'),
      ExitMonthLeaveDistribution: this.buildFormArrayBetweenProbationPeriod(),
      IsNotAllowProratedOnProbation: new FormControl(this.leaveAccrual.IsNotAllowProratedOnProbation ?'true' : 'false'),
      IsNoLeaveOnProbationPeriod: new FormControl(this.leaveAccrual.IsNoLeaveOnProbationPeriod?'true' : 'false'),

      IsVaryOnProbationOrExprience: new FormControl(this.leaveAccrual.IsVaryOnProbationOrExprience ?'true' : 'false'),
      IsAccrualStartsAfterJoining: new FormControl(this.leaveAccrual.IsAccrualStartsAfterJoining ?'true' : 'false'),
      IsAccrualStartsAfterProbationEnds: new FormControl(this.leaveAccrual.IsAccrualStartsAfterProbationEnds ?'true' : 'false'),
      AccrualDaysAfterJoining: new FormControl(this.leaveAccrual.AccrualDaysAfterJoining),
      AccrualDaysAfterProbationEnds: new FormControl(this.leaveAccrual.AccrualDaysAfterProbationEnds),
      AccrualProrateDetail: this.buildAccruralRateOnExp(),

      IsImpactedOnWorkDaysEveryMonth: new FormControl(this.leaveAccrual.IsImpactedOnWorkDaysEveryMonth ?'true' : 'false'),

      WeekOffAsAbsentIfAttendaceLessThen: new FormControl(this.leaveAccrual.WeekOffAsAbsentIfAttendaceLessThen),
      HolidayAsAbsentIfAttendaceLessThen: new FormControl(this.leaveAccrual.HolidayAsAbsentIfAttendaceLessThen),
      CanApplyForFutureDate: new FormControl(this.leaveAccrual.CanApplyForFutureDate?'true' : 'false'),
      IsExtraLeaveBeyondAccruedBalance: new FormControl(this.leaveAccrual.IsExtraLeaveBeyondAccruedBalance ?'true' : 'false'),
      IsNoExtraLeaveBeyondAccruedBalance: new FormControl(this.leaveAccrual.IsNoExtraLeaveBeyondAccruedBalance ?'true' : 'false'),
      NoOfDaysForExtraLeave: new FormControl(this.leaveAccrual.NoOfDaysForExtraLeave),
      IsAccrueIfHavingLeaveBalance: new FormControl(this.leaveAccrual.IsAccrueIfHavingLeaveBalance),
      AllowOnlyIfAccrueBalanceIsAlleast: new FormControl(this.leaveAccrual.AllowOnlyIfAccrueBalanceIsAlleast),
      IsAccrueIfOnOtherLeave: new FormControl(this.leaveAccrual.IsAccrueIfOnOtherLeave),
      NotAllowIfAlreadyOnLeaveMoreThan: new FormControl(this.leaveAccrual.NotAllowIfAlreadyOnLeaveMoreThan),

      RoundOffLeaveBalance: new FormControl(this.leaveAccrual.RoundOffLeaveBalance ?'true' : 'false'),
      ToNearestHalfDay: new FormControl(this.leaveAccrual.ToNearestHalfDay ?'true' : 'false'),
      ToNearestFullDay: new FormControl(this.leaveAccrual.ToNearestFullDay ?'true' : 'false'),
      ToNextAvailableHalfDay: new FormControl(this.leaveAccrual.ToNextAvailableHalfDay ?'true' : 'false'),
      ToNextAvailableFullDay: new FormControl(this.leaveAccrual.ToNextAvailableFullDay ?'true' : 'false'),
      ToPreviousHalfDay: new FormControl(this.leaveAccrual.ToPreviousHalfDay ?'true' : 'false'),

      DoesLeaveExpireAfterSomeTime: new FormControl(this.leaveAccrual.DoesLeaveExpireAfterSomeTime?'true' : 'false'),
      AfterHowManyDays: new FormControl(this.leaveAccrual.AfterHowManyDays)
    });
  }

  buildAccruralRateOnExp(): FormArray {
    let data = this.leaveAccrual.AccrualProrateDetail;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          PeriodType: new FormControl(data[i].PeriodType),
          YearsAfterJoining: new FormControl(data[i].YearsAfterJoining),
          DaysMonthly: new FormControl(data[i].DaysMonthly),
          DaysYearly: new FormControl(data[i].DaysYearly)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createAccruralRateOnExp());
    }

    return dataArray;
  }

  createAccruralRateOnExp(): FormGroup {
    return this.fb.group({
      PeriodType: new FormControl('After Probation'),
      YearsAfterJoining: new FormControl(0),
      DaysMonthly: new FormControl(0),
      DaysYearly: new FormControl(0)
    });
  }

  addAccruralRateOnExp() {
    let item = this.leaveAccrualForm.get('AccrualProrateDetail') as FormArray;
    item.push(this.createAccruralRateOnExp());
  }

  removeAccruralRateOnExp(i: number) {
    let item = this.leaveAccrualForm.get('AccrualProrateDetail') as FormArray;
    item.removeAt(i);
  }

  buildFormArrayBetweenJoiningDate(): FormArray {
    let data = this.leaveAccrual.JoiningMonthLeaveDistribution;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          FromDate: new FormControl(data[i].FromDate),
          ToDate: new FormControl(data[i].ToDate),
          AllocatedLeave: new FormControl(data[i].AllocatedLeave)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createFormBetweenJoiningDate());
    }

    return dataArray;
  }

  createFormBetweenJoiningDate(): FormGroup {
    return this.fb.group({
      FromDate: new FormControl(0),
      ToDate: new FormControl(0),
      AllocatedLeave: new FormControl(0)
    });
  }

  get formBetweenJoiningDate() {
    return this.leaveAccrualForm.get('JoiningMonthLeaveDistribution') as FormArray;
  }

  addFormBetweenJoiningDate() {
    let item = this.leaveAccrualForm.get('JoiningMonthLeaveDistribution') as FormArray;
    item.push(this.createFormBetweenJoiningDate());
  }

  removeFormBetweenJoiningDate(i: number) {
    let item = this.leaveAccrualForm.get('JoiningMonthLeaveDistribution') as FormArray;
    item.removeAt(i);
    if (item.length === 0)
      this.addFormBetweenJoiningDate();
  }

  buildFormArrayBetweenProbationPeriod(): FormArray {
    let data = this.leaveAccrual.ExitMonthLeaveDistribution;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          FromDate: new FormControl(data[i].FromDate),
          ToDate: new FormControl(data[i].ToDate),
          AllocatedLeave: new FormControl(data[i].AllocatedLeave)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createFormBetweenJoiningDate());
    }

    return dataArray;
  }

  createFormBetweenExitDate(): FormGroup {
    return this.fb.group({
      FromDate: new FormControl(0),
      ToDate: new FormControl(0),
      AllocatedLeave: new FormControl(0)
    })
  }

  addFormBetweenExitDate() {
    let item = this.leaveAccrualForm.get('ExitMonthLeaveDistribution') as FormArray;
    item.push(this.createFormBetweenExitDate());
  }

  removeFormBetweenExitDate(i: number) {
    let item = this.leaveAccrualForm.get('ExitMonthLeaveDistribution') as FormArray;
    item.removeAt(i);
  }

  submitApplyForLeave() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.applyForLeaveForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateApplyForLeave/${this.leavePlanTypeId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
      })
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
  }

  initApplyForLeave() {
    this.applyForLeaveForm = this.fb.group({
      LeaveApplyDetailId: new FormControl(this.appplyingForLeave.LeaveApplyDetailId),
      LeavePlanTypeId: new FormControl(this.leavePlanTypeId),
      IsAllowForHalfDay: new FormControl(this.appplyingForLeave.IsAllowForHalfDay ? 'true': 'false'),
      EmployeeCanSeeAndApplyCurrentPlanLeave: new FormControl(this.appplyingForLeave.EmployeeCanSeeAndApplyCurrentPlanLeave ? 'true': 'false'),
      ApplyPriorBeforeLeaveDate: new FormControl(this.appplyingForLeave.ApplyPriorBeforeLeaveDate),
      BackDateLeaveApplyNotBeyondDays: new FormControl(this.appplyingForLeave.BackDateLeaveApplyNotBeyondDays),
      CurrentLeaveRequiredComments: new FormControl(this.appplyingForLeave.CurrentLeaveRequiredComments ? 'true': 'false'),
      ProofRequiredIfDaysExceeds: new FormControl(this.appplyingForLeave.ProofRequiredIfDaysExceeds ? 'true': 'false'),
      NoOfDaysExceeded: new FormControl(this.appplyingForLeave.NoOfDaysExceeded),
      RuleForLeaveInNotice: this.buildRuleForLeaveInNotice()
    })
  }

  buildRuleForLeaveInNotice(): FormArray {
    let data = this.appplyingForLeave.RuleForLeaveInNotice;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          RemaningCalendarDayInNotice: new FormControl(data[i].RemaningCalendarDayInNotice),
          RequiredCalendarDaysForLeaveApply: new FormControl(data[i].RequiredCalendarDaysForLeaveApply),
          RemaningWorkingDaysInNotice: new FormControl(data[i].RemaningWorkingDaysInNotice)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createRuleForLeaveInNotice());
    }

    return dataArray;
  }

  createRuleForLeaveInNotice(): FormGroup {
    return this.fb.group({
      RemaningCalendarDayInNotice: new FormControl(0),
      RequiredCalendarDaysForLeaveApply: new FormControl(0),
      RemaningWorkingDaysInNotice: new FormControl(0)
    })
  }

  addRuleForLeaveInNotice() {
    let item = this.applyForLeaveForm.get('RuleForLeaveInNotice') as FormArray;
    item.push(this.createRuleForLeaveInNotice());
  }

  removeRuleForLeaveInNotice(i: number) {
    let item = this.applyForLeaveForm.get('RuleForLeaveInNotice') as FormArray;
    item.removeAt(i)
  }

  initLeaveRestriction() {
    this.leaveRestrictionForm = this.fb.group({
      LeavePlanRestrictionId: new FormControl(this.leaveRestriction.LeavePlanRestrictionId),
      LeavePlanId: new FormControl(this.leaveRestriction.LeavePlanId),
      CanApplyAfterProbation: new FormControl(this.leaveRestriction.CanApplyAfterProbation ? 'true' : 'false'),
      CanApplyAfterJoining: new FormControl(this.leaveRestriction.CanApplyAfterJoining ? 'true' : 'false'),
      DaysAfterProbation: new FormControl(this.leaveRestriction.DaysAfterProbation),
      DaysAfterJoining: new FormControl(this.leaveRestriction.DaysAfterJoining),
      IsAvailRestrictedLeavesInProbation: new FormControl(this.leaveRestriction.IsAvailRestrictedLeavesInProbation ? 'true' : 'false'),
      LeaveLimitInProbation: new FormControl(this.leaveRestriction.LeaveLimitInProbation),

      IsConsecutiveLeaveLimit: new FormControl(this.leaveRestriction.IsConsecutiveLeaveLimit ? 'true' : 'false'),
      ConsecutiveDaysLimit: new FormControl(this.leaveRestriction.ConsecutiveDaysLimit),

      IsLeaveInNoticeExtendsNoticePeriod: new FormControl(this.leaveRestriction.IsLeaveInNoticeExtendsNoticePeriod ? 'true' : 'false'),
      NoOfTimesNoticePeriodExtended: new FormControl(this.leaveRestriction.NoOfTimesNoticePeriodExtended),

      CanManageOverrideLeaveRestriction: new FormControl(this.leaveRestriction.CanManageOverrideLeaveRestriction ? 'true' : 'false'),

      GapBetweenTwoConsicutiveLeaveDates: new FormControl(this.leaveRestriction.GapBetweenTwoConsicutiveLeaveDates),
      LimitOfMaximumLeavesInCalendarYear: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInCalendarYear),
      LimitOfMaximumLeavesInCalendarMonth: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInCalendarMonth),
      LimitOfMaximumLeavesInEntireTenure: new FormControl(this.leaveRestriction.LimitOfMaximumLeavesInEntireTenure),
      MinLeaveToApplyDependsOnAvailable: new FormControl(this.leaveRestriction.MinLeaveToApplyDependsOnAvailable),
      AvailableLeaves: new FormControl(this.leaveRestriction.AvailableLeaves),
      RestrictFromDayOfEveryMonth: new FormControl(this.leaveRestriction.RestrictFromDayOfEveryMonth),

      IsCurrentPlanDepnedsOnOtherPlan: new FormControl(this.leaveRestriction.IsCurrentPlanDepnedsOnOtherPlan),
      AssociatedPlanTypeId: new FormControl(this.leaveRestriction.AssociatedPlanTypeId),
      IsCheckOtherPlanTypeBalance: new FormControl(this.leaveRestriction.IsCheckOtherPlanTypeBalance),
      DependentPlanTypeId: new FormControl(this.leaveRestriction.DependentPlanTypeId)
    })
  }

  submitLeaveRestriction() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveRestrictionForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveRestriction/${this.leavePlanTypeId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.submit = false;
        this.isLoading = false;
      });
    }
  }

  initholidayWeekendOff() {
    this.holidayWeekendOffForm = this.fb.group({
      LeaveHolidaysAndWeekOffId:new FormControl(this.holidayWeekOffs.LeaveHolidaysAndWeekOffId),
      LeavePlanTypeId:new FormControl(this.holidayWeekOffs.LeavePlanTypeId),
      AdJoiningHolidayIsConsiderAsLeave:new FormControl(this.holidayWeekOffs.AdJoiningHolidayIsConsiderAsLeave ? 'true' : 'false'),
      ConsiderLeaveIfNumOfDays:new FormControl(this.holidayWeekOffs.ConsiderLeaveIfNumOfDays),
      IfLeaveLieBetweenTwoHolidays:new FormControl(this.holidayWeekOffs.IfLeaveLieBetweenTwoHolidays ? 'true' : 'false'),
      IfHolidayIsRightBeforLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsRightBeforLeave ? 'true' : 'false'),
      IfHolidayIsRightAfterLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsRightAfterLeave ? 'true' : 'false'),
      IfHolidayIsBetweenLeave:new FormControl(this.holidayWeekOffs.IfHolidayIsBetweenLeave ? 'true' : 'false'),
      IfHolidayIsRightBeforeAfterOrInBetween:new FormControl(this.holidayWeekOffs.IfHolidayIsRightBeforeAfterOrInBetween ? 'true' : 'false'),
      AdjoiningHolidayRulesIsValidForHalfDay:new FormControl(this.holidayWeekOffs.AdjoiningHolidayRulesIsValidForHalfDay),
      AdjoiningWeekOffIsConsiderAsLeave:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffIsConsiderAsLeave),
      ConsiderLeaveIfIncludeDays:new FormControl(this.holidayWeekOffs.ConsiderLeaveIfIncludeDays),
      IfLeaveLieBetweenWeekOff:new FormControl(this.holidayWeekOffs.IfLeaveLieBetweenWeekOff ? 'true' : 'false'),
      IfWeekOffIsRightBeforLeave:new FormControl(this.holidayWeekOffs.IfWeekOffIsRightBeforLeave ? 'true' : 'false'),
      IfWeekOffIsRightAfterLeave:new FormControl(this.holidayWeekOffs.IfWeekOffIsRightAfterLeave ? 'true' : 'false'),
      IfWeekOffIsBetweenLeave:new FormControl(this.holidayWeekOffs.IfWeekOffIsBetweenLeave ? 'true' : 'false'),
      IfWeekOffIsRightBeforeAfterOrInBetween:new FormControl(this.holidayWeekOffs.IfWeekOffIsRightBeforeAfterOrInBetween ? 'true' : 'false'),
      AdjoiningWeekOffRulesIsValidForHalfDay:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffRulesIsValidForHalfDay),
      ClubSandwichPolicy:new FormControl(this.holidayWeekOffs.ClubSandwichPolicy ? 'true' : 'false')
    })
  }

  submitHolidayNWeekOffLeave() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.holidayWeekendOffForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateHolidayNWeekOffPlan/${this.leavePlanTypeId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.submit = false;
        this.isLoading = false;
      });
    }
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

  toggleCurrent(groupNum: number, e: any) {
    switch(groupNum) {
      case 1:
        this.leaveAccrualForm.get('CanApplyEntireLeave').setValue('false');
        this.leaveAccrualForm.get('IsLeaveAccruedPatternAvail').setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue('true');
        if (this.leaveAccrualForm.get('IsLeaveAccruedPatternAvail').value == 'true')
          document.getElementsByName('LeaveBalanceCalculated')[0].classList.remove('d-none');
        else
          document.getElementsByName('LeaveBalanceCalculated')[0].classList.add('d-none');
        break;
      case 3:
        this.leaveAccrualForm.get('IsNoLeaveOnProbationPeriod').setValue('false');
        this.leaveAccrualForm.get('IsNotAllowProratedOnProbation').setValue('false');
        this.leaveAccrualForm.get('IsLeavesProratedOnProbation').setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue(e.target.value);
        let elem = document.getElementById("EmpExitMiddle");
        if(e.target.name == "IsNotAllowProratedOnProbation")
          elem.classList.remove('d-none');
        else
          elem.classList.add('d-none');
        break;
      case 5:
        this.leaveAccrualForm.get('IsAccrualStartsAfterJoining').setValue('false');
        this.leaveAccrualForm.get('IsAccrualStartsAfterProbationEnds').setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue(e.target.value);
        break;
      case 8:
        this.leaveAccrualForm.get("IsExtraLeaveBeyondAccruedBalance").setValue('false');
        this.leaveAccrualForm.get("IsNoExtraLeaveBeyondAccruedBalance").setValue('false');
        this.leaveAccrualForm.get("IsAccrueIfHavingLeaveBalance").setValue(false);
        // this.leaveAccrualForm.get("AllowOnlyIfAccrueBalanceIsAlleast").setValue('false');
        this.leaveAccrualForm.get("IsAccrueIfOnOtherLeave").setValue(false);
        // this.leaveAccrualForm.get("NotAllowIfAlreadyOnLeaveMoreThan").setValue(0);
        this.leaveAccrualForm.get(e.target.name).setValue('true');
        break;
      case 9:
        this.leaveAccrualForm.get("RoundOffLeaveBalance").setValue('false');
        this.leaveAccrualForm.get("ToNearestHalfDay").setValue('false');
        this.leaveAccrualForm.get("ToNearestFullDay").setValue('false');
        this.leaveAccrualForm.get("ToNextAvailableHalfDay").setValue('false');
        this.leaveAccrualForm.get("ToNextAvailableFullDay").setValue('false');
        this.leaveAccrualForm.get("ToPreviousHalfDay").setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue('true');
        break;
      case 10:
          if (e.target.value == 'true') {
            document.getElementsByName('AfterHowManyDays')[0].removeAttribute('readonly');

          } else {
            document.getElementsByName('AfterHowManyDays')[0].setAttribute('readonly', '');
            this.leaveAccrualForm.get("AfterHowManyDays").setValue(0);
          }
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
  LeavePlanTypeId: number = 0;
  IsLeaveDaysLimit: boolean = true;
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
  LeaveAccrualId: number = 0;
  LeavePlanTypeId: number = 0;
  CanApplyEntireLeave: boolean = null;
  IsLeaveAccruedPatternAvail: boolean = null;
  JoiningMonthLeaveDistribution: any = {};
  ExitMonthLeaveDistribution: any = {};
  AccrualProrateDetail: any = {};
  LeaveDistributionAppliedFrom: number = 0;
  IsLeavesProratedForJoinigMonth: boolean = null;
  LeaveDistributionSequence: string = null;

  IsLeavesProratedOnProbation: boolean = null;
  IsNotAllowProratedOnProbation: boolean = null;
  BreakMonthLeaveAllocationId: number = 0;
  IsNoLeaveOnProbationPeriod: boolean = null;

  IsVaryOnProbationOrExprience: boolean = null;
  IsAccrualStartsAfterJoining: boolean = false;
  IsAccrualStartsAfterProbationEnds: boolean = false;
  AccrualDaysAfterJoining: number = 0;
  AccrualDaysAfterProbationEnds: number = 0;

  IsImpactedOnWorkDaysEveryMonth: boolean = null;
  WeekOffAsAbsentIfAttendaceLessThen: number = 0;
  HolidayAsAbsentIfAttendaceLessThen: number = 0;
  CanApplyForFutureDate: boolean = null;
  IsExtraLeaveBeyondAccruedBalance: boolean = false;
  IsNoExtraLeaveBeyondAccruedBalance: boolean = false;
  NoOfDaysForExtraLeave: number = 0;
  IsAccrueIfHavingLeaveBalance: boolean = false;
  AllowOnlyIfAccrueBalanceIsAlleast: number = 0;
  IsAccrueIfOnOtherLeave: boolean = false;
  NotAllowIfAlreadyOnLeaveMoreThan: number = 0;
  RoundOffLeaveBalance: boolean = null;
  ToNearestHalfDay: boolean = null;
  ToNearestFullDay: boolean = null;
  ToNextAvailableHalfDay: boolean = null;
  ToNextAvailableFullDay: boolean = null;
  ToPreviousHalfDay: boolean = null;
  DoesLeaveExpireAfterSomeTime: boolean = null;
  AfterHowManyDays: number = 0;
}

class ApplyingForLeave {
  LeaveApplyDetailId: number = 0;
  LeavePlanTypeId: number = 0;
  IsAllowForHalfDay: boolean = null;
  EmployeeCanSeeAndApplyCurrentPlanLeave: boolean = null;
  ApplyPriorBeforeLeaveDate: number = 0;
  BackDateLeaveApplyNotBeyondDays: number = 0;
  RestrictBackDateLeaveApplyAfter: number = 0;
  CurrentLeaveRequiredComments: boolean = null;
  ProofRequiredIfDaysExceeds: boolean = null;
  NoOfDaysExceeded: number = 0;
  RuleForLeaveInNotice: Array<any> = [];
}

class LeaveRestriction {
  LeavePlanRestrictionId: number = 0;
  LeavePlanId: number = 0;
  CanApplyAfterProbation: boolean = false;
  CanApplyAfterJoining: boolean = false;
  DaysAfterProbation: number = 0;
  DaysAfterJoining: number = 0;
  IsAvailRestrictedLeavesInProbation: boolean = false;
  LeaveLimitInProbation: number = 0;

  IsConsecutiveLeaveLimit: boolean = false;
  ConsecutiveDaysLimit: number = 0;

  IsLeaveInNoticeExtendsNoticePeriod: boolean = false;
  NoOfTimesNoticePeriodExtended: number = 0;

  CanManageOverrideLeaveRestriction: boolean = false;

  GapBetweenTwoConsicutiveLeaveDates: number = 0;
  LimitOfMaximumLeavesInCalendarYear: number = 0;
  LimitOfMaximumLeavesInCalendarMonth: number = 0;
  LimitOfMaximumLeavesInEntireTenure: number = 0;
  MinLeaveToApplyDependsOnAvailable: number = 0;
  AvailableLeaves: number = 0;
  RestrictFromDayOfEveryMonth: number = 0;

  IsCurrentPlanDepnedsOnOtherPlan: boolean = false;
  AssociatedPlanTypeId: number = 0;
  IsCheckOtherPlanTypeBalance: boolean = false;
  DependentPlanTypeId: number = 0;
}

class HolidayWeekOffs {
  LeaveHolidaysAndWeekOffId: number = 0;
  LeavePlanTypeId: number = 0;
  AdJoiningHolidayIsConsiderAsLeave: boolean = false;
  ConsiderLeaveIfNumOfDays: number = 0;
  IfLeaveLieBetweenTwoHolidays: boolean = false;
  IfHolidayIsRightBeforLeave: boolean = false;
  IfHolidayIsRightAfterLeave: boolean = false;
  IfHolidayIsBetweenLeave: boolean = false;
  IfHolidayIsRightBeforeAfterOrInBetween: boolean = false;
  AdjoiningHolidayRulesIsValidForHalfDay: boolean = false;
  AdjoiningWeekOffIsConsiderAsLeave: boolean = false;
  ConsiderLeaveIfIncludeDays: number = 0;
  IfLeaveLieBetweenWeekOff: boolean = false;
  IfWeekOffIsRightBeforLeave: boolean = false;
  IfWeekOffIsRightAfterLeave: boolean = false;
  IfWeekOffIsBetweenLeave: boolean = false;
  IfWeekOffIsRightBeforeAfterOrInBetween: boolean = false;
  AdjoiningWeekOffRulesIsValidForHalfDay: boolean = false;
  ClubSandwichPolicy: boolean = false;
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
