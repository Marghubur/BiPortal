import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService, tableConfig } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { Dictionary } from 'src/providers/Generic/Code/Dictionary';
// import { read, utils } from 'xlsx';
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
  ws: any;
  isDisable: boolean = true;
  tableConfiguration: tableConfig = null;
  isAvailable: boolean = false;
  masterDataDetails: Array<any> = [];
  isLoading: boolean = false;

  constructor(private http: AjaxService) { }

  ngOnInit(): void {
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];

    if (this.file !== undefined && this.file !== null) {
      this.convertToJson(false).then(data => {
        if (data) {
          this.recordToUpload = data;
          this.fileSize = (this.file.size / 1024).toFixed(2);
          this.fileName = this.file.name;
          this.noOfRecords = this.recordToUpload.length;
          this.isFileReady = true;
          this.isDisable = false;
          this.isUploadFile = false;
          let excelData = data.mapTable[0];
          let rows: any = excelData;
          if (excelData) {
            this.tableConfiguration = new tableConfig();
            this.tableConfiguration.totalRecords = 1;
            this.tableConfiguration.header = excelData.value.Keys;
            this.tableConfiguration.data = rows.value.Data;
            this.tableConfiguration.sampleData = this.tableConfiguration.data.slice(0, 10); 
            // this.uploadedCandidatesData.TotalRecords = 0;
            // if(this.tableConfiguration.data.length > 0) {
            //   this.uploadedCandidatesData.TotalRecords = this.tableConfiguration.data.length;
            // }
            this.masterDataDetails = this.tableConfiguration.data;
            this.tableConfiguration.isEnableAction = true;
          }
        } else {
          this.cleanFileHandler();
          ErrorToast("Excel data is not valid.");
        }
      });
    }
  }

  convertToJson(onlyHeader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let workbookkk;
      let XL_row_object;
      let TempDictionary = new Dictionary<string, any>();
      reader.readAsBinaryString(this.file);
      reader.onload = function () {
        let data = reader.result;
        // workbookkk = read(data, { type: "binary" });
        workbookkk.SheetNames.forEach(function (sheetName) {
          XL_row_object = null;// utils.sheet_to_json(workbookkk.Sheets[sheetName]);
          let position = TempDictionary.hasKey(sheetName);
          if (
            position === -1 &&
            XL_row_object !== null &&
            XL_row_object.length > 0
          ) {
            let RowDetail = XL_row_object[0];
            let ColumnDetail = [];
            if (RowDetail !== null) {
              if (typeof RowDetail === "object") {
                let Keys = Object.keys(RowDetail);
                let index = 0;
                let Type = "";
                while (index < Keys.length) {
                  Type = typeof RowDetail[Keys[index]];
                  if (
                    Type === "undefined" ||
                    RowDetail[Keys[index]] === null ||
                    RowDetail[Keys[index]] == ""
                  ) {
                    Type = "string";
                  }
                  ColumnDetail.push({
                    ColumnName: Keys[index],
                    ColumnType: Type
                  });
                  index++;
                }
              }
            }
            let SheetData = {
              Keys: ColumnDetail,
              Data: onlyHeader ? null : XL_row_object
            };
            TempDictionary.insert(sheetName, SheetData);
          }
          resolve(TempDictionary);
        });
      };
    });
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
    this.isAvailable = true;
    $('#excelSheetReaderModal').modal('hide');
  }

  uploadExcelSheet($e: any) {
    this.isLoading = true;
    $e.preventDefault();
    $e.stopPropagation();
    let errroCounter = 0;

    if (errroCounter === 0 && this.masterDataDetails.length > 0) {
      this.http.post("Employee/UploadEmployeeExcel", this.masterDataDetails)
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
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      WarningToast("Please upload atleast one record");
    }
  }

}
