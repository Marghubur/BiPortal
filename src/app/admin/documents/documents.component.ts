import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IsValidResponse, ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { Clients, Doc, DocImg, DocumentPathName, Docx, Employees, FileSystemType, Pdf, PdfImg, Resume, UserPathName, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

declare var $:any;

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class documentsComponent implements OnInit {
  currentUser: DocumentUser = null;
  submitted: boolean = false;
  documentForm: FormGroup;
  FileDocuments: Array<any> = [];
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  btnDisable:boolean = true;
  fileAvailable: boolean = false;
  uploading: boolean = true;
  fileFolderDetail: Array<Files> = []
  isDocumentReady: boolean = false;
  personDetail: DocumentUser = null;
  personDetails: Array<DocumentUser> = [];
  candidatesData: Filter = null;
  newFolderName: string = "";
  documentDetails: Array<DocumentDetail> = [];
  winRootLocation: string = "Documents\\User";
  unixRootLocation: string = "Documents\/User";
  currentFoder: string = "";
  baseUrl: string = "";
  viewer: any = null;
  currentDeleteMarkedItem: any = 0;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
  ) { }

  ngOnInit(): void {
    this.baseUrl = this.http.GetImageBasePath();
    this.initForm();
    this.personDetail = new DocumentUser();
    let data = this.nav.getValue();
    if(data) {
      this.currentUser = data;
      if(this.currentUser.PageName == Employees)
        this.currentUser.UserTypeId = UserType.Employee;
      else if(this.currentUser.PageName == Clients)
        this.currentUser.UserTypeId = UserType.Client;
      else if(this.currentUser.PageName == Resume)
        this.currentUser.UserTypeId = UserType.Candidate;
      else
        this.currentUser.UserTypeId = UserType.Other

      this.bindForm(this.currentUser);
      this.RefreshDocuments();
    } else {
      this.currentUser = new DocumentUser();
    }
  }

  findType(e: any) {

  }

  viewPdfFile(file: Files) {
    this.viewer = document.getElementById("file-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', file.FilePath);
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  initForm() {
    this.documentForm = this.fb.group({
      Email: ['', Validators.required],
      name: ['', Validators.required],
      userTypeId: ['', Validators.required]
    })
  }

  get f() {
    return this.documentForm.controls;
  }

  bindForm(currentUser: DocumentUser) {
    this.documentForm.patchValue({
      name : currentUser.Name,
      Email: currentUser.Email,
      userTypeId: currentUser.UserTypeId
    })
  }


  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  RefreshDocuments() {
    if(this.currentUser.UserId > 0) {
      this.http.post("OnlineDocument/GetDocumentByUserId", { "UserId": this.currentUser.UserId }).then((response: ResponseModel) => {
        if(response.ResponseBody && response.ResponseBody.Table) {
          let fileDetail = response.ResponseBody.Table;
          if(fileDetail && fileDetail.length > 0) {
            this.BuildFileAndFolderDetail(fileDetail);
          }
          this.isDocumentReady = true;;
        }
      });
    } else {
      Toast("Invalid user.")
    }
  }

  BuildFileAndFolderDetail(fileDetail: Array<any>) {
    let isRootFolder = false;
    let folderName = "";
    let folderNames = [];
    let directoryCollection: Array<any> = [];
    this.documentDetails = new Array<DocumentDetail>();
    let index = 0;
    while(index < fileDetail.length) {
      let fileFolder = new Files();
      fileFolder.IsFolderType = false;
      fileFolder.FileUid = fileDetail[index].FileId;
      fileFolder.UserId = fileDetail[index].FileOwnerId;
      fileFolder.FileName = fileDetail[index].FileName;
      fileFolder.FileExtension = fileDetail[index].FileExtension;

      switch(fileFolder.FileExtension) {
        case Pdf:
          fileFolder.LocalImgPath = PdfImg;
          break;
        case Docx:
        case Doc:
          fileFolder.LocalImgPath = DocImg;
          break;
        default:
          fileFolder.IsFolderType = true;
      }

      if(fileDetail[index].FileName == null || fileDetail[index].FileName == "") {
        fileFolder.FilePath = `${fileDetail[index].FilePath}`;
      } else {
        fileFolder.FilePath = `${this.baseUrl}/${fileDetail[index].FilePath}/${fileDetail[index].FileName}`;
      }

      folderNames = fileDetail[index].FilePath.split("\\");
      if(folderNames.length === 1) {
        folderNames = fileDetail[index].FilePath.split("\/");
      }
      if(folderNames.length > 2) {
        if(folderNames[0] === DocumentPathName && folderNames[1] === UserPathName) {
          folderName = folderNames[2];
        }
        isRootFolder = true;
      } else {
        folderName = "";
        isRootFolder = false;
      }

      let docDetail = directoryCollection.find(x => x.FolderPath.replace("/", "\\") === fileDetail[index].FilePath.replace("/", "\\"));
      if(!docDetail) {
        directoryCollection.push({
          FolderPath: fileDetail[index].FilePath,
          IsRootFolder: isRootFolder,
          FolderName: folderName,
          ContentDetails: [ fileFolder ]
        });
      } else {
        docDetail.ContentDetails.push(fileFolder);
      }
      index++;
    }

    if (directoryCollection.length > 0) {
      let directories = directoryCollection.filter(x => x.IsRootFolder);
      let files = directoryCollection.filter(x => !x.IsRootFolder);
      this.documentDetails.push(...directories);
      this.documentDetails.push(...files);
    }

    this.documentDetails.map((item, index) => {
      if(item.ContentDetails.filter(x => x.IsFolderType).length > 0) {
        item.TotalFileCount = item.ContentDetails.length - 1;
      }
    });
  }

  getUploadedDetails() {
    this.personDetails = [];
    this.http.post("OnlineDocument/GetUploadedRecords", this.candidatesData)
    .then((response: ResponseModel) => {
      if (response.ResponseBody != null) {
        this.personDetail = response.ResponseBody.Table;
        if(this.personDetails.length > 0) {
          this.candidatesData.TotalRecords = this.personDetail[0].Total;
        } else {
          this.candidatesData.TotalRecords = 0;
        }
        Toast("Records found");
      } else {
        Toast("No records found");
      }
    })
  }

  filterRecords() {
    let searchQuery = "";
    if(this.personDetail.Email !== null && this.personDetail.Email !== "") {
      searchQuery += ` Email_ID like '%${this.personDetail.Email}%' `;
    }
    if(searchQuery !== "") {
      this.candidatesData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.getUploadedDetails();
  }

  GetDocumentFile(fileInput: any) {
    this.FileDocuments = [];
    this.FilesCollection = [];
    let selectedFiles = fileInput.target.files;
    if (selectedFiles.length > 0) {
      let index = 0;
      let file = null;
      this.btnDisable = false;
      this.fileAvailable = true;
      this.uploading = false;
      while (index < selectedFiles.length) {
        file = <File>selectedFiles[index];
        let item: Files = new Files();
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = file.size;
        item.Mobile = this.currentUser.Mobile;
        item.Email = this.currentUser.Email;
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.UserId = this.currentUser.UserId;
        item.UserTypeId = this.currentUser.UserTypeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      }
    } else {
      Toast("No file selected");
    }
  }

  GetCreateFolderPopup() {
    $('#createFolder').modal('show');
  }

  CloseFolderPopup() {
    $('#createFolder').modal('hide');
    this.newFolderName = "";
  }

  CreateNewfolder() {
    if(this.newFolderName) {
      let folderDetail: Files = new Files();
      if(this.currentFoder !== "") {
        folderDetail.FilePath = `${this.currentFoder}\\${this.newFolderName}`;
      } else {
        folderDetail.FilePath = `${this.newFolderName}`;
      }

      folderDetail.UserTypeId = this.currentUser.UserTypeId;
      folderDetail.UserId = this.currentUser.UserId;
      folderDetail.SystemFileType = FileSystemType.User;
      this.http.post("FileMaker/CreateFolder", folderDetail).then((response: ResponseModel) => {
        this.CloseFolderPopup();
        if(response && response.ResponseBody) {
          Toast(response.ResponseBody);
        } else {
          Toast("Fail to create folder.");
        }
      })
    }
  }

  selecteItemForDelete(fileId: number) {
    this.currentDeleteMarkedItem = null;
    if(fileId > 0) {
      let fileDetail = null;
      let file = null;
      let index = 0;
      while(index < this.documentDetails.length) {
        fileDetail = this.documentDetails[index];
        file = fileDetail.ContentDetails.find(x => x.FileUid === fileId);
        if(file) {
          this.currentDeleteMarkedItem = file;
          break;
        }
        index++;
      }
    }
  }

  deleteFile() {
    if(this.currentDeleteMarkedItem) {
      let fileIds = this.currentDeleteMarkedItem.FileUid;
      this.http.delete(`FileMaker/DeleteFile/${this.currentUser.UserId}`, [fileIds])
      .then((response:ResponseModel) => {
        if(response.ResponseBody && response.ResponseBody.Table) {
          let fileDetail = response.ResponseBody.Table;
          if(fileDetail && fileDetail.length > 0) {
            this.BuildFileAndFolderDetail(fileDetail);
          }

          $("#staticBackdrop").modal("hide");
          this.isDocumentReady = true;;
          Toast("Deleted successfully.");
        } else {
          Toast("Fail to delte the file");
        }
      });
    }
  }

  SubmitFiles() {
    let formData = new FormData();
    let files = Array<Files>();
    if (this.FileDocumentList.length > 0 && this.currentUser.UserId > 0) {
      let index = 0;
      while (index < this.FileDocumentList.length) {
        formData.append(this.FileDocumentList[index].FileName, this.FilesCollection[index]);
        index++;
      }

      formData.append("fileDetail", JSON.stringify(this.FileDocumentList));
      this.http.upload("OnlineDocument/UploadFile", formData).then(response => {
        if(response.ResponseBody && response.ResponseBody.Table) {
          let fileDetail = response.ResponseBody.Table;
          if(fileDetail && fileDetail.length > 0) {
            this.BuildFileAndFolderDetail(fileDetail);
          }
          this.isDocumentReady = true;;
          Toast("Created successfully.");
        } else {
          Toast("Fail to delte the file");
        }
      });
    } else {
      Toast("Invalid userId");
    }
    this.cleanFileHandler();
  }

  cleanFileHandler() {
    this.btnDisable = true;
    this.fileAvailable = false;
    this.uploading = true;
    $("#uploadocument").val("");
    this.FilesCollection = [];
  }
}

export class DocumentUser {
  PageName: string = "";
  Mobile: string = "";
  Email: string = "";
  UserTypeId: number = 0;
  UserId: number = 0;
  Name?: string = "";
}

export class OnlineDocModel {
  constructor(data: any) {
    this.DocumentId = data['DocumentId'];
    this.Title = data['Title'];
    this.Description = data['Description'];
    this.UserId = data['UserId'];
    this.DocPath = data['DocPath'];
    this.CreatedOn = data['CreatedOn'];
    this.UpdatedOn = data['UpdatedOn'];
  }
  DocumentId: number = 0;
  Title: string = null;
  Description: string = null;
  UserId: string = null;
  DocPath: string = null;
  TotalRows: number = 0;
  CreatedOn: string = null;
  UpdatedOn: string = null;
}

export class PersonDetail {
  EmployeeUid: number = 0;
  FirstName: string = null;
  LastName: string = null;
  Mobile: string = null;
  Email: string = null;
  BranchName: string = null;
  SecondaryMobile: string = null;
  FatherName: string = null;
  MotherName: string = null;
  SpouseName: string = null;
  State: string = null;
  City: string = null;
  Pincode: number = null;
  Address: string = null;
  PANNo: string = null;
  AadharNo: string = null;
  AccountNumber: string = null;
  BankName: string = null;
  IFSCCode: string = null;
  Domain: string = null;
  Specification: string = null;
  ExprienceInYear: number = null;
  LastCompanyName: string = null;
  IsPermanent: boolean = false;
  AllocatedClientId: number = null;
  AllocatedClientName: string = null;
  ActualPackage: number = null;
  FinalPackage: number = null;
  TakeHomeByCandidate: number = null;
  Total: number = null;
}

export class Files {
  IsFolderType: boolean = false;
  LocalImgPath: string = "";
  UserId: number = 0;
  FileName: string = "";
  FileExtension: string = "";
  FilePath: string = "";
  FileUid: number = 0;
  ProfileUid: string = "";
  DocumentId: number = 0;
  Mobile: string = "";
  Email: string = "";
  FileType: string = "";
  FileSize: number = 0;
  UserTypeId: number = 0;
  SystemFileType?: FileSystemType = 1;
}

class DocumentDetail {
  TotalFileCount?: number = 0;
  FolderPath: string = "";
  IsRootFolder: boolean = false;
  FolderName: string = "";
  ContentDetails: Array<Files> = [];
}
