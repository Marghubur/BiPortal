import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast } from 'src/providers/common-service/common.service';
import { SERVICE } from 'src/providers/constants';

@Component({
  selector: 'app-cron-job',
  templateUrl: './cron-job.component.html',
  styleUrls: ['./cron-job.component.scss']
})
export class CronJobComponent implements OnInit {
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

  constructor(private calendar: NgbCalendar,
              private fb: FormBuilder,
              private http: AjaxService) {}

  ngOnInit(): void {
    this.minDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    this.jobstartdateModel = this.calendar.getToday();
    this.jobenddateModel = this.calendar.getToday();
    this.loadData();
    this.initform();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`manager/getAllJobs/${1}`, SERVICE.JOBS).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.jobDetail = res.ResponseBody;
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
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
    this.http.post("", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {

        this.isLoading = false;
        this.isSubmitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
    console.log(value);
    this.isLoading = false;
    this.isSubmitted = false;
  }

}

interface Jobs {
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
  Template: string
}

