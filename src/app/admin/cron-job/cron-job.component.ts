import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ManageCronJob, SERVICE } from 'src/providers/constants';
import { Jobs } from '../manage-cronjob/manage-cronjob.component';
import { Filter } from 'src/providers/userService';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-cron-job',
  templateUrl: './cron-job.component.html',
  styleUrls: ['./cron-job.component.scss']
})
export class CronJobComponent implements OnInit {
  isEmpPageReady: boolean = false;
  allJobs: Array<Jobs> = [];
  orderByJobTypeNameAsc: boolean = null;
  orderByTopicNameAsc: boolean = null;
  orderByGroupIdAsc: boolean = null;
  jobData: Filter = new Filter();
  JobDetail: Jobs = {
    GroupId : "",
    IsActiveJob : false,
    JobDayOfMonth : 0,
    JobDayOfWeek : 0,
    JobEndDate : null,
    JobId : 0,
    JobMonthOfYear : 0,
    JobOccurrenceType : 0,
    JobStartDate : null,
    JobTime : 0,
    JobTypeDescription : "",
    KafkaServiceNameId : 0,
    Template : "",
    TopicName : "",
    JobTypeName: ""
  }
  constructor(private http: AjaxService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isEmpPageReady = false;
    this.allJobs = [];
    this.http.get(`manager/getAllJobs`, SERVICE.JOBS).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.allJobs = res.ResponseBody;
        this.isEmpPageReady = true;
      }
    }).catch(e => {
      this.isEmpPageReady = true;
    })
  }

  pageReload() {
    this.jobData = new Filter();
    this.JobDetail = {
      GroupId : "",
      IsActiveJob : false,
      JobDayOfMonth : 0,
      JobDayOfWeek : 0,
      JobEndDate : null,
      JobId : 0,
      JobMonthOfYear : 0,
      JobOccurrenceType : 0,
      JobStartDate : null,
      JobTime : 0,
      JobTypeDescription : "",
      KafkaServiceNameId : 0,
      Template : "",
      TopicName : "",
      JobTypeName: ""
    };
    this.loadData();
  }

  filterRecords() {

  }

  resetFilter() {

  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }

    if (FieldName == 'JobTypeName') {
      this.orderByJobTypeNameAsc = !flag;
      this.orderByGroupIdAsc = null;
      this.orderByTopicNameAsc = null;
    } else if (FieldName == 'TopicName') {
      this.orderByJobTypeNameAsc = null;
      this.orderByGroupIdAsc = null;
      this.orderByTopicNameAsc = !flag;
    }
    if (FieldName == 'GroupId') {
      this.orderByJobTypeNameAsc = null;
      this.orderByGroupIdAsc = !flag;
      this.orderByTopicNameAsc = null;
    }
    this.jobData = new Filter();
    this.jobData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.jobData = e;
      this.loadData();
    }
  }

  editCronJob(item: Jobs) {
    this.nav.navigate(ManageCronJob, item);
  }

  deleteCronJob(item: Jobs) {

  }

  addNewCronJob() {
    this.nav.navigate(ManageCronJob, null);
  }

}
