import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ConfigPerformance } from 'src/providers/constants';
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
  selfAppraisalFromDate: NgbDate | null;
  selfAppraisalToDate: NgbDate | null;
  selectionPeriodFromDate: NgbDate | null;
  selectionPeriodToDate: NgbDate | null;
  feedbackFromDate: NgbDate | null;
  feedbackToDate: NgbDate | null;
  reviewFromDate: NgbDate | null;
  reviewToDate: NgbDate | null;
  normalizationToDate: NgbDate | null;
  normalizationFromDate: NgbDate | null;
  selfAppraisalhoveredDate: NgbDate | null = null;
  selectionhoveredDate: NgbDate | null = null;
  feedbackhoveredDate: NgbDate | null = null;
  reviewhoveredDate: NgbDate | null = null;
  normallizationhoveredDate: NgbDate | null = null;
  projectDetails: Array<any> = [];
  selectedProject: any = null;
  userDetail: any = null;
  appraisalCyclePeriod: string = null;
  selfAppraisalCyclePeriod: string = null;
  selectionCyclePeriod: string = null;
  feedbackCyclePeriod: string = null;
  reviewCyclePeriod: string = null;
  normalizationCyclePeriod: string = null;
  isViewInList: boolean = true;
  isObjectiveFound: boolean = false;
  currentAppraisalObjective: Array<any> = [];
  active = 1;
  currentCompny: any = null;
  objectDetail: Objective = new Objective();
  objectiveData: Filter = new Filter();
  orderByObjectiveAsc: boolean = null;
  orderBTargetValueAsc: boolean = null;
  objectiveDetails: Array<any> = [];
  objectForm: FormGroup;
  currentObject: Objective = new Objective();
  htmlText: any = null;
  selectedObjective: Array<any> = [];
  isProjectDetailReady: boolean = false;
  designation: Array<any> = [];
  appraisalHikeForm: FormGroup;
  allProjectAppraisal: Array<any> = [];
  currentProjectAppraisal: any = null;
  isAmountExceed: boolean = false;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private calendar: NgbCalendar,
              private nav: iNavigation,
              private local: ApplicationStorage,
              public formatter: NgbDateParserFormatter,
              private user: UserService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.selfAppraisalFromDate = calendar.getToday();
    this.selfAppraisalToDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.selectionPeriodFromDate = calendar.getToday();
    this.selectionPeriodToDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.feedbackFromDate = calendar.getToday();
    this.feedbackToDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.reviewFromDate = calendar.getToday();
    this.reviewToDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.normalizationToDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.normalizationFromDate = calendar.getToday();
  }

  ngOnInit(): void {
    this.currentCompny = this.local.findRecord("Companies")[0];
    this.userDetail = this.user.getInstance();
    this.objectiveData.SearchString += ` And CompanyId = ${this.currentCompny.CompanyId}`;
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid user. Please login again;")
      return;
    }
    this.loadData();
    this.initForm();
    this.initObjetiveForm();
  }

  initForm() {
    this.appraisalForm = this.fb.group({
      ObjectiveCatagoryType: new FormControl(this.currentApprisalCycle.ObjectiveCatagoryType, [Validators.required]),
      TypeDescription: new FormControl(this.currentApprisalCycle.TypeDescription, [Validators.required]),
      AppraisalCycleFromDate: new FormControl(this.currentApprisalCycle.AppraisalCycleFromDate, [Validators.required]),
      AppraisalCycleToDate: new FormControl(this.currentApprisalCycle.AppraisalCycleToDate, [Validators.required]),
      IsTagByRole: new FormControl(this.currentApprisalCycle.IsTagByRole),
      IsTagByDepartment: new FormControl(this.currentApprisalCycle.IsTagByDepartment),
      IsSelfAppraisal: new FormControl(this.currentApprisalCycle.IsSelfAppraisal),
      SelfAppraisalFromDate: new FormControl(this.currentApprisalCycle.SelfAppraisalFromDate, [Validators.required]),
      SelfAppraisalToDate: new FormControl(this.currentApprisalCycle.SelfAppraisalToDate, [Validators.required]),
      IsMultiRaterFeedback: new FormControl(this.currentApprisalCycle.IsMultiRaterFeedback),
      SelectionPeriodFromDate: new FormControl(this.currentApprisalCycle.SelectionPeriodFromDate, [Validators.required]),
      SelectionPeriodToDate: new FormControl(this.currentApprisalCycle.SelectionPeriodToDate, [Validators.required]),
      FeedbackFromDate: new FormControl(this.currentApprisalCycle.FeedbackFromDate, [Validators.required]),
      FeedbackToDate: new FormControl(this.currentApprisalCycle.FeedbackToDate, [Validators.required]),
      IsDefaultRater: new FormControl(this.currentApprisalCycle.IsDefaultRater),
      IsAllowSelfAppraisal: new FormControl(this.currentApprisalCycle.IsAllowSelfAppraisal),
      RoleIds: new FormControl(this.currentApprisalCycle.RoleIds),
      DepartmentIds: new FormControl(this.currentApprisalCycle.DepartmentIds),
      ReviewFromDate: new FormControl(this.currentApprisalCycle.ReviewFromDate, [Validators.required]),
      ReviewToDate: new FormControl(this.currentApprisalCycle.ReviewToDate, [Validators.required]),
      NormalizationFromDate: new FormControl(this.currentApprisalCycle.NormalizationFromDate, [Validators.required]),
      NormalizationToDate: new FormControl(this.currentApprisalCycle.NormalizationToDate, [Validators.required]),
      IsHikeApproval: new FormControl(this.currentApprisalCycle.IsHikeApproval)
    })
  }

  get f() {
    return this.appraisalForm.controls;
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

  editApprisalPopUp(item: ApprisalCycle) {
    this.currentApprisalCycle = item;
    let date = new Date(this.currentApprisalCycle.AppraisalCycleFromDate);
    this.fromDate.day= date.getDate()
    this.fromDate.month= date.getMonth() + 1;
    this.fromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.AppraisalCycleToDate);
    this.toDate.day= date.getDate()
    this.toDate.month= date.getMonth() + 1;
    this.toDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.SelfAppraisalFromDate);
    this.selfAppraisalFromDate.day= date.getDate()
    this.selfAppraisalFromDate.month= date.getMonth() + 1;
    this.selfAppraisalFromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.SelfAppraisalToDate);
    this.selfAppraisalToDate.day= date.getDate()
    this.selfAppraisalToDate.month= date.getMonth() + 1;
    this.selfAppraisalToDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.SelectionPeriodFromDate);
    this.selectionPeriodFromDate.day= date.getDate()
    this.selectionPeriodFromDate.month= date.getMonth() + 1;
    this.selectionPeriodFromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.SelectionPeriodToDate);
    this.selectionPeriodToDate.day= date.getDate()
    this.selectionPeriodToDate.month= date.getMonth() + 1;
    this.selectionPeriodToDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.FeedbackFromDate);
    this.feedbackFromDate.day= date.getDate()
    this.feedbackFromDate.month= date.getMonth() + 1;
    this.feedbackFromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.FeedbackToDate);
    this.feedbackToDate.day= date.getDate()
    this.feedbackToDate.month= date.getMonth() + 1;
    this.feedbackToDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.ReviewFromDate);
    this.reviewFromDate.day= date.getDate()
    this.reviewFromDate.month= date.getMonth() + 1;
    this.reviewFromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.ReviewToDate);
    this.reviewToDate.day= date.getDate()
    this.reviewToDate.month= date.getMonth() + 1;
    this.reviewToDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.NormalizationFromDate);
    this.normalizationFromDate.day= date.getDate()
    this.normalizationFromDate.month= date.getMonth() + 1;
    this.normalizationFromDate.year= date.getFullYear();
    date = new Date(this.currentApprisalCycle.NormalizationToDate);
    this.normalizationToDate.day= date.getDate()
    this.normalizationToDate.month= date.getMonth() + 1;
    this.normalizationToDate.year= date.getFullYear();
    this.initForm();
    this.appraisalCyclePeriod = new Date(this.appraisalForm.get('AppraisalCycleFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('AppraisalCycleToDate').value).toLocaleDateString();
    this.selfAppraisalCyclePeriod = new Date(this.appraisalForm.get('SelfAppraisalFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('SelfAppraisalToDate').value).toLocaleDateString();
    this.selectionCyclePeriod = new Date(this.appraisalForm.get('SelectionPeriodFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('SelectionPeriodToDate').value).toLocaleDateString();
    this.feedbackCyclePeriod = new Date(this.appraisalForm.get('FeedbackFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('FeedbackToDate').value).toLocaleDateString();
    this.reviewCyclePeriod = new Date(this.appraisalForm.get('ReviewFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('ReviewToDate').value).toLocaleDateString();
    this.normalizationCyclePeriod = new Date(this.appraisalForm.get('NormalizationFromDate').value).toLocaleDateString() +" - "+ new Date(this.appraisalForm.get('NormalizationToDate').value).toLocaleDateString();
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
      this.appraisalForm.get('AppraisalCycleToDate').setValue(todate);
    }
    if (this.fromDate) {
      let fromdate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
      this.appraisalForm.get('AppraisalCycleFromDate').setValue(fromdate);
    }
    let fromDateValue = this.appraisalForm.get('AppraisalCycleFromDate').value;
    let toDateValue = this.appraisalForm.get('AppraisalCycleToDate').value;
    if (fromDateValue && toDateValue)
      this.appraisalCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
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

  onSelfAppraisalDateSelection(date: NgbDate) {
		if (!this.selfAppraisalFromDate && !this.selfAppraisalToDate) {
			this.selfAppraisalFromDate = date;
		} else if (this.selfAppraisalFromDate && !this.selfAppraisalToDate && date && date.after(this.selfAppraisalFromDate)) {
      this.selfAppraisalToDate = date;
		} else {
      this.selfAppraisalToDate = null;
			this.selfAppraisalFromDate = date;
		}

    if (this.selfAppraisalToDate) {
      let todate = new Date(this.selfAppraisalToDate.year, this.selfAppraisalToDate.month - 1, this.selfAppraisalToDate.day);
      this.appraisalForm.get('SelfAppraisalToDate').setValue(todate);
    }

    if (this.selfAppraisalFromDate) {
      let fromdate = new Date(this.selfAppraisalFromDate.year, this.selfAppraisalFromDate.month - 1, this.selfAppraisalFromDate.day);
      this.appraisalForm.get('SelfAppraisalFromDate').setValue(fromdate);
    }

    let fromDateValue = this.appraisalForm.get('SelfAppraisalFromDate').value;
    let toDateValue = this.appraisalForm.get('SelfAppraisalToDate').value;
    if (fromDateValue && toDateValue)
      this.selfAppraisalCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
	}

	isSelfHovered(date: NgbDate) {
		return (
			this.selfAppraisalFromDate && !this.selfAppraisalToDate && this.selfAppraisalhoveredDate && date.after(this.selfAppraisalFromDate) && date.before(this.selfAppraisalhoveredDate)
		);
	}

	isSelfInside(date: NgbDate) {
		return this.selfAppraisalToDate && date.after(this.selfAppraisalFromDate) && date.before(this.selfAppraisalToDate);
	}

	isSelfRange(date: NgbDate) {
		return (
			date.equals(this.selfAppraisalFromDate) ||
			(this.selfAppraisalToDate && date.equals(this.selfAppraisalToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

  onSelectionPeriodDateSelection(date: NgbDate) {
		if (!this.selectionPeriodFromDate && !this.selectionPeriodToDate) {
			this.selectionPeriodFromDate = date;
		} else if (this.selectionPeriodFromDate && !this.selectionPeriodToDate && date && date.after(this.selectionPeriodFromDate)) {
      this.selectionPeriodToDate = date;
		} else {
      this.selectionPeriodToDate = null;
			this.selectionPeriodFromDate = date;
		}

    if (this.selectionPeriodToDate) {
      let todate = new Date(this.selectionPeriodToDate.year, this.selectionPeriodToDate.month - 1, this.selectionPeriodToDate.day);
      this.appraisalForm.get('SelectionPeriodToDate').setValue(todate);
    }

    if (this.selectionPeriodFromDate) {
      let fromdate = new Date(this.selectionPeriodFromDate.year, this.selectionPeriodFromDate.month - 1, this.selectionPeriodFromDate.day);
      this.appraisalForm.get('SelectionPeriodFromDate').setValue(fromdate);
    }
    let fromDateValue = this.appraisalForm.get('SelectionPeriodFromDate').value;
    let toDateValue = this.appraisalForm.get('SelectionPeriodToDate').value;
    if (fromDateValue && toDateValue)
      this.selectionCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
	}

	isSelectionHovered(date: NgbDate) {
		return (
			this.selectionPeriodFromDate && !this.selectionPeriodToDate && this.selectionhoveredDate && date.after(this.selectionPeriodFromDate) && date.before(this.selectionhoveredDate)
		);
	}

	isSelectionnInside(date: NgbDate) {
		return this.selectionPeriodToDate && date.after(this.selectionPeriodFromDate) && date.before(this.selectionPeriodToDate);
	}

	isSelectionRange(date: NgbDate) {
		return (
			date.equals(this.selectionPeriodFromDate) ||
			(this.selectionPeriodToDate && date.equals(this.selectionPeriodToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

  onFeedbackDateSelection(date: NgbDate) {
		if (!this.feedbackFromDate && !this.feedbackToDate) {
			this.feedbackFromDate = date;
		} else if (this.feedbackFromDate && !this.feedbackToDate && date && date.after(this.feedbackFromDate)) {
      this.feedbackToDate = date;
		} else {
      this.feedbackToDate = null;
			this.feedbackFromDate = date;
		}

    if (this.feedbackToDate) {
      let todate = new Date(this.feedbackToDate.year, this.feedbackToDate.month - 1, this.feedbackToDate.day);
      this.appraisalForm.get('FeedbackToDate').setValue(todate);
    }

    if (this.feedbackFromDate) {
      let fromdate = new Date(this.feedbackFromDate.year, this.feedbackFromDate.month - 1, this.feedbackFromDate.day);
      this.appraisalForm.get('FeedbackFromDate').setValue(fromdate);
    }
    let fromDateValue = this.appraisalForm.get('FeedbackFromDate').value;
    let toDateValue = this.appraisalForm.get('FeedbackToDate').value;
    if (fromDateValue && toDateValue)
      this.feedbackCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
	}

	isFeedbackHovered(date: NgbDate) {
		return (
			this.feedbackFromDate && !this.feedbackToDate && this.feedbackhoveredDate && date.after(this.feedbackFromDate) && date.before(this.feedbackhoveredDate)
		);
	}

	isFeedbackInside(date: NgbDate) {
		return this.feedbackToDate && date.after(this.feedbackFromDate) && date.before(this.feedbackToDate);
	}

	isFeedbackRange(date: NgbDate) {
		return (
			date.equals(this.feedbackFromDate) ||
			(this.feedbackToDate && date.equals(this.feedbackToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

  onReviewDateSelection(date: NgbDate) {
		if (!this.reviewFromDate && !this.reviewToDate) {
			this.reviewFromDate = date;
		} else if (this.reviewFromDate && !this.reviewToDate && date && date.after(this.reviewFromDate)) {
      this.reviewToDate = date;
		} else {
      this.reviewToDate = null;
			this.reviewFromDate = date;
		}

    if (this.reviewToDate) {
      let todate = new Date(this.reviewToDate.year, this.reviewToDate.month - 1, this.reviewToDate.day);
      this.appraisalForm.get('ReviewToDate').setValue(todate);
    }

    if (this.reviewFromDate) {
      let fromdate = new Date(this.reviewFromDate.year, this.reviewFromDate.month - 1, this.reviewFromDate.day);
      this.appraisalForm.get('ReviewFromDate').setValue(fromdate);
    }
    let fromDateValue = this.appraisalForm.get('ReviewFromDate').value;
    let toDateValue = this.appraisalForm.get('ReviewToDate').value;
    if (fromDateValue && toDateValue)
      this.reviewCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
	}

	isReviewHovered(date: NgbDate) {
		return (
			this.reviewFromDate && !this.reviewToDate && this.reviewhoveredDate && date.after(this.reviewFromDate) && date.before(this.reviewhoveredDate)
		);
	}

	isReviewInside(date: NgbDate) {
		return this.reviewToDate && date.after(this.reviewFromDate) && date.before(this.reviewToDate);
	}

	isReviewRange(date: NgbDate) {
		return (
			date.equals(this.reviewFromDate) ||
			(this.reviewToDate && date.equals(this.reviewToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

  onNormalizationDateSelection(date: NgbDate) {
		if (!this.normalizationFromDate && !this.normalizationToDate) {
			this.normalizationFromDate = date;
		} else if (this.normalizationFromDate && !this.normalizationToDate && date && date.after(this.normalizationFromDate)) {
      this.normalizationToDate = date;
		} else {
      this.normalizationToDate = null;
			this.normalizationFromDate = date;
		}

    if (this.normalizationToDate) {
      let todate = new Date(this.normalizationToDate.year, this.normalizationToDate.month - 1, this.normalizationToDate.day);
      this.appraisalForm.get('NormalizationToDate').setValue(todate);
    }

    if (this.normalizationFromDate) {
      let fromdate = new Date(this.normalizationFromDate.year, this.normalizationFromDate.month - 1, this.normalizationFromDate.day);
      this.appraisalForm.get('NormalizationFromDate').setValue(fromdate);
    }
    let fromDateValue = this.appraisalForm.get('NormalizationFromDate').value;
    let toDateValue = this.appraisalForm.get('NormalizationToDate').value;
    if (fromDateValue && toDateValue)
      this.normalizationCyclePeriod = fromDateValue.toLocaleDateString() +" - "+ toDateValue.toLocaleDateString();
	}

	isNormalizationHovered(date: NgbDate) {
		return (
			this.normalizationFromDate && !this.normalizationToDate && this.normallizationhoveredDate && date.after(this.normalizationFromDate) && date.before(this.normallizationhoveredDate)
		);
	}

	isNormalizationInside(date: NgbDate) {
		return this.normalizationToDate && date.after(this.normalizationFromDate) && date.before(this.normalizationToDate);
	}

	isNormalizationRange(date: NgbDate) {
		return (
			date.equals(this.normalizationFromDate) ||
			(this.normalizationToDate && date.equals(this.normalizationToDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

  navigateToObjective(item: ApprisalCycle) {
    this.nav.navigate(ConfigPerformance, item)
  }

  showOffCanvas(item: any) {
    if (item) {
      this.isProjectDetailReady = false;
      this.currentApprisalCycle = item;
      this.getProjects();
    }
  }

  hideOffCanvas() {
    $('#offcanvasRight').offcanvas('hide');
  }

  startCycle() {
    this.isLoading = true;
    if (this.appraisalHikeForm.invalid) {
      ErrorToast("Please fill all the manditory field");
      this.isLoading = false;
      return;
    }
    if (this.isAmountExceed) {
      ErrorToast("Hike amount is exceed from project appraisal budget");
      this.isLoading = false;
      return;
    }
    let value = this.appraisalHikeForm.value;
    // this.http.put(`eps/apprisalcatagory//${this.currentApprisalCycle.ObjectiveCatagoryId}`, value, true).then(res => {
    //   if (res.ResponseBody) {
    //     this.isLoading = false;
    //     this.closeCanvasRight();
    //     Toast("Appraisal cycle started successfully");
    //   }
    // }).catch(e => {
    //   this.isLoading = false;
    // })
    console.log(value)
  }

  getProjects() {
    this.projectDetails = [];
    this.selectedProject = null;
    // ${this.userDetail.UserId}
    this.http.get(`ps/projects/get/26`, true).then(res => {
      if (res.ResponseBody) {
        let project = res.ResponseBody.Project;
        this.designation = res.ResponseBody.Designation;
        this.allProjectAppraisal = res.ResponseBody.ProjectAppraisal;
        if (project.length > 0) {
          let result = project.reduce((a, b) => {
            a[b.ProjectId] = a[b.ProjectId] || [];
            a[b.ProjectId].push(b);
            return a;
          }, Object.create(null));

          let keys = Object.keys(result);
          let i = 0;
          while(i < keys.length) {
            this.projectDetails.push({
              ProjectId:result[keys[0]][0].ProjectId,
              ProjectName:result[keys[0]][0].ProjectName,
              ProjectDescription:result[keys[0]][0].ProjectDescription,
              ProjectMembers: result[keys[i]]
            });
            i++;
          }
          this.selectedProject = this.projectDetails[0];
          this.currentProjectAppraisal = this.allProjectAppraisal.find(x => x.ProjectId == this.selectedProject.ProjectId);
          if (this.currentProjectAppraisal && this.selectedProject.ProjectMembers.length > 0) {
            var offcanvasRight = document.getElementById('offcanvasRight');
            var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
            bsOffcanvas.show();
            this.initAppraisalHike();
            this.isTotalAmountExceed();
          } else if(this.selectedProject.ProjectMembers.length <= 0) {
            ErrorToast("Please add team members");
            return;
          } else {
            ErrorToast("Please add project appraisal budgest");
            return;
          }
          this.isProjectDetailReady = true;
          Toast("Project details found");
        } else {
          WarningToast("Please add project and their team members first");
          this.isProjectDetailReady = true;
        }
      }
    }).catch(e => {
      this.isProjectDetailReady = true;
    })
  }

  changeProject(item: any) {
    if (item) {
      this.selectedProject = this.projectDetails.find(x => x.ProjectId == item.ProjectId);
      this.currentProjectAppraisal = this.allProjectAppraisal.find(x => x.ProjectId == this.selectedProject.ProjectId);
      if (this.currentProjectAppraisal) {
        this.initAppraisalHike();
        this.isTotalAmountExceed();
      }
      else {
        ErrorToast("Please add project appraisal budgest");
        return;
      }
    }
  }

  closeCanvasRight() {
    var offcanvasRight = document.getElementById('offcanvasRight');
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
    bsOffcanvas.hide();
  }

  selectedAppraisal(index: number, item: any) {
    this.isObjectiveFound = false;
    this.currentApprisalCycle = item;
    if(index >= 0 &&  item.ObjectiveCatagoryId > 0) {
      let result = document.querySelectorAll('.list-group-item > a');
      let i = 0;
      while (i < result.length) {
        result[i].classList.remove('active-tab');
        i++;
      }

      result[index].classList.add('active-tab');
      this.getObjectiveByObjtiveId();

    } else {
      ErrorToast("Please select a appraisal group.")
    }
  }

  getObjectiveByObjtiveId() {
    this.isObjectiveFound = false;
    this.http.get(`eps/apprisalcatagory/getObjectiveByCategoryId/${this.currentApprisalCycle.ObjectiveCatagoryId}`, true).then(res => {
      if (res.ResponseBody) {
        this.currentAppraisalObjective = res.ResponseBody;
        this.isObjectiveFound = true;
      }
    })
  }

  loadAllObjective() {
    this.isPageReady = false;
    this.getAllPerformanceObjective();
  }

  getAllPerformanceObjective() {
    this.objectiveDetails = [];
    if (this.currentCompny.CompanyId > 0) {
      this.http.post("eps/performance/getPerformanceObjective", this.objectiveData, true)
      .then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          this.isPageReady = true;
          Toast("Record found");
        }
      }).catch(e => {
        this.isPageReady = true;
      })
    }
  }

  bindData(res: any) {
    if (res.ResponseBody.length > 0) {
      this.objectiveDetails = res.ResponseBody;
      this.objectiveData.TotalRecords = this.objectiveDetails[0].Total;
      if (this.currentAppraisalObjective && this.currentAppraisalObjective.length > 0) {
        this.objectiveDetails.forEach(x => {
          let value = this.currentAppraisalObjective.find(i => i.ObjectiveId == x.ObjectiveId);
          if (value)
            x.IsAdded = true;
          else
            x.IsAdded = false;
        });
      }
    }
    else
      this.objectiveData.TotalRecords = 0;
  }

  initObjetiveForm() {
    this.objectForm = this.fb.group({
      ObjectiveId: new FormControl(this.currentObject.ObjectiveId),
      Objective: new FormControl(this.currentObject.Objective, [Validators.required]),
      CanManagerSee: new FormControl(this.currentObject.CanManagerSee ? 'true' :'false', [Validators.required]),
      IsIncludeReview: new FormControl(this.currentObject.IsIncludeReview),
      CompanyId: new FormControl(this.currentCompny.CompanyId),
      ProgressMeassureType: new FormControl(this.currentObject.ProgressMeassureType == 1 ? '1' : this.currentObject.ProgressMeassureType == 2 ? '2' : '3'),
      StartValue: new FormControl(this.currentObject.StartValue, [Validators.required]),
      TargetValue: new FormControl(this.currentObject.TargetValue, [Validators.required]),
      Description: new FormControl(''),
    })
  }

  get m() {
    return this.objectForm.controls;
  }

  addObjectivePopUp() {
    this.isSubmitted = false;
    this.currentObject = new Objective();
    this.initForm();
    $('#addObjectiveModal').modal('show');
  }

  addObjective() {
    this.isLoading = true;
    this.isSubmitted = true;
    let errroCounter = 0;
    if (this.objectForm.get('Objective').errors !== null)
      errroCounter++;

    if (this.objectForm.get('CanManagerSee').errors !== null)
      errroCounter++;

    if (this.objectForm.get('StartValue').errors !== null)
      errroCounter++;

    if (this.objectForm.get('TargetValue').errors !== null)
      errroCounter++;

    let value = this.objectForm.value;
    if (errroCounter === 0 && value.CompanyId > 0) {
      let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
      if (data)
        value.Description = data;

      value.CanManagerSee = value.CanManagerSee == "true" ? true : false;
      this.http.post("eps/performance/objectiveInsertUpdate", value, true).then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          $('#addObjectiveModal').modal('hide');
          Toast("Objective insert/updated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
    }
  }

  resetFilterObjective() {
    this.objectiveData.SearchString = "1=1";
    this.objectiveData.PageIndex = 1;
    this.objectiveData.PageSize = 10;
    this.objectiveData.StartIndex = 1;
    this.objectiveData.ActivePageNumber = 1;
    this.objectiveData.EndIndex = (this.objectiveData.PageSize * this.objectiveData.PageIndex);
    this.getAllPerformanceObjective();
    this.objectDetail.Objective="";
    this.objectDetail.TargetValue = 0;
  }

  filterRecordsObjective() {
    let searchQuery = "";
    let delimiter = "";
    this.objectiveData.reset();
    if(this.objectDetail.Objective !== null && this.objectDetail.Objective !== "") {
      searchQuery += ` ${delimiter} Objective like '%${this.objectDetail.Objective}%' `;
        delimiter = "and";
    }

    if(this.objectDetail.TargetValue !== null && this.objectDetail.TargetValue > 0) {
      searchQuery += ` ${delimiter} TargetValue like '%${this.objectDetail.TargetValue}%' `;
        delimiter = "and";
    }

    if(searchQuery !== "") {
      this.objectiveData.SearchString = `${searchQuery}`;
    }

    this.getAllPerformanceObjective();
  }

  arrangeObjectiveDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'ASC';
    } else {
      Order = 'DESC';
    }
    if (FieldName == 'Objective')
      this.orderByObjectiveAsc = !flag;

    if (FieldName == 'TargetValue')
      this.orderBTargetValueAsc = !flag;

    this.objectiveData = new Filter();
    this.objectiveData.SortBy = FieldName + " " + Order;
    this.getAllPerformanceObjective()
  }

  GetFilterObjectiveResult(e: Filter) {
    if(e != null) {
      this.objectiveData = e;
      this.getAllPerformanceObjective();
    }
  }

  changeProgressMeassur(e: any) {
    let value = Number(e.target.value);
    if (value == 1) {
      this.objectForm.get('TargetValue').setValue(0);
      this.objectForm.get('StartValue').setValue(0);
    }
  }

  editObjectivePopUp(item: Objective) {
    if (item) {
      this.currentObject = item;
      this.htmlText = item.Description;
      this.initObjetiveForm();
      this.isSubmitted = false;
      $('#addObjectiveModal').modal('show');
    }
  }

  manageAppraisalObjectivePopUp() {
    this.getAllPerformanceObjective();
    this.selectedObjective = [...this.currentAppraisalObjective]
    $('#addAppraisalObjective').modal('show');
  }

  manageObjective(e: any, item: Objective) {
    let value = e.target.checked;
    if (value) {
      let objective = this.selectedObjective.find(x => x.ObjectiveId == item.ObjectiveId);
      if (objective == null)
        this.selectedObjective.push(item);
    } else {
      let index = this.selectedObjective.findIndex( x=> x.ObjectiveId == item.ObjectiveId);
      if (index != -1)
        this.selectedObjective.splice(index, 1);
    }
  }

  addAppraisalObjective() {
    this.isLoading = true;
    if (this.selectedObjective && this.selectedObjective.length > 0 && this.currentApprisalCycle && this.currentApprisalCycle.ObjectiveCatagoryId > 0) {
      this.currentApprisalCycle.ObjectiveIds = this.selectedObjective.map(x => x.ObjectiveId);
      this.http.put(`eps/apprisalcatagory/manageAppraisalCycle/${this.currentApprisalCycle.ObjectiveCatagoryId}`,this.currentApprisalCycle, true).then(res => {
        if (res.ResponseBody) {
          this.getObjectiveByObjtiveId();
          Toast("Objective added/updated in appraisal category successfully");
          $('#addAppraisalObjective').modal('hide');
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Please select objective first");
      this.isLoading = false;
    }
  }

  listview() {
    this.isObjectiveFound = false;
    this.isViewInList = !this.isViewInList;
    if (!this.isViewInList) {
      if (this.apprisalCycleDetail.length > 0)
      this.currentApprisalCycle = this.apprisalCycleDetail[0];
      this.getObjectiveByObjtiveId();
    }
  }

  initAppraisalHike() {
    this.appraisalHikeForm = this.fb.group({
      ProjectMemberHike: this.buildProjectMemberHike()
    })
  }

  buildProjectMemberHike(): FormArray {
    let data = this.selectedProject.ProjectMembers;
    console.log(data)
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          FullName: new FormControl(data[i].FullName),
          MemberType: new FormControl(data[i].MemberType),
          DesignationName: new FormControl(data[i].DesignationName),
          AssignedOn: new FormControl(data[i].AssignedOn),
          CTC: new FormControl(data[i].CTC),
          ProposedPromotion: new FormControl(data[i].ProposedPromotion != null ? data[i].ProposedPromotion : 0),
          ProposedHikePercentage: new FormControl(data[i].ProposedHikePercentage != null ? data[i].ProposedHikePercentage : 0),
          ProposedHikeAmount: new FormControl(data[i].ProposedHikeAmount != null ? data[i].ProposedHikeAmount : 0),
          Experience: new FormControl(data[i].Experience != null ? data[i].Experience : 0)
        }));
        i++;
      }
    } else {
      ErrorToast("No recoed found");
      return;
    }
    return dataArray;
  }

  get hikeDetail() {
    return this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
  }

  proposedHikeCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    if (name == "ProposedHikePercentage") {
      let elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("ProposedHikeAmount").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikeAmount = (ctc * value)/100;
        formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
      }
    } else {
      let elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("ProposedHikePercentage").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("ProposedHikePercentage").setValue(hikePercentage);
      }
    }
  }

  proposedHikeAmountCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let value = Number(e.target.value);
    if (value > 0) {
      if (name == "ProposedHikePercentage") {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikeAmount = (ctc * value)/100;
        formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
      } else {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("ProposedHikePercentage").setValue(hikePercentage);
      }
      this.isTotalAmountExceed();
    }
  }

  isTotalAmountExceed() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    this.isAmountExceed = false;
    let totalAmount = formArray.value.map(x => Number(x.ProposedHikeAmount)).reduce((a, b) => {return a + b;}, 0);
    if (totalAmount > this.currentProjectAppraisal.ProjectAppraisalBudget)
      this.isAmountExceed = true;
  }

  equalPercentage() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let equalpercent = 100 / formArray.length;
    for (let i = 0; i < formArray.length; i++) {
      let ctc = formArray.controls[i].get("CTC").value;
      let hikeAmount = (ctc * equalpercent)/100;
      formArray.controls[i].get("ProposedHikePercentage").setValue(equalpercent);
      formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
    }
    this.isTotalAmountExceed();
  }
}

class ApprisalCycle {
  ObjectiveCatagoryType: string = null;
  TypeDescription: string = null;
  AppraisalCycleFromDate: Date = null;
  AppraisalCycleToDate: Date = null;
  Total: number = 0;
  ObjectiveCatagoryId: number = 0;
  Index: number = 0;
  Status: String = null;
  ObjectiveIds: Array<number> = [];
  IsTagByRole: boolean = false;
  IsTagByDepartment: boolean = false;
  IsSelfAppraisal: boolean = false;
  SelfAppraisalFromDate: Date = null;
  SelfAppraisalToDate: Date = null;
  SelectionPeriodFromDate: Date = null;
  SelectionPeriodToDate: Date = null;
  FeedbackFromDate: Date = null;
  FeedbackToDate: Date = null;
  RoleIds: number = 1;
  DepartmentIds: number = 1;
  ReviewFromDate: Date = null;
  ReviewToDate: Date = null;
  NormalizationFromDate: Date = null;
  NormalizationToDate: Date = null;
  IsHikeApproval: boolean = false;
  IsMultiRaterFeedback: boolean = false;
  IsDefaultRater: boolean = false;
  IsAllowSelfAppraisal: boolean = false;
}

class Objective {
  ObjectiveId: number = 0;
  Objective: string = null;
  CanManagerSee: boolean = false;
  IsIncludeReview: boolean = false;
  ProgressMeassureType: number = 1;
  StartValue: number = 0;
  TargetValue: number = 0;
  Description: string = null;
}
