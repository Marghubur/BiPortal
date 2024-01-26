import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from '../org/roles/roles.component';
import { CompaniesComponent} from '../org/companies/companies.component';
import { ResetpasswordComponent } from '../org/resetpassword/resetpassword.component';
import { TaxcalculationComponent } from '../org/taxcalculation/taxcalculation.component';
import { SettingsComponent } from '../org/settings/settings.component';
import { CompanySettingsComponent } from '../org/company-settings/company-settings.component';
import { CompanyInfoComponent } from '../org/company-info/company-info.component';
import { OrganizationComponent } from '../org/organization/organization.component';
import { CompanyComponent } from '../org/company/company.component';
import { CompanylogoComponent } from '../org/companylogo/companylogo.component';
import { MasterDataComponent } from '../org/master-data/master-data.component';
import { OrgStructureComponent } from '../org/org-structure/org-structure.component';

import {
  Roles,
  AdminTaxcalculation,
  PayrollSettings,
  CompanySettings,
  CompanyInfo,
  OrganizationSetting,
  Company,
  CompanyLogo,
  AdminMasterData,
  OrganizationStruct,
  Companies,
  AdminResetPassword,
  EmailSetting,
  CronJobSetting,
} from 'src/providers/constants';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { CronjobSettingComponent } from './cronjob-setting/cronjob-setting.component';

const routes: Routes = [
  { path: Roles, component: RolesComponent },
  { path: Companies, component: CompaniesComponent},
  { path: AdminResetPassword, component: ResetpasswordComponent},
  { path: PayrollSettings, component: SettingsComponent},
  { path: CompanySettings, component: CompanySettingsComponent},
  { path: CompanyInfo, component: CompanyInfoComponent},
  { path: AdminTaxcalculation, component: TaxcalculationComponent},
  { path: OrganizationSetting, component: OrganizationComponent},
  { path: Company, component: CompanyComponent},
  { path: CompanyLogo, component: CompanylogoComponent},
  { path: AdminMasterData, component: MasterDataComponent },
  { path: OrganizationStruct, component: OrgStructureComponent },
  { path: EmailSetting, component: EmailsettingComponent},
  { path: CronJobSetting, component: CronjobSettingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrgRoutingModule { }
