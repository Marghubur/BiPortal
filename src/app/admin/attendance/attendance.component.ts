import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';3
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { ApplicationData } from '../build-pdf/build-pdf.component';
declare var $: any;

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss']
})
export class AttendanceComponent implements OnInit {
  attendenceForm: FormGroup;
  model: NgbDateStruct;
  date: any;
  isFormReady: boolean = false;
  attendanceArray: FormArray;
  singleEmployee: Filter = null;
  placeholderName: string = "";
  employeeDetails: autoCompleteModal = new autoCompleteModal();
  applicationData: ApplicationData = new ApplicationData();
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
  clockDate: Date = new Date();
  time = new Date();
  intervalId;
  DayName: number = 0;
  weekDaysList: Array<any> = [];
  totalHrs: string = '';
  totalMins: string = '';
  clientId: number = 0;
  clientDetail: autoCompleteModal = null;
  client: any = null;
  isLoading: boolean = false;
  isClientLoaded: boolean = false;
  billingHrs: string = '';

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private calendar: NgbCalendar,
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
    this.clientDetail = {
      data: [],
      placeholder: "Select Employee"
    }
    this.isFormReady = false;
    this.fromModel = null;
    this.toModel = null;
    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);
    this.DayName =this.time.getDay();

    let cachedData = this.nav.getValue();
    if(cachedData) {
      this.employeeId = cachedData.EmployeeUid;
      this.clientId = cachedData.ClientUid;
      this.userName = cachedData.FirstName + " " + cachedData.LastName;
      this.isEmployeesReady = true;
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
        this.isEmployeesReady = true;
      } else {
        Toast("Invalid user. Please login again.")
      }
    }
  }

  loadMappedClients() {
    this.isClientLoaded = true;
    $('#clientLoaderModal').modal('show');
    this.http.get(`employee/GetManageEmployeeDetail/${this.employeeId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        let mappedClient = response.ResponseBody.AllocatedClients;
        if(mappedClient != null && mappedClient.length > 0) {
          let i = 0;
          while(i < mappedClient.length) {
            this.clientDetail.data.push({
              text: mappedClient[i].ClientName,
              value: mappedClient[i].ClientUid,
            });
            i++;
          }

          Toast("Client loaded successfully.");
        } else {
          ErrorToast("Unable to get client detail. Please contact admin.");
        }
      } else {
        ErrorToast("Unable to get client detail. Please contact admin.");
      }
    });
    //this.isClientLoaded = false;
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
      let hours = Math.trunc((timeValue / 60));
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

  buildWeekForm(at: any, item: any) {
    if (item == null) {
      return this.fb.group({
        UserComments: ['', Validators.required],
        Hours: [at.hrs, Validators.required],
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
      let totalTime = this.buildTime(item.Hours);
      let billingHours = this.buildTime(item.BillingHours);
      let timeValues = totalTime.split(":");
      let hours = timeValues[0];
      let minutes = timeValues[1];
      return this.fb.group({
        UserComments: [item.UserComments, Validators.required],
        Hours: [totalTime, Validators.required],
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
    this.attendenceForm = this.fb.group({
      attendanceArray: this.fb.array(weekDaysList.map(item => {
        item.date.setHours(0,0,0,0);
        let value = attendanceDetail.find(x => x.AttendanceDay - item.date === 0)
        return this.buildWeekForm(item, value);
      }))
    });

    let records = this.attendenceForm.get("attendanceArray")["controls"];
    let i = 0;
    while (i < records.length) {
      let dayValue = new Date(records[i].get("AttendanceDisplayDay").value).getDay();
      if (dayValue == 0 || dayValue == 6) {
        records[i].get("BillingHours").value = "00:00"
      }
      i++;
    }
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

  manageHourField(index: number, e: any) {
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
    let values = JSON.stringify(this.attendenceForm.get("attendanceArray").value);
    let records: Array<any> = JSON.parse(values);
    let index = 0;
    while(index < records.length) {
      records[index].Hours = this.calculateTime(records[index].UserHours, records[index].UserMin);
      records[index].EmployeeUid = Number(this.employeeId);
      records[index].AttendenceStatus = 8;
      records[index].BillingHours = 0;
      records[index]["AttendanceDay"] = new Date(records[index]["AttendanceDay"]);
      index++;
    }

    this.http.post("Attendance/InsertUpdateAttendance", records)
    .then(response => {
      if (response.ResponseBody) {
        Toast("Created/Updated successfully");
        this.getUserAttendanceData();
      } else {
        Toast("Fail to inser/update, please contact to admin.");
      }
    })
  }

  getUserAttendanceData() {
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
      AttendenceForMonth: new Date()
    }

    this.http.post("Attendance/GetAttendanceByUserId", data).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.client = response.ResponseBody.Client;
        this.createPageData(response.ResponseBody.AttendacneDetails);
      }
    });
  }

  createPageData(response: any) {
    if(response) {
      let attendance = response;
      let index = 0;
      while (index < attendance.length) {
        let value = attendance[index].AttendanceDay;
        if(value) {
          attendance[index].AttendanceDay = new Date(new Date (value).setHours(0,0,0,0));
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
    if((this.toDate - this.fromDate) > 0){
      let index = 0;
      let to = 7;
      let currentDate = null;
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
        this.toDate.setDate(this.toDate.getDate() + 7);
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
    this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() + 7));
    if (this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 7);
      this.getUserAttendanceData();
    }
    
    this.fromModel = { day: this.fromDate.getUTCDate(), month: this.fromDate.getUTCMonth() + 1, year: this.fromDate.getUTCFullYear()};
  }

  prevWeek() {
    this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() - 7));
    if (this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 7);
      this.getUserAttendanceData();
    }

    this.fromModel = { day: this.fromDate.getUTCDate(), month: this.fromDate.getUTCMonth() + 1, year: this.fromDate.getUTCFullYear()};
  }

  presentWeek() {
    this.isLoading = true;
    if(this.clientId > 0) {
      this.fromModel = this.calendar.getToday();
      let currentDate = new Date().setHours(0, 0, 0, 0);
      this.fromDate = this.getMonday(new Date(currentDate));
      if(this.fromDate) {
        this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
        this.toDate.setDate(this.toDate.getDate() + 7);
        this.getUserAttendanceData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
    this.isLoading = false;
  }  
}
