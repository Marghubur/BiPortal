import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { Declaration, IncomeTax, Preferences, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent implements OnInit {
  cachedData: any = null;
  paySlipSchedule: Array<any> = [];
  currentYear: number = 0;
  EmployeeId: number = 0;
  isReady: boolean = false;
  joiningDate: Date = null;
  paySlipDate: any = null;
  SectionIsReady: boolean = false;
  userDetail: UserDetail = new UserDetail();
  basePath: string = "";
  viewer: any = null;
  fileDetail: any = null;
  isLoading: boolean = false;
  payslipYear: Array<number> =[];

  constructor(private nav: iNavigation,
              private user: UserService,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.basePath = this.http.GetImageBasePath();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.EmployeeId = this.userDetail.UserId;
    this.loadData();
  }

  loadData() {
    this.SectionIsReady= false;
    if (this.EmployeeId > 0) {
      this.paySlipSchedule = [];
      this.joiningDate = new Date(this.userDetail.CreatedOn);
      this.payslipYear.push(this.currentYear);
      if (this.joiningDate.getFullYear() != this.currentYear)
        this.payslipYear.push(this.currentYear-1)
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
    let mnth= date.getMonth();
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

  getPaySlip(e: any, year: number, event: any) {
    let date = e;
    this.isLoading = true;
    this.paySlipDate = null;
    this.paySlipDate = {
      Month: new Date(year, e.getMonth(), 1).toLocaleString("en-us", { month: 'long'}),
      Year: e.getFullYear()
    };
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
          this.fileDetail = res.ResponseBody.FileDetail;
          this.showFile(this.fileDetail);
          this.isReady = true;
          this.isLoading = false;
          Toast("Payslip found");
        }
      }).catch(e => {
        this.isReady = true;
        this.isLoading = false;
      })
    }
  }

  closePdfViewer() {
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

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(Preferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(Salary, this.cachedData);
        break;
      case "PaySlips":
        break;
      case "IncomeTax":
        this.nav.navigateRoot(IncomeTax, this.cachedData);
        break;
    }
  }
}
