import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
    })
  }

  saveSetting() {
    let value = this.companySettingForm.value;
    if (value.CompanyId > 0) {
      this.isLoading = true;
      this.http.put(`company/UpdateSetting/${value.CompanyId}`, value).then((res:ResponseModel) => {
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

  activeTab(e: any, index: number) {
    this.isReady = false;
    this.menuIndex = index;
    let elem = document.querySelectorAll('li[data-name="activetab"]');
    if (elem.length > 0) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-tab');
      }
      e.target.classList.add('active-tab');
    }
    this.isReady = true;
  }
}
