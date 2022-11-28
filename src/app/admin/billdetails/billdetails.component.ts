import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { AddNumbers, CommonService, ErrorToast, GetStatus, MonthName, Toast, ToFixed, WarningToast } from 'src/providers/common-service/common.service';
import { BuildPdf, Employees, ManageEmployee, RegisterClient, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { ApplicationData } from '../build-pdf/build-pdf.component';
import { DocumentUser, Files } from '../documents/documents.component';
import { EmployeeDetail } from '../manageemployee/manageemployee.component';
import 'bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;

@Component({
  selector: 'app-billdetails',
  templateUrl: './billdetails.component.html',
  styleUrls: ['./billdetails.component.scss']
})
export class BilldetailsComponent implements OnInit, AfterViewChecked {
  documentForm: FormGroup = null;
  filterbox: boolean = false;
  isLoading: boolean = false;
  currentEmployeeDetail: EmployeeDetail = null;
  userFiles: Array<any> = [];
  fileLoaded: boolean = false;
  basePath: string = "";
  viewer: any = null;
  employee: any = null;
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  model: NgbDateStruct;
  currentFileId: number = 0;
  billDetails: Array<BillDetails> = [];
  singleEmployee: Filter = null;
  isEmpPageReady: boolean = false;
  employeeDetails: Array<any> = null;
  autoCompleteModal: autoCompleteModal = null;
  placeholderName: string = "";
  employeeFiles: Array<BillDetails> = [];
  employeeFile: BillDetails = null;
  anyFilter: string = "";
  employeeData: Filter = null;
  employeeId: number = 0;
  fromDate: any = null;
  toDate: any = null;
  currentRecordBillNo: string = "";
  gstDetailForm: FormGroup = null;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  isUploading: boolean = false;
  isModalReady: boolean = false;
  isGSTStatusModalReady: boolean = false;
  applicationData: ApplicationData = new ApplicationData();
  employees: Array<EmployeeDetail> = [];
  currentOrganization: any = null;
  isPdfGenerating: boolean = false;
  isDownloadModal: boolean = false;
  downLoadFileExtension: string = ".pdf";
  downloadFileLink: string = "";
  downlodFilePath: string = "";
  FileDetail: any = "";
  TotalGSTAmount: number = 0;
  TotalReceivedAmount: number = 0;
  TotalBilledAmount: number = 0;
  TotalSalaryAmount: number = 0;
  RaisedBilloption: string = '1';
  isReadonly: boolean = true;
  calculateAmount: boolean = false;
  orderByNameAsc: boolean = null;
  orderByBillStatusAsc: boolean = null;
  orderByMonthAsc: boolean = null;
  orderByYearAsc: boolean = null;
  orderByGSTStatusAsc: boolean = null;
  orderByBillNoAsc: boolean = null;
  isFileFound: boolean = false;
  isError: boolean = false;
  allBillingYears: Array<any> = [];
  isBillGenerated: boolean = false;
  emailTemplate: any = null;
  email:Array<string> = [];
  bodyContent: any = null;
  allSendRecEmails: Array<any> = [];

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private common: CommonService,
    private calendar: NgbCalendar,
    private sanitizer: DomSanitizer
  ) {
    this.singleEmployee = new Filter();
    this.placeholderName = "All result";
    this.employeeDetails = [{
      value: '0',
      text: 'All result'
    }];
  }
  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    // $('[data-bs-toggle="tooltip"]').on('mouseleave', function () {
    //   $(this).tooltip('dispose');
    // });
    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.fromModel = null;
    this.toModel = null;
    this.model = null;
    this.RaisedBilloption = '';
    this.employeeData = new Filter();
    this.employeeFile = new BillDetails();
    let year = new Date().getFullYear();
    this.employeeFile.Status = '0';
    this.employeeFile.GSTStatus = '0';
    this.employeeFile.Month = '0';
    this.employeeFile.Year = year.toString();
    this.employeeId = 0;
    this.isReadonly = true;
    this.updateBillPaidOn();
    this.basePath = this.http.GetImageBasePath();
    this.gstPaidOn();
    //this.currentEmployeeDetail = this.nav.getValue();
    this.autoCompleteModal = {
      data: [],
      placeholder: "All result"
    }
    for (let i = 0; i < 5; i++) {
      let value = year - i;
      this.allBillingYears.push(value);
    }
    let data = this.nav.getValue();
    if (data != null) {
      if (data.ClientName) {
        this.employeeFile.ClientName = data.ClientName;
      } else {
        this.employeeFile.Status = data.BillStatusId;
        this.employeeFile.Month = data.BillForMonth;
        this.employeeFile.Year = data.BillYear;
      }
      this.filterRecords();
    } else {
      this.LoadFiles();
    }
  }

  updateBillPaidOn() {
    this.documentForm = this.fb.group({
      StatusId: new FormControl(this.employeeFile.Status, Validators.required),
      UpdatedOn: new FormControl(new Date(), Validators.required),
      Notes: new FormControl("")
    });
  }

  gstPaidOn() {
    this.gstDetailForm = this.fb.group({
      //GstId: new FormControl(0),
      Billno: new FormControl(this.employeeFile.BillNo, Validators.required),
      Gststatus: new FormControl(this.employeeFile.GSTStatus, Validators.required),
      //Status: new FormControl("0", Validators.required),
      Paidon: new FormControl(new Date(), Validators.required),
      Paidby: new FormControl("0"),
      Amount: new FormControl(this.employeeFile.GSTAmount)
    });
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'BillNo')
      this.orderByBillNoAsc = !flag;
    if (FieldName == 'ClientName')
      this.orderByNameAsc = !flag;
    if (FieldName == 'BillStatusId')
      this.orderByBillStatusAsc = !flag;
    if (FieldName == 'BillForMonth')
      this.orderByMonthAsc = !flag;
    if (FieldName == 'GSTStatus')
      this.orderByGSTStatusAsc = !flag;
    if (FieldName == 'BillYear')
      this.orderByYearAsc = !flag;
    this.singleEmployee = new Filter();
    this.singleEmployee.SortBy = FieldName +" "+ Order;
    this.LoadFiles()
  }

  onEmloyeeChanged(_: any) {
    this.filterRecords();
  }

  onDateSelection(e: NgbDate) {
    let selectedDate = new Date(e.year, e.month - 1, e.day);
    this.documentForm.get("UpdatedOn").setValue(selectedDate);
    this.gstDetailForm.get("Paidon").setValue(selectedDate);
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.singleEmployee = e;
      this.LoadFiles();
    }
  }

  updateRecord() {
    this.isError = false;
    this.isLoading = true;
    let errorCount = 0;
    if (this.documentForm.get("StatusId").value == 0) {
      this.isError = true;
      errorCount++;
    } else {
      let value = this.documentForm.get("StatusId").value;
      this.documentForm.get("StatusId").setValue(Number(value));
    }

    if (this.documentForm.get("UpdatedOn").errors) {
      errorCount++;
    }

    if (errorCount === 0) {
      this.http.post(`OnlineDocument/UpdateRecord/${this.currentFileId}`, this.documentForm.value).then(response => {
        if (response.ResponseBody) {
          this.refreshFilter();
          Toast(response.ResponseBody);
          this.isLoading = false;
        }
        this.closeWindow();
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Status is mandatory fields.");
    }
  }

  GetDocumentFile(fileInput: any) {
    this.FilesCollection = [];
    let selectedFiles = fileInput.target.files;
    if (selectedFiles.length > 0) {
      let index = 0;
      let file = null;
      this.isUploading = false;
      while (index < selectedFiles.length) {
        file = <File>selectedFiles[index];
        let item: Files = new Files();
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = file.size;
        item.FileExtension = file.type;
        item.DocumentId = 0;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      }
    } else {
      Toast("No file selected");
    }
  }

  fireBrowserFile() {
    if(this.documentForm.invalid) {
      return;
    }
    $("#uploadocument").click();
  }

  calculation(){
    this.calculateAmount = true;
  }

  submitGSTStatusDetail() {
    let errorCount = 0;
    this.isLoading = true;
    this.isUploading = true;

    if (this.gstDetailForm.get("Gststatus").value == 0) {
      this.isError = true;
      errorCount++;
    }

    if (this.gstDetailForm.get("Billno").errors) {
      errorCount++;
    }

    if (this.gstDetailForm.get("Paidon").errors) {
      errorCount++;
    }

    let formData = new FormData();

    let index = 0;
    while (index < this.FileDocumentList.length) {
      formData.append(this.FileDocumentList[index].FileName, this.FilesCollection[index]);
      index++;
    }

    formData.append("gstDetail", JSON.stringify(this.gstDetailForm.value));
    formData.append("fileDetail", JSON.stringify(this.FileDocumentList));

    if (errorCount === 0) {
      this.http.upload(`Bill/UpdateGstStatus/${this.currentRecordBillNo}`, formData).then(response => {
        if (response.ResponseBody) {
          this.closeWindow();
          Toast(response.ResponseBody);
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      ErrorToast("Please fill all mandatory fields.");
    }
  }

  editFile(FileUid: string) {
    let data = this.userFiles.filter(x => x.FileUid === FileUid);
    let newData = data[0];
    this.http.post(`OnlineDocument/EditFile`, newData).then(response => {
      this.common.ShowToast("File Reterive");
    }).catch(e => { console.log(e) });
  }

  // deleteFile(FileUid: string) {
  //   let data = this.userFiles.filter(a => a.FileUid === FileUid);
  //   let newData = data[0];
  //   this.http.get(`OnlineDocument/DeleteData/${this.currentEmployeeDetail.EmployeeUid}`).then(response => {
  //     this.common.ShowToast("File Reterive");
  //   }).catch(e => { console.log(e) });
  // }

  ClickEvents(e: any) {
    if (e.fn)
      e.fn(e.item, this);
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  viewPdfFile(userFile: any) {
    this.isPdfGenerating = true;
    $('#pdfviewingModal').modal('show');
    this.regeneratebill(userFile);
  }

  showFile(userFile: any) {
    this.isPdfGenerating = false;
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.pdf`;
    this.viewer = document.getElementById("file-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  regeneratebill(userFile: any) {
    let fileId = Number(userFile.FileUid);
    if(isNaN(fileId)) {
      ErrorToast("Invalid file id supplied.");
      return;
    }

    let employeeBillDetail = {
      "EmployeeId": userFile.FileOwnerId,
      "ClientId": userFile.ClientId,
      "FileId": fileId
    };
    this.http.post("FileMaker/ReGenerateBill", employeeBillDetail).then((response: ResponseModel) => {
      let fileDetail: any = null;
      if (response.ResponseBody) {
        fileDetail = response.ResponseBody;
        if (fileDetail.FilePath != null && fileDetail.FilePath != '')
          this.showFile(fileDetail);
        else
          this.showFile(userFile);
      }

      $('#pdfviewingModal').modal('hide');
    }).catch(err => {
      $('#pdfviewingModal').modal('hide');
    });
  }

  getFileExtension(value: any) {
    this.downLoadFileExtension = "." + value;
    this.downloadPdfDocx();
  }

  downloadFile(userFile: any) {
    this.FileDetail = userFile;
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    //this.downloadFileLink = `${this.basePath}${userFile.FilePath}/${userFile.FileName}`;
    this.isDownloadModal = true;
    $('#downloadPopUp').modal('show')
  }

  getEmailTemplate(userDetail: any) {
    this.allSendRecEmails = [];
    this.FileDetail = userDetail;
    if(userDetail.BillNo && userDetail.BillNo != '') {
      this.http.get(`filemaker/GetBillDetailWithTemplate/${userDetail.BillNo}/${userDetail.FileOwnerId}`).then((response: ResponseModel) => {
        if(response.ResponseBody.EmployeeDetail !== null &&
          response.ResponseBody.EmailTemplate !== null) {
          this.isBillGenerated = true;
          this.Bindtemplate(response.ResponseBody.EmailTemplate[0], response.ResponseBody.EmployeeDetail[0]);
          let senderEmails = response.ResponseBody.Sender[0];
          let receiverEmails = response.ResponseBody.Receiver[0];
          for(const value in receiverEmails) {
              if(receiverEmails[value]) this.allSendRecEmails.push(receiverEmails[value]);
          }
          if (senderEmails.FirstEmail != null)
            this.allSendRecEmails.push(senderEmails.FirstEmail);

          if (senderEmails.SecondEmail != null)
            this.allSendRecEmails.push(senderEmails.SecondEmail);

          $('#sendfileModal').modal('show');
          Toast("Bill pdf generated successfully");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
        ErrorToast("Fail to generate bill. Please contact to admin.");
      });
    }
  }

  Bindtemplate(res: any, employee: any) {
    if (res) {
      this.emailTemplate = res;
      if(this.emailTemplate) {
        this.bodyContent = this.emailTemplate.BodyContent;
        this.bodyContent = this.bodyContent
        .replaceAll("[[DEVELOPER-NAME]]", employee.FirstName + ' ' + employee.LastName)
        .replaceAll("[[YEAR]]", this.FileDetail.Year)
        .replaceAll("[[MONTH]]", this.FileDetail.Month);

        this.bodyContent = this.sanitizer.bypassSecurityTrustHtml(this.bodyContent);
      }
    } else {
      WarningToast("No default template found.");
    }
  }

  closePopUp() {
    $('#sendfileModal').modal('hide');
  }

  downloadPdfDocx() {
    this.downlodFilePath = "";
    let updateFilePath = `${this.basePath}${this.FileDetail.FilePath}/${this.FileDetail.FileName}${this.downLoadFileExtension}`;

    let fileId = Number(this.FileDetail.FileUid);
    if(isNaN(fileId)) {
      ErrorToast("Invalid file id supplied.");
      return;
    }

    let employeeBillDetail = {
      "EmployeeId": this.FileDetail.FileOwnerId,
      "ClientId": this.FileDetail.ClientId,
      "FileId": fileId
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
          if (ext[1] == "docx")
            this.viewer.classList.add("d-none");
        }
      }
      this.closeWindow();
    }).catch(e => {
      console.log(JSON.stringify(e));
    });
  }

  UpdateCurrent(item: any) {
    if (item) {
    switch (item.Status) {
      case 'Completed':
        item.Status = '1';
        break;
      case 'Pending':
        item.Status = '2';
        break;
      case 'Canceled':
        item.Status = '3';
        break;
      case 'Rejected':
        item.Status = '5';
        break;
      case 'Raised':
        item.Status = '7';
        break;
    }
    this.currentFileId = item.FileUid;
    this.employeeFile = item;
    this.isError = false;
    this.isModalReady = true;
    this.updateBillPaidOn();
    $('#addupdateModal').modal('show');
    }
  }

  AddEditDocuments(mobile: string) {
    let userDetail: DocumentUser = new DocumentUser();
    userDetail.Mobile = mobile;
    userDetail.Email = this.employee.Email;
    userDetail.PageName = Employees;
    this.nav.navigate("admin/documents", userDetail);
  }

  closeWindow() {
    this.refreshFilter();
    $('#addupdateModal').modal('hide');
    $('#gstupdateModal').modal('hide');
    $('#downloadPopUp').modal('hide');
  }

  LoadFiles() {
    this.isEmpPageReady = false;
    this.isFileFound = false;
    this.http.post(`OnlineDocument/GetFilesAndFolderById/employee/${this.employeeId}`, this.singleEmployee)
    .then((response: ResponseModel) => {
      this.TotalGSTAmount = 0;
      this.TotalReceivedAmount = 0;
      this.TotalBilledAmount = 0;
      this.TotalSalaryAmount = 0;
      if (response.ResponseBody) {
        Toast("Record found.");
        let employees = response.ResponseBody.EmployeesList as Array<EmployeeDetail>;
        if(employees && employees.length > 0) {
          this.isLoading = false;
          $('#advancedSearchModal').modal('hide');
          let index = 0;
          while(index < employees.length) {
            this.employeeDetails.push({
              value: employees[index]["EmployeeUId"],
              text: employees[index]["Name"]
            });
            index++;
          }
        } else {
          this.employeeDetails.push({
            value: "0",
            text: "No record found"
          });
        }

        this.autoCompleteModal = {
          data: this.employeeDetails,
          placeholder: "Select Employee",
          className: "normal"
        }
        this.fileLoaded = true;
        this.userFiles = response.ResponseBody["Files"];
        let emp = response.ResponseBody["Employee"];
        if (emp && emp.length > 0)
          this.employee = emp[0];
        this.fileLoaded = true;
        this.billDetails = new Array<BillDetails>();
        let i =0;
        let bills : BillDetails = null;
        let GST: number = 0;

        if(this.userFiles !== null && this.userFiles.length > 0) {
          this.singleEmployee.TotalRecords = this.userFiles[0].Total;
          while (i < this.userFiles.length) {
            bills = new BillDetails();
            bills.BillNo = this.userFiles[i].BillNo;
            if(this.userFiles[i].IGST >0 || this.userFiles[i].SGST >0 || this.userFiles[i].CGST >0) {
              GST = ((this.userFiles[i].IGST + this.userFiles[i].SGST + this.userFiles[i].CGST)/100);
            } else {
              GST = 0;
            }
            bills.GSTStatus = (this.userFiles[i].GstStatus);
            bills.GSTAmount = ToFixed(this.userFiles[i].SalaryAmount * GST, 2);
            bills.ClientId = this.userFiles[i].ClientId;
            bills.ClientName = this.userFiles[i].ClientName;
            bills.FileExtension = this.userFiles[i].FileExtension;
            bills.FileName = this.userFiles[i].FileName;
            bills.FileOwnerId = this.userFiles[i].FileOwnerId;
            bills.FilePath = this.userFiles[i].FilePath;
            bills.FileUid = this.userFiles[i].FileUid;
            bills.GeneratedOn = this.userFiles[i].GeneratedOn;
            bills.Month = MonthName(this.userFiles[i].Month);
            bills.Year = this.userFiles[i].Year;
            bills.PaidOn = this.userFiles[i].PaidOn;
            bills.Status = this.userFiles[i].BillStatusId;
            bills.SalaryAmount = ToFixed(this.userFiles[i].SalaryAmount, 2);
            bills.ReceivedAmount = ToFixed((this.userFiles[i].SalaryAmount * (1 + GST)) - (this.userFiles[i].SalaryAmount /10), 2);
            bills.BilledAmount = ToFixed(this.userFiles[i].SalaryAmount * (1 + GST), 2);
            bills.TDS = ToFixed(((this.userFiles[i].SalaryAmount /10)), 2);
            bills.Name = this.userFiles[i].Name;
            bills.TakeHome = this.userFiles[i].TakeHome;
            bills.Absent = this.userFiles[i].Absents;
            bills.NoOfDays = this.userFiles[i].NoOfDays;
            this.billDetails.push(bills);
            this.TotalGSTAmount = AddNumbers([this.TotalGSTAmount, bills.GSTAmount], 2);
            this.TotalReceivedAmount = AddNumbers([this.TotalReceivedAmount, bills.ReceivedAmount], 2);
            this.TotalBilledAmount = AddNumbers([bills.BilledAmount, this.TotalBilledAmount], 2);
            this.TotalSalaryAmount = AddNumbers([bills.SalaryAmount, this.TotalSalaryAmount], 2);
            i++;
          }
          this.isFileFound = true;
        }
      } else {
        ErrorToast("No file or folder found");
      }
      this.isEmpPageReady = true;
    }).catch(e => {
      this.isLoading = false;
    });
  }

  fromDateSelection(e: NgbDateStruct) {
    this.fromDate = e; //`${e.year}-${e.month}-${e.day}`;
  }

  toDateSelection(e: NgbDateStruct) {
    this.toDate = e; //`${e.year}-${e.month}-${e.day}`;
  }

  filterRecords() {
    this.isLoading = true;
    let searchQuery = "";
    let delimiter = "";
    let fromDateValue = "";
    let toDateValue = "";
    let isDateFilterEnable = false;
    let isPaidOnFilterEnable = false;
    this.singleEmployee.reset();

    switch (this.RaisedBilloption) {
      case '0':
        this.RaisedBilloption = "between";
        break;
      case '1':
        this.RaisedBilloption = "before";
        break;
      case '2':
        this.RaisedBilloption = "after";
        break;
      default:
        this.RaisedBilloption = '';
        break;
    }

    if (this.fromDate !== null && this.RaisedBilloption == '0')
      return ErrorToast("Please select Rasied bill date option");

    if (this.fromDate !== null) {
      if (this.toDate == null && this.RaisedBilloption == 'between') {
        ErrorToast("Please selete to date to get the result.")
        return;
      }
      isDateFilterEnable = true;
    } else if(this.fromDate == null && this.toDate !== null) {
      ErrorToast("Please selete from date to get the result.")
      isDateFilterEnable = true;
      return;
    }

    if (isDateFilterEnable && this.RaisedBilloption == "between") {
      let fromDateTime = new Date(this.fromDate.year, this.fromDate.month, this.fromDate.day).getTime();
      let toDateTime = new Date(this.toDate.year, this.toDate.month, this.toDate.day).getTime();
      if (fromDateTime > toDateTime) {
        ErrorToast("Please select cottect From Date and To date");
        return;
      } else {
        fromDateValue = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
        toDateValue = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;
      }
    }

    if (this.RaisedBilloption == "before") {
      fromDateValue = '0001-1-1'
      toDateValue = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
      isDateFilterEnable = true;
    }

    if (this.RaisedBilloption == "after") {
       toDateValue= '2099-1-1'
       fromDateValue = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
      isDateFilterEnable = true;
    }

    if (this.employeeFile.ToBillNo != 0 && this.employeeFile.FromBillNo == 0)
      return ErrorToast("Please enter From Bill No.");
    if (this.employeeFile.ToBillNo == 0 && this.employeeFile.FromBillNo != 0)
      return ErrorToast("Please enter To Bill No.");
    if (this.employeeFile.ToBillNo != 0 && this.employeeFile.FromBillNo != 0 && this.employeeFile.ToBillNo != null && this.employeeFile.FromBillNo != null) {
      if (this.employeeFile.ToBillNo >= this.employeeFile.FromBillNo) {
        searchQuery += ` ${delimiter} b.BillNo between ${this.employeeFile.FromBillNo} and ${this.employeeFile.ToBillNo}`;
        delimiter = "and";
      }else {
        return ErrorToast("Please enter correct To Bill No.");
      }
    }

    if(this.employeeFile.ClientName !== null && this.employeeFile.ClientName !== "") {
      searchQuery += ` c.ClientName like '${this.employeeFile.ClientName}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.BillNo !== null && this.employeeFile.BillNo !== "") {
      searchQuery += ` ${delimiter} b.BillNo like '%${this.employeeFile.BillNo}' `;
      delimiter = "and";
    }

    if(this.employeeFile.Status !== '0') {
      searchQuery += ` ${delimiter} BillStatusId = ${this.employeeFile.Status} `;
      delimiter = "and";
    }

    if(this.employeeId > 0) {
      searchQuery += ` ${delimiter} FileOwnerId = ${this.employeeId} `;
      delimiter = "and";
    }

    if(this.employeeFile.GSTAmount !== null && this.employeeFile.GSTAmount !== 0) {
      searchQuery += ` ${delimiter} GSTAmount like '%${this.employeeFile.GSTAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.GSTStatus !== '0' && this.employeeFile.GSTStatus !== "") {
      searchQuery += ` ${delimiter} GstStatus = '${this.employeeFile.GSTStatus}' `;
      delimiter = "and";
    }

    if(this.employeeFile.SalaryAmount !== null && this.employeeFile.SalaryAmount !== 0) {
      searchQuery += ` ${delimiter} b.PaidAmount like '${this.employeeFile.SalaryAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.ReceivedAmount !== null && this.employeeFile.ReceivedAmount !== 0) {
      searchQuery += ` ${delimiter} PaidAmount like '${this.employeeFile.ReceivedAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.TakeHome !== null && this.employeeFile.TakeHome !== 0) {
      searchQuery += ` ${delimiter} TakeHomeByCandidate like '%${this.employeeFile.TakeHome}%' `;
      delimiter = "and";
    }

    // if(this.employeeFile.BilledAmount !== null && this.employeeFile.BilledAmount !== 0) {
    //   searchQuery += ` ${delimiter} BilledAmount like '${this.employeeFile.BilledAmount}%' `;
    //   delimiter = "and";
    // }

    if(this.employeeFile.Month !== null && this.employeeFile.Month !== "0") {
      let monthValue = Number(this.employeeFile.Month);
      searchQuery += ` ${delimiter} BillForMonth = '${monthValue}' `;
      delimiter = "and";
    }

    if(this.employeeFile.Year !== null && this.employeeFile.Year !== "0") {
      let YearValue = Number(this.employeeFile.Year);
      searchQuery += ` ${delimiter} BillYear = '${YearValue}' `;
      delimiter = "and";
    }

    if(isDateFilterEnable) {
      searchQuery += ` ${delimiter} b.BillUpdatedOn between '${fromDateValue}' and '${toDateValue}'`;
      delimiter = "and";
    }

    if(searchQuery !== "") {
      this.singleEmployee.SearchString = `1=1 And ${searchQuery}`;
    }

    this.LoadFiles();
  }

  refreshFilter() {
    this.employeeFile.ClientName="";
    this.employeeFile.BillNo = "";
    this.employeeFile.Status='0';
    this.employeeFile.GSTAmount=null;
    this.employeeFile.GSTStatus='0';
    this.employeeFile.SalaryAmount = null;
    this.employeeFile.ReceivedAmount=null;
    this.employeeFile.BilledAmount = null;
    this.employeeFile.Month = "0";
    this.employeeFile.FromBillNo = null;
    this.employeeFile.ToBillNo = null;
    this.employeeFile.TakeHome = null;
    this.employeeFile.Year = (new Date().getFullYear()).toString();
    this.toModel = null;
    this.RaisedBilloption = null;
    this.fromModel = null;
    this.toDate = null;
    this.fromDate = null;
    this.employeeId = 0;
    this.isReadonly = true;
    $('#checkall').prop('checked', false);
    this.singleEmployee = new Filter();
    this.autoCompleteModal = {
      data: [],
      placeholder: "All result"
    };
    this.LoadFiles();
  }

  resetFilter() {
    this.employeeFile.ClientName="";
    this.employeeFile.BillNo = "";
    this.employeeFile.Status='0';
    this.employeeFile.Year = (new Date().getFullYear()).toString();
    this.employeeFile.GSTAmount=null;
    this.employeeFile.GSTStatus='0';
    this.employeeFile.SalaryAmount = null;
    this.employeeFile.ReceivedAmount=null;
    this.employeeFile.BilledAmount = null;
    this.employeeFile.Month = "0";
    this.employeeFile.FromBillNo = null;
    this.employeeFile.ToBillNo = null;
    this.employeeFile.TakeHome = null;
    this.toModel = null;
    this.fromModel = null;
    this.toDate = null;
    this.fromDate = null;
    this.employeeId = 0;
    this.isReadonly = true;
    $('#checkall').prop('checked', false);
    this.singleEmployee = new Filter();
    this.autoCompleteModal = {
      data: [],
      placeholder: "All result"
    };
    let value = (document.querySelectorAll('input[name="bydate"]') );

  }

  advancedSearchPopUp() {
    //this.resetFilter();
    $("#advancedSearchModal").modal('show')
  }

  selectBillOption(e: any) {
    this.isReadonly = true;
    this.RaisedBilloption = e.target.value;
    if (this.RaisedBilloption == '0')
      this.isReadonly = false;
  }

  EditCurrentDocument(userFile: any) {
    if (this.nav) {
      this.nav.navigate(BuildPdf, userFile);
    }
  }

  toggleFilter() {
    this.filterbox = !this.filterbox;
  }

  updateGSTStatus(item: any) {
    if(item) {
      this.isGSTStatusModalReady = true;
      this.employeeFile = item;
      this.model = this.calendar.getToday();
      let selectedDate = new Date(this.model.year, this.model.month - 1, this.model.day);
      this.gstDetailForm.get("Paidon").setValue(selectedDate);
      this.currentRecordBillNo = item.BillNo;
      // this.gstDetailForm.get("Billno").setValue(BillNo);
      // let amount = Number(GSTAmount);
      //this.gstDetailForm.get("Amount").setValue(GSTAmount);
      this.isError = false;
      this.gstPaidOn();
      $('#gstupdateModal').modal('show');
    } else {
      Toast("Invalid record. No bill no#. found.");
    }
  }

  EditClient(data: any) {
    if (data !== null) {
      let ClientId = data;
      let ClientIsActive = false;
      if (ClientId !== null && ClientId !== "") {
        this.http.get(`Clients/GetClientById/${ClientId}/${ClientIsActive}/${UserType.Client}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(RegisterClient, response.ResponseBody);
          }
        }).catch(e => {
          ErrorToast("Got error to get data. Please contact to admin.");
        })
      }
    }
  }

  EditEmployee(item: any) {
    if (item !== null) {
      let EmpId = item;
      let EmpIsActive = 1;
      if (EmpId !== null && EmpId !== "") {
        this.http.get(`Employee/GetEmployeeById/${EmpId}/${EmpIsActive}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(ManageEmployee, response.ResponseBody);
          }
        }).catch(e => {
          ErrorToast("Got error to get data. Please contact to admin.");
        })
      }
    }
  }

  viewSendTemplete(e: any) {
    let value = e.target.value;
  }

  addEmailId() {
    let value = (document.querySelector('input[name="add-email"]') as HTMLInputElement).value;
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (value.match(validRegex)) {
      if (this.allSendRecEmails.find(i => i == value) == null){
        this.allSendRecEmails.push(value);
        (document.querySelector('input[name="add-email"]') as HTMLInputElement).value = '';
      }
    }
    else
      ErrorToast("Please enter a valid email id.");
  }

  removeEmail(index: number) {
    if (index >-1) {
      this.allSendRecEmails.splice(index, 1);
    }
  }

  sendEmail() {
    this.isLoading = true;
    if (this.FileDetail.ClientId >0 && Number(this.FileDetail.FileUid) > 0) {
      this.emailTemplate.Emails = this.allSendRecEmails;
      let data = {
        ClientId: this.FileDetail.ClientId,
        SenderId: 1,
        FileId: Number(this.FileDetail.FileUid),
        MonthName: this.FileDetail.Month.toUpperCase(),
        ForYear: this.FileDetail.Year,
        EmployeeId: this.FileDetail.FileOwnerId,
        EmailTemplateDetail: this.emailTemplate
      };

      this.http.post("bill/SendBillToClient", data).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Email send successfully");
          $('#sendfileModal').modal('hide');
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
}

export class BillDetails {
  Name: string = "";
  BillNo: string = '';
  CGST: number = 0;
  ClientId: number =0;
  ClientName: string = '';
  FileExtension: string = '';
  FileName: string = '';
  FileOwnerId: number = 0;
  FilePath: string = '';
  FileUid: number = 0;
  GeneratedOn: string = '';
  IGST: number = 0;
  Month: string = '';
  Year: string = '';
  PaidOn: string = '';
  SGST: number =0;
  SalaryAmount: number = null;
  Status: string = '';
  TDS: number = 0;
  ReceivedAmount: number =null;
  BilledAmount: number = null;
  GSTAmount: number =null;
  Total: number = 0;
  GSTStatus: string = '';
  fromModel: string = '';
  toModel: string = '';
  Employee: string = '';
  TakeHome: number = null;
  Absent: number = 0;
  FromBillNo: number = null;
  ToBillNo: number = null;
  NoOfDays: number = 0;
}
