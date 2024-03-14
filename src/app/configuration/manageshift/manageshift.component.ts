import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Shift } from 'src/app/adminmodal/admin-modals';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { AdminNotification } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-manageshift',
  templateUrl: './manageshift.component.html',
  styleUrls: ['./manageshift.component.scss']
})
export class ManageshiftComponent implements OnInit {
  days: Array<any> = [];
  autoHide: boolean = false;
  isPageReady: boolean = true;
  submitted: boolean = false;
  frommodel: NgbDateStruct;
  mindate: any = null;
  maxdate: any = null;
  shiftForm: FormGroup;
  currentShift: Shift = null;
  tomodel: NgbDateStruct;
  currentCompany: any = null;
  companyId: number = 0;
  shiftData: Filter = null;
  isLoading: boolean = false;
  departments: any = null;
  allShift: Array<Shift> = [];
  shiftDetail: Shift = null;
  orderByShiftTitleAsc: boolean = null;
  orderByTotalWorkingDaysAsc: boolean = null;
  orderByStartDateAsc: boolean = null;
  orderByOfficeTimeAsc: boolean = null;
  orderByDurationAsc: boolean = null;
  orderByStatusAsc: boolean = null;
  orderByLunchDurationAsc: boolean = null;
  apiUrl: string = "";
  initTime: "09:00";
  minutes: Array<number> = [];

  constructor(private fb: FormBuilder,
              private local: ApplicationStorage,
              private http: CoreHttpService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let department = this.local.findRecord("Department");
    if (department && department.length > 0)
      this.departments= department;
    else {
      ErrorToast("Please login again");
      return;
    }
    for (let i = 1; i < 60; i++) {
      this.minutes.push(i);
    }

    this.days = [
      { day: 'Monday', id: 1, isEnabled: false },
      { day: 'Tuesday', id: 2, isEnabled: false  },
      { day: 'Wednesday', id: 3, isEnabled: false  },
      { day: 'Thusday', id: 4, isEnabled: false  },
      { day: 'Friday', id: 5, isEnabled: false  },
      { day: 'Saturday', id: 6, isEnabled: false  },
      { day: 'Sunday', id: 7, isEnabled: false  }
    ];
    this.mindate = {year: new Date().getFullYear(), month: 1, day: 1};
    this.maxdate = {year: new Date().getFullYear(), month: 12, day: 31};
    this.initData();
  }

