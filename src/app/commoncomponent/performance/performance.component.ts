import { AfterViewChecked, Component, DoCheck, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
import 'bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { iNavigation } from 'src/providers/iNavigation';
import { Subject } from 'rxjs';
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
  allMeetings: Array<any> = [];
  upcomingMeetings: Array<Meeting> = [];
  pendingMeetings: Array<Meeting> = [];
  completedMeetings: Array<Meeting> = [];
  selectedMeeting: Meeting = new Meeting();
  htmlText: any = null;
  eventsSubject: Subject<void> = new Subject<void>();
  activeMeetingTab: number = 1;

  constructor(private user: UserService,
              private http: AjaxService,
              private nav:iNavigation,
              private fb: FormBuilder) { }

  ngDoCheck(): void {
    if (this.meetingForm.controls.endTime.value && this.meetingForm.controls.startTime.value) {
      this.meetingDuration = this.getMeetingDuration(this.meetingForm.controls.endTime.value, this.meetingForm.controls.startTime.value);
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
      this.initMeetingForm();
    } else {
      Toast("Invalid user. Please login again.")
    }
  }

  loadData() {
    this.isPageReady = false;
    this.isPageLoading = true;
    this.http.get(`performance/getEmployeeObjective/${this.designationId}/${this.userDetail.CompanyId}/${this.employeeId}`, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.financialYear = res.ResponseBody[0].financialYear;
        let days = new Date(this.financialYear+1, res.ResponseBody[0].declarationEndMonth, 0).getDate();
        this.startDate = new Date(this.financialYear, res.ResponseBody[0].declarationStartMonth-1, 1);
        this.endDate = new Date(this.financialYear+1, res.ResponseBody[0].declarationEndMonth-1, days);
        this.minDate = {year: this.startDate.getFullYear(), month: this.startDate.getMonth()+1, day: this.startDate.getDate()};
        this.maxDate = {year: this.endDate.getFullYear(), month:  this.endDate.getMonth()+1, day:  this.endDate.getDate()};
        this.allObjective = res.ResponseBody;;
        this.objectives = res.ResponseBody;
        this.calculateRecord();
        this.getUserNameIcon(null);
        Toast("Employee performance objective data loaded successsfully");
        this.isPageReady = true;
        this.isPageLoading = false;
      } else {
        WarningToast("No objective details found. Please contact to admin.");
        this.isPageLoading = false;
        this.isPageReady = true;
      }
    }).catch(err => {
      ErrorToast("Fail to get objective detail. Please contact to admin.");
      this.isPageLoading = false;
      this.isPageReady = true;
    })
  }

  getMeetingDuration(endtimes: string, starttimes: string) {
    let meetingDuration = "";
    let endtime = endtimes.split(":");
    let starttime = starttimes.split(":");
    let endhrs = Number(endtime[0]);
    let endmin = Number(endtime[1]);
    let endTime = (endhrs * 60) + endmin;
    let starthrs = Number(starttime[0]);
    let startmin = Number(starttime[1]);
    let startTime = (starthrs * 60) + startmin;
    if (endTime > startTime) {
      meetingDuration = this.convertMinsToHrsMins(endTime-startTime) ;
    }
    return meetingDuration;
  }

  calculateRecord() {
    this.onTrackRecord = 0;
    this.needAttentionRecord = 0;
    this.atRiskRecord = 0;
    this.notStartedRecord = 0;
    this.closedRecord = 0;
    let targetValue = this.objectives.map(x => x.targetValue).reduce((a, b) => {return a+b}, 0);
    let currentValue = this.objectives.map(x => x.currentValue).reduce((a, b) => {return a+b}, 0);
    this.overallProgress = (currentValue/targetValue) * 100;
    let value = this.objectives.filter(x => x.status == 1);
    if (value.length > 0)
      this.notStartedRecord = value.length;

    value = this.objectives.filter(x => x.status == 2);
    if (value.length > 0)
      this.onTrackRecord = value.length;

    value = this.objectives.filter(x => x.status == 3);
    if (value.length > 0)
      this.needAttentionRecord = value.length;

    value = this.objectives.filter(x => x.status == 4);
    if (value.length > 0)
      this.atRiskRecord = value.length;

    value = this.objectives.filter(x => x.status == 5);
    if (value.length > 0)
      this.closedRecord = value.length;
  }

  initForm() {
    this.performanceForm = this.fb.group({
      objectiveId: new FormControl(this.selectedObjective != null ? this.selectedObjective.objectiveId : 0),
      employeePerformanceId: new FormControl(this.selectedObjective != null ? this.selectedObjective.employeePerformanceId : 0, [Validators.required]),
      employeeId: new FormControl(this.employeeId, [Validators.required]),
      companyId: new FormControl(this.userDetail.CompanyId, [Validators.required]),
      currentValue: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      comments: new FormControl(''),
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

    let performvalue = this.performanceForm.value;
    performvalue.targetValue = this.selectedObjective.targetValue;
    if (performvalue.currentValue > this.selectedObjective.targetValue) {
      this.isLoading = false;
      ErrorToast("New value is greater than targeted value");
      return;
    }
    this.http.post("performance/updateEmployeeObjective", performvalue, true).then(res => {
      if (res.ResponseBody) {
        let value = res.ResponseBody;
        this.selectedObjective.updatedOn = value.updatedOn;
        this.selectedObjective.currentValue = value.currentValue;
        this.selectedObjective.status = value.status;
        this.selectedObjective.performanceDetail = JSON.parse(value.performanceDetail);
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
      this.objectives = this.allObjective.filter(x => x.status == value);
    } else {
      this.objectives = this.allObjective;
    }
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.meetingForm.controls["meetingDate"].setValue(date);
  }

  onSelectEmp(e: any) {
    let index = this.selectedEmployee.findIndex(x => x.value == e.value);
    if(index == -1) {
      let emp = this.employeesList.data.find(x => x.value == e.value);
      this.selectedEmployee.push(emp);
    } else {
      this.selectedEmployee.splice(index, 1);
    }
  }

  initMeetingForm() {
    this.meetingForm = this.fb.group({
      meetingId: new FormControl(this.selectedMeeting.meetingId),
      startTime: new FormControl(this.selectedMeeting.startTime, [Validators.required]),
      endTime: new FormControl(this.selectedMeeting.endTime, [Validators.required]),
      meetingDate: new FormControl(this.selectedMeeting.meetingDate, [Validators.required]),
      meetingTitle: new FormControl(this.selectedMeeting.meetingTitle, [Validators.required]),
      meetingPlaforms: new FormControl(this.selectedMeeting.meetingPlaforms),
      meetingFrequency: new FormControl(this.selectedMeeting.meetingFrequency),
      talkingPoints: new FormControl(''),
      employeesMeeting: new FormControl('')
    })
  }

  get f() {
    return this.meetingForm.controls;
  }

  addMeetingPopUp() {
    this.resetMeeting();
    this.selectedMeeting = new Meeting();
    this.initMeetingForm();
    $('#manageMeeting').modal('show');
  }

  manageMeeting() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.meetingForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }

    if (this.selectedEmployee.length <= 0) {
      this.isLoading = false;
      ErrorToast("Please employee to have a 1:1 meeting");
      return;
    }

    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (!data) {
      this.isLoading = false;
      ErrorToast("Please enter talking points");
      return;
    }

    this.meetingForm.get('talkingPoints').setValue(data);
    let value = this.meetingForm.value;
    if (this.selectedEmployee.length > 0)
      value.employeesMeeting = this.selectedEmployee.map(x => x.value);

    this.http.post("meeting/manageMeeting", value, true).then(res => {
      if (res.ResponseBody) {
        this.allMeetings = res.ResponseBody;
        this.bindMeetingData();
        $("#manageMeeting").modal('hide');
        this.isLoading = false;
        Toast("Metting details insert/updated successfully");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  convertMinsToHrsMins(totalMinutes) {
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);

    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }

  getEmployeesMeeting() {
    this.isPageReady = false;
    this.isPageLoading = true;
    this.http.get(`meeting/getMeetingByEmpId/${this.employeeId}`, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.allMeetings = res.ResponseBody;
        this.bindMeetingData();
        Toast("Meeting data loaded successsfully");
        this.isPageReady = true;
        this.isPageLoading = false;
      } else {
        WarningToast("No meeting details found. Please add metting.");
        this.isPageLoading = false;
        this.isPageReady = true;
      }
    }).catch(err => {
      ErrorToast("Fail to get meeting detail. Please contact to admin.");
      this.isPageLoading = false;
      this.isPageReady = true;
    })
  }

  bindMeetingData() {
    this.selectedEmployee = [];
    this.allMeetings.forEach(x => {
      x.meetingDuration = this.getMeetingDuration(x.endTime, x.startTime);
      x.employeesMeeting = JSON.parse(x.oneToOneEmpMeeting);
      x.meetingWith = this.employeesList.data.find(i => i.value ==  x.employeesMeeting[0]).text;
      if (x.employeesMeeting.length > 1)
        x.extraMember = x.employeesMeeting.length - 1;
      else
        x.extraMember = 0;
      
      x.daysDiffer = this.daysDiffer(x.meetingDate)
    });
    this.upcomingMeetings = this.allMeetings.filter(x => x.status == 0);
    this.pendingMeetings = this.allMeetings.filter(x => x.status == 2);
    this.completedMeetings = this.allMeetings.filter(x => x.status == 1 || x.status == 3);
    if (this.upcomingMeetings.length > 0 || this.pendingMeetings.length > 0) {
      if (this.upcomingMeetings.length > 0)
        this.selectedMeeting = this.upcomingMeetings[0];
      else 
        this.selectedMeeting = this.pendingMeetings[0];

      this.htmlText = JSON.parse(this.selectedMeeting.talkingPoints);
      this.selectedMeeting.createBy = this.employeesList.data.find(x => x.value == this.selectedMeeting.createdBy).text;
      this.selectedMeeting.employeesMeeting.forEach(y => {
        let emp: any = this.employeesList.data.find(x => x.value == y);
        emp.userNameIcon = this.getUserNameIcon(emp.text)
        this.selectedEmployee.push(emp);
      })
    } else {
      this.resetMeeting();
    }
  }

  bindCompletedMeeting() {
    if (this.completedMeetings.length > 0) {
      this.selectedEmployee = [];
      this.selectedMeeting = this.completedMeetings[0];
      this.htmlText = JSON.parse(this.selectedMeeting.talkingPoints);
      this.selectedMeeting.employeesMeeting = JSON.parse(this.selectedMeeting.oneToOneEmpMeeting);
      this.selectedMeeting.createBy = this.employeesList.data.find(x => x.value == this.selectedMeeting.createdBy).text;
      this.selectedMeeting.employeesMeeting.forEach(y => {
        let emp: any = this.employeesList.data.find(x => x.value == y);
        emp.userNameIcon = this.getUserNameIcon(emp.text)
        this.selectedEmployee.push(emp);
      })
    } else {
      this.resetMeeting();
    }
  }

  selectMeeting(item, e: any) {
    if (item) {
      this.selectedEmployee = [];
      this.selectedMeeting = item;
      this.htmlText = JSON.parse(this.selectedMeeting.talkingPoints);
      this.selectedMeeting.employeesMeeting = JSON.parse(this.selectedMeeting.oneToOneEmpMeeting);
      this.selectedMeeting.createBy = this.employeesList.data.find(x => x.value == this.selectedMeeting.createdBy).text;
      this.selectedMeeting.employeesMeeting.forEach(y => {
        let emp: any = this.employeesList.data.find(x => x.value == y);
        emp.userNameIcon = this.getUserNameIcon(emp.text)
        this.selectedEmployee.push(emp);
      })
      let elem = document.getElementsByName("meetingevents");
      elem.forEach(x => {
        if (x.classList.contains('active'))
          x.classList.remove('active');
      });
      e.target.closest('button').classList.add('active');
    }
  }

  editMeetings() {
    this.initMeetingForm();
    this.selectedMeeting.meetingDate = new Date(this.selectedMeeting.meetingDate);
    this.model = { day: this.selectedMeeting.meetingDate.getDate(), month: this.selectedMeeting.meetingDate.getMonth() + 1, year: this.selectedMeeting.meetingDate.getFullYear()};
    $("#manageMeeting").modal('show');
  }

  performanceReviewPopUp() {
    $('#performanceReview').modal('show');
  }

  getUserNameIcon(fullName: string) {
    if (!fullName) {
      let first = this.userDetail.FirstName[0];
      let last = this.userDetail.LastName[0];
      this.userNameIcon = first+""+last;
    } else {
      let names = fullName.split(" ");
      let first = fullName[0];
      let last = fullName[1];
      return first+""+last;
    }
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

  resetMeeting() {
    this.eventsSubject.next();
    this.selectedEmployee = [];
    this.selectedMeeting = null;
    this.meetingDuration = null;
    this.model = null;
    this.htmlText = null;
  }

  meetingTab(index: number) {
    this.activeMeetingTab = index;
    if (this.activeMeetingTab === 1)
      this.bindMeetingData();
    else
      this.bindCompletedMeeting();
  }

  deleteMeetingPopUp() {
    $("#deleteMeeting").modal('show');
  }

  completeMeetingPopUp() {
    $("#completeMeeting").modal('show');
  }

  cancelMeetingPopUp() {
    $("#cancelMeeting").modal('show');
  }

  completeMeeting() {
    if (this.selectedMeeting) {
      this.isLoading = true;
      this.http.get(`meeting/updateMeetingStatus/${this.selectedMeeting.meetingId}/1`, true).then(res => {
        if (res.ResponseBody) {
          this.allMeetings = res.ResponseBody;
          this.bindMeetingData();
          $("#completeMeeting").modal('hide');
          this.isLoading = false;
          Toast("Metting completed successfully");
        } else {
          ErrorToast("Fail to metting completed ");
        }
      }).catch(e => {
        this.isLoading = false;
        ErrorToast("Fail to metting completed ");
      })
    } else {
      ErrorToast("Please select meeting firsst")
    }
  }

  cancelMeeting() {
    if (this.selectedMeeting) {
      this.isLoading = true;
      this.http.get(`meeting/updateMeetingStatus/${this.selectedMeeting.meetingId}/3`, true).then(res => {
        if (res.ResponseBody) {
          this.allMeetings = res.ResponseBody;
          this.bindMeetingData();
          $("#cancelMeeting").modal('hide');
          this.isLoading = false;
          Toast("Meeting canceled successfully");
        } else {
          ErrorToast("Fail to canceled meeting status");
        }
      }).catch(e => {
        this.isLoading = false;
        ErrorToast("Fail to canceled meeting status");
      })
    } else {
      ErrorToast("Please select meeting firsst")
    }
  }

  deleteMeeting() {
    if (this.selectedMeeting) {
      this.isLoading = true;
      this.http.delete(`meeting/deleteMeeting/${this.selectedMeeting.meetingId}`, true).then(res => {
        if (res.ResponseBody) {
          this.allMeetings = res.ResponseBody;
          this.bindMeetingData();
          $("#deleteMeeting").modal('hide');
          this.isLoading = false;
          Toast("Metting deleted successfully");
        } else {
          ErrorToast("Fail to delete meeting");
        }
      }).catch(e => {
        this.isLoading = false;
        ErrorToast("Fail to delete meeting");
      })
    } else {
      ErrorToast("Please select meeting firsst")
    }
  }

  daysDiffer(date: any) {
    var diffTime = (new Date().getTime() - new Date(date).getTime());
    var daysDiff = diffTime / (1000 * 3600 * 24);
    let hrsDiff = diffTime / (1000 * 3600);
    let minDiff = Math.abs(Math.round( diffTime/1000/60 ));
    let diff = {
      days: daysDiff > 0 ? daysDiff : 0,
      hrs: hrsDiff > 0 ? hrsDiff : 0,
      min: minDiff > 0 ? minDiff : 0
    };
    return diff;
  }

}

class Objective {
  objectiveId: number = 0;
  objective: string = null;
  objSeeType: boolean = false;
  progressMeassureType: number = 1;
  employeePerformanceId: number = 0;
  startValue: number = 0;
  targetValue: number = 0;
  timeFrameStart: Date = null;
  timeFrmaeEnd: Date = null;
  objectiveType: string = null;
  description: string = null;
  currentValue: number = 0;
  updatedOn: Date = null;
  status: number = 0;
  progress: number = 0;
  performanceDetail: Array<any> = [];
}

class Meeting {
  meetingId: number = 0;
  startTime: string = null;
  endTime: string = null;
  meetingDate: Date = null;
  meetingTitle: string = null;
  meetingPlaforms: number = 0;
  meetingFrequency: number = null;
  talkingPoints: string = null;
  employeesMeeting: Array<number> = [];
  oneToOneEmpMeeting: string = null;
  meetingDuration: string = null;
  createBy: string = null;
  status: number = 0;
  createdBy: number = 0;
}
