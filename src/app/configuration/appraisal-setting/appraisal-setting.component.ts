import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, ToLocateDate, Toast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
declare var $: any;

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

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private calendar: NgbCalendar,
              public formatter: NgbDateParserFormatter) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit(): void {
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
