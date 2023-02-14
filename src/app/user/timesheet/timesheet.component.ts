import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { ManageTimesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  isFormReady: boolean = false;
  employeeDetails: autoCompleteModal = new autoCompleteModal();
  employeeId: number = 0;
  userName: string = "";
  fromDate: any = null;
  toDate: any = null;
  isEmployeesReady: boolean = false;
  userDetail: UserDetail = new UserDetail();
  clientId: number = 0;
  clientDetail: autoCompleteModal = null;
  client: any = null;
  isLoading: boolean = false;
  isTimesheetDataLoaded: boolean = false;
  divisionCode: number = 0;
  PendingAttendacneMessage: string = 'Select above pending timesheet link to submit before end of the month.';
  isBlocked: boolean = false;
  dailyTimesheetDetails: Array<any> = [];
  NoClient: boolean = false;

  constructor(private http: AjaxService,
    private nav: iNavigation,
    private user: UserService
  ) {
    this.employeeDetails.placeholder = "Employee";
    this.employeeDetails.data.push({
      value: '0',
      text: 'Select Employee'
    });
  }

  ngOnInit(): void {
    this.clientDetail = {
      data: [],
      placeholder: "Select Employee"
    }
    this.isFormReady = false;
    let data = this.nav.getValue();
    if(data) {
      this.employeeId = data.EmployeeId;
      this.clientId = data.ClientUid;
      this.userName = data.FirstName + " " + data.LastName;
      this.isEmployeesReady = true;
      this.loadMappedClients();
    } else {
      this.userDetail = this.user.getInstance() as UserDetail;
      if(this.userDetail  && this.userDetail !== null) {
        this.employeeId = this.userDetail.UserId;
        this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
        this.loadMappedClients();
      } else {
        Toast("Invalid user. Please login again.")
      }
    }
  }

  loadMappedClients() {
    this.http.get(`employee/LoadMappedClients/${this.employeeId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        let mappedClient = response.ResponseBody.AllocatedClients;
        if(mappedClient != null && mappedClient.length > 0) {
          let i = 0;
          while(i < mappedClient.length) {
            this.clientDetail.data.push({
              text: mappedClient[i].ClientName,
              value: mappedClient[i].ClientId,
            });
            i++;
          }

          if(mappedClient.length == 1) {
            this.clientId = mappedClient[0].ClientId;
            this.clientDetail.className = 'disabled-input';
            this.presentWeek();
          }
          Toast("Client loaded successfully.");
        } else {
          ErrorToast("Unable to get client detail. Please contact admin.");
        }

        this.isEmployeesReady = true;
        $('#loader').modal('hide');
      } else {
        ErrorToast("Unable to get client detail. Please contact admin.");
      }
    });
  }

  presentWeek() {
    if(this.clientId > 0) {
      this.isLoading = true;
      let currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      this.fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      if(this.fromDate) {
        this.toDate = new Date();
        if (this.toDate.getDay() == 6)
          this.toDate.setDate(this.toDate.getDate() + 1);

        if (this.toDate.getDay() == 5)
          this.toDate.setDate(this.toDate.getDate() + 2);

        this.getUserTimesheetData();
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
        this.getUserTimesheetData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  getAllPendingTimesheet() {
    // if(this.clientId > 0) {
    //   this.http.get(`Timesheet/GetPendingTimesheetById/${this.employeeId}/${this.clientId}`).then((response: ResponseModel) => {
    //     if(response.ResponseBody && response.ResponseBody.length > 0) {
    //       this.PendingAttendacneMessage = 'Select above pending timesheet link to submit before end of the month.';
    //       this.buildPendingTimesheetModal(response.ResponseBody);
    //     } else {
    //       this.divisionCode = 2;
    //       this.PendingAttendacneMessage = "Wow!!! You don't have any pending attendace for this month.";
    //     }
    //   });
    // } else {
    //   WarningToast("Please select employer first.");
    // }
  }

  viewTimeSheet(item: any) {
    if(item) {
      this.nav.navigate(ManageTimesheet, item);
    } else {
      WarningToast("Invalid timesheet selected. Please contact to admin.");
    }
  }

  getUserTimesheetData() {
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
      EmployeeId: Number(this.employeeId),
      ClientId: Number(this.clientId),
      UserTypeId : UserType.Employee,
      TimesheetFromDate: this.fromDate,
      TimesheetToDate: this.toDate,
      ForYear: this.fromDate.getFullYear(),
      ForMonth: this.fromDate.getMonth() + 1
    }

    this.http.post("Timesheet/GetTimesheetByUserId", data).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.dailyTimesheetDetails = response.ResponseBody;
        // this.createPageData();
        this.isTimesheetDataLoaded = true;
      }

      this.isFormReady = true;
      this.divisionCode = 1;
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      WarningToast(err.error.HttpStatusMessage);
    });
  }

  enablePermissionRequest() {
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
      EmployeeId: Number(this.employeeId),
      ClientId: Number(this.clientId),
      UserTypeId : UserType.Employee,
      TimesheetFromDay: this.fromDate,
      TimesheetToDay: this.toDate,
      ForYear: this.fromDate.getFullYear(),
      ForMonth: this.fromDate.getMonth() + 1
    }

    this.http.post("timesheet/EnablePermission", data).then((response: ResponseModel) => {
      if (response.ResponseBody)
        Toast("Enable Permission");
    })
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
          value: emp[index]["EmployeeId"],
          text: `${emp[index]["FirstName"]} ${emp[index]["LastName"]}`
        });
        index++;
      }
    }
  }

  // takeComments(e: any) {
  //   let elem: any = e.target;
  //   this.currentCommentElement = elem;
  //   let textarea = elem.closest("div").querySelector("textarea");
  //   let parentDv = elem.closest("div").querySelector("div");
  //   parentDv.classList.remove('d-none');
  //   textarea.focus();
  // }

  // captureComments(e: any) {
  //   let elem = e.target;
  //   this.currentCommentElement.value = elem.value;
  //   elem.closest("div").classList.add('d-none');
  // }

  // getMonday(d: Date) {
  //   if(d) {
  //     d = new Date(d);
  //     var day = d.getDay(),
  //         diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
  //     return new Date(d.setDate(diff));
  //   }
  //   return null;
  // }

  // buildTime(timeValue: number) {
  //   let totalTime: string = "";
  //   try {
  //     let hours = Math.trunc(timeValue/60);
  //     if(hours < 10) {
  //       totalTime = `0${hours}`;
  //     } else {
  //       totalTime = `${hours}`;
  //     }

  //     let minutes = timeValue % 60;
  //     if(minutes < 10) {
  //       totalTime += `:0${minutes}`;
  //     } else {
  //       totalTime += `:${minutes}`;
  //     }
  //   } catch(e) {
  //     Toast("Invalid time used.");
  //   }
  //   return totalTime;
  // }

  // buildWeekForm(at: any, item: any, timesheetId: number) {
  //   let status = -1;
  //   if (at.date.getMonth() != new Date().getMonth())
  //     status = 11;
  //   if (item == null) {
  //     return this.fb.group({
  //       TimesheetId: [timesheetId, Validators.required],
  //       EmployeeId: [0],
  //       ClientId: [0],
  //       UserTypeId: [UserType.Employee],
  //       TotalMinutes: [8 * 60 * 5, Validators.required],
  //       IsHoliday: [false],
  //       IsWeekEnd: [false],
  //       TimesheetStatus: [status, Validators.required],
  //       TimesheetDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
  //       PresentDate: [at.date, Validators.required],
  //       UserHours: ['00', Validators.required],
  //       UserMin: ['00', Validators.required],
  //       UserComments: ['', Validators.required]
  //     });
  //   } else {
  //     let totalTime = this.buildTime(item.TotalMinutes);
  //     let timeValues = totalTime.split(":");
  //     let hours = timeValues[0];
  //     let minutes = timeValues[1];
  //     return this.fb.group({
  //       TimesheetId: [timesheetId, Validators.required],
  //       EmployeeId: [item.EmployeeId],
  //       ClientId: [item.ClientId],
  //       UserTypeId: [item.UserTypeId],
  //       TotalMinutes: [totalTime, Validators.required],
  //       IsHoliday: [item.IsHoliday],
  //       IsWeekEnd: [item.IsWeekEnd],
  //       TimesheetStatus: [item.TimesheetStatus, Validators.required],
  //       TimesheetDisplayDay: [at.date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }), Validators.required],
  //       UserHours: [hours, Validators.required],
  //       UserMin: [minutes, Validators.required],
  //       PresentDate: [at.date, Validators.required],
  //       UserComments: ['', Validators.required]
  //     });
  //   }
  // }

  // initForm(timesheetDetail: Array<any>, index?: number) {
  //   let weekDaysList = [];
  //   if (index >= 0) {
  //     weekDaysList = this.distributedWeek[index];
  //   } else {
  //     weekDaysList = this.buildWeekDays();
  //   }
  //   this.weekDaysList = weekDaysList.map(item => item.date.getDay());

  //   let timesheetId = 0;
  //   if(timesheetDetail && timesheetDetail.length > 0) {
  //     timesheetId = timesheetDetail[0].TimesheetId;
  //   }

  //   this.timesheetForm = this.fb.group({
  //     timesheetArray: this.fb.array(weekDaysList.map(item => {
  //       item.date.setHours(0,0,0,0);
  //       let value = timesheetDetail.find(x => new Date(x.PresentDate).getDate() == item.date.getDate());
  //       return this.buildWeekForm(item, value, timesheetId);
  //     }))
  //   });
  //   if (isNaN(index))
  //     this.weeklyTimeSheetDistribution();
  //   this.countTotalTime();
  // }

  // weeklyTimeSheetDistribution() {
  //   let value = this.timesheetForm.value.timesheetArray.filter(x => x.TimesheetStatus != 11);
  //   let count = 0;
  //   this.currentMonthWeek = [];
  //   for (let i = 0; i < this.distributedWeek.length; i++) {
  //     let index = 0;
  //     if (this.emptyFields.length > 0 && count == 0) {
  //       index =  this.emptyFields.length;
  //       count = 1;
  //     }
  //     let status = 0;
  //     let filterrecord = value.filter(x => x.PresentDate.getTime() >= this.distributedWeek[i][index].date.getTime() && x.PresentDate.getTime() <= this.distributedWeek[i][this.distributedWeek[i].length-1].date.getTime())
  //     if (filterrecord.length > 0){
  //       if (filterrecord.length > 0) {
  //         if ((filterrecord.filter(x => x.TimesheetStatus == 6)).length > 0)
  //           status = 6;
  //         else if ((filterrecord.filter(x => x.TimesheetStatus == 2)).length > 0)
  //           status = 2;
  //         else if ((filterrecord.filter(x => x.TimesheetStatus == 9)).length > 0)
  //           status = 9;
  //         else if ((filterrecord.filter(x => x.TimesheetStatus == 5)).length > 0)
  //           status = 5;
  //         else if ((filterrecord.filter(x => x.TimesheetStatus == -1)).length > 0)
  //           status = -1;
  //       }
  //     }
  //     this.currentMonthWeek.push( {
  //       startWeek: this.distributedWeek[i][index].date,
  //       endWeek: this.distributedWeek[i][this.distributedWeek[i].length-1].date,
  //       status: status
  //     })
  //   }
  // }

  // countTotalTime() {
  //   let records = this.timesheetForm.get("timesheetArray")["controls"];
  //   this.totalHrs = '';
  //   this.totalMins = '';
  //   this.billingHrs = '';
  //   let hrsValue = 0;
  //   let minsValue = 0;
  //   let billingValue = 0;
  //   let i = 0;
  //   while (i < records.length) {
  //     let date = new Date(records[i].get("PresentDate").value);
  //     if (date.getMonth() == new Date().getMonth() && (records[i].get("TimesheetStatus").value != 11 && records[i].get("TimesheetStatus").value != -1)) {
  //       let day = Number(date.getDay());
  //       if(!isNaN(day) && day !== 6 && day !== 0) {
  //         hrsValue +=  Number(records[i].get("UserHours").value);
  //         minsValue +=  Number(records[i].get("UserMin").value);
  //       }
  //       billingValue +=  parseInt(records[i].get("TotalMinutes").value);
  //     }
  //     i++;
  //   }

  //   if (minsValue > 0) {
  //     this.totalMins = (minsValue < 10 ? `0${minsValue}` : minsValue).toString();
  //   } else {
  //     this.totalMins = "00";
  //   }

  //   if (hrsValue > 0) {
  //     this.totalHrs = (hrsValue < 10 ? `0${hrsValue}` : hrsValue).toString();
  //   } else {
  //     this.totalHrs = "00";
  //   }

  //   if (billingValue > 0) {
  //     this.billingHrs = (billingValue < 10 ? `0${billingValue}` : billingValue).toString();
  //   } else {
  //     this.billingHrs = "00";
  //   }
  // }

  // manageMinField(index: number, e: any) {
  //   let min = parseInt(e.target.value);
  //   let value: any = "";
  //   if (min > 0) {
  //     value = (min < 10 ? `0${min}` : min).toString();
  //   } else {
  //     value = "00";
  //   }
  //   let records = this.timesheetForm.get("timesheetArray")["controls"];
  //   if(records && records.length >= index) {
  //     records[index].get("UserMin").setValue(value);
  //   }
  //   this.countTotalTime();
  // }

  // manageHourField(index: number, e: any, weekDaysList : Array<any>) {
  //   // let hrs = this.timesheetForm.get("UserHours").value;
  //   let hrs = parseInt(e.target.value);
  //   let value: any = "";
  //   if (hrs > 0 ) {
  //     value = (hrs < 10 ? `0${hrs}` : hrs).toString();
  //   } else {
  //     value = "00";
  //   }

  //   let records = this.timesheetForm.get("timesheetArray")["controls"];
  //   if(records && records.length >= index) {
  //     records[index].get("UserHours").setValue(value);
  //   }
  //   this.countTotalTime();
  // }

  // calculateTime(UserHours: string, UserMin: string) {
  //   let totalTime: number = 0;
  //   try{
  //     if (UserMin != "" && UserHours != "") {
  //       let hours = parseInt(UserHours);
  //       let minutes = parseInt(UserMin);
  //       if (hours >= 0 && hours <= 24 && minutes >= 0 && minutes < 60) {
  //         totalTime = hours * 60 + minutes;
  //       } else {
  //         Toast("Please input correct working hours and minutes");
  //         return;
  //       }
  //     }
  //   } catch(e) {
  //     Toast("Invalid time used.");
  //   }
  //   return totalTime;
  // }

  // onSubmit(){
  //   this.isLoading = true;
  //   this.isBlocked = false;
  //   let values = JSON.stringify(this.timesheetForm.get("timesheetArray").value);
  //   let records: Array<any> = JSON.parse(values);
  //   let index = 0;
  //   while(index < records.length) {
  //     records[index].TotalMinutes = this.calculateTime(records[index].UserHours, records[index].UserMin);
  //     records[index].EmployeeId = Number(this.employeeId);
  //     records[index]["ClientId"] = Number(this.clientId);
  //     records[index].TimesheetStatus = 8;
  //     records[index].BillingHours = 0;
  //     records[index]["PresentDate"] = new Date(records[index]["PresentDate"]);
  //     index++;
  //   }
  //   records = records.filter(x => x.PresentDate.getMonth() == new Date().getMonth());
  //   this.http.post("timesheet/InsertUpdateTimesheet", records)
  //   .then(response => {
  //     if (response.ResponseBody) {
  //       let index = response.ResponseBody.length;
  //       let submitTimesheetWeek =  this.currentMonthWeek.find(x => x.endWeek.getTime() == new Date(response.ResponseBody[index-1].PresentDate).getTime());
  //       submitTimesheetWeek.status = response.ResponseBody[index-1].TimesheetStatus;
  //       $('#timesheetModal').modal('hide');
  //       Toast("Created/Updated successfully");
  //       //this.initForm(response.ResponseBody);
  //     } else {
  //       Toast("Fail to inser/update, please contact to admin.");
  //     }
  //     this.isLoading = false;
  //   }).catch(e => {
  //     this.isLoading = false;
  //     this.isBlocked = true;
  //     ErrorToast("You have permission to submit only current week timesheet.");
  //   });
  // }

  // buildWeekDays(): Array<any> {
  //   let weekDaysList = [];
  //   let currentDate = null;
  //   this.emptyFields = [];
  //   let day = this.fromDate.getDay();
  //   let value = 0;
  //   if(this.fromDate.getDate() < 6  && (day > 1 || day == 0)) {
  //     value = day == 0 ? 6 : day-1 ;
  //     for (let i = 0; i < value; i++) {
  //       let  currentDate = new Date(this.fromDate.getTime());
  //       currentDate.setDate(this.fromDate.getDate() - (value-i));
  //       let data = {
  //         date: new Date(currentDate),
  //         hrs: "00",
  //         mins: "00"
  //       };
  //       weekDaysList.push(data);
  //       this.emptyFields.push(data);
  //       currentDate = null;
  //     }
  //   }
  //   if((this.toDate - this.fromDate) > 0){
  //     let index = 0;
  //     //let to = 7;
  //     let to = (this.toDate.getDate() - this.fromDate.getDate())+1;
  //     while(index < to) {
  //       currentDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
  //       weekDaysList.push({
  //         date: new Date(currentDate.setDate(currentDate.getDate() + index)),
  //         hrs: "00",
  //         mins: "00"
  //       });
  //       currentDate = null;
  //       index++;
  //     }
  //   } else {
  //     Toast("Wrong date seleted.")
  //   }

  //   let i = 0;
  //   while(i < weekDaysList.length) {
  //     if (weekDaysList[i].date.getDay() == 0 || weekDaysList[i].date.getDay() == 6) {
  //       weekDaysList[i].hrs = "00";
  //       weekDaysList[i].mins = "00";
  //     }
  //     i++;
  //   }

  //   this.distributedWeek = [];
  //   //this.currentMonthWeek = [];
  //   let index = 0;
  //   while (index <weekDaysList.length) {
  //     let increment = index + 7;
  //     let data = weekDaysList.slice(index, increment);
  //     this.distributedWeek.push(data);
  //     index=(index+7);
  //   }

  //   // let count = 0;
  //   // for (let i = 0; i < this.distributedWeek.length; i++) {
  //   //   let index = 0;
  //   //   if (this.emptyFields.length > 0 && count == 0) {
  //   //     index =  this.emptyFields.length;
  //   //     count = 1;
  //   //   }
  //   //   this.currentMonthWeek.push( {
  //   //     startWeek: this.distributedWeek[i][index].date,
  //   //     endWeek: this.distributedWeek[i][this.distributedWeek[i].length-1].date
  //   //   })
  //   // }
  //   return weekDaysList;
  // }

  // fromDateSelection(e: NgbDateStruct) {
  //   if (this.clientId > 0) {
  //     let date = `${e.year}-${e.month}-${e.day}`;
  //     let seletedDate = new Date(date);
  //     this.fromDate = this.getMonday(new Date(seletedDate));
  //     //this.fromDate = new Date(seletedDate.getFullYear(), seletedDate.getMonth(), 1);
  //     if(this.fromDate) {
  //       this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
  //       this.toDate.setDate(this.toDate.getDate() + 6);
  //       this.getUserTimesheetData();
  //     }
  //   } else {
  //     WarningToast("Please select employer first.");
  //   }
  // }

  // toDateSelection(e: NgbDateStruct) {
  //   this.toDate = `${e.year}-${e.month}-${e.day}`;
  // }

  // nextWeek() {
  //   this.divisionCode = 1;
  //   this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() + 7));
  //   if (this.fromDate) {
  //     this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
  //     this.toDate.setDate(this.toDate.getDate() + 6);
  //     this.getUserTimesheetData();
  //   }

  //   this.fromModel = { day: this.fromDate.getDate(), month: this.fromDate.getMonth() + 1, year: this.fromDate.getFullYear()};
  // }

  // prevWeek() {
  //   this.fromDate = new Date(this.fromDate.setDate(this.fromDate.getDate() - 7));
  //   if (this.fromDate) {
  //     this.toDate = new Date(`${this.fromDate.getFullYear()}-${this.fromDate.getMonth() + 1}-${this.fromDate.getDate()}`);
  //     this.toDate.setDate(this.toDate.getDate() + 6);
  //     this.getUserTimesheetData();
  //   }

  //   this.fromModel = { day: this.fromDate.getDate(), month: this.fromDate.getMonth() + 1, year: this.fromDate.getFullYear()};
  // }





  // checkDateExists(currenDate: Date, existingDateList: Array<any>) {
  //   let i = 0;
  //   let date = null;
  //   while(i < existingDateList.length) {
  //     date = new Date(existingDateList[i]["PresentDate"]);
  //     if(currenDate.getFullYear() == date.getFullYear() &&
  //        currenDate.getMonth() == date.getMonth() &&
  //        currenDate.getDate() == date.getDate()) {
  //          return true;
  //        }
  //     i++;
  //   }
  //   return false;
  // }

  // buildPendingTimesheetModal(res: Array<any>) {
  //   let now: any = new Date(new Date().setHours(0,0,0,0));
  //   let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  //   this.weekList = [];
  //   let week: Array<any> = [];

  //   let dayNum = 0;
  //   let date = null;
  //   let i = 1;
  //   let index = 0;
  //   let totalDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
  //   let workingDate = null;
  //   let isExisting = false;
  //   while(i <= totalDays) {
  //     workingDate = new Date(startDate.getFullYear(), startDate.getMonth(), i);
  //     if(now - workingDate <= 0) {
  //       if (this.weekList.length > 0) this.divisionCode = 2;
  //       return;
  //     }

  //     if(this.checkDateExists(workingDate, res)) {
  //       i++;
  //       continue;
  //     }
  //     dayNum = workingDate.getDay();
  //     switch(dayNum) {
  //       case 1:
  //         isExisting = false;
  //         week = [];
  //         index = 0;
  //         while(index < 7){
  //           date = new Date(startDate.getFullYear(), startDate.getMonth(), i + index);
  //           if(this.checkDateExists(date, res)) {
  //             index = 7;
  //             isExisting = true;
  //             break;
  //           }
  //           week.push({
  //             date: date,
  //             position: index,
  //             day: date.getDay()
  //           });
  //           index++;
  //         }

  //         if(!isExisting) {
  //           this.weekList.push({
  //             weekNum: this.weekList.length + 1,
  //             days: week
  //           });
  //         }
  //         i = i + (index - 1);
  //         break;
  //       default:
  //         isExisting = false;
  //         date = new Date(startDate.getFullYear(), startDate.getMonth(), i + index);
  //         dayNum = date.getDay();
  //         date.setDate(date.getDate() - dayNum);

  //         week = [];
  //         index = 0;
  //         let flag = false;
  //         while(index < 7){
  //           date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
  //           if(date.getDate() == 2 || flag){
  //             if(this.checkDateExists(date, res)) {
  //               index = 7;
  //               isExisting = true;
  //               break;
  //             }
  //             flag = true;
  //             i++;
  //           }

  //           week.push({
  //             date: date,
  //             position: index,
  //             day: date.getDay()
  //           });
  //           index++;
  //         }

  //         if(!isExisting) {
  //           this.weekList.push({
  //             weekNum: this.weekList.length + 1,
  //             days: week
  //           });
  //         }
  //         break;
  //     }
  //     i++;
  //   }
  //   if (this.weekList.length > 0) this.divisionCode = 2;
  // }

    // createPageData() {
  //   if(this.dailyTimesheetDetails.length > 0) {
  //     let index = 0;
  //     while (index < this.dailyTimesheetDetails.length) {
  //       let value = this.dailyTimesheetDetails[index].PresentDate;
  //       if(value) {
  //         this.dailyTimesheetDetails[index].PresentDate = new Date(value);
  //       }
  //       index++;
  //     }

  //     this.initForm(this.dailyTimesheetDetails);
  //     this.isFormReady = true;
  //   } else {
  //     Toast("Unable to get user data.");
  //   }
  // }
}
