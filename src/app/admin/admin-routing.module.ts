import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminResetPassword,
  Attendance,
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
  Profile,
  Recent,
  Recruiter,
  RegisterClient,
  Resume,
  Roles,
  Timesheet,
  AdminTaxcalculation,
  AdminNotification,
  AdminApprovalRequest,
  PayrollSettings,
  CompanySettings,
  Expenses,
  CompanyInfo,
  SalaryComponentStructure,
  CustomSalaryStructure,
  SalaryBreakup,
  EmailService,
  OrganizationSetting,
  Holiday,
  EmailSetting,
  MenuSetting,
  Company,
  EmailTemplate,
  ManageEmailTemplate,
  EmployeePerformance,
  CompanyLogo,
  Annexure,
  OfferLetter
} from 'src/providers/constants';
import { HomeComponent } from './home/home.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ClientsComponent } from './clients/clients.component';
import { documentsComponent } from './documents/documents.component';
import { documentspageComponent } from './documentspage/documentspage.component';
import { EmployeesComponent } from './employees/employees.component';
import { FilesComponent } from './files/files.component';
import { ManageComponent } from './profile/profile.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { RecentComponent } from './recent/recent.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { ResumeComponent } from './resume/resume.component';
import { RolesComponent } from './roles/roles.component';
import { CompaniesComponent} from './companies/companies.component';
import { CreateResumeComponent } from './create-resume/create-resume.component';
import { RecruiterComponent } from './recruiter/recruiter.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { SettingsComponent } from './settings/settings.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { CustomsalaryStructureComponent } from './customsalary-structure/customsalary-structure.component';
import { SalaryBreakupComponent } from './salary-breakup/salary-breakup.component';
import { EmailComponent } from './email/email.component';
import { OrganizationComponent } from './organization/organization.component';
import { HolidayComponent } from './holiday/holiday.component';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { MenusettingComponent } from './menusetting/menusetting.component';
import { CompanyComponent } from './company/company.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailtemplateComponent } from './manage-emailtemplate/manage-emailtemplate.component';
import { EmployeePerformanceComponent } from './employee-performance/employee-performance.component';
import { CompanylogoComponent } from './companylogo/companylogo.component';
import { AnnexureComponent } from './annexure/annexure.component';
import { OfferletterComponent } from './offerletter/offerletter.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: Dashboard, component: HomeComponent },
  { path: Employees, component: EmployeesComponent},
  { path: ManageEmployee, component: ManageemployeeComponent },
  { path: Documents, component: documentsComponent },
  { path: DocumentsPage, component: documentspageComponent },
  { path: Clients, component: ClientsComponent },
  { path: RegisterClient, component: RegisterclientComponent },
  { path: BuildPdf, component: BuildPdfComponent },
  { path: Files, component: FilesComponent },
  { path: Resume, component: ResumeComponent },
  { path: BillDetail, component: BilldetailsComponent},
  { path: Attendance, component: AttendanceComponent},
  { path: Profile, component: ManageComponent},
  { path: Recent, component: RecentComponent},
  { path: Roles, component: RolesComponent },
  { path: Companies, component: CompaniesComponent},
  { path: CreateResume, component: CreateResumeComponent},
  { path: Recruiter, component: RecruiterComponent},
  { path: Timesheet, component: TimesheetComponent},
  { path: AdminResetPassword, component: ResetpasswordComponent},
  { path: AdminNotification, component: NotificationComponent},
  { path: AdminApprovalRequest, component: ApprovalRequestComponent},
  { path: PayrollSettings, component: SettingsComponent},
  { path: CompanySettings, component: CompanySettingsComponent},
  { path: CompanyInfo, component: CompanyInfoComponent},
  { path: Expenses, component: ExpensesComponent},
  { path: AdminTaxcalculation, component: TaxcalculationComponent},
  { path: SalaryComponentStructure, component: SalarycomponentStructureComponent},
  { path: CustomSalaryStructure, component: CustomsalaryStructureComponent},
  { path: SalaryBreakup, component: SalaryBreakupComponent},
  { path: EmailService, component: EmailComponent},
  { path: OrganizationSetting, component: OrganizationComponent},
  { path: Holiday, component: HolidayComponent},
  { path: EmailSetting, component: EmailsettingComponent},
  { path: MenuSetting, component: MenusettingComponent},
  { path: Company, component: CompanyComponent},
  { path: EmailTemplate, component: EmailTemplateComponent},
  { path: ManageEmailTemplate, component: ManageEmailtemplateComponent},
  { path: EmployeePerformance, component: EmployeePerformanceComponent},
  { path: CompanyLogo, component: CompanylogoComponent},
  { path: Annexure, component: AnnexureComponent},
  { path: OfferLetter, component: OfferletterComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
