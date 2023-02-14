import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus, ManageTimesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.scss']
})
export class TimesheetComponent implements OnInit {
  timesheetForm: FormGroup;
  timesheetData: Timesheet = null;
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
  months: any = null;
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
    let date = new Date();
    this.clientDetail = {
      data: [],
      placeholder: "Select Employee"
    }
    let data = this.nav.getValue();
    this.months=[0,1,2,3,4,5,6,7,8,9,10,11].map(x=>new Date(2000,x,2))
    if(data) {
      this.employeeId = data.EmployeeId;
      this.clientId = data.ClientUid;
      this.userName = data.FirstName + " " + data.LastName;
      this.isEmployeesReady = true;
    } else {
      this.userDetail = this.user.getInstance() as UserDetail;
      if(this.userDetail  && this.userDetail !== null) {
        this.employeeId = this.userDetail.UserId;
        this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
      } else {
        Toast("Invalid user. Please login again.")
        return;
      }
    }

    this.timesheetData = {
      EmployeeId: Number(this.employeeId),
      ClientId: Number(this.clientId),
      TimesheetStartDate: date,
      TimesheetStatus: ItemStatus.Pending,
      IsSaved: false,
      IsSubmitted: false,
      ForYear: date.getFullYear(),
      ForMonth: date.getMonth() + 1
    }

    this.loadMappedClients();
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
      let currentDate = new Date(new Date().setHours(0, 0, 0, 0));
      this.fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      if(this.fromDate) {
        this.toDate = new Date();
        if (this.toDate.getDay() == 6)
          this.toDate.setDate(this.toDate.getDate() + 1);

        if (this.toDate.getDay() == 5)
          this.toDate.setDate(this.toDate.getDate() + 2);

        this.timesheetData.ClientId = this.clientId;
        this.loadData();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  // getPendingWeek(from: Date, to: Date) {
  //   if(this.clientId > 0) {
  //     if(from && to) {
  //       this.fromDate = new Date(from);
  //       this.toDate = new Date(to);
  //       this.loadData();
  //     }
  //   } else {
  //     WarningToast("Please select employer first.");
  //   }
  // }

  // enablePermissionRequest() {
  //   if(this.employeeId <= 0) {
  //     Toast("Invalid user selected.")
  //     return;
  //   }

  //   if(!this.fromDate) {
  //     Toast("Invalid from and to date seleted.")
  //     return;
  //   }

  //   if(!this.toDate) {
  //     Toast("Invalid from and to date seleted.")
  //     return;
  //   }

  //   let data: Timesheet = {
  //     EmployeeId: Number(this.employeeId),
  //     ClientId: Number(this.clientId),
  //     TimesheetStartDate: this.fromDate,
  //     TimesheetStatus: this.timesheetData.TimesheetStatus,
  //     IsSaved: this.timesheetData.IsSaved,
  //     IsSubmitted: this.timesheetData.IsSubmitted,
  //     ForYear: this.fromDate.getFullYear(),
  //     ForMonth: this.fromDate.getMonth() + 1
  //   }

  //   this.http.post("timesheet/EnablePermission", data).then((response: ResponseModel) => {
  //     if (response.ResponseBody)
  //       Toast("Enable Permission");
  //   })
  // }

  // buildEmployeeDropdown(emp: Array<any>) {
  //   if(emp) {
  //     this.employeeDetails.data = [];
  //     this.employeeDetails.data.push({
  //       value: '0',
  //       text: 'Select Employee'
  //     });

  //     let index = 0;
  //     while(index < emp.length) {
  //       this.employeeDetails.data.push({
  //         value: emp[index]["EmployeeId"],
  //         text: `${emp[index]["FirstName"]} ${emp[index]["LastName"]}`
  //       });
  //       index++;
  //     }
  //   }
  // }

  viewTimeSheet(item: any) {
    if(item && item.TimesheetId > 0) {
      let client = this.clientDetail.data.find(x => x.value == item.ClientId);
      item.ClientName = client.text;
      this.nav.navigate(ManageTimesheet, item);
    } else {
      WarningToast("Invalid timesheet selected. Please contact to admin.");
    }
  }

  filterTimesheet() {
    this.loadData();
  }
  advanceFilterPopUp() {
    $('#timesheetfilter').modal('show')
  }


  loadData() {
    this.isFormReady = false;
    this.http.post("Timesheet/GetTimesheetByFilter", this.timesheetData).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.dailyTimesheetDetails = response.ResponseBody;
        this.isTimesheetDataLoaded = true;
      }
      this.isFormReady = true;
    }).catch(err => {
      this.isFormReady = true;

      WarningToast(err.error.HttpStatusMessage);
    });
  }
}

interface Timesheet {
  TimesheetStatus: number;
  IsSaved: boolean;
  IsSubmitted: boolean;
  ForYear: number;
  EmployeeId: number;
  ClientId: number;
  ForMonth: number;
  TimesheetStartDate: Date;
}
