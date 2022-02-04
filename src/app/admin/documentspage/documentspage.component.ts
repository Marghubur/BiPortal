import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonService, UserDetail } from 'src/providers/common-service/common.service';
declare var $ : any;
import {
  Zip,
  Doc,
  Pdf,
  Txt,
  FlatFile,
} from "src/providers/constants";
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Filter, UserService } from 'src/providers/userService';
import { iNavigation } from 'src/providers/iNavigation';
import { OnlineDocModel } from '../documents/documents.component';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-documentspage',
  templateUrl: './documentspage.component.html',
  styleUrls: ['./documentspage.component.scss']
})
export class documentspageComponent implements OnDestroy, OnInit, AfterViewInit {
  FacultyDocumentImages: Array<any> = [];
  DocumentImages: Array<any> = [];
  DocumentImageObjects: Array<any> = [];
  ImageType: any;
  Image: any;
  DocForm: FormGroup = null;
  FileForm: FormGroup = null;
  userDetail: UserDetail = null;
  onlineDocModel: OnlineDocModel = null;
  isReady: boolean = false;
  config: any = {};
  documentFiles: Array<Files> = [];
  currentFile: Files = null;
  editModule: boolean = false;
  GoogleDocUrl: string = "https://docs.google.com/gview?url=%URL%&embedded=true";
  FileUrl: string = "http://localhost:5000/Files/Documents/zaid2292_gmail_com/file_2.pdf";
  TotalRecords: number = 0;
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  tableFilter: Filter;
  isHttpCallPerformed: boolean = false;
  isDeleteConfirmed: boolean = false;
  isEdit: boolean = false;
  isExecuting: boolean = false;
  model: NgbDateStruct;
  date: {year: number, month: number};

  constructor(private common: CommonService,
    private nav: iNavigation,
    private http: AjaxService,
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.tableFilter = new Filter();
    let data = this.nav.getValue();
    this.onlineDocModel = new OnlineDocModel(data);
    this.userDetail = this.userService.getInstance();
    this.BuildTableRecord();
    //this.LoadData(filter, null);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  BuildDocumentTable() {
    this.DocForm = this.fb.group({
      "Title": new FormControl(this.onlineDocModel.Title),
      "Description": new FormControl(this.onlineDocModel.Description),
      "CreatedOn": new FormControl(this.onlineDocModel.CreatedOn),
      "DocumentId": new FormControl(this.onlineDocModel.DocumentId),
      "PageLink": new FormControl(this.onlineDocModel.DocPath)
    });
  }

  // BuildFileForm() {
  //   this.FileForm = this.fb.group({
  //     DocumentId: new FormControl(this.onlineDocModel.DocumentId),
  //     FileExtension: new FormControl(this.onlineDocModel.DocumentId),
  //     FileName: new FormControl(this.onlineDocModel.DocumentId),
  //     FilePath: new FormControl(this.onlineDocModel.DocumentId),
  //     FileUid: new FormControl(this.onlineDocModel.DocumentId),
  //     PaidOn: new FormControl(this.onlineDocModel.DocumentId)
  //   });
  // }

  EditCurrent() {

  }

