import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';3
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
import { ApplicationData } from '../build-pdf/build-pdf.component';

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
  userId: number = 0;
  userName: string = "";
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  fromDate: any = null;
  toDate: any = null;
  isEmployeesReady: boolean = false;
  currentCommentElement: any = null;
  isSubmitted: boolean = true;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation
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
    this.isFormReady = false;
    this.fromModel = null;
    this.toModel = null;
    let cachedData = this.nav.getValue();
    if(cachedData) {
      this.userId = cachedData.EmployeeUid;
      this.userName = cachedData.FirstName + " " + cachedData.LastName;
      this.isEmployeesReady = true;
    } else {
      Toast("Invalid user.");
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

  buildTime(timeValue: number) {
    let totalTime: string = "";
    try {
      let hours = parseInt((timeValue / 60).toFixed(0));
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
        AttendenceStatus: [0, Validators.required],
        AttendanceDay: [at.date, Validators.required],
        AttendanceDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
        UserId: [0],
        UserTypeId: [UserType.Employee],
        UserHours: [at.hrs],
        UserMin: [at.mins]
      });
    } else {
      let totalTime = this.buildTime(item.hours);
      let timeValues = totalTime.split(":");
      let hours = timeValues[0];
      let minutes = timeValues[1];
      return this.fb.group({
        UserComments: [item.userComments, Validators.required],
        Hours: [this.buildTime(item.hours), Validators.required],
        AttendenceStatus: [item.attendanceStatus, Validators.required],
        AttendanceDay: [at.date, Validators.required],
        AttendanceDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
        UserId: [item.userId],
        UserTypeId: [item.userTypeId],
        UserHours: [hours],
        UserMin: [minutes]
      });
    }
  }

  initForm(attendanceDetail: Array<any>) {
    let weekDaysList = this.buildWeekDays();
    this.attendenceForm = this.fb.group({
      attendanceArray: this.fb.array(weekDaysList.map(item => {
        item.date.setHours(0,0,0,0);
        let value = attendanceDetail.find(x => x.attendanceDay - item.date === 0)
        return this.buildWeekForm(item, value);
      }))
    });
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
      records[index].UserId = Number(this.userId);
      records[index].AttendenceStatus = 8;
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
    if(this.userId <= 0) {
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
      UserId: Number(this.userId),
      UserTypeId : UserType.Employee,
      AttendenceFromDay: this.fromDate,
      AttendenceToDay: this.toDate
    }

    this.http.post("Attendance/GetAttendanceByUserId", data).then((response: ResponseModel) => {
      this.createPageData(response.ResponseBody["Attendance"]);
    });
  }

  createPageData(response: any) {
    if(response) {
      let attendance = response;
      let index = 0;
      while (index < attendance.length) {
        let value = attendance[index].attendanceDay;
        if(value) {
          attendance[index].attendanceDay = new Date(new Date (value).setHours(0,0,0,0));
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
    return weekDaysList;
  }

  fromDateSelection(e: NgbDateStruct) {
    let seletedDate = `${e.year}-${e.month}-${e.day}`;
    this.fromDate = this.getMonday(new Date(seletedDate));
    if(this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 7);
      this.getUserAttendanceData();
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
    let seletedDate = new Date(`${this.fromModel.year}-${this.fromModel.month}-${this.fromModel.day}`);
    let dateChange = new Date (seletedDate.setDate(seletedDate.getDate() + 7));
    this.fromModel.day = seletedDate.getDate();


    // this.fromModel.year = dateChange.getFullYear();
  }

  prevWeek() {
    this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() - 7));
    if (this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 7);
      this.getUserAttendanceData();
    }
  }

  presentWeek() {
    let currentDate = new Date().setHours(0, 0, 0, 0);
    this.fromDate = this.getMonday(new Date(currentDate));
    if(this.fromDate) {
      this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
      this.toDate.setDate(this.toDate.getDate() + 7);
      this.getUserAttendanceData();
    }
  }
}
