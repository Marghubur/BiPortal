import { Component, OnInit } from '@angular/core';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { SalaryDeclarationHttpService } from 'src/providers/AjaxServices/salary-declaration-http.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminIncomeTax, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  EmployeeId: number = 0;
  isReady: boolean = false;
  isPageReady: boolean = false;
  paySlipDate: any = null;
  basePath: string = "";
  viewer: any = null;
  fileDetail: any = null;
  isLoading: boolean = false;
  payslipYear: Array<number> =[];
  payslipschedule: Array<any> = [];
  isFileFound: boolean = false;
  userDetail: any = null;
  isJoinInCurrentMonth: boolean = false;

  constructor(private nav: iNavigation,
              private local: ApplicationStorage,
              private user: UserService,
              private http: CoreHttpService,
              private salaryHttp: SalaryDeclarationHttpService) { }

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
    this.userDetail = this.user.getInstance();
    this.initData();
  }

  initData() {
    let empid = this.local.getByKey("EmployeeId");
    if (empid)
      this.EmployeeId = empid;
    else
      this.EmployeeId = this.userDetail.UserId;
    this.getPayslipList();
  }

  pageReload() {
    this.initData();
  }

  getPayslipList() {
    this.isPageReady= false;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      this.payslipschedule = [];
      this.payslipYear = [];
      this.isJoinInCurrentMonth = false;;
      this.salaryHttp.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`).then(res => {
        if (res.ResponseBody) {
          this.userDetail = res.ResponseBody.userDetail;
          this.userDetail.UserId = this.userDetail.EmployeeId;
          let joiningDate = new Date(this.userDetail.CreatedOn);
          let data = res.ResponseBody.completeSalaryBreakup
          this.payslipYear.push(data.FinancialStartYear);
          // if (joiningDate.getFullYear() != new Date().getFullYear())
          //   this.payslipYear.push(this.currentYear-1);
          let date = new Date();
          if (joiningDate.getMonth() == date.getMonth() && joiningDate.getFullYear() == date.getFullYear()) {
            WarningToast("Joining month of the employee is current month");
            this.isJoinInCurrentMonth = true;
            this.isPageReady= true;
            return;
          }
          if (date.getFullYear() != data.FinancialStartYear)
            this.payslipYear.push(data.FinancialStartYear+1);

          let annulSalaryBreakup = JSON.parse(data.CompleteSalaryDetail);
          if (annulSalaryBreakup.length > 0) {
            for (let i = 0; i < annulSalaryBreakup.length; i++) {
              if (annulSalaryBreakup[i].IsActive && annulSalaryBreakup[i].IsPayrollExecutedForThisMonth) {
                let date = new Date(annulSalaryBreakup[i].PresentMonthDate);
                this.payslipschedule.push({
                  paySlipMonth: new Date(date.getFullYear(), date.getMonth(), 1), // result: Aug
                  paySlipYear: Number(date.getFullYear()),
                });
              }
            }
            this.changeYear(date.getFullYear());
          }
          this.isPageReady= true;
        }
      }).catch(e => {
        this.isPageReady = true;
      })
    }
  }

  changeYear(item: number) {
    this.closePdfViewer();
    this.paySlipSchedule = this.payslipschedule.filter(x => x.paySlipYear == Number(item));
    this.isReady = false;
    this.isLoading = false;
    this.isFileFound = false;
  }

  showFile(userFile: any) {
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.pdf`;
    this.viewer = document.getElementById("file-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "PaySlips":
        break;
      case "IncomeTax":
        this.nav.navigateRoot(AdminIncomeTax, this.cachedData);
        break;
    }
  }

  getPaySlip(e: any, year: number, event: any) {
    let date = e;
    this.isLoading = true;
    this.paySlipDate = null;
    var elem = document.querySelectorAll('a[data-name="payslipmonth"]');
    if (elem.length > 0) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-payslip-month');
      }
      event.target.classList.add('active-payslip-month')
    }
    if (this.EmployeeId > 0) {
      let value = {
        Year: year,
        Month: date.getMonth() +1,
        EmployeeId: this.EmployeeId
      }
      this.http.post("FileMaker/GeneratePayslip", value).then(res => {
        if (res.ResponseBody) {
          this.paySlipDate = {
            Month: new Date(year, e.getMonth(), 1).toLocaleString("en-us", { month: 'long'}),
            Year: e.getFullYear()
          };
          this.fileDetail = res.ResponseBody.FileDetail;
          this.showFile(this.fileDetail);
          this.isReady = true;
          this.isLoading = false;
          Toast("Payslip found");
        }
      }).catch(e => {
        ErrorToast(e.error.HttpStatusMessage);
        this.isFileFound = false;
        this.isReady = true;
        this.isLoading = false;
      })
    }
  }

  closePdfViewer() {
    event.stopPropagation();
    this.paySlipDate = null;
    if (this.viewer != null) {
      this.viewer.classList.add('d-none');
      this.viewer.querySelector('iframe').setAttribute('src', '');
    }
  }

  downloadPdf() {
    if (this.fileDetail) {
      let fileLocation = `${this.basePath}${this.fileDetail.FilePath}/${this.fileDetail.FileName}.pdf`;
      let link = document.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute('type', 'hidden');
      link.href = fileLocation;
      link.download = `${this.fileDetail.FileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }
}
