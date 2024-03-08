import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CompanyHoliday } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { Holiday, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss']
})
export class HolidayComponent implements OnInit {
  isPageReady: boolean = false;
  holidayForm: FormGroup;
  allHolidayList: Array<CompanyHoliday> = [];
  selectedHoliday: CompanyHoliday = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  companyId: number = 0;
  currentCompany: any = null;
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;
  year: number = 0;
  holidayData: Filter = null;
  holidayDetail: CompanyHoliday= null;
  orderByDescriptionNoteAsc: boolean = null;
  orderByCountryAsc: boolean = null;
  orderByStartDateAsc: boolean = null;
  orderByEndDateAsc: boolean = null;
  orderByFullDayAsc: boolean = null;
  mindate: any = null;
  maxdate: any = null;
  isAdmin: boolean = false;
  isUploadFile: boolean = true;
  file: File;
  fileSize: string;
  fileName: string;
  isFileReady: boolean = false;
  isDisable: boolean = true;
  sampleFilePath: string = null;
  basePath: string = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private user: UserService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.year = new Date().getFullYear();
    this.basePath = this.http.GetImageBasePath();
    this.initData();
  }

  initData() {
    let data = this.local.findRecord("Companies");
    let userDetail = this.user.getInstance() as UserDetail;
    this.holidayData = new Filter();
    this.mindate = {year: new Date().getFullYear(), month: 1, day: 1};
    this.maxdate = {year: new Date().getFullYear(), month: 12, day: 31};
    this.holidayDetail = new CompanyHoliday();
    if (userDetail.RoleId == UserType.Admin)
      this.isAdmin = true;
    else
      this.isAdmin = false;

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
        this.selectedHoliday = new CompanyHoliday();
        this.loadData();
        this.initForm();
      }
    }
  }

  pageReload() {
    this.initData();
  }

  loadData() {
    this.isPageReady = false;
    this.holidayData.SearchString = this.holidayData.SearchString + " and CompanyId = " + this.companyId;
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

  initForm() {
    this.holidayForm = this.fb.group({
      CompanyCalendarId: new FormControl(this.selectedHoliday.CompanyCalendarId),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      StartDate: new FormControl(this.selectedHoliday.StartDate, [Validators.required]),
      EndDate: new FormControl(this.selectedHoliday.EndDate, [Validators.required]),
      EventName: new FormControl(this.selectedHoliday.EventName, [Validators.required]),
      IsHoliday: new FormControl(this.selectedHoliday.IsHoliday),
      IsHalfDay: new FormControl(this.selectedHoliday.IsHalfDay, [Validators.required]),
      DescriptionNote: new FormControl(this.selectedHoliday.DescriptionNote, [Validators.required]),
      ApplicableFor: new FormControl(this.selectedHoliday.ApplicableFor, [Validators.required]),
      Year: new FormControl(this.selectedHoliday.Year, [Validators.required]),
      IsPublicHoliday: new FormControl(this.selectedHoliday.IsPublicHoliday),
      Country: new FormControl(this.selectedHoliday.Country, [Validators.required]),
      IsCompanyCustomHoliday: new FormControl(this.selectedHoliday.IsCompanyCustomHoliday),
      HolidayType: new FormControl(this.selectedHoliday.HolidayType, [Validators.required])
    })
  }

  manageHoliday() {
    this.isLoading = true;
    this.submitted = true;
    let startDate = new Date(this.holidayForm.get('StartDate').value).setHours(0,0,0,0);
    let endDate = new Date(this.holidayForm.get('EndDate').value).setHours(0,0,0,0);
    let holidaytype = this.holidayForm.get('IsPublicHoliday').value;
    if (Number(holidaytype) == 1) {
      this.holidayForm.get('IsPublicHoliday').setValue(true);
      this.holidayForm.get('IsHoliday').setValue(false);
      this.holidayForm.get('IsCompanyCustomHoliday').setValue(false);
    } else if (Number(holidaytype) == 2) {
      this.holidayForm.get('IsPublicHoliday').setValue(false);
      this.holidayForm.get('IsHoliday').setValue(true);
      this.holidayForm.get('IsCompanyCustomHoliday').setValue(false);
    } else if (Number(holidaytype) == 3) {
      this.holidayForm.get('IsPublicHoliday').setValue(false);
      this.holidayForm.get('IsHoliday').setValue(false);
      this.holidayForm.get('IsCompanyCustomHoliday').setValue(true);
    }
    if (startDate > endDate) {
      this.isLoading = false;
      ErrorToast("End date must be greater than or equal to start date");
      return;
    }
    if (this.holidayForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.holidayForm.value;
    this.http.post("CompanyCalender/HolidayInsertUpdate", value).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        $('#manageHolidayModal').modal('hide');
        Toast("Holiday inserted/updated suceessfully");
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

  editHoliday(data: CompanyHoliday) {
    if (data) {
      this.selectedHoliday = data;
      this.fromModel = { day: this.selectedHoliday.StartDate.getDate(), month:this.selectedHoliday.StartDate.getMonth() + 1, year:this.selectedHoliday.StartDate.getFullYear()};
      this.toModel = { day: this.selectedHoliday.EndDate.getDate(), month:this.selectedHoliday.EndDate.getMonth() + 1, year:this.selectedHoliday.EndDate.getFullYear()};
      if (data.IsPublicHoliday) {
        data.HolidayType = 1;
      } else if (data.IsHoliday) {
        data.HolidayType = 1;
      } else if (data.IsCompanyCustomHoliday) {
        data.HolidayType = 3;
      }
      this.initForm();
      $('#manageHolidayModal').modal('show');
    }
  }

  addHolidayPopup() {
    this.submitted = false;
    this.fromModel = { day: new Date().getDate(), month:new Date().getMonth() + 1, year:new Date().getFullYear()};
    this.toModel = { day: new Date().getDate(), month:new Date().getMonth() + 1, year:new Date().getFullYear()};
    this.selectedHoliday = new CompanyHoliday();
    this.initForm();
    $('#manageHolidayModal').modal('show');
  }

  deleteHolidayPopUp(data: CompanyHoliday) {
     if (data) {
       this.selectedHoliday = data;
       $('#deleteHolidayModal').modal('show');
     }
  }

  deleteHoliday() {
    this.isLoading = true;
    if (this.selectedHoliday.CompanyCalendarId > 0) {
      this.http.delete(`CompanyCalender/DeleteHolidy/${this.selectedHoliday.CompanyCalendarId}`).then(res => {
        if (res.ResponseBody) {
          this.bindData(res.ResponseBody);
          $('#deleteHolidayModal').modal('hide');
          this.isLoading = false;
          Toast("Holiday inserted/updated suceessfully");
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
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
    let startDate = new Date(this.holidayForm.get('StartDate').value).setHours(0,0,0,0);
    let date = new Date(e.year, e.month - 1, e.day);
    if (startDate > date.setHours(0,0,0,0)) {
      this.holidayForm.get('EndDate').setValue(null);
      ErrorToast("End date must be greater than or equal to start date");
    }
    else
      this.holidayForm.get('EndDate').setValue(date);
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
    this.holidayDetail.IsHalfDay = null;
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
      this.orderByFullDayAsc = null;
    } else if (FieldName == 'Country') {
      this.orderByCountryAsc = !flag;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = null;
      this.orderByDescriptionNoteAsc = null;
      this.orderByFullDayAsc = null;
    } else if (FieldName == 'StartDate') {
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = !flag;
      this.orderByEndDateAsc = null;
      this.orderByDescriptionNoteAsc = null;
      this.orderByFullDayAsc = null;
    } else if (FieldName == 'EndDate') {
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = !flag;
      this.orderByDescriptionNoteAsc = null;
      this.orderByFullDayAsc = null;
    } else if (FieldName == 'IsHalfDay') {
      this.orderByCountryAsc = null;
      this.orderByStartDateAsc = null;
      this.orderByEndDateAsc = null;
      this.orderByDescriptionNoteAsc = null;
      this.orderByFullDayAsc = !flag;
    }

    this.holidayData = new Filter();
    this.holidayData.SearchString = `1=1 and CompanyId = ${this.companyId}`;
    this.holidayData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  uploadHolidayExcelPopup() {
    this.cleanFileHandler();
    $("#uploadHolidayExcelModal").modal('show');
  }

  cleanFileHandler() {
    event.stopPropagation();
    event.preventDefault();
    $("#uploadHolidayexcelreader").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.isDisable = true;
    this.isUploadFile = true;
  }

  excelfireBrowserFile() {
    $("#uploadHolidayexcelreader").click();
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.fileSize = (this.file.size / 1024).toFixed(2);
      this.fileName = this.file.name;
      this.isFileReady = true;
      this.isDisable = false;
      this.isUploadFile = false;
    }
  }

  uploadExcel() {
    this.isLoading = true;
    if (this.file) {
      let formData = new FormData();
      formData.append("holidaydata", this.file);
      this.http.post("CompanyCalender/UploadHolidayExcel", formData)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          let data = response.ResponseBody;
          if (data.length > 0) {
            this.bindData(data);
            $('#uploadHolidayExcelModal').modal('hide');
            this.cleanFileHandler();
            Toast("Data Uploaded successfull");
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
          ErrorToast("Unable to upload the data");
        }
      }).catch(e => {
        ErrorToast(e.HttpStatusMessage)
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      WarningToast("Please upload atleast one record");
    }
  }

  getHolidaySampleFile() {
    this.sampleFilePath = "https://www.emstum.com/bot/dn/Files/ApplicationFiles/SampleExcel/HolidaySample.xlsx";
    const a = document.createElement('a');
    a.href = this.sampleFilePath;
    a.download = 'HolidaySample.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(this.sampleFilePath);
  }

}
