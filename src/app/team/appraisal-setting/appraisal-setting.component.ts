import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, ToLocateDate, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ConfigBaseRoute, ConfigPerformance } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-appraisal-setting',
  templateUrl: './appraisal-setting.component.html',
  styleUrls: ['./appraisal-setting.component.scss']
})
export class AppraisalSettingComponent implements OnInit {
  isPageReady: boolean = false;
  appraisalForm: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  orderByCyclePeriodAsc: boolean = null;
  orderByTypeDescriptionAsc: boolean = null;
  orderByObjectiveCatagoryTypeAsc: boolean = null;
  apprisalData: Filter = new Filter();
  apprisalDetail: ApprisalCycle = new ApprisalCycle();
  apprisalCycleDetail: Array<ApprisalCycle> = [];
  currentApprisalCycle: ApprisalCycle = new ApprisalCycle();
  hoveredDate: NgbDate | null = null;
	fromDate: NgbDate | null;
	toDate: NgbDate | null;
  projectDetails: Array<any> = [];
  assignedEmployee: Array<any> = [];
  userDetail: any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private calendar: NgbCalendar,
              private nav: iNavigation,
              public formatter: NgbDateParserFormatter,
              private user: UserService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
    this.userDetail = this.user.getInstance();
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid user. Please login again;")
      return;
    }
    this.loadData();
    this.initForm();
  }

  initForm() {
    this.appraisalForm = this.fb.group({
      ObjectiveCatagoryId: new FormControl(this.currentApprisalCycle.ObjectiveCatagoryId),
      ObjectiveCatagoryType: new FormControl(this.currentApprisalCycle.ObjectiveCatagoryType),
      TypeDescription: new FormControl(this.currentApprisalCycle.TypeDescription, [Validators.required]),
      FromDate: new FormControl(this.currentApprisalCycle.FromDate, [Validators.required]),
      ToDate: new FormControl(this.currentApprisalCycle.ToDate, [Validators.required]),
    })
  }

  get f() {
    return this.appraisalForm.controls;
  }

  addAprisalCyclePopUp() {
    this.isSubmitted = false;
    this.currentApprisalCycle = new ApprisalCycle();
    let date = new Date();
    this.fromDate.day= date.getDate()
    this.fromDate.month= date.getMonth() + 1;
    this.fromDate.year= date.getFullYear();
    date.setDate(date.getDate() +10 );
    this.toDate.day= date.getDate()
    this.toDate.month= date.getMonth() + 1;
    this.toDate.year= date.getFullYear();
    this.initForm();
    $('#manageApprisal').modal('show');
  }

  loadData() {
    this.isPageReady = false;
    this.http.post("eps/apprisalcatagory/get", this.apprisalData, true).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.apprisalCycleDetail = response.ResponseBody;
        if (this.apprisalCycleDetail.length > 0)
          this.apprisalData.TotalRecords = this.apprisalCycleDetail[0].Total;
        else
          this.apprisalData.TotalRecords = 0;

        this.isPageReady = true;
      } else {
        Toast("No record found. Please create one.");
        this.isPageReady = true;
      }
    });
  }

  resetFilter() {
    this.apprisalData.SearchString = "1=1";
    this.apprisalData.PageIndex = 1;
    this.apprisalData.PageSize = 10;
    this.apprisalData.StartIndex = 1;
    this.apprisalData.EndIndex = (this.apprisalData.PageSize * this.apprisalData.PageIndex);
    this.apprisalDetail.ObjectiveCatagoryType = null;
    this.apprisalDetail.TypeDescription = null;
    this.loadData();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.apprisalData.reset();
    if(this.apprisalDetail.ObjectiveCatagoryType !== null &&
      this.apprisalDetail.ObjectiveCatagoryType !== "") {
      searchQuery += ` ObjectiveCatagoryType like '%${this.apprisalDetail.ObjectiveCatagoryType}%'`;
      delimiter = "and";
    }

    if(this.apprisalDetail.TypeDescription !== null) {
      searchQuery += ` ${delimiter} TypeDescription like '%${this.apprisalDetail.TypeDescription}%' `;
      delimiter = "and";
    }

    if(searchQuery !== "") {
      this.apprisalData.SearchString = `${searchQuery}`;
    }

    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'ASC';
    } else {
      Order = 'DESC';
    }
    if (FieldName == 'ObjectiveCatagoryType')
      this.orderByObjectiveCatagoryTypeAsc = !flag;
    if (FieldName == 'TypeDescription')
      this.orderByTypeDescriptionAsc = !flag;
    if (FieldName == 'FromDate')
      this.orderByCyclePeriodAsc = !flag;

    this.apprisalData = new Filter();
    this.apprisalData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  editApprisalPopUp(item: ApprisalCycle) {
    this.currentApprisalCycle = item;
    let date = new Date(this.currentApprisalCycle.FromDate);
    this.fromDate.day= date.getDate()
    this.fromDate.month= date.getMonth() + 1;
    this.fromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.ToDate);
    this.toDate.day= date.getDate()
    this.toDate.month= date.getMonth() + 1;
    this.toDate.year= date.getFullYear();
    this.initForm();
    $('#manageApprisal').modal('show');
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.apprisalData = e;
      this.loadData();
    }
  }

  addApprisalCycle() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.appraisalForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    let value = this.appraisalForm.value;
    this.http.post("eps/apprisalcatagory/addAppraisalType", value, true).then(res => {
      if (res.ResponseBody) {
        this.apprisalCycleDetail = res.ResponseBody;
        if (this.apprisalCycleDetail.length > 0)
          this.apprisalData.TotalRecords = this.apprisalCycleDetail[0].Total;
        else
          this.apprisalData.TotalRecords = 0;
        $('#manageApprisal').modal('hide');
        Toast("Apprisal cycle inserted successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  updateApprisalCycle() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.appraisalForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    let value = this.appraisalForm.value;
    this.http.put(`eps/apprisalcatagory/updateAppraisalType/${this.currentApprisalCycle.ObjectiveCatagoryId}`, value, true).then(res => {
      if (res.ResponseBody) {
        this.apprisalCycleDetail = res.ResponseBody;
        if (this.apprisalCycleDetail.length > 0)
          this.apprisalData.TotalRecords = this.apprisalCycleDetail[0].Total;
        else
          this.apprisalData.TotalRecords = 0;

        $('#manageApprisal').modal('hide');
        Toast("Apprisal cycle inserted successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
		} else {
      this.toDate = null;
			this.fromDate = date;
		}
    if (this.toDate) {
      let todate = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
      this.appraisalForm.get('ToDate').setValue(todate);
    }
    if (this.fromDate) {
      let fromdate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      this.appraisalForm.get('FromDate').setValue(fromdate);
    }
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

  navigateToObjective(item: ApprisalCycle) {
    this.nav.navigate(ConfigBaseRoute + "/" + ConfigPerformance, item)
  }

  showOffCanvas(item: any) {
    if (item) {
      this.currentApprisalCycle = item;
      this.getProjects();
    }
  }

  hideOffCanvas() {
    $('#offcanvasRight').offcanvas('hide');
  }

  activeDeactiveAll(e: any, item: any) {
    let value = e.target.checked;
    let name = `activeMember${item[0].ProjectId}`;
    let elem = document.querySelectorAll(`input[name=${name}]`);
    for (let i = 0; i < elem.length; i++) {
      if (value) {
        (elem[i]  as HTMLInputElement).checked = true;
      } else {
        (elem[i]  as HTMLInputElement).checked = false;
      }
    }
    if (item && item.length > 0) {
      for (let j = 0; j < item.length; j++) {
        if (value) {
          let index = this.assignedEmployee.findIndex(x => x.EmployeeId == item[j].EmployeeId && x.ProjectId == item[j].ProjectId);
          if (index < 0) {
            this.assignedEmployee.push({
              ProjectId: item.ProjectId,
              EmployeeId: item[j].EmployeeId
            });
          }
        } else {
          let index = this.assignedEmployee.findIndex(x => x.EmployeeId == item[j].EmployeeId && x.ProjectId == item[j].ProjectId);
          if (index > -1) {
            this.assignedEmployee.splice(index, 1);
          }
        }
      }
    }
  }

  checkActiveMember(e: any, projectId: number, employeeId: number) {
    let name = `activeMember${projectId}`;
    let elem = document.querySelectorAll(`input[name=${name}]`);
    let status = 0;
    for (let i = 0; i < elem.length; i++) {
      if ((elem[i]  as HTMLInputElement).checked) {
        status++;
      } else {
        status--;
      }
    }
    name = `activeAllMember${projectId}`;
    if (status == elem.length)
      (document.querySelector(`input[name=${name}]`) as HTMLInputElement).checked = true;
    else
      (document.querySelector(`input[name=${name}]`) as HTMLInputElement).checked = false;

    let value = e.target.checked;
    if (value) {
      let index = this.assignedEmployee.findIndex(x => x.EmployeeId == employeeId && x.ProjectId == projectId);
      if (index < 0) {
        this.assignedEmployee.push({
          ProjectId: projectId,
          EmployeeId: employeeId
        })
      }
    } else {
      let index = this.assignedEmployee.findIndex(x => x.EmployeeId == employeeId && x.ProjectId == projectId);
      if (index >= 0) {
        this.assignedEmployee.splice(index, 1);
      }
    }
  }

  saveAppraisal() {
    this.isLoading = true;
    if (this.assignedEmployee.length <=0) {
      this.isLoading = false;
      ErrorToast("Please select employee first");
      return;
    }
    // this.http.post("", this.assignedEmployee).then(res => {
    //   if (res.ResponseBody) {
    //     this.isLoading = false;
    //     Toast("Appraisal cycle updated successfully");
    //   }
    // }).catch(e => {
    //   this.isLoading = false;
    // })
    console.log(this.assignedEmployee);
  }

  getProjects() {
    this.isLoading = true;
    this.projectDetails = [];
    this.http.get(`ps/projects/get/${this.userDetail.UserId}`, true).then(res => {
      if (res.ResponseBody) {
        let result = res.ResponseBody.reduce((a, b) => {
          a[b.ProjectId] = a[b.ProjectId] || [];
          a[b.ProjectId].push(b);
          return a;
        }, Object.create(null));
        
        let keys = Object.keys(result);
        let i = 0;
        while(i < keys.length) {
          this.projectDetails.push(result[keys[i]]);
          i++;
        }

        this.isLoading = false;
        Toast("Project details found");
      } else {
        WarningToast("Please add project and their team members first");
        this.isLoading = false;
      }
      var offcanvasRight = document.getElementById('offcanvasRight');
      var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
      bsOffcanvas.show();
    }).catch(e => {
      this.isLoading = false;
    })
  }
}

class ApprisalCycle {
  ObjectiveCatagoryType: string = null;
  TypeDescription: string = null;
  FromDate: Date = null;
  ToDate: Date = null;
  Total: number = 0;
  ObjectiveCatagoryId: number = 0;
  Index: number = 0;
}
