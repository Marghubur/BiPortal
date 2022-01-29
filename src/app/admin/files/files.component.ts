import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { ResopnseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, Toast } from 'src/providers/common-service/common.service';
import { BuildPdf, Files } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import { EmployeeDetail } from '../manageemployee/manageemployee.component';
declare var $: any;

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  documentForm: FormGroup = null;
  isLoading: boolean = false;
  currentEmployeeDetail: EmployeeDetail = null;
  userFiles: Array<any> = [];
  fileLoaded: boolean = false;
  tableConfiguration: tableConfig = null;
  basePath: string = "";
  viewer: any = null;
  employee: any = null;
  model: NgbDateStruct;
  currentFileId: number = 0;
  billDetails: Array<BillDetails> = [];

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private common: CommonService,
    private calendar: NgbCalendar,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.model = this.calendar.getToday();
    this.basePath = this.http.GetImageBasePath();
    this.currentEmployeeDetail = this.nav.getValue();
    this.documentForm = this.fb.group({
      StatusId: new FormControl(0, Validators.required),
      UpdatedOn: new FormControl(new Date(), Validators.required),
      Notes: new FormControl("")
    });

    this.LoadFiles();
  }

  onDateSelection(e: NgbDate) {
    let selectedDate = new Date(e.year, e.month - 1, e.day);
    this.documentForm.get("UpdatedOn").setValue(selectedDate);
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

  editFile(FileUid: string) {
    let data = this.userFiles.filter(x => x.FileUid === FileUid);
    let newData = data[0];
    this.http.post(`OnlineDocument/EditFile`, newData).then(response => {
      this.common.ShowToast("File Reterive");
    }).catch(e => { console.log(e) });
  }

  deleteFile(FileUid: string) {
    let data = this.userFiles.filter(a => a.FileUid === FileUid);
    let newData = data[0];
    this.http.get(`OnlineDocument/DeleteData/${this.currentEmployeeDetail.EmployeeUid}`).then(response => {
      this.common.ShowToast("File Reterive");
    }).catch(e => { console.log(e) });
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
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  UpdateCurrent(FileUid: number) {
    this.currentFileId = Number(FileUid);
    $('#addupdateModal').modal('show');
  }

  closeWindow() {
    $('#addupdateModal').modal('hide');
  }

  LoadFiles() {
    this.http.get(`OnlineDocument/GetFilesAndFolderById/employee/${this.currentEmployeeDetail.EmployeeUid}`)
    .then((response: ResopnseModel) => {
      if (response.ResponseBody) {
        this.common.ShowToast("File or folder found");
        this.userFiles = response.ResponseBody["Files"];
        let emp = response.ResponseBody["Employee"];
        if (emp && emp.length > 0)
          this.employee = emp[0];
        this.fileLoaded = true;
      this.billDetails = new Array<BillDetails>();
        let i =0;
        let bills : BillDetails = null;
        let GST: number = 0;

        while (i < this.userFiles.length) {
          bills = new BillDetails();
          bills.BillNo = this.userFiles[i].BillNo;
          if(this.userFiles[i].IGST >0 || this.userFiles[i].SGST >0 || this.userFiles[i].CGST >0) {
            GST = ((this.userFiles[i].IGST + this.userFiles[i].SGST + this.userFiles[i].CGST)/100);
          } else {
            GST = 1;
          }
          bills.GSTAmount = this.userFiles[i].SalaryAmount * GST;
          bills.ClientId = this.userFiles[i].ClientId;
          bills.ClientName = this.userFiles[i].ClientName;
          bills.FileExtension = this.userFiles[i].FileExtension;
          bills.FileName = this.userFiles[i].FileName;
          bills.FileOwnerId = this.userFiles[i].FileOwnerId;
          bills.FilePath = this.userFiles[i].FilePath;
          bills.FileUid = this.userFiles[i].FileUid;
          bills.GeneratedOn = this.userFiles[i].GeneratedOn;
          bills.Month = this.userFiles[i].Month;
          bills.PaidOn = this.userFiles[i].PaidOn;
          bills.Status = this.userFiles[i].Status;
          bills.SalaryAmount = this.userFiles[i].SalaryAmount;
          bills.ReceivedAmount = (this.userFiles[i].SalaryAmount * (1 + GST)) - (this.userFiles[i].SalaryAmount /10);
          bills.BilledAmount = this.userFiles[i].SalaryAmount * (1 + GST);
          bills.TDS = (this.userFiles[i].SalaryAmount /10);
          this.billDetails.push(bills);
          i++;
        }
        // this.tableConfiguration = new tableConfig();
        // this.tableConfiguration.totalRecords = 1;
        // this.tableConfiguration.data = this.userFiles;
        // this.tableConfiguration.isEnableAction = true;
        // this.tableConfiguration.header = this.userService.getColumns(Files);
        // this.tableConfiguration.link = [
        //   { iconName: 'fa fa-cogs', fn: this.UpdateCurrent },
        //   { iconName: 'fa fa-pencil', fn: this.EditCurrentDocument },
        //   { iconName: 'fa fa-file-pdf-o', fn: this.viewPdfFile }
        //]
      } else {
        this.common.ShowToast("No file or folder found");
      }
    });
  }

  EditCurrentDocument(userFile: any) {
    if (this.nav) {
      this.nav.navigate(BuildPdf, userFile);
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
  SalaryAmount: number = 0;
  Status: string = '';
  TDS: number = 0;
  ReceivedAmount: number =0;
  BilledAmount: number = 0;
  GSTAmount: number =0;
}
