import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgRoutingModule } from './org-routing.module';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { SettingsComponent } from './settings/settings.component';
import { OrganizationComponent } from './organization/organization.component';
import { MasterDataComponent } from './master-data/master-data.component';
import { OrgStructureComponent } from './org-structure/org-structure.component';
import { CompaniesComponent } from './companies/companies.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CompanyComponent } from './company/company.component';
import { CompanylogoComponent } from './companylogo/companylogo.component';
import { RolesComponent } from './roles/roles.component';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '../util/util.module';
import { CronjobSettingComponent } from './cronjob-setting/cronjob-setting.component';


@NgModule({
  declarations: [    
    CompaniesComponent,
    TaxcalculationComponent,
    ResetpasswordComponent,
    SettingsComponent,
    CompanySettingsComponent,
    CompanyInfoComponent,
    OrganizationComponent,
    CompanyComponent,
    CompanylogoComponent,
    MasterDataComponent,
    OrgStructureComponent,
    RolesComponent,
    EmailsettingComponent,
    CronjobSettingComponent
  ],
  imports: [
    CommonModule,
    OrgRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
  ]
})
export class OrgModule { }
