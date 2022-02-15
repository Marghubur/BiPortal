import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IsValidResponse, ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { ADocx, AImage, APdf, Clients, Doc, DocImg, DocumentPath, DocumentPathName, Documents, Docx, Employees, Excel, ExcelImg, FileSystemType, Images, JImage, Pdf, PdfImg, PImage, Resume, UserPath, UserPathName, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
import { environment } from "src/environments/environment";
import { ActivatedRoute } from '@angular/router';

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
  cachedDocumentDetails: Array<any> = [];
  rootLocation: string = `${DocumentPath}${environment.FolderDelimiter}${UserPath}`;
  baseUrl: string = "";
  viewer: any = null;
  currentDeleteMarkedItem: any = 0;
  targetFolder: string = "";
  totalFileSize: number = 0;
  folderNav: Array<any> = [];
  isLargeFile: boolean = false;
  currentFolder: string = "";
  routeParam: any = null;
  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.folderNav.push({name: "home", route: this.rootLocation});
    this.route.queryParamMap.subscribe((params: any) => {
      if(params.params.path) {
        this.routeParam = params.params.path;
        this.buildRoute();
      }
    });

    this.currentFolder = this.rootLocation;
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
      this.nav.navigate("/", null);
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
      userTypeId: ['0', Validators.required]
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

  fileCount(key: string): number {
    if(key !== "") {
      let items = this.cachedDocumentDetails[key];
      if(items) {
        return items.length;
      }
    }
    return 0;
  }

  BuildFileAndFolderDetail(fileDetail: Array<any>) {
    if(fileDetail != null && fileDetail.length > 0) {
      this.cachedDocumentDetails = [];
      let index = 0;
      let item = null;
      let pathName = "";
      let parentFolder = "";
      let isParent = false;
      while(fileDetail.length > 0) {
        parentFolder = fileDetail[index].ParentFolder;
        isParent = false;
        if(parentFolder != null && parentFolder != "") {
          pathName = parentFolder;
          isParent = true;
        } else {
          pathName = fileDetail[index].FilePath;
        }

        item = fileDetail.splice(index, 1);
        item = item[0];
        item["IsFolder"] = isParent;
        switch(item.FileExtension) {
          case APdf:
          case Pdf:
            item["LocalImgPath"] = PdfImg;
            break;
          case Docx:
          case ADocx:
          case Doc:
            item["LocalImgPath"] = DocImg;
            break;
          case Excel:
            item["LocalImgPath"] = ExcelImg;
            break;
          case PImage:
          case JImage:
          case AImage:
            item["LocalImgPath"] = Images;
            break;
          default:
            item.IsFolderType = true;
        }
        if(!this.cachedDocumentDetails[pathName]) {
          this.cachedDocumentDetails[pathName] = [ item ];
        } else {
          this.cachedDocumentDetails[pathName].push(item);
        }
      }
    }

    this.documentDetails = this.cachedDocumentDetails[this.rootLocation];
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
    if (this.routeParam.params.path !== null || this.routeParam.params.path !== '') {
      this.routeParam = this.routeParam.params.path;
    }
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
        item.FileSize = (Number(file.size)/1024);
        item.Mobile = this.currentUser.Mobile;
        item.Email = this.currentUser.Email;
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.FilePath = this.getRelativePath(this.routeParam);
        item.ParentFolder = '';
        item.UserId = this.currentUser.UserId;
        item.UserTypeId = this.currentUser.UserTypeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      }

      for(let i=0; i<selectedFiles.length; i++) {
        let filesize = Number(this.FilesCollection[i].size)
        this.totalFileSize += (filesize/1024);
      }

      if (this.totalFileSize > 2048) {
        this.isLargeFile = true;
      }
    } else {
      Toast("No file selected");
    }
  }

  CreateFolderPopup() {
    $('#createFolder').modal('show');
  }

  CloseFolderPopup() {
    $('#createFolder').modal('hide');
    this.newFolderName = "";
  }

  navigateTo(path: string) {
    if(path != '' && this.routeParam != path) {
      let nav = this.cachedDocumentDetails[path];
      if(nav) {
        this.documentDetails = nav;
        this.currentFolder = path;
        let item = null;
        let index = 0;
        let newRoute = [];
        while(index < this.folderNav.length) {
          if(this.folderNav[index].route !== path) {
            newRoute.push(this.folderNav[index]);
          } else {
            item = this.folderNav[index];
            break;
          }
          index++;
        }

        newRoute.push(item);
        this.folderNav = newRoute;
        if(item.name !== "home")
          this.nav.navigateWithArgs(item.name, item.route);
        else
          this.nav.navigate(Documents, "");
      } else {
        Toast("Invalid folder.");
      }
    }
    this.isDocumentReady = true;
  }

  buildRoute() {
    if(this.routeParam) {
      let items = this.routeParam.split(environment.FolderDelimiter);
      let len = items.length;
      if(len > 0) {
        let relativePath = items[len - 1];
        this.folderNav.push({name: relativePath, route: this.routeParam});
      }
    }
  }

  openSubFolder(path: string) {
    if(path !== "" && this.currentFolder != path) {
      this.documentDetails = [];
      this.documentDetails = this.cachedDocumentDetails[path];
      this.currentFolder = path;
    } else {
      Toast("No route or folder found.")
    }
    this.nav.navigateWithArgs(`${Documents}`, path);
  }

  // findRouteFolders(path: string) {
  //   path = path.toLocaleLowerCase();
  //   this.isDocumentReady = false;
  //   let subItems = this.cachedDocumentDetails.filter(x => x.FolderPath.toLocaleLowerCase().startsWith(path));
  //   if(subItems.length > 0) {
  //     let items = JSON.stringify(subItems);
  //     let subFolderItems = JSON.parse(items);
  //     subFolderItems.map(item => {
  //       if(path === item.FolderPath.toLocaleLowerCase()) {
  //         item.IsRootFolder = false;
  //       }
  //     });

  //     this.documentDetails = [];
  //     this.documentDetails = subFolderItems;
  //     this.isDocumentReady = true;
  //   }
  // }

  CreateNewfolder() {
    if(this.newFolderName !== "") {
      let folderDetail: Files = new Files();
      if (this.routeParam.params.path !== null || this.routeParam.params.path !== '') {
        this.routeParam = this.routeParam.params.path;
      }
      let currentRoute = this.routeParam;
      if (currentRoute == '' || currentRoute == null) {
        currentRoute = '';
      }
      if(this.currentFolder !== "") {
        folderDetail.FilePath = `${this.currentFolder}${environment.FolderDelimiter}${this.newFolderName}`;
      } else {
        folderDetail.FilePath = `${this.newFolderName}`;
      }

      folderDetail.FilePath = this.getRelativePath(folderDetail.FilePath);
      folderDetail.ParentFolder = this.getRelativePath(this.currentFolder);
      folderDetail.UserTypeId = this.currentUser.UserTypeId;
      folderDetail.UserId = this.currentUser.UserId;
      folderDetail.SystemFileType = FileSystemType.User;
      this.http.post("FileMaker/CreateFolder", folderDetail).then((response: ResponseModel) => {
        this.CloseFolderPopup();
        if(response.ResponseBody && response.ResponseBody.Table) {
          let fileDetail = response.ResponseBody.Table;
          if(fileDetail && fileDetail.length > 0) {
            this.BuildFileAndFolderDetail(fileDetail);
          }
          this.isDocumentReady = true;;
        }
      })
    }
  }

  getRelativePath(path: string): string {
    if(path) {
      path = path.toLocaleLowerCase();
      let paths = path.split(`${environment.FolderDelimiter}`);
      if(paths.length > 0 && paths[0] === DocumentPath) {
        paths.splice(0, 1);
      }

      if(paths.length > 0 && paths[0] === UserPath) {
        paths.splice(0, 1);
      }

      path = paths.join(environment.FolderDelimiter);
    }
    return path;
  }

  selectItemForDelete(fileId: number) {
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

  addFiles() {
    let actualPath: string = "";
    let FilePath = this.currentFolder;
    if(FilePath !== "") {
      actualPath = FilePath.replace(`${DocumentPathName}${environment.FolderDelimiter}${UserPathName}${environment.FolderDelimiter}`, "");
    }

    this.targetFolder = actualPath;
    $('#staticBackdropDown').modal('show');
  }

  // addSubFolder(FilePath: string) {
  //   let actualPath = FilePath.replace(`${DocumentPathName}${environment.FolderDelimiter}${UserPathName}${environment.FolderDelimiter}`, "");
  //   this.targetFolder = actualPath;
  //   $('#staticBackdropDown').modal('show');
  // }

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
          $('#staticBackdropDown').modal('hide');
          this.cleanFileHandler();
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
    this.isLargeFile = false;
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
  IsFolder: boolean = false;
  NoOfItems: number = 0;
  ParentFolder: string = null;
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

