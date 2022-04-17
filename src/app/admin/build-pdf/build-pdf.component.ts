import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddNumbers, CommonService, ErrorToast, Toast, ToFixed } from 'src/providers/common-service/common.service';
import { EmployeeDetail } from '../manageemployee/manageemployee.component';
import { ResponseModel } from 'src/auth/jwtService';
import { iNavigation } from 'src/providers/iNavigation';
import { DateFormatter } from 'src/providers/DateFormatter';
import { Attendance, BillDetail, UserType } from 'src/providers/constants';

declare var $: any;

@Component({
  selector: 'app-build-pdf',
  templateUrl: './build-pdf.component.html',
  styleUrls: ['./build-pdf.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: DateFormatter }]
})
export class BuildPdfComponent implements OnInit {
  model: NgbDateStruct;
  selectedDate: any = null;
  submitted: boolean = false;
  pdfForm: FormGroup = null;
  pdfModal: PdfModal = null;
  employees: Array<EmployeeDetail> = [];
  grandTotalAmount: number = 0;
  packageAmount: number = 0;
  isDeveloperSelected: boolean = false;
  cgstAmount: number = 0;
  sgstAmount: number = 0;
  igstAmount: number = 0;
  months: Array<any> = null;
  applicationData: ApplicationData = new ApplicationData();
  currentOrganization: any = null;
  days: Array<number> = [];
  currentEmployee: EmployeeDetail = null;
  isLoading: boolean = false;
  assignedClients: Array<any> = [];
  clientDetail: any = null;
  isClientSelected: boolean = false;
  pageDataIsReady: boolean = false;
  originalBillingMonth: number = 1;
  isCustome: boolean = false;
  editMode: boolean = false;
  isHalfDay: boolean = false;
  halfDayDisable: boolean = false;
  downLoadFileExtension: string = ".pdf";
  FileDetail: any = "";
  downloadFileLink: string = "";
  downlodFilePath: string = "";
  basePath: string = "";
  viewer: any = null;
  missingAttendence: boolean = false;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private calendar: NgbCalendar,
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    this.editMode = false;
    this.basePath = this.http.GetImageBasePath();
    //----- edit mode -----
    if (data) {
      this.editMode = true;
      this.model = this.calendar.getToday();
      this.initMonths();
      this.editBillDetail(data);
    } else {
      this.getNewForm();
    }
  }

  getNewForm() {
    this.initMonths();
    this.model = this.calendar.getToday();
    this.pdfModal = new PdfModal();
    this.pdfModal.billNo = "";
    this.pdfModal.workingDay = this.daysInMonth((new Date()).getMonth() + 1);
    this.pdfModal.actualDaysBurned = this.pdfModal.workingDay;
    this.originalBillingMonth = this.model.month;
    this.manageBillDates();
    this.employees = [];
    this.loadPageLevelData();
    this.generateDaysCount();
  }

  manageBillDates() {
    let items = this.months.filter(x => x.sno === this.model.month);
    if (items.length > 0) {
      this.selectedDate = items[0];
      this.pdfModal.billingMonth = new Date(this.model.year, this.originalBillingMonth - 1, 1)
    }

    var now = new Date(this.model.year, this.originalBillingMonth - 1, 1);
    this.pdfModal.billForMonth = (now).toLocaleString('default', { month: 'long' });
  }

  generateDaysCount() {
    this.days = [];
    let i = 0;
    while (i < this.pdfModal.workingDay) {
      this.days.push(i + 1);
      i++;
    }
  }

  getAttendance() {
    this.missingAttendence = false;
    let attendenceFor = {
      "EmployeeUid": this.currentEmployee.EmployeeUid,
      "UserTypeId": UserType.Employee,
      "ForMonth": this.originalBillingMonth,
      "ForYear": this.model.year
    }
    this.http.post("Attendance/GetAttendamceById", attendenceFor).then ((response: ResponseModel) => {
      if (response.ResponseBody) {
        let missinngAtt = response.ResponseBody.MissingDate;
        let attendanceDetail = response.ResponseBody.AttendanceDetail;
        if (missinngAtt.length > 0 && attendanceDetail.length == 0)
          this.missingAttendence = true;
        else
          this.missingAttendence = false;
      }

    })
  }

  editBillDetail(billDetail: any) {
    // "EditEmployeeBillDetail" => post
    let FileId = Number(billDetail.FileUid);
    if (isNaN(FileId)) {
      Toast("Invalid FileUid.");
      return;
    } else {
      let employeeBillDetail = {
        "EmployeeId": billDetail.FileOwnerId,
        "ClientId": billDetail.ClientId,
        "FileId": FileId
      };

      this.http.post("FileMaker/EditEmployeeBillDetail", employeeBillDetail).then((response: ResponseModel) => {
        let fileDetail: any = null;
        let editPackageAmount: number = 0;
        let editGrandTotalAmount: number = 0;
        if (response.ResponseBody) {
          this.applicationData = response.ResponseBody as ApplicationData;
          this.employees = this.applicationData.employees;
          let company: any = this.applicationData.clients.filter(x => x.ClientId === 1);
          this.pdfModal = new PdfModal();
          if (company.length > 0) {
            this.currentOrganization = company[0];
            this.pdfModal.senderCompanyName = this.currentOrganization.ClientName;
            this.pdfModal.senderGSTNo = this.currentOrganization.GSTNO;
            this.pdfModal.senderFirstAddress = this.currentOrganization.FirstAddress;
            this.pdfModal.senderSecondAddress = this.currentOrganization.SecondAddress + " " + this.currentOrganization.ThirdAddress;
            this.pdfModal.senderPrimaryContactNo = this.currentOrganization.PrimaryPhoneNo;
            this.pdfModal.senderEmail = this.currentOrganization.Email;
            this.pdfModal.senderClientId = this.currentOrganization.ClientId;
          }

          if (this.applicationData.fileDetail.length > 0) {
            fileDetail = this.applicationData.fileDetail[0];
            this.pdfModal.IsCustomBill = fileDetail.IsCustomBill == 0 ? false : true;
            this.isCustome = this.pdfModal.IsCustomBill;
            this.pdfModal.receiverCompanyId = fileDetail.ClientId;
            this.pdfModal.developerId = fileDetail.EmployeeUid;
            this.pdfModal.cGST = fileDetail.CGST;
            this.pdfModal.sGST = fileDetail.SGST;
            this.pdfModal.iGST = fileDetail.IGST;
            this.pdfModal.daysAbsent = fileDetail.NoOfDaysAbsent;
            this.pdfModal.isHalfDay = 0;
            this.pdfModal.workingDay = fileDetail.NoOfDays;
            this.packageAmount = fileDetail.PaidAmount;
            editPackageAmount = this.packageAmount;
            this.pdfModal.packageAmount = fileDetail.PaidAmount;

            if(this.pdfModal.daysAbsent) {
              let value = this.pdfModal.daysAbsent.toString();
              let allValue = value.split(".");
              if(allValue.length > 1) {
                let data = Number(allValue[1]);
                if(!isNaN(data) && data > 0) {
                  this.isHalfDay = true;
                  this.pdfModal.isHalfDay = 1;
                  this.pdfModal.daysAbsent = Number(allValue[0]) + 1;
                }
              }
            }

            if (this.pdfModal.cGST > 0) {
              let gst = this.pdfModal.cGST;
              this.pdfModal.cGSTAmount = this.calculateGSTAmount(gst);
              this.cgstAmount = this.pdfModal.cGSTAmount;
            }

            if (this.pdfModal.sGST > 0) {
              let gst = this.pdfModal.sGST
              this.pdfModal.sGSTAmount = this.calculateGSTAmount(gst);
              this.sgstAmount = this.pdfModal.sGSTAmount;
            }

            if (this.pdfModal.iGST > 0) {
              let gst = this.pdfModal.iGST
              this.pdfModal.iGSTAmount = this.calculateGSTAmount(gst);
              this.igstAmount = this.pdfModal.iGSTAmount;
            }

            editGrandTotalAmount = AddNumbers([this.pdfModal.packageAmount, this.pdfModal.cGSTAmount, this.pdfModal.sGSTAmount, this.pdfModal.iGSTAmount], 2)
            this.pdfModal.actualDaysBurned = (fileDetail.NoOfDays - this.pdfModal.daysAbsent);
            this.pdfModal.billNo = fileDetail.BillNo.replace("#", "");
            this.pdfModal.billId = fileDetail.BillDetailUid;
            this.pdfModal.FileId = fileDetail.FileDetailId;
            this.pdfModal.dateOfBilling = fileDetail.BillUpdatedOn;
            this.pdfModal.UpdateSeqNo = fileDetail.UpdateSeqNo;
            this.pdfModal.StatusId = fileDetail.BillStatusId;
            this.pdfModal.PaidOn = fileDetail.PaidOn;
            this.grandTotalAmount = this.pdfModal.grandTotalAmount;
          }
        } else {
          this.common.ShowToast("Not able to load page data. Please do re-login");
        }

        if (fileDetail) {
          let billingDate = new Date(fileDetail.BillUpdatedOn)
          this.model.day = billingDate.getDate();
          this.model.month = billingDate.getMonth() + 1;
          this.model.year = billingDate.getFullYear();
        }

        this.originalBillingMonth = fileDetail.BillForMonth;
        this.generateDaysCount();
        this.manageBillDates();
        this.initForm();
        this.findEmployeeById(this.pdfModal.developerId);
        this.bindClientDetail(this.pdfModal.receiverCompanyId);

        if(this.pdfModal.actualDaysBurned < this.pdfModal.workingDay)
          this.halfDayDisable = true;

        if(this.editMode && editPackageAmount > 0) {
          this.packageAmount = editPackageAmount;
          this.grandTotalAmount = editGrandTotalAmount;
        }

        this.pageDataIsReady = true;
      });
    }
  }

  loadPageLevelData() {
    this.http.get("OnlineDocument/LoadApplicationData").then((response: ResponseModel) => {
      if (response.ResponseBody !== null) {
        this.applicationData = response.ResponseBody as ApplicationData;
        this.employees = this.applicationData.employees;
        let company: any = this.applicationData.clients.filter(x => x.ClientId === 1);
        if (company.length > 0) {
          this.currentOrganization = company[0];
          this.pdfModal.senderCompanyName = this.currentOrganization.ClientName;
          this.pdfModal.senderGSTNo = this.currentOrganization.GSTNO;
          this.pdfModal.senderFirstAddress = this.currentOrganization.FirstAddress;
          this.pdfModal.senderSecondAddress = this.currentOrganization.SecondAddress + " " + this.currentOrganization.ThirdAddress;
          this.pdfModal.senderPrimaryContactNo = this.currentOrganization.PrimaryPhoneNo;
          this.pdfModal.senderEmail = this.currentOrganization.Email;
          this.pdfModal.senderClientId = this.currentOrganization.ClientId;
          this.pdfModal.receiverCompanyId = 0;
          this.pdfModal.developerId = 0;
          this.pdfModal.StatusId = 2;
          this.pdfModal.PaidOn = null;
        }
      } else {
        ErrorToast("Not able to load page data. Please do re-login");
      }

      this.initForm();
      this.pageDataIsReady = true;
    });
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.pdfForm.controls["dateOfBilling"].setValue(date);
  }

  initMonths() {
    this.months = [
      { "sno": 1, "name": "January", "days": this.daysInMonth(1) },
      { "sno": 2, "name": "February", "days": this.daysInMonth(2) },
      { "sno": 3, "name": "March", "days": this.daysInMonth(3) },
      { "sno": 4, "name": "April", "days": this.daysInMonth(4) },
      { "sno": 5, "name": "May", "days": this.daysInMonth(5) },
      { "sno": 6, "name": "June", "days": this.daysInMonth(6) },
      { "sno": 7, "name": "July", "days": this.daysInMonth(7) },
      { "sno": 8, "name": "August", "days": this.daysInMonth(8) },
      { "sno": 9, "name": "September", "days": this.daysInMonth(9) },
      { "sno": 10, "name": "Octuber", "days": this.daysInMonth(10) },
      { "sno": 11, "name": "November", "days": this.daysInMonth(11) },
      { "sno": 12, "name": "December", "days": this.daysInMonth(12) }
    ];
  }

  daysInMonth(monthNumber: number) {
    var now = new Date();
    return new Date(now.getFullYear(), monthNumber, 0).getDate();
  }

  checkGST(e: any) {
    if ((e.which >= 48 && e.which <= 57) || e.key == ".") {
      document.getElementById("cgst").classList.remove('error');
      document.getElementById("sgst").classList.remove('error');
      document.getElementById("igst").classList.remove('error');
    } else if (e.which !== 8 && e.which !== 46 && e.which !== 37 && e.which !== 39) {
      e.preventDefault();
    }
  }

  checkCGST(e: any) {
    if (e.target.value !== "") {
      let gst = parseFloat(e.target.value);
      this.cgstAmount = this.calculateGSTAmount(gst);
    } else {
      this.cgstAmount = 0;
    }
    this.calculateGrandTotal();
  }

  checkSGST(e: any) {
    if (e.target.value !== "") {
      let gst = parseFloat(e.target.value);
      this.sgstAmount = this.calculateGSTAmount(gst);
    } else {
      this.sgstAmount = 0;
    }
    this.calculateGrandTotal();
  }

  checkIGST(e: any) {
    if (e.target.value !== "") {
      let gst = parseFloat(e.target.value);
      this.igstAmount = this.calculateGSTAmount(gst);
    } else {
      this.igstAmount = 0;
    }
    this.calculateGrandTotal();
  }

  calculateGSTAmount(value: number) {
    let amount: number = 0.0;
    if (value > 0) {
      amount = ToFixed((this.packageAmount * value) / 100, 2);

    } else {
      amount = 0;
    }
    return amount;
  }

  calculateGrandTotal() {
    this.grandTotalAmount = AddNumbers([this.packageAmount, this.cgstAmount, this.sgstAmount, this.igstAmount], 2);
    this.pdfForm.controls["grandTotalAmount"].setValue(this.grandTotalAmount);
  }

  calculateSpecificDays(e: any) {
    if (e.target.value !== "") {
      let items: any = this.months.filter(x => x.name === e.target.value);
      if (items.length > 0) {
        this.selectedDate = items[0];
        this.originalBillingMonth = this.selectedDate.sno;
        this.pdfModal.actualDaysBurned = this.selectedDate.days;
        this.pdfModal.workingDay = this.selectedDate.days;
        this.pdfForm.get("workingDay").setValue(this.selectedDate.days);
        this.getAttendance();
        this.generateDaysCount();
        this._calculateAmount(this.pdfModal.actualDaysBurned);
      }
    }
  }

  validateInput($e: any) {
    if ($e.target.value !== "") {
      let e: any = event;
      e.target.classList.remove('error')
    }
  }

  calculateAmount(e: any) {
    this.halfDayDisable = false;
    let workinDays = e.target.value;
    if (workinDays < this.pdfModal.workingDay)
      this.halfDayDisable = true;
    if (workinDays !== null) {
      if(this.pdfForm.get('isHalfDay').value == "1") {
        let days = Number(workinDays);
        if(!isNaN(days)) {
          this.pdfForm.get('actualDaysBurned').setValue(days + 0.5);
        } else {
          Toast("Invalid.")
        }
      }
      this._calculateAmount(Number(workinDays));
    } else {
      this.common.ShowToast("Total working days is selected null.")
    }
  }

  calculateHalfDayExtraAmount(e: any) {
    let days: number = 0;
    let workinDays = this.pdfForm.get('actualDaysBurned').value;
    this.isHalfDay = false;
    if (workinDays && workinDays !== "") {
      days = Number(workinDays);
      if(isNaN(days)) {
        Toast("Invalid amount calculated.")
        return;
      }
      if(e.target.value == "1") {
        this.isHalfDay = true;
      }
      this._calculateAmount(days);
    } else {
      this.common.ShowToast("Total working days is selected null.")
    }
  }

  _calculateAmount(days: number) {
    let totalMonthDays = this.pdfModal.workingDay
    this.packageAmount = this.clientDetail.ActualPackage;
    let halfDayValue = this.isHalfDay ? 0.5 : 0;
    let burndays = days + halfDayValue;
    if (totalMonthDays !== days || this.isHalfDay)
      this.packageAmount = this.packageAmount / totalMonthDays * (burndays);

    this.packageAmount = ToFixed(this.packageAmount, 2);
    let cgst = this.pdfForm.controls["cGST"].value;
    this.cgstAmount = ToFixed(((this.packageAmount * Number(cgst)) / 100), 2);

    let sgst = this.pdfForm.controls["sGST"].value;
    this.sgstAmount = ToFixed(((this.packageAmount * Number(sgst)) / 100), 2);

    let igst = this.pdfForm.controls["iGST"].value;
    this.igstAmount = ToFixed(((this.packageAmount * Number(igst)) / 100), 2);

    this.grandTotalAmount = AddNumbers([this.packageAmount, this.cgstAmount, this.sgstAmount, this.igstAmount], 2);
    this.grandTotalAmount = ToFixed(this.grandTotalAmount, 2);

    this.pdfForm.get("actualDaysBurned").setValue(days);
    this.pdfForm.controls["grandTotalAmount"].setValue(this.grandTotalAmount);
    this.pdfForm.controls["packageAmount"].setValue(this.packageAmount);
  }

  get f() {
    let data = this.pdfForm.controls;
    return data;
  }

  initForm() {
    this.pdfForm = this.fb.group({
      header: new FormControl(this.pdfModal.header, [Validators.required]),
      billForMonth: new FormControl(this.pdfModal.billForMonth, [Validators.required]),
      billNo: new FormControl(this.pdfModal.billNo),
      cGST: new FormControl(this.pdfModal.cGST),
      sGST: new FormControl(this.pdfModal.sGST),
      iGST: new FormControl(this.pdfModal.iGST),
      cGstAmount: new FormControl(this.pdfModal.cGSTAmount),
      sGstAmount: new FormControl(this.pdfModal.sGSTAmount),
      igstAmount: new FormControl(this.pdfModal.iGSTAmount),
      workingDay: new FormControl(this.pdfModal.workingDay),
      isHalfDay: new FormControl(this.pdfModal.isHalfDay),
      actualDaysBurned: new FormControl(this.pdfModal.actualDaysBurned),
      packageAmount: new FormControl(this.pdfModal.packageAmount, [Validators.required]),
      grandTotalAmount: new FormControl(this.pdfModal.grandTotalAmount),
      senderCompanyName: new FormControl(this.pdfModal.senderCompanyName, [Validators.required]),
      receiverCompanyId: new FormControl(this.pdfModal.receiverCompanyId, [Validators.required]),
      senderClientId: new FormControl(this.pdfModal.senderClientId, [Validators.required]),
      receiverFirstAddress: new FormControl(this.pdfModal.receiverFirstAddress, [Validators.required]),
      receiverCompanyName: new FormControl(this.pdfModal.receiverCompanyName, [Validators.required]),
      receiverGSTNo: new FormControl(this.pdfModal.receiverGSTNo, [Validators.required]),
      receiverSecondAddress: new FormControl(this.pdfModal.receiverSecondAddress, [Validators.required]),
      receiverThirdAddress: new FormControl(this.pdfModal.receiverThirdAddress, [Validators.required]),
      receiverPincode: new FormControl(this.pdfModal.receiverPincode, [Validators.required]),
      receiverPrimaryContactNo: new FormControl(this.pdfModal.receiverPrimaryContactNo, [Validators.required]),
      ClientId: new FormControl(this.pdfModal.ClientId),
      receiverEmail: new FormControl(this.pdfModal.receiverEmail, [Validators.required]),
      developerName: new FormControl(this.pdfModal.developerName, [Validators.required]),
      developerId: new FormControl(this.pdfModal.developerId),
      dateOfBilling: new FormControl(this.pdfModal.dateOfBilling, [Validators.required]),
      billingMonth: new FormControl(new Date(this.model.year, this.originalBillingMonth - 1, 1)),
      senderFirstAddress: new FormControl(this.pdfModal.senderFirstAddress, [Validators.required]),
      senderSecondAddress: new FormControl(this.pdfModal.senderSecondAddress, [Validators.required]),
      senderThirdAddress: new FormControl(this.pdfModal.senderThirdAddress),
      senderGSTNo: new FormControl(this.pdfModal.senderGSTNo, [Validators.required]),
      senderPrimaryContactNo: new FormControl(this.pdfModal.senderPrimaryContactNo, [Validators.required]),
      senderEmail: new FormControl(this.pdfModal.senderEmail, [Validators.required]),
      daysAbsent: new FormControl(this.pdfModal.daysAbsent, [Validators.required]),
      EmployeeId: new FormControl(this.pdfModal.EmployeeId),
      billId: new FormControl(this.pdfModal.billId),
      FileId: new FormControl(this.pdfModal.FileId),
      StatusId: new FormControl(this.pdfModal.StatusId),
      PaidOn: new FormControl(this.pdfModal.PaidOn),
      UpdateSeqNo: new FormControl(this.pdfModal.UpdateSeqNo),
      IsCustomBill: new FormControl(this.pdfModal.IsCustomBill),
    });
  }

  findEmployee(e: any) {
    this.findEmployeeById(e.target.value);
  }

  findEmployeeById(employeeId: any) {
    this.isClientSelected = false;
    if (employeeId) {
      this.currentEmployee = this.employees.find(x => x.EmployeeUid === parseInt(employeeId));
      if (this.currentEmployee) {
        this.assignedClients = this.applicationData.allocatedClients.filter(x => x.EmployeeUid == this.currentEmployee.EmployeeUid);
        this.pdfForm.controls["developerName"].setValue(this.currentEmployee.FirstName + " " + this.currentEmployee.LastName);
        if (!this.editMode) {
          this.pdfForm.controls["packageAmount"].setValue(this.currentEmployee.FinalPackage);
          this.pdfForm.controls["grandTotalAmount"].setValue(this.currentEmployee.FinalPackage);
          this.grandTotalAmount = this.currentEmployee.FinalPackage;
        }
        this.pdfForm.controls["EmployeeId"].setValue(this.currentEmployee.EmployeeUid);
        this.isDeveloperSelected = true;
        this.packageAmount = this.currentEmployee.FinalPackage;
      }
    } else {
      this.isDeveloperSelected = false;
      this.grandTotalAmount = 0;
      this.pdfForm.controls["grandTotalAmount"].setValue(0);
      this.pdfForm.controls["packageAmount"].setValue(0);
      this.pdfForm.controls["cGST"].setValue(0);
      this.pdfForm.controls["sGST"].setValue(0);
      this.pdfForm.controls["iGST"].setValue(0);
    }
  }

  reset() {
    this.pdfForm.reset();
    this.initForm();
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  generate() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.pdfForm.get('billForMonth').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('packageAmount').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderCompanyName').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('developerName').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('dateOfBilling').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderFirstAddress').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderSecondAddress').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderGSTNo').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderPrimaryContactNo').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('senderEmail').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('receiverFirstAddress').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('receiverCompanyName').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('receiverGSTNo').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('receiverSecondAddress').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('receiverPrimaryContactNo').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('EmployeeId').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('workingDay').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('actualDaysBurned').errors !== null)
      errroCounter++;

    var worksDays = Number(this.pdfForm.get('workingDay').value);
    var burnDays = this.pdfForm.get('actualDaysBurned').value;

    if (isNaN(worksDays)) {
      Toast("Invalid No of days");
    }
    if (isNaN(burnDays)) {
      Toast("Invalid Total working days");
    }

    this.pdfForm.get('cGstAmount').setValue(this.cgstAmount);
    this.pdfForm.get('sGstAmount').setValue(this.sgstAmount);
    this.pdfForm.get('igstAmount').setValue(this.igstAmount);
    this.pdfForm.get('grandTotalAmount').setValue(this.grandTotalAmount);
    this.pdfForm.get("billingMonth").setValue(new Date(this.model.year, this.originalBillingMonth - 1, 1));

    if (errroCounter === 0) {
      this.pdfForm.get("daysAbsent").setValue(worksDays - burnDays);
      let request: PdfModal = this.pdfForm.value;
      if(this.isHalfDay) {
        request.daysAbsent = Number(worksDays - burnDays) - 0.5;
      }

      let modalStatus = this.validateBillRequest(request);
      if(modalStatus == null) {
        this.http.post("FileMaker/GenerateBill", request).then((response: ResponseModel) => {
          if(response.ResponseBody) {
            this.downloadFile(response.ResponseBody);
            $('#viewFileModal').modal('show');
            Toast("Bill pdf generated successfully");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
          if(e.error && e.error.ResponseBody) {
            ErrorToast(e.error.ResponseBody.UserMessage);
          }
        });
      } else {
        this.isLoading = false;
        ErrorToast(modalStatus);
      }
    } else {
      this.isLoading = false;
      ErrorToast("Please fill all mandatory fields");
    }
  }

  validateBillRequest(request: PdfModal) {
    let message = null;
    let now = new Date();
    if(request.EmployeeId <=0){
      message = "Invalid Employee selected";
      return message;
    }

    if (request.senderClientId <=0) {
      message = "Invalid Sender selected"
      return message;
    }

    if(request.ClientId <= 0) {
      message = "Invalid client seleted.";
      return message;
    }

    if (request.billForMonth) {
      let value = new Date(`${request.billForMonth} 01, ${now.getFullYear()}`).getMonth();
      if (value < 0) {
        message = "Invalid month selected";
        return message;
      }
    }

    if (request.workingDay && !this.isCustome) {
      let value = new Date(`${request.billForMonth} 01, ${now.getFullYear()}`);
      let days = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
      if (days < request.workingDay) {
       return message = "Invalid No of days selected for the month" + ` ${request.billForMonth}`
      }
    }

    if (request.dateOfBilling) {
      var date = new Date(request.dateOfBilling);
      var value = date instanceof Date && !isNaN(date.valueOf());
      if (value == false) {
        return message = "Invalid Date of Billing";
      }
    }

    if (request.actualDaysBurned > request.workingDay || request.actualDaysBurned == 0){
      return message = "Invalid Actual days selected";
    }

    if (request.packageAmount <= 0)
      return message = "Invalid Package amount";

    if (request.cGST < 0)
      return message = "Invalid CGST";

    if (request.sGST < 0)
      return message = "Invalid SGST";

    if (request.iGST < 0)
      return message = "Invalid IGST";

    if (request.sGSTAmount < 0)
      return message = "Invalid SGST Amount";

    if (request.cGSTAmount < 0)
      return message = "Invalid CGST Amount";

    if (request.iGSTAmount < 0)
      return message = "Invalid IGST Amount";

    if (request.grandTotalAmount <=0)
      return message = "Invalid Total Amount";
  }

  replaceWithOriginalValues() {

  }

  findSenderClientDetail(e: any) {
    let Id = e.target.value;
    if (Id !== null) {
      let clientId: number = Number(Id);
      let clients = this.applicationData.clients.find(x => x.ClientId === clientId);
      if (clients.length > 0) {
        let client = clients[0];
        let lastAddress = '';
        if (client.ThirdAddress === null || client.ThirdAddress === "") {
          lastAddress = "Pin: " + client.Pincode;
        } else {
          lastAddress = client.ThirdAddress + "  Pin: " + client.Pincode;
        }
        this.pdfForm.get('senderFirstAddress').setValue(client.FirstAddress);
        this.pdfForm.get('senderCompanyName').setValue(client.ClientName);
        this.pdfForm.get('senderGSTNo').setValue(client.GSTNO);
        this.pdfForm.get('senderSecondAddress').setValue(client.SecondAddress + " " + lastAddress);
        this.pdfForm.get('senderThirdAddress').setValue(lastAddress);
        this.pdfForm.get('senderPrimaryContactNo').setValue(client.PrimaryPhoneNo);
        this.pdfForm.get('senderEmail').setValue(client.Email);
      }
    }
  }

  findReceiverClientDetail(e: any) {
    this.bindClientDetail(e.target.value);
  }

  bindClientDetail(Id: any) {
    this.isClientSelected = false;
    if (Id !== null) {
      let clientId: number = Number(Id);
      let client = this.applicationData.clients.find(x => x.ClientId === clientId);
      this.clientDetail = this.applicationData.allocatedClients.find(x => x.ClientUid === clientId && x.EmployeeUid == this.currentEmployee.EmployeeUid);
      if (client && this.clientDetail) {
        let lastAddress = '';
        if (client.ThirdAddress === null || client.ThirdAddress === "") {
          lastAddress = "Pin: " + client.Pincode;
        } else {
          lastAddress = client.ThirdAddress + "  Pin: " + client.Pincode;
        }
        this.pdfForm.get('receiverFirstAddress').setValue(client.FirstAddress);
        this.pdfForm.get('receiverCompanyName').setValue(client.ClientName);
        this.pdfForm.get('receiverGSTNo').setValue(client.GSTNO);
        this.pdfForm.get('receiverSecondAddress').setValue(client.SecondAddress + " " + lastAddress);
        this.pdfForm.get('receiverThirdAddress').setValue(lastAddress);
        this.pdfForm.get('receiverPrimaryContactNo').setValue(client.PrimaryPhoneNo);
        this.pdfForm.get('receiverEmail').setValue(client.Email);
        this.pdfForm.get('ClientId').setValue(client.ClientId);
        this.grandTotalAmount = this.clientDetail.ActualPackage;

        if (!this.editMode) {
          this.packageAmount = this.clientDetail.ActualPackage;
          this.pdfForm.get('packageAmount').setValue(this.clientDetail.ActualPackage);
          this.pdfForm.get('grandTotalAmount').setValue(this.clientDetail.ActualPackage);
        }

        this.getAttendance();

        this.isClientSelected = true;
      }
    }
  }

  changeWorkingDays(e: any) {
    let value = e.target.value;
    if (value) {
      this.pdfModal.actualDaysBurned = Number(value);
      this.pdfModal.workingDay = this.pdfModal.actualDaysBurned;
      this.pdfForm.get("workingDay").setValue(this.pdfModal.actualDaysBurned);
    } else {
      this.pdfModal.actualDaysBurned = Number(value);
      this.pdfModal.workingDay = this.pdfModal.actualDaysBurned;
      this.pdfForm.get("workingDay").setValue(this.pdfModal.actualDaysBurned);
    }
    this.generateDaysCount();
    this._calculateAmount(this.pdfModal.actualDaysBurned);
  }

  onEdit(e: any) {
    this.isCustome = e.target.checked;
  }

  getFileExtension(value: any) {
    this.downLoadFileExtension = "." + value.target.value;
  }

  downloadFile(userFile: any) {
    this.FileDetail = userFile;
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    //this.downloadFileLink = `${this.basePath}${userFile.FilePath}/${userFile.FileName}`;
  }

  downloadPdfDocx() {
    this.downlodFilePath = "";
    let updateFilePath = `${this.basePath}${this.FileDetail.FilePath}/${this.FileDetail.FileName}${this.downLoadFileExtension}`;
    let employeeBillDetail = {
      "EmployeeId": this.FileDetail.FileOwnerId,
      "ClientId": this.FileDetail.ClientId,
      "FileId": this.FileDetail.FileId,
      "FilePath": this.FileDetail.FilePath,
      "FileName": this.FileDetail.FileName,
      "FileExtension": this.FileDetail.FileExtension
    };

    this.http.post("FileMaker/ReGenerateBill", employeeBillDetail).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        if(updateFilePath !== "") {
          this.downlodFilePath = updateFilePath;
          $('#downloadexistingfile').click();
          this.viewer = document.getElementById("file-container");
          this.viewer.classList.remove('d-none');
          this.viewer.querySelector('iframe').setAttribute('src', this.downlodFilePath);
          var ext =this.downlodFilePath.split(".");
          if (ext[1] == "docx") {
            this.viewer.classList.add("d-none");
            this.nav.navigateWithoutArgs(BillDetail);
          }
        }
      }
      $('#viewFileModal').modal('hide');
    }).catch(e => {
      console.log(JSON.stringify(e));
    });
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
    this.nav.navigateWithoutArgs(BillDetail);
  }

  closePopUp() {
    $('#viewFileModal').modal('hide');
  }

  goToAttendencePage(empId: any) {
    if (empId) {
      let empDetail = {
        "EmployeeUid" : empId,
        "ClientUid" : this.clientDetail.ClientUid,
        "FirstName": this.currentEmployee.FirstName,
        "LastName": this.currentEmployee.LastName,
      }
      this.nav.navigate(Attendance, empDetail)
    }

  }


  getFixedAmount($e: any) {
    let amount = Number($e.target.value);
    if (!isNaN(amount)) {
      this.packageAmount = amount;
      this.pdfForm.get("grandTotalAmount").setValue(amount);
    }
  }
}

