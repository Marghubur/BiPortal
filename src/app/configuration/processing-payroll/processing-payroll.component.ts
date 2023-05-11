import { Component, OnInit } from '@angular/core';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-processing-payroll',
  templateUrl: './processing-payroll.component.html',
  styleUrls: ['./processing-payroll.component.scss']
})
export class ProcessingPayrollComponent implements OnInit {
  isCollapsed: boolean = false;
  isLoading: boolean = false;
  selectedPayrollDate: Date = new Date();
  appliedLeaveDetail: Array<any> = [];
  attendanceDetail: Array<any> = [];
  lossPayDetail: Array<any> = [];
  reverseLossPayDetail: Array<any> = [];
  newJoineeDetail: Array<any> = [];
  exitEmpDetail: Array<any> = [];
  settlementDetail: Array<any> = [];
  bonusDetail: Array<any> = [];
  salaryRevisionDetail: Array<any> = [];
  overTimePaymentDetail: Array<any> = [];
  shiftAllowanceDetail: Array<any> = [];
  salaryComponentsDetail: Array<any> = [];
  adhocPaymentDetail: Array<any> = [];
  expensesDetail: Array<any> = [];
  adhocDeductionDetail: Array<any> = [];
  isPageReady: boolean = false;
  leaveData: Filter = new Filter();
  attendanceData: Filter = new Filter();
  lossPayData: Filter = new Filter();
  reverseLossPayData: Filter = new Filter();
  newJoineeData: Filter = new Filter();
  exitEmpData: Filter = new Filter();
  settlementData: Filter = new Filter();
  bonusData: Filter = new Filter();
  salaryRevisionData: Filter = new Filter();
  overTimePaymentData: Filter = new Filter();
  shiftAllowanceData: Filter = new Filter();
  salaryComponentsData: Filter = new Filter();
  adhocPaymentData: Filter = new Filter();
  expensesData: Filter = new Filter();
  adhocDeductionData: Filter = new Filter();
  activeIndex: number = 1;

  constructor() {}

  ngOnInit(): void {
    this.loadData();
    this.bonusSalryOvertimePopUp();
  }

  loadData() {
    this.isPageReady = true;
  }

  leaveAttendanceWagesPopUp() {
    this.activeIndex = 1;
    $('#leaveAttendanceWages').modal('show');
  }

  GetFilterLeaveResult(e: Filter) {
    if(e != null) {
      this.leaveData = e;
      this.loadData();
    }
  }

  GetFilterAttendanceResult(e: Filter) {
    if(e != null) {
      this.attendanceData = e;
      this.loadData();
    }
  }

  GetFilterLosspayResult(e: Filter) {
    if(e != null) {
      this.lossPayData = e;
      this.loadData();
    }
  }

  GetFilterReversepayResult(e: Filter) {
    if(e != null) {
      this.reverseLossPayData = e;
      this.loadData();
    }
  }

  chnageActiveIndex(index: number) {
    this.activeIndex = index;
  }

  backLeaveAttendaceWage() {
    if (this.activeIndex > 1)
      this.activeIndex = this.activeIndex - 1;
  }

  saveLeaveAttendaceWage() {
    if (this.activeIndex > 0 && this.activeIndex < 4) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#leaveAttendanceWages').modal('hide');
    }
  }

  markLeaveAttendaceWageComplete() {
    this.activeIndex = 1;
    $('#leaveAttendanceWages').modal('hide');
  }

  // ------------------------------Employee Changes
  employeeChangesPopUp() {
    this.activeIndex = 1;
    $('#employeeChanges').modal('show');
  }

  GetFilterNewJoineeResult(e: Filter) {
    if(e != null) {
      this.newJoineeData = e;
      this.loadData();
    }
  }

  GetFilterExitEmpResult(e: Filter) {
    if(e != null) {
      this.exitEmpData = e;
      this.loadData();
    }
  }

  GetFilterSettlementResult(e: Filter) {
    if(e != null) {
      this.settlementData = e;
      this.loadData();
    }
  }

  saveEmpChange() {
    if (this.activeIndex > 0 && this.activeIndex < 3) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#employeeChanges').modal('hide');
    }
  }

  markEmpChangeComplete() {
    this.activeIndex = 1;
    $('#employeeChanges').modal('hide');
  }

  // ------------------------------Bonus, Salary Revision and Overtime
  bonusSalryOvertimePopUp() {
    this.activeIndex = 1;
    $('#bonusSalaryOvertime').modal('show');
  }

  GetFilterBonusResult(e: Filter) {
    if(e != null) {
      this.bonusData = e;
      this.loadData();
    }
  }

  GetFilterSalaryRevisionResult(e: Filter) {
    if(e != null) {
      this.salaryRevisionData = e;
      this.loadData();
    }
  }

  GetFilterOvertimeResult(e: Filter) {
    if(e != null) {
      this.overTimePaymentData = e;
      this.loadData();
    }
  }

  GetFilterShiftResult(e: Filter) {
    if(e != null) {
      this.shiftAllowanceData = e;
      this.loadData();
    }
  }

  saveBonusAlaryOvertime() {
    if (this.activeIndex > 0 && this.activeIndex < 4) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#bonusSalaryOvertime').modal('hide');
    }
  }

  markBonusAlaryOvertimeComplete() {
    this.activeIndex = 1;
    $('#bonusSalaryOvertime').modal('hide');
  }

  // ------------------------------Reimbursement, Adhoc Payment and Deduction
  reimbursementAdhocDeductPopUp() {
    this.activeIndex = 1;
    $('#reimbursementAdhicDeduction').modal('show');
  }

  GetFilterSalaryCompResult(e: Filter) {
    if(e != null) {
      this.salaryComponentsData = e;
      this.loadData();
    }
  }

  // GetFilterSalaryRevisionResult(e: Filter) {
  //   if(e != null) {
  //     this.salaryRevisionData = e;
  //     this.loadData();
  //   }
  // }

  // GetFilterOvertimeResult(e: Filter) {
  //   if(e != null) {
  //     this.overTimePaymentData = e;
  //     this.loadData();
  //   }
  // }

  // GetFilterShiftResult(e: Filter) {
  //   if(e != null) {
  //     this.shiftAllowanceData = e;
  //     this.loadData();
  //   }
  // }

  saveReimbursementAdhicDeduction() {
    if (this.activeIndex > 0 && this.activeIndex < 4) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#reimbursementAdhicDeduction').modal('hide');
    }
  }

  markReimbursementAdhicDeductionComplete() {
    this.activeIndex = 1;
    $('#reimbursementAdhicDeduction').modal('hide');
  }

}
