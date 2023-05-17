import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
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
  salaryProcessingDetail: Array<any> = [];
  salaryPayoutDetail: Array<any> = [];
  arraersDetail: Array<any> = [];
  ptOverrideDetail: Array<any> = [];
  esiOverrideDetail: Array<any> = [];
  tdsOverrideDetail: Array<any> = [];
  lwfOverrideDetail: Array<any> = [];
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
  salaryProcessingData: Filter = new Filter();
  salaryPayoutData: Filter = new Filter();
  arraersData: Filter = new Filter();
  ptOverrideData: Filter = new Filter();
  esiOverrideData: Filter = new Filter();
  tdsOverrideData: Filter = new Filter();
  lwfOverrideData: Filter = new Filter();
  activeIndex: number = 1;
  // --------------------
  userDetail: any = null;
  runpayroll: string = "RunPayRoll";
  userName: string = null;
  allRrunPayroll: RunPayroll = null

  constructor(private http: AjaxService,
              private user: UserService,
              private fb: FormBuilder,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.userDetail = this.user.getInstance();
    this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
    let runPayroll = new RunPayroll();
    runPayroll.AppliedLeave = new AppliedLeave();
    runPayroll.NoAttendance = new NoAttendance();
    runPayroll.LOPSummary = new LOPSummary();
    runPayroll.NewJoinee = new NewJoinee();
    localStorage.setItem(this.runpayroll, JSON.stringify(runPayroll));
    this.allRrunPayroll = JSON.parse(localStorage.getItem(this.runpayroll));
    this.appliedLeaveDetail.push(this.allRrunPayroll.AppliedLeave);
    this.attendanceDetail.push(this.allRrunPayroll.NoAttendance);
    this.lossPayDetail.push(this.allRrunPayroll.LOPSummary);
    this.newJoineeDetail.push(this.allRrunPayroll.NewJoinee);
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
      this.setLocalStoreValue();
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      this.setLocalStoreValue();
      $('#leaveAttendanceWages').modal('hide');
    }
  }

  markLeaveAttendaceWageComplete() {
    this.activeIndex = 1;
    this.allRrunPayroll.LeaveAttendanceCompleted = true;
    this.allRrunPayroll.completedValue = this.allRrunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
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
      this.setLocalStoreValue();
    } else {
      this.activeIndex = 1;
      this.setLocalStoreValue();
      $('#employeeChanges').modal('hide');
    }
  }

  markEmpChangeComplete() {
    this.activeIndex = 1;
    this.allRrunPayroll.EmployeeChangeseCompleted = true;
    this.allRrunPayroll.completedValue = this.allRrunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
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
    this.allRrunPayroll.BonusSalaryOvertimeCompleted = true;
    this.allRrunPayroll.completedValue = this.allRrunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
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

  GetFilterExpenseResult(e: Filter) {
    if(e != null) {
      this.expensesData = e;
      this.loadData();
    }
  }

  GetFilterAdhocPaymentResult(e: Filter) {
    if(e != null) {
      this.adhocPaymentData = e;
      this.loadData();
    }
  }

  GetFilterAdhocDeductionResult(e: Filter) {
    if(e != null) {
      this.adhocDeductionData = e;
      this.loadData();
    }
  }

  saveReimbursementAdhocDeduction() {
    if (this.activeIndex > 0 && this.activeIndex < 4) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#reimbursementAdhicDeduction').modal('hide');
    }
  }

  markReimburseAdhocDeductionComplete() {
    this.activeIndex = 1;
    this.allRrunPayroll.ReimbursementAdhicDeductCompleted = true;
    this.allRrunPayroll.completedValue = this.allRrunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#reimbursementAdhicDeduction').modal('hide');
  }

  // ------------------------------Salaries and Arreaars
  salariesArrearsPopUp() {
    this.activeIndex = 1;
    $('#salariesArrears').modal('show');
  }

  GetFilterSalaryProcessingResult(e: Filter) {
    if(e != null) {
      this.salaryProcessingData = e;
      this.loadData();
    }
  }

  GetFilterSalaryPayoutResult(e: Filter) {
    if(e != null) {
      this.salaryPayoutData = e;
      this.loadData();
    }
  }

  GetFilterArraersResult(e: Filter) {
    if(e != null) {
      this.arraersData = e;
      this.loadData();
    }
  }

  saveSalariesArrears() {
    if (this.activeIndex > 0 && this.activeIndex < 3) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#salariesArrears').modal('hide');
    }
  }

  markSalariesArrearsComplete() {
    this.activeIndex = 1;
    this.allRrunPayroll.SalaryHoldArrearsCompleted = true;
    this.allRrunPayroll.completedValue = this.allRrunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#salariesArrears').modal('hide');
  }

  // ------------------------------Override (PT, TDS, ESI, LWF)
  overridePopUp() {
    this.activeIndex = 1;
    $('#override').modal('show');
  }

  GetFilterPTOverideResult(e: Filter) {
    if(e != null) {
      this.ptOverrideData = e;
      this.loadData();
    }
  }

  GetFilterESIOverideResult(e: Filter) {
    if(e != null) {
      this.esiOverrideData = e;
      this.loadData();
    }
  }

  GetFilterTDSOverideResult(e: Filter) {
    if(e != null) {
      this.tdsOverrideData = e;
      this.loadData();
    }
  }

  GetFilterLWFOverideResult(e: Filter) {
    if(e != null) {
      this.lwfOverrideData = e;
      this.loadData();
    }
  }

  saveOverride() {
    if (this.activeIndex > 0 && this.activeIndex < 4) {
      this.activeIndex = this.activeIndex + 1;
    } else {
      this.activeIndex = 1;
      $('#override').modal('hide');
    }
  }

  markOverrideComplete() {
    this.activeIndex = 1;
    this.allRrunPayroll.OverrideCompleted = true;
    this.allRrunPayroll.completedValue = 100;
    this.setLocalStoreValue();
    $('#override').modal('hide');
  }

  // ----------------------End

  finalizePayroll() {

  }

  finalizePayrollPopUp() {
    $('#confirmPayrollFinalize').modal('show');
  }

  approveLeave(item: AppliedLeave) {
    this.allRrunPayroll.AppliedLeave.Status = 9;
    this.allRrunPayroll.AppliedLeave.Approver = this.userName;
  }

  rejectLeave(item: AppliedLeave) {
    this.allRrunPayroll.AppliedLeave.Status = 5;
    this.allRrunPayroll.AppliedLeave.Approver = this.userName;
  }

  setLocalStoreValue() {
    localStorage.setItem(this.runpayroll, JSON.stringify(this.allRrunPayroll));
  }

}


