import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast } from 'src/providers/common-service/common.service';
import { AdminNotification, EmailLinkConfig } from 'src/providers/constants';
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
  selectedDays: Array<any> = [];
  isLoading: boolean = false;

  constructor(private fb: FormBuilder,
              private local: ApplicationStorage,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    this.days = [
      { day: 'Monday', id: 1, isEnabled: true },
      { day: 'Tuesday', id: 2, isEnabled: false  },
      { day: 'Wednesday', id: 3, isEnabled: false  },
      { day: 'Thusday', id: 4, isEnabled: false  },
      { day: 'Friday', id: 5, isEnabled: false  },
      { day: 'Saturday', id: 6, isEnabled: false  },
      { day: 'Sunday', id: 7, isEnabled: false  }
    ];
    this.mindate = {year: new Date().getFullYear(), month: 1, day: 1};
    this.maxdate = {year: new Date().getFullYear(), month: 12, day: 31};
    this.currentShift = new Shift();
    this.shiftData = new Filter();
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
        //this.loadData();
        //this.initForm();
      }
    }
    this.initForm();
    $('#manageShiftModal').modal('show');

  }

  toggleDays(id: number, e: any) {
    let item = this.days.find(x => x.id == id);
    let index = this.selectedDays.findIndex(x => x.id == id);
    if(index == -1) {
      this.selectedDays.push(item);
    } else {
      this.selectedDays.splice(index, 1);
    }
    let tag: any = e.target.querySelector('i').classList;
    if(item && tag) {
      if (tag.contains('v-hide')) {
        tag.remove('v-hide');
        item.isEnabled = true;
      } else {
        tag.add('v-hide');
        item.isEnabled = false;
      }
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', null);
    console.log("Handler removed.");
  }

  @HostListener('document:click', ['$event'])
  CloseSuggestionBox(e: any) {
    if (e.target.getAttribute('title') == "multi-select-box") {
      // do nothing
    } else {
      document.getElementById('auto-hide-box').classList.add('d-none');
    }
  }

  loadData() {

  }

  enableDropdown() {
    document.getElementById('auto-hide-box').classList.remove('d-none');
  }

  addShiftPopUp() {
    this.currentShift = new Shift();
    this.initForm();
    $('#manageShiftModal').modal('show');
  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, AdminNotification);
  }

  initForm() {
    this.shiftForm = this.fb.group({
      WorkShiftId: new FormControl(this.currentShift.WorkShiftId),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      Department: new FormControl(this.currentShift.Department, [Validators.required]),
      WorkFlowCode: new FormControl(this.currentShift.WorkFlowCode, [Validators.required]),
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
    if (this.shiftForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all the mandatory field");
      return;
    }
    if (this.selectedDays.length <=0) {
      this.isLoading = false;
      ErrorToast("Please add days first");
    }
    if (this.selectedDays.length > 0) {
      for (let i = 0; i < this.selectedDays.length; i++) {
        switch (this.selectedDays[i].id) {
          case 1:
            this.shiftForm.get('IsMon').setValue(true);
            break;
          case 2:
            this.shiftForm.get('IsTue').setValue(true);
            break;
          case 3:
            this.shiftForm.get('IsWed').setValue(true);
            break;
          case 4:
            this.shiftForm.get('IsThu').setValue(true);
            break;
          case 5:
            this.shiftForm.get('IsFri').setValue(true);
            break;
          case 6:
            this.shiftForm.get('IsSat').setValue(true);
            break;
          case 7:
            this.shiftForm.get('IsSun').setValue(true);
            break;
        }
      }
    }
    let value = this.shiftForm.value;
    this.http.post("", value).then(res => {
      if (res.ResponseBody) {
      $('#manageShiftModal').modal('hide');
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }
}

class Shift {
  WorkShiftId: number = 0;
  CompanyId: number = 0;
  Department: number = 0;
  WorkFlowCode: string = null;
  ShiftTitle: string = null;
  Description: string = null;
  IsMon: boolean = false;
  IsTue: boolean = false;
  IsThu: boolean = false;
  IsWed: boolean = false;
  IsFri: boolean = false;
  IsSat: boolean = false;
  IsSun: boolean = false;
  TotalWorkingDays: number = null;
  StartDate: Date = null;
  EndDate: Date = null;
  OfficeTime: string = null;
  Duration: number = null;
  LunchDuration: number = null;
  Status: number = 0;
  LastUpdatedOn: Date = null;
}
