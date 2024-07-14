import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, MonthName, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manage-activity',
  templateUrl: './manage-activity.component.html',
  styleUrls: ['./manage-activity.component.scss']
})
export class ManageActivityComponent implements OnInit {
  companyId: number = 0;
  isLoading: boolean = false;
  active = 3;
  model: NgbDateStruct;
  attendanceStartDate: Date = null;
  attendanceEndDate: Date = null;
  attendanceStatus: number = 0;
  employeeId: number = 0;
  maxDate: any = null;
  hoveredDate: NgbDate | null = null;
	timesheetFromDate: NgbDate | null;
	timesheetToDate: NgbDate | null;
  employeeName: string = null;
  months: Array<{Month: string, Value: number}> = [];
  currentYear: number = new Date().getFullYear();
  selectedMonth: number = 0;
  selectedYear: number = this.currentYear;

  constructor(private http: CoreHttpService,
              private nav: iNavigation,
              private calendar: NgbCalendar,
              public formatter : NgbDateParserFormatter) {
                this.timesheetFromDate = this.calendar.getToday();
                this.timesheetToDate= this.calendar.getNext(this.calendar.getToday(), 'd', 10);
              }

  ngOnInit(): void {
    for (let i = 1; i <= 12; i++) {
      this.months.push({
        Month: MonthName(i),
        Value: i
      });
    }
    let data = this.nav.getValue();
    this.maxDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    if (data) {
      this.employeeId = data.EmployeeUid;
      this.employeeName = data.FirstName + " " + data.LastName;
    }
  }

  activeTab() {
    if (this.active == 1) {

    } else {
      this.attendanceStartDate = null;
      this.attendanceEndDate = null;
      this.attendanceStatus = 0;
    }
  }

  onAttendanceToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
   this.attendanceEndDate = date;
  }
  onAttendanceFromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.attendanceStartDate = date;
  }

  generateAttendance() {
    this.isLoading = true;
    if (this.attendanceStartDate == null || this.attendanceEndDate == null) {
      ErrorToast("Please slect start and end date first");
      this.isLoading = false;
      return;
    }

    let value = {
      AttendenceFromDay: this.attendanceStartDate,
      AttendenceToDay: this.attendanceEndDate,
      AttendenceStatus: this.attendanceStatus,
      EmployeeId: this.employeeId
    }
    this.http.post("Attendance/GenerateAttendance", value).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        Toast(res.ResponseBody);
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  onDateSelection(date: NgbDate) {
		if (!this.timesheetFromDate && !this.timesheetToDate) {
			this.timesheetFromDate = date;
		} else if (this.timesheetFromDate && !this.timesheetToDate && date && date.after(this.timesheetFromDate)) {
			this.timesheetToDate = date;
		} else {
			this.timesheetToDate = null;
			this.timesheetFromDate = date;
		}
	}

	isHovered(date: NgbDate) {
		return (
			this.timesheetFromDate && !this.timesheetToDate && this.hoveredDate && date.after(this.timesheetFromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.timesheetToDate && date.after(this.timesheetFromDate) && date.before(this.timesheetToDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.timesheetFromDate) ||
			(this.timesheetToDate && date.equals(this.timesheetToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

  generateTimesheet() {
    if (this.timesheetFromDate) {
      this.isLoading = true;
      let value = {
        TimesheetStartDate: new Date(this.timesheetFromDate.year, this.timesheetFromDate.month - 1, this.timesheetFromDate.day),
        TimesheetEndDate: new Date(this.timesheetToDate.year, this.timesheetToDate.month - 1, this.timesheetToDate.day)
      };
      this.http.post("AutoTrigger/triggerWeeklyTimesheet", value).then((res: ResponseModel) => {
        if (res.ResponseBody) {
          Toast("Timesheet generated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  runLeaveAccrual() {
    this.isLoading = true;
    if (this.attendanceStartDate == null || this.attendanceEndDate == null) {
      ErrorToast("Please slect start and end date first");
      this.isLoading = false;
      return;
    }

    let value = {
      RunTillMonthOfPresnetYear: this.attendanceStartDate,
      EmployeeId: this.attendanceEndDate,
      IsSingleRun: this.attendanceStatus,
    }
    console.log(value)
    this.http.post("Attendance/GenerateAttendance", value).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  generateLeave() {
    if (this.selectedMonth > 0 && this.selectedYear > 0) {
      this.isLoading = true;
      this.http.get(`AutoTrigger/RunEmployeeLeaveAccrual/${this.selectedMonth}/${this.selectedYear}`).then((res: ResponseModel) => {
        if (res.ResponseBody) {
          this.selectedMonth = 0;
          this.selectedYear = this.currentYear;
          Toast("Leave generated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Please select month and year");
    }
  }

}
