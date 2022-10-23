import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { data } from 'jquery';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, UserLeave, UserTimesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  isFormReady: boolean = false;
  attendanceArray: FormArray;
  employeeId: number = 0;
  userName: string = "";
  fromDate: any = null;
  toDate: any = null;
  isEmployeesReady: boolean = false;
  userDetail: UserDetail = new UserDetail();
  time = new Date();
  intervalId;
  DayValue: number = 0;
  clientId: number = 0;
  client: any = null;
  isLoading: boolean = false;
  billingHrs: string = '';
  NoClient: boolean = false;
  isAttendanceDataLoaded: boolean = false;
  divisionCode: number = 0;
  daysInMonth: number = 0;
  monthName: Array<any> = [];
  presentMonth: boolean = true;
  cachedData: any = null;
  currentAttendance: any = null;



  //-------------------------- required code starts --------------------------

  commentValue: string = null;
  today: Date = null;
  tomorrow: Date = null;
  isComment: boolean = false;
  currentDays: Array<any> = [];

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private user: UserService
  ) { }

  ngOnInit(): void {
    this.today = new Date();
    this.tomorrow = new Date(new Date().setDate(this.today.getDate() + 1));
    this.isFormReady = false;
    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);

    this.DayValue = this.time.getDay();
    this.cachedData = this.nav.getValue();
    this.isEmployeesReady = true;
    if(this.cachedData) {
      this.employeeId = this.cachedData.EmployeeUid;
      this.clientId = this.cachedData.ClientUid;
      this.userName = this.cachedData.FirstName + " " + this.cachedData.LastName;
      this.loadMappedClients();
    } else {
      let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
      this.userDetail = this.user.getInstance() as UserDetail;
      if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
      else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.userDetail = Master["UserDetail"];
        this.employeeId = this.userDetail.UserId;
        this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
        //$('#loader').modal('show');
        this.loadMappedClients();
      } else {
        Toast("Invalid user. Please login again.")
      }
    }
  }

  bindAttendace(data: Array<any>) {
    if(data && data.length > 0) {
      this.currentDays = [];
      this.presentMonth = true;
      let index = 0;
      while(index < data.length) {
        data[index].AttendanceDay = new Date(data[index].AttendanceDay);
        let dayValue = data[index].AttendanceDay.getDay();
        if (dayValue == 0 || dayValue == 6) {
          data[index].PresentDayStatus = 3;
          data[index].AttendenceStatus = 3;
        }
        index++;
      }

      this.currentDays = data;
    } else {
      WarningToast("Unable to bind data. Please contact admin.");
    }
  }

  loadMappedClients() {
    this.isLoading = true;
    if(this.employeeId <= 0) {
      Toast("Invalid user selected.")
      return;
    }

    let now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let data = {
      EmployeeUid: Number(this.employeeId),
      ClientId: Number(this.clientId),
      UserTypeId : UserType.Employee,
      AttendenceFromDay: this.fromDate,
      AttendenceToDay: this.toDate,
      ForYear: this.fromDate.getFullYear(),
      ForMonth: this.fromDate.getMonth() + 1
    }

    this.http.post("Attendance/GetAttendanceByUserId", data).then((response: ResponseModel) => {
      if(response.ResponseBody.EmployeeDetail) {
        this.client = response.ResponseBody.EmployeeDetail;
        this.getMonths();
      }
      else {
        this.NoClient = true;
        this.isAttendanceDataLoaded = false;
      }

      if (response.ResponseBody.AttendacneDetails) {
        this.bindAttendace(response.ResponseBody.AttendacneDetails);
        //this.createPageData(response.ResponseBody.AttendacneDetails);
        this.isAttendanceDataLoaded = true;
      }

      this.divisionCode = 1;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      WarningToast(err.error.HttpStatusMessage);
    });
  }

  getMonths() {
    var dt = new Date(this.client.CreatedOn);
    var month = dt.getMonth()+1;
    var year = dt.getFullYear();
    if (month == new Date().getMonth() && year == new Date().getFullYear()) {
      this.daysInMonth = new Date(year, month + 1, dt.getDate()).getDate();
    } else {
      let i = 0;
      while( i < new Date().getMonth()) {
        var mnth = Number((((month + 1) > 9 ? "" : "0") + month));
        // if (month == 1) {
        //   month = 12;
        //   year --
        // } else {
        //   month --;
        // }
        month++;
        this.monthName.push(new Date(year, mnth-1, 1).toLocaleString("en-us", { month: "short" })); // result: Aug
        i++;
      }
    }
    this.monthName.reverse();
  }

  getMonday(d: Date) {
    if(d) {
      d = new Date(d);
      var day = d.getDay(),
          diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
      return new Date(d.setDate(diff));
    }
    return null;
  }

  applyWorkFromHome(e: any) {
    this.currentAttendance = e;
    this.today = this.currentAttendance.AttendanceDay;

    this.today = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate()
    );

    this.tomorrow = this.today;

    this.currentAttendance.AttendanceDay = this.today;
    this.commentValue = this.currentAttendance.UserComments;
    $('#commentModal').modal('show');
  }

  submitAttendance() {
    this.isLoading = true;
    let commment = {
      EmployeeUid: this.employeeId,
      UserTypeId: UserType.Employee,
      AttendanceDay: this.currentAttendance.AttendanceDay,
      AttendenceFromDay: this.today,
      AttendenceToDay: this.tomorrow,
      UserComments: this.commentValue
    }
    if (this.commentValue == '') {
      this.isComment = true;
      this.isLoading = false;
      return;
    }
    this.http.post('Attendance/SubmitAttendance', commment).then((response: ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody === "updated" || response.ResponseBody === "inserted") {
        let current = this.currentDays.find(x => x.AttendanceDay === this.currentAttendance.AttendanceDay);
        if(current) {
          current.PresentDayStatus = 2;
        }
        this.isLoading = false;
        Toast("Wow!!!  Your attendance submitted successfully.");
      } else {
        this.isLoading = false;
        ErrorToast(response.ResponseBody, 20);
      }

      $('#commentModal').modal('hide');
    }).catch(e => {
      this.isLoading = false;
    })
  }

  //-------------------------- required code ends --------------------------

  checkDateExists(currenDate: Date, existingDateList: Array<any>) {
    let i = 0;
    let date = null;
    while(i < existingDateList.length) {
      date = new Date(existingDateList[i]["AttendanceDay"]);
      if(currenDate.getFullYear() == date.getFullYear() &&
         currenDate.getMonth() == date.getMonth() &&
         currenDate.getDate() == date.getDate()) {
           return true;
         }
      i++;
    }
    return false;
  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
      break;
      case "timesheet-tab":
        this.nav.navigateRoot(UserTimesheet, this.cachedData);
        break;
      case "leave-tab":
        this.nav.navigateRoot(UserLeave, this.cachedData);
      break;
    }
  }
}
