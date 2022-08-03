import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, UserAttendance, UserTimesheet, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements OnInit {
  cachedData: any = null;
  isLoading: boolean = false;
  model: NgbDateStruct;
  leaveDays: number = 1;
  leaveForm: FormGroup;
  userDetail: UserDetail = new UserDetail();
  employeeId: number = 0;
  managerList: autoCompleteModal = null;
  leaveDetail: LeaveModal = null;
  isPageReady: boolean = false;
  submitted: boolean = false;
  fromdateModal: NgbDateStruct;
  employeeData: Filter = new Filter();
  isLeaveDetails: boolean = false;
  leaveData: Array<LeaveDetails> = [];
  isLeaveDataFilter: boolean = false;
  leaveTypes: Array<any> = [];

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private local: ApplicationStorage,
              private user: UserService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.cachedData = this.nav.getValue();
    this.leaveDetail = new LeaveModal();
    this.leaveDetail.LeaveFromDay = new Date();
    this.leaveDetail.LeaveToDay = new Date(new Date().setDate( this.leaveDetail.LeaveFromDay.getDate() + 1));
    this.leaveDetail.Session ='fullday';
    this.leaveDetail.LeaveType = null;
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.managerList.className="";
    if(this.cachedData) {

    } else {
      let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
      this.userDetail = this.user.getInstance() as UserDetail;
      if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
      else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
      if(Master !== null && Master !== "") {
        this.userDetail = Master["UserDetail"];
        this.employeeId = this.userDetail.UserId;
        this.leaveDetail.EmployeeId = this.employeeId;
        this.loadData(this.employeeId);
        this.LeaveReportChart();
        this.LoadDoughnutchart();
        this.MonthlyStatusChart();
        this.CasualLeaveChart();
        this.EarnLeaveChart();
        this.SickLeaveChart();
        this.UnpaidLeaveChart();
        this.CompLeaveChart();
        this.leaveRequestForm();
        this.GetFilterResult();
      } else {
        Toast("Invalid user. Please login again.")
      }
    }
  }

  leavePopUp() {
    this.leaveDetail = new LeaveModal();
    $('#leaveModal').modal('show');
  }

  submitLeave() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;
    if (this.employeeId > 0) {
      let value: LeaveModal = this.leaveForm.value;
      value.UserTypeId = UserType.Employee;
      value.RequestType = 1;
      if (this.leaveForm.get('LeaveFromDay').errors !== null)
        errroCounter++;
      if (this.leaveForm.get('LeaveToDay').errors !== null)
        errroCounter++;
      if (this.leaveForm.get('Session').errors !== null)
        errroCounter++;
      if (this.leaveForm.get('Reason').errors !== null)
        errroCounter++;
      if (this.leaveForm.get('AssignTo').errors !== null)
        errroCounter++;
      if (this.leaveForm.get('LeaveType').errors !== null)
        errroCounter++;
      if (value && errroCounter == 0) {
        this.http.post('Attendance/ApplyLeave', value).then ((response:ResponseModel) => {
          if (response.ResponseBody) {
            this.GetFilterResult();
            $('#leaveModal').modal('hide');
            Toast("Leave apply successfully.");
            this.submitted = false;
            this.isLoading = false;
          }
        })
      }
      this.isLoading = false;
    }
  }

  onDateSelect(e: NgbDateStruct) {
    let value  = new Date(e.year, e.month-1, e.day);
    if (value.getTime() > this.leaveDetail.LeaveFromDay.getTime() && value.getTime() >= new Date().getTime()) {
      this.leaveDetail.LeaveToDay = value;
      this.leaveDays = Math.floor((Date.UTC(this.leaveDetail.LeaveToDay.getFullYear(), this.leaveDetail.LeaveToDay.getMonth(), this.leaveDetail.LeaveToDay.getDate()) - Date.UTC(this.leaveDetail.LeaveFromDay.getFullYear(), this.leaveDetail.LeaveFromDay.getMonth(), this.leaveDetail.LeaveFromDay.getDate()) ) /(1000 * 60 * 60 * 24));
      this.leaveForm.get('LeaveToDay').setValue(value);
    }
    else
      ErrorToast("Please select a valid date.")
  }

  onDateSelection(e: NgbDateStruct) {
    let value  = new Date(e.year, e.month-1, e.day);
    if (value.getTime() >= new Date().getTime()) {
      //this.leaveDays = Math.round((Date.UTC(this.leaveDetail.LeaveToDay.getFullYear(), this.leaveDetail.LeaveToDay.getMonth(), this.leaveDetail.LeaveToDay.getDate()) - Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())) /(1000 * 60 * 60 * 24));
      this.leaveDetail.LeaveFromDay = value;
      this.leaveForm.get('LeaveFromDay').setValue(value);
    }
    else
      ErrorToast("Please select a valid date.")
  }

  leaveRequestForm() {
    this.leaveForm = this.fb.group({
      LeaveFromDay: new FormControl(this.leaveDetail.LeaveFromDay, [Validators.required]),
      LeaveToDay: new FormControl(this.leaveDetail.LeaveToDay, [Validators.required]),
      Session: new FormControl(this.leaveDetail.Session, [Validators.required]),
      Reason: new FormControl(this.leaveDetail.Reason, [Validators.required]),
      AssignTo: new FormControl(this.leaveDetail.AssignTo, [Validators.required]),
      RequestType: new FormControl(this.leaveDetail.RequestType),
      LeaveType: new FormControl("", [Validators.required]),
      UserTypeId: new FormControl(this.leaveDetail.UserTypeId),
      EmployeeId: new FormControl(this.leaveDetail.EmployeeId)
    })
  }

  get f() {
    return this.leaveForm.controls;
  }

  loadData(employeeId: number) {
    this.isPageReady = false;
    this.http.get(`employee/GetManageEmployeeDetail/${employeeId}`).then((res: ResponseModel) => {
      if(res.ResponseBody.Employees && res.ResponseBody.LeavePlan) {
        this.managerList.data = [];
        let plandetail = res.ResponseBody.LeavePlan;
        if(plandetail && plandetail.AssociatedPlanTypes) {
          this.leaveTypes = JSON.parse(plandetail.AssociatedPlanTypes);
        } else {
          this.leaveTypes = [];
        }

        this.managerList.placeholder = "Reporting Manager";
        this.managerList.data.push({
          value: 0,
          text: "Default Manager",
        });
        this.managerList.className ="";
        let i = 0;
        let managers = res.ResponseBody.Employees;
        while(i < managers.length) {
          if([1, 2, 3, 10].indexOf(managers[i].DesignationId) !== -1) {
            this.managerList.data.push({
              value: managers[i].EmployeeUid,
              text: `${managers[i].FirstName} ${managers[i].LastName}`
            });
          }
          i++;
        }
        this.isPageReady = true;
      }
    })
  }

  showLeaveDetails() {
    this.isLeaveDetails = !this.isLeaveDetails;
    this.isLeaveDataFilter = false;
    let elem = document.getElementById('leave-chart')
    if (this.isLeaveDetails == true) {
      elem.classList.add('d-none');
    }
    else {
      if (elem.classList.contains('d-none'))
        document.getElementById('leave-chart').classList.remove('d-none');
    }

  }

  PageChange(e: Filter) {
    if(e != null) {
      this.employeeData = e;
      this.GetFilterResult();
    }
  }

  GetFilterResult() {
    this.leaveData = [];
    this.http.post(`Attendance/GetAllLeavesByEmpId/${this.employeeId}`, this.employeeData)
    .then ((respponse:ResponseModel) => {
      if (respponse.ResponseBody) {
        let data = respponse.ResponseBody.Leave;
        for (let i = 0; i < data.length; i++) {
          this.leaveData.push(JSON.parse(data[i].LeaveDetail));
          let toDate = new Date(this.leaveData[i].LeaveToDay);
          let fromDate = new Date(this.leaveData[i].LeaveFromDay);
          let differ = toDate.getTime() - fromDate.getTime();
          this.leaveData[i].NoOfDays = Math.ceil(differ / (1000*3600*24));
        }

        for (let i = 0; i < this.leaveTypes.length; i++) {
          let value = this.leaveData.filter(x => x.LeaveType == this.leaveTypes[i].LeavePlanTypeId);
          if (value.length > 0) {
            let totalDays = 0;
            for (let j = 0; j < value.length; j++) {
              totalDays +=  value[j].NoOfDays;
            }
            this.leaveTypes[i].TotalLeaveTaken = totalDays
          };
        }
        this.employeeData.TotalRecords = data[0].Total;
        this.isLeaveDataFilter = true;
      }
    });
  }

  LeaveReportChart(){
    let elem: any = document.getElementById('weeklyPatternChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: '# of Pattern',
                barThickness: 20,
                data: [12, 19, 3, 5, 2, 3, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)'
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
  }

  LoadDoughnutchart() {
    let elem: any = document.getElementById('consumeLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Leave Types'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(192,146,146)',
            'rgb(143,178,168)',
            'rgb(109,209,255)'
          ],
          borderWidth: 0,
          data: [100, 100, 50],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(192,146,146)',
            'rgb(143,178,168)',
            'rgb(109,209,255)'
          ],
      }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        cutout: 25,
    }
    })
  }

  CasualLeaveChart() {
    let elem: any = document.getElementById('casualLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['2 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(219,112,147)',
            'rgb(123,104,238)'
          ],
          borderWidth: 0,
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(219,112,147)',
            'rgb(123,104,238)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  EarnLeaveChart() {
    let elem: any = document.getElementById('earnLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['1 Day Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(112,219,183)',
            'rgb(68,79,117)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(112,219,183)',
            'rgb(68,79,117)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  SickLeaveChart() {
    let elem: any = document.getElementById('sickLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['0.5 Day Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(32,178,170)',
            'rgb(0,0,139)'
          ],
          borderWidth: 0,
          data: [30, 70],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(32,178,170)',
            'rgb(0,0,139)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  UnpaidLeaveChart() {
    let elem: any = document.getElementById('unpaidLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['118 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(234,9,141)',
            'rgb(153,39,197)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [2, 98],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(234,9,141)',
            'rgb(153,39,197)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  CompLeaveChart() {
    let elem: any = document.getElementById('compLeaveChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['118 Days Available'],
        datasets: [{
          label: 'My First dataset',
          backgroundColor: [
            'rgb(123,166,255)',
            'rgb(249,203,156)'
          ],
          borderWidth: 0,
          borderColor: 'rgb(255, 99, 132)',
          data: [1, 1],
          hoverOffset: 4,
          hoverBackgroundColor: [
            'rgb(123,166,255)',
            'rgb(249,203,156)'
          ],
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: 50
    }
    })
  }

  MonthlyStatusChart(){
    let elem: any = document.getElementById('MonthlyStatusChart');
    const ctx = elem.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: '# of Pattern',
                barThickness: 20,
                data: [12, 19, 3, 5, 2, 3, 10, 12, 19, 3, 5, 2, 3, 10],
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
  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
        this.nav.navigateRoot(UserAttendance, this.cachedData);
      break;
      case "timesheet-tab":
        this.nav.navigateRoot(UserTimesheet, this.cachedData);
      break;
      case "leave-tab":
      break;
    }
  }
}

class LeaveModal {
  LeaveFromDay: Date = null;
  LeaveToDay: Date = null;
  Session: string = null;
  Reason: string = null;
  AssignTo: number = 0;
  ForYear: number = 0;
  RequestType: number = 0;
  LeaveType: number = 0;
  ForMonth: number = 0;
  UserTypeId: number = 0;
  EmployeeId: number = 0;
}

class LeaveDetails {
  EmployeeId:number = 0;
  EmployeeName: string = '';
  ProjectId: number = 0;
  AssignTo: number = 0;
  LeaveType: number = 0;
  Session: string = '';
  LeaveFromDay: Date = null;
  LeaveToDay: Date = null;
  LeaveStatus: number = 0;
  RespondedBy: number = 0;
  UpdatedOn: Date = null;
  Reason: string = '';
  RequestedOn: Date = null;
  NoOfDays: number = null;
}
