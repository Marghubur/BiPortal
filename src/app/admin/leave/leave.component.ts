import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Attendance, ManageLeavePlan, ManageYearEnding, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $:any;
import 'bootstrap'
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';
import { Files } from '../documents/documents.component';
import { Filter } from 'src/providers/userService';

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
  allLeaveTypes: Array<LeaveType> = [];
  currentPlan: LeavePlan = new LeavePlan();
  leaveTypeData: LeaveType = new LeaveType();
  planLeaveTypes: Array<LeaveType> = []
  leaveTypeDateIsReady: boolean = false;
  employeeFilter: Filter = new Filter();
  employees: Array<any> = [];
  assignEmpList: Array<any> = [];
  currentPlanEmpList: Array<any> = [];
  employeeIsReady: boolean = false;
  isLeavePageReady: boolean = false;

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
    this.menuItem = {
      Config: true,
      Emp: false,
      YearEnding: false,
    };
    this.loadLeaveData();
    this.initLeaveTypeForm();
    this.initLeavePlanForm();
  }

  loadLeaveData() {
    this.isLeavePageReady = false;
    this.http.post("leave/GetLeavePlans", this.employeeFilter).then((result: ResponseModel) => {
      if(result.ResponseBody) {
        if(result.ResponseBody.LeavePlan) {
          this.leavePlanList = result.ResponseBody.LeavePlan;
        } else {
          ErrorToast("Fail to load leave plan data.");
          return;
        }

        if(result.ResponseBody.Employees) {
          this.employees = result.ResponseBody.Employees;
          if(this.employees.length > 0)
            this.employeeFilter.TotalRecords = this.employees[0].Total;
          else
            this.employeeFilter.TotalRecords = 0;
        } else {
          this.employeeFilter.TotalRecords = 0;
          ErrorToast("Fail to load page data.");
          return;
        }

        this.bindFirstPlanOnPage();
        this.isLeavePageReady = true;
        Toast("Leave plan loaded successfully.");
      } else {
        ErrorToast("Fail to load leave plan.");
        this.leavePlanList = [];
      }
    });
  }

  saveLeaveType(){
    this.isLoading = true;
    this.submit = true;
    let errorCounter = 0;
    this.leaveTypeForm.get("Reasons").setValue('[]');
    let value = this.leaveTypeForm.value;
    if (this.leaveTypeForm.get('PlanName').errors !== null)
      errorCounter++;
    if (this.leaveTypeForm.get('LeavePlanCode').errors !== null)
      errorCounter++;
    if (this.leaveTypeForm.get('PlanDescription').errors !== null)
      errorCounter++;
    if(value && errorCounter === 0) {
      let Url: string = "";
      if(this.isUpdate) {
        Url = `leave/UpdateLeavePlanType/${this.leaveTypeData.LeavePlanTypeId}`;
        this.http.put(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
          this.isLoading = false;
          this.submit = false;
        });
      } else {
        Url = "leave/AddLeavePlanType";
        this.http.post(Url, value).then((response: ResponseModel) => {
          this.manageResponseOnUpdate(response);
          this.isLoading = false;
          this.submit = false;
        });
      }
    }
    this.isLoading = false;
  }

  get LeaveTypeConntrol() {
    return this.leaveTypeForm.controls;
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
        this.allLeaveTypes = response.ResponseBody;
        this.leaveTypes = response.ResponseBody;
        this.leaveTypeDateIsReady = true;
        Toast("Leave type data loaded successfully");
      } else {
        ErrorToast("Fail to laod Leave types. Please contact to admin");
      }
    });
  }

  bindLeaveTypeModal() {
    if(this.leaveTypes.length == 0)
    this.leaveTypeDateIsReady = false;
    this.http.get("leave/GetLeaveTypeFilter").then(response => {
      if(response.ResponseBody) {
        $('#assignLeaveTypeModal').modal('show');
        this.allLeaveTypes = response.ResponseBody;
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

  loadEmployeeData() {
    this.employeeIsReady = false;
    this.assignEmpList = [];
    this.currentPlanEmpList = [];
    this.http.get(`ManageLeavePlan/GetEmpMappingByLeavePlanId/${this.currentPlan.LeavePlanId}`)
    .then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.assignEmpList = res.ResponseBody;
        let i = 0;
        while(i < this.assignEmpList.length) {
          let result = this.employees.find(x => x.EmployeeUid == this.assignEmpList[i].EmployeeId);
          this.currentPlanEmpList.push(result);
          i++;
        }

        this.employeeIsReady = true;
      } else {
        ErrorToast("Fail to load employee data. Please contact to admin.");
      }
    })
  }

  addEmployeeToPlan() {
    if (this.assignEmpList.length > 0) {
      let i = 0;
      let empList = this.assignEmpList.filter(x => x.IsAdded == true);
      while(i < empList.length) {
        let value = this.employees.find(x => x.EmployeeUid == empList[i].EmployeeId);
        value.Active = true;
        i++;
      }
    }
    $('#showemployeesdetail').modal('show');
  }

  assignEmpListToPlan(item: any, e: any) {
    if (e.target.checked == true) {
      let elem = this.assignEmpList.find(x => x.EmployeeId === item.EmployeeUid);
      if (elem == null) {
        this.assignEmpList.push({
          EmployeeLeaveplanMappingId: 0,
          EmployeeId: item.EmployeeUid,
          LeavePlanId: this.currentPlan.LeavePlanId,
          IsAdded: true
        });
      } else
        elem.IsAdded = true;
    } else {
        let elem = this.assignEmpList.find(x => x.EmployeeId === item.EmployeeUid);
        if (elem != null)
          elem.IsAdded = false;
    }
  }

  assignEmpToPlan() {
    if (this.assignEmpList && this.assignEmpList.length > 0) {
      this.http.put(`ManageLeavePlan/AddUpdateEmpLeavePlan/${this.currentPlan.LeavePlanId}`, this.assignEmpList).
      then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.currentPlanEmpList = [];
          let addedEmployee = this.assignEmpList.filter(x => x.IsAdded == true);
          let i = 0;
          while(i < addedEmployee.length) {
            let result = this.employees.find(x => x.EmployeeUid == addedEmployee[i].EmployeeId);
            this.currentPlanEmpList.push(result);
            i++;
          }
          $('#showemployeesdetail').modal('hide');
          Toast("Employee's leave plan updated successfully");
        } else {
          Toast("Fail to update the plan");
        }
      })
    }
  }

  GetFilterResult(e: any) {
    if(e != null) {
      this.employeeFilter = e;
      this.addEmployeeToPlan();
    }
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
    if (response.ResponseBody){
      if(this.isUpdate) {
        this.allLeaveTypes = response.ResponseBody;
        this.leaveTypes = response.ResponseBody;
        Toast("Record updated successfully");
      }
      else
        Toast("Record inserted successfully");

      $('#addLeaveTypeModal').modal('hide');
    }
  }

  editLeavePlan(item: LeavePlan) {
    if (item) {
      this.leavePlan = item;
      let date = new Date(this.leavePlan.PlanStartCalendarDate);
      this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      this.initLeavePlanForm();
      $('#addLeavePlanModal').modal('show');
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

  assignLeaveType(e: any, item: LeaveType) {
    if (e.target.checked == true) {
      let elem = this.planLeaveTypes.find(x => x.LeavePlanTypeId === item.LeavePlanTypeId);
      if (elem != null)
        ErrorToast("Leave type already added. Please select another leave type.");
      else
        this.planLeaveTypes.push(item);
    } else {
        let index = this.planLeaveTypes.findIndex(x => x.LeavePlanCode === item.LeavePlanCode);
        if (index > -1)
          this.planLeaveTypes.splice(index, 1);
    }
  }

  addLeaveType() {
    if (this.currentPlan.LeavePlanId > 0) {
      this.isLoading = true;
      this.http.post(`Leave/LeavePlanUpdateTypes/${this.currentPlan.LeavePlanId}`, this.planLeaveTypes)
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
    $('#addLeaveTypeModal').modal('show');;
  }

  initLeaveTypeForm(){
    if(this.leaveTypeData.Reasons !== null && this.leaveTypeData.Reasons != "") {
      this.leaveTypeData.Reasons = JSON.parse(this.leaveTypeData.Reasons);
    }

    this.leaveTypeForm = this.fb.group({
      LeavePlanCode: new FormControl(this.leaveTypeData.LeavePlanCode, [Validators.required]),
      PlanName: new FormControl(this.leaveTypeData.PlanName, [Validators.required]),
      LeavePlanTypeId: new FormControl(this.leaveTypeData.LeavePlanTypeId),
      PlanDescription: new FormControl(this.leaveTypeData.PlanDescription, [Validators.required]),
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
    this.leavePlan = new LeavePlan();
    this.model = null;
    this.initLeavePlanForm()
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
    this.nav.navigate(ManageLeavePlan, currenType);
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

    this.leaveTypeDateIsReady = false;
    switch(code) {
      case 'Config':
        this.menuItem.Config = true;
        this.bindFirstPlanOnPage();
        break;
      case 'Emp':
        this.menuItem.Emp = true;
        this.loadEmployeeData();
        break;
      case 'YearEnding':
        this.menuItem.YearEnding = true;
        break;
    }
  }

  // -------------------Start---------------------

  initLeavePlanForm() {
    this.leavePlanForm = this.fb.group({
      LeavePlanId: new FormControl(this.leavePlan.LeavePlanId),
      PlanName: new FormControl(this.leavePlan.PlanName, [Validators.required]),
      PlanDescription: new FormControl(this.leavePlan.PlanDescription),
      AssociatedPlanTypes: new FormControl(this.leavePlan.AssociatedPlanTypes),
      PlanStartCalendarDate: new FormControl(null, [Validators.required]),
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

  filterLeaveType(e: any) {
    let value = e.target.value;
    let filterLeaveType = this.leaveTypes.filter(x => x.LeavePlanCode == value || x.PlanName == value);
    if (filterLeaveType.length > 0)
      this.leaveTypes = filterLeaveType;
  }

  resetFilterLeaveType(e: any) {
    e.target.value = '';
    this.leaveTypes = this.allLeaveTypes;
  }

  yearEndSetting() {
    this.nav.navigate(ManageYearEnding, null)
  }
}

class LeaveType {
  LeavePlanTypeId: number = 0;
  LeavePlanCode: string = null;
  PlanName: string = null;
  PlanDescription: string = null;
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
