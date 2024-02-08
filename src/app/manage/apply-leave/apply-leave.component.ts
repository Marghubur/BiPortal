import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDate, NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs';
import { LeaveModal } from 'src/app/adminmodal/admin-modals';
import { Files } from 'src/app/commonmodal/common-modals';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  cachedData: any = null;
  isLoading: boolean = false;
  model: NgbDateStruct;
  leaveDays: number = 1;
  leaveForm: FormGroup;
  userDetail: any = null;
  employeeId: number = 0;
  managerList: autoCompleteModal = null;
  leaveDetail: LeaveModal = null;
  isPageReady: boolean = false;
  submitted: boolean = false;
  fromdateModal: NgbDateStruct;
  employeeData: Filter = new Filter();
  isLeaveDetails: boolean = false;
  leaveData: Array<any> = [];
  isLeaveDataFilter: boolean = false;
  leaveTypes: Array<any> = [];
  chartDataset: Array<any> = [];
  testDataset: Array<any> = [];
  graphInstances: Array<any> = [];
  observer: Subscription = null;
  isEnabled: boolean = false;
  minDate: any;
  maxDate: any;
  reportingManagerId: number = 0;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  viewer: any = null;
  monthlyLeaveData: any = null;
  isLeaveConsume: boolean = false;
  datePickerJson = {};
  json = {
    disable: [],
    disabledDates: [],
  };
  isDisabled;
  currentLeaveType: any = null;
  basePath: string = "";
  leaveAttachment: Array<any> = [];
  chartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
      }
    ]
  };

  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '24',
    plugins: {
      title: {
        display: true,
        text: '',
      },
      legend: {
        display: false
      }
    },
  };

  @ViewChildren('leaveChart') entireChart: QueryList<any>;

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private user: UserService,
              private config: NgbDatepickerConfig,
              private fb: FormBuilder,
              private calendar: NgbCalendar,
              private router: Router
              ) {
    config.minDate = {year: new Date().getFullYear(), month: 1, day: 1};
    config.maxDate = {year: new Date().getFullYear(), month: 12, day: 31};
    config.outsideDays = 'hidden';
    this.findDisabledDate();
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.cachedData = this.nav.getValue();
    this.basePath = this.http.GetImageBasePath();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.employeeId = this.userDetail.UserId;
    this.initData();
  }

  initData() {
    this.fromdateModal = this.calendar.getToday();
    this.model = this.calendar.getToday();
    this.leaveDetail = new LeaveModal();
    this.leaveDetail.LeaveFromDay = new Date(this.model.year, this.model.month, this.model.day);
    this.leaveDetail.LeaveToDay = new Date(new Date().setDate( this.leaveDetail.LeaveFromDay.getDate() + 1));
    this.leaveDetail.LeaveTypeId = 0;
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.managerList.className="";
    this.loadAutoComplete();
    if(!this.cachedData) {
      this.reportingManagerId = this.userDetail.ReportingManagerId;
      if(this.userDetail && this.userDetail != null) {
        this.leaveDetail.EmployeeId = this.employeeId;
        this.clearChart();
        this.loadData();
      } else {
        Toast("Invalid user. Please login again.")
      }
    }
  }

  pageReload() {
    this.initData();
  }

  leavePopUp() {
    this.isPageReady = true;
    this.leaveDetail = new LeaveModal();
    this.currentLeaveType = null;
    this.leaveRequestForm();
    this.leaveDetail.LeaveFromDay = new Date();
    this.leaveDetail.LeaveToDay = new Date();
    this.leaveForm.get('LeaveFromDay').setValue(this.leaveDetail.LeaveFromDay);
    this.leaveForm.get('LeaveToDay').setValue(this.leaveDetail.LeaveToDay);
    this.weekendDisabledDate();
    $('#leaveModal').modal('show');
  }

  loadAutoComplete() {
    this.isPageReady = false;
    this.managerList.data = [];
    this.managerList.placeholder = "Employee";
    this.managerList.data = GetEmployees();
    this.managerList.className = "";
  }

  submitLeave() {
    this.submitted = true;
    this.isLoading = true;
    if (this.employeeId > 0) {
      let value = this.leaveForm.value;
      value.UserTypeId = UserType.Employee;
      value.RequestType = 1;
      value.Session = Number(value.Session);
      let reportingmanager = this.managerList.data.find(x => x.value == this.reportingManagerId);
      if(!reportingmanager) {
        ErrorToast("Reporting manager is not selected. Please select one.");
        this.submitted = false;
        this.isLoading = false;
        return;
      }

      value.AssigneId = this.reportingManagerId;
      value.AssigneeEmail = reportingmanager.email;
      this.leaveForm.get('IsProjectedFutureDateAllowed').setValue(this.currentLeaveType.IsFutureDateAllowed);
      if (this.leaveForm.get('EmployeeId').errors !== null) {
        WarningToast("Employee is not selected properly.");
        this.isLoading = false;
        return;
      }

      if (this.leaveForm.get('LeaveFromDay').errors !== null) {
        WarningToast("Please select start and end date first.");
        this.isLoading = false;
        return;
      }

      if (this.currentLeaveType.IsCommentsRequired) {
        if (this.leaveForm.get('Reason').errors !== null) {
          WarningToast("Reason is required. Please fill the reason.");
          this.isLoading = false;
          return;
        }
      }

      if (this.leaveForm.get('LeaveToDay').errors !== null) {
        WarningToast("Please select start and end date first.");
        this.isLoading = false;
        return;
      }

      if (this.leaveForm.get('LeaveTypeId').errors !== null) {
        WarningToast("Please select Leave Type first.");
        this.isLoading = false;
        return;
      }

      let leaveDay = Math.round((Date.UTC(this.leaveDetail.LeaveToDay.getFullYear(), this.leaveDetail.LeaveToDay.getMonth(), this.leaveDetail.LeaveToDay.getDate()) - Date.UTC(this.leaveDetail.LeaveFromDay.getFullYear(), this.leaveDetail.LeaveFromDay.getMonth(), this.leaveDetail.LeaveFromDay.getDate())) /(1000 * 60 * 60 * 24)) + 1;
      if (leaveDay <=0) {
        ErrorToast("Please select a valid end date");
        this.isLoading = false;
        return;
      }

      if (leaveDay > 1 && value.Session > 1) {
        ErrorToast("You can't be applied more than one half day");
        this.isLoading = false;
        return;
      }

      if (this.leaveDays > 0 && !value.IsProjectedFutureDateAllowed){
        this.checkIsLeaveAvailabel();
        if (!this.isLoading)
          return;
      }

      let formData = new FormData();
      if (this.FileDocumentList.length > 0) {
        let i = 0;
        while (i < this.FileDocumentList.length) {
          formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
          i++;
        }
      }

      formData.append('leave', JSON.stringify(value));
      formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      this.http.post('Leave/ApplyLeave', formData).then ((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.bindData(res);
          this.isEnabled = false;
          $('#leaveModal').modal('hide');
          Toast("Leave apply successfully.");
          this.submitted = false;
          this.isLoading = false;
        }
      }).catch(e => {
        this.submitted = false;
        this.isLoading = false;
      });
    }
  }

  onDateSelect(e: NgbDateStruct) {
    let value  = new Date(e.year, e.month-1, e.day);
    if (value.setHours(0,0,0,0) >= this.leaveDetail.LeaveFromDay.setHours(0,0,0,0)) {
      this.leaveDetail.LeaveToDay = value;
      this.leaveDays = Math.floor((Date.UTC(this.leaveDetail.LeaveToDay.getFullYear(), this.leaveDetail.LeaveToDay.getMonth(), this.leaveDetail.LeaveToDay.getDate()) - Date.UTC(this.leaveDetail.LeaveFromDay.getFullYear(), this.leaveDetail.LeaveFromDay.getMonth(), this.leaveDetail.LeaveFromDay.getDate()) ) /(1000 * 60 * 60 * 24)) + 1;
      this.leaveForm.get('LeaveToDay').setValue(value);
    }
    else
      ErrorToast("Please select a valid date.")
  }

  onDateSelection(e: NgbDateStruct) {
    let value  = new Date(e.year, e.month-1, e.day);
    this.leaveForm.get('LeaveToDay').setValue(value);
    this.leaveForm.get('LeaveFromDay').setValue(value);
    this.leaveDetail.LeaveFromDay = value;
    this.leaveDetail.LeaveToDay = value;
    let leaveDay = Math.round((Date.UTC(this.leaveDetail.LeaveToDay.getFullYear(), this.leaveDetail.LeaveToDay.getMonth(), this.leaveDetail.LeaveToDay.getDate()) - Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())) /(1000 * 60 * 60 * 24)) + 1;
    if (leaveDay > 0)
      this.leaveDays = leaveDay;
    else
      this.leaveDays = 0;
    this.maxDate = {year: e.year, month: e.month, day: e.day};
    this.model = { day: value.getDate(), month: value.getMonth()+1, year: value.getFullYear()};
  }

  leaveRequestForm() {
    this.leaveForm = this.fb.group({
      LeaveFromDay: new FormControl(this.leaveDetail.LeaveFromDay, [Validators.required]),
      LeaveToDay: new FormControl(this.leaveDetail.LeaveToDay, [Validators.required]),
      Session: new FormControl(this.leaveDetail.Session, [Validators.required]),
      Reason: new FormControl(this.leaveDetail.Reason),
      RequestType: new FormControl(this.leaveDetail.RequestType),
      IsProjectedFutureDateAllowed: new FormControl(this.leaveDetail.IsProjectedFutureDateAllowed),
      LeaveTypeId: new FormControl('', [Validators.required]),
      UserTypeId: new FormControl(this.leaveDetail.UserTypeId),
      EmployeeId: new FormControl(this.employeeId),
      LeavePlanName: new FormControl('')
    })
  }

  checkIsLeaveAvailabel() {
    let leavePlanTypeId = this.leaveForm.get('LeaveTypeId').value;
    let leave = this.leaveTypes.find(x => x.LeavePlanTypeId == leavePlanTypeId);
    if (this.leaveDays > leave.AvailableLeaves) {
      ErrorToast("Applying leave is greater than leave limit");
      this.isLoading = false;
      return;
    }
  }

  get f() {
    return this.leaveForm.controls;
  }

  loadData() {
    this.isPageReady = false;
    let value = {
      EmployeeId: this.employeeId
    }

    this.http.post('Leave/GetAllLeavesByEmpId', value)
    .then((res: ResponseModel) => {
      if (res.ResponseBody)
        this.bindData(res);
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  bindData(res: any) {
    if(res.ResponseBody.LeaveTypeBriefs) {
      this.leaveData = [];
      this.leaveData = res.ResponseBody.LeaveNotificationDetail;
      if (this.leaveData && this.leaveData.length > 0) {
        this.leaveData.forEach(x => {
          x.FromDate = ToLocateDate(x.FromDate);
          x.ToDate = ToLocateDate(x.ToDate);
          x.CreatedOn = ToLocateDate(x.CreatedOn)
        })
      }
      let plandetail = res.ResponseBody.LeaveTypeBriefs;
      if(plandetail) {
        this.leaveTypes = plandetail;
      } else {
        this.leaveTypes = [];
      }

      if (res.ResponseBody.ShiftDetail) {
        this.findWeekend(res.ResponseBody.ShiftDetail);
      }

      let companyHoliday = res.ResponseBody.CompanyHoliday;
      if (companyHoliday && companyHoliday.length > 0) {
        this.findHoliday(companyHoliday);
        this.findDisabledDate();
      }
      this.monthlyLeaveData = null;
      this.monthlyLeaveData = res.ResponseBody.MonthlyLeaveData;
      this.isPageReady = true;
      this.DestroyGraphInstances();
      this.bindChartData();
    }
  }

  bindChartData() {
    let i = 0;
    this.chartDataset = [];
    while(i < this.leaveTypes.length) {
      this.LeaveChart(i, this.leaveTypes[i]);
      i++;
    }
    this.leaveRequestForm();
    this.MonthlyStatusChart();


    if(this.observer != null)
      this.observer.unsubscribe();

    this.observer = this.entireChart.changes.subscribe(t => {
      let canvasChars: Array<any> = t._results;
      canvasChars.map((item: any, i: number) => {
        this.buildChartData(item.nativeElement.getContext('2d'), i);
      });
    });
    this.bindDonutChartData();
  }

  findHoliday(allHoliday: Array<any>) {
    for (let i = 0; i < allHoliday.length; i++) {
      let startDate = ToLocateDate(allHoliday[i].StartDate);
      let endDate = ToLocateDate(allHoliday[i].EndDate);
      let gap = (endDate.setHours(0,0,0,) - startDate.setHours(0,0,0,0))/ (1000*60*60*24);
      for (let j = 0; j <= gap; j++) {
        this.json.disabledDates.push({
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate()
        });
        startDate.setDate(startDate.getDate() + 1);
      }

    }
  }

  findWeekend(shiftDetail: any) {
    if (!shiftDetail.IsSun)
      this.json.disable.push(7);

    if (!shiftDetail.IsMon)
      this.json.disable.push(1);

    if (!shiftDetail.IsTue)
      this.json.disable.push(2);

    if (!shiftDetail.IsWed)
        this.json.disable.push(3);

    if (!shiftDetail.IsThu)
      this.json.disable.push(4);

    if (!shiftDetail.IsFri)
      this.json.disable.push(5);

    if (!shiftDetail.IsSat)
      this.json.disable.push(6);

  }

  findDisabledDate() {
    if (this.json.disabledDates.length > 0) {
      this.isDisabled = (
        date: NgbDateStruct
      ) => {
        return this.json.disabledDates.find((x) =>
          new NgbDate(x.year, x.month, x.day).equals(date) ||
          this.json.disable.includes(this.calendar.getWeekday(new NgbDate(date.year, date.month, date.day)))
        ) ? true : false;
      }
    }
  }

  weekendDisabledDate() {
    if (this.json.disable.length > 0) {
      this.isDisabled = (
        date: NgbDateStruct
        //current: { day: number; month: number; year: number }
      ) => {
        return this.json.disabledDates.find(
          (x) =>
            new NgbDate(x.year, x.month, x.day).equals(date) ||
            this.json.disable.includes(
              this.calendar.getWeekday(new NgbDate(date.year, date.month, date.day))
            )
        )
          ? true
          : false;
      };
    }
  }

  buildChartData(context: any, index: any) {
    let item = this.chartDataset[index];
    let bgColor = []
    switch(index % 7) {
      case 0:
        bgColor = ['red', '#379237'];
        break;
        default:
        case 1:
          bgColor = ['red', 'rgba(255, 159, 64, 0.2)'];
          break;
        case 2:
          bgColor = ['red', '#379273'];
          break;
        bgColor = ['blue', 'rgba(153, 102, 255, 0.2)'];
        break;
    }

    let graph = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: ['Consumed', 'Available'],
        datasets: [{
          label: 'My leave plan',
          backgroundColor: bgColor,
          borderWidth: 0,
          data: [item.ConsumedLeave, item.AvailableLeaves],
          hoverOffset: 4,
          hoverBackgroundColor: bgColor,
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 60
      }
    });

    this.graphInstances.push(graph);
  }

  DestroyGraphInstances() {
    let i = 0;
    while(i < this.graphInstances.length) {
      this.graphInstances[i].destroy();
      i++;
    }

    this.graphInstances = [];
  }

  LeaveChart(index: number, item: any) {
    let consumeLeave = 0;
    let leavedata: any = this.leaveData.filter(x => x.LeaveTypeId == item.LeavePlanTypeId);
    if (leavedata.length > 0) {
      consumeLeave = leavedata.map(x => x.NumOfDays).reduce((acc, curr) => {return acc + curr;}, 0)
    }
    this.chartDataset.push({
      PlanName: item.LeavePlanTypeName,
      AvailableLeaves: item.AvailableLeaves,
      AccrualedTillDate: item.AccruedSoFar,
      MaxLeaveLimit: item.TotalLeaveQuota,
      // PlanDescription: item.PlanDescription,
      // LeavePlanCode: item.LeavePlanCode,
      LeavePlanTypeId: item.LeavePlanTypeId,
      ConsumedLeave: consumeLeave,
      Config: null
    });
  }

  showLeaveDetails() {
    this.isLeaveDetails = !this.isLeaveDetails;
    this.isLeaveDataFilter = false;
  }

  PageChange(e: Filter) {
    if(e != null) {
      this.employeeData = e;
      this.GetFilterResult();
    }
  }

  GetFilterResult() {
    this.leaveData = [];
    let year = new Date().getFullYear();
    this.http.post('Leave/GetAllLeavesByEmpId',this.employeeId)
    .then ((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.bindData(response);

        // for (let i = 0; i < this.leaveTypes.length; i++) {
        //   let value = this.leaveData.filter(x => x.LeaveType == this.leaveTypes[i].LeavePlanTypeId);
        //   if (value.length > 0) {
        //     let totalDays = 0;
        //     for (let j = 0; j < value.length; j++) {
        //       totalDays +=  value[j].NoOfDays;
        //     }
        //     this.leaveTypes[i].TotalLeaveTaken = totalDays
        //   };
        // }

        // if(leaveDetail.length > 0)
        //   this.employeeData.TotalRecords = leaveDetail[0].Total;
        // else
          this.employeeData.TotalRecords = 0;
        this.isLeaveDataFilter = true;
      }
    });
  }



  LoadDoughnutchart() {
    let label = [];
    let consumeChart = null;
    label = this.chartDataset.map(x => x.PlanName);
    let bgColor = ['#E14D2A', '#3F0071', 'blue'];
    let data = [];
    for (let i = 0; i <  this.chartDataset.length; i++) {
      let value = (this.chartDataset[i].ConsumedLeave/this.chartDataset[i].MaxLeaveLimit) *100;
      data.push(value);
    }
    let elem: any = document.getElementById('consumeLeaveChart');
    let ctx = elem.getContext('2d');
    consumeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: label,
        datasets: [{
          label: 'My First dataset',
          backgroundColor: bgColor,
          borderWidth: 0,
          data: data,
          hoverOffset: 4,
          hoverBackgroundColor: bgColor,
      }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        cutout: 80,
      }
    });
    consumeChart.update();
    this.graphInstances.push(consumeChart);
  }

  MonthlyStatusChart(){
    let elem: any = document.getElementById('MonthlyStatusChart');
    let ctx = elem.getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(this.monthlyLeaveData),
            datasets: [{
                label: '# of Pattern',
                barThickness: 20,
                data: Object.values(this.monthlyLeaveData),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });

    this.graphInstances.push(myChart);
  }

  validateLeaveStatus(e: any) {
    if(e.target.value) {
      let value = parseInt(e.target.value);
      this.currentLeaveType = this.leaveTypes.find(i => i.LeavePlanTypeId == value);
      if (this.currentLeaveType) {
        if (this.currentLeaveType.AvailableLeaves <= 0) {
          ErrorToast(`You don't have enough [${this.currentLeaveType.LeavePlanTypeName}] balance.`);
          this.leaveForm.controls["Reason"].removeValidators(Validators.required);
          this.leaveForm.controls["Reason"].updateValueAndValidity();
          this.isEnabled = false;
        } else {
          this.isEnabled = true;
          this.leaveForm.get('LeavePlanName').setValue(this.currentLeaveType.LeavePlanTypeName);
          if (this.currentLeaveType.IsCommentsRequired) {
            this.leaveForm.controls["Reason"].setValidators(Validators.required);
            this.leaveForm.controls["Reason"].updateValueAndValidity();
          } else {
            this.leaveForm.controls["Reason"].removeValidators(Validators.required);
            this.leaveForm.controls["Reason"].updateValueAndValidity();
          }
        }
      }
    } else
      ErrorToast("Invalid selection");
  }

  fireBrowse() {
    $('#leaveAttachment').click();
  }

  uploadLeaveAttachment(fileInput: any) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.AlternateName = "Leave_Attachment";
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.ParentFolder = '';
        item.Email = this.userDetail.Email;
        item.UserId = this.employeeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      };
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
  }

  viewLeaveAttachmentModal(item: any) {
    this.isLoading = true;
    let fileIds = item;
    this.http.get(`Leave/GetLeaveAttachment/${fileIds}`).then(res => {
      if (res.ResponseBody.Table) {
        this.leaveAttachment = res.ResponseBody.Table;
        $("#leaveFileModal").modal('show');
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  viewFile(userFile: any) {
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.${userFile.FileExtension}`;
    this.viewer = document.getElementById("leavefile-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  bindDonutChartData() {
    let bgColor = ['#379237', 'rgba(255, 159, 64, 0.2)', '#379273', 'rgba(153, 102, 255, 0.2)'];
    let data = [];
    for (let i = 0; i <  this.chartDataset.length; i++) {
      let value = (this.chartDataset[i].ConsumedLeave/this.chartDataset[i].MaxLeaveLimit) *100;
      data.push(value);
    }
    this.chartData = {
      labels: this.chartDataset.map(x => x.PlanName),
      datasets: [
        {
          data: data,
          backgroundColor: bgColor,
          borderWidth: 0,
          hoverOffset: 2,
          hoverBackgroundColor: bgColor,
        },
      ],
    };
    let consumeLeave = this.chartDataset.filter(x => x.ConsumedLeave > 0);
    if (consumeLeave && consumeLeave.length > 0)
      this.isLeaveConsume = true;
    else
      this.isLeaveConsume = false;

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: 60
      // plugins: {
      //   title: {
      //     display: true,
      //   },
      //   legend: {
      //     display: true
      //   },
      // },
    }
  }

  changeLegends() {
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      // plugins: {
      //   title: {
      //     display: true,
      //   },
      //   legend: {
      //     display: true
      //   },
      // },
    };
  }

  clearChart() {
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
        }
      ],

    };
    this.chartOptions = {
      maintainAspectRatio: false,
      responsive: true,

      // plugins: {
      //   title: {
      //     display: true,
      //   },
      //   legend: {
      //     display: false
      //   },
      // },
    };
  }
}
