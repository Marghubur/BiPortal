import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, ItemStatus, UserLeave, UserTimesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
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
  userDetail: any = null;
  time = new Date();
  intervalId;
  DayValue: number = 0;
  employee: any = null;
  isLoading: boolean = false;
  billingHrs: string = '';
  isAttendanceDataLoaded: boolean = false;
  divisionCode: number = 0;
  daysInMonth: number = 0;
  monthName: Array<any> = [];
  presentMonth: boolean = true;
  cachedData: any = null;
  currentAttendance: any = null;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = null;
  emails: Array<any> = [];
  employees: Array<any> = [];
  //-------------------------- required code starts --------------------------
  sessionvalue: number = 1;
  commentValue: string = null;
  today: Date = null;
  tomorrow: Date = null;
  isComment: boolean = false;
  currentDays: Array<any> = [];
  allDaysAttendance: Array<any> = [];
  reportingManagerId: number = 0;
  filterStatus: number = 0;
  request: Filter = new Filter();
  attendanceRequestDetail: Array<any> = [];
  attendanceRquestPageIsReady: boolean = false;
  EmailBody: any = null;
  eventsSubject: Subject<void> = new Subject<void>();
  orderByAttendanceDateAsc: boolean = null;
  orderByRequestedOnAsc: boolean = null;

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
    this.time = new Date();
    this.request.SortBy = null;
    this.request.PageIndex = 1;
    this.DayValue = this.time.getDay();
    this.cachedData = this.nav.getValue();
    this.employeesList.placeholder = "Employee";
    this.employeesList.className = 'disable-field';
    this.employeesList.isMultiSelect = true;
    this.loadAutoComplete();
    this.isEmployeesReady = true;
    if(this.cachedData) {
      this.employeeId = this.cachedData.EmployeeUid;
      this.reportingManagerId = this.cachedData.ReportingManagerId;
      this.userName = this.cachedData.FirstName + " " + this.cachedData.LastName;
      this.loadPageData();
    } else {
      this.userDetail = this.user.getInstance() as UserDetail;
      if(this.userDetail && this.userDetail !== null) {
        this.employeeId = this.userDetail.UserId;
        this.reportingManagerId = this.userDetail.ReportingManagerId;
        this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
        this.loadPageData();
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
        if (data[index].IsHoliday) {
          data[index].PresentDayStatus = 4;
          data[index].AttendenceStatus = 4;
        } else if(data[index].IsWeekend) {
          data[index].PresentDayStatus = 3;
          data[index].AttendenceStatus = 3;
        }
        // let logon = data[index].LogOn.split(':');
        // let logontime = 0;
        // for (let i = 0; i < logon.length; i++) {
        //   logontime += Number(logon[i]);
        // }
        // data[index].GrossHour = Number(data[index].LogOn) - (data[index].LunchBreanInMinutes/60)
        index++;
      }
      this.allDaysAttendance = data;
      this.currentDays = data.reverse();
    } else {
      WarningToast("Unable to bind data. Please contact admin.");
    }
  }

  loadPageData() {
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
      UserTypeId : UserType.Employee,
      AttendenceFromDay: this.fromDate,
      AttendenceToDay: this.toDate,
      ForYear: this.fromDate.getFullYear(),
      ForMonth: this.fromDate.getMonth() + 1,
      CompanyId: this.userDetail.CompanyId
    }
    this.loadMappedData(data);
  }

  loadMappedData(data: any) {
    this.isAttendanceDataLoaded = false;
    this.http.post("Attendance/GetAttendanceByUserId", data).then((response: ResponseModel) => {
      if(!response.ResponseBody.EmployeeDetail) {
        ErrorToast("Fail to get employee detail. Please contact to admin.")
        this.isAttendanceDataLoaded = true;
        this.isLoading = false;
        return;
      }

      this.employee = response.ResponseBody.EmployeeDetail;
      this.getMonths();
      if (response.ResponseBody.AttendacneDetails) {
        this.bindAttendace(response.ResponseBody.AttendacneDetails);
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
    this.monthName = [];
    var dt = new Date();
    var month = dt.getMonth()+1;
    var year = dt.getFullYear();
    let i = 1;
    if (year == new Date().getFullYear()) {
      //this.daysInMonth = new Date(year, month, dt.getDate()).getDate();
      i = month-1;
    }
    while( i <= new Date().getMonth()+1) {
      var mnth = Number((((i+1) > 9 ? "" : "0") + i));
      month++;
      this.monthName.push( {
        name: new Date(year, mnth-1, 1).toLocaleString("en-us", { month: "short" }),
        value: mnth-1
      }); // result: Aug
      i++;
    }
    this.monthName.reverse();
  }

  previousMonthAttendance(month: number, index: number) {
    let doj = new Date(this.userDetail.CreatedOn);
    let startDate = new Date(new Date().getFullYear(), month, 1);
    if(doj.getFullYear() == new Date().getFullYear() && doj.getMonth() == new Date().getMonth()) {
      WarningToast("You joining month is current month.")
      return;
    }
    if (doj.getFullYear() == startDate.getFullYear() && doj.getMonth() == startDate.getMonth()) {
      startDate = new Date(doj.getFullYear(), doj.getMonth(), doj.getDate());
    }
    let endDate;
    if (month == new Date().getMonth())
      endDate = new Date();
    else
      endDate = new Date(new Date().getFullYear(), month+1, 0);

    let data = {
      EmployeeUid: Number(this.employeeId),
      UserTypeId : UserType.Employee,
      AttendenceFromDay: startDate,
      AttendenceToDay: endDate,
      ForYear: new Date().getFullYear(),
      ForMonth: month + 1,
      CompanyId: this.userDetail.CompanyId
    }
    let radiobtn = document.querySelectorAll('input[name="btnradio"]');
    if (radiobtn.length > 0) {
      for (let i = 0; i < radiobtn.length; i++) {
        radiobtn[i].removeAttribute('checked');
      }
      radiobtn[index].setAttribute('checked', '');
    }
    this.loadMappedData(data);
  }

  // getMonday(d: Date) {
  //   if(d) {
  //     d = new Date(d);
  //     var day = d.getDay(),
  //         diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  //     return new Date(d.setDate(diff));
  //   }
  //   return null;
  // }

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

  selectSession(e: any) {
    this.sessionvalue= 0;
    let value = e.target.value;
    if (Number(value) > 0)
      this.sessionvalue = value;
  }

  getRequestBody() {
      if (this.commentValue == '') {
        this.isComment = true;
        this.isLoading = false;
        return null;
      }

      if (this.sessionvalue <= 0) {
        ErrorToast("Please select session first");
        this.isLoading = false;
        return null;
      }

    return {
      EmployeeUid: this.employeeId,
      UserTypeId: UserType.Employee,
      AttendanceDay: this.currentAttendance.AttendanceDay,
      AttendenceFromDay: this.today,
      AttendenceToDay: this.tomorrow,
      UserComments: this.commentValue,
      EmailList: this.emails,
      SessionType: this.sessionvalue,
      LogOn: this.currentAttendance.LogOn,
      LogOff: this.currentAttendance.LogOff,
      LunchBreanInMinutes: this.currentAttendance.LunchBreanInMinutes
    }
  }

  sendRequest() {
    this.isLoading = true;
    let request = [];

    let notify = [];
    if (this.employees.length > 0) {
      for (let i = 0; i < this.employees.length; i++) {
        notify.push({
          Id:this.employees[i].Id,
          Email:this.employees[i].Email})
      }
    }
    let reportmanager = this.employeesList.data.find(x => x.value == this.userDetail.ReportingManagerId);
    if (reportmanager == null) {
      ErrorToast("Your assign manger is not found. Please contact to admin");
      return;
    }
    let mangeremail = notify.find(x => x.Email == reportmanager.email);
    if (mangeremail == null) {
      notify.push({
        Id:reportmanager.value,
        Email:reportmanager.email})
    }
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (data && data == "") {
      this.isLoading = false;
      return;
    }
    this.currentDays.map(item => {
      request.push({
        RequestedId: this.currentAttendance.AttendanceId,
        EmployeeId: this.employeeId,
        EmployeeName: `${this.employee.FirstName} ${this.employee.LastName}`,
        Email: this.employee.Email,
        Mobile: this.employee.Mobile,
        EmployeeMessage: this.commentValue,
        CurrentStatus: ItemStatus.Pending,
        AttendanceDate: item.AttendanceDay,
        NotifyList: notify
      });
    });

    if (request == null || request.length == 0){
      WarningToast("No attendance is available to apply.")
      return;
    }

    let requestBody = {
      EmailBody: data,
      CompalintOrRequestList: request
    };

    this.http.post("Attendance/RaiseMissingAttendanceRequest", requestBody).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        if (this.currentDays.length > 1)
          this.currentDays.map(x => x.PresentDayStatus = 12);
        else {
          let data = this.allDaysAttendance.find(x => new Date(x.AttendanceDay).getTime() == new Date(this.currentDays[0].AttendanceDay).getTime());
          if (data) {
            data.PresentDayStatus = 12;
            this.currentDays = this.allDaysAttendance;
          }
        }
        Toast("Your request has been submitted successfully. Your manager will take action on it.");
      }

      this.isLoading = false;
      $('#requestModal').modal('hide');
    }).catch(e => {
        this.isLoading = false;
        $('#requestModal').modal('hide');
    })
  }

  loadAttendanceRequestDetail() {
    this.attendanceRquestPageIsReady = false;
    this.attendanceRequestDetail = [];
    this.request.SearchString = "1=1";
    this.request.PageSize = 10;
    this.request.EmployeeId = this.employeeId;
    this.http.post("Attendance/GetMissingAttendanceRequest", this.request).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.attendanceRequestDetail = response.ResponseBody;
        if (this.attendanceRequestDetail.length > 0)
          this.request.TotalRecords = this.attendanceRequestDetail[0].Total;
        else
          this.request.TotalRecords = 0;
        Toast("Attendance request loaded successfully.");
        this.isLoading = false;
      }

      this.attendanceRquestPageIsReady = true;
    });
  }

  submitAttendance() {
    this.isLoading = true;
    let request = this.getRequestBody();

    if (request == null)
      return;

    this.http.post('Attendance/SubmitAttendance', request).then((response: ResponseModel) => {
      if (response.ResponseBody && (response.ResponseBody === "updated" || response.ResponseBody === "inserted")) {
        let current = this.currentDays.find(x => x.AttendanceDay === this.currentAttendance.AttendanceDay);
        if(current) {
          current.PresentDayStatus = 2;
        }
        this.isLoading = false;
        Toast("Wow!!!  Your attendance submitted successfully.");
      } else {
        this.isLoading = false;
        ErrorToast("Fail to update. Please contact to admin.", 20);
      }

      $('#commentModal').modal('hide');
    }).catch(e => {
      this.isLoading = false;
    })
  }

  //-------------------------- required code ends --------------------------

  // checkDateExists(currenDate: Date, existingDateList: Array<any>) {
  //   let i = 0;
  //   let date = null;
  //   while(i < existingDateList.length) {
  //     date = new Date(existingDateList[i]["AttendanceDay"]);
  //     if(currenDate.getFullYear() == date.getFullYear() &&
  //        currenDate.getMonth() == date.getMonth() &&
  //        currenDate.getDate() == date.getDate()) {
  //          return true;
  //        }
  //     i++;
  //   }
  //   return false;
  // }

  loadAutoComplete() {
    this.isEmployeesReady = false;
    this.employeesList.data = [];
    this.employeesList.placeholder = "Employee";
    this.employeesList.data = GetEmployees();
    this.applicationData = GetEmployees();
    this.employeesList.className = "";
    this.isEmployeesReady = true;
  }

  addEmployeeEmail(e: any) {
    let value = e.value;
    let employee = this.applicationData.find(x => x.value == value);
    this.emails.push(employee.email);
    this.employees.push({
      Id: employee.value,
      Name: employee.text,
      Email: employee.email
    });
    let index = this.employeesList.data.findIndex(x => x.value == value);
    this.employeesList.data.splice(index, 1);
  }

  removeEmail(index: number) {
    if (index >-1) {
      this.employeesList.data.push({
        value: this.employees[index].Id,
        text: this.employees[index].Name
      });
      this.employees.splice(index, 1);
    }
  }

  filterByStatus(e: any) {
    let value = Number(e.target.value);
    let data;
    if (value >=0) {
      this.filterStatus = value;
      this.currentDays = [];
      switch (value) {
        case 0:
          data = this.allDaysAttendance.filter(x => x.IsOpen == true &&  x.PresentDayStatus == 0);
          this.currentDays = data;
          break;
        case 1:
          this.currentDays = this.allDaysAttendance;
          break;
        case 2:
          data = this.allDaysAttendance.filter(x => x.PresentDayStatus == 2);
          this.currentDays =data;
          break;
        case 3:
          data = this.allDaysAttendance.filter(x => x.IsWeekend == true);
          this.currentDays = data;
          break;
        case 4:
          data = this.allDaysAttendance.filter(x => x.IsHoliday == true);
          this.currentDays = data;
          break;
        case 5:
          data = this.allDaysAttendance.filter(x => x.PresentDayStatus == 5);
          this.currentDays = data;
          break;
        case 9:
          data = this.allDaysAttendance.filter(x => x.PresentDayStatus == 9);
          this.currentDays = data;
          break;
        case 10:
          data = this.allDaysAttendance.filter(x => x.IsOpen == false &&  x.PresentDayStatus == 0);
          this.currentDays = data;
          break;
      }
    }
  }

  requestPopUp(item?: any) {
    this.EmailBody = "<div>I missed to fill my attendance on following days:</div><br>";
    if (this.currentDays.length > 0) {
      let text = "";
      this.currentAttendance = this.currentDays[0];
      if (item) {
        this.currentAttendance = item;
        this.currentDays = [];
        this.currentDays.push(item)
      }
      this.currentDays.map(item => {
        text += `${new DatePipe('en-US').transform(item.AttendanceDay, 'd MMM yyyy')},  `
      });

      this.EmailBody += `  Date(s):`;
      this.EmailBody += `  \n${text}`;
      this.EmailBody += "<br><div>Requesting to please approved all the above mentioned attendance.</div><br><br>";
      this.EmailBody += "<div>Regards</div>";
      $("#requestModal").modal('show');
    } else {
      WarningToast("You don't have any missed attendance in present month.");
    }
  }

  removeBlockDay(index: number) {
    if (index != -1) {
      this.currentDays.splice(index, 1);
    }
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'AttendanceDate') {
      this.orderByAttendanceDateAsc = !flag;
      this.orderByRequestedOnAsc = null;
    }else if (FieldName == 'RequestedOn') {
      this.orderByAttendanceDateAsc = null;
      this.orderByRequestedOnAsc = !flag;
    }
    this.request.SortBy = FieldName +" "+ Order;
    this.loadAttendanceRequestDetail()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.request = e;
      this.loadAttendanceRequestDetail();
    }
  }

  onEmloyeeChanged(_: any) {
    this.local.setByKey("EmployeeId", this.employeeId);
    //this.filterRecords();
  }
}
