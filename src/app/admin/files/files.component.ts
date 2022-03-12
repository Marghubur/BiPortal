import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, GetStatus, MonthName, Toast, WarningToast, ErrorToast } from 'src/providers/common-service/common.service';
import { BuildPdf, Employees } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { DocumentUser, Files } from '../documents/documents.component';
import { EmployeeDetail } from '../manageemployee/manageemployee.component';

declare var $: any;

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  documentForm: FormGroup = null;
  filterbox: boolean = false;
  isLoading: boolean = false;
  currentEmployeeDetail: EmployeeDetail = null;
  userFiles: Array<any> = [];
  fileLoaded: boolean = false;
  tableConfiguration: tableConfig = null;
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

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private common: CommonService,
    private calendar: NgbCalendar,
    private userService: UserService
  ) {
    this.singleEmployee = new Filter();
    this.placeholderName = "Select Employee";
    this.employeeDetails = [{
      value: '0',
      text: 'Select Employee'
    }];
  }

  ngOnInit(): void {
    this.fromModel = null;
    this.toModel = null;
    this.model = null;
    this.employeeData = new Filter();
    this.employeeFile = new BillDetails();
    this.employeeFile.Status = "0";
    this.employeeFile.GSTStatus = '0';
    this.basePath = this.http.GetImageBasePath();
    this.currentEmployeeDetail = this.nav.getValue();
    this.employeeId = this.currentEmployeeDetail.EmployeeUid;
    this.autoCompleteModal = {
      data: [],
      placeholder: "Select Employee"
    }

    this.gstDetailForm = this.fb.group({
      GstId: new FormControl(0),
      Billno: new FormControl("", Validators.required),
      Gststatus: new FormControl("0", Validators.required),
      Paidon: new FormControl("", Validators.required),
      Paidby: new FormControl("0"),
      Amount: new FormControl(0)
    });

    this.documentForm = this.fb.group({
      StatusId: new FormControl(0, Validators.required),
      UpdatedOn: new FormControl(new Date(), Validators.required),
      Notes: new FormControl("")
    });

    this.LoadFiles();
  }

  alterResultSet(e: any) {
    if(e.target.checked)
      this.employeeId = 0;
    else
      this.employeeId = this.currentEmployeeDetail.EmployeeUid;
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
    let errorCount = 0;
    if (this.documentForm.get("StatusId").errors) {
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
          this.LoadFiles();
          Toast(response.ResponseBody);
        }
        this.closeWindow();
      });
    } else {
      Toast("Status and Update is mandatory fields.");
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

  submitGSTStatusDetail() {
    let errorCount = 0;
    this.isUploading = true;

    if (this.gstDetailForm.get("Gststatus").errors) {
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
          Toast(response.ResponseBody);
        }
        this.LoadFiles();
        this.closeWindow();
      });
    } else {
      Toast("Please fill all mandatory fields.");
    }
  }

  editFile(FileUid: string) {
    let data = this.userFiles.filter(x => x.FileUid === FileUid);
    let newData = data[0];
    this.http.post(`OnlineDocument/EditFile`, newData).then(response => {
      Toast("File Reterive");
    }).catch(e => {
      ErrorToast("Fail to edit.");
     });
  }

  deleteFile(FileUid: string) {
    let data = this.userFiles.filter(a => a.FileUid === FileUid);
    let newData = data[0];
    this.http.get(`OnlineDocument/DeleteData/${this.currentEmployeeDetail.EmployeeUid}`).then(response => {
      Toast("File Reterive");
    }).catch(e => {
      ErrorToast("Fail to delete.");
    });
  }

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
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}`;
    this.viewer = document.getElementById("file-container");
    this.viewer.classList.remove('d-none');
    let data = this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
    if (data == undefined) {
      Toast("hi")
    } else {
      Toast("new")
    }
  }

  UpdateCurrent(FileUid: number) {
    this.currentFileId = Number(FileUid);
    $('#addupdateModal').modal('show');
  }

  closeWindow() {
    $('#addupdateModal').modal('hide');
    $('#gstupdateModal').modal('hide');
  }

  LoadFiles() {
    this.isEmpPageReady = false;
    this.http.post(`OnlineDocument/GetFilesAndFolderById/employee/${this.employeeId}`, this.singleEmployee)
    .then((response: ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Record found.");
        let employees = response.ResponseBody.EmployeesList as Array<EmployeeDetail>;
        if(employees && employees.length > 0) {
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
          placeholder: "Select Employee"
        }
        this.fileLoaded = true;
        this.userFiles = response.ResponseBody["Files"];
        let exts = [];
        let i = 0;
        while(i < this.userFiles.length) {
          if(this.userFiles[i].FileName.indexOf(".pdf") == -1){
            this.userFiles[i].FileName += ".pdf";
          }
          i++;
        }

        let emp = response.ResponseBody["Employee"];
        if (emp && emp.length > 0)
          this.employee = emp[0];
        this.fileLoaded = true;
        this.billDetails = new Array<BillDetails>();
        i =0;
        let bills : BillDetails = null;
        let GST: number = 0;

        if(this.userFiles !== null && this.userFiles.length > 0) {
          this.singleEmployee.update(this.userFiles[0].Total);
          while (i < this.userFiles.length) {
            bills = new BillDetails();
            bills.BillNo = this.userFiles[i].BillNo;
            if(this.userFiles[i].IGST >0 || this.userFiles[i].SGST >0 || this.userFiles[i].CGST >0) {
              GST = ((this.userFiles[i].IGST + this.userFiles[i].SGST + this.userFiles[i].CGST)/100);
            } else {
              GST = 0;
            }
            bills.GSTStatus = GetStatus(this.userFiles[i].GstStatus);
            bills.GSTAmount = this.userFiles[i].SalaryAmount * GST;
            bills.ClientId = this.userFiles[i].ClientId;
            bills.ClientName = this.userFiles[i].ClientName;
            bills.FileExtension = this.userFiles[i].FileExtension;
            bills.FileName = this.userFiles[i].FileName;
            bills.FileOwnerId = this.userFiles[i].FileOwnerId;
            bills.FilePath = this.userFiles[i].FilePath;
            bills.FileUid = this.userFiles[i].FileUid;
            bills.GeneratedOn = this.userFiles[i].GeneratedOn;
            bills.Month = MonthName(this.userFiles[i].Month);
            bills.PaidOn = this.userFiles[i].PaidOn;
            bills.Status = this.userFiles[i].Status;
            bills.SalaryAmount = this.userFiles[i].SalaryAmount;
            bills.ReceivedAmount = (this.userFiles[i].SalaryAmount * (1 + GST)) - (this.userFiles[i].SalaryAmount /10);
            bills.BilledAmount = this.userFiles[i].SalaryAmount * (1 + GST);
            bills.TDS = (this.userFiles[i].SalaryAmount /10);
            this.billDetails.push(bills);
            i++;
          }
        }
      } else {
        WarningToast("No file or folder found");
      }

      this.isEmpPageReady = true;
    });
  }

  fromDateSelection(e: NgbDateStruct) {
    this.fromDate = e; //`${e.year}-${e.month}-${e.day}`;
  }

  toDateSelection(e: NgbDateStruct) {
    this.toDate = e; //`${e.year}-${e.month}-${e.day}`;
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    let fromDateValue = "";
    let toDateValue = "";
    let isDateFilterEnable = false;

    this.singleEmployee.reset();
    if (this.fromDate !== null) {
      if (this.toDate == null) {
        Toast("Please selete to date to get the result.")
        return;
      }
      isDateFilterEnable = true;
    } else if(this.fromDate == null && this.toDate !== null) {
      Toast("Please selete from date to get the result.")
      isDateFilterEnable = true;
      return;
    }

    if (isDateFilterEnable) {
      let fromDateTime = new Date(this.fromDate.year, this.fromDate.month, this.fromDate.day).getTime();
      let toDateTime = new Date(this.toDate.year, this.toDate.month, this.toDate.day).getTime();
      if (fromDateTime > toDateTime) {
        Toast("Please select cottect From Date and To date");
        return;
      } else {
        fromDateValue = `${this.fromDate.year}-${this.fromDate.month}-${this.fromDate.day}`;
        toDateValue = `${this.toDate.year}-${this.toDate.month}-${this.toDate.day}`;
      }
    }

    if(this.employeeFile.ClientName !== null && this.employeeFile.ClientName !== "") {
      searchQuery += ` ClientName like '${this.employeeFile.ClientName}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.BillNo !== null && this.employeeFile.BillNo !== "") {
      searchQuery += ` ${delimiter} b.BillNo like '%${this.employeeFile.BillNo}' `;
      delimiter = "and";
    }

    if(this.employeeFile.Status !== '0' && this.employeeFile.Status !== "") {
      let StatusValue = '';
      if (this.employeeFile.Status == '1') {
        StatusValue = "Completed";
      }
      else if (this.employeeFile.Status == '2') {
        StatusValue = "Pending";
      }
      else if (this.employeeFile.Status == '3') {
        StatusValue = "Canceled";
      } else {
        StatusValue = '';
      }
      searchQuery += ` ${delimiter} Status = '${StatusValue}' `;
      delimiter = "and";
    }

    if(this.employeeFile.GSTAmount !== null && this.employeeFile.GSTAmount !== 0) {
      searchQuery += ` ${delimiter} GSTAmount like '%${this.employeeFile.GSTAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.GSTStatus !== '0' && this.employeeFile.GSTStatus !== "") {
      searchQuery += ` ${delimiter} GSTStatus = '${this.employeeFile.GSTStatus}' `;
      delimiter = "and";
    }

    if(this.employeeFile.SalaryAmount !== null && this.employeeFile.SalaryAmount !== 0) {
      searchQuery += ` ${delimiter} PaidAmount like '${this.employeeFile.SalaryAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.ReceivedAmount !== null && this.employeeFile.ReceivedAmount !== 0) {
      searchQuery += ` ${delimiter} ReceivedAmount like '${this.employeeFile.ReceivedAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.BilledAmount !== null && this.employeeFile.BilledAmount !== 0) {
      searchQuery += ` ${delimiter} BilledAmount like '${this.employeeFile.BilledAmount}%' `;
      delimiter = "and";
    }

    if(this.employeeFile.Month !== null && this.employeeFile.Month !== "") {
      searchQuery += ` ${delimiter} Month like '${this.employeeFile.Month}%' `;
      delimiter = "and";
    }

    if(isDateFilterEnable) {
      searchQuery += ` ${delimiter} BillUpdatedOn between '${fromDateValue}' and '${toDateValue}'`;
    }

    if(searchQuery !== "") {
      this.singleEmployee.SearchString = `1=1 And ${searchQuery}`;
    }

    this.LoadFiles();
  }

  resetFilter() {
    this.employeeFile.ClientName="";
    this.employeeFile.BillNo = "";
    this.employeeFile.Status='0';
    this.employeeFile.GSTAmount=null;
    this.employeeFile.GSTStatus='0';
    this.employeeFile.SalaryAmount = null;
    this.employeeFile.ReceivedAmount=null;
    this.employeeFile.BilledAmount = null;
    this.employeeFile.Month = "";
    this.toModel = null;
    this.fromModel = null;
    this.toDate = null;
    this.fromDate = null;
    this.employeeId = this.currentEmployeeDetail.EmployeeUid;
    //this.unckeck();
    // this.anyFilter = "";
    $('#checkall').prop('checked', false);
    this.singleEmployee = new Filter();
    this.LoadFiles();
  }

  EditCurrentDocument(userFile: any) {
    if (this.nav) {
      this.nav.navigate(BuildPdf, userFile);
    }
  }

  toggleFilter() {
    this.filterbox = !this.filterbox;
  }

  updateGSTStatus(BillNo: string, GSTAmount: string) {
    if(BillNo) {
      this.model = this.calendar.getToday();
      let selectedDate = new Date(this.model.year, this.model.month - 1, this.model.day);
      this.gstDetailForm.get("Paidon").setValue(selectedDate);
      this.currentRecordBillNo = BillNo;
      this.gstDetailForm.get("Billno").setValue(BillNo);
      let amount = Number(GSTAmount);
      if(!isNaN(amount)) {
        this.gstDetailForm.get("Amount").setValue(amount);
        $('#gstupdateModal').modal('show');
      } else {
        Toast("Invalid GST amount");
      }
    } else {
      Toast("Invalid record. No bill no#. found.");
    }
  }
}

export class BillDetails {
  BillNo: string = '';
  CGST: number = 0;
  ClientId: number =0;
  ClientName: string = '';
  FileExtension: string = '';
  FileName: string = '';
  FileOwnerId: number = 0;
  FilePath: string = '';
  FileUid: string = '';
  GeneratedOn: string = '';
  IGST: number = 0;
  Month: string = '';
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
}
