import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-leave-attendance-dailywages',
  templateUrl: './leave-attendance-dailywages.component.html',
  styleUrls: ['./leave-attendance-dailywages.component.scss']
})
export class LeaveAttendanceDailywagesComponent implements OnInit, AfterViewChecked {
  selectedPayrollCalendar: any = null;
  isLoading: boolean = false;
  appliedLeaveDetail: Array<any> = [];
  lossPayDetail: Array<any> = [];
  active = 1;
  reverseLossPayDetail: Array<any> = [];
  selectedLOP: any = null;
  daysInMonth: Array<number> = [];
  scrollDiv: any = null;
  excelTable: any = null;
  attendanceDetail: Array<any> = [];
  attendanceData: Filter = new Filter();
  attendance: Attendance;
  selectedAttendance: any = null;
  leaveQuota: Array<any> = [];
  selectedLeaveType: any = null;
  selectedLeave: any = null;
  availLopAdjusmentDay: Array<number> = [];
  currentUser: any = null;

  constructor(private nav:iNavigation,
              private http: AjaxService,
              private userService: UserService) {}

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
    let data = this.nav.getValue();
    this.currentUser = this.userService.getInstance();
    if (data) {
      this.selectedPayrollCalendar = data;
      let days = new Date(this.selectedPayrollCalendar.Year, this.selectedPayrollCalendar.Month, 0).getDate();
      for (let i = 1; i <= days; i++) {
        this.daysInMonth.push(i);
      }

      this.attendance = {
        EmployeeName: "",
        ForMonth: this.selectedPayrollCalendar.Month,
        ForYear: this.selectedPayrollCalendar.Year
      }

      this.attendanceData.SearchString = ` 1=1 and ForYear = ${this.attendance.ForYear} and ForMonth = ${this.attendance.ForMonth} `;
      this.loadData();
    } else {
      ErrorToast("Please select payroll month first");
    }
  }

  loadData() {
    this.isLoading = true;
    this.http.get(`ef/runpayroll/getLeaveAndLOP/${this.selectedPayrollCalendar.Year}/${this.selectedPayrollCalendar.Month}`, true).then(res => {
      if (res.ResponseBody) {
        if (res.ResponseBody[0].length > 0)
          this.appliedLeaveDetail = res.ResponseBody[0];
        else if (res.ResponseBody[0].length == 1)  {
          let data = res.ResponseBody[0];
          if (data && data.employeeId) {
            this.appliedLeaveDetail = data;
          }
        }
        // if (res.ResponseBody[1].length > 1) {
        //   this.lossPayDetail = res.ResponseBody[1];
        // } else if (res.ResponseBody[1].length == 1)  {
        //   let data = res.ResponseBody[1];
        //   if (data && data.employeeId) {
        //     this.lossPayDetail = data;
        //   }
        // }
        Toast("Record found");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  submitActionForLeave(requestState: string) {
    this.isLoading = true;
    let endPoint = '';

    switch(requestState) {
      case 'Approved':
        endPoint = `LeaveRequest/ApproveLeaveRequest`;
        break;
      case 'Rejected':
        endPoint = `LeaveRequest/RejectLeaveRequest`;
        break;
    }

    let currentResponse = {
      LeaveFromDay: this.selectedLeave.FromDate,
      LeaveToDay: this.selectedLeave.ToDate,
      EmployeeId: this.selectedLeave.EmployeeId,
      LeaveRequestNotificationId : this.selectedLeave.LeaveRequestNotificationId,
      RecordId: this.selectedLeave.RecordId,
      LeaveTypeId: this.selectedLeave.LeaveTypeId,
      Reason: this.selectedLeave.Reason
    }
    let filterId = 0;
    this.http.post(`${endPoint}/${filterId}`, currentResponse, false).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        $('#leaveActionModal').modal('hide');
        Toast("Submitted Successfully");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  lopAdjustmentPopUp(item: any) {
    this.selectedLOP = item;
    this.http.get(`Leave/GetLeaveDetailByEmpId/${item.EmployeeId}`).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.leaveQuota = JSON.parse(res.ResponseBody.LeaveQuotaDetail);
        $('#lopAdjustment').modal('show');
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getAttendanceDetail() {
    this.isLoading = true;
    this.http.post("ef/runpayroll/getAttendancePage", this.attendanceData, true).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.attendanceDetail = [];
        this.attendanceDetail = res.ResponseBody;
        if (this.attendanceDetail.length > 0) {
          this.attendanceDetail.forEach(x => {
            x.AttendanceDetail = JSON.parse(x.AttendanceDetail);
            if (this.appliedLeaveDetail && this.appliedLeaveDetail.length > 0) {
              x.AttendanceDetail.forEach(i => {
                var item = this.appliedLeaveDetail.find(z => (new Date(z.FromDate).getTime() - new Date(i.AttendanceDay).getTime())/(1000 * 60 * 60 * 24) <=0 &&
                  ((new Date(z.ToDate).getTime() - new Date(i.AttendanceDay).getTime()))/(1000 * 60 * 60 * 24)  >= 0 && z.EmployeeId == x.EmployeeId);
                if (item)
                  i.IsOnLeave = true;
              });
            }
          });

          this.attendanceData.TotalRecords = this.attendanceDetail[0].Total;
        } else {
          this.attendanceData.TotalRecords = 0;
        }

        console.log(this.attendanceDetail);
        this.isLoading = false;
        Toast("Attendance detail loaded");
      }
    })
    // if (!this.attendanceDetail || this.attendanceDetail.length == 0) {
    // } else {
    //   this.isLoading = false;
    //   Toast("Attendance detail loaded");
    // }
  }

  GetFilterLosspayResult(e: Filter) {
    if(e != null) {
      this.attendanceData = e;
      this.getAttendanceDetail();
    }
  }

  filterRecords() {
    let delimiter = "";
    let searchString = "";
    this.attendanceData.SearchString = ""
    this.attendanceData.reset();

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
      this.attendanceData.SearchString = ` 1=1 and ${searchString}`;
    } else {
      this.attendanceData.SearchString = "1=1";
    }

    this.getAttendanceDetail();
  }

  resetFilter() {
    this.attendanceData.reset();
    this.attendanceData.SearchString = ` 1=1 and ForYear = ${this.attendance.ForYear} and ForMonth = ${this.attendance.ForMonth} `;
    this.attendance = {
      EmployeeName: "",
      ForMonth: this.selectedPayrollCalendar.Month,
      ForYear: this.selectedPayrollCalendar.Year
    }
    this.getAttendanceDetail()
  }

  showAttendanceHandler(item: any, id: number, name: string) {
    if (id <= 0) {
      ErrorToast("Invalid employee selected");
      return;
    }
    if (item) {
      this.selectedAttendance = null;
      this.selectedAttendance = item;
      this.selectedAttendance.EmployeeName = name;
      this.selectedAttendance.AttendanceId = id;
      $('#attendanceAdjustment').modal('show');
    }
  }

  saveAttedanceAjustment() {
    this.isLoading = true;
    if (!this.selectedAttendance) {
      this.isLoading = false;
      ErrorToast("Please select attendance first");
      return;
    }

    if (this.selectedAttendance.AttendanceId <= 0 || this.selectedAttendance.AttendanceDay == null) {
      this.isLoading = false;
      return;
    }

    this.http.post('Attendance/AdjustAttendance', this.selectedAttendance).then ((res:ResponseModel) => {
      if (res.ResponseBody) {
        let attendance = this.attendanceDetail.find(x => x.AttendanceId == this.selectedAttendance.AttendanceId);
        if (attendance) {
          attendance.AttendanceDetail = [];
          attendance.AttendanceDetail = res.ResponseBody;
        }
        $('#attendanceAdjustment').modal('hide');
        Toast("Attendace apply successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    });
  }

  saveLOPAjustment() {
    this.isLoading = true;
    if (this.selectedLOP.EmployeeId <= 0) {
      WarningToast("Employee is not selected properly.");
      this.isLoading = false;
      return;
    }

    if (this.selectedLeaveType!= null && this.selectedLeaveType.LeavePlanTypeId <=0) {
      WarningToast("Please select Leave Type first.");
      this.isLoading = false;
      return;
    }

    if (this.selectedLeaveType!= null && this.selectedLeaveType.AvailableLeaves <=0) {
      WarningToast("You don't have leave balance of selected leave");
      this.isLoading = false;
      return;
    }

    this.selectedLOP.LeaveTypeId= this.selectedLeaveType.LeavePlanTypeId;
    this.selectedLOP.LeavePlanName= this.selectedLeaveType.LeavePlanTypeName
    this.http.post('Leave/AdjustLOPAsLeave', this.selectedLOP).then ((res:ResponseModel) => {
      if (res.ResponseBody) {
        $('#lopAdjustment').modal('hide');
        Toast("Leave apply successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    });
  }

  validateLeaveStatus(e: any) {
    let value = e.target.value;
    if (Number(value) > 0) {
      this.selectedLeaveType = this.leaveQuota.find(x => x.LeavePlanTypeId == value);
      this.availLopAdjusmentDay = [];
      if (this.selectedLeaveType && this.selectedLeaveType.AvailableLeaves > 0) {
        let day = 0;
        if (this.selectedLOP.ActualLOP < this.selectedLeaveType.AvailableLeaves)
          day = this.selectedLOP.ActualLOP;
        else
          day = this.selectedLeaveType.AvailableLeaves;
        for (let i = 1; i <= day; i++) {
          this.availLopAdjusmentDay.push(i);
        }
      }
    }
  }

  leaveActionPopUp(item: any) {
    if (item) {
      this.selectedLeave = item;
      this.selectedLeave.Reason = "";
      $('#leaveActionModal').modal('show');
    }
  }

  getLopAdjustment() {
    this.isLoading = true;
    this.http.get(`Attendance/GetLOPAdjustment/${this.selectedPayrollCalendar.Month}/${this.selectedPayrollCalendar.Year}`)
    .then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.lossPayDetail = res.ResponseBody;
        console.log(res.ResponseBody);
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }
}


interface Attendance {
  EmployeeName: string,
  ForYear: number,
  ForMonth: number
}
