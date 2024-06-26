import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompanySetting } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-company-settings',
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
  companySettingForm: FormGroup;
  companySetting: CompanySetting = new CompanySetting();
  currentCompany: any = null;
  isPageReady: boolean  = false;
  isLoading: boolean = false;
  roles: Array<any> = [];
  menuIndex: number = 1;
  isReady: boolean = false;
  payRollMonth: number = 0;
  days: Array<number> = [];
  selectedExcludePayroll: string = "";

  constructor(private fb: FormBuilder,
              private local: ApplicationStorage,
              private nav: iNavigation,
              private http: CoreHttpService) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (!data) {
      let item = this.local.findRecord("Companies");
      data = item.find(x => x.IsPrimaryCompany == 1);
    }
    if (data) {
      this.currentCompany = data;
      if(this.currentCompany.CompanyId == 0) {
        ErrorToast("Please selecte company first.");
        return;
      }
      for (let i = 1; i <= 31; i++) {
        this.days.push(i);
      }
      this.companySetting.CompanyId = this.currentCompany.CompanyId;
      this.loadPageData();
    }else {
      ErrorToast("Company information doesn't found. Please contact to admin.");
    }
  }

  pageReload() {
    this.loadPageData();
  }

  loadPageData() {
    this.http.get(`company/getcompanysettingdetail/${this.currentCompany.CompanyId}`).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.buildPage(res.ResponseBody)
      }
      this.isReady = true;
      this.isPageReady = true;
    }).then(e => {
      this.isReady = true;
      this.isPageReady = true;
    })
  }

  buildPage(res) {
    if (res.companySettingDetail)
      this.companySetting = res.companySettingDetail;

    if (res.roles)
      this.roles = res.roles;

    this.initForm();
    this.changeExcludePayrollDate();
  }

  initForm() {
    this.companySettingForm = this.fb.group({
      SettingId: new FormControl(this.companySetting.SettingId),
      CompanyId: new FormControl(this.companySetting.CompanyId),
      ProbationPeriodInDays: new FormControl(this.companySetting.ProbationPeriodInDays),
      NoticePeriodInDays: new FormControl(this.companySetting.NoticePeriodInDays),
      IsPrimary: new FormControl(this.companySetting.IsPrimary),
      DeclarationStartMonth: new FormControl(this.companySetting.DeclarationStartMonth),
      DeclarationEndMonth: new FormControl(this.companySetting.DeclarationEndMonth),
      FinancialYear: new FormControl(this.companySetting.FinancialYear),
      LeaveAccrualRunCronDayOfMonth: new FormControl(this.companySetting.LeaveAccrualRunCronDayOfMonth),
      EveryMonthLastDayOfDeclaration: new FormControl(this.companySetting.EveryMonthLastDayOfDeclaration),
      AttendanceSubmissionLimit: new FormControl(this.companySetting.AttendanceSubmissionLimit),
      IsJoiningBarrierDayPassed: new FormControl(this.companySetting.IsJoiningBarrierDayPassed),
      IsRunLeaveAccrual: new FormControl(false),
      ExcludePayrollFromJoinDate: new FormControl(this.companySetting.ExcludePayrollFromJoinDate != null ? this.companySetting.ExcludePayrollFromJoinDate : 20)
    })
  }

  get f() {
    return this.companySettingForm.controls;
  }

  selectDeclartionStartMonth(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      let month = 0;
      if (value == 1)
        month = 12;
      else
        month = value - 1;

      this.companySettingForm.get('DeclarationEndMonth').setValue(month);
    }
  }

  saveSetting() {
    let value = this.companySettingForm.value;
    if (value.CompanyId > 0) {
      this.isLoading = true;
      this.http.put(`company/UpdateSetting/${value.CompanyId}/${value.IsRunLeaveAccrual}`, value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.companySetting = res.ResponseBody;
          this.initForm();
          this.isLoading = false;
          Toast("Setting save successfully")
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
    else
      ErrorToast("Please select company first.");
  }

  activeTab(index: number) {
    this.isReady = false;
    this.menuIndex = index;
    let elem = document.querySelectorAll('li[data-name="activetab"]');
    if (elem.length > 0) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-tab');
      }
      elem[index-1].classList.add('active-tab');
    }
    this.isReady = true;
  }

  changeExcludePayrollDate() {
    let value = Number(this.companySettingForm.get("ExcludePayrollFromJoinDate").value);
    let postValue = (value == (1 || 21 || 31)) ? 'st' : (value == (2 || 22)) ? 'nd' : value == 3 ? 'rd' : 'th';
    this.selectedExcludePayroll = value.toString() + ""+ postValue;
  }
}
