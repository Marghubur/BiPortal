import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
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

  constructor(private fb: FormBuilder,
              private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data) {
      this.currentCompany = data;
      this.companySetting.CompanyId = this.currentCompany.CompanyId;
      this.isPageReady = true;
    }
    else {
      this.isPageReady = false;
      ErrorToast("Company information doesn't found. Please contact to admin.");
    }
    this.initForm();
  }

  initForm() {
    this.companySettingForm = this.fb.group({
      SettingId: new FormControl(this.companySetting.SettingId),
      CompanyId: new FormControl(this.companySetting.CompanyId),
      ProbationPeriodInDays: new FormControl(this.companySetting.ProbationPeriodInDays),
      NoticePeriodInDays: new FormControl(this.companySetting.NoticePeriodInDays)
    })
  }

  saveSetting() {
    let value = this.companySettingForm.value;
    if (value.CompanyId > 0) {
      this.isLoading = true;
      console.log(value)
      this.http.post("", value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
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
}

export class CompanySetting {
  SettingId: number = 0;
  CompanyId: number = 0;
  ProbationPeriodInDays: number = 0;
  NoticePeriodInDays: number = 0;

}
