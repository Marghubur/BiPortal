import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AddNumbers, CommonService, ErrorToast, Toast, ToFixed, WarningToast } from 'src/providers/common-service/common.service';
import { ResponseModel } from 'src/auth/jwtService';
import { iNavigation } from 'src/providers/iNavigation';
import { DateFormatter } from 'src/providers/DateFormatter';
import { Attendance, BuildPdf, ItemStatus, UserType } from 'src/providers/constants';
import { DomSanitizer } from '@angular/platform-browser';
import { Filter } from 'src/providers/userService';
import { ApplicationData, EmployeeDetail, PdfModal } from 'src/app/adminmodal/admin-modals';

declare var $: any;

@Component({
  selector: 'app-build-pdf',
  templateUrl: './build-pdf.component.html',
  styleUrls: ['./build-pdf.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: DateFormatter }]
})
export class BuildPdfComponent implements OnInit, AfterViewChecked {
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
  senderClient: any = null;
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
  fileDetail: any = "";
  downloadFileLink: string = "";
  downlodFilePath: string = "";
  basePath: string = "";
  viewer: any = null;
  allTimesheet: Array<any> = [];
  dayList: Array<any> = [];
  template: any = null;
  isBillGenerated: boolean = false;
  staffingTemplateType: string = null;
  email:Array<string> = [];
  billAllDetails: any = null;
  templateText: any = null;
  isClientAssigned: boolean = true;
  existingData: any = null;
  emailTemplate: any = null;
  timesheetBreakup: Array <any> = [];
  generateBillUrl: string = "";
  timesheetId: number = 0;
  bodyContent: any = null;
  maxDate: any = null;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private calendar: NgbCalendar,
    private nav: iNavigation,
    private sanitizer: DomSanitizer
  ) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.viewer = document.getElementById("file-container");
    this.existingData = this.nav.getValue();
    this.editMode = false;
    this.isClientAssigned = true;
    this.maxDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    this.basePath = this.http.GetImageBasePath();
    //----- edit mode -----
    if (this.existingData) {
      this.editMode = true;
      this.generateBillUrl = `filemaker/UpdateGeneratedBill`;
      this.model = this.calendar.getToday();
      this.initMonths();
      this.editBillDetail();
    } else {
      this.generateBillUrl = `filemaker/GenerateBill`;
      this.getNewForm();
    }
  }

  getNewForm() {
    this.initMonths();
    this.model = this.calendar.getToday();
    this.pdfModal = new PdfModal();
    this.pdfModal.billNo = "";
    this.pdfModal.iGST = 18;
    this.pdfModal.workingDay = this.daysInMonth((new Date()).getMonth() + 1);
    this.pdfModal.actualDaysBurned = this.pdfModal.workingDay;
    this.originalBillingMonth = this.model.month;
    this.pdfModal.billYear = new Date().getFullYear();
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
    this.allTimesheet = [];
    let timesheetStatusFor = {
      "EmployeeId": this.currentEmployee.EmployeeUid,
      "UserTypeId": UserType.Employee,
      "ForMonth": this.originalBillingMonth,
      "ForYear": this.model.year,
      "ClientId": this.clientDetail.CompanyId
    }

    this.http.post("Timesheet/GetEmployeeTimeSheet", timesheetStatusFor).then ((response: ResponseModel) => {
      if (response.ResponseBody) {
          this.createEntireMonthTimesheet(response.ResponseBody, timesheetStatusFor);
          this.buildTimeSheet();
      }
      this.isClientSelected = true;
    }).catch(e => {
      ErrorToast(e.HttpStatusMessage)
    });
  }

  createEntireMonthTimesheet(timesheet: Array<any>, requestData: any) {
    let firstDate = new Date(requestData.ForYear, requestData.ForMonth - 1, 1);
    let lastDate = new Date(requestData.ForYear, requestData.ForMonth, 0);
    let monthTimesheet = [];

    if(!timesheet || timesheet.length == 0) {
      firstDate = new Date(firstDate.setDate(1));
      while(firstDate.getTime() <= lastDate.getTime()) {
        monthTimesheet.push({
          TimesheetId: 0,
          ClientId: requestData.ClientId,
          EmployeeId: requestData.EmployeeId,
          PresentDate: firstDate,
          TimesheetStatus: ItemStatus.NotSubmitted
        });
        firstDate = new Date(firstDate.setDate(firstDate.getDate() + 1));
      }
    } else {
      let i = 0;
      while(i < lastDate.getDate()) {
        let item = timesheet.find(x => new Date(x.PresentDate).getDate() == firstDate.getDate());
        if(item) {
          item.PresentDate = new Date(item.PresentDate);
          monthTimesheet.push(item);
        } else {
          monthTimesheet.push({
            TimesheetId: 0,
            ClientId: requestData.ClientId,
            EmployeeId: requestData.EmployeeId,
            PresentDate: new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate()),
            TimesheetStatus: ItemStatus.NotSubmitted
          });
        }

        firstDate = new Date(firstDate.setDate(firstDate.getDate() + 1));
        i++;
      }
     }

    this.allTimesheet = monthTimesheet.sort((a,b) => Date.parse(a.PresentDate) - Date.parse(b.PresentDate));
  }

  buildTimeSheet() {
    let burnDays = 0;
    let isTimeSheetExists = true;
    if(this.allTimesheet.length == 0) {
      if(!this.editMode)
        this.timesheetId = 0;
      isTimeSheetExists = false;
    }

    this.allTimesheet.map(item => {
      if(item.TimesheetStatus == 9)
        burnDays++;
    });

    if (this.editMode && !isTimeSheetExists) {
      burnDays = this.pdfModal.workingDay - this.pdfModal.daysAbsent;
      this.pdfForm.get('actualDaysBurned').setValue(burnDays)
    } else {
      this.pdfForm.get('actualDaysBurned').setValue(burnDays)
    }

    this._calculateAmount(burnDays);
    this.dayList = [];
    let i = 0;
    while(i < 7) {
      this.dayList.push(new Date(this.allTimesheet[i]["PresentDate"]).getDay());
      i++;
    }

    this.timesheetbreakup();
  }

  editBillDetail() {
    // "EditEmployeeBillDetail" => post
    let FileId = Number(this.existingData.FileUid);
    if (isNaN(FileId)) {
      Toast("Invalid FileUid.");
      return;
    } else {
      let employeeBillDetail = {
        "EmployeeId": this.existingData.FileOwnerId,
        "ClientId": this.existingData.ClientId,
        "FileId": FileId,
        "UserTypeId": UserType.Employee,
        "ForMonth": new Date(this.existingData.Month + '-1-01').getMonth() + 1,
        "ForYear": this.existingData.Year
      };

      this.http.post("Timesheet/EditEmployeeBillDetail", employeeBillDetail).then((response: ResponseModel) => {
        let fileDetail: any = null;
        let editPackageAmount: number = 0;
        let editGrandTotalAmount: number = 0;
        if (response.ResponseBody) {
          this.applicationData = response.ResponseBody as ApplicationData;
          this.employees = this.applicationData.Employees;
          this.currentOrganization = this.applicationData.Organizations.find(x => x.IsPrimaryCompany == 1);//.find(x => x.CompanyId === this.existingData.ClientId);
          this.pdfModal = new PdfModal();
          if (this.currentOrganization) {
            this.pdfModal.senderCompanyName = this.currentOrganization.CompanyName;
            this.pdfModal.senderGSTNo = this.currentOrganization.GSTNo;
            this.pdfModal.senderFirstAddress = this.currentOrganization.FirstAddress;
            this.pdfModal.senderSecondAddress = this.currentOrganization.SecondAddress + " " + this.currentOrganization.ThirdAddress;
            this.pdfModal.senderPrimaryContactNo = this.currentOrganization.PrimaryPhoneNo;
            this.pdfModal.senderEmail = this.currentOrganization.Email;
            this.pdfModal.senderId = this.currentOrganization.CompanyId;
          }

          if (this.applicationData.FileDetail && this.applicationData.FileDetail.length > 0) {
            fileDetail = this.applicationData.FileDetail[0];
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

          this.originalBillingMonth = fileDetail.BillForMonth;
          this.pdfModal.billYear = fileDetail.BillYear;
          if(fileDetail.BillYear == null) {
            this.pdfModal.billYear = new Date().getFullYear();
          }
        }

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

        if (this.applicationData.TimesheetDetails) {
          this.createEntireMonthTimesheet(this.applicationData.TimesheetDetails, employeeBillDetail);
          this.buildTimeSheet();
          this.isClientSelected = true;
        }
        this.isClientSelected = true;
        this.pageDataIsReady = true;
      });
    }
  }

  loadPageLevelData() {
    let filter: Filter = new Filter();
    this.http.post("bill/GetBillDetailForEmployee", filter).then((response: ResponseModel) => {
      if (response.ResponseBody !== null) {
        this.applicationData = response.ResponseBody as ApplicationData;
        this.employees = this.applicationData.Employees;
        this.currentOrganization = this.applicationData.Organizations.find(x => x.IsPrimaryCompany === true);
        if (this.currentOrganization != null) {
          this.pdfModal.senderCompanyName = this.currentOrganization.CompanyName;
          this.pdfModal.senderGSTNo = this.currentOrganization.GSTNo;
          this.pdfModal.senderFirstAddress = this.currentOrganization.FirstAddress;
          this.pdfModal.senderSecondAddress = this.currentOrganization.SecondAddress + " " + this.currentOrganization.ThirdAddress;
          this.pdfModal.senderPrimaryContactNo = this.currentOrganization.PrimaryPhoneNo;
          this.pdfModal.senderEmail = this.currentOrganization.Email;
          this.pdfModal.senderId = this.currentOrganization.CompanyId;
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
    }).catch(e => {
      ErrorToast("Please add employee first");
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
      { "sno": 10, "name": "October", "days": this.daysInMonth(10) },
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
      billYear: new FormControl(this.pdfModal.billYear, [Validators.required]),
      billNo: new FormControl(this.pdfModal.billNo),
      cGST: new FormControl(this.pdfModal.cGST, [Validators.required]),
      sGST: new FormControl(this.pdfModal.sGST, [Validators.required]),
      iGST: new FormControl(this.pdfModal.iGST, [Validators.required]),
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
      senderId: new FormControl(this.pdfModal.senderId, [Validators.required]),
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
    this.isClientAssigned = true;
    if (employeeId) {
      this.currentEmployee = this.employees.find(x => x.EmployeeUid === parseInt(employeeId));
      if (this.currentEmployee) {
        if(this.currentEmployee.ClientJson != null && this.currentEmployee.ClientJson != '')
          this.assignedClients = JSON.parse(this.currentEmployee.ClientJson); // this.applicationData.allocatedClients.filter(x => x.EmployeeUid == this.currentEmployee.EmployeeUid);
        else
          this.isClientAssigned = false;

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

  getTimeSheetData(): FormData {
    if (this.allTimesheet.length == 0) {
      ErrorToast("Timesheet detail not found. Please contact to admin");
      return;
    }
    let value = (<HTMLInputElement>document.getElementById('commentsection')).value;
    let formData = new FormData();
    let firstDate = new Date(this.allTimesheet[0].PresentDate);
    let timeSheetDetail = {
      EmployeeId: this.pdfForm.get("developerId").value,
      UserTypeId: UserType.Employee,
      ForMonth: firstDate.getMonth() + 1,
      ForYear: firstDate.getFullYear(),
      ClientId: this.pdfForm.get("receiverCompanyId").value,
      TimesheetId: this.timesheetId
    };

    this.allTimesheet.map(x => {
      x.EmployeeId = this.currentEmployee.EmployeeUid;
      x.ClientId = this.pdfForm.get("receiverCompanyId").value;
      x.Email = this.currentEmployee.Email;
      x.Mobile = this.currentEmployee.Mobile;
      x.EmployeeName = this.currentEmployee.FirstName +" "+ this.currentEmployee.LastName;
      x.TotalMinutes = 480
    });

    formData.append('Comment', JSON.stringify(value));
    formData.append('DailyTimesheetDetail', JSON.stringify(this.allTimesheet));
    formData.append('TimesheetDetail', JSON.stringify(timeSheetDetail));

    return formData;
  }

  generate() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;
    this.isBillGenerated = false;
    let billingYear: any = 0;

    if (this.pdfForm.get('billForMonth').errors !== null)
      errroCounter++;

    billingYear = Number(this.pdfForm.get('billYear').value);
    if (this.pdfForm.get('billYear').errors !== null)
      errroCounter++;
    if (this.pdfForm.get('dateOfBilling').errors !== null)
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
//    this.pdfForm.get('grandTotalAmount').setValue(this.grandTotalAmount);
    this.pdfForm.get("billingMonth").setValue(new Date(billingYear, this.originalBillingMonth - 1, 1));
    if (this.pdfForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all mandatory fields");
      return;
    }
    if (errroCounter === 0) {
      this.pdfForm.get("daysAbsent").setValue(worksDays - burnDays);
      let request: PdfModal = this.pdfForm.value;
      if(this.isHalfDay) {
        request.daysAbsent = Number(worksDays - burnDays) - 0.5;
      }

      let modalStatus = this.validateBillRequest(request);
      this.billAllDetails = request;
      if(!modalStatus ) {
        let timesheetForm: FormData = this.getTimeSheetData();
        // let timesheetForm: FormData = new FormData();
        timesheetForm.append('BillRequestData', JSON.stringify(request));

        this.http.post(this.generateBillUrl, timesheetForm).then((response: ResponseModel) => {
          if(response.ResponseBody.FileDetail !== null &&
            response.ResponseBody.EmailTemplate !== null) {
            this.downloadFile(response.ResponseBody.FileDetail);
            this.isBillGenerated = true;
            this.Bindtemplate(response.ResponseBody.EmailTemplate);
            $('#viewFileModal').modal('show');
            this.timesheetBreakup = [];
            Toast("Bill pdf generated successfully");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
          this.common.PrintError(e);
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
    if(request.EmployeeId <= 0){
      message = "Invalid Employee selected";
      return message;
    }

    if (request.senderId <= 0) {
      message = "Invalid Sender selected"
      return message;
    }

    if(request.receiverCompanyId <= 0) {
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
      let companyId: number = Number(Id);
      let clients = this.applicationData.Organizations.filter(x => x.CompanyId === companyId);
      if (clients.length > 0) {
        let client = clients[0];
        let lastAddress = '';
        if (client.ThirdAddress === null || client.ThirdAddress === "") {
          lastAddress = "Pin: " + client.Pincode;
        } else {
          lastAddress = client.ThirdAddress + "  Pin: " + client.Pincode;
        }
        this.pdfForm.get('senderFirstAddress').setValue(client.FirstAddress);
        this.pdfForm.get('senderCompanyName').setValue(client.CompanyName);
        this.pdfForm.get('senderGSTNo').setValue(client.GSTNo);
        this.pdfForm.get('senderSecondAddress').setValue(client.SecondAddress + " " + lastAddress);
        this.pdfForm.get('senderThirdAddress').setValue(lastAddress);
        this.pdfForm.get('senderPrimaryContactNo').setValue(client.PrimaryPhoneNo);
        this.pdfForm.get('senderEmail').setValue(client.Email);
      }
    }
  }

  findReceiverClientDetail() {
    let value = this.pdfForm.get('receiverCompanyId').value;
    if(value) {
      this.bindClientDetail(value);
      this.isClientSelected = true;
      this.getAttendance();
    }
    else {
      ErrorToast("Company not selected properly.");
    }
  }

  setCurrentOrganization(): boolean {
    let developerId = Number(this.pdfForm.get('developerId').value);
    if (!isNaN(developerId)) {
      this.currentEmployee = this.applicationData.Employees.find(x => x.EmployeeUid === developerId);

      if (this.currentEmployee) {
        if (this.currentEmployee.CompanyId == 0){
          ErrorToast("Company is not set for the current employee.");
          throw "Company is not set for the current employee.";
        }

        this.currentOrganization = this.applicationData.Organizations
          .find(i => i.CompanyId == this.currentEmployee.CompanyId);
        return true;
      }
    }
    return false;
  }

  bindClientDetail(Id: any) {
    this.isClientSelected = false;
    if(!this.setCurrentOrganization()){
      ErrorToast("Fail to load bill detail. Please contact to admin.")
      return;
    }

    if (Id !== null) {
      let companyId: number = Number(Id);
      this.senderClient = this.applicationData.Organizations.find(x => x.CompanyId === this.currentOrganization.CompanyId);
      this.clientDetail = this.assignedClients.find(x => x.CompanyId == companyId); //this.applicationData.allocatedClients.find(x => x.ClientUid === clientId && x.EmployeeUid == this.currentEmployee.EmployeeUid);
      if (this.senderClient && this.clientDetail) {
        let lastAddress = '';
        if (this.senderClient.ThirdAddress === null || this.senderClient.ThirdAddress === "") {
          lastAddress = "Pin: " + this.senderClient.Pincode;
        } else {
          lastAddress = this.senderClient.ThirdAddress + "  Pin: " + this.senderClient.Pincode;
        }
        this.pdfForm.get('receiverFirstAddress').setValue(this.senderClient.FirstAddress);
        this.pdfForm.get('receiverCompanyName').setValue(this.senderClient.CompanyName);
        this.pdfForm.get('receiverGSTNo').setValue(this.senderClient.GSTNo);
        this.pdfForm.get('receiverSecondAddress').setValue(this.senderClient.SecondAddress + " " + lastAddress);
        this.pdfForm.get('receiverThirdAddress').setValue(lastAddress);
        this.pdfForm.get('receiverPrimaryContactNo').setValue(this.senderClient.PrimaryPhoneNo);
        this.pdfForm.get('receiverEmail').setValue(this.senderClient.Email);
        this.pdfForm.get('ClientId').setValue(this.senderClient.CompanyId);
        this.grandTotalAmount = this.clientDetail.ActualPackage;
        if (!this.editMode) {
          this.packageAmount = this.clientDetail.ActualPackage;
          this.pdfForm.get('packageAmount').setValue(this.clientDetail.ActualPackage);
          this.pdfForm.get('grandTotalAmount').setValue(this.clientDetail.ActualPackage);
          this.igstAmount = this.calculateGSTAmount( this.pdfModal.iGST);
          this.calculateGrandTotal();
        }
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
    if (this.isCustome == true)
      this.editMode = true;
    else
      this.editMode = false;
  }

  getFileExtension(value: any) {
    this.downLoadFileExtension = "." + value;
    this.downloadPdfDocx();
  }

  downloadFile(userFile: any) {
    this.fileDetail = userFile;
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    //this.downloadFileLink = `${this.basePath}${userFile.FilePath}/${userFile.FileName}`;
  }

  downloadPdfDocx() {
    this.downlodFilePath = "";
    if(this.fileDetail.FileId > 0) {
      this.fileDetail.FileName = this.fileDetail.FileName.replace(/\.[^/.]+$/, "");
      let updateFilePath = `${this.basePath}${this.fileDetail.FilePath}/${this.fileDetail.FileName}${this.downLoadFileExtension}`;
      this.viewer = document.getElementById("file-container");
      this.viewer.classList.remove('d-none');
      this.viewer.querySelector('iframe').setAttribute('src', updateFilePath);
    } else {
      ErrorToast("There was some error on file generation. Please contact to admin.");
    }
    if (this.downLoadFileExtension == 'docx') {
      this.closePdfViewer();
    }
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
    this.getNewForm();
  }

  closePopUp() {
    $('#viewFileModal').modal('hide');
    this.isClientSelected = false;
    this.allTimesheet = [];
    this.loadPageLevelData();
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

  viewTimesheetDetail() {
    this.timesheetbreakup();
    $('#timesheet-view').modal('show');
  }

  enableDate(current: any) {
    if (current) {
      if (current.TimesheetStatus == 4) {
        let value = this.allTimesheet.find(x => x.PresentDate == current.PresentDate);
        value.TimesheetStatus = 9;
        value.EmployeeId = this.currentEmployee.EmployeeUid;
        value.ClientId = this.currentOrganization.CompanyId;
        for (let i = 0; i < this.timesheetBreakup.length; i++) {
          this.timesheetBreakup[i].find(x => x => x.PresentDate == current.PresentDate).TimesheetStatus = 9;
        }
      }
      else {
        let value = this.allTimesheet.find(x => x.PresentDate == current.PresentDate);
        value.TimesheetStatus = 4;
        value.EmployeeId = this.currentEmployee.EmployeeUid;
        value.ClientId = this.currentOrganization.CompanyId;
        for (let i = 0; i < this.timesheetBreakup.length; i++) {
          this.timesheetBreakup[i].find(x => x => x.PresentDate == current.PresentDate).TimesheetStatus = 4;
        }
      }
    }
  }

  weekSelected(e: any, item: any) {
    let i = item.length;
    let init = (item[0].PresentDate.getDate()) - 1;
    let end = item.at(-1).PresentDate.getDate();
    let data = this.allTimesheet.slice(init, end);
    if (e.target.checked == true) {
      data.map(x => x.TimesheetStatus = 9);
    }
    else {
      data.map(x => x.TimesheetStatus = 4);
    }
  }

  selectUnselect(status: string) {
    if (status == 'select') {
      this.allTimesheet.map(x => x.TimesheetStatus = 9);
      for (let i = 0; i < this.timesheetBreakup.length; i++) {
        this.timesheetBreakup[i].Timesheet.map(x => x.TimesheetStatus = 9);
      }
      let elem = document.querySelectorAll('[data-checktype="weekly"]') ;
      for (let i = 0; i < elem.length; i++) {
        (elem[i] as HTMLInputElement).checked= true;
      }
    }
    else if('deselect') {
      this.allTimesheet.map(x => x.TimesheetStatus = 4);
      for (let i = 0; i < this.timesheetBreakup.length; i++) {
        this.timesheetBreakup[i].Timesheet.map(x => x.TimesheetStatus = 4);
      }
      let elem = document.querySelectorAll('[data-checktype="weekly"]') ;
      for (let i = 0; i < elem.length; i++) {
        (elem[i] as HTMLInputElement).checked= false;
      }
    }
  }

  submitTimesheet() {
    this.isLoading = true;
    try {
      let value = (<HTMLInputElement>document.getElementById('commentsection')).value;
      let formData = new FormData();
      let firstDate = new Date(this.allTimesheet[0].PresentDate);
      let timeSheetDetail = {
        EmployeeId: this.pdfForm.get("developerId").value,
        UserTypeId: UserType.Employee,
        ForMonth: firstDate.getMonth() + 1,
        ForYear: firstDate.getFullYear(),
        ClientId: this.pdfForm.get("receiverCompanyId").value
      };

      this.allTimesheet.map(x => {
        x.EmployeeId = this.currentEmployee.EmployeeUid;
        x.ClientId = this.pdfForm.get("receiverCompanyId").value
      });

      formData.append('comment', JSON.stringify(value));
      formData.append('dailyTimesheetDetail', JSON.stringify(this.allTimesheet));
      formData.append('timesheet', JSON.stringify(timeSheetDetail));
      this.http.post('Timesheet/UpdateTimesheet', formData).then(res => {
        if (res.ResponseBody) {
          this.createEntireMonthTimesheet(res.ResponseBody, timeSheetDetail);
          this.buildTimeSheet();
          this.isLoading = false;
          $('#timesheet-view').modal('hide');
        } else
          this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    } catch(e) {
      ErrorToast("Getting calculation error from client side. Please contact to admin.");
    }
  }

  updateActualDays() {
    let burnDays = 0;
    this.allTimesheet.map(item => {
      item.PresentDate = new Date(item.PresentDate);
      if(item.TimesheetStatus == 9)
        burnDays++;
    });
    if (burnDays >= 0)
      this.pdfForm.get('actualDaysBurned').setValue(burnDays)
    // else
    //   burnDays = this.pdfForm.get('actualDaysBurned').value;

    this._calculateAmount(burnDays);
    $('#updateburnDaysModal').modal('hide');
  }

  viewSendTemplete(e: any) {
    let value = e.target.value;
    if (value)
      this.viewTemplate();
    else
      this.template = null;
  }

  sendEmail() {
    this.isLoading = true;
    if (this.currentOrganization.CompanyId > 0 && this.senderClient.CompanyId >0 && this.fileDetail.FileId > 0) {
      let value = document.getElementById('billtemplatebody').innerHTML;
      if (value)
        this.emailTemplate.BodyContent = value;

      let data = {
        ClientId: this.currentOrganization.CompanyId,
        SenderId: this.senderClient.CompanyId,
        FileId: this.fileDetail.FileId,
        MonthName: this.pdfModal.billForMonth.toUpperCase(),
        ForYear: this.pdfModal.billYear,
        EmployeeId: this.currentEmployee.EmployeeUid,
        EmailTemplateDetail: this.emailTemplate
      };

      this.http.post("bill/SendBillToClient", data).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Email send successfully");
          $('#viewFileModal').modal('hide');
          this.isClientSelected = false;
          this.allTimesheet = [];
          this.loadPageLevelData();
        } else {
          ErrorToast("Fail to send email. Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
        ErrorToast("Fail to send email. Please contact to admin.");
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      ErrorToast("Unable to send email. Please contact to admin.");
    }
  }

  viewTemplate() {
    this.http.get('Template/GetBillingTemplateDetail').then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.Bindtemplate(res.ResponseBody);
      }
    });
  }

  Bindtemplate(res: any) {
    if (res) {
      this.emailTemplate = res;
      if(this.emailTemplate) {
        let employee = this.employees.find(x => x.EmployeeUid == this.pdfForm.get("developerId").value)
        this.bodyContent = this.emailTemplate.BodyContent;
        this.bodyContent = this.bodyContent
        .replaceAll("[[DEVELOPER-NAME]]", employee.FirstName + " " + employee.LastName)
        .replaceAll("[[YEAR]]", this.pdfModal.billYear.toString())
        .replaceAll("[[MONTH]]", this.pdfModal.billForMonth);

        this.bodyContent = this.sanitizer.bypassSecurityTrustHtml(this.bodyContent);
      }
    } else {
      WarningToast("No default template found.");
    }
  }

  convertToPlain(html){
    var tempDivElement = document.createElement("div");
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || "";
  }

  addEmailId() {
    let value = (document.querySelector('input[name="add-email"]') as HTMLInputElement).value;
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (value.match(validRegex)) {
      if (this.emailTemplate.Emails.find(i => i == value) == null){
        this.emailTemplate.Emails.push(value);
        (document.querySelector('input[name="add-email"]') as HTMLInputElement).value = '';
      }
    }
    else
      ErrorToast("Please enter a valid email id.");
  }

  removeEmail(index: number) {
    if (index >-1) {
      this.emailTemplate.Emails.splice(index, 1);
    }
  }

  timesheetbreakup() {
    this.timesheetBreakup = [];
    let days = this.allTimesheet[0].PresentDate.getDay();
    let end = 0;
    let start = 0;
    if (days > 0 && days <= 6)
      end = 7 - (days-1)
    else
      end = 1;
    let i = 0;
    while (i <= this.allTimesheet.length) {
      let weeks = this.allTimesheet.slice(start, end);
      let status = 0;
      if (weeks.filter(x => x.TimesheetStatus == 8 || x.TimesheetStatus == 9).length > 0)
        status = 8;
      else
        status = 4;
      this.timesheetBreakup.push({
        Timesheet: weeks,
        Status : status
      });
      if (end == this.allTimesheet.length)
        return;
      start = end;
      end = end + 7;
      if (end > this.allTimesheet.length)
        end = this.allTimesheet.length;
      i++;
    }
  }
}
