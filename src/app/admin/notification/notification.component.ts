import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Notification } from 'src/app/adminmodal/admin-modals';
import { Files } from 'src/app/commonmodal/common-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { environment } from 'src/environments/environment';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { AdminNotification, AImage, Doc, Docx, EmailLinkConfig, JImage, Pdf, PImage, Txt } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  isLoading: boolean = false;
  isPageReady: boolean = true;
  allNotificationList: Array<Notification> =[];
  notificationForm: FormGroup;
  currentNotification: Notification = null;
  submitted: boolean = false;
  companyId: number = 0;
  currentCompany: any = null;
  notificationData: Filter = null;
  notifiCationDetail: Notification= null;
  orderByTopicAsc: boolean = null;
  orderByAnnounceTypeAsc: boolean = null;
  orderByBriefDetailDateAsc: boolean = null;
  orderByCreatedAsc: boolean = null;
  startDateModel: NgbDateStruct;
  EndDateModel: NgbDateStruct;
  departsments: Array<any> = [];
  employeeRoles: Array<any> = [];
  selectedDepartment: Array<any> = [];
  fileCollection: Array<any> = [];
  fileList: Array<Files> = [];
  userDetail: any = null;
  uploadedFile: Array<any> = [];
  companyFile: Array<any> = [];
  baseUrl: string = "";
  viewer: any = null;
  renderedDocxFile: any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private sanitizer: DomSanitizer,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    this.userDetail = this.local.findRecord("UserDetail");
    this.currentNotification = new Notification();
    this.notificationData = new Filter();
    this.notifiCationDetail = new  Notification();
    this.baseUrl = this.http.GetImageBasePath();
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.notificationData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
        this.loadData();
        this.initForm();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.post('CompanyNotification/GetNotificationRecord', this.notificationData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        Toast("Record found");
        this.isPageReady = true;
      } else {
      this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  bindData(res : any) {
    this.allNotificationList = res;
    if (this.allNotificationList.length > 0) {
      for (let i = 0; i < this.allNotificationList.length; i++) {
        let enddate = ToLocateDate(this.allNotificationList[i].EndDate).setHours(0,0,0,0);
        let now = new Date().setHours(0,0,0,0);
        if (now > enddate)
          this.allNotificationList[i].IsExpired = true;
      }
      this.notificationData.TotalRecords= this.allNotificationList[0].Total;
    } else{
      this.notificationData.TotalRecords = 0;
    }
  }

  getDepartmentAndRole(AnnouncementType: number, FileIds: any) {
    this.http.get("CompanyNotification/GetDepartmentsAndRoles").then(res => {
      if (res.ResponseBody) {
        this.departsments = res.ResponseBody.Table;
        this.employeeRoles = res.ResponseBody.Table1;
        this.companyFile = res.ResponseBody.Table2;
        this.bindPageData(AnnouncementType, FileIds);
      }
    })
  }

  onSelectAnnouncement(e: any) {
    let value = e.target.value;
    this.selectedDepartment = [];
    if (value > 0) {
      if (value == 2) {
        for (let i = 0; i < this.departsments.length; i++) {
          this.selectedDepartment.push({
            Id: this.departsments[i].DepartmentId,
            Value: this.departsments[i].DepartmentName
          });
        }
      }
      else if (value == 3) {
        for (let i = 0; i < this.employeeRoles.length; i++) {
          this.selectedDepartment.push({
            Id: this.employeeRoles[i].RoleId,
            Value: this.employeeRoles[i].RoleName
          });
        }
      }
    } else {
      ErrorToast("Please select a valid announcement type");
    }
  }

  initForm() {
    this.notificationForm = this.fb.group({
      NotificationId: new FormControl(this.currentNotification.NotificationId, [Validators.required]),
      Topic: new FormControl(this.currentNotification.Topic, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      BriefDetail: new FormControl(this.currentNotification.BriefDetail, [Validators.required]),
      CompleteDetail: new FormControl(this.currentNotification.CompleteDetail, [Validators.required]),
      StartDate: new FormControl(this.currentNotification.StartDate, [Validators.required]),
      EndDate: new FormControl(this.currentNotification.EndDate, [Validators.required]),
      DepartmentId: new FormControl(this.currentNotification.DepartmentId),
      AnnouncementType: new FormControl(this.currentNotification.AnnouncementType),
      IsGeneralAnnouncement: new FormControl(this.currentNotification.IsGeneralAnnouncement ? 'true' : 'false')
    })
  }

  get f() {
    return this.notificationForm.controls;
  }

  manageNotification() {
    this.submitted = true;
    this.isLoading = true;
    if (this.notificationForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.notificationForm.value;
    if (this.selectedDepartment!= null) {
      let department = this.selectedDepartment.find(x => x.Id == value.DepartmentId);
      value.DepartmentsList =[{
        Id: department.Id,
        Value: department.Value
      }];
    }
    let formData = new FormData();
    formData.append("notification", JSON.stringify(value));
    if (this.fileList.length > 0) {
      let i = 0;
      while (i < this.fileList.length) {
        formData.append(this.fileList[i].FileName, this.fileCollection[i]);
        i++;
      }
    }
    formData.append('fileDetail', JSON.stringify(this.fileList));
    this.http.post("CompanyNotification/InsertUpdateNotification", formData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        $('#manageNotificationModal').modal('hide');
        Toast("Notification insert/update successfully");
        this.submitted = false;
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  addNotificationPopup() {
    this.fileList = [];
    this.fileCollection = [];
    this.uploadedFile = [];
    this.currentNotification = new Notification();
    this.getDepartmentAndRole(this.currentNotification.AnnouncementType, this.currentNotification.FileIds);
    this.initForm();
    $('#manageNotificationModal').modal('show');
  }

  filterRecords() {
    let delimiter = "";
    this.notificationData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.notificationData.reset();

    if(this.notifiCationDetail.Topic !== null && this.notifiCationDetail.Topic !== "") {
      this.notificationData.SearchString += ` and Topic like '%${this.notifiCationDetail.Topic}%'`;
        delimiter = "and";
    }

    if(this.notifiCationDetail.AnnouncementType > 0) {
      this.notificationData.SearchString += ` and AnnouncementType =${this.notifiCationDetail.AnnouncementType}`;
        delimiter = "and";
    }

    if(this.notifiCationDetail.BriefDetail !== null && this.notifiCationDetail.BriefDetail !== "") {
      this.notificationData.SearchString += ` and BriefDetail like '%${this.notifiCationDetail.BriefDetail}%'`;
        delimiter = "and";
    }

    this.loadData();
  }

  resetFilter() {
    this.notificationData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.notificationData.PageIndex = 1;
    this.notificationData.PageSize = 10;
    this.notificationData.StartIndex = 1;
    this.loadData();
    this.notifiCationDetail.Topic="";
    this.notifiCationDetail.BriefDetail = null;
    this.notifiCationDetail.AnnouncementType = 0;
  }

  bindPageData(AnnouncementType: number, FileIds) {
    this.selectedDepartment = [];
    if (AnnouncementType > 0) {
      if (AnnouncementType == 2) {
        for (let i = 0; i < this.departsments.length; i++) {
          this.selectedDepartment.push({
            Id: this.departsments[i].DepartmentId,
            Value: this.departsments[i].DepartmentName
          });
        }
      }
      else if (AnnouncementType == 3) {
        for (let i = 0; i < this.employeeRoles.length; i++) {
          this.selectedDepartment.push({
            Id: this.employeeRoles[i].RoleId,
            Value: this.employeeRoles[i].RoleName
          });
        }
      }
    }
    let fileid = JSON.parse(FileIds);
    if (fileid.length > 0) {
      for (let i = 0; i < fileid.length; i++) {
        let file = this.companyFile.find(x => x.CompanyFileId == fileid[i])
        this.uploadedFile.push(file);
      }
    }
  }

  editNotificationPopup(data: any) {
    if (data) {
      this.fileList = [];
      this.fileCollection = [];
      this.uploadedFile = [];
      this.getDepartmentAndRole(data.AnnouncementType, data.FileIds);
      this.currentNotification = data;
      this.currentNotification.DepartmentId = JSON.parse(data.Departments)[0].Id;
      this.currentNotification.StartDate = ToLocateDate(this.currentNotification.StartDate);
      this.startDateModel = { day: this.currentNotification.StartDate.getDate(), month: this.currentNotification.StartDate.getMonth() + 1, year: this.currentNotification.StartDate.getFullYear()};
      this.currentNotification.EndDate = ToLocateDate(this.currentNotification.EndDate);
      this.EndDateModel = { day: this.currentNotification.EndDate.getDate(), month: this.currentNotification.EndDate.getMonth() + 1, year: this.currentNotification.EndDate.getFullYear()};
      this.initForm();
      $('#manageNotificationModal').modal('show');
    }
  }

  viewNotificationPopup(data: Notification) {
    if (data) {
      this.currentNotification = data;
      $('#viewNotificationModal').modal('show');
    }
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'Topic') {
      this.orderByTopicAsc = !flag;
      this.orderByAnnounceTypeAsc = null;
      this.orderByBriefDetailDateAsc = null;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'AnnouncementType') {
      this.orderByTopicAsc = null;
      this.orderByAnnounceTypeAsc = !flag;
      this.orderByBriefDetailDateAsc = null;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'BriefDetail') {
      this.orderByTopicAsc = null;
      this.orderByAnnounceTypeAsc = null;
      this.orderByBriefDetailDateAsc = !flag;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'CreatedOn') {
      this.orderByTopicAsc = null;
      this.orderByAnnounceTypeAsc = null;
      this.orderByBriefDetailDateAsc = null;
      this.orderByCreatedAsc = !flag;
    }

    this.notificationData = new Filter();
    this.notificationData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.notificationData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.notificationData = e;
      this.loadData();
    }
  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, AdminNotification);
  }

  onStartDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.notificationForm.controls["StartDate"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.notificationForm.controls["EndDate"].setValue(date);
  }

  onChangeAnnouncement(e: any) {
    let value = e.target.value;
  }

  fireBrowserFile() {
    $("#uploaAnnouncedoc").click();
  }

  uploadAttachment(fileInput: any) {
    this.fileList = [];
    this.fileCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.AlternateName = "Announce_Attach";
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.ParentFolder = '';
        item.Email = this.userDetail.Email;
        item.UserId = this.userDetail.UserId;
        this.fileList.push(item);
        this.fileCollection.push(file);
        index++;
      };
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  viewFile(file: Files) {
    switch(file.FileExtension) {
      case Pdf:
        this.viewer = document.getElementById("viewfile-container");
        this.viewer.classList.remove('d-none');
        this.viewer.querySelector('iframe').classList.remove('bg-white');
        this.viewer.querySelector('iframe').setAttribute('src',
        `${this.baseUrl}${environment.FolderDelimiter}${file.FilePath}${environment.FolderDelimiter}${file.FileName}`);
      break;
      case Docx:
      case Doc:
        this.getDocxHtml(file);
        break;
      case Txt:
      case JImage:
      case PImage:
      case AImage:
        this.viewer = document.getElementById("viewfile-container");
        this.viewer.classList.remove('d-none');
        this.viewer.querySelector('iframe').classList.add('bg-white');
        this.viewer.querySelector('iframe').setAttribute('src',
        `${this.baseUrl}${environment.FolderDelimiter}${file.FilePath}${environment.FolderDelimiter}${file.FileName}`);
    }
  }

  getDocxHtml(file: Files) {
    this.renderedDocxFile = null;
    let filePath = `${file.FilePath}${environment.FolderDelimiter}${file.FileName}`;
    this.http.post("FileMaker/GetDocxHtml", { DiskFilePath: file.FilePath, FilePath: filePath }).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.renderedDocxFile = this.sanitizer.bypassSecurityTrustHtml(response.ResponseBody);
        $('#showDocxFile').modal('show');
      } else {
        ErrorToast("Unable to render the file");
      }
    })
  }

  CloseDocxViewer() {
    $('#showDocxFile').modal('hide');
    this.renderedDocxFile = null;
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  uploadedFilePopUp() {
    $('#viewFileModal').modal('show');
  }
}
