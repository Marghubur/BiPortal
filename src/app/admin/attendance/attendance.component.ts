import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
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

  takeComments(e: any) {
    let elem: any = e.target;
    this.currentCommentElement = elem;
    let textarea = elem.closest("div").querySelector("textarea");
    let parentDv = elem.closest("div").querySelector("div");
    parentDv.classList.remove('d-none');
    textarea.focus();
  }

  captureComments(e: any) {
    let elem = e.target;
    this.currentCommentElement.value = elem.value;
    elem.closest("div").classList.add('d-none');
  }

  ngOnInit(): void {
    var dt = new Date();
    var month = dt.getMonth();
    var year = dt.getFullYear();
    this.daysInMonth = new Date(year, month + 1, 0).getDate();
    this.clientDetail = {
      data: [],
      placeholder: "Select Organization"
    }

    this.employeesList = {
      data: [],
      placeholder: "Select Employee"
    }
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
      this.clientId = this.cachedData.ClientUid;
      this.userName = this.cachedData.FirstName + " " + this.cachedData.LastName;
      this.loadMappedClients();
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

    this.fromPresentDatea();
  }

  loadData() {
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        if(employees) {
          let i = 0;
          while(i < employees.length) {
            this.employeesList.data.push({
              text: `${employees[i].FirstName} ${employees[i].LastName}`,
              value: employees[i].EmployeeUid
            });
            i++;
          }
        }

        this.isEmployeesReady = true;
      }
    });
  }

  loadMappedClients() {
    this.http.get(`employee/GetManageEmployeeDetail/${this.employeeId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        if(this.applicationData.AllocatedClients && this.applicationData.EmployeesList) {
          
          if(!this.isRedirected) {
            this.employeesList.data = [];
            this.employeesList.placeholder = "Employee";
            let employees = this.applicationData.EmployeesList;
            if(employees) {
              let i = 0;
              while(i < employees.length) {
                this.employeesList.data.push({
                  text: `${employees[i].FirstName} ${employees[i].LastName}`,
                  value: employees[i].EmployeeUid
                });
                i++;
              }
            }
          } else {
            let mappedClient = this.applicationData.AllocatedClients;
            if(mappedClient != null && mappedClient.length > 0) {
              let i = 0;
              while(i < mappedClient.length) {
                this.clientDetail.data.push({
                  text: mappedClient[i].ClientName,
                  value: mappedClient[i].ClientUid,
                });
                i++;
              }
    
              if(mappedClient.length == 1) {
                this.clientId = mappedClient[0].ClientUid;
              }
              Toast("Client loaded successfully.");
            }
          }
        }  else {
          ErrorToast("Unable to load data. Please contact admin.");
        }

        this.isEmployeesReady = true;
        $('#loader').modal('hide');
      } else {
        ErrorToast("Unable to get client detail. Please contact admin.");
      }
    });
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

  buildTime(timeValue: number) {
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

  buildWeekForm(at: any, item: any, attendanceId: number) {
    if (item == null) {
      return this.fb.group({
        AttendanceId: [attendanceId, Validators.required],
        UserComments: ['', Validators.required],
        TotalMinutes: [at.hrs, Validators.required],
        BillingHours: [this.buildTime(this.client.BillingHours), Validators.required],
        AttendenceStatus: [0, Validators.required],
        AttendanceDay: [at.date, Validators.required],
        AttendanceDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
        EmployeeUid: [0],
        UserTypeId: [UserType.Employee],
        UserHours: [at.hrs],
        UserMin: [at.mins]
      });
    } else {
      let totalTime = this.buildTime(item.TotalMinutes);
      let timeValues = totalTime.split(":");
      let hours = timeValues[0];
      let minutes = timeValues[1];
      return this.fb.group({
        AttendanceId: [attendanceId, Validators.required],
        UserComments: [item.UserComments, Validators.required],
        TotalMinutes: [totalTime, Validators.required],
        BillingHours: [this.buildTime(this.client.BillingHours), Validators.required],
        AttendenceStatus: [item.AttendenceStatus, Validators.required],
        AttendanceDay: [at.date, Validators.required],
        AttendanceDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
        EmployeeUid: [item.EmployeeUid],
        UserTypeId: [item.UserTypeId],
        UserHours: [hours],
        UserMin: [minutes]
      });
    }
  }

  initForm(attendanceDetail: Array<any>) {
    let weekDaysList = this.buildWeekDays();
    this.weekDaysList = weekDaysList.map(item => item.date.getDay());

    let attendanceId = 0;
    if(attendanceDetail && attendanceDetail.length > 0) {
      attendanceId = attendanceDetail[0].AttendanceId;
    }

    this.attendenceForm = this.fb.group({
      attendanceArray: this.fb.array(weekDaysList.map(item => {
        item.date.setHours(0,0,0,0);
        let value = attendanceDetail.find(x => new Date(x.AttendanceDay).getDate() == item.date.getDate());
        return this.buildWeekForm(item, value, attendanceId);
      }))
    });

    this.countTotalTime();
  }

  countTotalTime() {
    let records = this.attendenceForm.get("attendanceArray")["controls"];
    this.totalHrs = '';
    this.totalMins = '';
    this.billingHrs = '';
    let hrsValue = 0;
    let minsValue = 0;
    let billingValue = 0;

    let i = 0;
    while (i < records.length) {
      hrsValue +=  Number(records[i].get("UserHours").value) ;
      minsValue +=  Number(records[i].get("UserMin").value);
      billingValue +=  parseInt(records[i].get("BillingHours").value);
      i++;
    }

    if (minsValue > 0) {
      this.totalMins = (minsValue < 10 ? `0${minsValue}` : minsValue).toString();
    } else {
      this.totalMins = "00";
    }

    if (hrsValue > 0) {
      this.totalHrs = (hrsValue < 10 ? `0${hrsValue}` : hrsValue).toString();
    } else {
      this.totalHrs = "00";
    }

    if (billingValue > 0) {
      this.billingHrs = (billingValue < 10 ? `0${billingValue}` : billingValue).toString();
    } else {
      this.billingHrs = "00";
    }
  }

  manageMinField(index: number, e: any) {
    let min = parseInt(e.target.value);
    let value: any = "";
    if (min > 0) {
      value = (min < 10 ? `0${min}` : min).toString();
    } else {
      value = "00";
    }
    let records = this.attendenceForm.get("attendanceArray")["controls"];
    if(records && records.length >= index) {
      records[index].get("UserMin").setValue(value);
    }
    this.countTotalTime();
  }

  manageHourField(index: number, e: any, weekDaysList : Array<any>) {
    // let hrs = this.attendenceForm.get("UserHours").value;
    let hrs = parseInt(e.target.value);
    let value: any = "";
    if (hrs > 0 ) {
      value = (hrs < 10 ? `0${hrs}` : hrs).toString();
    } else {
      value = "00";
    }

    let records = this.attendenceForm.get("attendanceArray")["controls"];
    if(records && records.length >= index) {
      records[index].get("UserHours").setValue(value);
    }
    this.countTotalTime();
  }

  calculateTime(UserHours: string, UserMin: string) {
    let totalTime: number = 0;
    try{
      if (UserMin != "" && UserHours != "") {
        let hours = parseInt(UserHours);
        let minutes = parseInt(UserMin);
        if (hours >= 0 && hours <= 24 && minutes >= 0 && minutes < 60) {
          totalTime = hours * 60 + minutes;
        } else {
          Toast("Please input correct working hours and minutes");
          return;
        }
      }
    } catch(e) {
      Toast("Invalid time used.");
    }
    return totalTime;
  }

  onSubmit(){
    this.isLoading = true;
    let values = JSON.stringify(this.attendenceForm.get("attendanceArray").value);
    let records: Array<any> = JSON.parse(values);
    let index = 0;
    while(index < records.length) {
      records[index].TotalMinutes = this.calculateTime(records[index].UserHours, records[index].UserMin);
      records[index].EmployeeUid = Number(this.employeeId);
      records[index]["ClientId"] = Number(this.clientId);
      records[index].AttendenceStatus = 8;
      records[index].BillingHours = 0;
      records[index]["AttendanceDay"] = new Date(records[index]["AttendanceDay"]);
      index++;
    }

    this.http.post("Attendance/InsertUpdateAttendance", records)
    .then(response => {
      if (response.ResponseBody) {
        Toast("Created/Updated successfully");
        this.initForm(response.ResponseBody);
      } else {
        Toast("Fail to inser/update, please contact to admin.");
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    });
  }

  getUserAttendanceData() {
    this.isLoading = true;
    if(this.employeeId <= 0) {
      Toast("Invalid user selected.")
      return;
    }

    if(!this.fromDate) {
      Toast("Invalid from and to date seleted.")
      return;
    }

    if(!this.toDate) {
      Toast("Invalid from and to date seleted.")
      return;
    }

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
        this.createPageData(response.ResponseBody.AttendacneDetails);
        this.isAttendanceDataLoaded = true;
      }

      this.divisionCode = 1;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      WarningToast(err.error.HttpStatusMessage);
    });
  }

  createPageData(response: any) {
    if(response) {
      let attendance = response;
      let index = 0;
      while (index < attendance.length) {
        let value = attendance[index].AttendanceDay;
        if(value) {
          attendance[index].AttendanceDay = new Date(value);
        }
        index++;
      }
      this.initForm(attendance);
      this.isFormReady = true;
    } else {
      Toast("Unable to get user data.");
    }
  }

  buildEmployeeDropdown(emp: Array<any>) {
    if(emp) {
      this.employeeDetails.data = [];
      this.employeeDetails.data.push({
        value: '0',
        text: 'Select Employee'
      });

      let index = 0;
      while(index < emp.length) {
        this.employeeDetails.data.push({
          value: emp[index]["EmployeeUid"],
          text: `${emp[index]["FirstName"]} ${emp[index]["LastName"]}`
        });
        index++;
      }
    }
  }

  buildWeekDays(): Array<any> {
    let weekDaysList = [];
    let currentDate = null;
    if((this.toDate - this.fromDate) > 0){
      let index = 0;
      let to = 7;
      while(index < to) {
        currentDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
        weekDaysList.push({
          date: new Date(currentDate.setDate(currentDate.getDate() + index)),
          hrs: "08",
          mins: "00"
        });
        currentDate = null;
        index++;
      }
    } else {
      Toast("Wrong date seleted.")
    }

    let i = 0;
    while(i < weekDaysList.length) {
      if (weekDaysList[i].date.getDay() == 0 || weekDaysList[i].date.getDay() == 6) {
        weekDaysList[i].hrs = "00";
        weekDaysList[i].mins = "00";
      }
      i++;
    }
    return weekDaysList;
  }

  fromDateSelection(e: NgbDateStruct) {
    if (this.clientId > 0) {
      let seletedDate = `${e.year}-${e.month}-${e.day}`;
      this.fromDate = this.getMonday(new Date(seletedDate));
      if(this.fromDate) {
        this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
        this.toDate.setDate(this.toDate.getDate() + 6);
        this.getUserAttendanceData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  toDateSelection(e: NgbDateStruct) {
    this.toDate = `${e.year}-${e.month}-${e.day}`;
  }

  nextWeek() {
    this.divisionCode = 1;
    this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() + 7));
    if (this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 6);
      this.getUserAttendanceData();
    }

    this.fromModel = { day: this.fromDate.getDate(), month: this.fromDate.getMonth() + 1, year: this.fromDate.getFullYear()};
  }

  prevWeek() {
    this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() - 7));
    if (this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 6);
      this.getUserAttendanceData();
    }

    this.fromModel = { day: this.fromDate.getDate(), month: this.fromDate.getMonth() + 1, year: this.fromDate.getFullYear()};
  }

  presentWeek() {
    if(this.clientId > 0) {
      this.isLoading = true;
      let currentDate = new Date().setHours(0, 0, 0, 0);
      this.fromDate = this.getMonday(new Date(currentDate));
      this.fromModel = { day: this.fromDate.getDate(), month: this.fromDate.getMonth() + 1, year: this.fromDate.getFullYear()};
      if(this.fromDate) {
        this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
        this.toDate.setDate(this.toDate.getDate() + 6);
        this.getUserAttendanceData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  getPendingWeek(from: Date, to: Date) {
    if(this.clientId > 0) {
      this.isLoading = true;
      if(from && to) {
        this.fromDate = new Date(from);
        this.toDate = new Date(to);
        this.getUserAttendanceData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  getAllPendingAttendance() {
    if(this.clientId > 0) {
      this.http.get(`Attendance/GetPendingAttendanceById/${this.employeeId}/1/${this.clientId}`).then((response: ResponseModel) => {
        if(response.ResponseBody && response.ResponseBody.length > 0) {
          this.PendingAttendacneMessage = 'Select above pending attendance link to submit before end of the month.';
          this.buildPendingAttendanceModal(response.ResponseBody);
        } else {
          this.divisionCode = 2;
          this.PendingAttendacneMessage = "Wow!!! You don't have any pending attendace for this month.";
        }
      });
    } else {
      WarningToast("Please select employer first.");
    }
  }

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

  fromPresentDatea() {
    this.allDays = [];
    this.presentMonth = true;
    let index = 0;
    while(index < 30) {
      this.allDays.push(new Date(new Date().setDate(new Date().getDate() - index)));
      index++;
    }
  }

  getAllDays(month: string, count: number) {
    this.presentMonth = false;
    this.allDays = [];
    var year = new Date().getFullYear();
    let value = new Date(Date.parse(month + `1, ${year}`)).getMonth() + 1;
    let index = new Date(year, value, 0).getDate();
    let changeYrs = new Date (new Date().getFullYear() , new Date().getMonth() - 1 - count, 1).getFullYear();
    this.changeMonth = new Date(year, value-1, 1).toLocaleString("en-us", { month: "long" }) + ", " + `${changeYrs}`;
    let date = new Date(year, value -1, index)
    let i = 0;
    while(date.getMonth() ==  value - 1) {
      if (this.allDays.length == index) {
        break;
      }
      this.allDays.push(new Date(date.setDate(date.getDate() - i)));
      if (i == 0) {
        i++;
      }

      if (date.getDate() == 1)
        date.getMonth() - 1;
    }
  }

  selectOption(index: any) {

  }

  buildPendingAttendanceModal(res: Array<any>) {
    let now: any = new Date(new Date().setHours(0,0,0,0));
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.weekList = [];
    let week: Array<any> = [];

    let dayNum = 0;
    let date = null;
    let i = 1;
    let index = 0;
    let totalDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    let workingDate = null;
    let isExisting = false;
    while(i <= totalDays) {
      workingDate = new Date(startDate.getFullYear(), startDate.getMonth(), i);
      if(now - workingDate <= 0) {
        if (this.weekList.length > 0) this.divisionCode = 2;
        return;
      }

      if(this.checkDateExists(workingDate, res)) {
        i++;
        continue;
      }
      dayNum = workingDate.getDay();
      switch(dayNum) {
        case 1:
          isExisting = false;
          week = [];
          index = 0;
          while(index < 7){
            date = new Date(startDate.getFullYear(), startDate.getMonth(), i + index);
            if(this.checkDateExists(date, res)) {
              index = 7;
              isExisting = true;
              break;
            }
            week.push({
              date: date,
              position: index,
              day: date.getDay()
            });
            index++;
          }

          if(!isExisting) {
            this.weekList.push({
              weekNum: this.weekList.length + 1,
              days: week
            });
          }
          i = i + (index - 1);
          break;
        default:
          isExisting = false;
          date = new Date(startDate.getFullYear(), startDate.getMonth(), i + index);
          dayNum = date.getDay();
          date.setDate(date.getDate() - dayNum);

          week = [];
          index = 0;
          let flag = false;
          while(index < 7){
            date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
            if(date.getDate() == 2 || flag){
              if(this.checkDateExists(date, res)) {
                index = 7;
                isExisting = true;
                break;
              }
              flag = true;
              i++;
            }

            week.push({
              date: date,
              position: index,
              day: date.getDay()
            });
            index++;
          }

          if(!isExisting) {
            this.weekList.push({
              weekNum: this.weekList.length + 1,
              days: week
            });
          }
          break;
      }
      i++;
    }
    if (this.weekList.length > 0) this.divisionCode = 2;
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
    this.findEmployeeById(e);
  }

  findEmployeeById(employeeId: any) {
    if (employeeId) {
      this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid === parseInt(employeeId));
      if (this.currentEmployee && this.currentEmployee.ClientJson != null) {
        this.userName = `${this.currentEmployee.FirstName} ${this.currentEmployee.LastName}`;
        let clients = JSON.parse(this.currentEmployee.ClientJson);
        this.clientDetail = {
          data: [],
          placeholder: "Select Organization"
        };

        let assignedClients = this.applicationData.Clients.filter(x => clients.indexOf(x.ClientId) !== -1);
        let i = 0;
        while(i < assignedClients.length) {
          this.clientDetail.data.push({
            text: assignedClients[i].ClientName,
            value: assignedClients[i].ClientId,
          });
          i++;
        }   
      }
    }
  }
}
