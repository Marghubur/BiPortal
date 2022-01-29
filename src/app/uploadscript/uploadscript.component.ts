import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "src/providers/common-service/common.service";
import { ApplicationStorage } from "src/providers/ApplicationStorage";
import { WorkBook, read, utils, write, readFile } from "xlsx";
// @ts-ignore
import { saveAs } from 'file-saver';
declare var $:any;
import { Dictionary } from "src/providers/Generic/Code/Dictionary";

@Component({
  selector: "app-uploadscript",
  templateUrl: "./uploadscript.component.html",
  styleUrls: ["./uploadscript.component.scss"]
})
export class UploadscriptComponent implements OnInit {
  wbout = [];
  table = [];
  file: any;
  fileSize: string = '';
  fileName: string = '';
  isFileReady: boolean = false;
  noOfRecords: number = 0;
  recordToUpload: any;
  ws: any;
  IsResultGenerated: boolean = false;
  ScriptFileName: string = "";
  DynamicTableResult: Array<any> = [];
  constructor(
    private http: AjaxService,
    private common: CommonService,
    private storage: ApplicationStorage
  ) {}

  s2ab(s: any) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  ngOnInit() {}

  SaveToExcel(tableData: any, fileName: string = "QuestionSheet") {
    this.setTableData(tableData, fileName);
    saveAs(
      new Blob([this.s2ab(this.wbout)], { type: "application/octet-stream" }),
      fileName + ".xlsx"
    );
  }

  getTableData() {
    return this.table;
  }

  setTableData(tableData: any, fileName: string) {
    this.table = tableData;
    this.setExcelProperties(fileName);
  }

  setExcelProperties(fileName: string) {
    const ws_name = fileName.substr(0, 25); //'QuestionSheet'
    //  const ws_name = ''; // worksheet name cannot exceed 31 chracters length
    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    this.ws = utils.json_to_sheet(this.getTableData());
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = this.ws;
    this.wbout = write(wb, { bookType: "xlsx", bookSST: true, type: "binary" });
  }

  convertToJson(onlyHeader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let workbookkk: any = null;
      let XL_row_object;
      let TempDictionary = new Dictionary<string, any>();
      reader.readAsBinaryString(this.file);
      reader.onload = function() {
        let data = reader.result;
        workbookkk = read(data, { type: "binary" });
        workbookkk.SheetNames.forEach(function(sheetName: any) {
          XL_row_object = utils.sheet_to_json(workbookkk.Sheets[sheetName]);
          let position = TempDictionary.hasKey(sheetName);
          if (
            position === -1 &&
            XL_row_object !== null &&
            XL_row_object.length > 0
          ) {
            let RowDetail: any = XL_row_object[0];
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

  GenerateDynamicTable(Result: any): any {
    let GenerateGridHeader = [];
    let GeneratedRows = [];
    let ResultingDynamicGrid: any = {
      header: [],
      body: []
    };
    if (this.common.IsValid(Result)) {
      let TableKey = Object.keys(Result);
      if (Result.length > 0) {
        let FirstRow = Result[0];
        let Columns = Object.keys(FirstRow);
        if (Columns.length > 0) {
          let colIndex = 0;
          while (colIndex < Columns.length) {
            GenerateGridHeader.push({
              ColumnName: Columns[colIndex]
            });
            colIndex++;
          }
        }

        if (Result.length > 15) {
          let index = 0;
          while (index < 15) {
            GeneratedRows.push(Result[index]);
            index++;
          }
        } else {
          GeneratedRows = Result;
        }
      }
    }
    ResultingDynamicGrid["header"] = GenerateGridHeader;
    ResultingDynamicGrid["body"] = GeneratedRows;
    return ResultingDynamicGrid;
  }

  uploadExcelSheet() {
    let e: any = event;
    e.stopPropagation();
    e.preventDefault();
    let UploadingData = this.recordToUpload.getMap();
    if (UploadingData !== null && UploadingData.length > 0) {
      this.http.post("UploadExcelData", UploadingData).then(result => {
        this.DynamicTableResult = [];
        if (this.common.IsValid(result)) {
          let ActualResultSet = result["schemaDataResults"];
          this.ScriptFileName = result["FileName"];
          let index = 0;
          let SingleResult = null;
          let InsertQuery = "";
          let CreateSchema = "";
          let ProcedureSchema = "";
          let IsGrid = false;
          let IsGridJson = false;
          let IsCreateSchema = false;
          let IsProcedureSchema = false;
          let BynamicBindingGridDetail: any = {};
          while (index < ActualResultSet.length) {
            SingleResult = ActualResultSet[index];
            if (typeof SingleResult["Table"] !== "undefined") {
              InsertQuery = JSON.stringify(SingleResult["InsertQuery"]);
              BynamicBindingGridDetail = this.GenerateDynamicTable(
                SingleResult["Table"]
              );
              if (
                this.common.IsValid(BynamicBindingGridDetail["header"]) &&
                this.common.IsValid(BynamicBindingGridDetail["body"])
              ) {
                IsGrid = true;
              } else {
                BynamicBindingGridDetail = [];
              }
              IsGridJson = true;
            }

            if (typeof SingleResult["Schema"] !== "undefined") {
              CreateSchema = SingleResult["Schema"];
              IsCreateSchema = true;
            }

            if (typeof SingleResult["ProcedureSchema"] !== "undefined") {
              ProcedureSchema = SingleResult["ProcedureSchema"];
              IsProcedureSchema = true;
            }

            this.DynamicTableResult.push({
              TableCreateSchema: CreateSchema,
              TableProcedureSchema: ProcedureSchema,
              GridHeader: BynamicBindingGridDetail["header"],
              GridData: BynamicBindingGridDetail["body"],
              GridJsonData: InsertQuery,
              TableName: SingleResult["TableName"],
              IsGridRequired: IsGridJson,
              IsGridJsonRequired: IsGridJson,
              IsCreateSchemaRequired: IsCreateSchema,
              IsProcedureSchemaRequired: IsProcedureSchema
            });
            index++;
          }
          this.IsResultGenerated = true;
          this.common.ShowToast("Result generated successfully");
          // this.common.ScrollPageToId("userdefinedtabledetail");
        } else {
          this.common.ShowToast("Table creation error");
        }
        this.cleanFileHandler();
      });
    } else {
      this.common.ShowToast(
        "Excel file is empty. Please fill atleast one row."
      );
    }
  }

  fireBrowserFile() {
    $("#uploadexcel").click();
  }

  cleanFileHandler() {
    let e: any = event;
    $("#uploadexcel").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.noOfRecords = 0;
    e.stopPropagation();
    e.preventDefault();
  }

  CloseGeneratePopup() {
    this.IsResultGenerated = false;
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.convertToJson().then(data => {
        if (this.common.IsValid(data)) {
          this.recordToUpload = data;
          this.fileSize = (this.file.size / 1024).toFixed(2);
          this.fileName = this.file.name;
          this.noOfRecords = this.recordToUpload.length;
          this.isFileReady = true;
        } else {
          this.cleanFileHandler();
          this.common.ShowToast("Excel data is not valid.");
        }
      });
    }
  }
}
