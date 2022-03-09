import { Component, OnInit } from '@angular/core';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, Toast } from 'src/providers/common-service/common.service';
import { Doc, FlatFile, Pdf, Resume, Txt, UserType, Zip } from 'src/providers/constants';
import { ResponseModel } from 'src/auth/jwtService';
import { Dictionary } from 'src/providers/Generic/Code/Dictionary';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { read, utils, WorkBook, write } from 'xlsx';
import { DocumentUser } from '../documents/documents.component';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  wbout = [];
  table = [];
  file: File;
  fileSize: string;
  fileName: string;
  isFileReady: boolean = false;
  noOfRecords: number;
  recordToUpload: any;
  ws: any;
  IsResultGenerated: boolean = false;
  ScriptFileName: string = "";
  DynamicTableResult: Array<any>;
  ExcelTableHeader: Array<any>;
  ExcelTableData: Array<any>;
  pageIndex: number = 1;
  pageSize: number = 15;
  curentSection: string = 'Resume';
  baseUrl: string;
  excelPath: string;
  tableConfiguration: tableConfig = null;
  isAvailable: boolean = false;
  resumeFiles: Array<ResumeFiles> = [];
  resumeFile: ResumeFiles = null;
  anyFilter: string = "";
  isRecordAvailable: boolean = false;
  columns: Array<any> = [];
  expandedTable: boolean = true;
  isDiasble: boolean = true;
  isUploadFile: boolean = true;
  DocumentImageObjects: Array<any> = [];
  FileDocuments: Array<any> = [];
  FileDocumentList: Array<any> = [];
  candidatesData: Filter = null;
  uploadedCandidatesData: Filter = null;

  constructor(
    private http: AjaxService,
    private userService: UserService,
    private common: CommonService,
    private nav: iNavigation
  ) {
    this.columns = this.GetMappedColumns();
  }

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  }

  displayActivePage(activePageNumber: number){

  }

  ngOnInit() {
    this.uploadedCandidatesData = new Filter();
    this.candidatesData = new Filter();

    this.resumeFile = new ResumeFiles();
    this.baseUrl = this.http.GetImageBasePath();
    this.ExcelTableHeader = [];
    this.ExcelTableData = [];
    this.getUploadedDetails();
  }

  fireBrowserFile() {
    $("#uploadexcel").click();
  }

  SaveToExcel(tableData, fileName: string = "QuestionSheet") {
    this.setTableData(tableData, fileName);
    saveAs(
      new Blob([this.s2ab(this.wbout)], { type: "application/octet-stream" }),
      fileName + ".xlsx"
    );
  }

  getTableData() {
    return this.table;
  }

  setTableData(tableData, fileName: string) {
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

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.convertToJson(false).then(data => {
        if (this.common.IsValid(data)) {
          this.recordToUpload = data;
          this.fileSize = (this.file.size / 1024).toFixed(2);
          this.fileName = this.file.name;
          this.noOfRecords = this.recordToUpload.length;
          this.isFileReady = true;
          this.isDiasble = false;
          this.isUploadFile = false;
          let excelData = data.mapTable[0];
          let rows: any = excelData;
          if (excelData) {
            this.tableConfiguration = new tableConfig();
            this.tableConfiguration.totalRecords = 1;
            this.tableConfiguration.header = excelData.value.Keys;
            this.tableConfiguration.data = rows.value.Data;
            this.uploadedCandidatesData.TotalRecords = 0;
            if(this.tableConfiguration.data.length > 0) {
              this.uploadedCandidatesData.TotalRecords = this.tableConfiguration.data.length;
            }
            this.tableConfiguration.isEnableAction = true;
            this.isAvailable = true;
            this.ValidateHeader();
          }
        } else {
          this.cleanFileHandler();
          this.common.ShowToast("Excel data is not valid.");
        }
      });
    }
  }

  GetMappedColumns() {
    return [
      { "Title": "Name", "DbName": "Name" },
      { "Title": "Email", "DbName": "Email_ID" },
      { "Title": "Mobile", "DbName": "Phone_Number" },
      { "Title": "Alternet No.#", "DbName": "Alternet_Number" },
      { "Title": "Source of Application", "DbName": "Source_Of-Application" },
      { "Title": "Job Title", "DbName": "Job_Title" },
      { "Title": "Date of Application", "DbName": "Date_of_Application" },
      { "Title": "Total Experience", "DbName": "Total_Experience" },
      { "Title": "Annual Salary", "DbName": "Annual_Salary" },
      { "Title": "Notice Period", "DbName": "Notice_Period" },
      { "Title": "Expected CTC", "DbName": "Expected_CTC" },
      { "Title": "Feedback", "DbName": "Feedback"},
      { "Title": "Current Location", "DbName": "Current_Location" },
      { "Title": "Preferred Location", "DbName": "Preferred_Location" },
      { "Title": "Current Company Name", "DbName": "Current_Company_name" },
      { "Title": "Current Company Designation", "DbName": "Current_Company_Designation" },
      { "Title": "Functional Area", "DbName": "Functional_Area" },
      { "Title": "Role", "DbName": "Role" },
      { "Title": "Industry", "DbName": "Industry" },
      { "Title": "Key Skills", "DbName": "Key_Skills" },
      { "Title": "Resume Headline", "DbName": "Resume_Headline" },
      { "Title": "Summary", "DbName": "Summary" },
      { "Title": "Under Graduation Degree", "DbName": "Under_Graduation_degree" },
      { "Title": "Ug Specialization", "DbName": "UG_Specialization" },
      { "Title": "Ug University/ Institute Name", "DbName": "UG_University_institute_Name" },
      { "Title": "Ug Graduation Year", "DbName": "UG_Graduation_Year" },
      { "Title": "Post Graduation Degree", "DbName": "Post_graduation_degree" },
      { "Title": "Pg Specialization", "DbName": "PG_specialization" },
      { "Title": "Pg university/ Institution Name", "DbName": "PG_university_institute_name" },
      { "Title": "Pg Graduation Year", "DbName": "PG_graduation_Year" },
      { "Title": "Doctorate Degree", "DbName": "Doctorate_degree" },
      { "Title": "Doctorate Specialization", "DbName": "Doctirate_specialization" },
      { "Title": "Doctorate University/ Institution Name", "DbName": "Doctorate_university_institution_name" },
      { "Title": "Doctorate Graduation Year", "DbName": "Doctorate_graduation_year" },
      { "Title": "Gender", "DbName": "Gender" },
      { "Title": "Marital Status", "DbName": "Marital_Status" },
      { "Title": "Hone Town/ City", "DbName": "Home_Town_City" },
      { "Title": "Pin Code", "DbName": "Pin_Code" },
      { "Title": "Work permit for USA", "DbName": "Work_permit_for_USA" },
      { "Title": "Current Location", "DbName": "Current_Location" },
      { "Title": "Date of Birth", "DbName": "Date_of_Birth" },
      { "Title": "Last Workflow Activity", "DbName": "Last_Workflow_activity" },
      { "Title": "Last Workflow Activity By", "DbName": "Last_Workflow_activity_by" },
      { "Title": "Time of Last Workflow Activity Update", "DbName": "Time_of_Last_Workflow_activity_Update" },
      { "Title": "Pipeline Status Updated By", "DbName": "Pipeline_Status_Updated_By" },
      { "Title": "Time When Stage Updated", "DbName": "Time_when_Stage_updated" },
      { "Title": "Latest Star Rating", "DbName": "Latest_Star_Rating" },
      { "Title": "Viewed", "DbName": "Viewed" },
      { "Title": "Viewed By", "DbName": "Viewed_By" },
      { "Title": "Time of View", "DbName": "Time_Of_Email" },
      { "Title": "Emailed", "DbName": "Emailed" },
      { "Title": "Emailed By", "DbName": "Emailed_By" },
      { "Title": "Time of Email", "DbName": "Time_Of_Emailed" },
      { "Title": "Calling Status", "DbName": "Calling_Status"},
      { "Title": "Calling Status Updated By", "DbName": "Calling_Status_Updated_By" },
      { "Title": "Time of Calling Activity Update", "DbName": "Time_oF_Calling_activity_update" },
      { "Title": "Comment 1", "DbName": "Comment_1" },
      { "Title": "Comment 1 By", "DbName": "Comment_1_By" },
      { "Title": "Time Comment 1 Posted", "DbName": "Time_Comment_1_posted" },
      { "Title": "Comment 2", "DbName": "Comment_2" },
      { "Title": "Comment 2 By", "DbName": "Comment_2_By" },
      { "Title": "Time Comment 2 Posted", "DbName": "Time_Comment_2_posted" },
      { "Title": "Comment 3", "DbName": "Comment_3" },
      { "Title": "Comment 3 By", "DbName": "Comment_3_By" },
      { "Title": "Time Comment 3 Posted", "DbName": "Time_Comment_3_posted" },
      { "Title": "Comment 4", "DbName": "Comment_4" },
      { "Title": "Comment 4 By", "DbName": "Comment_4_By" },
      { "Title": "Time Comment 4 Posted", "DbName": "Time_Comment_4_posted" },
      { "Title": "Comment 5", "DbName": "Comment_5" },
      { "Title": "Comment 5 By", "DbName": "Comment_5_By" },
      { "Title": "Time Comment 5 Posted", "DbName": "Time_Comment_5_posted" }
    ];
  }

  ValidateHeader() {
    if (this.tableConfiguration.header) {
      let fields = this.getFiledsMap();
      let notFoundFields = [];
      let currentField = null;
      this.resumeFiles = new Array<ResumeFiles>();
      let resume: ResumeFiles = null;
      let value = null;
      let i = 0;
      let index = 0;
      while (i < this.tableConfiguration.data.length) {
        resume = new ResumeFiles();
        while (index < fields.length) {
          currentField = this.tableConfiguration.header.find(x => x.ColumnName.toLowerCase().indexOf(fields[index]) !== -1);
          if (!currentField) {
            notFoundFields.push(fields[i]);
          } else {
            switch (currentField.ColumnName.toLowerCase()) {
              case "source of application":
                resume.Source_Of_Application = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "job title":
                resume.Job_Title = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "date of application":
                value = this.tableConfiguration.data[i][currentField.ColumnName];
                try {
                  resume.Date_of_application = new Date(value);
                } catch (e) {
                  resume.Date_of_application = null;
                }
                break;
              case "name":
                resume.Name = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "email id":
                resume.Email_ID = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "phone number":
                value = this.tableConfiguration.data[i][currentField.ColumnName];
                if (value != null) {
                  let items = value.toString().split(",");
                  if (items.length > 1) {
                    resume.Phone_Number = items[0].trim();
                    value = items.splice(1, 1);
                    resume.Alternet_Numbers = value.join(',');
                  } else {
                    resume.Phone_Number = value.toString().trim();
                    resume.Alternet_Numbers = null;
                  }
                }
                break;
              case "total experience":
                value = this.tableConfiguration.data[i][currentField.ColumnName];
                let exp = value.toLocaleLowerCase().replace('year(s) ', '').replace('month(s)', '').trim();
                try {
                  if (exp) {
                    value = exp.split(' ')
                    if (value.length == 2) {
                      let year = Number(value[0]);
                      let months = Number(value[1]);
                      if (!isNaN(year) && !isNaN(months)) {
                        resume.Total_Experience = year * 12 + months;
                      }
                    } else {
                      resume.Total_Experience = 0;
                    }
                  }
                } catch {
                  resume.Total_Experience = 0;
                }
                break;
              case "annual salary":
                resume.Annual_Salary = this.tableConfiguration.data[i][currentField.ColumnName];

                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value)) {
                  resume.Annual_Salary = value;
                } else {
                  resume.Annual_Salary = 0;
                }
                break;
              case "notice period":
                resume.Notice_Period = this.tableConfiguration.data[i][currentField.ColumnName];

                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value)) {
                  resume.Notice_Period = Number(value);
                } else {
                  resume.Notice_Period = 0;
                }
                break;
              case "expected ctc":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value)) {
                  resume.Expeceted_CTC = value;
                } else {
                  resume.Expeceted_CTC = 0;
                }
                break;
              case "feedback":
                resume.Feedback = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "current location":
                resume.Current_Location = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "preferred locations":
                resume.Preferred_Locations = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "current company name":
                resume.Current_Company_name = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "current company designation":
                resume.Current_Company_Designation = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "functional area":
                resume.Functional_Area = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "role":
                resume.Role = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "industry":
                resume.Industry = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "key skills":
                resume.Key_Skills = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "resume headline":
                resume.Resume_Headline = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "summary":
                resume.Summary = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "under graduation degree":
                resume.Under_Graduation_degree = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "ug specialization":
                resume.UG_Specialization = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "ug university/institute name":
                resume.UG_University_institute_Name = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "ug graduation year":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName])
                if (!isNaN(value)) {
                  resume.UG_Graduation_year = value;
                };
                break;
              case "post graduation degree":
                resume.Post_graduation_degree = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "pg specialization":
                resume.PG_specialization = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "pg university/institute name":
                resume.PG_university_institute_name = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "pg graduation year":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value))
                  resume.PG_graduation_year = value;
                break;
              case "doctorate degree":
                resume.Doctorate_degree = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "doctorate specialization":
                resume.Doctorate_specialization = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "doctorate university/institute name":
                resume.Doctorate_university_institute_name = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "doctorate graduation year":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value))
                  resume.Doctorate_graduation_year = value;
                break;
              case "gender":
                resume.Gender = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "marital status":
                resume.Marital_Status = false;
                value = this.tableConfiguration.data[i][currentField.ColumnName];
                if (value == 1)
                  resume.Marital_Status = true;
                break;
              case "home town/city":
                resume.Home_Town_City = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "pin code":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value)) {
                  resume.Pin_Code = value;
                }
                break;
              case "work permit for usa":
                resume.Work_permit_for_USA = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "current location":
                resume.Current_Location = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "date of birth":
                value = this.tableConfiguration.data[i][currentField.ColumnName];
                if (value != null) {
                  try {
                    resume.Date_of_Birth = new Date(value);
                  } catch {
                    resume.Date_of_Birth = null;
                  }
                }
                break;
              case "latest star rating":
                value = Number(this.tableConfiguration.data[i][currentField.ColumnName]);
                if (!isNaN(value)) {
                  resume.Latest_Star_Rating = value;
                }
                break;
              case "viewed":
                resume.Viewed = this.tableConfiguration.data[i][currentField.ColumnName];
                if (resume.Viewed != null) {
                  resume.Viewed = resume.Viewed.toString();
                }
                break;
              case "viewed by":
                resume.Viewed_By = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time of view":
                resume.Time_Of_View = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "emailed":
                resume.Emailed = this.tableConfiguration.data[i][currentField.ColumnName];
                if (resume.Emailed != null) {
                  resume.Emailed = resume.Emailed.toString();
                }
                break;
              case "emailed by":
                resume.Emailed_By = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time of email":
                try {
                  resume.Time_Of_Email = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Of_Email = null;
                }
                break;
              case "calling status":
                resume.Calling_Status = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "calling status updated by":
                resume.Calling_Status_updated_by = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time of calling activity update":
                try {
                  resume.Time_of_Calling_activity_update = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_of_Calling_activity_update = null;
                }
                break;
              case "comment 1":
                resume.Comment_1 = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "comment 1 by":
                resume.Comment_1_BY = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time comment 1 posted":
                try {
                  resume.Time_Comment_1_posted = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Comment_1_posted = null;
                }
                break;
              case "comment 2":
                resume.Comment_2 = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "comment 2 by":
                resume.Comment_2_BY = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time comment 2 posted":
                try {
                  resume.Time_Comment_2_posted = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Comment_2_posted = null;
                }
                break;
              case "comment 3":
                resume.Comment_3 = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "comment 3 by":
                resume.Comment_3_BY = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time comment 3 posted":
                try {
                  resume.Time_Comment_3_posted = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Comment_3_posted = null;
                }
                break;
              case "comment 4":
                resume.Comment_4 = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "comment 4 by":
                resume.Comment_4_BY = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time comment 4 posted":
                try {
                  resume.Time_Comment_4_posted = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Comment_4_posted = null;
                }
                break;
              case "comment 5":
                resume.Comment_5 = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "comment 5 by":
                resume.Comment_3_BY = this.tableConfiguration.data[i][currentField.ColumnName];
                break;
              case "time comment 5 posted":
                try {
                  resume.Time_Comment_5_posted = new Date(this.tableConfiguration.data[i][currentField.ColumnName]);
                } catch (e) {
                  resume.Time_Comment_5_posted = null;
                }
                break;
            }
          }
          index++;
        }

        index = 0;
        this.resumeFiles.push(resume);
        i++;
      }

      if (notFoundFields.length > 0) {
        Toast("Total " + notFoundFields.length + " headers not found.")
      }
    }
  }

  cleanFileHandler() {
    $("#uploadexcel").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.noOfRecords = 0;
    event.stopPropagation();
    event.preventDefault();
    this.isAvailable=false;
    this.isDiasble = true;
    this.isUploadFile = true;
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
        workbookkk = read(data, { type: "binary" });
        workbookkk.SheetNames.forEach(function (sheetName) {
          XL_row_object = utils.sheet_to_json(workbookkk.Sheets[sheetName]);
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

  uploadExcelSheet($e: any) {
    $e.preventDefault();
    $e.stopPropagation();
    this.http.post("OnlineDocument/UploadDocumentRecords", this.resumeFiles)
      .then((response: ResponseModel) => {
        if (response.ResponseBody != null) {
          this.common.ShowToast("Data Uploaded successfull");
          this.cleanFileHandler();
        } else {
          this.common.ShowToast("Unable to upload the data");
        }
      });
  }

  getUploadedDetails() {
    this.resumeFiles = [];
    this.http.post("OnlineDocument/GetUploadedRecords", this.candidatesData)
    .then((response: ResponseModel) => {
      if (response.ResponseBody != null) {
        this.resumeFiles = response.ResponseBody.Table;
        if(this.resumeFiles.length > 0) {
          this.candidatesData.TotalRecords = this.resumeFiles[0].Total;
        } else {
          this.candidatesData.TotalRecords = 0;
        }
        this.common.ShowToast("Records found");
        this.isRecordAvailable = true;
      } else {
        this.common.ShowToast("No records found");
      }
    })
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";

    if(this.resumeFile.Name !== null && this.resumeFile.Name !== "") {
      searchQuery += ` Name like '${this.resumeFile.Name}%' `;
      delimiter = "and";
    }

    if(this.resumeFile.Email_ID !== null && this.resumeFile.Email_ID !== "") {
      searchQuery += ` ${delimiter}  Email_ID like '%${this.resumeFile.Email_ID}%' `;
      delimiter = "and";
    }
    if(this.resumeFile.Phone_Number !== null && this.resumeFile.Phone_Number !== "") {
      searchQuery += ` ${delimiter}  Phone_Number like '${this.resumeFile.Phone_Number}%' `;
      delimiter = "and";
    }
    if(this.resumeFile.Job_Title !== null && this.resumeFile.Job_Title !== "") {
      searchQuery += ` ${delimiter}  Job_Title like '%${this.resumeFile.Job_Title}%' `;
      delimiter = "and";
    }
    if(this.resumeFile.Preferred_Locations !== null && this.resumeFile.Preferred_Locations !== "") {
      searchQuery += ` ${delimiter}  Preferred_Locations like '${this.resumeFile.Preferred_Locations}%' `;
      delimiter = "and";
    }
    if(this.resumeFile.Total_Experience !== null && this.resumeFile.Total_Experience !== 0) {
      searchQuery += ` ${delimiter}  Total_Experience = '${this.resumeFile.Total_Experience}%' `;
      delimiter = "and";
    }
    if(this.resumeFile.Notice_Period !== null && this.resumeFile.Notice_Period !== 0) {
      searchQuery += ` ${delimiter}  Notice_Period like '${this.resumeFile.Notice_Period}%' `;
      delimiter = "and";
    }

    if(searchQuery !== "") {
      this.candidatesData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.getUploadedDetails();
  }

  globalFilter() {
    let searchQuery = "";
    searchQuery = ` Name like '${this.anyFilter}%' OR Email_ID like '%${this.anyFilter}%' OR Phone_Number like '${this.anyFilter}%' OR Job_Title like '%${this.anyFilter}%' `;
    if(searchQuery !== "") {
      this.candidatesData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.getUploadedDetails();
  }

  resetFilter() {
    this.isRecordAvailable = false;
    this.candidatesData.SearchString = "1=1";
    this.candidatesData.PageIndex = 1;
    this.candidatesData.PageSize = 10;
    this.candidatesData.StartIndex = 1;
    this.candidatesData.EndIndex = (this.candidatesData.PageSize * this.candidatesData.PageIndex);

    this.getUploadedDetails();
    this.resumeFile.Name="";
    this.resumeFile.Phone_Number = "";
    this.resumeFile.Email_ID="";
    this.resumeFile.Job_Title="";
    this.resumeFile.Preferred_Locations="";
    this.resumeFile.Total_Experience = null;
    this.resumeFile.Notice_Period=null;
    this.anyFilter = "";
    this.isRecordAvailable = true;
  }

  expandTable() {
    this.expandedTable = false;
  }
  closeExpandModel(){
    this.expandedTable = true;
  }
  closeModal(){
    this.cleanFileHandler();
  }

  OnEdit(data: any) { }

  OnDelete(data: any) { }

  NextPage(data: any) {
    let recordDetail = JSON.parse(data);
    if (recordDetail) {
      this.pageIndex = recordDetail.PageIndex;
    }
    // this.GridData = {
    //   headers: this.mappedColumn,
    //   rows: this.ExcelTableData.slice((this.pageIndex - 1) * 15, ((this.pageIndex - 1) * this.pageSize + 15)),
    //   totalCount: this.ExcelTableData.length,
    //   pageIndex: this.pageIndex,
    //   pageSize: this.pageSize,
    //   inlineContent: true
    // };
  }

  uploadResume() {
    $("#browsfile").click();
    event.preventDefault();
  }

  GetDocumentFile(fileInput: any) {
    this.FileDocuments = [];
    let Files = fileInput.target.files;
    if (Files.length > 0) {
      let index = 0;
      let file = null;
      let extension = "";
      let OtherFilePath = "";
      while (index < Files.length) {
        OtherFilePath = "";
        file = <File>Files[index];
        this.FileDocumentList.push(file);
        let mimeType = file.type;
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (fileEvent) => {
          this.FileDocuments.push(reader.result);
            this.DocumentImageObjects.push({
              FileUid: index,
              FileOn: "server",
              FilePath: reader.result,
            });
        };
        index++;
      }
    } else {
      Toast("No file selected");
    }

    this.SubmitFiles()
  }

  SubmitFiles() {
    let formData = new FormData();
    let files = Array<Files>();
    if (this.FileDocumentList.length > 0) {
      let index = 0;
      while (index < this.FileDocumentList.length) {
        formData.append("file_" + index, this.FileDocumentList[index]);
        this.BuildFilesModel(files, "file_" + index, this.FileDocumentList[index]);
        index++;
      }

      formData.append("fileDetail", JSON.stringify(files));
      this.http.upload("OnlineDocument/UploadFile", formData).then(res => {
        if(res.ResponseBody){
          Toast("Uplaoded successfully");
        } else {
          Toast("Fail to uplaoded");
        }
      });
    }
  }

  BuildFilesModel(filesModel: Array<Files>, uniqueKey: string, data: File) {
    let file = new Files();
    file.FileExtension = data.type;
    file.FileName = uniqueKey;
    file.FileUid = uniqueKey;
    filesModel.push(file);
  }

  PreviousPage(data: any) { }

  SelectSection(value: string) {
    $('#upload-container').removeClass('show');
    this.curentSection = value;
    this.excelPath = this.baseUrl + `UploadedFiles/SampleFiles/${this.curentSection}.xlsx`;
    setTimeout(() => {
      $('#upload-container').addClass('show');
    }, 250);
  }

  AddEditDocuments(item: ResumeFiles) {
    let userDetail: DocumentUser = new DocumentUser();
    userDetail.Mobile = item.Phone_Number;
    userDetail.Email = item.Email_ID;
    userDetail.UserTypeId = UserType.Candidate;
    userDetail.PageName = Resume;
    userDetail.Name = item.Name;
    userDetail.UserId = item.UserId;
    this.nav.navigate("admin/documents", userDetail);
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.candidatesData = e;
      this.getUploadedDetails();
    }
  }

  changeUploadedRecords(e: Filter) {
    if(e != null) {
      this.candidatesData = e;
    }
  }

  getFiledsMap(): Array<string> {
    return [
      'source of application',
      'job title',
      'date of application',
      'name',
      'email id',
      'phone number',
      'total experience',
      'annual salary',
      'notice period',
      'expected ctc',
      'feedback',
      'current location',
      'preferred locations',
      'current company name',
      'current company designation',
      'functional area',
      'role',
      'industry',
      'key skills',
      'resume headline',
      'summary',
      'under graduation degree',
      'ug specialization',
      'ug university/institute name',
      'ug graduation year',
      'post graduation degree',
      'pg specialization',
      'pg university/institute name',
      'pg graduation year',
      'doctorate degree',
      'doctorate specialization',
      'doctorate university/institute name',
      'doctorate graduation year',
      'gender',
      'marital status',
      'home town/city',
      'pin code',
      'work permit for usa',
      'current location',
      'date of birth',
      'last workflow activity',
      'last workflow activity by',
      'time of last workflow activity update',
      'pipeline status updated by',
      'time when stage updated',
      'latest star rating',
      'viewed',
      'viewed by',
      'time of view',
      'emailed',
      'emailed by',
      'time of email',
      'calling status',
      'calling status updated by',
      'time of calling activity update',
      'comment 1',
      'comment 1 by',
      'time comment 1 posted',
      'comment 2',
      'comment 2 by',
      'time comment 2 posted',
      'comment 3',
      'comment 3 by',
      'time comment 3 posted',
      'comment 4',
      'comment 4 by',
      'time comment 4 posted',
      'comment 5',
      'comment 5 by',
      'time comment 5 posted'
    ];
  }
}

function saveAs(arg0: Blob, arg1: string) {
  throw new Error('Function not implemented.');
}

export class ResumeFiles {
  UserId: number = 0;
  Total: number = 0;
  Index: number = 0;
  Source_Of_Application: string = "";
  Job_Title: string = "";
  Date_of_application: Date = null;
  Name: string = "";
  Email_ID: string = "";
  Phone_Number: string = "";
  Alternet_Numbers: string = "";
  Total_Experience: number = null;
  Annual_Salary: number = 0;
  Notice_Period: number = null;
  Expeceted_CTC: number = 0;
  Feedback: string = "";
  Current_Location: string = "";
  Preferred_Locations: string = "";
  Current_Company_name: string = "";
  Current_Company_Designation: string = "";
  Functional_Area: string = "";
  Role: string = "";
  Industry: string = "";
  Key_Skills: string = "";
  Resume_Headline: string = "";
  Summary: string = "";
  Under_Graduation_degree: string = "";
  UG_Specialization: string = "";
  UG_University_institute_Name: string = "";
  UG_Graduation_year: number = 0;
  Post_graduation_degree: string = "";
  PG_specialization: string = "";
  PG_university_institute_name: string = "";
  PG_graduation_year: number = 0;
  Doctorate_degree: string = "";
  Doctorate_specialization: string = "";
  Doctorate_university_institute_name: string = "";
  Doctorate_graduation_year: number = 0;
  Gender: string = "";
  Marital_Status: boolean = false;
  Home_Town_City: string = "";
  Pin_Code: number = 0;
  Work_permit_for_USA: string = "";
  Date_of_Birth: Date = null;
  Last_Workflow_activity: string = "";
  Last_Workflow_activity_by: string = "";
  Time_of_Last_Workflow_activity_Update: string = "";
  Pipeline_Status_Updated_By: string = "";
  Time_when_Stage_updated: string = "";
  Latest_Star_Rating: number = 0;
  Viewed: string = "";
  Viewed_By: string = "";
  Time_Of_View: string = "";
  Emailed: string = "";
  Emailed_By: string = "";
  Time_Of_Email: Date = null;
  Calling_Status: string = "";
  Calling_Status_updated_by: string = "";
  Time_of_Calling_activity_update: Date = null;
  Comment_1: string = "";
  Comment_1_BY: string = "";
  Time_Comment_1_posted: Date = null;
  Comment_2: string = "";
  Comment_2_BY: string = "";
  Time_Comment_2_posted: Date = null;
  Comment_3: string = "";
  Comment_3_BY: string = "";
  Time_Comment_3_posted: Date = null;
  Comment_4: string = "";
  Comment_4_BY: string = "";
  Time_Comment_4_posted: Date = null;
  Comment_5: string = "";
  Comment_5_BY: string = "";
  Time_Comment_5_posted: Date = null;
}

class Files {
  FileName: string = "";
  FileExtension: string = "";
  FilePath: string = "";
  FileUid: string = "";
  ProfileUid: string = "";
}
