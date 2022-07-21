import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Attendance, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;
import 'bootstrap'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  LeavePlan: Array<any> = [];
  isPageReady: boolean = false;
  menuItem: any = {};
  groupActiveId: number = 1;
  isListOfReason: boolean = false;
  leaveTypeForm: FormGroup;
  leaveTypeData: LeaveType = new LeaveType();
  leaveTypes: Array<any> = [];
  isUpdate: boolean = false;

  // -------------------Start--------------
  leavePlanForm: FormGroup;
  configPageNo: number = 1;
  leavePlan: LeavePlan = new LeavePlan();
  submit: boolean = false;
  isLoading: boolean = false;
  leaveQuotaForm: FormGroup;
  leaveQuota: LeaveQuota = new LeaveQuota();
  leaveAccrualForm: FormGroup;
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
    this.initLeaveTypeForm();
    this.initLeavePlanForm();
    this.initLeaveQuota();
    this.initLeaveAccrual();
  }

  loadLeaveData() {
    this.http.get("leave/GetAllLeavePlans").then((result: ResponseModel) => {
      if(result.ResponseBody) {
        this.leaveTypes = result.ResponseBody;
        Toast("Leave plan loaded successfully.");
      } else {
        ErrorToast("Fail to load leave plan.");
        this.leaveTypes = [];
      }
    });
  }

  saveLeaveType(){
    this.leaveTypeForm.get("Reasons").setValue('[]');
    let value = this.leaveTypeForm.value;


    if(value) {
      let Url: string = "";
      if(this.isUpdate) {
        Url = `leave/UpdateLeavePlans/${this.leaveTypeData.LeavePlanId}`;
        this.http.put(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
        });
      } else {
        Url = "leave/AddLeavePlans";
        this.http.post(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
        });
      }
    }
  }

  manageResponseOnUpdate(response: ResponseModel) {
    if (response.ResponseBody){
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

  updateRecord(item: LeaveType) {
    this.leaveTypeData = item;
    this.initLeaveTypeForm();
    this.isUpdate = true;
    this.leaveTypePopUp();
  }

  initLeaveTypeForm(){
    let reasons: Array<string> = [];
    if(this.leaveTypeData.Reasons !== null && this.leaveTypeData.Reasons != "") {
      this.leaveTypeData.Reasons = JSON.parse(this.leaveTypeData.Reasons);
    }

    this.leaveTypeForm = this.fb.group({
      LeavePlanCode: new FormControl(this.leaveTypeData.LeavePlanCode),
      PlanName: new FormControl(this.leaveTypeData.PlanName),
      LeavePlanId: new FormControl(this.leaveTypeData.LeavePlanId),
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

  assignLeavePopUp() {
    $('#assignLeaveTypeModal').modal('show');
  }

  leaveConfigPopUp() {
    $('#leaveConfigModal').modal('show');
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
    if (value) {
      if (value == 'true')
        document.querySelector('div[name="EmpJoinMiddle"]').classList.add('d-none');
      else
        document.querySelector('div[name="EmpJoinMiddle"]').classList.remove('d-none');
    }
  }

  EmpExitMiddle(e: any) {
    let value = e.target.value;
    if (value) {
      if (value == '2')
        document.querySelector('div[name="EmpExitMiddle"]').classList.remove('d-none');
      else
        document.querySelector('div[name="EmpExitMiddle"]').classList.add('d-none');
    }
  }

  AccrualLevelVary(e: any) {
    let value = e.target.value;
    if (value) {
      if (value == 'true')
        document.querySelector('div[name="EmpExitMiddle"]').classList.add('d-none');
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

  changeMdneu(code: string) {
    this.menuItem = {
      Config: false,
      Emp: false,
      YearEnding: false,
    };

    switch(code) {
      case 'Config':
        this.menuItem.CS = true;
        break;
      case 'Emp':
        this.menuItem.PR = true;
        break;
      case 'YearEnding':
        this.menuItem.LAH = true;
        break;
    }
  }

  changeTab(index: number, item: any) {
    this.isPageReady = false;
    if(index >= 0 &&  item.CompanyId > 0) {
      let result = document.querySelectorAll('.list-group-item > a');
      let i = 0;
      while (i < result.length) {
        result[i].classList.remove('active-tab');
        i++;
      }
      result[index].classList.add('active-tab');
      this.isPageReady = true;
    } else {
      ErrorToast("Please select a company.")
    }
  }

  // -------------------Start---------------------

  initLeavePlanForm() {
    this.leavePlanForm = this.fb.group({
      Name: new FormControl(this.leavePlan.Name, [Validators.required]),
      Description: new FormControl(this.leavePlan.Description),
      LeaveCalenderStart: new FormControl(this.leavePlan.LeaveCalenderStart, [Validators.required]),
      IsHiringBellLeavePolicy: new FormControl(this.leavePlan.IsHiringBellLeavePolicy),
      IsCustomLeavePolicy: new FormControl(this.leavePlan.IsCustomLeavePolicy)
    })
  }

  get f() {
    return this.leavePlanForm.controls;
  }

  onDateSelection(e: NgbDateStruct) {
    let value = new Date(e.year, e.month-1, e.day);
    this.leavePlanForm.get('LeaveCalenderStart').setValue(value);
  }

  addLeavePlan() {
    this.submit = true;
    this.isLoading = true;
    let errorCounter = 0;
    if (this.leavePlanForm.get('LeaveCalenderStart').errors !== null)
      errorCounter++;
    if(this.leavePlanForm.get('Name').errors !== null)
      errorCounter++;
    let value = this.leavePlanForm.value;
    if (value && errorCounter == 0) {
      console.log(value);
      this.submit = false;
      this.isLoading = false;
    }
    this.isLoading = false;
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
    switch (this.configPageNo) {
      case 1:
        this.submitLeaveQuota();
        break;
    }
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

  initLeaveAccrual() {
    this.leaveAccrualForm = this.fb.group({
      IsLeaveBalanceCalculated: new FormControl (),
      AccrualRateBasedon: new FormControl(),
      AccrualAnnualQuota: new FormControl(),
      IsEmpJoinMiddle: new FormControl(),
      IsEmpExitMiddle: new FormControl(),

    })
  }
}

class LeaveType {
  LeavePlanId: number = 0;
  LeaveGroupId: number;
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
}

class LeavePlan {
  Name: string = '';
  Description: string = '';
  LeaveCalenderStart: Date = null;
  IsHiringBellLeavePolicy: boolean = true;
  IsCustomLeavePolicy: boolean = false;
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
