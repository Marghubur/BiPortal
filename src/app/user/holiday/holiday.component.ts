import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent implements OnInit {
  isPageReady: boolean = false;
  allHolidayList: Array<CompanyHoliday> = [];
  companyId: number = 0;
  currentCompany: any = null;
  holidayData: Filter = null;
  holidayDetail: CompanyHoliday= null;
  orderByDescriptionNoteAsc: boolean = null;
  orderByCountryAsc: boolean = null;
  orderByStartDateAsc: boolean = null;
  orderByEndDateAsc: boolean = null;

  constructor(private http: AjaxService,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    this.holidayData = new Filter();
    this.holidayDetail = new CompanyHoliday();
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.holidayData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
        this.loadData();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.post('CompanyCalender/GetAllHoliday', this.holidayData).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        Toast("Record found");
        this.isPageReady = true;
      } else {
      this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  bindData(res: any) {
    this.allHolidayList = res;
    if (this.allHolidayList.length > 0) {
      for (let i = 0; i < this.allHolidayList.length; i++) {
        this.allHolidayList[i].StartDate = ToLocateDate(this.allHolidayList[i].StartDate);
        this.allHolidayList[i].EndDate = ToLocateDate(this.allHolidayList[i].EndDate);
        let timeDiffer =  new Date(this.allHolidayList[i].EndDate).setHours(0,0,0,0) - new Date(this.allHolidayList[i].StartDate).setHours(0,0,0,0);
        let totalDays = timeDiffer / (1000*60*60*24);
        this.allHolidayList[i].TotalDays = totalDays + 1;
      }
      this.holidayData.TotalRecords= this.allHolidayList[0].Total;
    } else {
      this.holidayData.TotalRecords= 0;
    }
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.holidayData = e;
      this.loadData();
    }
  }

  filterRecords() {
    let delimiter = "";
    this.holidayData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.holidayData.reset();

    if(this.holidayDetail.DescriptionNote !== null && this.holidayDetail.DescriptionNote !== "") {
      this.holidayData.SearchString += ` and DescriptionNote like '%${this.holidayDetail.DescriptionNote}%'`;
        delimiter = "and";
    }

    if(this.holidayDetail.Country !== null && this.holidayDetail.Country !== "") {
      this.holidayData.SearchString += ` and Country like '%${this.holidayDetail.Country}%'`;
        delimiter = "and";
    }

    if(this.holidayDetail.IsHalfDay !== null) {
      this.holidayData.SearchString += ` And IsHalfDay = ${this.holidayDetail.IsHalfDay}`;
        delimiter = "and";
    }

    this.loadData();
  }

  resetFilter() {
    this.holidayData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.holidayData.PageIndex = 1;
    this.holidayData.PageSize = 10;
    this.holidayData.StartIndex = 1;
    this.loadData();
    this.holidayDetail.DescriptionNote="";
    this.holidayDetail.Country = null;
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'DescriptionNote') {
      this.orderByDescriptionNoteAsc = !flag;
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = null;
    } else if (FieldName == 'Country') {
      this.orderByCountryAsc = !flag;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = null;
      this.orderByDescriptionNoteAsc = null;
    } else if (FieldName == 'StartDate') {
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = !flag;
      this.orderByEndDateAsc = null;
      this.orderByDescriptionNoteAsc = null;
    } else if (FieldName == 'EndDate') {
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = !flag;
      this.orderByDescriptionNoteAsc = null;
    }

    this.holidayData = new Filter();
    this.holidayData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.holidayData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }
}


export class CompanyHoliday {
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
  TotalDays: number = 0;
  IsCompanyCustomHoliday: boolean = false;
  Total: number = 0;
  Index: number = 0;
  HolidayType: number = 2;
}