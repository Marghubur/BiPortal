import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemStatus } from 'src/providers/constants';
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
  runPayrollForm: FormGroup;
  payrollDetail: PayrollDetail = {
    SalaryAdhocId: 0,
    FirstName: "",
    LastName: "",
    EmployeeId: 0,
    FinancialYear: 0,
    OrganizationId: 0,
    CompanyId: 0,
    IsPaidByCompany: false,
    IsPaidByEmployee: false,
    IsFine: false,
    IsHikeInSalary: false,
    IsBonus: false,
    IsReimbursment: false,
    IsSalaryOnHold: false,
    IsArrear: false,
    Description: "",
    Amount: 0,
    ApprovedBy: 0,
    StartDate: null,
    EndDate: null,
    IsActive: false,
    DOJ: null,
    LWD: null,
    DOR: null,
    NoOfDays: 0,
    PaymentActionType: "",
    Reason: "",
    Comments: "",
    Status: 0,
    ForYear: 0,
    ForMonth: 0,
    WorkedMinutes: 0,
    CTC: 0,
    ComponentFullName: "",
    TotalMinutes: 0
  }

  constructor(private http: CoreHttpService,
              private filterHttp: EmployeeFilterHttpService,
              private user: UserService,
              private nav: iNavigation,
              private fb: FormBuilder) { }

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
    runPayroll.SalaryProcessing = new SalaryProcessing();
    runPayroll.SalaryPayout = new Salaryout();
    runPayroll.Arrear = new Arrear();
    runPayroll.PTOverRide = new PTOverRide();
    runPayroll.ESIOverRide = new ESIOverRide();
    runPayroll.TDSOverRide = new TDSOverRide();
    runPayroll.LWFOverRide = new LWFOverRide();
    localStorage.setItem(this.runpayroll, JSON.stringify(runPayroll));
    this.allRunPayroll = JSON.parse(localStorage.getItem(this.runpayroll));
    this.salaryProcessingDetail.push(this.allRunPayroll.SalaryProcessing);
    this.salaryPayoutDetail.push(this.allRunPayroll.SalaryPayout);
    this.arraersDetail.push(this.allRunPayroll.Arrear);
    this.ptOverrideDetail.push(this.allRunPayroll.PTOverRide);
    this.esiOverrideDetail.push(this.allRunPayroll.ESIOverRide);
    this.tdsOverrideDetail.push(this.allRunPayroll.TDSOverRide);
    this.lwfOverrideDetail.push(this.allRunPayroll.LWFOverRide);

    this.isPageReady = true;
  }

  initPayrollForm(data: Array<PayrollDetail>) {
    this.runPayrollForm = this.fb.group({
      RunPayroll: this.buildRunPayroll(data)
    })
  }

  buildRunPayroll(data: Array<PayrollDetail>): FormArray {
    let dataArray: FormArray = this.fb.array([]);

    if (data.length > 0) {
      let i = 0;
      while (i < data.length) {
        dataArray.push(this.fb.group({
          RowIndex: new FormControl(i+1),
          SalaryAdhocId: new FormControl(data[i].SalaryAdhocId != null ? data[i].SalaryAdhocId : 0),
          ProcessStepId: new FormControl(this.activePayrollTab),
          EmployeeId: new FormControl(data[i].EmployeeId != null ? data[i].EmployeeId : 0),
          FinancialYear: new FormControl(data[i].FinancialYear != null ? data[i].FinancialYear : 0),
          OrganizationId: new FormControl(data[i].OrganizationId != null ? data[i].OrganizationId : 0),
          CompanyId: new FormControl(data[i].CompanyId != null ? data[i].CompanyId : 0),
          IsPaidByCompany: new FormControl(data[i].IsPaidByCompany != null ? data[i].IsPaidByCompany : false),
          IsPaidByEmployee: new FormControl(data[i].IsPaidByEmployee != null ? data[i].IsPaidByEmployee : false),
          IsOvertime: new FormControl(data[i].IsOvertime != null ? data[i].IsOvertime : false),
          IsFine: new FormControl(data[i].IsFine != null ? data[i].IsFine : false),
          IsHikeInSalary: new FormControl(data[i].IsHikeInSalary != null ? data[i].IsHikeInSalary : false),
          IsBonus: new FormControl(data[i].IsBonus != null ? data[i].IsBonus : false),
          IsReimbursment: new FormControl(data[i].IsReimbursment != null ? data[i].IsReimbursment : false),
          IsSalaryOnHold: new FormControl(data[i].IsSalaryOnHold != null ? data[i].IsSalaryOnHold : false),
          IsArrear: new FormControl(data[i].IsArrear != null ? data[i].IsArrear : false),
          Description: new FormControl(data[i].Description != null ? data[i].Description : ""),
          Amount: new FormControl(data[i].Amount != null ? data[i].Amount : 0),
          ApprovedBy: new FormControl(data[i].ApprovedBy != null ? data[i].ApprovedBy : 0),
          StartDate: new FormControl(data[i].StartDate),
          EndDate: new FormControl(data[i].EndDate),
          IsActive: new FormControl(data[i].IsActive != null ? data[i].IsActive : true),
          DOJ: new FormControl(data[i].DOJ),
          LWD: new FormControl(data[i].LWD),
          DOR: new FormControl(data[i].DOR),
          NoOfDays: new FormControl(data[i].NoOfDays != null ? data[i].NoOfDays : 0),
          PaymentActionType: new FormControl(data[i].PaymentActionType),
          Reason: new FormControl(data[i].Reason),
          Comments: new FormControl(data[i].Comments),
          Status: new FormControl(data[i].Status != null ? data[i].Status : 0),
          ForYear: new FormControl(data[i].ForYear != null ? data[i].ForYear : 0),
          ForMonth: new FormControl(data[i].ForMonth != null ? data[i].ForMonth : 0),
          WorkedMinutes: new FormControl(data[i].WorkedMinutes != null ? data[i].WorkedMinutes : 0),
          FirstName: new FormControl(data[i].FirstName),
          LastName: new FormControl(data[i].LastName),
          CTC: new FormControl(data[i].CTC),
          ComponentFullName: new FormControl(data[i].ComponentFullName),
          TotalMinutes: new FormControl(data[i].TotalMinutes),
          GrossSalary: new FormControl(data[i].GrossSalary),
          BasicSalary: new FormControl(data[i].BasicSalary),
          OTCalculatedOn: new FormControl(data[i].OTCalculatedOn),
          IsCompOff: new FormControl(data[i].IsCompOff != null ? data[i].IsCompOff : false),
          IsReimburs: new FormControl(data[i].IsReimburs != null ? data[i].IsReimburs : false),
          IsAdhoc: new FormControl(data[i].IsAdhoc != null ? data[i].IsAdhoc : false),
          IsDeduction: new FormControl(data[i].IsDeduction != null ? data[i].IsDeduction : false),
          ClaimAmount: new FormControl(data[i].ClaimAmount != null ? data[i].ClaimAmount : 0),
          ComponentType: new FormControl(data[i].ComponentType)
        }))
        i++;
      }
    } else {
      dataArray.push(this.createRunPayroll());
    }

    return dataArray;
  }

  createRunPayroll() {
    return this.fb.group({
      SalaryAdhocId: new FormControl(this.payrollDetail.SalaryAdhocId),
      EmployeeId: new FormControl(this.payrollDetail.EmployeeId),
      FinancialYear: new FormControl(this.payrollDetail.FinancialYear),
      OrganizationId: new FormControl(this.payrollDetail.OrganizationId),
      CompanyId: new FormControl(this.payrollDetail.CompanyId),
      IsPaidByCompany: new FormControl(this.payrollDetail.IsPaidByCompany),
      IsPaidByEmployee: new FormControl(this.payrollDetail.IsPaidByEmployee),
      IsFine: new FormControl(this.payrollDetail.IsFine),
      IsHikeInSalary: new FormControl(this.payrollDetail.IsHikeInSalary),
      IsBonus: new FormControl(this.payrollDetail.IsBonus),
      IsReimbursment: new FormControl(this.payrollDetail.IsReimbursment),
      IsSalaryOnHold: new FormControl(this.payrollDetail.IsSalaryOnHold),
      IsArrear: new FormControl(this.payrollDetail.IsArrear),
      Description: new FormControl(this.payrollDetail.Description),
      Amount: new FormControl(this.payrollDetail.Amount),
      ApprovedBy: new FormControl(this.payrollDetail.ApprovedBy),
      StartDate: new FormControl(this.payrollDetail.StartDate),
      EndDate: new FormControl(this.payrollDetail.EndDate),
      IsActive: new FormControl(this.payrollDetail.IsActive),
      DOJ: new FormControl(this.payrollDetail.DOJ),
      LWD: new FormControl(this.payrollDetail.LWD),
      DOR: new FormControl(this.payrollDetail.DOR),
      NoOfDays: new FormControl(this.payrollDetail.NoOfDays),
      PaymentActionType: new FormControl(this.payrollDetail.PaymentActionType),
      Reason: new FormControl(this.payrollDetail.Reason),
      Comments: new FormControl(this.payrollDetail.Comments),
      Status: new FormControl(this.payrollDetail.Status),
      ForYear: new FormControl(this.payrollDetail.ForYear),
      ForMonth: new FormControl(this.payrollDetail.ForMonth),
      WorkedMinutes: new FormControl(this.payrollDetail.WorkedMinutes),
      FirstName: new FormControl(this.payrollDetail.FirstName),
      LastName: new FormControl(this.payrollDetail.LastName),
      CTC: new FormControl(this.payrollDetail.CTC),
      ComponentFullName: new FormControl(this.payrollDetail.ComponentFullName),
      TotalMinutes: new FormControl(this.payrollDetail.TotalMinutes),
      GrossSalary: new FormControl(this.payrollDetail.GrossSalary),
      BasicSalary: new FormControl(this.payrollDetail.BasicSalary),
      OTCalculatedOn: new FormControl(this.payrollDetail.OTCalculatedOn),
      IsCompOff: new FormControl(this.payrollDetail.IsCompOff != null ? this.payrollDetail.IsCompOff : 0)
    });
  }

  get RunPayroll(): FormArray {
    return this.runPayrollForm.get("RunPayroll") as FormArray
  }

  GetFilterLeaveResult(e: Filter) {
    if (e != null) {
      this.leaveData = e;
      this.loadData();
    }
  }

  backActivePages() {
    if (this.active > 1)
      this.active = this.active - 1;
  }

  // ------------------------------Employee Changes --------------------------
  moveNextComponent() {
    switch (this.activePayrollTab) {
      case 1:
        this.viewNewJoineeExist();
        break;
      case 2:
        this.viewBonusSalaryRevisionOT();
        break;
      case 3:
        this.viewReimbursementAdhocDeduction();
        break;
      case 4:
        // this.viewNewJoineeExist();
        this.activePayrollTab = this.activePayrollTab + 1;
        break;
      case 5:
        //this.viewNewJoineeExist();
        this.activePayrollTab = this.activePayrollTab + 1;
        break;
      default:
        this.activePayrollTab = 1;
        break;
    }
    this.active = 1;
  }

  markEmpChangeComplete() {
    this.activePayrollTab = 1;
    this.allRunPayroll.EmployeeChangeseCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
  }

  markBonusAlaryOvertimeComplete() {
    this.activePayrollTab = 1;
    this.allRunPayroll.BonusSalaryOvertimeCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
  }

  // ------------------------------Reimbursement, Adhoc Payment and Deduction
  markReimburseAdhocDeductionComplete() {
    this.activePayrollTab = 1;
    this.allRunPayroll.ReimbursementAdhicDeductCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
  }

  // ------------------------------Salaries and Arreaars
  saveSalariesArrears() {
    if (this.activePayrollTab > 0 && this.activePayrollTab < 3) {
      this.activePayrollTab = this.activePayrollTab + 1;
    } else {
      this.activePayrollTab = 1;
    }
  }

  markSalariesArrearsComplete() {
    this.activePayrollTab = 1;
    this.allRunPayroll.SalaryHoldArrearsCompleted = true;
    this.allRunPayroll.completedValue = this.allRunPayroll.completedValue + 16.66;
  }

  // ------------------------------Override (PT, TDS, ESI, LWF)
  saveOverride() {
    if (this.activePayrollTab > 0 && this.activePayrollTab < 4) {
      this.activePayrollTab = this.activePayrollTab + 1;
    } else {
      this.activePayrollTab = 1;
    }
  }

  markOverrideComplete() {
    this.activePayrollTab = 1;
    this.allRunPayroll.OverrideCompleted = true;
    this.allRunPayroll.completedValue = 100;
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
    this.loadNewJoineeExistEmployeeData();
  }

  loadNewJoineeExistEmployeeData() {
    this.isLoading = true;
    this.filterHttp.get(`runpayroll/getJoineeAndExitingEmployees`).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        let records = res.ResponseBody;
        this.exitEmpDetail = records.filter(x => x.IsServingNotice == true || x.IsServingNotice == 1);
        this.newJoineeDetail = records.filter(x => x.InProbation == true || x.InProbation == 1);
        if (this.active == 1)
          this.getNewJoineeRecord();
        else if (this.active == 2)
          this.getExistEmpRecord();

        Toast("Record found");
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getNewJoineeRecord() {
    let newJoineeData = this.newJoineeDetail;
    if (newJoineeData && newJoineeData.length > 0) {
      newJoineeData.forEach(x => {
        x.DOJ = x.CreatedOn,
        x.NoOfDays = x.InDays
      })
    }
    this.initPayrollForm(newJoineeData);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  getExistEmpRecord() {
    let existEmpData = this.exitEmpDetail;
    if (existEmpData && existEmpData.length > 0) {
      existEmpData.forEach(x => {
        x.DOR = x.CreatedOn,
        x.NoOfDays = x.InDays,
        x.LWD = x.DOL,
        x.Status = x.ResignationStatus
      })
    }

    this.initPayrollForm(existEmpData);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  viewBonusSalaryRevisionOT() {
    this.active = 1;
    this.activePayrollTab = 3;
    this.loadBonusShiftOTEmployeeData();
  }

  loadBonusShiftOTEmployeeData() {
    this.isLoading = true;
    this.filterHttp.get(`runpayroll/getBonusShiftOT/${this.selectedPayrollCalendar.Month+1}/${this.selectedPayrollCalendar.Year}`).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        let records = res.ResponseBody;
        this.bonusDetail = records.filter(x => x.IsBonus == true || x.IsBonus == 1);
        this.salaryRevisionDetail = records.filter(x => x.IsBonus == true || x.IsBonus == 1);
        this.overTimePaymentDetail = records.filter(x => x.IsOvertime == true || x.IsOvertime == 1);
        if (this.active == 1)
          this.getBonusEmpRecord();
        else if (this.active == 2)
          this.getSalaryRevisionEmpRecord();
        else
          this.getOverTimeEmpRecord();

        Toast("Record found");
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getBonusEmpRecord() {
    let bonusData = this.bonusDetail;
    if (bonusData && bonusData.length > 0) {
      bonusData.forEach(x => {
        x.IsBonus = true;
      })
    }
    this.initPayrollForm(bonusData);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  getSalaryRevisionEmpRecord() {
    let existEmpData = this.salaryRevisionDetail;
    this.initPayrollForm(existEmpData);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  getOverTimeEmpRecord() {
    let overtimeData = this.overTimePaymentDetail;
    if (overtimeData && overtimeData.length > 0) {
      overtimeData.forEach(x => {
        x.Amount = x.SalaryAdhocId > 0 ? x.Amount : 0;
        x.IsOvertime = true;
        let salaryDetail = JSON.parse(x.CompleteSalaryDetail);
        let salaryBreakup = salaryDetail.find(x => x.MonthNumber == this.selectedPayrollCalendar.Month + 1);
        if (salaryBreakup) {
          x.GrossSalary = salaryBreakup.SalaryBreakupDetails.find(x => x.ComponentId == "Gross").FinalAmount;
          x.BasicSalary = salaryBreakup.SalaryBreakupDetails.find(x => x.ComponentId == "BS").FinalAmount
        }
      })
    }

    this.initPayrollForm(overtimeData);
  }

  selectOvertimeAction(e: any) {
    let value = e.target.value;
    let elem = e.currentTarget.parentElement.nextElementSibling;
    if (value == 'false') {
      if (elem.classList.contains('d-none'))
        elem.classList.remove('d-none');
    } else {
      if (!elem.classList.contains('d-none'))
        elem.classList.add('d-none');
    }
  }

  selectOvertimeCalculationOn(e: any, item: any) {
    let value = e.target.value;
    let selectedValue = item.value;
    let amount = 0;
    let daysInMonth = new Date(selectedValue.ForYear, selectedValue.ForMonth, 0).getDate();
    if (value.toUpperCase() == "GROSS") {
      amount = (selectedValue.GrossSalary / (daysInMonth * 24 * 60)) * selectedValue.TotalMinutes;
    } else {
      amount = (selectedValue.BasicSalary / (daysInMonth * 24 * 60)) * selectedValue.TotalMinutes;
    }
    item.controls["Amount"].setValue(amount);
  }

  viewReimbursementAdhocDeduction() {
    this.active = 1;
    this.activePayrollTab = 4;
    this.loadReimbursementAdhocDeductionEmpData();
  }

  loadReimbursementAdhocDeductionEmpData() {
    this.isLoading = true;
    this.filterHttp.get(`runpayroll/getReimbursementAdhocDeduction/${this.selectedPayrollCalendar.Month+1}/${this.selectedPayrollCalendar.Year}`).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        let records = res.ResponseBody;
        this.salaryComponentsDetail = records.filter(x => x.IsReimburs == true || x.IsReimburs == 1);
        this.adhocPaymentDetail = records.filter(x => x.IsAdhoc == true || x.IsAdhoc == 1);
        this.adhocDeductionDetail = records.filter(x => x.IsDeduction == true || x.IsDeduction == 1);
        if (this.active == 1)
          this.getSalaryCompClaimRecord();
        else if (this.active == 2)
          this.getAdhocPaymentRecord();
        else
          this.getAdhocDeductionRecord();

        Toast("Record found");
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getSalaryCompClaimRecord() {
    let data = this.salaryComponentsDetail;
    if (data && data.length > 0) {
      data.forEach(x => {
        x.IsIsReimburs = true;
        x.IsAdhoc = false;
        x.IsDeduction = false;
      })
    }
    this.initPayrollForm(data);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  getAdhocPaymentRecord() {
    let data = this.adhocPaymentDetail;
    if (data && data.length > 0) {
      data.forEach(x => {
        x.IsIsReimburs = false;
        x.IsAdhoc = true;
        x.IsDeduction = false;
      })
    }
    this.initPayrollForm(data);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  getAdhocDeductionRecord() {
    let data = this.adhocDeductionDetail;
    if (data && data.length > 0) {
      data.forEach(x => {
        x.IsIsReimburs = false;
        x.IsAdhoc = false;
        x.IsDeduction = true;
      })
    }
    this.initPayrollForm(data);
    this.RunPayroll.controls.forEach(control => {
      const nameControl = control.get('PaymentActionType');
      if (!nameControl.validator) {
        nameControl.setValidators(Validators.required); // Add specific validation
      }
      nameControl.updateValueAndValidity(); // Trigger validation check
    });
  }

  viewSalaryOnHoldArrear() {
    this.active = 1;
    this.activePayrollTab = 5;
  }

  saveNewJoineeExitsFinalSattlement() {
    let requestPayload = this.runPayrollForm.value.RunPayroll;
    requestPayload.forEach(x => {
      x.ForMonth = this.selectedPayrollCalendar.Month + 1,
      x.ForYear = this.selectedPayrollCalendar.Year,
      x.Status = ItemStatus.Pending,
      x.FinancialYear = 0
    });
    this.filterHttp.post("promotionoradhocs/manageNewJoineeExitsFinalSattlement", requestPayload)
    .then((response: ResponseModel) => {
      if (response.ResponseBody == "updated") {
        if (this.active < 3) {
          this.active = this.active + 1;
          this.getExistEmpRecord();
        }
        else
          this.moveNextComponent();
        Toast("Record updated successfully");
      } else {
        Toast("Fail to updated record");
      }
    });
  }

  saveBonusSalaryRevisionOvertime() {
    let requestPayload = this.runPayrollForm.value.RunPayroll;
    requestPayload.forEach(x => {
      x.ForMonth = this.selectedPayrollCalendar.Month + 1,
      x.ForYear = this.selectedPayrollCalendar.Year,
      x.Status = ItemStatus.Pending,
      x.FinancialYear = 0
    });
    this.filterHttp.post("promotionoradhocs/manageBonusSalaryRevisionOvertime", requestPayload)
    .then((response: ResponseModel) => {
      if (response.ResponseBody == "updated") {
        if (this.active == 1) {
          this.active = this.active + 1;
          this.getSalaryRevisionEmpRecord();
        } else if (this.active == 2) {
          this.active = this.active + 1;
          this.getOverTimeEmpRecord();
        } else {
          this.moveNextComponent();
        }
        Toast("Record updated successfully");
      } else {
        Toast("Fail to updated record");
      }
    });
  }

  saveReimbursementAdhocPaymentDeduction() {
    let requestPayload = this.runPayrollForm.value.RunPayroll;
    requestPayload.forEach(x => {
      x.ForMonth = this.selectedPayrollCalendar.Month + 1,
      x.ForYear = this.selectedPayrollCalendar.Year,
      x.Status = ItemStatus.Pending,
      x.FinancialYear = 0
    });
    this.filterHttp.post("promotionoradhocs/manageReimbursementAdhocPaymentDeduction", requestPayload)
    .then((response: ResponseModel) => {
      if (response.ResponseBody == "updated") {
        if (this.active == 1) {
          this.active = this.active + 1;
          this.getAdhocPaymentRecord();
        } else {
          this.active = this.active + 1;
          this.getAdhocDeductionRecord();
        } 
        Toast("Record updated successfully");
      } else {
        Toast("Fail to updated record");
      }
    });
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
    this.filterHttp.get(`runpayroll/getLeaveAndLOP/${this.selectedPayrollCalendar.Year}/${this.selectedPayrollCalendar.Month+1}`).then(res => {
      if (res.ResponseBody) {
        if (res.ResponseBody[0].length > 0)
          this.appliedLeaveDetail = res.ResponseBody[0];
        else if (res.ResponseBody[0].length == 1) {
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

    switch (requestState) {
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
      LeaveRequestNotificationId: this.selectedLeave.LeaveRequestNotificationId,
      RecordId: this.selectedLeave.RecordId,
      LeaveTypeId: this.selectedLeave.LeaveTypeId,
      Reason: this.selectedLeave.Reason
    }
    let filterId = 0;
    this.http.post(`${endPoint}/${filterId}`, currentResponse).then((response: ResponseModel) => {
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
    this.http.get(`Leave/GetLeaveDetailByEmpId/${item.EmployeeId}`).then((res: ResponseModel) => {
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
    this.filterHttp.post("runpayroll/getAttendancePage", this.attendanceData).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.attendanceDetail = [];
        this.attendanceDetail = res.ResponseBody;
        if (this.attendanceDetail.length > 0) {
          this.attendanceDetail.forEach(x => {
            x.AttendanceDetail = JSON.parse(x.AttendanceDetail);
            if (this.appliedLeaveDetail && this.appliedLeaveDetail.length > 0) {
              x.AttendanceDetail.forEach(i => {
                var item = this.appliedLeaveDetail.find(z => (new Date(z.FromDate).getTime() - new Date(i.AttendanceDay).getTime()) / (1000 * 60 * 60 * 24) <= 0 &&
                  ((new Date(z.ToDate).getTime() - new Date(i.AttendanceDay).getTime())) / (1000 * 60 * 60 * 24) >= 0 && z.EmployeeId == x.EmployeeId);
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
    if (e != null) {
      this.attendanceData = e;
      this.getAttendanceDetail();
    }
  }

  filterRecords() {
    let delimiter = "";
    let searchString = "";
    this.attendanceData.SearchString = ""
    this.attendanceData.reset();

    if (this.attendance.EmployeeName !== null && this.attendance.EmployeeName !== "") {
      searchString += ` EmployeeName like '%${this.attendance.EmployeeName.toUpperCase()}%'`;
      delimiter = "and";
    }

    if (this.attendance.ForMonth !== null && this.attendance.ForMonth > 0) {
      searchString += ` ${delimiter} ForMonth = ${this.attendance.ForMonth}`;
      delimiter = "and";
    }

    if (this.attendance.ForYear !== null && this.attendance.ForYear > 0) {
      searchString += ` ${delimiter} ForYear = ${this.attendance.ForYear}`;
      delimiter = "and";
    }

    if (searchString != "") {
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

    this.http.post('Attendance/AdjustAttendance', this.selectedAttendance).then((res: ResponseModel) => {
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

    if (this.selectedLeaveType != null && this.selectedLeaveType.LeavePlanTypeId <= 0) {
      WarningToast("Please select Leave Type first.");
      this.isLoading = false;
      return;
    }

    if (this.selectedLeaveType != null && this.selectedLeaveType.AvailableLeaves <= 0) {
      WarningToast("You don't have leave balance of selected leave");
      this.isLoading = false;
      return;
    }

    this.selectedLOP.LeaveTypeId = this.selectedLeaveType.LeavePlanTypeId;
    this.selectedLOP.LeavePlanName = this.selectedLeaveType.LeavePlanTypeName
    this.http.post('Leave/AdjustLOPAsLeave', this.selectedLOP).then((res: ResponseModel) => {
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
      .then((res: ResponseModel) => {
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

interface PayrollDetail {
  SalaryAdhocId: number,
  EmployeeId: number,
  FinancialYear: number,
  OrganizationId: number,
  CompanyId: number,
  IsPaidByCompany: boolean,
  IsPaidByEmployee: boolean,
  IsFine: boolean,
  IsHikeInSalary: boolean,
  IsBonus: boolean,
  IsReimbursment: boolean,
  IsSalaryOnHold: boolean,
  IsArrear: boolean,
  Description: string,
  Amount: number,
  ApprovedBy: number,
  StartDate: Date,
  EndDate: Date,
  IsActive: boolean,
  DOJ: Date,
  LWD: Date,
  DOR: Date,
  NoOfDays: number,
  PaymentActionType: string,
  Reason: string,
  Comments: string,
  Status: number,
  ForYear: number,
  ForMonth: number,
  WorkedMinutes: number,
  FirstName: string,
  LastName: string,
  CTC: number,
  ComponentFullName: string,
  TotalMinutes: number,
  GrossSalary?: number,
  BasicSalary?: number,
  OTCalculatedOn?: string,
  IsCompOff?: boolean,
  IsOvertime?: boolean,
  IsReimburs?: boolean,
  IsAdhoc?: boolean,
  IsDeduction?: boolean,
  ClaimAmount?: number,
  ComponentType?: string
}