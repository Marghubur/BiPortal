import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-managetimesheet',
  templateUrl: './managetimesheet.component.html',
  styleUrls: ['./managetimesheet.component.scss']
})
export class ManagetimesheetComponent implements OnInit {
  userDetail: UserDetail = null;
  pageData: any = null;
  isLoading: boolean = false;
  fromDate: Date = null;
  toDate: Date = null;
  weeklyTimesheetDetail: any = {};
  timesheetForm: FormGroup = null;
  isSubmit: boolean = false;
  companyName: string = null;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private user: UserService
  ) {

  }

  ngOnInit(): void {
    this.pageData = this.nav.getValue();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.loadTimesheetData();
  }

  loadTimesheetData() {
    this.isLoading = true;
    if(this.pageData.EmployeeId <= 0) {
      Toast("Invalid user selected.")
      return;
    }

    if(!this.pageData.TimesheetStartDate) {
      Toast("Invalid from date seleted.")
      return;
    }

    if(!this.pageData.TimesheetEndDate) {
      Toast("Invalid to date seleted.")
      return;
    }

    this.fromDate = new Date(this.pageData.TimesheetStartDate);
    this.toDate = new Date(this.pageData.TimesheetEndDate);

    let data = {
      TimesheetId: this.pageData.TimesheetId
    }

    this.http.post("Timesheet/GetWeekTimesheetData", data).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.weeklyTimesheetDetail = response.ResponseBody;
        if (!this.weeklyTimesheetDetail.TimesheetWeeklyData && this.weeklyTimesheetDetail.TimesheetWeeklyData.length == 0) {
          ErrorToast("Invalid week detail received. Please contact to admin.");
          return;
        }

        this.initForm();
        Toast("Timesheet data loaded successfully.")
      }

      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      ErrorToast(err.error.HttpStatusMessage);
    });
  }

  breakIntoHoursAndMinutes(timeValue: number): string {
    let totalTime: string = "";
    try {
      let hours = Math.trunc(timeValue/60);
      if(hours < 10) {
        totalTime = `0${hours}`;
      } else {
        totalTime = `${hours}`;
      }

      let minutes = timeValue % 60;
      if(minutes < 10) {
        totalTime += `:0${minutes}`;
      } else {
        totalTime += `:${minutes}`;
      }
    } catch(e) {
      Toast("Invalid time used.");
    }
    return totalTime;
  }

  combineIntoMinutes(hoursvalue: string, minvalue) {
    let totalmin = (Number(hoursvalue) * 60) + (Number(minvalue))
    return totalmin;
  }

  getWeekDayDetail(weekDetail: any): FormGroup {
    let expectedTime = this.breakIntoHoursAndMinutes(weekDetail.ExpectedBurnedMinutes);
    let expectedHours = expectedTime.split(':')[0];
    let expectedMins = expectedTime.split(':')[1];
    let actualTime = this.breakIntoHoursAndMinutes(weekDetail.ActualBurnedMinutes);
    let actualHours = actualTime.split(':')[0];
    let actualMins = actualTime.split(':')[1];

    return this.fb.group({
      WeekDay: new FormControl(weekDetail.WeekDay),
      ExpectedHours: new FormControl(expectedHours),
      ExpectedMinutes: new FormControl(expectedMins),
      ActualHours: new FormControl(actualHours),
      ActualMinutes: new FormControl(actualMins),
      PresentDate: new FormControl(weekDetail.PresentDate),
      ExpectedBurnedMinutes: new FormControl(weekDetail.ExpectedBurnedMinutes),
      ActualBurnedMinutes: new FormControl(weekDetail.ActualBurnedMinutes)
    });
  }

  getWeeklyTimesheet(): FormArray {
    let array: FormArray = this.fb.array([]);
    array.clear();
    this.weeklyTimesheetDetail.TimesheetWeeklyData.map(e => {
      array.push(this.getWeekDayDetail(e));
    });

    return array;
  }

  initForm() {
    this.timesheetForm = this.fb.group({
      UserComments: new FormControl(""),
      WeeklyTimesheetDetail: this.getWeeklyTimesheet()
    });
  }

  get weeklydata(): FormArray {
    return this.timesheetForm.get("WeeklyTimesheetDetail") as FormArray;
  }

  saveTimesheet() {
    this.isSubmit = false;
    let value = this.timesheetForm.value;
    let totalExceptedMinutes = 0;
    let totalActualMinutes = 0;
    for (let i = 0; i < value.WeeklyTimesheetDetail.length; i++) {
      let expectedtime = this.combineIntoMinutes(value.WeeklyTimesheetDetail[i].ExpectedHours, value.WeeklyTimesheetDetail[i].ExpectedMinutes);
      value.WeeklyTimesheetDetail[i].ExpectedBurnedMinutes = expectedtime;
      totalExceptedMinutes += expectedtime;

      let actualtime = this.combineIntoMinutes(value.WeeklyTimesheetDetail[i].ActualHours, value.WeeklyTimesheetDetail[i].ActualMinutes);
      value.WeeklyTimesheetDetail[i].ActualBurnedMinutes = actualtime;
      totalActualMinutes += actualtime;
    }
  }

  submitTimesheet() {
    this.isSubmit = true;
    let formArray = this.weeklydata;
    
    let i = 0;
    let form: FormGroup = null;
    let timeInMinutes = 0;
    while(i < formArray.length) {
      form = formArray.controls[i] as FormGroup;
      timeInMinutes = this.combineIntoMinutes(form.get("ExpectedHours").value, form.get("ExpectedMinutes").value);
      form.get("ExpectedBurnedMinutes").setValue(timeInMinutes)

      timeInMinutes = this.combineIntoMinutes(form.get("ActualHours").value, form.get("ActualMinutes").value);
      form.get("ActualBurnedMinutes").setValue(timeInMinutes)
      i++;
    }

    this.sendData();
  }

  sendData() {
    let data = this.timesheetForm.value;
    this.weeklyTimesheetDetail.UserComments = data.UserComments;
    this.weeklyTimesheetDetail.TimesheetWeeklyData = data.WeeklyTimesheetDetail;
    this.weeklyTimesheetDetail.ExpectedBurnedMinutes = data.ExpectedBurnedMinutes;
    this.weeklyTimesheetDetail.ActualBurnedMinutes = data.ActualBurnedMinutes;
    this.http.post("Timesheet/SubmitTimesheet", this.weeklyTimesheetDetail).then((response: ResponseModel) => {
      if (response.ResponseBody) {

      }

      Toast("Submitted successfully");
    });
  }
}

