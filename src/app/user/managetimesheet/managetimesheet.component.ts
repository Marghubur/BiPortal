import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
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
      EmployeeId: this.pageData.EmployeeId,
      ClientId: this.pageData.ClientId,
      TimesheetStartDate: this.fromDate,
      TimesheetStatus: this.pageData.TimesheetStatus,
      ForYear: this.fromDate.getFullYear()
    }

    this.isLoading = true;
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

  breakIntoHoursAndMinutes() {

  }

  combineIntoMinutes() {

  }

  getWeekDayDetail(weekDetail: any): FormGroup {
    let expectedHours = "08"; // weekDetail.ExpectedBurnedMinutes
    let expectedMins = "00";
    let actualHours = "08"; // weekDetail.ActualBurnedMinutes
    let actualMins = "00";

    return this.fb.group({
      WeekDay: new FormControl(weekDetail.WeekDay),
      ExpectedHours: new FormControl(expectedHours),
      ExpectedMinutes: new FormControl(expectedMins),
      ActualHours: new FormControl(actualHours),
      ActualMinutes: new FormControl(actualMins),
      PresentDate: new FormControl(weekDetail.PresentDate)
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
}
