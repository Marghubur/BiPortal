import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
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
  orderByDescriptionAsc: boolean = null;
  orderByCyclePeriodAsc: boolean = null;
  orderByApprisalNameAsc: boolean = null;
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
      ApprisalCycleId: new FormControl(this.currentApprisalCycle.ApprisalCycleId),
      ApprisalName: new FormControl(this.currentApprisalCycle.ApprisalName, [Validators.required]),
      ApprisalCyclePeriod: new FormControl(this.currentApprisalCycle.ApprisalCyclePeriod, [Validators.required]),
      Description: new FormControl(this.currentApprisalCycle.Description, [Validators.required])
    })
  }

  get f() {
    return this.appraisalForm.controls;
  }

  addAprisalCyclePopUp() {
    this.isSubmitted = false;
    this.currentApprisalCycle = new ApprisalCycle();
    $('#manageApprisal').modal('show');
  }

  loadData() {
    this.isPageReady = true;
  }

  resetFilter() {
    this.apprisalData.SearchString = "1=1";
    this.apprisalData.PageIndex = 1;
    this.apprisalData.PageSize = 10;
    this.apprisalData.StartIndex = 1;
    this.apprisalData.EndIndex = (this.apprisalData.PageSize * this.apprisalData.PageIndex);
    this.loadData();
    this.apprisalDetail.ApprisalCyclePeriod=null;
    this.apprisalDetail.ApprisalCycleId = 0;
    this.apprisalDetail.ApprisalName=null;
    this.apprisalDetail.Description=null;
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.apprisalData.reset();
    if(this.apprisalDetail.ApprisalName !== null && this.apprisalDetail.ApprisalName !== "") {
      searchQuery += ` ApprisalName like '%${this.apprisalDetail.ApprisalName}%'`;
    }

    if(this.apprisalDetail.ApprisalCyclePeriod !== null) {
      searchQuery += ` ${delimiter} ApprisalCyclePeriod like '%${this.apprisalDetail.ApprisalCyclePeriod}%' `;
        delimiter = "and";
    }
    if(this.apprisalDetail.Description !== null ) {
      searchQuery += ` ${delimiter} Description like '${this.apprisalDetail.Description}%' `;
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
    if (FieldName == 'ApprisalName')
      this.orderByApprisalNameAsc = !flag;
    if (FieldName == 'ApprisalCyclePeriod')
      this.orderByCyclePeriodAsc = !flag;
    if (FieldName == 'Description')
      this.orderByDescriptionAsc = !flag;

    this.apprisalData = new Filter();
    this.apprisalData.SearchString = "";
    this.apprisalData.SortBy = FieldName;
    this.apprisalData.SortDirection = Order;
    this.loadData()
  }

  editApprisalPopUp(item: ApprisalCycle) {
    this.currentApprisalCycle = item;
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
    this.http.post("", value).then(res => {
      if (res.ResponseBody) {
        Toast("Apprisal cycle insert/update successfully");
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
  ApprisalCycleId: number = 0;
  ApprisalName: string = null;
  ApprisalCyclePeriod: string = null;
  Description: string = null;
}