class PdfModal {
  header: string = 'Staffing Bill';
  UpdateSeqNo: number = 0;
  IsCustomBill: boolean = false;
  billForMonth: string = null;
  billNo: string = null;
  dateOfBilling: Date = new Date();
  daysAbsent: number = 0;
  cGST: number = 0;
  sGST: number = 0;
  iGST: number = 0;
  cGSTAmount: number = 0;
  sGSTAmount: number = 0;
  iGSTAmount: number = 0;
  workingDay: number = 0;
  isHalfDay: number = 0;
  actualDaysBurned: number = 0;
  packageAmount: number = 0;
  grandTotalAmount: number = 0;
  receiverFirstAddress: string = null;
  receiverGSTNo: string = null;
  receiverSecondAddress: string = null;
  receiverPrimaryContactNo: string = null;
  receiverEmail: string = null;
  receiverCompanyName: string = null;
  receiverCompanyId: number = null;
  developerName: string = "NA";
  developerId: number = 0;
  senderCompanyName: string = null;
  senderClientId: number = 0;
  senderGSTNo: string = null;
  senderFirstAddress: string = null;
  senderSecondAddress: string = null;
  senderPrimaryContactNo: string = null;
  senderEmail: string = null;
  ClientId: number = 0;
  receiverThirdAddress: string = "";
  senderThirdAddress: string = "";
  receiverPincode: number = 0;
  billingMonth: Date = null;
  EmployeeId: number = 0;
  billId: number = 0;
  FileId: number = 0;
  StatusId: number = 2;
  PaidOn: Date = null;
}

export class ApplicationData {
  fileDetail: Array<any> = [];
  clients: Array<any> = [];
  employees: Array<EmployeeDetail> = [];
  allocatedClients: Array<any> = [];
}
