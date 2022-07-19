import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast } from 'src/providers/common-service/common.service';
import { Attendance, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;
import 'bootstrap'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';

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
  leaveTypeData: LeaveType=new LeaveType();

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
  }

  loadLeaveData() {
    let request = {

    };

    this.http.get("leave/GetAllLeavePlans").then((result: ResponseModel) => {

    });
  }

  readLeaveTypeData(){
    console.log(this.leaveTypeForm.value);
  }


  showHideReasonList(){
    this.isListOfReason =!this.isListOfReason;
  }


  leaveTypePopUp() {
    $('#addLeaveTypeModal').modal('show');
  }

  initLeaveTypeForm(){
    this.leaveTypeForm=this.fb.group({
      name: new FormControl(this.leaveTypeData.name),
      code: new FormControl(this.leaveTypeData.code),
      description: new FormControl(this.leaveTypeData.description),
      isShowLeaveDescription: new FormControl(this.leaveTypeData.isShowLeaveDescription),
      isPaidLeave: new FormControl(this.leaveTypeData.isPaidLeave),
      isSickLeave: new FormControl(this.leaveTypeData.isSickLeave),
      isStatutoryLeave: new FormControl(this.leaveTypeData.isStatutoryLeave),
      isRestrictTo: new FormControl(this.leaveTypeData.isRestrictTo),
      gender: new FormControl(this.leaveTypeData.gender),
      isRestrictToEmployeesHaving: new FormControl(this.leaveTypeData.isRestrictToEmployeesHaving),
      maritalStatus: new FormControl(this.leaveTypeData.maritalStatus),
      isListOfReasons: new FormControl(this.leaveTypeData.isListOfReasons),
      reasonsForLeave: new FormControl(this.leaveTypeData.reasonsForLeave)

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
      document.querySelector('input[name="noLeaveQuotaAllow"]').setAttribute('readonly', '');
    else
      document.querySelector('input[name="noLeaveQuotaAllow"]').removeAttribute('readonly');
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
      if (value == 'true')
        document.querySelector('input[name="noLeaveQuotaAllow"]').setAttribute('readonly', '');
      else
        document.querySelector('input[name="noLeaveQuotaAllow"]').removeAttribute('readonly');
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
}

class LeaveType {
  name: String='';
  code: String='';
  description: String='';
  isShowLeaveDescription: boolean=null;
  isPaidLeave: boolean=null;
  isSickLeave: boolean=null;
  isStatutoryLeave: boolean=null;
  isRestrictTo: boolean=null;
  gender: String='';
  isRestrictToEmployeesHaving: boolean=null;
  maritalStatus: String;
  isListOfReasons: boolean=null;
  reasonsForLeave: String='';

}
