import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Attendance, ManageLeavePlan, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;
import 'bootstrap'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';
import { Files } from '../documents/documents.component';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements OnInit, AfterViewChecked{
  cachedData: any = null;
  active = 1;
  model: NgbDateStruct;
  leavePlanList: Array<any> = [];
  isPageReady: boolean = false;
  menuItem: any = {};
  groupActiveId: number = 1;
  isListOfReason: boolean = false;
  leaveTypeForm: FormGroup;
  leaveTypes: Array<LeaveType> = [];
  isUpdate: boolean = false;

  currentPlan: LeavePlan = new LeavePlan();
  leaveTypeData: LeaveType = new LeaveType();
  planLeaveTypes: Array<LeaveType> = []
  assignLeaveTypes: Array<LeaveType> = [];
  leaveTypeDateIsReady: boolean = false;

  // -------------------Start--------------
  leavePlanForm: FormGroup;
  configPageNo: number = 1;
  leavePlan: LeavePlan = new LeavePlan();
  submit: boolean = false;
  isLoading: boolean = false;
  leaveQuotaForm: FormGroup;
  leaveQuota: LeaveQuota = new LeaveQuota();
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
  // ------------------End------------------

  constructor(private nav: iNavigation,
              private fb: FormBuilder,
              private http: AjaxService
              ) { }

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
    this.loadLeaveData();
    this.initLeaveTypeForm()


    this.initLeavePlanForm();
    this.initLeaveQuota();
    this.initLeaveAccrual();
    this.initApplyForLeave();
    this.initLeaveRestriction();
    this.initholidayWeekendOff();
    this.initleaveApproval();
    this.inityearEndProcess();
  }

  loadLeaveData() {
    this.http.get("leave/GetLeavePlans").then((result: ResponseModel) => {
      if(result.ResponseBody) {
        this.leavePlanList = result.ResponseBody;
        this.bindFirstPlanOnPage();
        Toast("Leave plan loaded successfully.");
      } else {
        ErrorToast("Fail to load leave plan.");
        this.leavePlanList = [];
      }
    });
  }

  saveLeaveType(){
    this.leaveTypeForm.get("Reasons").setValue('[]');
    let value = this.leaveTypeForm.value;

    if(value) {
      let Url: string = "";
      if(this.isUpdate) {
        Url = `leave/UpdateLeavePlanType/${this.leaveTypeData.LeavePlanTypeId}`;
        this.http.put(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
        });
      } else {
        Url = "leave/AddLeavePlanType";
        this.http.post(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
        });
      }
    }
  }

  onTabChange(index: number) {
    switch(index) {
      case 0:
        this.bindFirstPlanOnPage();
        break;
      case 1:
        this.loadLeaveType();
        break;
    }
  }

  bindFirstPlanOnPage() {
    if(this.leavePlanList.length > 0) {
      this.currentPlan = this.leavePlanList[0];
      if(this.currentPlan.AssociatedPlanTypes){
        this.planLeaveTypes = JSON.parse(this.currentPlan.AssociatedPlanTypes);
      }

      this.isPageReady = true;
    } else {
      this.isPageReady = false;
    }
  }

  loadLeaveType() {
    this.leaveTypeDateIsReady = false;
    this.http.get("leave/GetLeaveTypeFilter").then(response => {
      if(response.ResponseBody) {
        this.leaveTypes = response.ResponseBody;
        this.leaveTypeDateIsReady = true;
        Toast("Leave type data loaded successfully");
      } else {
        ErrorToast("Fail to laod Leave types. Please contact to admin");
      }
    });
  }

  bindLeaveTypeModal() {
    $('#assignLeaveTypeModal').modal('show');
    if(this.leaveTypes.length == 0)
    this.leaveTypeDateIsReady = false;
    this.http.get("leave/GetLeaveTypeFilter").then(response => {
      if(response.ResponseBody) {
        this.leaveTypes = response.ResponseBody;

        if(this.currentPlan != null && this.currentPlan.AssociatedPlanTypes) {
          this.planLeaveTypes = JSON.parse(this.currentPlan.AssociatedPlanTypes);

          let i = 0;
          while(i < this.leaveTypes.length) {
            if(this.planLeaveTypes.find(x => x.LeavePlanTypeId == this.leaveTypes[i].LeavePlanTypeId) != null) {
              this.leaveTypes[i].IsActive = true;
            } else {
              this.leaveTypes[i].IsActive = false;
            }
            i++;
          }
        }

        this.leaveTypeDateIsReady = true;
        Toast("Leave type data loaded successfully");
      } else {
        ErrorToast("Fail to laod Leave types. Please contact to admin");
      }
    });
  }

  selectedPlan(index: number, item: any) {
    this.isPageReady = false;
    this.currentPlan = item;
    if(index >= 0 &&  item.LeavePlanId > 0) {
      let result = document.querySelectorAll('.list-group-item > a');
      let i = 0;
      while (i < result.length) {
        result[i].classList.remove('active-tab');
        i++;
      }

      result[index].classList.add('active-tab');
      if(this.currentPlan.AssociatedPlanTypes) {
        this.planLeaveTypes = JSON.parse(this.currentPlan.AssociatedPlanTypes);

        let i = 0;
        while(i < this.leaveTypes.length) {
          if(this.planLeaveTypes.find(x => x.LeavePlanTypeId == this.leaveTypes[i].LeavePlanTypeId) != null) {
            this.leaveTypes[i].IsActive = true;
          } else {
            this.leaveTypes[i].IsActive = false;
          }
          i++;
        }
      }

      this.isPageReady = true;
    } else {
      ErrorToast("Please select a company.")
    }
  }

  manageResponseOnUpdate(response: ResponseModel) {
    if (response.ResponseBody) {
      this.leaveTypes = response.ResponseBody;
      if(this.isUpdate)
        Toast("Record updated successfully");
      else
        Toast("Record inserted successfully");

      $('#addLeaveTypeModal').modal('hide');
    }
  }

  leaveType(e: any) {

  }

  showHideReasonList(){
    this.isListOfReason = !this.isListOfReason;
  }

  leaveTypePopUp() {
    $('#addLeaveTypeModal').modal('show');
  }

  assignLeaveType(e: any, item: LeaveType) {
    if (e.target.checked == true) {
      let elem = this.assignLeaveTypes.find(x => x.LeavePlanCode === item.LeavePlanCode);
      if (elem != null)
        ErrorToast("Leave type already added. Please select another leave type.");
      else
        this.assignLeaveTypes.push(item);
    } else {
        let index = this.assignLeaveTypes.findIndex(x => x.LeavePlanCode === item.LeavePlanCode);
        if (index > -1)
          this.assignLeaveTypes.splice(index, 1);
    }
  }

  addLeaveType() {
    this.isLoading = true;
    if (this.currentPlan.LeavePlanId > 0 && this.assignLeaveTypes.length > 0) {
      this.http.post(`Leave/LeavePlanUpdateTypes/${this.currentPlan.LeavePlanId}`, this.assignLeaveTypes)
      .then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.currentPlan = res.ResponseBody;
          this.planLeaveTypes = JSON.parse(res.ResponseBody.AssociatedPlanTypes);
          $('#assignLeaveTypeModal').modal('hide');
          this.isLoading = false;
          Toast('Leave Type is added successfully. ')
        }
      })
    }
  }

  updateRecord(item: LeaveType) {
    this.leaveTypeData = item;
    this.initLeaveTypeForm();
    this.isUpdate = true;
    this.leaveTypePopUp();
  }

  initLeaveTypeForm(){
    if(this.leaveTypeData.Reasons !== null && this.leaveTypeData.Reasons != "") {
      this.leaveTypeData.Reasons = JSON.parse(this.leaveTypeData.Reasons);
    }

    this.leaveTypeForm = this.fb.group({
      LeavePlanCode: new FormControl(this.leaveTypeData.LeavePlanCode),
      PlanName: new FormControl(this.leaveTypeData.PlanName),
      LeavePlanTypeId: new FormControl(this.leaveTypeData.LeavePlanTypeId),
      PlanDescription: new FormControl(this.leaveTypeData.PlanDescription),
      ShowDescription: new FormControl(this.leaveTypeData.ShowDescription),
      IsPaidLeave: new FormControl(this.leaveTypeData.IsPaidLeave),
      IsSickLeave: new FormControl(this.leaveTypeData.IsSickLeave),
      IsStatutoryLeave: new FormControl(this.leaveTypeData.IsStatutoryLeave),
      IsRestrictOnGender: new FormControl(this.leaveTypeData.IsRestrictOnGender),
      IsMale: new FormControl(this.leaveTypeData.IsMale),
      IsRestrictOnMaritalStatus: new FormControl(this.leaveTypeData.IsRestrictOnMaritalStatus),
      IsMarried: new FormControl(this.leaveTypeData.IsMarried),
      Reasons: new FormControl(this.leaveTypeData.Reasons)
    })
  }

  leavePlanPopUp() {
    $('#addLeavePlanModal').modal('show');
  }

  customLeavePolicy(e: any) {
    let value = e.target.checked;
    let elem = document.querySelector('p[name="custom-policy"]')
    if (value == true)
      elem.classList.remove('d-none');
    else
      elem.classList.add('d-none');
  }

  setUpLeaveConfig(currenType: any) {
    this.nav.navigate(ManageLeavePlan, currenType.LeavePlanId);
  }

  noLeaveQuotaAllow(e: any) {
    let value = e.target.checked;
    if (value == false)
      document.querySelector('input[name="LeaveQuotaAllocatedAfter"]').setAttribute('readonly', '');
    else
      document.querySelector('input[name="LeaveQuotaAllocatedAfter"]').removeAttribute('readonly');
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

  changeMenu(code: string) {
    this.menuItem = {
      Config: false,
      Emp: false,
      YearEnding: false,
    };

    switch(code) {
      case 'Config':
        this.menuItem.CS = true;
        this.bindFirstPlanOnPage();
        break;
      case 'Emp':
        this.menuItem.PR = true;
        break;
      case 'YearEnding':
        this.menuItem.LAH = true;
        break;
    }
  }

  // -------------------Start---------------------

  initLeavePlanForm() {
    this.leavePlanForm = this.fb.group({
      PlanName: new FormControl(this.leavePlan.PlanName, [Validators.required]),
      PlanDescription: new FormControl(this.leavePlan.PlanDescription),
      AssociatedPlanTypes: new FormControl(this.leavePlan.AssociatedPlanTypes),
      PlanStartCalendarDate: new FormControl(this.leavePlan.PlanStartCalendarDate, [Validators.required]),
      IsShowLeavePolicy: new FormControl(this.leavePlan.IsShowLeavePolicy),
      IsUploadedCustomLeavePolicy: new FormControl(this.leavePlan.IsUploadedCustomLeavePolicy)
    })
  }

  get f() {
    return this.leavePlanForm.controls;
  }

  onDateSelection(e: NgbDateStruct) {
    let value = new Date(e.year, e.month-1, e.day);
    this.leavePlanForm.get('PlanStartCalendarDate').setValue(value);
  }

  addLeavePlan() {
    this.submit = true;
    this.isLoading = true;
    let errorCounter = 0;
    if (this.leavePlanForm.get('PlanStartCalendarDate').errors !== null)
      errorCounter++;
    if(this.leavePlanForm.get('PlanName').errors !== null)
      errorCounter++;
    let value = this.leavePlanForm.value;
    if (value && errorCounter == 0) {
      console.log(value);
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;

    this.http.post('leave/AddLeavePlan', this.leavePlanForm.value).then(response => {
      if(response.ResponseBody) {
        this.submit = false;
        this.isLoading = false;
        this.leavePlanList = response.ResponseBody;
        $('#addLeavePlanModal').modal('hide');
        this.bindFirstPlanOnPage();
        Toast("Plan inserted/update successfully.");
      } else {
        ErrorToast("Fail to inserted/update.");
      }
    });
  }

  fireBrowseOption() {
    $('#customLeavePolicy').click();
  }

  uploadLeavePolicy(e: any) {
    let selectedFile = e.target.files;
    if (selectedFile && selectedFile.length > 0) {
      let file = <File>selectedFile[0];
      let item: Files = new Files();
      item.FileName = file.name;
      item.FileSize = Number(file.size/1024);
      item.Email = '';
      item.DocumentId = 0;
      item.FileType = file.type;
      item.FileExtension = file.type;
      item.UserId = 0;
    }
  }

  initLeaveQuota() {
    this.leaveQuotaForm = this.fb.group({
      IsQuotaLimit: new FormControl(this.leaveQuota.IsQuotaLimit? 'true':'false'),
      QuotaLimit: new FormControl(this.leaveQuota.QuotaLimit),
      IsBeyondAnnualQuota: new FormControl(this.leaveQuota.IsBeyondAnnualQuota? 'true':'false'),
      BeyondAnnualQuota: new FormControl(this.leaveQuota.BeyondAnnualQuota),
      IsLeaveQuotaAllocated: new FormControl(this.leaveQuota.IsLeaveQuotaAllocated),
      LeaveQuotaAllocatedAfter: new FormControl(this.leaveQuota.LeaveQuotaAllocatedAfter),
      IsManagerAwardCasual: new FormControl(this.leaveQuota.IsManagerAwardCasual? 'true':'false')
    })
  }

  submitLeaveQuota() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveQuotaForm.value;
    if (value && errorCounter == 0) {
      console.log(value);
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
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
      document.getElementsByName('QuotaLimit')[0].removeAttribute('readonly');
    else
      document.getElementsByName('QuotaLimit')[0].setAttribute('readonly', '');
  }

  prevConfigPage() {
    this.configPageNo = this.configPageNo - 1;
    let tab = document.getElementById('leaveConfigModal');
    let elem = tab.querySelectorAll('div[name="tab-index"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-index');
      };
      tab.querySelector(`div[index='${this.configPageNo}']`).classList.add('active-index');
      tab.querySelector(`div[index='${this.configPageNo}']`).classList.remove('submitted-index');
      tab.querySelector(`div[index='${this.configPageNo + 1}']`).classList.remove('submitted-index');
  }

  NextConfigPage() {

    if (this.configPageNo > 0 && this.configPageNo <= 6) {
      this.configPageNo = this.configPageNo + 1;
      let tab = document.getElementById('leaveConfigModal');
      let elem = tab.querySelectorAll('div[name="tab-index"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-index');
      };
      tab.querySelector(`div[index='${this.configPageNo}']`).classList.add('active-index');
      if (this.configPageNo > 1)
        tab.querySelector(`div[index='${this.configPageNo - 1}']`).classList.add('submitted-index');
    }
  }

  submitLeaveAccrual() {
    this.submit = true;
    this.isLoading = true
    let errorCounter = 0;
    let value = this.leaveAccrualForm.value;
    if (value && errorCounter == 0) {
      console.log(value);
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
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
}

class LeaveType {
  LeavePlanTypeId: number = 0;
  LeavePlanCode: string = null;
  PlanName: string = '';
  PlanDescription: string = '';
  MaxLeaveLimit: number;
  ShowDescription: boolean = false;
  IsPaidLeave: boolean = false;
  IsSickLeave: boolean = false;
  IsStatutoryLeave: boolean = false;
  IsRestrictOnGender: boolean = false;
  IsMale: boolean = null;
  IsRestrictOnMaritalStatus: boolean = false;
  IsMarried: boolean = null;
  Reasons: any = null;
  IsActive: boolean = false;
}

class LeavePlan {
  LeavePlanId: number = 0;
  PlanName: string = null;
  PlanDescription: string = null;
  AssociatedPlanTypes: string = null;
  PlanStartCalendarDate: Date = null;
  IsShowLeavePolicy: boolean = true;
  IsUploadedCustomLeavePolicy: boolean = false;
}

class LeaveQuota {
  IsQuotaLimit: boolean = true;
  QuotaLimit: number = 0;
  IsBeyondAnnualQuota: boolean = false;
  BeyondAnnualQuota: number = 0;
  IsLeaveQuotaAllocated: boolean = false;
  LeaveQuotaAllocatedAfter: number = 0;
  IsManagerAwardCasual: boolean = false;
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
