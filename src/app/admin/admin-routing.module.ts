import { RouterModule, Routes } from '@angular/router';
import { AdminResetPassword,
  BillDetail,
  BuildPdf,
  Clients,
  Companies,
  CreateResume,
  Dashboard,
  Documents,
  DocumentsPage,
  Employees,
  Files,
  ManageEmployee,
  Recent,
  Recruiter,
  RegisterClient,
  Roles,
  AdminTaxcalculation,
  PayrollSettings,
  CompanySettings,
  Expenses,
  CompanyInfo,
  SalaryBreakup,
  EmailService,
  OrganizationSetting,
  EmailSetting,
  Company,
  EmailTemplate,
  ManageEmailTemplate,
  CompanyLogo,
  EmailLinkConfig,
  AdminMasterData,
} from 'src/providers/constants';
import { HomeComponent } from './home/home.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ClientsComponent } from './clients/clients.component';
import { EmployeesComponent } from './employees/employees.component';
import { FilesComponent } from './files/files.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { RecentComponent } from './recent/recent.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { RolesComponent } from './roles/roles.component';
import { CompaniesComponent} from './companies/companies.component';
import { CreateResumeComponent } from './create-resume/create-resume.component';
import { RecruiterComponent } from './recruiter/recruiter.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { SettingsComponent } from './settings/settings.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { SalaryBreakupComponent } from './salary-breakup/salary-breakup.component';
import { EmailComponent } from './email/email.component';
import { OrganizationComponent } from './organization/organization.component';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { CompanyComponent } from './company/company.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailtemplateComponent } from './manage-emailtemplate/manage-emailtemplate.component';
import { CompanylogoComponent } from './companylogo/companylogo.component';
import { EmaillinkconfigComponent } from './emaillinkconfig/emaillinkconfig.component';
import { MasterDataComponent } from './master-data/master-data.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: Dashboard, component: HomeComponent },
  { path: Employees, component: EmployeesComponent},
  { path: ManageEmployee, component: ManageemployeeComponent },
  { path: Clients, component: ClientsComponent },
  { path: RegisterClient, component: RegisterclientComponent },
  { path: BuildPdf, component: BuildPdfComponent },
  { path: Files, component: FilesComponent },
  { path: BillDetail, component: BilldetailsComponent},
  { path: Recent, component: RecentComponent},
  { path: Roles, component: RolesComponent },
  { path: Companies, component: CompaniesComponent},
  { path: CreateResume, component: CreateResumeComponent},
  { path: Recruiter, component: RecruiterComponent},
  { path: AdminResetPassword, component: ResetpasswordComponent},
  { path: PayrollSettings, component: SettingsComponent},
  { path: CompanySettings, component: CompanySettingsComponent},
  { path: CompanyInfo, component: CompanyInfoComponent},
  { path: Expenses, component: ExpensesComponent},
  { path: AdminTaxcalculation, component: TaxcalculationComponent},
  { path: SalaryBreakup, component: SalaryBreakupComponent},
  { path: EmailService, component: EmailComponent},
  { path: OrganizationSetting, component: OrganizationComponent},
  { path: EmailSetting, component: EmailsettingComponent},
  { path: EmailLinkConfig, component: EmaillinkconfigComponent},
  { path: Company, component: CompanyComponent},
  { path: EmailTemplate, component: EmailTemplateComponent},
  { path: ManageEmailTemplate, component: ManageEmailtemplateComponent},
  { path: CompanyLogo, component: CompanylogoComponent},
  { path: AdminMasterData, component: MasterDataComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
