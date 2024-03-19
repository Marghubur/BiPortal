import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
declare var $: any;

@Component({
  selector: 'app-processing-payroll',
  templateUrl: './processing-payroll.component.html',
  styleUrls: ['./processing-payroll.component.scss']
})
export class ProcessingPayrollComponent implements OnInit {
  isCollapsed: boolean = false;
  isLoading: boolean = false;
  submittedPayrollDate: Date = new Date();

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
  payrollCalendar: Array<any> = [];
  selectedPayrollCalendar: any = null;
  selectedLOP: any = null;
  // --------------------
  userDetail: any = null;
  runpayroll: string = "RunPayRoll";
  userName: string = null;
  allRunPayroll: RunPayroll = null
  employeeId: number = 0;
  employeeData: autoCompleteModal = new autoCompleteModal();
  processingPayrollDetail: Array<any> = [];
  selectedPayrollDetail: any = null;

  // runpayroll-----------------------------------------
  activePayrollTab: number = 1;
  attendanceData: Filter = new Filter();
  attendance: Attendance;
  daysInMonth: Array<number> = [];
  appliedLeaveDetail: Array<any> = [];
  lossPayDetail: Array<any> = [];
  leaveQuota: Array<any> = [];
  selectedLeaveType: any = null;
  attendanceDetail: Array<any> = [];
  selectedAttendance: any = null;
  selectedLeave: any = null;
  availLopAdjusmentDay: Array<number> = [];
  active = 1;

  constructor(private http: CoreHttpService,
    private filterHttp: EmployeeFilterHttpService,
    private user: UserService,
    private nav: iNavigation) { }

  ngOnInit(): void {
    this.loadData();
    this.employeeData.data = [];
    this.employeeData.placeholder = "Employee";
    this.employeeData.data.push({
      value: 0,
      text: "All"
    });
    this.employeeData.className = "normal";
    let data = GetEmployees();
    data.forEach(x => {
      this.employeeData.data.push({
        value: x.value,
        text: x.text
      });
    })
    this.runPayrollPopup();
  }

