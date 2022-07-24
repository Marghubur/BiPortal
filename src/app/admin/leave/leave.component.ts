import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Attendance, Timesheet } from 'src/providers/constants';
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
  leaveTypeCheck: string = null;
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
      if(this.isUpdate) {
        this.leaveTypes = response.ResponseBody;
        Toast("Record updated successfully");
      }
      else
        Toast("Record inserted successfully");

      $('#addLeaveTypeModal').modal('hide');
    }
  }

  leaveType(leaveType: string) {
    this.leaveTypeCheck = '';
    this.leaveTypeCheck = leaveType
  }

  showHideReasonList(){
    this.isListOfReason = !this.isListOfReason;
  }

  leaveTypePopUp() {
    this.leaveTypeData = new LeaveType();
    this.initLeaveTypeForm();
    $('#addLeaveTypeModal').modal('show');
  }

  updateRecord(item: LeaveType) {
    this.leaveTypeData = item;
    this.initLeaveTypeForm();
    this.isUpdate = true;
    $('#addLeaveTypeModal').modal('show');;
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
