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
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  fromDate: any = null;
  toDate: any = null;
  isEmployeesReady: boolean = false;

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

  ngOnInit(): void {
    this.isFormReady = false;
    this.fromModel = null;
    this.toModel = null;
    let cachedData = this.nav.getValue();
    if(cachedData) {
      if(cachedData.UserId > 0) {
        this.userId = cachedData.UserId;
      } else {
        Toast("Invalid user.");
      }
    }

    this.initPage();
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

  buildWeekDays(): Array<any> {
    let weekDaysList = [
      { date: new Date(2022, 1, 10), hrs: 8.0 },
      { date: new Date(2022, 1, 11), hrs: 8.0 },
      { date: new Date(2022, 1, 12), hrs: 8.0 },
      { date: new Date(2022, 1, 13), hrs: 8.0 },
      { date: new Date(2022, 1, 14), hrs: 8.0 },
      { date: new Date(2022, 1, 15), hrs: 8.0 },
      { date: new Date(2022, 1, 16), hrs: 8.0 }
    ];
    return weekDaysList;
  }

  buildWeekForm(at: any) {
    return this.fb.group({
      UserComments: ['', Validators.required],
      Hours: [at.hrs, Validators.required],
      AttendenceStatus: ['', Validators.required],
      AttendanceDay: [at.date, Validators.required],
      AttendanceDisplayDay: [at.date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
      UserId: [0],
      UserTypeId: [UserType.Employee]
    });
  }

  initForm() {
    let weekDaysList = this.buildWeekDays();
    this.attendenceForm = this.fb.group({
      attendanceArray: this.fb.array(weekDaysList.map(item => {
        return this.buildWeekForm(item)
      }))
    });
  }

  onSubmit(){
    let records: Array<any> = this.attendenceForm.get("attendanceArray").value;
    let index = 0;
    while(index < records.length) {
      records[index].UserId = Number(this.userId);
      records[index].AttendenceStatus = 8;
      records[index]["AttendanceDay"] = new Date(records[index]["AttendanceDay"]);
      index++;
    }

    this.http.post("Attendance/InsertUpdateAttendance", records)
    .then(response => {
      if (response.ResponseBody) {
        Toast(response.ResponseBody)
      }
    })
  }

  initPage() {
    this.http.get("OnlineDocument/LoadApplicationData").then((response: ResponseModel) => {
      if(response.ResponseBody["employees"]) {
        this.buildEmployeeDropdown(response.ResponseBody["employees"]);
        this.initForm();
      } else {
        Toast("Unable to get user data.");
      }
      this.isEmployeesReady = true;
    });
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
      if(response.ResponseBody["Attendance"]) {
        this.initForm();
        this.isFormReady = true;
      } else {
        Toast("Unable to get user data.");
      }
    });
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

  fromDateSelection(e: NgbDateStruct) {
    this.fromDate = `${e.year}-${e.month}-${e.day}`;
  }

  toDateSelection(e: NgbDateStruct) {
    this.toDate = `${e.year}-${e.month}-${e.day}`;
  }
}
