import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
declare var $: any;
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-master-data',
  templateUrl: './master-data.component.html',
  styleUrls: ['./master-data.component.scss']
})
export class MasterDataComponent implements OnInit {
  active = 1;
  isUploadFile: boolean = true;
  file: File;
  fileSize: string;
  fileName: string;
  isFileReady: boolean = false;
  noOfRecords: number;
  recordToUpload: any;
  isDisable: boolean = true;
  isAvailable: boolean = false;
  isLoading: boolean = false;
  basePath:string = null;
  sampleFilePath: string = null;

  constructor(private http: CoreHttpService) { }

  ngOnInit(): void {
    this.basePath =  this.http.GetImageBasePath();
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.fileSize = (this.file.size / 1024).toFixed(2);
      this.fileName = this.file.name;
      this.isFileReady = true;
      this.isDisable = false;
      this.isUploadFile = false;
    }
  }

  excelfireBrowserFile() {
    $("#uploadexcelreader").click();
  }

  excelPopUp() {
    this.isAvailable = false;
    $('#excelSheetReaderModal').modal('show');
  }

  cleanFileHandler() {
    $("#uploadexcelreader").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.noOfRecords = 0;
    event.stopPropagation();
    event.preventDefault();
    this.isAvailable=false;
    this.isDisable = true;
    this.isUploadFile = true;
  }

  uploadExcel() {
    this.isLoading = true;
    this.isAvailable = true;
    $('#excelSheetReaderModal').modal('hide');
    this.isLoading = false;
  }

  uploadEmployeeExcelSheet() {
    this.isLoading = true;
    if (this.file) {
      let formData = new FormData();
      formData.append("payrolldata", this.file);
      this.http.post("Employee/UploadEmployeeExcel", formData)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          let data = response.ResponseBody;
          if (data.length > 0) {
            this.cleanFileHandler();
            Toast("Data Uploaded successfull");
            this.isLoading = false;
          }
        } else {
          ErrorToast("Unable to upload the data");
        }
      }).catch(e => {
        ErrorToast(e.HttpStatusMessage)
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      WarningToast("Please upload atleast one record");
    }
  }

  uploadExcelSheet() {
    this.isLoading = true;
    if (this.file) {
      let formData = new FormData();
      formData.append("payrolldata", this.file);
      this.http.post("UploadPayrollData/UploadPayrollExcel", formData)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          let data = response.ResponseBody;
          if (data.length > 0) {
            this.cleanFileHandler();
            Toast("Data Uploaded successfull");
            this.isLoading = false;
          }
        } else {
          ErrorToast("Unable to upload the data");
        }
      }).catch(e => {
        ErrorToast(e.HttpStatusMessage)
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      WarningToast("Please upload atleast one record");
    }
  }

  getEmployeeSampleFile() {
    this.sampleFilePath = "https://www.emstum.com/bot/dn/Files/ApplicationFiles/SampleExcel/EmployeeRecordSample.xlsx";
    const a = document.createElement('a');
    a.href = this.sampleFilePath;
    a.download = 'EmployeeRecordSample.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(this.sampleFilePath);
  }

  getEmployeeWithPayrollSampleFile() {
    this.sampleFilePath = "https://www.emstum.com/bot/dn/Files/ApplicationFiles/SampleExcel/Employee_with_payroll_data_sample.xlsx";
    const a = document.createElement('a');
    a.href = this.sampleFilePath;
    a.download = 'Employee_with_payroll_data_sample.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(this.sampleFilePath);
  }
}