  GetFile(fileInput: any) {
    let Files = fileInput.target.files;
    if (Files.length > 0) {
      this.ImageType = <File>Files[0];
      let extension = this.ImageType.name.substr(
        this.ImageType.name.lastIndexOf(".") + 1
      );
      let mimeType = this.ImageType.type;
      if (mimeType.match(/image\/*/) == null) {
        console.log("Only images are supported.");
        return;
      }

      let reader = new FileReader();
      reader.readAsDataURL(this.ImageType);
      reader.onload = (fileEvent) => {
        this.Image = reader.result;
      };
    } else {
      this.common.ShowToast("No file selected");
    }
  }

  GetImage() {
    $("#browsfile").click();
    event.preventDefault();
  }

  ResetSeletedFiles(){
    this.FacultyDocumentImages = [];
    this.DocumentImageObjects = [];
  }

  ResetToNormalState() {
    this.isDeleteConfirmed = false;
    this.isEdit = false;
    this.isExecuting = false;
  }

  GetDocumentFile(fileInput: any) {
    this.DocumentImages = [];
    let Files = fileInput.target.files;
    if (Files.length > 0) {
      let index = 0;
      let file = null;
      let extension = "";
      let OtherFilePath = "";
      while (index < Files.length) {
        OtherFilePath = "";
        file = <File>Files[index];
        this.FacultyDocumentImages.push(file);
        let mimeType = file.type;
        if (mimeType.match(/image\/*/) == null) {
          extension = file.name.slice(file.name.lastIndexOf(".") + 1);
          if (extension === "pdf") OtherFilePath = Pdf;
          else if (extension === "doc" || extension === "docx") OtherFilePath = Doc;
          else if (extension === "txt") OtherFilePath = Txt;
          else if (extension === "zip") OtherFilePath = Zip;
          else if (extension === "ppt" || extension === "pptx") OtherFilePath = Doc;
          else if (extension === "xlsx" || extension === "xls") OtherFilePath = Doc;
          else OtherFilePath = FlatFile;

          this.DocumentImageObjects.push({
            FileUid: index,
            FileOn: "server",
            FilePath: OtherFilePath,
            FileName: file.name,
            FileSize: file.size
          });
        } else {
          let reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (fileEvent) => {
            this.DocumentImages.push(reader.result);
            this.DocumentImageObjects.push({
              FileUid: index,
              FileOn: "server",
              FilePath: reader.result,
            });
          };
        }
        index++;
      }
    } else {
      this.common.ShowToast("No file selected");
    }
  }

  BuildFilesModel(filesModel: Array<Files>, filaName: string, data: File) {
    let file = new Files();
    file.FileExtension = data.type;
    file.FileName = filaName;
    file.FileUid = -1;
    filesModel.push(file);
  }

  UploadDocuments() {
    let files = Array<Files>();
    let formData = new FormData();
    if (
      typeof this.ImageType !== 'undefined' &&
      this.ImageType !== null
    ) {
      formData.append("profile", this.ImageType);
      this.BuildFilesModel(files, "profile", this.ImageType);
    }
    if (this.FacultyDocumentImages.length > 0) {
      let index = 0;
      let fileName = "";
      while (index < this.FacultyDocumentImages.length) {
        fileName = this.FacultyDocumentImages[index]['name'];
        if(fileName === null || fileName === "")
          fileName = "file_" + index;
        formData.append(fileName, this.FacultyDocumentImages[index]);
        this.BuildFilesModel(files, fileName, this.FacultyDocumentImages[index]);
        index++;
      }
    }

    let appDetail = {};
    appDetail["OnlineDocumentModel"] = this.DocForm.value;
    appDetail["Mobile"] = this.userDetail.Mobile;
    appDetail["Email"] = this.userDetail.EmailId;

    formData.append("facultObject", JSON.stringify(appDetail));
    formData.append("fileDetail", JSON.stringify(files));

    this.isHttpCallPerformed = true;
    this.http.upload("OnlineDocument/UploadDocumentDetail", formData).then((response: ResponseModel) => {
      if (response.ResponseBody != null && response.ResponseBody !== "") {
        this.reRenderTable();
        //this.BindLoadedData(response.ResponseBody);
        this.HideModal();
      }
    });
  }

  GoogleAuth() {
    var redirect_uri = "http://localhost:4200";
    var scope = "https://www.googleapis.com/auth/drive";
    var url = "";
    this.SignIn(null, redirect_uri, scope, url);
  }

  SignIn(clientId, redirect_uri, scope, url) {
    url = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${redirect_uri}
            &prompt=consent&response_type=code&client_id=${clientId}&scope=${scope}
            &access_type=offline`;

    window.location = url;
  }

  ViewFile(Uid: any) {
    alert(Uid);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  reRenderTable() {
    this.documentFiles = [];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  DeleteFile(Uid: any) {
    // this.tableFilter.isReUseSame = true;
    // this.reRenderTable();
    this.isDeleteConfirmed = true;
    this.isExecuting = false;
    this.ToggleDeleteConfirmation(true);
    let file = this.documentFiles.filter(x=>x.FileUid == Uid);
    if(file.length > 0) {
      this.currentFile = file[0];
    }
  }

  EditFile(Uid: any) {
    if(Uid !== null && Uid !== "") {
      this.isEdit = true;
      this.ToggleFileEdit(true);
      let file = this.documentFiles.filter(x=>x.FileUid == Uid);
      if(file.length > 0) {
        this.currentFile = file[0];
      }
    }
  }

  ExecuteFileDelete() {
    this.isExecuting = true;
    this.isHttpCallPerformed = true;
    let request = { DocumentId: this.onlineDocModel.DocumentId, FileUid: this.currentFile.FileUid };
    this.http.post("OnlineDocument/DeleteFiles", [request]).then((res: ResponseModel) => {
      if(res.ResponseBody !== null) {
        this.common.ShowToast("Deleted successfully");
        this.reRenderTable();
       // this.BindLoadedData(res.ResponseBody);
        this.HideModal();
      }
    });
  }

  SaveModifiedChanges() {
    this.currentFile.Status = "Paid";
    this.currentFile.PaidOn = new Date();
    this.http.post("OnlineDocument/EditCurrentFile", this.currentFile).then((res: ResponseModel) => {
      if(res.ResponseBody !== null) {
        this.common.ShowToast("Updated successfully");
        this.reRenderTable();
        this.ToggleFileEdit(false);
        this.ResetToNormalState();
      }
    });
  }

  BuildTableRecord(): void {
    this.config = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,

      ajax: (tableParameter: any, callBack) => {
       // if(!this.isHttpCallPerformed) {
          if(!this.tableFilter.isReUseSame) {
            this.tableFilter.SearchString = `1=1 AND OD.DocumentId = '${this.onlineDocModel.DocumentId}'`;
            this.tableFilter.PageIndex = Number(tableParameter.start / 10) + 1;
          }
          this.tableFilter.isReUseSame = false;
          this.LoadData(this.tableFilter, callBack);
        // } else {
        //   this.isHttpCallPerformed = false;
        //   callBack({
        //     recordsTotal: this.TotalRecords,
        //     recordsFiltered: this.TotalRecords,
        //     data: this.documentFiles
        //   });
        // }
      },
      columns: [
        { data: 'FileUid', name: 'File Id' },
        { data: 'FileName', name: 'File Name' },
        { data: 'FileExtension', name: 'File Type' },
        { data: 'Status', name: 'Status' },
        { data: 'PaidOn', name: 'Paid On' },
        { data: 'FileUid', name: 'Action' },
      ],
      dom: 'Bfrtip',
      buttons: [
        'copy',
        'print',
        'excel'
      ]
    };
  }

  BindLoadedData(result: any) {
    if (result !== null) {
      this.onlineDocModel = result['onlineDocumentModel'][0];
      this.documentFiles = result['files'];
      this.TotalRecords = result['TotalRecord'];
      this.BuildDocumentTable();
    }
  }

  BindRenderedTable(callBack) {
    this.isReady = true;
    if(callBack)
      callBack({
        recordsTotal: this.TotalRecords,
        recordsFiltered: this.TotalRecords,
        data: this.documentFiles
      });
  }

  LoadData(filter: any, callBack) {
    this.http.post("OnlineDocument/GetOnlineDocumentsWithFiles", filter).then((response: ResponseModel) => {
      if(response.ResponseBody !== null) {
        this.BindLoadedData(response.ResponseBody);
        this.BindRenderedTable(callBack);
      }
    });
  }

  OpenUploadFileDialog() {
    this.ShowModal();
  }

  //---------------------------------------- Handle page level modals ---------------------------------------

  ShowModal() {
    this.ResetSeletedFiles();
    this.editModule = true;
    $('#editModal').modal('showmodal');
  }

  HideModal() {
    this.ResetSeletedFiles();
    this.ResetToNormalState();
    this.editModule = false;
    $('#editModal').modal('hide');
    this.ToggleDeleteConfirmation(false);
  }


  //------------- Delete confirmation -----------

  ToggleDeleteConfirmation(state: boolean){
    if(state)
      $('#confirmationModal').modal('showmodal');
    else
      $('#confirmationModal').modal('hide');
  }

  //------------- File Edit modal confirmation -----------

    ToggleFileEdit(state: boolean){
      if(state)
        $('#fileEditModal').modal('showmodal');
      else
        $('#fileEditModal').modal('hide');
    }
}

export class Files {
  FileName: string = "";
  FileExtension: string = "";
  FilePath: string = "";
  FileUid?: number = 0;
  TotalRecord?: number = 0;
  DocumentId?: number = 0;
  Status: string = "";
  PaidOn: Date = null;
  CreatedOn?: Date = null;
  CreatedBy?: string = null;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
