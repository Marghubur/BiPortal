import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminNotification, EmailLinkConfig } from 'src/providers/constants';
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
  orderByDepartmentAsc: boolean = null;
  orderByBriefDetailDateAsc: boolean = null;
  orderByCreatedAsc: boolean = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    this.currentNotification = new Notification();
    this.notificationData = new Filter();
    this.notifiCationDetail = new  Notification();
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
       this.allNotificationList[i].CompleteDetail = JSON.parse(this.allNotificationList[i].CompleteDetail);
      }
      this.notificationData.TotalRecords= this.allNotificationList[0].Total;
    } else{
      this.notificationData.TotalRecords = 0;
    }
  }

  initForm() {
    this.notificationForm = this.fb.group({
      NotificationId: new FormControl(this.currentNotification.NotificationId, [Validators.required]),
      Topic: new FormControl(this.currentNotification.Topic, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      BriefDetail: new FormControl(this.currentNotification.BriefDetail, [Validators.required]),
      DepartmentId: new FormControl(this.currentNotification.DepartmentId, [Validators.required]),
      CompleteDetail: new FormControl(this.currentNotification.CompleteDetail, [Validators.required])
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
    this.http.post("CompanyNotification/InsertUpdateNotification", value).then(res => {
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
    this.currentNotification = new Notification();
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

    if(this.notifiCationDetail.DepartmentId > 0) {
      this.notificationData.SearchString += ` and DepartmentId =${this.notifiCationDetail.DepartmentId}`;
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
    this.notifiCationDetail.DepartmentId = null;
  }

  editNotificationPopup(data: Notification) {
    if (data) {
      this.currentNotification = data;
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
      this.orderByDepartmentAsc = null;
      this.orderByBriefDetailDateAsc = null;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'DepartmentId') {
      this.orderByTopicAsc = null;
      this.orderByDepartmentAsc = !flag;
      this.orderByBriefDetailDateAsc = null;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'BriefDetail') {
      this.orderByTopicAsc = null;
      this.orderByDepartmentAsc = null;
      this.orderByBriefDetailDateAsc = !flag;
      this.orderByCreatedAsc = null;
    } else if (FieldName == 'CreatedOn') {
      this.orderByTopicAsc = null;
      this.orderByDepartmentAsc = null;
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

}

class Notification {
  NotificationId: number = 0;
  Topic: string = null;
  CompanyId: number = 0;
  BriefDetail: string = null;
  DepartmentId: number = 0;
  CompleteDetail: string = null;
  Total: number = 0;
  Index: number = 0;
  CreatedOn: Date = null;
  UpdatedOn: Date = null;
}
