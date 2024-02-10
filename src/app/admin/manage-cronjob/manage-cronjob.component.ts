import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { SERVICE } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-manage-cronjob',
  templateUrl: './manage-cronjob.component.html',
  styleUrls: ['./manage-cronjob.component.scss']
})
export class ManageCronjobComponent implements OnInit {
  jobstartdateModel: NgbDateStruct;
  jobenddateModel: NgbDateStruct;
  minDate: any = null;
  jobsForm: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  isPageReady: boolean = false;
  jobDetail: Jobs = {
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
    JobTypeName : "",
    Template : "",
    TopicName : ""
  };
  cronJobId: number = 0;

  constructor(private calendar: NgbCalendar,
              private fb: FormBuilder,
              private http: AjaxService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.minDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    let data = this.nav.getValue();
    if (data) {
      this.cronJobId = data.JobId;
    }
    this.initform();
    this.initData();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`manager/getJobsById/${this.cronJobId}`, SERVICE.JOBS).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.jobDetail = res.ResponseBody;
        this.initform();
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  initData() {
    this.jobstartdateModel = this.calendar.getToday();
    this.jobenddateModel = this.calendar.getToday();
    this.loadData();
  }

  pageReload() {
    this.initData();
  }

  initform() {
    this.jobsForm = this.fb.group({
      JobId: new FormControl(this.jobDetail.JobId),
      JobTypeName: new FormControl(this.jobDetail.JobTypeName, [Validators.required]),
      JobTypeDescription: new FormControl(this.jobDetail.JobTypeDescription, [Validators.required]),
      IsActiveJob: new FormControl(this.jobDetail.IsActiveJob),
      JobStartDate: new FormControl(this.jobDetail.JobStartDate, [Validators.required]),
      JobEndDate: new FormControl(this.jobDetail.JobEndDate),
      JobTime: new FormControl(this.jobDetail.JobTime),
      JobDayOfWeek: new FormControl(this.jobDetail.JobDayOfWeek),
      JobDayOfMonth: new FormControl(this.jobDetail.JobDayOfMonth),
      JobMonthOfYear: new FormControl(this.jobDetail.JobMonthOfYear),
      JobOccurrenceType: new FormControl(this.jobDetail.JobOccurrenceType),
      TopicName: new FormControl(this.jobDetail.TopicName, [Validators.required]),
      GroupId: new FormControl(this.jobDetail.GroupId, [Validators.required]),
      Template: new FormControl(this.jobDetail.Template)
    })
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.jobsForm.controls["JobStartDate"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.jobsForm.controls["JobEndDate"].setValue(date);
  }

  get f() {
    return this.jobsForm.controls;
  }

  saveJobsConnection() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.jobsForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all the mandatory field");
      return;
    }

    let value = this.jobsForm.value;
    this.http.post("manager/manageJobs", value, SERVICE.JOBS).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Job detail insert/updated successfully");
        this.isLoading = false;
        this.isSubmitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }
}

export interface Jobs {
  JobId: number,
  JobTypeName: string,
  JobTypeDescription: string,
  IsActiveJob: boolean,
  JobStartDate: Date,
  JobEndDate: Date,
  JobTime: number,
  JobDayOfWeek: number,
  JobDayOfMonth: number,
  JobMonthOfYear: number,
  JobOccurrenceType: number,
  TopicName: string,
  GroupId: string,
  Template: string,
}