  callApiLoadData() {
    this.filterHttp.get(`runpayroll/getPayrollProcessingDetail/${this.selectedPayrollCalendar.Year}`)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          if (response.ResponseBody.length > 0) {
            this.processingPayrollDetail = response.ResponseBody;
            this.processingPayrollDetail.forEach(i => {
              let value = this.payrollCalendar.find(x => x.Month == (i.ForMonth - 1) && x.Year == i.ForYear);
              if (value)
                value.Status = i.PayrollStatus;
            });
            this.selectedPayrollDetail = this.processingPayrollDetail.find(x => x.ForMonth == this.selectedPayrollCalendar.Month + 1 && x.ForYear == this.selectedPayrollCalendar.Year);
          }
          Toast("Page data loaded successfully.");
        }
      });
  }

  loadData() {
    this.isPageReady = false;
    this.selectedPayrollCalendar = {
      Year: (new Date).getFullYear(),
      Month: (new Date).getMonth() + 1
    }
    let year = 2023;
    let startMonth = 4;
    for (let i = 0; i < 12; i++) {
      if (startMonth > 12) {
        startMonth = 1;
        year = year + 1;
      }
      this.payrollCalendar.push({
        MonthName: new Date(2022, startMonth - 1, 1).toLocaleString('default', { month: 'short' }),
        Month: startMonth - 1,
        Year: year,
        StartDate: new Date(2024, startMonth - 1, 1).getDate(),
        EndDate: new Date(2024, startMonth, 0).getDate(),
        Status: 16
      });
      startMonth = startMonth + 1;
    }

    this.selectedPayrollCalendar = this.payrollCalendar.find(x => x.Month == new Date().getMonth());
    this.callApiLoadData();
    this.selectedPayrollCalendar.Status = 4;
    this.userDetail = this.user.getInstance();
    this.userName = this.userDetail.FirstName + " " + this.userDetail.LastName;
    let runPayroll = new RunPayroll();
    runPayroll.NewJoinee = new NewJoinee();
    runPayroll.EmployeeExit = new EmployeeExit();
    runPayroll.FinalSettlement = new FinalSettlement();
    runPayroll.Bonus = new Bonus();
    runPayroll.SalaryRevision = new SalaryRevision();
    runPayroll.OverTime = new OverTime();
    runPayroll.ShiftAllowance = new ShiftAllowance();
    runPayroll.SalaryComponents = new SalaryComponents();
    runPayroll.Expense = new Expense();
    runPayroll.AdhocPayment = new AdhocPayment();
    runPayroll.AdhocDeduction = new AdhocDeduction();
    runPayroll.SalaryProcessing = new SalaryProcessing();
    runPayroll.SalaryPayout = new Salaryout();
    runPayroll.Arrear = new Arrear();
    runPayroll.PTOverRide = new PTOverRide();
    runPayroll.ESIOverRide = new ESIOverRide();
    runPayroll.TDSOverRide = new TDSOverRide();
    runPayroll.LWFOverRide = new LWFOverRide();
    localStorage.setItem(this.runpayroll, JSON.stringify(runPayroll));
    this.allRunPayroll = JSON.parse(localStorage.getItem(this.runpayroll));
    this.newJoineeDetail.push(this.allRunPayroll.NewJoinee);
    this.exitEmpDetail.push(this.allRunPayroll.EmployeeExit);
    this.settlementDetail.push(this.allRunPayroll.FinalSettlement);
    this.bonusDetail.push(this.allRunPayroll.Bonus);
    this.salaryRevisionDetail.push(this.allRunPayroll.SalaryRevision);
    this.overTimePaymentDetail.push(this.allRunPayroll.OverTime);
    this.shiftAllowanceDetail.push(this.allRunPayroll.ShiftAllowance);
    this.salaryComponentsDetail.push(this.allRunPayroll.SalaryComponents);
    this.expensesDetail.push(this.allRunPayroll.Expense);
    this.adhocPaymentDetail.push(this.allRunPayroll.AdhocPayment);
    this.adhocDeductionDetail.push(this.allRunPayroll.AdhocDeduction);
    this.salaryProcessingDetail.push(this.allRunPayroll.SalaryProcessing);
    this.salaryPayoutDetail.push(this.allRunPayroll.SalaryPayout);
    this.arraersDetail.push(this.allRunPayroll.Arrear);
    this.ptOverrideDetail.push(this.allRunPayroll.PTOverRide);
    this.esiOverrideDetail.push(this.allRunPayroll.ESIOverRide);
    this.tdsOverrideDetail.push(this.allRunPayroll.TDSOverRide);
    this.lwfOverrideDetail.push(this.allRunPayroll.LWFOverRide);

    this.isPageReady = true;
  }

  // navleaveAttendanceWages() {
  //   let data = {
  //     EndDate: this.selectedPayrollCalendar.EndDate,
  //     Month: this.selectedPayrollCalendar.Month + 1,
  //     MonthName: this.selectedPayrollCalendar.MonthName,
  //     StartDate: this.selectedPayrollCalendar.StartDate,
  //     Status: this.selectedPayrollCalendar.Status,
  //     Year: this.selectedPayrollCalendar.Year,
  //     EmployeeId: this.employeeId
  //   }

  //   this.nav.navigate(LeaveAttendanceDailywages, data);
  // }

  GetFilterLeaveResult(e: Filter) {
    if (e != null) {
      this.leaveData = e;
      this.loadData();
    }
  }

  // GetFilterLosspayResult(e: Filter) {
  //   if (e != null) {
  //     this.lossPayData = e;
  //     this.loadData();
  //   }
  // }

  GetFilterReversepayResult(e: Filter) {
    if (e != null) {
      this.reverseLossPayData = e;
      this.loadData();
    }
  }

  chnageActiveIndex(index: number) {
    this.activeIndex = index;
  }

  backActivePages() {
    if (this.activeIndex > 1)
      this.activeIndex = this.activeIndex - 1;
  }

  saveLeaveAttendaceWage() {
    if (this.activeIndex > 0 && this.activeIndex < 3) {
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
    this.allRunPayroll.LeaveAttendanceCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#leaveAttendanceWages').modal('hide');
  }



  adjustMoreLOP(e: any) {
    let value = e.target.checked;
    let elem = document.querySelector('div[data-name="deducetedLeaveContainer"]');
    if (value == true) {
      elem.classList.remove('d-none');
    } else {
      elem.classList.add('d-none');
    }
  }



  // ------------------------------Employee Changes
  employeeChangesPopUp() {
    this.activeIndex = 1;
    $('#employeeChanges').modal('show');
  }

  GetFilterNewJoineeResult(e: Filter) {
    if (e != null) {
      this.newJoineeData = e;
      this.loadData();
    }
  }

  GetFilterExitEmpResult(e: Filter) {
    if (e != null) {
      this.exitEmpData = e;
      this.loadData();
    }
  }

  GetFilterSettlementResult(e: Filter) {
    if (e != null) {
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
    this.allRunPayroll.EmployeeChangeseCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#employeeChanges').modal('hide');
  }

  // ------------------------------Bonus, Salary Revision and Overtime
  bonusSalryOvertimePopUp() {
    this.activeIndex = 1;
    $('#bonusSalaryOvertime').modal('show');
  }

  GetFilterBonusResult(e: Filter) {
    if (e != null) {
      this.bonusData = e;
      this.loadData();
    }
  }

  GetFilterSalaryRevisionResult(e: Filter) {
    if (e != null) {
      this.salaryRevisionData = e;
      this.loadData();
    }
  }

  GetFilterOvertimeResult(e: Filter) {
    if (e != null) {
      this.overTimePaymentData = e;
      this.loadData();
    }
  }

  GetFilterShiftResult(e: Filter) {
    if (e != null) {
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
    this.allRunPayroll.BonusSalaryOvertimeCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#bonusSalaryOvertime').modal('hide');
  }

  // ------------------------------Reimbursement, Adhoc Payment and Deduction
  reimbursementAdhocDeductPopUp() {
    this.activeIndex = 1;
    $('#reimbursementAdhicDeduction').modal('show');
  }

  GetFilterSalaryCompResult(e: Filter) {
    if (e != null) {
      this.salaryComponentsData = e;
      this.loadData();
    }
  }

  GetFilterExpenseResult(e: Filter) {
    if (e != null) {
      this.expensesData = e;
      this.loadData();
    }
  }

  GetFilterAdhocPaymentResult(e: Filter) {
    if (e != null) {
      this.adhocPaymentData = e;
      this.loadData();
    }
  }

  GetFilterAdhocDeductionResult(e: Filter) {
    if (e != null) {
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
    this.allRunPayroll.ReimbursementAdhicDeductCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#reimbursementAdhicDeduction').modal('hide');
  }

  // ------------------------------Salaries and Arreaars
  salariesArrearsPopUp() {
    this.activeIndex = 1;
    $('#salariesArrears').modal('show');
  }

  GetFilterSalaryProcessingResult(e: Filter) {
    if (e != null) {
      this.salaryProcessingData = e;
      this.loadData();
    }
  }

  GetFilterSalaryPayoutResult(e: Filter) {
    if (e != null) {
      this.salaryPayoutData = e;
      this.loadData();
    }
  }

  GetFilterArraersResult(e: Filter) {
    if (e != null) {
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
    this.allRunPayroll.SalaryHoldArrearsCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
    this.setLocalStoreValue();
    $('#salariesArrears').modal('hide');
  }

  // ------------------------------Override (PT, TDS, ESI, LWF)
  overridePopUp() {
    this.activeIndex = 1;
    $('#override').modal('show');
  }

  GetFilterPTOverideResult(e: Filter) {
    if (e != null) {
      this.ptOverrideData = e;
      this.loadData();
    }
  }

  GetFilterESIOverideResult(e: Filter) {
    if (e != null) {
      this.esiOverrideData = e;
      this.loadData();
    }
  }

  GetFilterTDSOverideResult(e: Filter) {
    if (e != null) {
      this.tdsOverrideData = e;
      this.loadData();
    }
  }

  GetFilterLWFOverideResult(e: Filter) {
    if (e != null) {
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
    this.allRunPayroll.OverrideCompleted = true;
    this.allRunPayroll.completedValue = 100;
    this.setLocalStoreValue();
    $('#override').modal('hide');
  }

  // ----------------------End

  previewPayroll() {
    this.runPayrollCalculation(0);
  }

  finalizePayroll() {
    this.runPayrollCalculation(0);
  }

  runPayrollCalculation(flagId: number) {
    this.isLoading = true;
    this.http.get(`Company/RunPayroll/${this.selectedPayrollCalendar.Month + 1}/${this.selectedPayrollCalendar.Year}/${flagId}`)
      .then((res: ResponseModel) => {
        if (res.ResponseBody) {
          $('#confirmPayrollFinalize').modal('hide');
          Toast(res.ResponseBody);
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      });
  }

  finalizePayrollPopUp() {
    $('#confirmPayrollFinalize').modal('show');
  }

  selectPayrollMonth(e: any) {
    let item = Number(e.target.value);
    this.selectedPayrollCalendar = this.payrollCalendar.find(x => x.Month == item);;
    this.selectedPayrollDetail = this.processingPayrollDetail.find(x => x.ForMonth == this.selectedPayrollCalendar.Month + 1 && x.ForYear == this.selectedPayrollCalendar.Year);
  }

  setLocalStoreValue() {
    localStorage.setItem(this.runpayroll, JSON.stringify(this.allRunPayroll));
  }


  // -------------- Run Payroll 6 Step ----------------------------

  viewleaveAttendanceWages() {
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
    this.loadLeaveData();
    this.active = 1;
    this.activePayrollTab = 1;
  }

  viewNewJoineeExist() {
    this.active = 1;
    this.activePayrollTab = 2;
  }

  viewBonusSalaryRevisionOT() {
    this.active = 1;
    this.activePayrollTab = 3;
  }

  viewReimbursementAdhocDeduction() {
    this.active = 1;
    this.activePayrollTab = 4;
  }

  viewSalaryOnHoldArrear() {
    this.active = 1;
    this.activePayrollTab = 5;
  }

  viewOveridePTESI() {
    this.active = 1;
    this.activePayrollTab = 6;
  }

  runPayrollPopup(): void {
    this.viewleaveAttendanceWages();
    $("#runPayrollSteopModal").modal('show');
  }

  loadLeaveData() {
    this.isLoading = true;
    this.filterHttp.get(`runpayroll/getLeaveAndLOP/${this.selectedPayrollCalendar.Year}/${this.selectedPayrollCalendar.Month}`).then(res => {
      if (res.ResponseBody) {
        if (res.ResponseBody[0].length > 0)
          this.appliedLeaveDetail = res.ResponseBody[0];
        else if (res.ResponseBody[0].length == 1)  {
          let data = res.ResponseBody[0];
          if (data && data.employeeId) {
            this.appliedLeaveDetail = data;
          }
        }
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
    this.http.post(`${endPoint}/${filterId}`, currentResponse).then((response:ResponseModel) => {
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
    this.filterHttp.post("runpayroll/getAttendancePage", this.attendanceData).then((res:ResponseModel) => {
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

  previousMonthyPayroll(e: any) {
    let elem = document.querySelector("select[data-name='payroll-month']");
    if (e.target.checked) {
      elem.removeAttribute('disabled');
    } else {
      elem.setAttribute('disabled', '');
      this.selectedPayrollCalendar = this.payrollCalendar.find(x => x.Month == new Date().getMonth());
    }
  }

}


class NewJoinee {
  JoineeId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  Date: Date = new Date(2023, 4, 4);
  WorkingDays: number = 4;
  Salary: number = 30000;
  PayAction: number = 1;
  Comment: string = null;
}

class EmployeeExit {
  ExitId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  DOJ: Date = new Date(2023, 4, 4);
  Reason: string = null;
  LastWorkingDay: Date = new Date();
  ExitRequestStatus: number = 1;
  WaitingOn: Date = new Date();
}

class FinalSettlement {
  SettlementId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  Reason: string = null;
  LastWorkingDay: Date = new Date();
  Status: number = 1;
  SettledAmount: number = 0;
  Action: number = 1;
  Comment: string = null;
}

class Bonus {
  BonusId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  PayoutDate: Date = new Date();
  BonusType: string = null;
  Amount: number = 0;
  PayAction: number = 1;
  Comment: string = null;
}

class SalaryRevision {
  SalaryRevisionId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  OldSalary: number = 0;
  NewSalary: number = 0;
  Changes: number = 0;
  GrossPayMonth: number = 0;
  RevisionAction: number = 1;
  Comment: string = null;
}

class OverTime {
  SalaryRevisionId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  Month: number = 0;
  CalculatedAmount: number = 0;
  AdjustedAmount: number = 0;
  PayAction: number = 1;
  PayableAmount: number = 0;
}

class ShiftAllowance {
  SalaryRevisionId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  Month: number = 0;
  CalculatedAmount: number = 0;
  AdjustedAmount: number = 0;
  PayableAmount: number = 0;
  PayAction: number = 1;
  Comment: string = null;
}

class SalaryComponents {
  SalaryRevisionId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  ComponentName: number = 0;
  ComponentType: number = 0;
  ClaimAmount: number = 0;
  Status: number = 0;
  PayableAmount: number = 1;
  ApprovedOn: Date = new Date();
}

class Expense {
  ExpenseId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  ClaimNumber: number = 0;
  ClaimTitleType: string = null;
  ExpenseCount: number = 0;
  Amount: number = 0;
  Status: number = 1;
  PayableAmount: number = 0;
  ApprovedOn: Date = new Date();
}

class AdhocPayment {
  AdhocPaymentId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  AdhocPaymentType: string = null;
  Amount: number = 0;
  Comment: string = null;
}

class AdhocDeduction {
  AdhocDeductionId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  AdhocDeductionType: string = null;
  Amount: number = 0;
  Comment: string = null;
}

class SalaryProcessing {
  SalaryProcessingId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  PayPeriod: string = null;
  Amount: number = 0;
  PayAction: number = 1;
  Comment: string = null;
}

class Salaryout {
  SalaryoutId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  PayPeriod: string = null;
  PayAction: number = 1;
  Comment: string = null;
}

class Arrear {
  ArrearId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  DOJ: Date = new Date();
  TotalArrearAmount: number = 0;
  Reason: string = null;
}

class PTOverRide {
  PTOverRideId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  GrossSalary: number = 0;
  RegularPT: number = 0;
  PTOverRideAmount: number = 0;
  PTOverRideMonth: number = 0;
  Comment: string = null
}

class ESIOverRide {
  ESIOverRideId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  GrossSalary: number = 0;
  ESIEmployee: number = 0;
  EmployeeOverride: number = 0;
  ESIEmployer: number = 0;
  EmployerOverride: number = 0;
  OverRideMonth: number = 0;
  Comment: string = null
}

class TDSOverRide {
  TDSOverRideId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  GrossSalary: number = 0;
  RegularTDS: number = 0;
  TDSOverRideAmount: number = 0;
  TDSOverRideMonth: number = 0;
  Comment: string = null
}

class LWFOverRide {
  LWFOverRideId: number = 1;
  EmployeeName: string = "Sarfaraz Nawaz";
  GrossSalary: number = 0;
  LWFEmployee: number = 0;
  EmployeeOverride: number = 0;
  LWFEmployer: number = 0;
  EmployerOverride: number = 0;
  OverRideMonth: number = 0;
  Comment: string = null
}

class RunPayroll {
  NewJoinee: NewJoinee;
  EmployeeExit: EmployeeExit;
  FinalSettlement: FinalSettlement;
  Bonus: Bonus;
  SalaryRevision: SalaryRevision;
  OverTime: OverTime;
  ShiftAllowance: ShiftAllowance;
  SalaryComponents: SalaryComponents;
  Expense: Expense;
  AdhocPayment: AdhocPayment;
  AdhocDeduction: AdhocDeduction;
  SalaryProcessing: SalaryProcessing;
  SalaryPayout: Salaryout;
  Arrear: Arrear;
  PTOverRide: PTOverRide;
  ESIOverRide: ESIOverRide;
  TDSOverRide: TDSOverRide;
  LWFOverRide: LWFOverRide;
  LeaveAttendanceCompleted: boolean = false;
  EmployeeChangeseCompleted: boolean = false;
  BonusSalaryOvertimeCompleted: boolean = false;
  ReimbursementAdhicDeductCompleted: boolean = false;
  SalaryHoldArrearsCompleted: boolean = false;
  OverrideCompleted: boolean = false;
  completedValue: number = 0;
  RunPayrollFinalize: boolean = false;
}

interface Attendance {
  EmployeeName: string,
  ForYear: number,
  ForMonth: number
}