import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompanySetting } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
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
  months: Array<any> = [
    { "num": 0, "value": "January" },
    { "num": 1, "value": "Febuary" },
    { "num": 2, "value": "March" },
    { "num": 3, "value": "April" },
    { "num": 4, "value": "May" },
    { "num": 5, "value": "June" },
    { "num": 6, "value": "July" },
    { "num": 7, "value": "August" },
    { "num": 8, "value": "September" },
    { "num": 9, "value": "October" },
    { "num": 10, "value": "November" },
    { "num": 11, "value": "December" }
  ];

  constructor(private fb: FormBuilder,
              private local: ApplicationStorage,
              private nav: iNavigation,
              private http: AjaxService) { }

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
      this.companySetting.CompanyId = this.currentCompany.CompanyId;
      this.loadPageData();
    }else {
      ErrorToast("Company information doesn't found. Please contact to admin.");
    }
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
      IsRunLeaveAccrual: new FormControl(false)
    })
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

  runPayroll() {
    this.isLoading = true;
    this.http.get(`Company/RunPayroll/${this.payRollMonth}`, false).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast(res.ResponseBody);
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
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
}
