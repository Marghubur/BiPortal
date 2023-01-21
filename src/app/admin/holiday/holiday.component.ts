import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { EmailLinkConfig, Holiday } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent implements OnInit {
  isPageReady: boolean = false;
  isCompaniesDetails: boolean = false;
  holidayForm: FormGroup;
  hoidaysList: Array<CompanyHoliday> = [];
  selectedHoliday: CompanyHoliday = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  companyId: number = 0;
  currentCompany: any = null;
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  years: Array<number> = [];

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    for (let i = 0; i < 3; i++) {
      let year = new Date().getFullYear();
      this.years.push(year - i);
    }
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.isPageReady = true;
        this.selectedHoliday = new CompanyHoliday();
        this.initForm();
        $('#manageHolidayModal').modal('show');
        //this.loadData();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`/${this.companyId}`).then(res => {
      if (res.ResponseBody) {
        Toast("Record found");
        this.isPageReady = true;
      } else {
      this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  initForm() {
    this.holidayForm = this.fb.group({
      CompanyCalendarId: new FormControl(this.selectedHoliday.CompanyCalendarId),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      StartDate: new FormControl(this.selectedHoliday.StartDate, [Validators.required]),
      EndDate: new FormControl(this.selectedHoliday.EndDate, [Validators.required]),
      EventName: new FormControl(this.selectedHoliday.EventName, [Validators.required]),
      IsHoliday: new FormControl(this.selectedHoliday.IsHoliday, [Validators.required]),
      IsHalfDay: new FormControl(this.selectedHoliday.IsHalfDay, [Validators.required]),
      DescriptionNote: new FormControl(this.selectedHoliday.DescriptionNote, [Validators.required]),
      ApplicableFor: new FormControl(this.selectedHoliday.ApplicableFor, [Validators.required]),
      Year: new FormControl(this.selectedHoliday.Year, [Validators.required]),
      IsPublicHoliday: new FormControl(this.selectedHoliday.IsPublicHoliday, [Validators.required]),
      Country: new FormControl(this.selectedHoliday.Country, [Validators.required]),
      IsCompanyCustomHoliday: new FormControl(this.selectedHoliday.IsCompanyCustomHoliday, [Validators.required])
    })
  }

  manageHoliday() {
    this.isLoading = true;
    this.submitted = true;
    let startDate = new Date(this.holidayForm.get('StartDate').value);
    let endDate = new Date(this.holidayForm.get('EndDate').value);
    if (startDate.getTime() > endDate.getTime()) {
      this.isLoading = false;
      ErrorToast("End date must be greater than or equal to start date");
      return;
    }
    if (this.holidayForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.holidayForm.value;
    console.log(value);
    this.http.post("", value).then(res => {
      if (res.ResponseBody) {
        this.hoidaysList = res.ResponseBody;
        $('$manageHolidayModal').modal('hide');
        this.isLoading = false;
        this.submitted = false;
      } else {
        this.isLoading = false;
        this.submitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
      this.submitted = false;
    })
  }

  editHoliday(data: any) {
    if (data) {
      this.selectedHoliday = data;
      this.initForm();
      $('$manageHolidayModal').modal('show');
    }
  }

  addHoliday() {
    this.selectedHoliday = new CompanyHoliday();
    this.initForm();
    $('#manageHolidayModal').modal('show');
  }

  deleteHoliday(id: number) {
    if (id > 0) {
      this.http.post('', id).then(res => {

      })
    }
  }

  get f() {
    return this.holidayForm.controls;
  }

  onfromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.holidayForm.controls["StartDate"].setValue(date);
  }

  ontoDateSelection(e: NgbDateStruct) {
    let startDate = new Date(this.holidayForm.get('StartDate').value);
    let date = new Date(e.year, e.month - 1, e.day);
    if (startDate.getTime() > date.getTime()) {
      this.holidayForm.get('EndDate').setValue(null);
      ErrorToast("End date must be greater than or equal to start date");
    }
    else
      this.holidayForm.get('EndDate').setValue(date);
  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, Holiday);
  }

}

class CompanyHoliday {
  CompanyCalendarId: number = 0;
  CompanyId: number = 0;
  StartDate: Date = null;
  EndDate: Date = null;
  EventName: string = null;
  IsHoliday: boolean = true;
  IsHalfDay: boolean = false;
  DescriptionNote: string = null;
  ApplicableFor: number = 0;
  Year: number = new Date().getFullYear();
  IsPublicHoliday: boolean = false;
  Country: string = null;
  IsCompanyCustomHoliday: boolean = false;
}
