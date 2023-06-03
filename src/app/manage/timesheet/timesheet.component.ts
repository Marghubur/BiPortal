import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AdminManageTimesheet, ItemStatus, UserType} from 'src/providers/constants';
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
  time = new Date();
  DayValue: number = 0;
  clientId: number = 0;
  clientDetail: autoCompleteModal = null;
  client: any = null;
  NoClient: boolean = false;
  daysInMonth: number = 0;
  cachedData: any = null;
  currentEmployee: any = null;
  applicationData: any = [];
  employeesList: autoCompleteModal = new autoCompleteModal();
  dailyTimesheetDetails: Array<any> = [];
  viewTimesheetWeek: any = null;
  isBlocked: boolean = false;
  isTimesheetDataLoaded: boolean = false;
  month: any = "";
  timesheetData: Timesheet = null;
  today: Date = null;

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
    var dt = new Date();
    this.month = dt.getMonth() + 1;
    var year = dt.getFullYear();
    this.today = new Date();
    this.daysInMonth = new Date(year, this.month, 0).getDate();
    this.clientDetail = {
      data: [],
      className: "disabled-input",
      placeholder: "Select Organization"
    }

    this.employeesList = {
      data: [],
      className: "disabled-input",
      placeholder: "Select Employee"
    }
    this.isFormReady = false;
    this.time = new Date();
    this.timesheetData = {
      EmployeeId: Number(this.employeeId),
      ClientId: Number(this.clientId),
      TimesheetStartDate: dt,
      TimesheetStatus: ItemStatus.Pending,
      IsSaved: false,
      IsSubmitted: false,
      ForYear: dt.getFullYear(),
      ForMonth: dt.getMonth() + 1
    }
    this.userDetail = this.user.getInstance() as UserDetail;
    this.DayValue = this.time.getDay();
    this.cachedData = this.nav.getValue();
    if(this.cachedData ||  this.userDetail.RoleId != UserType.Admin) {
      this.employeeId = this.cachedData != null ? this.cachedData.EmployeeUid :  this.userDetail.UserId;
      this.clientId = this.cachedData != null ? this.cachedData.ClientUid : 0;
      this.userName = this.cachedData != null ? this.cachedData.FirstName + " " + this.cachedData.LastName :  this.userDetail.FirstName + " " +  this.userDetail.LastName;
      this.isEmployeesReady = true;
    } else {
      this.employeeId = this.userDetail.UserId;
      this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
      //$('#loader').modal('show');
      this.employeeId =0;
    }
    this.loadData();

  }

  loadData() {
    this.isEmployeesReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        this.employeesList.data = GetEmployees();
        if (this.userDetail.RoleId != UserType.Admin) {
          this.employeesList.className = "disabled-input";
          this.findEmployee(this.userDetail.UserId);
        } else {
          this.employeesList.className = "";
        }
        this.isEmployeesReady = true;
      }
    });
  }

  loadTimesheets() {
    this.isFormReady = false;
    this.timesheetData.EmployeeId = this.employeeId;
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
        this.loadTimesheets();
      }
    } else {
      WarningToast("Please select employer first.");
    }
  }

  viewTimeSheet(item: any) {
    if(item && item.TimesheetId > 0) {
      let client = this.clientDetail.data.find(x => x.value == item.ClientId);
      item.ClientName = client.text;
      item.UserName = this.currentEmployee.FirstName + " " + this.currentEmployee.LastName;
      this.nav.navigate(AdminManageTimesheet, item);
    } else {
      WarningToast("Invalid timesheet selected. Please contact to admin.");
    }
  }

  filterTimesheet() {
    this.loadTimesheets();
  }

  advanceFilterPopUp() {
    $('#timesheetfilter').modal('show')
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
      this.clientId =0;
      this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid === parseInt(employeeId));
      if (this.currentEmployee && this.currentEmployee.ClientJson != null) {
        this.userName = `${this.currentEmployee.FirstName} ${this.currentEmployee.LastName}`;
        let clients = JSON.parse(this.currentEmployee.ClientJson);
        this.clientDetail = {
          data: [],
          className: "",
          placeholder: "Select Organization"
        }
        this.isFormReady = false;
        this.NoClient = false;
        if (clients.length  == 1) {
          this.clientId = clients[0].CompanyId;
          this.clientDetail.data.push({
            text: clients[0].CompanyName,
            value: clients[0].CompanyId,
          });
          this.clientDetail.className= "disabled-input";
          this.presentWeek();
        }
        else {
          let i = 0;
          while(i < clients.length) {
            this.clientDetail.data.push({
              text: clients[i].CompanyName,
              value: clients[i].CompanyId,
            });
            i++;
          }
          this.clientId = 0;
        }
      } else {
        this.isFormReady = false;
        this.NoClient = true;
        this.clientDetail.placeholder = "Select Organization";
        this.clientDetail.data.push({
          value: '0',
          text: 'Select Organization'
        });
        this.clientId = 0;
      }
    }
  }
}

export interface Timesheet {
  TimesheetStatus: number;
  IsSaved: boolean;
  IsSubmitted: boolean;
  ForYear: number;
  EmployeeId: number;
  ClientId: number;
  ForMonth: number;
  TimesheetStartDate: Date;
}
