import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { Attendance, Leave, Timesheet } from 'src/providers/constants';
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
  leaveTypeDeatils: any = null;
  configPageNo: number = 1;
  isPageReady: boolean = false;
  leaveDetailForm: FormGroup;
  leaveDetail: LeaveDetail = new LeaveDetail();
  managementLeaveDetail: Managementleave = new Managementleave();
  leaveAccrualForm: FormGroup;
  leaveRestrictionForm: FormGroup;
  applyForLeaveForm: FormGroup;
  holidayWeekendOffForm: FormGroup;
  leaveApprovalForm: FormGroup;
  yearEndProcessForm: FormGroup;
  managementLeave: FormGroup;
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
  errorCounter: number = 0;
  monthlyLeave: number = 0;
  isConfigCompleted: boolean = false;
  allocateleave: number = 0;
  days:Array<number> = [];

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

  ngOnInit(): void {
    let data = this.nav.getValue();
    if(data != null) {
      this.isPageReady = true;
      this.leaveTypeDeatils = data;
      let id = data.LeavePlanTypeId;
      this.leavePlanTypeId = Number(id);

      if (this.leaveTypeDeatils.LeavePlanId <=0) {
        ErrorToast("Please select a vlid leave plan first");
        return;
      }
      for (let i = 0; i <= 30; i++) {
        this.days.push(i);
      }
      this.loadPlanDetail();
    } else {
      ErrorToast("Invlaid plan selected please select again.");
      return;
    }
  }

  loadPlanDetail() {
    this.http.get(`ManageLeavePlan/GetLeavePlanTypeConfiguration/${this.leavePlanTypeId}`).then(response => {
      this.bindPage(response.ResponseBody)
    });
  }

  bindPage(data) {
    if(data) {
      if(data.leaveDetail)
        this.leaveDetail = data.leaveDetail;

      if (data.leavePlanRestriction)
        this.leaveRestriction = data.leavePlanRestriction;

      if (data.managementLeave)
        this.managementLeaveDetail = data.managementLeave;

      if (data.leaveAccrual)
        this.leaveAccrual = data.leaveAccrual;

      if (data.leaveApplyDetail)
        this.appplyingForLeave = data.leaveApplyDetail;

      if(data.leaveHolidaysAndWeekoff)
        this.holidayWeekOffs = data.leaveHolidaysAndWeekoff;

      if(data.leaveApproval)
          this.leaveApproval = data.leaveApproval;

      if(data.leaveEndYearProcessing)
        this.yearEndProcess = data.leaveEndYearProcessing;
      this.monthlyLeave = this.leaveDetail.LeaveLimit/12;
      this.initLeaveAccrual();
      this.initManagementLeave();
      this.initApplyForLeave();
      this.initLeaveDetail();
      this.initLeaveRestriction();
      this.initholidayWeekendOff();
      this.initleaveApproval();
      this.inityearEndProcess();

      Toast("Data updateded successfully");
      this.isPageReady = false;
      this.isDataLoaded = true;
    } else {
      ErrorToast("Unable to lead plan detail. Please contact to admin.");
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
      CanCompoffAllocatedAutomatically: new FormControl(this.leaveDetail.CanCompoffAllocatedAutomatically? 'true':'false'),
      CanCompoffCreditedByManager: new FormControl(this.leaveDetail.CanCompoffCreditedByManager? 'true':'false')
    })
  }

  initManagementLeave() {
    this.managementLeave = this.fb.group({
      CanManagerAwardCausalLeave: new FormControl(this.managementLeaveDetail.CanManagerAwardCausalLeave? 'true':'false')
    })
  }

  submitLeaveQuota() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveDetailForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveDetail/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  submitManagementLeave() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.managementLeave.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveFromManagement/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
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
        document.querySelector('div[name="AccrualLevelVary"]').classList.remove('d-none');
      else
        document.querySelector('div[name="AccrualLevelVary"]').classList.add('d-none');
    }
  }

  findDay(e: any) {
    let value = Number(e.target.value);
    if (value > 31) {
      e.target.classList.add('error-field');
      ErrorToast("Invalid date enter");
    } else {
      e.target.classList.remove('error-field');
    }
  }

  beyondAnnualQuota(e: any) {
    let value = e.currentTarget.querySelector('input[type="radio"]').value;
    if (value == 'true') {
      document.getElementsByName('ExtraLeaveLimit')[0].removeAttribute('readonly');
      this.leaveDetailForm.get('CanApplyExtraLeave').setValue('true');
    }
    else {
      document.getElementsByName('ExtraLeaveLimit')[0].setAttribute('readonly', '');
      this.leaveDetailForm.get('CanApplyExtraLeave').setValue('false');
    }
  }

  quotaLimit(e: any) {
    let value = e.currentTarget.querySelector('input[type="radio"]').value;
    if (value == 'true') {
      document.getElementsByName('LeaveLimit')[0].removeAttribute('readonly');
      this.leaveDetailForm.get('IsLeaveDaysLimit').setValue('true');
    }
    else {
      document.getElementsByName('LeaveLimit')[0].setAttribute('readonly', '');
      this.leaveDetailForm.get('IsLeaveDaysLimit').setValue('false');
    }
  }

  empJoinMiddleDateValidation(e: any, i: number) {
    let data = this.leaveAccrualForm.get('JoiningMonthLeaveDistribution').value;
    this.inputDateValidation(e, data, i);
  }

  empLeaveMiddleDateValidation(e: any, i: number) {
    let data = this.leaveAccrualForm.get('ExitMonthLeaveDistribution').value;
    this.inputDateValidation(e, data, i);
  }

  inputDateValidation(e: any, data: any, i: number) {
    let value = Number(e.target.value);
    let name = e.target.name;
    let errorCounter = 0;
    if (name == 'ToDate' && (value > 31 || value <1)) {
      errorCounter++;
      ErrorToast("Invalid to date");
    } else if(name == 'FromDate' && (value < 1 || value > 30)) {
      errorCounter++;
      ErrorToast("Invalid to date");
    }
    if (data.length > 1 && i > 0) {
      let fromDate = Number(data[(data.length -2)].FromDate);
      let toDate = Number(data[(data.length -2)].ToDate);
      if (name == 'FromDate') {
        if (value <= fromDate || value <= toDate) {
          errorCounter++;
          ErrorToast("From date must be greater than previous from date");
        }
      } else {
        if (value <= toDate) {
          errorCounter++;
          ErrorToast("To date must be greater than previous to date");
        }
      }
    }
    if (errorCounter > 0)
      e.target.classList.add('error-field');
    else
      e.target.classList.remove('error-field');

    if (name == 'ToDate' && value == 31) {
      let elem= document.querySelectorAll('a[data-name="add-remove-setion"]')[i];
      elem.classList.add('d-none');
    } else {
      let elem= document.querySelectorAll('a[data-name="add-remove-setion"]')[i];
      elem.classList.remove('d-none');
    }
  }

  fromandTodateValidation(data: any) {
    for (let i = 0; i < data.length; i++) {
      if (Number(data[i].FromDate) == 0) {
        ErrorToast("If you submit 0 in from date then first month leave cann't be calculated.");
        this.errorCounter++;
        this.isLoading = false;
        return;
      }
      if (Number(data[i].ToDate) == 0) {
        ErrorToast("If you submit 0 in to date then last month leave cann't be calculated.");
        this.errorCounter++;
        this.isLoading = false;
        return;
      }
      if (Number(data[i].AllocatedLeave) == 0) {
        ErrorToast("If you submit 0 in allocate leave then leave cann't be calculated.")
        this.errorCounter++;
        this.isLoading = false;
        return;
      }

      if (Number(data[i].ToDate) > 31) {
        ErrorToast("Invalid to date enter in leave accrual quota");
        this.errorCounter++;
        this.isLoading = false;
        return;
      }

      if (i > 0) {
        let fromDate = Number(data[i].FromDate);
        let toDate = Number(data[i].ToDate);
        if (fromDate < Number(data[(i-1)].FromDate) || fromDate < Number(data[(i-1)].ToDate)) {
          ErrorToast("From date must be greater than previous from date");
          this.errorCounter++;
        }
        if (toDate <= Number(data[(i-1)].ToDate)) {
          ErrorToast("To date must be greater than previous to date");
          this.errorCounter++;
        }
      }
    }
  }

  submitLeaveAccrual() {
    this.submit = true;
    this.isLoading = true;
    this.errorCounter = 0;
    let value = this.leaveAccrualForm.value;
    if (value.IsLeaveAccruedPatternAvail== 'true') {
      if (!value.LeaveDistributionSequence || value.LeaveDistributionSequence == '') {
        ErrorToast("Please select leave accrual of annual quota");
        this.isLoading = false;
        return;
      }
      if (Number(value.LeaveDistributionAppliedFrom) <= 0) {
        ErrorToast("Please enter a valid date for which accrula rate applied");
        this.isLoading = false;
        return;
      }
    }

    if(value.IsLeavesProratedForJoinigMonth == 'false' && value.JoiningMonthLeaveDistribution.length > 0)
      this.fromandTodateValidation(value.JoiningMonthLeaveDistribution);

    if(value.IsNotAllowProratedOnNotice == 'true' && value.ExitMonthLeaveDistribution.length > 0)
      this.fromandTodateValidation(value.ExitMonthLeaveDistribution);

    if (value && this.errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveAccrual/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
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

      IsLeavesProratedOnNotice: new FormControl(this.leaveAccrual.IsLeavesProratedOnNotice?'true' : 'false'),
      ExitMonthLeaveDistribution: this.buildFormArrayBetweenProbationPeriod(),
      IsNotAllowProratedOnNotice: new FormControl(this.leaveAccrual.IsNotAllowProratedOnNotice ?'true' : 'false'),
      IsNoLeaveOnNoticePeriod: new FormControl(this.leaveAccrual.IsNoLeaveOnNoticePeriod?'true' : 'false'),

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
    if (item.length == 0)
      this.addAccruralRateOnExp();
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

  createFormLeaveProrate(): FormGroup {
    return this.fb.group({
      FromDate: new FormControl(0),
      ToDate: new FormControl(0),
      AllocatedLeave: new FormControl(0)
    });
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
    if (item.length == 0)
      this.addFormBetweenExitDate();
  }

  submitApplyForLeave() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.applyForLeaveForm.value;
    if (value.ApplyPriorBeforeLeaveDate == null || value.ApplyPriorBeforeLeaveDate == '')
      value.ApplyPriorBeforeLeaveDate = -1;

    if (value.BackDateLeaveApplyNotBeyondDays == null || value.BackDateLeaveApplyNotBeyondDays == '')
      value.BackDateLeaveApplyNotBeyondDays = -1;

    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateApplyForLeave/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  initApplyForLeave() {
    this.applyForLeaveForm = this.fb.group({
      LeaveApplyDetailId: new FormControl(this.appplyingForLeave.LeaveApplyDetailId),
      LeavePlanTypeId: new FormControl(this.leavePlanTypeId),
      IsAllowForHalfDay: new FormControl(this.appplyingForLeave.IsAllowForHalfDay ? 'true': 'false'),
      EmployeeCanSeeAndApplyCurrentPlanLeave: new FormControl(this.appplyingForLeave.EmployeeCanSeeAndApplyCurrentPlanLeave ? 'true': 'false'),
      ApplyPriorBeforeLeaveDate: new FormControl(this.appplyingForLeave.ApplyPriorBeforeLeaveDate == -1 ? null : this.appplyingForLeave.ApplyPriorBeforeLeaveDate),
      BackDateLeaveApplyNotBeyondDays: new FormControl(this.appplyingForLeave.BackDateLeaveApplyNotBeyondDays == -1 ? null : this.appplyingForLeave.BackDateLeaveApplyNotBeyondDays),
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
    item.removeAt(i);
    if (item.length == 0)
      this.addRuleForLeaveInNotice();
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
      this.http.put(`ManageLeavePlan/UpdateLeaveRestriction/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
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
      AdjoiningWeekOffIsConsiderAsLeave:new FormControl(this.holidayWeekOffs.AdjoiningWeekOffIsConsiderAsLeave? 'true' : 'false'),
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
      this.http.put(`ManageLeavePlan/UpdateHolidayNWeekOffPlan/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  initleaveApproval() {
    this.leaveApprovalForm = this.fb.group({
      LeaveApprovalId: new FormControl(this.leaveApproval.LeaveApprovalId),
      LeavePlanTypeId:new FormControl(this.leaveApproval.LeavePlanTypeId),
      IsLeaveRequiredApproval: new FormControl(this.leaveApproval.IsLeaveRequiredApproval? 'true' : 'false'),
      IsRequiredAllLevelApproval: new FormControl(this.leaveApproval.IsRequiredAllLevelApproval),
      IsReportingManageIsDefaultForAction: new FormControl(this.leaveApproval.IsReportingManageIsDefaultForAction?'true' : 'false'),
      IsPauseForApprovalNotification: new FormControl(this.leaveApproval.IsPauseForApprovalNotification),
      ApprovalChain: this.buildApprovalChain(),
    })
  }

  addApprovalChain(): FormGroup {
    return this.fb.group({
      ApprovalRoleTypeId: new FormControl(0),
      IsSkipToNextLevel: new FormControl(false),
      SkipToNextLevelAfterDays: new FormControl(0)
    })
  }

  createApprovalChain(index: number) {
    let item = this.leaveApprovalForm.get('ApprovalChain') as FormArray;
    item.push(this.addApprovalChain());
    document.querySelectorAll('[data-name="skip-section"]')[index].classList.remove('d-none');
    document.querySelectorAll('[data-name="createApprovalChain"]')[index].classList.add('d-none');
  }

  removeApprovalChain(i: number) {
    let item = this.leaveApprovalForm.get('ApprovalChain') as FormArray;
    item.removeAt(i);
    if (i > 0) {
      let index = 0;
      while (index < item.length) {
        document.querySelectorAll('[data-name="createApprovalChain"]')[index].classList.add('d-none');
        index++;
      }
    }
    document.querySelectorAll('[data-name="createApprovalChain"]')[item.length-1].classList.remove('d-none');

    if (item.length == 0)
      this.createApprovalChain(0);
  }

  buildApprovalChain(): FormArray {
    let data = this.leaveApproval.ApprovalChain;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          ApprovalRoleTypeId: new FormControl(data[i].ApprovalRoleTypeId),
          IsSkipToNextLevel: new FormControl(data[i].IsSkipToNextLevel),
          SkipToNextLevelAfterDays: new FormControl(data[i].SkipToNextLevelAfterDays)
        }));
        i++;
      }
    } else {
      dataArray.push(this.addApprovalChain());
    }

    return dataArray;
  }

  skipLeaveNextLevel(e: any, i: number) {
    let value = e.target.checked;
    if (value == true)
      document.getElementsByName('SkipToNextLevelAfterDays')[i].removeAttribute('readonly');
    else
      document.getElementsByName('SkipToNextLevelAfterDays')[i].setAttribute('readonly', '');
  }

  submitLeaveApproval() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveApprovalForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateLeaveApproval/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.configPageNo = this.configPageNo + 1;
        this.ConfigPageTab(this.configPageNo);
        this.submit = false;
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  leaveRequestForApproval(e: any) {
    let value = e.target.value;
    if (value == 'true')
      document.querySelector('[data-name="ApprovalChainContainer"]').classList.remove('d-none');
    else
      document.querySelector('[data-name="ApprovalChainContainer"]').classList.add('d-none');
  }

  inityearEndProcess() {
    this.yearEndProcessForm = this.fb.group({
      LeaveEndYearProcessingId: new FormControl(this.yearEndProcess.LeaveEndYearProcessingId),
      LeavePlanTypeId: new FormControl(this.yearEndProcess.LeavePlanTypeId),
      IsLeaveBalanceExpiredOnEndOfYear: new FormControl(this.yearEndProcess.IsLeaveBalanceExpiredOnEndOfYear ? 'true' : 'false'),
      AllConvertedToPaid: new FormControl(this.yearEndProcess.AllConvertedToPaid ? 'true' : 'false'),
      AllLeavesCarryForwardToNextYear: new FormControl(this.yearEndProcess.AllLeavesCarryForwardToNextYear ? 'true' : 'false'),
      PayFirstNCarryForwordRemaning: new FormControl(this.yearEndProcess.PayFirstNCarryForwordRemaning ? 'true' : 'false'),
      CarryForwordFirstNPayRemaning: new FormControl(this.yearEndProcess.CarryForwordFirstNPayRemaning ? 'true' : 'false'),
      PayNCarryForwardDefineType: new FormControl(this.yearEndProcess.PayNCarryForwardDefineType),
      DoestCarryForwardExpired: new FormControl(this.yearEndProcess.DoestCarryForwardExpired ? 'true' : 'false'),
      ExpiredAfter: new FormControl(this.yearEndProcess.ExpiredAfter),
      DoesExpiryLeaveRemainUnchange: new FormControl(this.yearEndProcess.DoesExpiryLeaveRemainUnchange),
      DeductFromSalaryOnYearChange: new FormControl(this.yearEndProcess.DeductFromSalaryOnYearChange ? 'true' : 'false'),
      ResetBalanceToZero: new FormControl(this.yearEndProcess.ResetBalanceToZero ? 'true' : 'false'),
      CarryForwardToNextYear: new FormControl(this.yearEndProcess.CarryForwardToNextYear ? 'true' : 'false'),
      FixedPayNCarryForward: this.buildFixedNcarryForward(),
      PercentagePayNCarryForward: this.buildPercentageNcarryForward()
    })
  }

  buildPercentageNcarryForward() {
    let data = this.yearEndProcess.PercentagePayNCarryForward;
    let dataArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          PayNCarryForwardRuleInPercent: new FormControl(data[i].PayNCarryForwardRuleInPercent),
          PayPercent: new FormControl(data[i].PayPercent),
          CarryForwardPercent: new FormControl(data[i].CarryForwardPercent),
          IsMaximumPayableRequired: new FormControl(data[i].IsMaximumPayableRequired),
          MaximumPayableDays: new FormControl(data[i].MaximumPayableDays),
          IsMaximumCarryForwardRequired: new FormControl(data[i].IsMaximumCarryForwardRequired),
          MaximumCarryForwardDays: new FormControl(data[i].MaximumCarryForwardDays)
        }));
        i++;
      }
    } else {
      dataArray.push(this.addPercentageNcarryForward());
    }

    return dataArray;
  }

  addPercentageNcarryForward():FormGroup {
    return this.fb.group({
      PayNCarryForwardRuleInPercent: new FormControl(0),
      PayPercent: new FormControl(0),
      CarryForwardPercent: new FormControl(0),
      IsMaximumPayableRequired: new FormControl(false),
      MaximumPayableDays: new FormControl(0),
      IsMaximumCarryForwardRequired: new FormControl(false),
      MaximumCarryForwardDays: new FormControl(0),
    })
  }

  createPercentagePayNCarryForward() {
    let item = this.yearEndProcessForm.get('PercentagePayNCarryForward') as FormArray;
    item.push(this.addPercentageNcarryForward());
  }

  removePercentagePayNCarryForward(i: number) {
    let item = this.yearEndProcessForm.get('PercentagePayNCarryForward') as FormArray;
    item.removeAt(i);
    if (item.length == 0)
      this.createPercentagePayNCarryForward();
  }

  buildFixedNcarryForward() {
    let data = this.yearEndProcess.FixedPayNCarryForward;
    let dataArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          PayNCarryForwardRuleInDays: new FormControl(data[i].PayNCarryForwardRuleInDays),
          PaybleForDays: new FormControl(data[i].PaybleForDays),
          CarryForwardForDays: new FormControl(data[i].CarryForwardForDays)
        }));
        i++;
      }
    } else {
      dataArray.push(this.addFixedNcarryForward());
    }

    return dataArray;
  }

  addFixedNcarryForward():FormGroup {
    return this.fb.group({
      PayNCarryForwardRuleInDays: new FormControl(0),
      PaybleForDays: new FormControl(0),
      CarryForwardForDays: new FormControl(0)
    })
  }

  createFixedPayNCarryForward() {
    let item = this.yearEndProcessForm.get('FixedPayNCarryForward') as FormArray;
    item.push(this.addFixedNcarryForward());
  }

  removeFixedPayNCarryForward(i: number) {
    let item = this.yearEndProcessForm.get('FixedPayNCarryForward') as FormArray;
    item.removeAt(i);
    if (item.length == 0)
      this.createFixedPayNCarryForward();
  }

  toogleLeaveRestrictions(position: number, e: any) {
    switch (position) {
      case 1:
        this.leaveRestrictionForm.get('CanApplyAfterProbation').setValue('false');
        this.leaveRestrictionForm.get('CanApplyAfterJoining').setValue('false');
        this.leaveRestrictionForm.get(e.target.name).setValue(e.target.value);
        break;
    }
  }

  toogleHolidayAndWeekOff(position: number, e: any) {
    switch (position) {
      case 1:
        this.holidayWeekendOffForm.get('IfLeaveLieBetweenTwoHolidays').setValue('false');
        this.holidayWeekendOffForm.get('IfHolidayIsRightBeforLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfHolidayIsRightAfterLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfHolidayIsBetweenLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfHolidayIsRightBeforeAfterOrInBetween').setValue('false');
        this.holidayWeekendOffForm.get(e.target.name).setValue(e.target.value);
        break;
      case 2:
        this.holidayWeekendOffForm.get('IfLeaveLieBetweenWeekOff').setValue('false');
        this.holidayWeekendOffForm.get('IfWeekOffIsRightBeforLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfWeekOffIsRightAfterLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfWeekOffIsBetweenLeave').setValue('false');
        this.holidayWeekendOffForm.get('IfWeekOffIsRightBeforeAfterOrInBetween').setValue('false');
        this.holidayWeekendOffForm.get(e.target.name).setValue(e.target.value);
        break;
    }
  }

  toggleLeaveOnYearEnds(position: number, e: any) {
    switch(position) {
      case 1:
        this.yearEndProcessForm.get('IsLeaveBalanceExpiredOnEndOfYear').setValue('false');
        this.yearEndProcessForm.get('AllConvertedToPaid').setValue('false');
        this.yearEndProcessForm.get('AllLeavesCarryForwardToNextYear').setValue('false');
        this.yearEndProcessForm.get('PayFirstNCarryForwordRemaning').setValue('false');
        this.yearEndProcessForm.get('CarryForwordFirstNPayRemaning').setValue('false');
        this.yearEndProcessForm.get(e.target.name).setValue(e.target.value);
        break;
      case 2:
        this.yearEndProcessForm.get('DeductFromSalaryOnYearChange').setValue('false');
        this.yearEndProcessForm.get('ResetBalanceToZero').setValue('false');
        this.yearEndProcessForm.get('CarryForwardToNextYear').setValue('false');
        this.yearEndProcessForm.get(e.target.name).setValue(e.target.value);
        break;
    }
  }

  submitYearEndProcessing() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.yearEndProcessForm.value;
    if (value && errorCounter == 0) {
      this.http.put(`ManageLeavePlan/UpdateYearEndProcessing/${this.leavePlanTypeId}/${this.leaveTypeDeatils.LeavePlanId}`, value).then((res:ResponseModel) => {
        this.bindPage(res.ResponseBody);
        this.submit = false;
        this.isConfigCompleted = true;
        this.ConfigPageTab(9);
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
        this.nav.navigate(Attendance, null);
      break;
      case "timesheet-tab":
        this.nav.navigate(Timesheet, null);
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
          document.getElementById('LeaveBalanceCalculated').classList.remove('d-none');
        else
          document.getElementById('LeaveBalanceCalculated').classList.add('d-none');
        break;
      case 3:
        this.leaveAccrualForm.get('IsNoLeaveOnNoticePeriod').setValue('false');
        this.leaveAccrualForm.get('IsNotAllowProratedOnNotice').setValue('false');
        this.leaveAccrualForm.get('IsLeavesProratedOnNotice').setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue(e.target.value);
        let elem = document.getElementById("EmpExitMiddle");
        if(e.target.name == "IsNotAllowProratedOnNotice")
          elem.classList.remove('d-none');
        else
          elem.classList.add('d-none');
        break;
      case 5:
        this.leaveAccrualForm.get('IsAccrualStartsAfterJoining').setValue('false');
        this.leaveAccrualForm.get('IsAccrualStartsAfterProbationEnds').setValue('false');
        this.leaveAccrualForm.get(e.target.name).setValue(e.target.value);
        if (e.target.name == 'IsAccrualStartsAfterJoining') {
          document.getElementsByName('AccrualDaysAfterJoining')[0].removeAttribute('readonly');
          document.getElementsByName('AccrualDaysAfterProbationEnds')[0].setAttribute('readonly', '');
        } else {
          document.getElementsByName('AccrualDaysAfterJoining')[0].setAttribute('readonly', '');
          document.getElementsByName('AccrualDaysAfterProbationEnds')[0].removeAttribute('readonly');
        }
        break;
      case 8:
        if (e.target.name == "IsExtraLeaveBeyondAccruedBalance" || e.target.name == "IsNoExtraLeaveBeyondAccruedBalance") {
          this.leaveAccrualForm.get("IsExtraLeaveBeyondAccruedBalance").setValue('false');
          this.leaveAccrualForm.get("IsNoExtraLeaveBeyondAccruedBalance").setValue('false');
          this.leaveAccrualForm.get(e.target.name).setValue('true');
        }
        if (e.target.name == 'IsExtraLeaveBeyondAccruedBalance')
          document.getElementsByName('NoOfDaysForExtraLeave')[0].removeAttribute('readonly');
        else if (e.target.name == 'IsNoExtraLeaveBeyondAccruedBalance')
          document.getElementsByName('NoOfDaysForExtraLeave')[0].setAttribute('readonly', '');

        if (e.target.name == 'IsAccrueIfHavingLeaveBalance' && e.target.checked == true)
          document.getElementsByName('AllowOnlyIfAccrueBalanceIsAlleast')[0].removeAttribute('readonly');
        else if (e.target.name == 'IsAccrueIfHavingLeaveBalance' && e.target.checked == false) {
          document.getElementsByName('AllowOnlyIfAccrueBalanceIsAlleast')[0].setAttribute('readonly', '');
          this.leaveAccrualForm.get(e.target.name).setValue(e.target.checked);
        }

        if (e.target.name == 'IsAccrueIfOnOtherLeave' && e.target.checked == true)
          document.getElementsByName('NotAllowIfAlreadyOnLeaveMoreThan')[0].removeAttribute('readonly');
        else if (e.target.name == 'IsAccrueIfOnOtherLeave' && e.target.checked == false) {
          document.getElementsByName('NotAllowIfAlreadyOnLeaveMoreThan')[0].setAttribute('readonly', '');
          this.leaveAccrualForm.get(e.target.name).setValue(e.target.checked);
        }

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

  ConfigPageTab(index: number) {
    if (index > 0 && index <= 9) {
      this.configPageNo = index;
      let tab = document.getElementById('leaveConfigModal');
      let elem = tab.querySelectorAll('li[name="tab-index"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-index');
        elem[i].classList.remove('submitted-index');
      };
      tab.querySelector(`li[index='${this.configPageNo}']`).classList.add('active-index');
      if (index > 1) {
        for (let i = 0; i < index-1; i++) {
          elem[i].classList.add('submitted-index');
        }
      }
    }
  }

  gotoLeave() {
    this,this.nav.navigate(Leave, null)
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
  CanCompoffAllocatedAutomatically: boolean = false;
  CanCompoffCreditedByManager: boolean = false;
}

class Managementleave {
  CanManagerAwardCausalLeave: boolean = false;
}

class LeaveAccrual {
  LeaveAccrualId: number = 0;
  LeavePlanTypeId: number = 0;
  CanApplyEntireLeave: boolean = true;
  IsLeaveAccruedPatternAvail: boolean = null;
  JoiningMonthLeaveDistribution: any = {};
  ExitMonthLeaveDistribution: any = {};
  AccrualProrateDetail: any = {};
  LeaveDistributionAppliedFrom: number = 0;
  IsLeavesProratedForJoinigMonth: boolean = true;
  LeaveDistributionSequence: string = null;

  IsLeavesProratedOnNotice: boolean = null;
  IsNotAllowProratedOnNotice: boolean = null;
  BreakMonthLeaveAllocationId: number = 0;
  IsNoLeaveOnNoticePeriod: boolean = null;

  IsVaryOnProbationOrExprience: boolean = false;;
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
  EmployeeCanSeeAndApplyCurrentPlanLeave: boolean = true;
  ApplyPriorBeforeLeaveDate: number = null;
  BackDateLeaveApplyNotBeyondDays: number = null;
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
  LeavePlanTypeId: number = 0;
  IsLeaveRequiredApproval: boolean = null;
  ApprovalLevels: number = 0;
  ApprovalChain: Array<any> = [];
  IsRequiredAllLevelApproval: boolean = false;
  IsPauseForApprovalNotification: boolean = false;
  IsReportingManageIsDefaultForAction: boolean = false;
}

class YearEndProcess {
  LeaveEndYearProcessingId: number = 0
  LeavePlanTypeId: number = 0;
  IsLeaveBalanceExpiredOnEndOfYear: boolean = false;
  AllConvertedToPaid : boolean = false;
  AllLeavesCarryForwardToNextYear: boolean = false;
  PayFirstNCarryForwordRemaning : boolean = false;
  CarryForwordFirstNPayRemaning: boolean = false;
  PayNCarryForwardForPercent: boolean = false;
  PayNCarryForwardDefineType: string = null;
  DoestCarryForwardExpired: boolean = false;
  ExpiredAfter: number = 0;
  DoesExpiryLeaveRemainUnchange: boolean = false;
  DeductFromSalaryOnYearChange: boolean = false;
  ResetBalanceToZero: boolean = false;
  CarryForwardToNextYear: boolean = false;
  FixedPayNCarryForward: Array<FixedPayNCarryForward> = [];
  PercentagePayNCarryForward: Array<PercentagePayNCarryForward> = [];
}

class FixedPayNCarryForward {
  PayNCarryForwardRuleInDays: number = 0;
  PaybleForDays: number = 0;
  CarryForwardForDays: number = 0;
}

class PercentagePayNCarryForward {
  PayNCarryForwardRuleInPercent: number = 0;
  PayPercent: number = 0;
  CarryForwardPercent: number = 0;
  IsMaximumPayableRequired: boolean = false;
  MaximumPayableDays: number = 0;
  IsMaximumCarryForwardRequired: boolean = false;
  MaximumCarryForwardDays: number = 0;
}
