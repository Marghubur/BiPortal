import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminIncomeTax, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-payslip',
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  currentYear: number = 0;
  EmployeeId: number = 0;
  isReady: boolean = false;
  isPageReady: boolean = false;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  paySlipDate: any = null;
  SectionIsReady: boolean = false;
  isEmployeeSelect: boolean = false;
  basePath: string = "";
  viewer: any = null;
  fileDetail: any = null;
  isLoading: boolean = false;
  payslipYear: Array<number> =[];
  payslipschedule: Array<any> = [];
  isFileFound: boolean = false;

  constructor(private nav: iNavigation,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.basePath = this.http.GetImageBasePath();
    this.loadData();
    this.EmployeeId = this.local.getByKey("EmployeeId");
  }

  getPayslipList(e: any) {
    this.isEmployeeSelect = true;
    this.SectionIsReady= false;
    this.EmployeeId = e;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      let employee = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
      let joiningDate = new Date(employee.CreatedOn);
      this.payslipYear.push(this.currentYear);
      if (joiningDate.getFullYear() != this.currentYear)
        this.payslipYear.push(this.currentYear-1);

      this.isEmployeeSelect = false;
      this.SectionIsReady= true;
      if (joiningDate.getMonth() == new Date().getMonth() && joiningDate.getFullYear() == new Date().getFullYear()) {
        WarningToast("Joining month of the employee is current month");
        return;
      }

      this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`).then(res => {
        if (res.ResponseBody) {
          let annulSalaryBreakup = JSON.parse(res.ResponseBody.CompleteSalaryDetail);
          if (annulSalaryBreakup.length > 0) {
            for (let i = 0; i < annulSalaryBreakup.length; i++) {
              if (annulSalaryBreakup[i].IsActive && annulSalaryBreakup[i].IsPayrollExecutedForThisMonth) {
                let date = new Date(annulSalaryBreakup[i].MonthFirstDate);
                this.payslipschedule.push({
                  paySlipMonth: new Date(date.getFullYear(), date.getMonth(), 1), // result: Aug
                  paySlipYear: Number(date.getFullYear()),
                });
              }
            }
            this.changeYear(this.currentYear);
          }
        }
        this.SectionIsReady= true;
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

  loadData() {
    this.isPageReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.placeholder = "Employee";
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";
        this.isPageReady = true;
        this.getPayslipList(this.EmployeeId);
      }
    });
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