  initData() {
    let data = this.local.findRecord("Companies");
    this.currentShift = new Shift();
    this.shiftData = new Filter();
    this.shiftDetail = new Shift();
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.shiftData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
        this.loadData();
        this.initForm();
      }
    }
  }

  pageReload() {
    this.initData();
  }

  toggleDays(id: number, e: any) {
    let item = this.days.find(x => x.id == id);
    // let index = this.selectedDays.findIndex(x => x.id == id);
    if(!item.isEnabled) {
      e.currentTarget.querySelector('i[name="selection-on"]').classList.remove("d-none");
      e.currentTarget.querySelector('i[name="selection-off"]').classList.add("d-none");
      e.currentTarget.classList.add("border-success");
      item.isEnabled = true;
    } else {
      e.currentTarget.querySelector('i[name="selection-on"]').classList.add("d-none");
      e.currentTarget.querySelector('i[name="selection-off"]').classList.remove("d-none");
      e.currentTarget.classList.remove("border-success");
      item.isEnabled = false;
    }

    // let tag: any = e.target.querySelector('i').classList;
    // if(item && tag) {
    //   if (tag.contains('v-hide')) {
    //     tag.remove('v-hide');
    //     item.isEnabled = true;
    //   } else {
    //     tag.add('v-hide');
    //     item.isEnabled = false;
    //   }
    // }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', null);
    console.log("Handler removed.");
  }

  // @HostListener('document:click', ['$event'])
  // CloseSuggestionBox(e: any) {
  //   if (e.target.getAttribute('title') == "multi-select-box") {
  //     // do nothing
  //   } else {
  //     document.getElementById('auto-hide-box').classList.add('d-none');
  //   }
  // }

  loadData() {
    this.isPageReady = false;
    this.http.post("Shift/GetAllWorkShift", this.shiftData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  bindData(res: any) {
    this.allShift = res;
    if (this.allShift.length > 0)
      this.shiftData.TotalRecords = this.allShift[0].Total;
    else
      this.shiftData.TotalRecords = 0;
  }

  enableDropdown() {
    document.getElementById('auto-hide-box').classList.remove('d-none');
  }

  addShiftPopUp() {
    this.submitted = false;
    this.apiUrl = "Shift/CreateWorkShift";
    this.currentShift = new Shift();
    this.days.map(day => day.isEnabled = false);
    this.initForm();
    $('#manageShiftModal').modal('show');
  }

  initForm() {
    this.shiftForm = this.fb.group({
      WorkShiftId: new FormControl(this.currentShift.WorkShiftId),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      Department: new FormControl(this.currentShift.Department, [Validators.required]),
      WorkFlowCode: new FormControl('code', [Validators.required]),
      ShiftTitle: new FormControl(this.currentShift.ShiftTitle, [Validators.required]),
      Description: new FormControl(this.currentShift.Description),
      IsMon: new FormControl(this.currentShift.IsMon),
      IsTue: new FormControl(this.currentShift.IsTue),
      IsThu: new FormControl(this.currentShift.IsThu),
      IsWed: new FormControl(this.currentShift.IsWed),
      IsFri: new FormControl(this.currentShift.IsFri),
      IsSat: new FormControl(this.currentShift.IsSat),
      IsSun: new FormControl(this.currentShift.IsSun),
      TotalWorkingDays: new FormControl(this.currentShift.TotalWorkingDays, [Validators.required]),
      StartDate: new FormControl(this.currentShift.StartDate, [Validators.required]),
      EndDate: new FormControl(this.currentShift.EndDate, [Validators.required]),
      OfficeTime: new FormControl(this.currentShift.OfficeTime, [Validators.required]),
      Duration: new FormControl(this.currentShift.Duration, [Validators.required]),
      LunchDuration: new FormControl(this.currentShift.LunchDuration, [Validators.required]),
      Status: new FormControl(this.currentShift.Status),
      DurationHrs: new FormControl("0"),
      DurationMinutes: new FormControl("0")
    })
  }

  get f() {
    return this.shiftForm.controls;
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.shiftForm.controls["StartDate"].setValue(date);
  }

  ontoDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.shiftForm.controls["EndDate"].setValue(date);
  }

  CreateUpdateRequest() {
    this.isLoading = true;
    this.submitted = true;
    var index = this.days.findIndex(x => x.isEnabled == true);
    if (index == -1) {
      this.isLoading = false;
      ErrorToast("Please add days first");
      return;
    }

    for (let i = 0; i < this.days.length; i++) {
      switch (this.days[i].id) {
        case 1:
          this.shiftForm.get('IsMon').setValue(this.days[i].isEnabled);
          break;
        case 2:
          this.shiftForm.get('IsTue').setValue(this.days[i].isEnabled);
          break;
        case 3:
          this.shiftForm.get('IsWed').setValue(this.days[i].isEnabled);
          break;
        case 4:
          this.shiftForm.get('IsThu').setValue(this.days[i].isEnabled);
          break;
        case 5:
          this.shiftForm.get('IsFri').setValue(this.days[i].isEnabled);
          break;
        case 6:
          this.shiftForm.get('IsSat').setValue(this.days[i].isEnabled);
          break;
        case 7:
          this.shiftForm.get('IsSun').setValue(this.days[i].isEnabled);
          break;
      }
    }

    let workingdays = this.shiftForm.get('TotalWorkingDays').value;
    let selecteddays = this.days.filter(x => x.isEnabled == true);
    if (workingdays != selecteddays.length) {
      this.isLoading = false;
      ErrorToast("Selected days and working days count doesn't match");
      return;
    }

    if (this.shiftForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all the mandatory field");
      return;
    }

    let value = this.shiftForm.value;
    this.http.post(this.apiUrl, value).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        $('#manageShiftModal').modal('hide');
        this.isLoading = false;
        Toast("Shift inserted/updated successfully")
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  GetFilterResult(e: any) {
    if(e != null) {
      this.shiftData = e;
      this.loadData();
    }
  }

  resetFilter() {
    this.shiftDetail = new Shift();
    this.shiftData = new Filter();
    this.loadData();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.shiftData.SearchString = ""
    this.shiftData.reset();

    if(this.shiftDetail.ShiftTitle !== null && this.shiftDetail.ShiftTitle !== "") {
      this.shiftData.SearchString += `1=1 And ShiftTitle like '%${this.shiftDetail.ShiftTitle}%'`;
        delimiter = "and";
    }

    if(this.shiftDetail.OfficeTime !== null && this.shiftDetail.OfficeTime !== "") {
      this.shiftData.SearchString += `1=1 And OfficeTime like '%${this.shiftDetail.OfficeTime}%'`;
        delimiter = "and";
    }

    if(this.shiftDetail.LunchDuration !== null && this.shiftDetail.LunchDuration !== 0) {
      this.shiftData.SearchString += `1=1 And LunchDuration = ${this.shiftDetail.LunchDuration}`;
        delimiter = "and";
    }

    if(this.shiftDetail.Duration !== null && this.shiftDetail.Duration !== 0) {
      this.shiftData.SearchString += `1=1 And Duration = ${this.shiftDetail.Duration}`;
        delimiter = "and";
    }

    if(this.shiftDetail.TotalWorkingDays !== null && this.shiftDetail.TotalWorkingDays !== 0) {
      this.shiftData.SearchString += `1=1 And TotalWorkingDays = ${this.shiftDetail.TotalWorkingDays}`;
        delimiter = "and";
    }

    this.loadData();
  }

  editShiftPopUp(item: Shift) {
    if (item) {
      this.apiUrl = "Shift/UpdateWorkShift";
      this.currentShift = item;
      this.currentShift.StartDate = ToLocateDate(this.currentShift.StartDate);
      this.frommodel = { day: this.currentShift.StartDate.getDate(), month: this.currentShift.StartDate.getMonth() + 1, year: this.currentShift.StartDate.getFullYear()};
      this.currentShift.EndDate = ToLocateDate(this.currentShift.EndDate);
      this.tomodel = { day: this.currentShift.EndDate.getDate(), month: this.currentShift.EndDate.getMonth() + 1, year: this.currentShift.EndDate.getFullYear()};
      let duration = item.Duration;
      this.initForm();
      if (duration > 0) {
        let min = duration % 60;
          this.shiftForm.get('DurationMinutes').setValue(min);
        let hrs = duration /60;
        if (hrs > 0)
          this.shiftForm.get('DurationHrs').setValue(Math.floor(hrs));
      }
      this.days.map(day => {
        switch(day.id) {
          case 1:
            day.isEnabled = this.currentShift.IsMon;
            break;
          case 2:
            day.isEnabled = this.currentShift.IsThu;
            break;
          case 3:
            day.isEnabled = this.currentShift.IsWed;
            break;
          case 4:
            day.isEnabled = this.currentShift.IsThu;
            break;
          case 5:
            day.isEnabled = this.currentShift.IsFri;
            break;
          case 6:
            day.isEnabled = this.currentShift.IsSat;
            break;
          case 7:
            day.isEnabled = this.currentShift.IsSun;
            break;
        }
      });

      $('#manageShiftModal').modal('show');
    }
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'ShiftTitle') {
      this.orderByShiftTitleAsc = !flag;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = null
      this.orderByStatusAsc = null;;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'TotalWorkingDays') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = !flag;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = null;
      this.orderByStatusAsc = null;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'StartDate') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = !flag;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = null;
      this.orderByStatusAsc = null;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'OfficeTime') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = !flag;
      this.orderByDurationAsc = null;
      this.orderByStatusAsc = null;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'Duration') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = !flag;
      this.orderByStatusAsc = null;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'Status') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = null;
      this.orderByStatusAsc = !flag;
      this.orderByLunchDurationAsc = null;
    } else if (FieldName == 'LunchDuration') {
      this.orderByShiftTitleAsc = null;
      this.orderByTotalWorkingDaysAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByOfficeTimeAsc = null;
      this.orderByDurationAsc = null;
      this.orderByStatusAsc = null;
      this.orderByLunchDurationAsc = !flag;
    }
    this.shiftData = new Filter();
    this.shiftData.SearchString = `1=1`;
    this.shiftData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  shiftDurationCalc() {
    let hrs = Number(this.shiftForm.get('DurationHrs').value);
    let min = Number(this.shiftForm.get('DurationMinutes').value);
    let totalTime = 0;
    if (hrs > 0)
      totalTime += hrs * 60;

    if (min > 0)
      totalTime += min;

    this.shiftForm.get('Duration').setValue(totalTime);
  }
}
