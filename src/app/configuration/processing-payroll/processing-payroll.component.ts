import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import {
  ApplicationStorage,
  GetEmployees,
} from 'src/providers/ApplicationStorage';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import {
  ErrorToast,
  Toast,
  WarningToast,
} from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ConfigPayroll, ItemStatus } from 'src/providers/constants';
declare var $: any;

@Component({
  selector: 'app-processing-payroll',
  templateUrl: './processing-payroll.component.html',
  styleUrls: ['./processing-payroll.component.scss'],
})
export class ProcessingPayrollComponent implements OnInit {
  isCollapsed: boolean = false;
  isLoading: boolean = false;
  submittedPayrollDate: Date = new Date();
  settlementDetail: Array<any> = [];
  shiftAllowanceDetail: Array<any> = [];
  isPageReady: boolean = false;
  leaveData: Filter = new Filter();
  payrollCalendar: Array<any> = [];
  selectedPayrollCalendar: any = null;
  // --------------------
  userDetail: any = null;
  runpayroll: string = 'RunPayRoll';
  userName: string = null;
  allRunPayroll: RunPayroll = null;
  employeeId: number = 0;
  employeeData: autoCompleteModal = new autoCompleteModal();
  processingPayrollDetail: Array<any> = [];
  selectedPayrollDetail: any = null;

  constructor(
    private http: CoreHttpService,
    private filterHttp: EmployeeFilterHttpService,
    private user: UserService,
    private nav: iNavigation,
    private local: ApplicationStorage
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.employeeData.data = [];
    this.employeeData.placeholder = 'Employee';
    this.employeeData.data.push({
      value: 0,
      text: 'All',
    });
    this.employeeData.className = 'normal';
    let data = GetEmployees();
    data.forEach((x) => {
      this.employeeData.data.push({
        value: x.value,
        text: x.text,
      });
    });
  }

