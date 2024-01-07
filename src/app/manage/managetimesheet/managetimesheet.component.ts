import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, GetWeekNumber, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-managetimesheet',
  templateUrl: './managetimesheet.component.html',
  styleUrls: ['./managetimesheet.component.scss']
})
export class ManagetimesheetComponent implements OnInit {
  userDetail: UserDetail = null;
  pageData: any = null;
  isPageReady: boolean = false;
  isLoading: boolean = false;
  fromDate: Date = null;
  toDate: Date = null;
  weeklyTimesheetDetail: any = {};
  timesheetForm: FormGroup = null;
  isSubmit: boolean = false;
  companyName: string = null;
  totalExpectedBurnHrs: string = null;
  totalActualBurnHrs: string = null;
  weekNumber: string = null;
  currentWeekTimesheet: any = {};
  isAdmin: boolean = false;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav: iNavigation,
              private user: UserService
  ) {}

  ngOnInit(): void {
    this.pageData = this.nav.getValue();
    this.userDetail = this.user.getInstance() as UserDetail;
    if (this.userDetail.RoleId == UserType.Admin)
      this.isAdmin = true;

    this.loadTimesheetData();
  }

  loadTimesheetData() {
    this.isPageReady = true;
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

    this.http.get(`Timesheet/GetWeekTimesheetData/${this.pageData.TimesheetId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.currentWeekTimesheet = response.ResponseBody;
        this.buildPage(response.ResponseBody);
        Toast("Timesheet data loaded successfully.")
      }

      this.isPageReady = false;
    }).catch(err => {
      this.isPageReady = false;
      ErrorToast(err.error.HttpStatusMessage);
    });
  }

  buildPage(response: any) {
    this.weeklyTimesheetDetail = response;
    if (!this.weeklyTimesheetDetail.TimesheetWeeklyData && this.weeklyTimesheetDetail.TimesheetWeeklyData.length == 0) {
      ErrorToast("Invalid week detail received. Please contact to admin.");
      return;
    }
    let totalexpectedBurnHrs = this.weeklyTimesheetDetail.TimesheetWeeklyData.map(x => x.ExpectedBurnedMinutes).reduce((acc, curr) => {return acc + curr;}, 0);
    this.totalExpectedBurnHrs = this.breakIntoHoursAndMinutes(totalexpectedBurnHrs);
    let totalactualBurnHrs = this.weeklyTimesheetDetail.TimesheetWeeklyData.map(x => x.ActualBurnedMinutes).reduce((acc, curr) => {return acc + curr;}, 0);
    this.totalActualBurnHrs = this.breakIntoHoursAndMinutes(totalactualBurnHrs);
    this.weekNumber =  GetWeekNumber(this.weeklyTimesheetDetail.TimesheetStartDate);
    this.initForm();
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
      ActualBurnedMinutes: new FormControl(weekDetail.ActualBurnedMinutes),
      IsWeekEnd: new FormControl(weekDetail.IsWeekEnd)
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
      UserComments: new FormControl(this.weeklyTimesheetDetail.UserComments),
      WeeklyTimesheetDetail: this.getWeeklyTimesheet()
    });
  }

  get weeklydata(): FormArray {
    return this.timesheetForm.get("WeeklyTimesheetDetail") as FormArray;
  }

  saveTimesheet() {
    this.isSubmit = false;
    this.sendData("Timesheet/SaveTimesheet");
  }

  submitTimesheet() {
    this.isSubmit = true;
    this.sendData("Timesheet/SubmitTimesheet");
  }

  sendData(url: string) {
    this.isLoading = true;
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

    let data = this.timesheetForm.value;
    let expectedTime = this.totalExpectedBurnHrs.split(':');
    let actualTime = this.totalActualBurnHrs.split(':');
    this.weeklyTimesheetDetail.UserComments = data.UserComments;
    this.weeklyTimesheetDetail.TimesheetWeeklyData = data.WeeklyTimesheetDetail;
    this.weeklyTimesheetDetail.ExpectedBurnedMinutes = this.combineIntoMinutes(expectedTime[0], expectedTime[1]);
    this.weeklyTimesheetDetail.ActualBurnedMinutes = this.combineIntoMinutes(actualTime[0], actualTime[1]);
    this.http.post(url, this.weeklyTimesheetDetail).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.currentWeekTimesheet = response.ResponseBody;
        this.buildPage(response.ResponseBody);
      }
      this.isLoading = false;
      Toast(`Timesheet ${this.isSubmit ? 'submitted' : 'saved'} successfully`);
    }).catch(e => {
      this.isLoading = false;
    });
  }

  manageMinField(index: number, e: any) {
    let min = parseInt(e.target.value);
    let value: any = "";
    if (min > 0) {
      if (min >= 60) {
        ErrorToast("Please enter a valid minutes");
        value = "00"
      } else
        value = (min < 10 ? `0${min}` : min).toString();
    } else {
      value = "00";
    }
    let records = this.timesheetForm.get("WeeklyTimesheetDetail")["controls"];
    if(records && records.length >= index) {
      records[index].get("ActualMinutes").setValue(value);
    }
    this.countTotalTime();
  }

  manageHrsField(index: number, e: any) {
    let hrs = parseInt(e.target.value);

    let value: any = "";
    if (hrs > 0) {
      if (hrs > 24) {
        ErrorToast("Please enter a valid hours");
        value = "00"
      } else
        value = (hrs < 10 ? `0${hrs}` : hrs).toString();
    } else {
      value = "00";
    }
    let records = this.timesheetForm.get("WeeklyTimesheetDetail")["controls"];
    if(records && records.length >= index) {
      records[index].get("ActualHours").setValue(value);
    }
    this.countTotalTime();
  }

  countTotalTime() {
    let records = this.timesheetForm.get("WeeklyTimesheetDetail").value;
    let actualhrs = records.map(x => Number(x.ActualHours)).reduce((acc, curr) => {return acc + curr;}, 0)
    let actualmin = records.map(x => Number(x.ActualMinutes)).reduce((acc, curr) => {return acc + curr;}, 0)
    this.totalActualBurnHrs = this.breakIntoHoursAndMinutes((actualhrs*60)+actualmin);
  }

  clearTimesheet() {
    if (this.currentWeekTimesheet)
      this.buildPage(this.currentWeekTimesheet);
  }

}
