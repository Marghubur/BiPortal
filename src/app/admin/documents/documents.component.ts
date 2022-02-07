import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IsValidResponse, ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { Clients, Employees, Resume, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

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
  fileData: Array<any> = [];
  isDocumentReady: boolean = false;
  personDetail: DocumentUser = null;
  personDetails: Array<DocumentUser> = [];
  candidatesData: Filter = null;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
  ) { }

  ngOnInit(): void {
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
    if(this.documentForm.invalid) {
      return;
    }
    $("#uploadocument").click();
  }

  RefreshDocuments() {
    if(this.currentUser.UserId > 0) {
      this.http.post("OnlineDocument/GetDocumentByUserId", { "UserId": this.currentUser.UserId }).then((response: ResponseModel) => {
        if(response.ResponseBody && response.ResponseBody.Table) {
          this.fileData = response.ResponseBody.Table;
          this.isDocumentReady = true;;
        }
      });
    } else {
      Toast("Invalid user.")
    }
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
          this.fileData = response.ResponseBody.Table;
          this.isDocumentReady = true;;
        } else {
          Toast("Fail to uplaoded");
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

class Files {
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
}