  callApiLoadData() {
    this.filterHttp
      .get(
        `runpayroll/getPayrollProcessingDetail/${this.selectedPayrollCalendar.Year}`
      )
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          if (response.ResponseBody.length > 0) {
            this.processingPayrollDetail = response.ResponseBody;
            this.processingPayrollDetail.forEach((i) => {
              let value = this.payrollCalendar.find(
                (x) => x.Month == i.ForMonth - 1 && x.Year == i.ForYear
              );
              if (value) value.Status = i.PayrollStatus;
            });

            this.selectedPayrollDetail = this.processingPayrollDetail.find(
              (x) =>
                x.ForMonth == this.selectedPayrollCalendar.Month + 1 &&
                x.ForYear == this.selectedPayrollCalendar.Year
            );
          }
          Toast('Page data loaded successfully.');
        }
      })
      .catch((err) => {
        if (err.HttpStatusMessage) {
          ErrorToast(err.HttpStatusMessage);
        } else {
          ErrorToast('Got server error');
        }
      });
  }

  loadData() {
    this.isPageReady = false;
    this.selectedPayrollCalendar = {
      Year: new Date().getFullYear(),
      Month: new Date().getMonth() + 1,
    };
    let year = this.local.findRecord('Companies')[0].FinancialYear;
    let startMonth = 4;
    for (let i = 0; i < 12; i++) {
      if (startMonth > 12) {
        startMonth = 1;
        year = year + 1;
      }
      this.payrollCalendar.push({
        MonthName: new Date(2022, startMonth - 1, 1).toLocaleString('default', {
          month: 'short',
        }),
        Month: startMonth - 1,
        Year: year,
        StartDate: new Date(2024, startMonth - 1, 1).getDate(),
        EndDate: new Date(2024, startMonth, 0).getDate(),
        Status: 16,
      });
      startMonth = startMonth + 1;
    }

    this.selectedPayrollCalendar = this.payrollCalendar.find(
      (x) => x.Month == new Date().getMonth()
    );
    this.callApiLoadData();
    this.selectedPayrollCalendar.Status = 4;
    this.userDetail = this.user.getInstance();
    this.userName = this.userDetail.FirstName + ' ' + this.userDetail.LastName;
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

    this.isPageReady = true;
  }

  GetFilterLeaveResult(e: Filter) {
    if (e != null) {
      this.leaveData = e;
      this.loadData();
    }
  }

  previewPayroll() {
    this.runPayrollCalculation(0);
  }

  finalizePayroll() {
    this.runPayrollCalculation(0);
  }

  runPayrollCalculation(flagId: number) {
    this.isLoading = true;
    this.http
      .get(
        `Company/RunPayroll/${this.selectedPayrollCalendar.Month + 1}/${
          this.selectedPayrollCalendar.Year
        }/${flagId}`
      )
      .then((res: ResponseModel) => {
        if (res.ResponseBody) {
          $('#confirmPayrollFinalize').modal('hide');
          Toast(res.ResponseBody);
          this.isLoading = false;
        }
      })
      .catch((e) => {
        if (e.HttpStatusMessage) {
          ErrorToast(e.HttpStatusMessage);
        } else {
          ErrorToast('Got server error');
        }
        this.isLoading = false;
      });
  }

  finalizePayrollPopUp() {
    $('#confirmPayrollFinalize').modal('show');
  }

  selectPayrollMonth(e: any) {
    let item = Number(e.target.value);
    this.selectedPayrollCalendar = this.payrollCalendar.find(
      (x) => x.Month == item
    );
    this.selectedPayrollDetail = this.processingPayrollDetail.find(
      (x) =>
        x.ForMonth == this.selectedPayrollCalendar.Month + 1 &&
        x.ForYear == this.selectedPayrollCalendar.Year
    );

    this.callApiLoadData();
  }

  previousMonthyPayroll(e: any) {
    let elem = document.querySelector("select[data-name='payroll-month']");
    if (e.target.checked) {
      elem.removeAttribute('disabled');
    } else {
      elem.setAttribute('disabled', '');
      this.selectedPayrollCalendar = this.payrollCalendar.find(
        (x) => x.Month == new Date().getMonth()
      );
    }
  }

  gotoConfigPayroll() {
    this.nav.navigate(ConfigPayroll, this.selectedPayrollCalendar);
  }
}

export class SalaryProcessing {
  SalaryProcessingId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  PayPeriod: string = null;
  Amount: number = 0;
  PayAction: number = 1;
  Comment: string = null;
}

export class Salaryout {
  SalaryoutId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  PayPeriod: string = null;
  PayAction: number = 1;
  Comment: string = null;
}

export class Arrear {
  ArrearId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  DOJ: Date = new Date();
  TotalArrearAmount: number = 0;
  Reason: string = null;
}

export class PTOverRide {
  PTOverRideId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  GrossSalary: number = 0;
  RegularPT: number = 0;
  PTOverRideAmount: number = 0;
  PTOverRideMonth: number = 0;
  Comment: string = null;
}

export class ESIOverRide {
  ESIOverRideId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  GrossSalary: number = 0;
  ESIEmployee: number = 0;
  EmployeeOverride: number = 0;
  ESIEmployer: number = 0;
  EmployerOverride: number = 0;
  OverRideMonth: number = 0;
  Comment: string = null;
}

export class TDSOverRide {
  TDSOverRideId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  GrossSalary: number = 0;
  RegularTDS: number = 0;
  TDSOverRideAmount: number = 0;
  TDSOverRideMonth: number = 0;
  Comment: string = null;
}

export class LWFOverRide {
  LWFOverRideId: number = 1;
  EmployeeName: string = 'Sarfaraz Nawaz';
  GrossSalary: number = 0;
  LWFEmployee: number = 0;
  EmployeeOverride: number = 0;
  LWFEmployer: number = 0;
  EmployerOverride: number = 0;
  OverRideMonth: number = 0;
  Comment: string = null;
}

export class RunPayroll {
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
