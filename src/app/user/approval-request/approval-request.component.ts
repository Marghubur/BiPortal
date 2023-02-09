import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit {
  active = 1;
  leave_request: any = null;
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: any = null;
  currentTimesheet: Array<any> = [];
  managerList: autoCompleteModal = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendance: any = null;
  timesheet: any = null;
  attendanceDetail: Array<any> = [];
  timesheetDetail: Array<any> = [];
  leaveDeatil: Array<any> = [];
  requestModal: number = 0;
  attendanceUrl: string = null;
  currentYear: number = 0;
  monthsName: Array<any> = [];

  constructor(
    private http: AjaxService,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getInstance();
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.currentYear = new Date().getFullYear();
    for (let i = 0; i <= new Date().getMonth(); i++) {
      this.monthsName.push(new Date(this.currentYear, i, 1))
    }
    this.itemStatus = 2;
    this.loadData();
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`AttendanceRequest/GetManagerRequestedData/${this.currentUser.UserId}/${this.itemStatus}`).then(response => {
      if(response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        this.isPageLoading = false;
      } else {
        ErrorToast("Fail to fetch data. Please contact to admin.");
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  buildPage(req: any) {
    this.leave_request = [];

    if(req.ApprovalRequest) {
      this.leave_request = req.ApprovalRequest;
      this.filterLeave();
    }

    this.attendance = [];
    if (req.AttendaceTable) {
      this.attendance = req.AttendaceTable;
      this.filterAttendance();
    }

    this.timesheet = [];
    if (req.TimesheetTable) {
      this.timesheet = req.TimesheetTable;
      this.weekDistributed();
    }
  }

  reloadPage() {
    this.loadData();
  }

  openLeaveModal(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 1; // leave
    this.currentRequest = request;
    this.currentRequest["EmployeeName"] = request.FirstName + " " + request.LastName;
  }

  openTimesheetModal(state: string, request: any) {
    $('#timesheetModal').modal('show');
    this.requestState = state;
    this.currentTimesheet = request;
  }

  openAttendacneModal(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 3; // attendance
    this.currentRequest = request;
    this.currentRequest.RequestStatusId = request.PresentDayStatus;
    this.currentRequest["EmployeeName"] = request.EmployeeName;
  }

  buildAttendanceActionUrl() {
    switch(this.requestState) {
      case 'Approved':
        this.currentRequest.RequestStatusId = ItemStatus.Approved;
        this.attendanceUrl = 'AttendanceRequest/ApprovalAction';
        break;
      case 'Rejected':
        this.currentRequest.RequestStatusId = ItemStatus.Rejected;
        this.attendanceUrl = 'AttendanceRequest/RejectAction';
        break;
      case 'Othermember':
        this.attendanceUrl = 'AttendanceRequest/ReAssigneToOtherManager';
        break;
    }
  }

  submitRequest() {
    switch(this.requestModal) {
      case 1: // leave
        this.submitActionForLeave();
      break;
      case 3: // attendance
      this.requestState
        this.submitActionForAttendance();
      break;
    }
  }

  changeTab() {
    this.itemStatus = ItemStatus.Pending;
    switch (this.active) {
      case 1:
        this.filterAttendance();
        break;
      case 2:
        this.weekDistributed();
        break;
      case 3:
        this.filterLeave();
        break;
    }
  }

  filterRequest(e: any) {
    this.itemStatus = Number(e.target.value);
    // switch (this.active) {
    //   case 1:
    //     this.filterAttendance();
    //     break;
    //   case 2:
    //     this.weekDistributed();
    //     break;
    //   case 3:
    //     this.filterLeave();
    //     break;
    // }

    this.loadData();
  }

  filterAttendance() {
    this.attendanceDetail = [];
    if(this.attendance && this.attendance.length > 0) {
      this.attendance.map(item => {
        let detail:Array<any> = JSON.parse(item.AttendanceDetail);
        if(detail && detail.length > 0) {
          if (this.itemStatus > 0)
            detail = detail.filter(x => x.PresentDayStatus === this.itemStatus);
          else
            detail = detail.filter(x => x.PresentDayStatus === ItemStatus.Approved || x.PresentDayStatus === ItemStatus.Pending || x.PresentDayStatus === ItemStatus.Rejected);
          if(detail.length > 0) {
            for (let i = 0; i < detail.length; i++) {
              detail[i].AttendanceDay = new Date(detail[i].AttendanceDay);
              if(detail[i].AttendanceDay.getDay() === 0 || detail[i].AttendanceDay.getDay() === 6) {
                detail.splice(i, 1);
              } else {
                detail[i].AttendanceId = item.AttendanceId;
              }
            }
            this.attendanceDetail.push(...detail);
          }
        }
      });
    }
  }

  filterLeave() {
    this.leaveDeatil = [];
    if (this.leave_request && this.leave_request.length > 0) {
      let detail = [];
      if (this.itemStatus > 0)
        detail = this.leave_request.filter(x => x.RequestStatusId === this.itemStatus);
      else
        detail = this.leave_request.filter(x => x.RequestStatusId === ItemStatus.Approved || x.RequestStatusId === ItemStatus.Pending || x.RequestStatusId === ItemStatus.Rejected);
      if (detail && detail.length > 0)
        this.leaveDeatil = detail;
    }
  }

  weekDistributed() {
    this.timesheetDetail = [];
    if(this.timesheet && this.timesheet.length > 0) {
      this.timesheet.map(item => {
        let detail:Array<any> = JSON.parse(item.TimesheetMonthJson);
        let index = 0;
        while (index <detail.length) {
          let increment = index + 7;
          let data = detail.slice(index, increment);
          data = data.filter(x => new Date(x.PresentDate).getMonth() == new Date().getMonth());
          if (this.itemStatus > 0)
            data = data.filter(x => x.TimesheetStatus === this.itemStatus);
          else
            data = data.filter(x => x.TimesheetStatus === ItemStatus.Approved || x.TimesheetStatus === ItemStatus.Pending || x.TimesheetStatus === ItemStatus.Rejected);
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].TimesheetId = item.TimesheetId;
            }
            this.timesheetDetail.push(data);
          }
          //let totalTimeBurned = data.map(x => x.TotalMinutes).reduce((acc, curr) => {return acc + curr;}, 0);
          index=(index+7);
        }
      });

    }
  }

  getStatusId() {
    let statusId: number = 0;
    switch(this.requestState) {
      case 'Approved':
        statusId = ItemStatus.Approved;
        break;
      case 'Rejected':
        statusId = ItemStatus.Rejected;
        break;
      case 'Othermember':
        statusId = ItemStatus.ReAssigned
        break;
    }
    return statusId;
  }

  submitTimesheetRequest() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = 'TimesheetRequest/ApproveTimesheet';
        break;
      case 'Rejected':
        endPoint = 'TimesheetRequest/RejectAction';
        break;
      case 'Othermember':
        endPoint = 'TimesheetRequest/ReAssigneToOtherManager';
        break;
    }

    this.http.put(endPoint, this.currentTimesheet).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        $('#timesheetModal').modal('hide');
        Toast("Submitted Successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForLeave() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = 'LeaveRequest/ApprovalAction';
        break;
      case 'Rejected':
        endPoint = 'LeaveRequest/RejectAction';
        break;
      case 'Othermember':
        endPoint = 'LeaveRequest/ReAssigneToOtherManager';
        break;
      default:
        throw 'Invalid option selected.';
        break;
    }
    let currentResponse = {
      LeaveFromDay: this.currentRequest.FromDate,
      LeaveToDay: this.currentRequest.ToDate,
      EmployeeId: this.currentRequest.EmployeeId,
      LeaveRequestNotificationId : this.currentRequest.LeaveRequestNotificationId,
    }
    this.http.put(endPoint, currentResponse).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.buildPage(response.ResponseBody);
        $('#leaveModal').modal('hide');
        this.isLoading = false;
        Toast("Submitted Successfully");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForAttendance() {
    this.isLoading = true;
    if (this.attendance) {
      this.buildAttendanceActionUrl()
      this.http.put(this.attendanceUrl,this.currentRequest).then((response:ResponseModel) => {
        if(response.ResponseBody) {
          this.buildPage(response.ResponseBody);
          this.isPageLoading = false;
        } else {
          ErrorToast("Fail to fetch data. Please contact to admin.");
        }
        this.isLoading = false;
        $('#leaveModal').modal('hide');
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Attendance detail not found. Please contact to admin.");
    }
  }

  onYearChange(e: any) {
    let value = Number(e.target.value);
    if (value) {
      this.monthsName = [];
      if (value == new Date().getFullYear()) {
        for (let i = 0; i <= new Date().getMonth(); i++) {
          this.monthsName.push(new Date(value, i, 1))
        }
      } else {
        for (let i = 0; i <= 11; i++) {
          this.monthsName.push(new Date(value, i, 1))
        }
      }
    }
  }
}

export class ApprovalRequest {
  LeaveRequestNotificationId: number = null;
  AttendanceId: number = 0;
	UserName:string = '';
  EmployeeName: string = '';
	Message:string = '';
	UserId:number = null;
	UserTypeId: number = null;
	RequestedOn:Date = null;
	Email:string  = '';
	Mobile:string = '';
	FromDate:Date = null;
	ToDate:Date = null;
	AssigneeId:number = null;
	ProjectId:number = null;
	ProjectName:string = '';
  RequestStatusId: number = 0;
  RequestType: string = "";
}
