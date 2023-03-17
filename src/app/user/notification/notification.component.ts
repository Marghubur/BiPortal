import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResponseModel } from 'src/auth/jwtService';
import { environment } from 'src/environments/environment';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { AImage, Doc, Docx, JImage, Pdf, PImage, Txt } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
import { Files } from '../profile/profile.component';
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
              private local: ApplicationStorage,
              private sanitizer: DomSanitizer,
              private nav: iNavigation) { }

  ngOnInit(): void {
    // this.notification = [{
    //   Email: "marghub12@gmail.com",
    //   ActionTakenOn: new Date(),
    //   Status: 1,
    //   AssigneeId: 1,
    //   Mobile: "8293437694",
    //   UserName: "Marghub",
    //   RequestedOn: new Date(),
    //   UserTypeId: 1,
    //   UserId: 7,
    //   NotificationId: 1,
    //   Message: "You've been missing out on our latest stuff!"
    // },
    // {
    //   Email: "marghub12@gmail.com",
    //   ActionTakenOn: new Date(),
    //   Status: 1,
    //   AssigneeId: 1,
    //   Mobile: "8293437694",
    //   UserName: "Marghub",
    //   RequestedOn: new Date(),
    //   UserTypeId: 1,
    //   UserId: 7,
    //   NotificationId: 1,
    //   Message: "You've been missing out on our latest stuff!"
    // },
    // {
    //   Email: "marghub12@gmail.com",
    //   ActionTakenOn: new Date(),
    //   Status: 1,
    //   AssigneeId: 1,
    //   Mobile: "8293437694",
    //   UserName: "Marghub",
    //   RequestedOn: new Date(),
    //   UserTypeId: 1,
    //   UserId: 7,
    //   NotificationId: 1,
    //   Message: "You've been missing out on our latest stuff!"
    // },
    // {
    //   Email: "marghub12@gmail.com",
    //   ActionTakenOn: new Date(),
    //   Status: 1,
    //   AssigneeId: 1,
    //   Mobile: "8293437694",
    //   UserName: "Marghub",
    //   RequestedOn: new Date(),
    //   UserTypeId: 1,
    //   UserId: 7,
    //   NotificationId: 1,
    //   Message: "You've been missing out on our latest stuff!"
    // }]

    let data = this.local.findRecord("Companies");
    this.userDetail = this.local.findRecord("UserDetail");
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
      this.notificationData.TotalRecords= this.allNotificationList[0].Total;
    } else{
      this.notificationData.TotalRecords = 0;
    }
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

  viewNotificationPopup(data: Notification) {
    if (data) {
      this.currentNotification = data;
      this.getNotificationFiles(data.FileIds);
      $('#viewNotificationModal').modal('show');
    }
  }

  getNotificationFiles(fileids: any) {
    this.isLoading = true;
    this.companyFile = [];
    this.uploadedFile = [];
    this.http.get(`Product/GetProductImages/${fileids}`).then(res => {
      if (res.ResponseBody) {
        this.companyFile = res.ResponseBody.Table;
        if (this.companyFile.length > 0) {
          this.companyFile.forEach(element => {
            this.uploadedFile.push(element);
          });
        }
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
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

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  createNotificationPopUp() {
    $('#createNotification').modal('show');
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

  uploadedFilePopUp() {
    $('#viewFileModal').modal('show');
  }

}

export class EmployeeNotification {
	NotificationId: number = null;
	Message: string = '';
	UserId:number = null;;
	UserTypeId:number = null;;
	RequestedOn:Date = null;
	UserName:string = '';
	Email: string = '';
	Mobile: string = '';
	AssigneeId: number = null;
	Status: number = null;
	ActionTakenOn:Date = null
}

export class Notification {
  NotificationId: number = 0;
  Topic: string = null;
  CompanyId: number = 0;
  BriefDetail: string = null;
  CompleteDetail: string = null;
  Total: number = 0;
  Index: number = 0;
  CreatedOn: Date = null;
  UpdatedOn: Date = null;
  StartDate: Date = null;
  EndDate: Date = null;
  IsGeneralAnnouncement: boolean = false;
  AnnouncementType: number = 0;
  AnnouncementId: string = null;
  Departments: Array<any> =null;
  DepartmentId: number = 0;
  IsExpired: boolean = false;
  FileIds: Array<any>= [];
}
