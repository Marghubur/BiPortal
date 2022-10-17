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
  request: Array<ApprovalRequest> = [];
  leave_request: Array<ApprovalRequest> = [];
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: ApprovalRequest = new ApprovalRequest();
  managerList: autoCompleteModal = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendance: any = null;
  attendanceDetail: Array<any> = [];
  currentAttendanceDetail: any = null;
  requestModal: number = 0;

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
    this.itemStatus = 2;
    this.loadData();
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`Request/GetPendingRequests/${this.currentUser.UserId}/${this.itemStatus}`).then(response => {
      if(response.ResponseBody) {
        if(response.ResponseBody)
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
    this.request = [];
    this.leave_request = [];

    if(req.ApprovalRequest) {
      this.request = req.ApprovalRequest.filter(x => x.RequestType == 2);
      this.leave_request = req.ApprovalRequest.filter(x => x.RequestType == 1);
    }

    this.attendance = req.AttendaceTable;
    this.filterAttendance(ItemStatus.Pending);
  }

  openPopup(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 1; // leave
    this.currentRequest = request;
  }

  openAttendacneModal(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.requestModal = 3; // leave
    this.currentAttendanceDetail = request;
    this.currentRequest = request;
    this.currentRequest["EmployeeName"]  = this.currentAttendanceDetail.EmployeeName;
  }

  filterRequest(e: any) {
    this.itemStatus = Number(e.target.value);
    switch (this.active) {
      case 1:
        this.filterAttendance(this.itemStatus);
        break;
      case 2:
      
        break;
      case 3:
      
        break;
    }
  }

  filterAttendance(status: number) {
    this.attendanceDetail = [];
    if(this.attendance && this.attendance.length > 0) {
      this.attendance.map(item => {
        let detail:Array<any> = JSON.parse(item.AttendanceDetail);        
        if(detail && detail.length > 0) {
          if (status > 0)
            detail = detail.filter(x => x.PresentDayStatus === status);
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

  submitRequest(header: string) {
    switch(this.requestModal) {
      case 1: // leave
      case 2: // timesheet
        this.actionForLeaveAndTimesheet(header);
      break;
      case 3: // attendance
        this.submitAttendanceUpdate();
      break;
    }
  }

  actionForLeaveAndTimesheet(header: string) {
    this.isLoading = true;
    let endPoint = '';

    switch(this.active) {
      case 1:
        endPoint = `Request`;
        break;
      case 2:
        endPoint = `Leave`;
        break;
      case 3:
        WarningToast("Invalid tab selected");
        return;
      default:
        WarningToast("Invalid tab selected");
        return;
    }

    switch(header) {
      case 'Approved':
        this.currentRequest.RequestStatusId = ItemStatus.Approved;
        endPoint = `${endPoint}/ApprovalAction/${this.itemStatus}`;
        break;
      case 'Rejected':
        this.currentRequest.RequestStatusId = ItemStatus.Rejected;
        endPoint = `${endPoint}/ApprovalAction/${this.itemStatus}`;
        break;
      case 'Othermember':
        endPoint = `${endPoint}/ApprovalAction/${this.itemStatus}`;
        break;
      default:
        throw 'Invalid option selected.';
        break;
    }

    this.http.put(endPoint, this.currentRequest).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        $('#leaveModal').modal('hide');
        this.isLoading = false;
        Toast("Submitted Successfully");
        this.buildPage(response.ResponseBody);
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitAttendanceUpdate() {
    if (this.attendance) {
      this.http.put(`attendance/AttendanceRequestAction/${this.currentAttendanceDetail.AttendanceId}/${ItemStatus.Approved}`, 
      this.currentAttendanceDetail).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.reBindAttendanceData(response.ResponseBody);
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Attendance detail not found. Please contact to admin.");
    }
  }

  reBindAttendanceData(req: any) {
    this.attendanceDetail = req;
    if(this.attendance && this.attendance.length > 0) {
      this.attendance.map(item => {
        let detail:Array<any> = JSON.parse(item.AttendanceDetail);        
        if(detail && detail.length > 0) {          
          detail = detail.filter(x => x.AttendenceStatus !== 3 && x.PresentDayStatus === 2);
          if(detail.length > 0) {
            for (let i = 0; i < detail.length; i++) {
              detail[i].AttendanceId = item.AttendanceId;        
            }

            this.attendanceDetail.push(...detail);          
          }
        }
      });
    }

    $('#leaveModal').modal('hide');
    this.isLoading = false;
    Toast("Submitted Successfully");
  }
}

export class ApprovalRequest {
  ApprovalRequestId: number = null;
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
