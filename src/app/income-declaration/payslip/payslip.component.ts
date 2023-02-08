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
  joiningDate: Date = null;
  paySlipDate: any = null;
  SectionIsReady: boolean = false;
  isEmployeeSelect: boolean = false;
  basePath: string = "";
  viewer: any = null;
  fileDetail: any = null;
  isLoading: boolean = true;

  constructor(private nav: iNavigation,
    private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.basePath = this.http.GetImageBasePath();
    this.EmployeeId = this.local.getByKey("EmployeeId");
    this.loadData();
  }

  getPayslipList(e: any) {
    this.isEmployeeSelect = true;
    this.SectionIsReady= false;
    this.EmployeeId = e;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      let employee = this.applicationData.Employees.find(x => x.EmployeeUid == this.EmployeeId);
      this.joiningDate = new Date(employee.CreatedOn);
      this.isEmployeeSelect = false;
      this.SectionIsReady= true;
      if (this.joiningDate.getMonth() == new Date().getMonth() && this.joiningDate.getFullYear() == new Date().getFullYear()) {
        WarningToast("Joining month of the employee is current month");
        return;
      }
      if (this.joiningDate.getFullYear() == this.currentYear)
        this.allPaySlip(this.joiningDate.getFullYear());
      else
        this.allPaySlip(this.currentYear);
    }
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
        let employees = this.applicationData.Employees;
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

  allPaySlip(e: any) {
    this.closePdfViewer();
    let yearValue = Number (e);
    var date = new Date();
    let years = date.getFullYear() - 1;
    if (yearValue == new Date().getFullYear()) {
      this.paySlipSchedule = [];
      this.payslip();
    } else if(this.joiningDate.getFullYear() == years) {
      this.paySlipSchedule = [];
      let mnth= 12;
      let i =0;
      if (this.joiningDate.getFullYear() == years)
        i = this.joiningDate.getMonth();
      while (i < 12) {
        if (mnth == 1) {
          mnth = 12;
        } else {
          mnth --;
        }
        this.paySlipSchedule.push({
          paySlipMonth: new Date(years, mnth, 1),  //.toLocaleString("en-us", { month: 'short'}),
          paySlipYear: years
        })
        i++;
      }
    }
  }

  payslip() {
    var date = new Date();
    let mnth= date.getMonth()+1;
    let years = date.getFullYear();
    let i =0;
    if (this.joiningDate.getFullYear() == this.currentYear)
      i = this.joiningDate.getMonth();
    while (i < date.getMonth()) {
      if (mnth == 1) {
        mnth = 0;
        //years --
      } else {
        mnth --;
      }
      this.paySlipSchedule.push({
        paySlipMonth: new Date(years, mnth, 1),    //.toLocaleString("en-us", { month: 'short'}),
        paySlipYear: years
      })
      i++;
    }
  }

  getPaySlip(e: any, year: number) {
    let date = e;
    this.isLoading = true;
    this.paySlipDate = null;
    this.paySlipDate = {
      Month: new Date(year, e.getMonth(), 1).toLocaleString("en-us", { month: 'long'}),
      Year: e.getFullYear()
    };
    if (this.EmployeeId > 0) {
      let value = {
        Year: year,
        Month: date.getMonth() +1,
        EmployeeId: this.EmployeeId
      }
      this.http.post("FileMaker/GeneratePayslip", value).then(res => {
        if (res.ResponseBody) {
          this.fileDetail = res.ResponseBody.FileDetail;
          this.isReady = true;
          this.isLoading = false;
          this.showFile(this.fileDetail);
          Toast("Payslip found");
        }
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
    // The data for the PDF file
    const data = this.fileDetail.FileName;
    // Create a Blob object containing the PDF data
    const blob = new Blob([data], { type: 'application/pdf' });

    // Create an object URL for the Blob
    const objectUrl = URL.createObjectURL(blob);

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = this.fileDetail.FileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    URL.revokeObjectURL(objectUrl);
    a.remove();
  }
}
