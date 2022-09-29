import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Leave, Timesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  attendenceForm: FormGroup;
  date: any;
  isFormReady: boolean = false;
  attendanceArray: FormArray;
  singleEmployee: Filter = null;
  employeeDetails: autoCompleteModal = new autoCompleteModal();
  employeeId: number = 0;
  userName: string = "";
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  fromDate: any = null;
  toDate: any = null;
  isEmployeesReady: boolean = false;
  currentCommentElement: any = null;
  isSubmitted: boolean = true;
  userDetail: UserDetail = new UserDetail();
  time = new Date();
  intervalId;
  DayValue: number = 0;
  weekDaysList: Array<any> = [];
  totalHrs: string = '';
  totalMins: string = '';
  BillingHrs: number = 0;
  clientId: number = 0;
  clientDetail: autoCompleteModal = null;
  employeesList: autoCompleteModal = new autoCompleteModal();
  client: any = null;
  isLoading: boolean = false;
  billingHrs: string = '';
  NoClient: boolean = false;
  isAttendanceDataLoaded: boolean = false;
  weekList: Array<any> = [];
  divisionCode: number = 0;
  daysInMonth: number = 0;
  PendingAttendacneMessage: string = 'Select above pending attendance link to submit before end of the month.';
  monthName: Array<any> = [];
  allDays: Array<any> = [];
  changeMonth: string = '';
  presentMonth: boolean = true;
  cachedData: any = null;
  isRedirected: boolean = false;
  currentEmployee: any = null;
  applicationData: any = [];
  enablePermissionButton: boolean = false;
  currentDays: Array<any> = [];
  today: Date = null;
  tomorrow: Date = null;
  currentAttendance: any = null;
  commentValue: string = null;
  isComment: boolean = false;
  isEmployeeSelected: boolean = false;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private user: UserService
  ) {
    this.singleEmployee = new Filter();
    this.employeeDetails.placeholder = "Employee";
    this.employeeDetails.data.push({
      value: '0',
      text: 'Select Employee'
    });
  }

  ngOnInit(): void {
    var dt = new Date();
    var month = dt.getMonth();
    var year = dt.getFullYear();
    this.daysInMonth = new Date(year, month + 1, 0).getDate();
    this.clientDetail = new autoCompleteModal('Select Organization');

    this.employeesList = new autoCompleteModal('Select Employee');
    this.isFormReady = false;
    this.fromModel = null;
    this.toModel = null;
    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);

    this.DayValue = this.time.getDay();
    this.cachedData = this.nav.getValue();
    if(this.cachedData) {
      this.isRedirected = true;
      this.employeeId = this.cachedData.EmployeeUid;
      this.userName = this.cachedData.FirstName + " " + this.cachedData.LastName;
      this.clientId = this.cachedData.CompanyId;
      this.loadAttendanceData();
    } else {
      this.isRedirected = false;
      this.userDetail = this.user.getInstance() as UserDetail;
      if(this.userDetail == null) {
        let Master = this.local.get(null);
        if(Master !== null && Master !== "") {
          this.userDetail = Master["UserDetail"];
        } else {
          Toast("Invalid user. Please login again.");
          return;
        }
      }

      this.employeeId = 0;
      this.userName = "";
      this.loadData();
    }

    let i = 0;
    while( i < 6) {
      var mnth = Number((((month + 1) > 9 ? "" : "0") + month));
      if (month == 1) {
        month = 12;
        year --
      } else {
        month --;
      }
      this.monthName.push(new Date(year, mnth-1, 1).toLocaleString("en-us", { month: "short" })); // result: Aug
      i++;
    }
  }

  loadData() {
    this.isEmployeesReady = false;
    let fileter = new Filter();
    this.http.post(`employee/GetEmployees/`, fileter).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData["Employees"] = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";
        this.isEmployeesReady = true;
      }
    });
  }

  // bindDefaultCompany() {
  //   this.isEmployeeSelected = false;
  //   this.clientDetail.data.push({
  //     text: this.applicationData.Company.CompanyName,
  //     value: this.applicationData.Company.CompanyId,
  //   });
  // }

  findEmployeeCompany() {
    let companies: Array<any> = this.local.findRecord("Companies") as Array<any>;
    if (companies) {
      let company = companies.find(x => x.CompanyId == this.clientId);
      if (!company) {
        ErrorToast("Company not found for this user.")
        throw new Error("Company not found for this user.")
      }

      this.applicationData.Company = company;
      this.clientDetail.data.push({
        text: this.applicationData.Company.CompanyName,
        value: this.applicationData.Company.CompanyId,
      });
    } else {
      ErrorToast("No company found for current employee.");
      throw new Error("Company not found for this user.")
    }
  }

  loadAttendanceData() {
    this.isLoading = true;
    this.isEmployeeSelected = false;
    if(this.employeeId <= 0) {
      Toast("Invalid user selected.")
      return;
    }

    this.findEmployeeCompany();
    let now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = now;

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
      if(response.ResponseBody.EmployeeDetail)
        this.client = response.ResponseBody.EmployeeDetail;
      else {
        this.NoClient = true;
        this.isAttendanceDataLoaded = false;
      }

      if (response.ResponseBody.AttendacneDetails) {
        this.bindAttendace(response.ResponseBody.AttendacneDetails);
        this.isAttendanceDataLoaded = true;
      }

      this.divisionCode = 1;
      this.isLoading = false;
      this.isEmployeesReady = true;
      this.isEmployeeSelected = true;
    }).catch(err => {
      this.isLoading = false;
      WarningToast(err.error.HttpStatusMessage);
    });
  }


  bindAttendace(data: Array<any>) {
    if(data && data.length > 0) {
      this.currentDays = [];
      this.presentMonth = true;
      let index = 0;
      while(index < data.length) {
        data[index].AttendanceDay = new Date(data[index].AttendanceDay);
        let dayValue = data[index].AttendanceDay.getDay();
        if (dayValue == 0 || dayValue == 6)
          data[index].PresentDayStatus = 3;
        index++;
      }

      this.currentDays = data;
    } else {
      WarningToast("Unable to bind data. Please contact admin.");
    }
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

  commentPopUp(e: any) {
    this.currentAttendance = e;
    this.today = this.currentAttendance.AttendanceDay;
    this.tomorrow = new Date(this.today);

    let now = new Date();
    this.today = new Date(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate()
    );
    this.currentAttendance.AttendanceDay = this.today;

    this.tomorrow = new Date(
      this.tomorrow.getFullYear(),
      this.tomorrow.getMonth(),
      this.tomorrow.getDate() + 1
    );
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
        this.nav.navigate(Timesheet, this.cachedData);
      break;
      case "leave-tab":
        this.nav.navigate(Leave, this.cachedData);
      break;
    }
  }

  findEmployee(e: any) {
    this.clientDetail = {
      data: [],
      className: "disabled-input",
      placeholder: "Select Organization"
    }
    this.findEmployeeById(e);
  }

  findEmployeeById(employeeId: any) {
    if (employeeId) {
      this.isEmployeeSelected = false;
      this.clientId = 0;
      this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid === parseInt(employeeId));
      this.clientId = this.currentEmployee.CompanyId;
      this.loadAttendanceData();
    }
  }
}
