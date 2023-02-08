import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
      this.isPageReady = true;
    }).then(e => {
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
      AttendanceSubmissionLimit: new FormControl(this.companySetting.AttendanceSubmissionLimit),
      DefaultManager: this.buildManager()
    })
  }

  buildManager(): FormArray {
    let data = [];
    if (this.companySetting.DefaultManagers && this.companySetting.DefaultManagers != "")
      data = JSON.parse(this.companySetting.DefaultManagers);
    let dataArray = this.fb.array([]);
    if (data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(
          this.fb.group({
            ManagerId: new FormControl(data[i])
          })
        )
        i++;
      }
    } else {
      dataArray.push(this.createDefaultManager())
    }
    return dataArray;
  }

  createDefaultManager(): FormGroup {
    return this.fb.group({
      ManagerId: new FormControl(0)
    })
  }

  get ManagerControl() {
    return this.companySettingForm.get('DefaultManager') as FormArray;
  }

  addManagerLevel() {
    let item = this.companySettingForm.get('DefaultManager') as FormArray;
    item.push(this.createDefaultManager());
  }

  removeManagerLevel(index: number) {
    let item = this.companySettingForm.get('DefaultManager') as FormArray;
    if (item.length > 1) {
      item.removeAt(index);
    }
  }

  saveSetting() {
    let value = this.companySettingForm.value;
    if (value.CompanyId > 0) {
      this.isLoading = true;
      value.ManagerLevelId = value.DefaultManager.map( x=> x.ManagerId);
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
}

export class CompanySetting {
  SettingId: number = 0;
  CompanyId: number = 0;
  ProbationPeriodInDays: number = 0;
  NoticePeriodInDays: number = 0;
  IsPrimary: boolean = true;
  DeclarationStartMonth: number = 0;
  DeclarationEndMonth: number = 0;
  FinancialYear: number = 0;
  DefaultManagers: string = "";
  AttendanceSubmissionLimit: number = null;
}
