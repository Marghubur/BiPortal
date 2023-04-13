import { AfterViewChecked, Component, DoCheck, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
import 'bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.scss']
})
export class PerformanceComponent implements OnInit, AfterViewChecked, DoCheck {
  isPageReady: boolean = true;
  active = 1;
  isPageLoading: boolean = false;
  userDetail: any = null;
  employeeId: number = 0;
  designationId: number = 0;
  objectives: Array<Objective> = [];
  financialYear: number = 0;
  startDate: Date = null;
  endDate: Date = null;
  selectedObjective: Objective = null;
  isLoading: boolean = false;
  performanceForm: FormGroup;
  isSubmitted: boolean = false;
  onTrackRecord: number = 0;
  needAttentionRecord: number = 0;
  atRiskRecord: number = 0;
  notStartedRecord: number = 0;
  closedRecord: number = 0;
  allObjective: Array<any> = [];
  overallProgress: number = 0;
  meetingForm: FormGroup;
  model: NgbDateStruct;
  minDate: any = null;
  maxDate: any = null;
  employeesList: autoCompleteModal = new autoCompleteModal();
  selectedEmployee: Array<any> = [];
  empId: number = 0;
  meetingDuration: string = "";
  userNameIcon: string = "";

  constructor(private user: UserService,
              private http: AjaxService,
              private nav:iNavigation,
              private fb: FormBuilder) { }

  ngDoCheck(): void {
    if (this.meetingForm.controls.EndTime.value && this.meetingForm.controls.StartTime.value) {
      let endtime = this.meetingForm.controls.EndTime.value.split(":");
      let endhrs = Number(endtime[0]);
      let endmin = Number(endtime[1]);
      let endTime = (endhrs * 60) + endmin;
      let starttime = this.meetingForm.controls.StartTime.value.split(":");
      let starthrs = Number(starttime[0]);
      let startmin = Number(starttime[1]);
      let startTime = (starthrs * 60) + startmin;
      if (endTime > startTime) {
        this.meetingDuration = this.convertMinsToHrsMins(endTime-startTime) ;
      }
    }
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.isPageReady =false;
    let data = this.nav.getValue();
    if (data) {
      this.userDetail = data;
      this.employeeId = data.EmployeeUid;
    }
    else {
      this.userDetail = this.user.getInstance();
      this.employeeId = this.userDetail.UserId;
    }

    if(this.userDetail && this.userDetail !== null) {
      this.designationId = this.userDetail.DesignationId;
      this.employeesList.data = [];
      this.employeesList.placeholder = "Employee";
      this.employeesList.data = GetEmployees();
      this.employeesList.className = "";
      this.employeesList.isMultiSelect = true;
      this.loadData();
      this.initForm();
      this.initMettingForm();
    } else {
      Toast("Invalid user. Please login again.")
    }
  }