class AppliedLeave{
  AppliedLeaveId: number = 1;
  EmployeeName: string = "Marghub";
  Date: Date = new Date(2023, 6, 4);
  TotalDays: number = 1;
  LeaveType: string = 'Unpaid Leave';
  Status: number = 2;
  Approver: string =  ""
}

class NoAttendance{
  NoAttendanceId: number = 1;
  EmployeeName: string = "Marghub";
  Date: Date = new Date(2023, 3, 4);
  TotalDays: number = 1;
  LeaveType: string = 'Unpaid Leave';
}

class LOPSummary{
  LOPSummaryId: number = 1;
  EmployeeName: string = "Raj Kumar";
  ActualLOP: number = 21;
  LOPAdjust: number = 0;
  Comment: string = '';
}

class NewJoinee{
  JoineeId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  Date: Date = new Date(2023, 4, 4);
  WorkingDays: number = 4;
  Salary: number = 30000;
  PayAction: number = 1;
  Comment: string = null;
}

class RunPayroll {
  AppliedLeave: AppliedLeave;
  NoAttendance: NoAttendance;
  LOPSummary: LOPSummary;
  NewJoinee: NewJoinee;
  LeaveAttendanceCompleted: boolean = false;
  EmployeeChangeseCompleted: boolean = false;
  BonusSalaryOvertimeCompleted: boolean = false;
  ReimbursementAdhicDeductCompleted: boolean = false;
  SalaryHoldArrearsCompleted: boolean = false;
  OverrideCompleted: boolean = false;
  completedValue: number = 0;
}