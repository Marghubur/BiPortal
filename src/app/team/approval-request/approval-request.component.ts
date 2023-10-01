import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { UserType } from 'src/providers/constants';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit, AfterViewChecked {
  active = 1;
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: any = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;
  isPageLoading: boolean = false;
  attendanceDetail: Array<any> = [];
  requestModal: number = 0;
  attendanceController: string = "AttendanceRequest";
  leaveController: string = "LeaveRequest";
  timesheetController: string = "TimesheetRequest";
  requestUrl: string = null;
  timesheetDetail: Array<any> = [];
  currentTimesheet: any = null;
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
  leaveRequestDetail: Array<any> = [];
  attendanceData: Filter = new Filter();
  attendanceRecord: Attendance;
  leaveData: Filter = new Filter();
  leaveRecord: Leave;
  timesheetRecord: Timesheet;
  timesheetData: Filter = new Filter();
  monthDays: Array<number> = [];
  scrollDiv: any = null;
  excelTable: any = null;
  attendance: Attendance;
  attendanceReviewData: Filter = new Filter();

  constructor(
    private http: AjaxService,
    private local : ApplicationStorage,
    private userService: UserService
    ) { }

    ngAfterViewChecked(): void {
      if(this.scrollDiv == null) {
        this.scrollDiv = document.getElementById("scroll-dv");

        if(this.scrollDiv != null) {
          this.initHandler();
        }
      }
    }

    initHandler() {
      this.scrollDiv.addEventListener('scroll', function(e) {
        var elem = document.getElementById("excel-table");
        var innerElem = document.getElementById("inner-scroller");
        var left = ((elem.clientWidth) / (innerElem.clientWidth)) * e.currentTarget.scrollLeft;
        if (e.currentTarget.scrollLeft > 0)
          elem.scrollLeft = left;
        else {
          elem.scrollLeft = left;
        }
        // console.log('Excel: ' + left + ', Inner: ' + e.currentTarget.scrollLeft);
      });
    }

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
    let date = new Date();
    this.attendance = {
      EmployeeName: "",
      ForMonth: date.getMonth() + 1,
      ForYear: date.getFullYear()
    }
    this.itemStatus = 2;
    this.attendanceRecord = {
      EmployeeId: 0,
      ForMonth :date.getMonth() + 1,
      ForYear:date.getFullYear(),
      PageIndex: 1,
      ReportingManagerId : this.currentUser.UserId,
      PresentDayStatus: 2,
      TotalDays: 0
    };
    this.leaveRecord = {
      EmployeeId: 0,
      FromDate: date,
      ToDate: date,
      ReportingManagerId : this.currentUser.UserId,
      RequestStatusId: 2,
      PageIndex: 1
    }
    this.timesheetRecord = {
      EmployeeId: 0,
      ReportingManagerId : this.currentUser.UserId,
      ForYear: date.getFullYear(),
      TimesheetStatus: 8,
      PageIndex: 1
    }
    let days = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
    for (let i = 1; i <= days; i++) {
      this.monthDays.push(i);
    }
    this.attendanceReviewData.SearchString = ` 1=1 and ForYear = ${this.attendance.ForYear} and ForMonth = ${this.attendance.ForMonth} `;
    this.getAttendanceRequest();
  }

  updatePage(index: number) {
    if(index == 1) {
      this.requestUrl = `${this.attendanceController}/GetManagerRequestedData`;
      this.filterText = "Assigned to me";
    } else {
      this.requestUrl = `${this.attendanceController}/GetAllRequestedData`;
      this.filterText = "All request(s)";
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
    this.currentTimesheet = request;
    $('#timesheetModal').modal('show');
  }

  openAttendacneModal(state: string, request: any) {
    this.requestState = state;
    this.requestModal = 3; // attendance
    this.currentRequest = request;
    this.currentRequest.RequestStatusId = request.PresentDayStatus;
    this.currentRequest["EmployeeName"] = request.EmployeeName;
    this.currentRequest["Email"] = request.Email;
    this.currentRequest["Mobile"] = request.Mobile;
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
      LeaveTypeId: this.currentRequest.LeaveTypeId,
      RequestStatusId: this.leaveRecord.RequestStatusId
    }

    this.http.put(`${endPoint}/${this.filterId}`, currentResponse).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.leaveRequestDetail = response.ResponseBody;
        if (this.leaveRequestDetail.length > 0)
          this.leaveData.TotalRecords = this.leaveRequestDetail[0].Total;
        else
          this.leaveData.TotalRecords = 0;

        if (this.requestState == "Approved")
          Toast("Leave approved successfully");
        else
          Toast("Attendance rejected successfully");

        $('#leaveModal').modal('hide');
        this.isLoading = false;
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

    this.http.put(`${endPoint}/${this.currentTimesheet.TimesheetId}/${this.filterId}`, this.timesheetRecord).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.timesheetDetail = response.ResponseBody;
        if (this.timesheetDetail && this.timesheetDetail.length > 0) {
          this.timesheetData.TotalRecords = this.timesheetDetail[0].Total;
        } else {
          this.timesheetData.TotalRecords = 0;
        }
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
    if (this.currentRequest) {
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
      this.currentRequest.PageIndex = this.attendanceRecord.PageIndex;
      this.currentRequest.EmployeeId = this.attendanceRecord.EmployeeId;
      this.currentRequest.PresentDayStatus = this.attendanceRecord.PresentDayStatus;
      this.currentRequest.TotalDays = this.attendanceRecord.TotalDays;

      this.http.put(`${endPoint}/${this.filterId}`, this.currentRequest).then((response:ResponseModel) => {
        if(response.ResponseBody) {
          this.attendanceDetail = response.ResponseBody.FilteredAttendance;
          if (this.attendanceDetail.length > 0)
            this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
          else
            this.attendanceData.TotalRecords = 0;
          this.employeeList.data = response.ResponseBody.AutoCompleteEmployees;
          this.applicationData = response.ResponseBody.AutoCompleteEmployees;
          if (this.requestState == "Approved")
            Toast("Attendance approved successfully");
          else
            Toast("Attendance rejected successfully");

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

  getLeaveRequest() {
    this.isPageLoading = true;
    this.http.post("LeaveRequest/GetLeaveRequestNotification", this.leaveRecord, false).then(response => {
      if(response.ResponseBody) {
        this.leaveRequestDetail = response.ResponseBody;
        if (this.leaveRequestDetail && this.leaveRequestDetail.length > 0)
          this.leaveData.TotalRecords = this.leaveRequestDetail[0].Total;
        else
          this.leaveData.TotalRecords = 0;
        this.isPageLoading = false;
        Toast("Leave record found");
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
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
    this.leaveRecord.RequestStatusId = 2;
    this.leaveRecord.PageIndex = 1
    this.leaveData = new Filter();
    this.getLeaveRequest();
  }

  getAttendanceRequest() {
    this.isPageLoading = true;
    this.attendanceDetail = []
    this.attendanceData = new Filter();
    this.http.post("AttendanceRequest/GetAttendenceRequestData", this.attendanceRecord, false).then(response => {
      if(response.ResponseBody) {
        this.attendanceDetail = response.ResponseBody.FilteredAttendance;
        if (this.attendanceDetail && this.attendanceDetail.length > 0) {
          this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
        } else {
          this.attendanceData.TotalRecords = 0;
        }
        this.employeeList.data = response.ResponseBody.AutoCompleteEmployees;
        this.applicationData = response.ResponseBody.AutoCompleteEmployees;
        Toast("Attendance record found");
        this.isPageLoading = false;
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
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
    this.attendanceRecord.PresentDayStatus = 2;
    this.attendanceRecord.TotalDays = 0;
    this.attendanceData = new Filter();
    this.getAttendanceRequest();
  }

  getTimesheetRequest() {
    this.isPageLoading = true;
    this.http.post("TimesheetRequest/GetTimesheetRequestData", this.timesheetRecord, false).then(response => {
      if(response.ResponseBody) {
        this.timesheetDetail = response.ResponseBody;
        if (this.timesheetDetail && this.timesheetDetail.length > 0) {
          this.timesheetData.TotalRecords = this.timesheetDetail[0].Total;
        } else {
          this.timesheetData.TotalRecords = 0;
        }
        Toast("Timesheet record found");
        this.isPageLoading = false;
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  GetTimesheetFilterResult(e: Filter) {
    if(e != null) {
      this.timesheetRecord.PageIndex = e.ActivePageNumber;
      this.getTimesheetRequest();
    }
  }

  resetTimesheetRequest() {
    this.timesheetRecord.TimesheetStatus = 2;
    this.timesheetRecord.EmployeeId = 0;
    this.timesheetRecord.PageIndex = 1;
    this.timesheetData = new Filter();
    this.getTimesheetRequest();
  }

  resetRequest() {
    switch (this.active) {
      case 1:
        this.resetAttendanceRequest();
        break;
      case 2:
        this.resetTimesheetRequest();
        break;
      case 3:
        this.resetLeaveRequest();
        break;
      case 4:
        this.resetFilter();
        break;
      case 5:
        this.resetAttedanceReviewFilter();
        break;
    }
  }

  resetFilter() {
    this.employeeId =0;
    this.missAttendanceStatus = 0;
    this.requestedOn = 0;
    this.requestFilter.SearchString = "";
    this.loadAttendanceRequestDetail();
  }

  getReviewAttendanceDetail() {
    this.isPageLoading = true;
    this.http.post("ef/runpayroll/getAttendancePage", this.attendanceReviewData, true).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.attendanceDetail = [];
        this.attendanceDetail = res.ResponseBody;
        if (this.attendanceDetail.length > 0) {

          this.attendanceDetail.forEach(x => {
            x.AttendanceDetail = JSON.parse(x.AttendanceDetail);
          });

          this.attendanceReviewData.TotalRecords = this.attendanceDetail[0].Total;
        } else {
          this.attendanceReviewData.TotalRecords = 0;
        }

        console.log(this.attendanceDetail);
        this.isPageLoading = false;
        Toast("Attendance detail loaded");
      }
    }).catch(e => {
      this.isPageLoading = false;
    })
  }

  filterAttedanceReviewRecords() {
    let delimiter = "";
    let searchString = "";
    this.attendanceReviewData.SearchString = ""
    this.attendanceReviewData.reset();
    this.monthDays = [];
    let days = new Date(this.attendance.ForYear,this.attendance.ForMonth, 0).getDate();
    for (let i = 1; i <= days; i++) {
      this.monthDays.push(i);
    }
    if(this.attendance.EmployeeName !== null && this.attendance.EmployeeName !== "") {
      searchString += ` EmployeeName like '%${this.attendance.EmployeeName.toUpperCase()}%'`;
      delimiter = "and";
    }

    if(this.attendance.ForMonth !== null && this.attendance.ForMonth > 0) {
      searchString += ` ${delimiter} ForMonth = ${this.attendance.ForMonth}`;
      delimiter = "and";
    }

    if(this.attendance.ForYear !== null && this.attendance.ForYear> 0) {
      searchString += ` ${delimiter} ForYear = ${this.attendance.ForYear}`;
      delimiter = "and";
    }

    if(searchString != "") {
      this.attendanceReviewData.SearchString = ` 1=1 and ${searchString}`;
    } else {
      this.attendanceReviewData.SearchString = "1=1";
    }

    this.getReviewAttendanceDetail();
  }

  resetAttedanceReviewFilter() {
    this.attendanceReviewData.reset();
    this.attendanceReviewData.SearchString = ` 1=1 and ForYear = ${this.attendance.ForYear} and ForMonth = ${this.attendance.ForMonth} `;
    let date = new Date();
    this.attendance = {
      EmployeeName: "",
      ForMonth: date.getMonth() + 1,
      ForYear: date.getFullYear()
    }
    this.getReviewAttendanceDetail()
  }
}

interface Attendance {
  ReportingManagerId?,
  EmployeeId?,
  ForMonth,
  ForYear,
  PresentDayStatus?,
  PageIndex?,
  TotalDays?,
  EmployeeName?: string
}

interface Leave {
  ReportingManagerId,
  EmployeeId,
  FromDate,
  ToDate,
  RequestStatusId,
  PageIndex
}

interface Timesheet {
  ReportingManagerId,
  EmployeeId,
  ForYear,
  TimesheetStatus,
  PageIndex
}