  loadData() {
    this.isPageReady = false;
    this.isPageLoading = true;
    this.http.get(`Objective/GetEmployeeObjective/${this.designationId}/${this.userDetail.CompanyId}/${this.employeeId}`).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.financialYear = res.ResponseBody[0].FinancialYear;
        let days = new Date(this.financialYear+1, res.ResponseBody[0].DeclarationEndMonth, 0).getDate();
        this.startDate = new Date(this.financialYear, res.ResponseBody[0].DeclarationStartMonth-1, 1);
        this.endDate = new Date(this.financialYear+1, res.ResponseBody[0].DeclarationEndMonth-1, days);
        this.minDate = {year: this.startDate.getFullYear(), month: this.startDate.getMonth()+1, day: this.startDate.getDate()};
        this.maxDate = {year: this.endDate.getFullYear(), month:  this.endDate.getMonth()+1, day:  this.endDate.getDate()};
        this.allObjective = res.ResponseBody;;
        this.objectives = res.ResponseBody;
        this.calculateRecord();
        this.getUserNameIcon();
        Toast("Employee performance objective data loaded successsfully");
        this.isPageReady = true;
        this.isPageLoading = false;
      } else {
        ErrorToast("No objective details found. Please contact to admin.");
        this.isPageLoading = false;
        this.isPageReady = true;
      }
    }).catch(err => {
      ErrorToast("Fail to get objective detail. Please contact to admin.");
      this.isPageLoading = false;
      this.isPageReady = true;
    })
  }

  calculateRecord() {
    this.onTrackRecord = 0;
    this.needAttentionRecord = 0;
    this.atRiskRecord = 0;
    this.notStartedRecord = 0;
    this.closedRecord = 0;
    let targetValue = this.objectives.map(x => x.TargetValue).reduce((a, b) => {return a+b}, 0);
    let currentValue = this.objectives.map(x => x.CurrentValue).reduce((a, b) => {return a+b}, 0);
    this.overallProgress = (currentValue/targetValue) * 100;
    let value = this.objectives.filter(x => x.Status == 1);
    if (value.length > 0)
      this.notStartedRecord = value.length;

    value = this.objectives.filter(x => x.Status == 2);
    if (value.length > 0)
      this.onTrackRecord = value.length;

    value = this.objectives.filter(x => x.Status == 3);
    if (value.length > 0)
      this.needAttentionRecord = value.length;

    value = this.objectives.filter(x => x.Status == 4);
    if (value.length > 0)
      this.atRiskRecord = value.length;

    value = this.objectives.filter(x => x.Status == 5);
    if (value.length > 0)
      this.closedRecord = value.length;
  }

  initForm() {
    this.performanceForm = this.fb.group({
      ObjectiveId: new FormControl(this.selectedObjective != null ? this.selectedObjective.ObjectiveId : 0),
      EmployeePerformanceId: new FormControl(this.selectedObjective != null ? this.selectedObjective.EmployeePerformanceId : 0, [Validators.required]),
      EmployeeId: new FormControl(this.employeeId, [Validators.required]),
      CompanyId: new FormControl(this.userDetail.CompanyId, [Validators.required]),
      CurrentValue: new FormControl(null, [Validators.required]),
      Status: new FormControl(null, [Validators.required]),
      Comments: new FormControl(''),
    })
  }

  get n() {
    return this.performanceForm.controls;
  }

  editPerformance(item: Objective) {
    if (item) {
      this.selectedObjective = item;
      $('#editPerformance').modal('show');
    }
  }

  updateEmpObjective() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.performanceForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    let value = this.performanceForm.value;
    this.http.post("Objective/UpdateEmployeeObjective", value).then(res => {
      if (res.ResponseBody) {
        let value = res.ResponseBody;
        this.selectedObjective.UpdatedOn = value.UpdatedOn;
        this.selectedObjective.CurrentValue = value.CurrentValue;
        this.selectedObjective.Status = value.Status;
        this.selectedObjective.PerformanceDetail = JSON.parse(value.PerformanceDetail);
        this.calculateRecord();
        this.isLoading = false;
        $('#managePerformance').modal('hide');
        Toast("Employee performance objective updated successsfully");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  updateEmpObjectivePopUp() {
    this.isSubmitted = false;
    this.initForm();
    $('#managePerformance').modal('show');
  }

  resetFilter() {
    this.objectives = this.allObjective;
  }

  filterRecord(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      this.objectives = this.allObjective.filter(x => x.Status == value);
    }
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.meetingForm.controls["MettingDate"].setValue(date);
  }

  addMeetingPopUp() {
    $('#manageMetting').modal('show');
  }

  onSelectEmp(e: any) {
    let index = this.selectedEmployee.findIndex(x => x.EmployeeId == e.value);
    if(index == -1) {
      let emp = this.employeesList.data.find(x => x.value == e.value);
      this.selectedEmployee.push(emp);
    } else {
      this.selectedEmployee.splice(index, 1);
    }
  }

  initMettingForm() {
    this.meetingForm = this.fb.group({
      MettingId: new FormControl(0),
      StartTime: new FormControl(null, [Validators.required]),
      EndTime: new FormControl(null, [Validators.required]),
      MettingDate: new FormControl(null, [Validators.required]),
      MeetingTitle: new FormControl(null, [Validators.required]),
      MeetingPlaforms: new FormControl(0),
      MeetingFrequency: new FormControl(null),
      TalkingPoints: new FormControl('')
    })
  }

  get f() {
    return this.meetingForm.controls;
  }

  manageMetting() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.meetingForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }

    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    let value = this.meetingForm.value;
    value.TalkingPoints = data;
    if (this.selectedEmployee.length > 0)
      value.Employees = this.selectedEmployee.map(x => x.value);
    console.log(value);
  }

  convertMinsToHrsMins(totalMinutes) {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }

  performanceReviewPopUp() {
    //$('#performanceReview').modal('show');
  }

  getUserNameIcon() {
    let first = this.userDetail.FirstName[0];
    let last = this.userDetail.LastName[0];
    this.userNameIcon = first+""+last;
  }

  collpaseShowHide(e: any) {
    if (e) {
      let elem = document.getElementById(e);
      let classContain = elem.classList.contains('hide-collapse');
      if (classContain) {
        elem.classList.remove('hide-collapse');
        elem.classList.add('show-collapse');
      }
      else {
        elem.classList.add('hide-collapse');
        elem.classList.remove('show-collapse');
      }
    }
  }

}

class Objective {
  ObjectiveId: number = 0;
  Objective: string = null;
  ObjSeeType: boolean = false;
  ProgressMeassureType: number = 1;
  EmployeePerformanceId: number = 0;
  StartValue: number = 0;
  TargetValue: number = 0;
  TimeFrameStart: Date = null;
  TimeFrmaeEnd: Date = null;
  ObjectiveType: string = null;
  Description: string = null;
  CurrentValue: number = 0;
  UpdatedOn: Date = null;
  Status: number = 0;
  Progress: number = 0;
  PerformanceDetail: Array<any> = [];
}
