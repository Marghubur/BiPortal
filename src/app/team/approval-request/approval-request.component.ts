import { Component, OnInit } from '@angular/core';
import { ApprovalRequest } from 'src/app/adminmodal/admin-modals';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus, UserType } from 'src/providers/constants';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit {
  active = 1;
  request: Array<ApprovalRequest> = [];
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: any = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendance: any = null;
  timesheet: any = null;
  attendanceDetail: Array<any> = [];
  currentAttendanceDetail: any = null;
  requestModal: number = 0;
  attendanceController: string = "AttendanceRequest";
  leaveController: string = "LeaveRequest";
  timesheetController: string = "TimesheetRequest";
  requestUrl: string = null;
  timesheetDetail: Array<any> = [];
  currentTimesheet: Array<any> = [];
  filterText: string = "Assigned to me";
  filterId: number = 0;
  attendanceRquestPageIsReady: boolean = false;
  requestFilter: Filter = new Filter();
  attendanceRequestDetail: Array<any> = [];
  currentApprovalRequest: any = null;
  requestModalData: any = null;
  viewer: any = null;
  basePath: string = "";
  leaveAttachment: Array<any> = [];
  employeeId: number = 0;
  employeeList: autoCompleteModal = null;
  applicationData: any = null;
  orderByAttendanceDateAsc: boolean = null;
  orderByRequestedOnAsc: boolean = null;
  requestedOn: number = 0;
  missAttendanceStatus: number = 0;
  isAdmin: boolean = false;
  timesheetId: number = 0;

  leaveRequestDetail: Array<any> = [];
  attendanceData: Filter = new Filter();
  attendanceRecord: Attendance;
  leaveData: Filter = new Filter();
  leaveRecord: Leave;

  constructor(
    private http: AjaxService,
    private local : ApplicationStorage,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.requestUrl = `${this.attendanceController}/GetManagerRequestedData`;
    this.currentUser = this.userService.getInstance();
    this.employeeList = new autoCompleteModal();
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee List";
    this.employeeList.data.push({
      value: 0,
      text: "Default Employee"
    });
    this.employeeList.isMultiSelect = false;
    this.basePath = this.http.GetImageBasePath();
    this.requestFilter.SortBy = null;
    this.requestFilter.PageIndex = 1;
    this.requestFilter.SearchString = "";
    if (this.currentUser.RoleId == UserType.Admin)
      this.isAdmin = true;
    else
      this.isAdmin = false;

    this.loadAutoComplete();
    this.itemStatus = 2;
    this.attendanceRecord = {
      EmployeeId: 0,
      ForMonth : new Date().getMonth() + 1,
      ForYear: new Date().getFullYear(),
      PageIndex: 1,
      ReportingManagerId : this.currentUser.UserId,
      PresentDayStatus: 0,
      TotalDays: 0
    };
    this.leaveRecord = {
      EmployeeId: 0,
      FromDate: new Date(),
      ToDate: new Date(),
      ReportingManagerId : this.currentUser.UserId,
      RequestStatusId: 0,
    }
    this.getAttendanceRequest();
  }

  updatePage(index: number) {
    if(index == 1) {
      this.requestUrl = `${this.attendanceController}/GetManagerRequestedData`;
      this.filterText = "Assigned to me";
      this.loadData();
    } else {
      this.requestUrl = `${this.attendanceController}/GetAllRequestedData`;
      this.filterText = "All request(s)";
      this.loadData();
    }
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`${this.requestUrl}/${this.currentUser.UserId}/${ItemStatus.Pending}`).then(response => {
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
    this.timesheet = [];
    this.timesheetDetail = [];
    if (req.TimesheetTable) {
      this.timesheet = req.TimesheetTable;
      if (this.active == 2)
        this.weekDistributed();
    }
  }

  openLeaveModal(state: string, request: any) {
    this.requestState = state;
    this.requestModal = 1; // leave
    this.currentRequest = request;
    this.currentRequest["EmployeeName"] = request.FirstName + " " + request.LastName;
    $('#leaveModal').modal('show');
  }

  openTimesheetModal(state: string, request: any) {
    this.requestState = state;
    this.timesheetId = request[0].TimesheetId;
    this.currentTimesheet = request;
    $('#timesheetModal').modal('show');
  }

  openAttendacneModal(state: string, request: any) {
    this.requestState = state;
    this.requestModal = 3; // attendance
    this.currentRequest = request;
    this.currentRequest.RequestStatusId = request.PresentDayStatus;
    let attendance = this.attendance.find( x=> x.AttendanceId == request.AttendanceId);
    this.currentRequest["EmployeeName"] = attendance.EmployeeName;
    this.currentRequest["Email"] = attendance.Email;
    this.currentRequest["Mobile"] = attendance.Mobile;
    $('#leaveModal').modal('show');
  }

  submitRequest() {
    switch(this.requestModal) {
      case 1: // leave
        this.submitActionForLeave();
      break;
      case 3: // attendance
        this.submitActionForAttendance();
      break;
    }
  }

  changeTab() {
    this.itemStatus = ItemStatus.Pending;
    switch (this.active) {
      case 2:
        this.weekDistributed();
        break;
    }
  }

  weekDistributed() {
    this.timesheetDetail = [];
    if(this.timesheet && this.timesheet.length > 0) {
      let timesheetsData = [];
      if (this.itemStatus == ItemStatus.Rejected || this.itemStatus == ItemStatus.Approved)
        timesheetsData = this.timesheet.filter(x => x.TimesheetStatus == this.itemStatus);
      else if (this.itemStatus == ItemStatus.Pending)
        timesheetsData = this.timesheet.filter(x => x.TimesheetStatus == ItemStatus.Pending);
      else if (this.itemStatus == 4)
        timesheetsData = this.timesheet.filter(x => x.TimesheetStatus === ItemStatus.Approved || x.TimesheetStatus === ItemStatus.Pending || x.TimesheetStatus === ItemStatus.Rejected);
      if (timesheetsData.length > 0) {
        timesheetsData.map(item => {
        let detail:Array<any> = JSON.parse(item.TimesheetWeeklyJson);
        for (let i = 0; i < detail.length; i++) {
          detail[i].EmployeeName = item.FirstName + " "+ item.LastName;
          detail[i].Email = item.Email;
          detail[i].Mobile = item.Mobile;
          detail[i].PresentDate = detail[i].PresentDate;
          detail[i].TimesheetStatus = item.TimesheetStatus;
          detail[i].TimesheetId = item.TimesheetId;
          detail[i].ClientName = item.ClientName;
          detail[i].ManagerName = item.ManagerName;
          detail[i].ManagerEmail = item.ManagerEmail;
          detail[i].ManagerMobile = item.ManagerMobile;
        }
        this.timesheetDetail.push(detail);
        });
      }
    }
  }

  getFilterType() {
    this.filterId = 0;
    switch(this.filterText) {
      case 'Assigned to me':
        this.filterId = 1;
        break;
    }
  }

  submitActionForLeave() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = `${this.leaveController}/ApproveLeaveRequest`;
        break;
      case 'Rejected':
        endPoint = `${this.leaveController}/RejectLeaveRequest`;
        break;
      case 'Othermember':
        endPoint = `${this.leaveController}/ReAssigneLeaveRequest`;
        break;
    }

    let currentResponse = {
      LeaveFromDay: this.currentRequest.FromDate,
      LeaveToDay: this.currentRequest.ToDate,
      EmployeeId: this.currentRequest.EmployeeId,
      LeaveRequestNotificationId : this.currentRequest.LeaveRequestNotificationId,
      RecordId: this.currentRequest.RecordId,
      LeaveTypeId: this.currentRequest.LeaveTypeId
    }

    this.http.put(`${endPoint}/${this.filterId}`, currentResponse).then((response:ResponseModel) => {
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

  submitTimesheetRequest() {
    this.isLoading = true;
    let endPoint = '';

    switch(this.requestState) {
      case 'Approved':
        endPoint = `${this.timesheetController}/ApproveTimesheetRequest`;
        break;
      case 'Rejected':
        endPoint = `${this.timesheetController}/RejectTimesheetRequest`;
        break;
      case 'Othermember':
        endPoint = `${this.timesheetController}/ReAssigneTimesheetRequest`;
        break;
    }

    this.http.put(`${endPoint}/${this.currentTimesheet[0].TimesheetId}/${this.filterId}`, this.currentTimesheet).then((response:ResponseModel) => {
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

  submitActionForAttendance() {
    this.isLoading = true;
    if (this.attendance) {
      let endPoint = "";
      switch(this.requestState) {
        case 'Approved':
          endPoint = `${this.attendanceController}/ApproveAttendanceRequest`;
          break;
        case 'Rejected':
          endPoint = `${this.attendanceController}/RejectAttendanceRequest`;
          break;
        case 'Othermember':
          endPoint = `${this.attendanceController}/ReAssigneAttendanceRequest`;
          break;
      }

      this.http.put(`${endPoint}/${this.filterId}`,
      this.currentRequest).then((response:ResponseModel) => {
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

  loadAttendanceRequestDetail() {
    this.attendanceRquestPageIsReady = false;
    this.requestFilter.PageSize = 10;
    if (this.requestFilter.SearchString == "1=1")
      this.requestFilter.SearchString = "";

    this.http.post("Attendance/GetMissingAttendanceApprovalRequest", this.requestFilter).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.bindAttendanceRequestDetail(response.ResponseBody);
        Toast("Attendance request loaded successfully.");
        this.isLoading = false;
      }

      this.attendanceRquestPageIsReady = true;
    });
  }

  bindAttendanceRequestDetail(response: any) {
    this.attendanceRequestDetail = response;
    if (this.attendanceRequestDetail.length > 0) {
      this.requestFilter.TotalRecords = this.attendanceRequestDetail[0].Total;
      this.attendanceRequestDetail.map(x => x.AttendanceDate = new Date(x.AttendanceDate));
    } else
      this.requestFilter.TotalRecords = 0;
  }

  ApproveRequest() {
    this.UpdateAttendanceStatus();
  }

  RejectRequest() {
    this.UpdateAttendanceStatus();
  }

  UpdateAttendanceStatus() {
    this.isLoading = true;
    let request = {
      ComplaintOrRequestId: this.currentApprovalRequest.ComplaintOrRequestId,
      TargetId: this.currentApprovalRequest.TargetId,
      TargetOffset: this.currentApprovalRequest.TargetOffset,
      EmployeeMessage: this.currentApprovalRequest.EmployeeMessage,
      NotifyList: this.currentApprovalRequest.NotifyList,
      EmployeeId: this.currentApprovalRequest.EmployeeId
    };

    this.attendanceRquestPageIsReady = false;
    let requestBody = [request];

    this.http.put(this.requestModalData.ApiUrl, requestBody).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast(`Attendance ${this.requestModalData.Status} successfully.`);
        let empid = this.local.getByKey('EmployeeId');
        if (empid > 0) {
          this.requestFilter.EmployeeId = empid;
          this.loadAttendanceRequestDetail();
        } else
          this.bindAttendanceRequestDetail(response.ResponseBody);
        this.isLoading = false;
      }

      this.isLoading = false;
      this.attendanceRquestPageIsReady = true;
      $('#approval-attendance').modal('hide');
    }).catch(e => {
      this.isLoading = false;
      this.attendanceRquestPageIsReady = true;
      $('#approval-attendance').modal('hide');
    });
  }

  showApproveRequestModal(e: any) {
    this.requestModalData = {
      Title: "Approve request",
      IsApprove: true,
      IsReject: false,
      Status: "Approved",
      ApiUrl: "Attendance/ApproveRaisedAttendanceRequest"
    };

    this.currentApprovalRequest = e;
    $('#approval-attendance').modal('show');
  }

  showRejectRequestModal(e: any) {
    this.requestModalData = {
      Title: "Reject request",
      IsApprove: false,
      IsReject: true,
      Status: "Rejected",
      ApiUrl: "Attendance/RejectRaisedAttendanceRequest"
    };

    this.currentApprovalRequest = e;
    $('#approval-attendance').modal('show');
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  viewLeaveAttachmentModal(item: any) {
    if (item) {
     this.isLoading = true;
     this.http.post("Leave/GetLeaveAttachByManger", item).then(res => {
       if (res.ResponseBody) {
         this.leaveAttachment = res.ResponseBody.Table;
         $("#managerleaveFileModal").modal('show');
         this.isLoading = false;
       } else {
        this.isLoading = false;
        WarningToast("No record found");
       }
     }).catch(e => {
       this.isLoading = false;
       WarningToast("No record found");
     })
   }
  }

  viewFile(userFile: any) {
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.${userFile.FileExtension}`;
    this.viewer = document.getElementById("managerleave-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'AttendanceDate') {
      this.orderByAttendanceDateAsc = !flag;
      this.orderByRequestedOnAsc = null;
    }else if (FieldName == 'RequestedOn') {
      this.orderByAttendanceDateAsc = null;
      this.orderByRequestedOnAsc = !flag;
    }
    this.requestFilter.SortBy = FieldName +" "+ Order;
    this.loadAttendanceRequestDetail()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.requestFilter = e;
      this.loadAttendanceRequestDetail();
    }
  }

  onEmloyeeChanged(e: any) {
    this.requestFilter.EmployeeId = this.employeeId;
    this.local.setByKey('EmployeeId', this.employeeId)
    this.loadAttendanceRequestDetail();
  }

  filter(e: any, type: string) {
    let value = Number(e.target.value);
    if (value > 0) {
      if (type == 'requestedon') {
        let startdate = new Date();
        let enddate = new Date();
        enddate.setDate(enddate.getDate()- value);
        this.requestFilter.SearchString = `1=1 and RequestedOn between "${enddate.getFullYear()}-${enddate.getMonth()+1}-${enddate.getDate()} 00:00:00" and "${startdate.getFullYear()}-${startdate.getMonth()+1}-${startdate.getDate()} 23:59:59"`;
      } else if (type == 'status') {
        this.requestFilter.SearchString = `1=1 and RequestTypeId = ${4} and ManagerId = ${this.currentUser.UserId} and CurrentStatus = ${value}`;
      }
      this.loadAttendanceRequestDetail();
    }
  }

  loadAutoComplete() {
    this.employeeList.data = [];
    this.employeeList.placeholder = "Employee";
    this.employeeList.className = "";
  }

  resetFilter() {
    this.employeeId =0;
    this.missAttendanceStatus = 0;
    this.requestedOn = 0;
    this.requestFilter.SearchString = "";
    this.loadAttendanceRequestDetail();
  }

  collpaseShowHide(e: any) {
    if (e) {
      let elem = document.getElementById(e);
      let classContain = elem.classList.contains('hide-collapse');
      if (classContain) {
        elem.classList.remove('hide-collapse');
        elem.classList.add('show-collapse');
      }
      else {
        elem.classList.add('hide-collapse');
        elem.classList.remove('show-collapse');
      }
    }
  }

  reloadPage() {
    if (this.active != 4)
      this.loadData();
    else
      this.loadAttendanceRequestDetail();
  }

  getLeaveRequest() {
    this.isPageLoading = true;
    this.http.post("LeaveRequest/GetLeaveRequestNotification", this.leaveRecord, false).then(response => {
      if(response.ResponseBody) {
        this.leaveRequestDetail = response.ResponseBody;
        this.leaveData.TotalRecords = this.leaveRequestDetail[0].Total;
        this.isPageLoading = false;
        Toast("Leave record found");
      }
    }).catch(e => {
      this.leaveData.TotalRecords = 0;
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GeLeaveFilterResult(e: Filter) {
    if(e != null) {
      this.attendanceRecord.PageIndex = e.ActivePageNumber;
      this.getLeaveRequest();
    }
  }

  resetLeaveRequest() {
    this.leaveRecord.EmployeeId = 0;
    this.leaveRecord.RequestStatusId = 0;
    this.getLeaveRequest();
  }

  getAttendanceRequest() {
    this.isPageLoading = true;
    this.http.post("AttendanceRequest/GetAttendenceRequestData", this.attendanceRecord, false).then(response => {
      if(response.ResponseBody) {
        this.attendanceDetail = response.ResponseBody.FilteredAttendance;
        this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
        this.employeeList.data = response.ResponseBody.AutoCompleteEmployees;
        this.applicationData = response.ResponseBody.AutoCompleteEmployees;
        Toast("Attendance record found");
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.attendanceData.TotalRecords = 0;
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GetAttendanceFilterResult(e: Filter) {
    if(e != null) {
      this.attendanceRecord.PageIndex = e.ActivePageNumber;
      this.getAttendanceRequest();
    }
  }

  resetAttendanceRequest() {
    this.attendanceRecord.PageIndex = 1;
    this.attendanceRecord.EmployeeId = 0;
    this.attendanceRecord.PresentDayStatus = 0;
    this.attendanceRecord.TotalDays = 0;
    this.getAttendanceRequest();
  }
}

interface Attendance {
  ReportingManagerId,
  EmployeeId,
  ForMonth,
  ForYear,
  PresentDayStatus,
  PageIndex,
  TotalDays
}

interface Leave {
  ReportingManagerId,
  EmployeeId,
  FromDate,
  ToDate,
  RequestStatusId
}
