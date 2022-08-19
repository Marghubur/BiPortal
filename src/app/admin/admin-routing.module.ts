import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminResetPassword, AdminDeclaration,
  AdminForm12B,
  AdminFreeTaxFilling,
  AdminPreferences,
  AdminPreviousIncome,
  AdminSalary,
  AdminSummary,
  AdminTaxSavingInvestment,
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
  Leave,
  ManageEmployee,
  Profile,
  Recent,
  Recruiter,
  RegisterClient,
  Resume,
  Roles,
  Timesheet,
  AdminIncomeTax,
  AdminPaySlip,
  AdminTaxcalculation,
  AdminNotification,
  AdminApprovalRequest,
  Settings,
  CompanySettings,
  Payroll,
  LeavesAndHoliday,
  Expenses,
  PFESISetup,
  CompanyInfo,
  CompanyDetail,
  CompanyAccounts,
  SalaryComponentStructure,
  CustomSalaryStructure,
  PayrollComponents,
  ManageLeavePlan,
  ManageYearEnding,
  SalaryBreakup,
  EmailService
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
import { LeaveComponent } from './leave/leave.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { SummaryComponent } from './summary/summary.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { SalaryComponent } from './salary/salary.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { Form12BbComponent } from './form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from './freetaxfilling/freetaxfilling.component';
import { TaxsavinginvestmentComponent } from './taxsavinginvestment/taxsavinginvestment.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { PayslipComponent } from './payslip/payslip.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { SettingsComponent } from './settings/settings.component';
import { CompaySettingsComponent } from './compay-settings/compay-settings.component';
import { PayrollComponent } from './payroll/payroll.component';
import { LeavesAndHolidaysComponent } from './leaves-and-holidays/leaves-and-holidays.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { PfEsiSetupComponent } from './pf-esi-setup/pf-esi-setup.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { CompanyAccountsComponent } from './company-accounts/company-accounts.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { CustomsalaryStructureComponent } from './customsalary-structure/customsalary-structure.component';
import { PayrollComponentsComponent } from './payroll-components/payroll-components.component';
import { ManageLeaveplanComponent } from './manage-leaveplan/manage-leaveplan.component';
import { ManageYearEndingComponent } from './manage-year-ending/manage-year-ending.component';
import { SalaryBreakupComponent } from './salary-breakup/salary-breakup.component';
import { EmailComponent } from './email/email.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: Dashboard, component: HomeComponent },
  { path: ManageEmployee, component: ManageemployeeComponent },
  { path: Employees, component: EmployeesComponent },
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
  { path: AdminSummary, component: SummaryComponent},
  { path: AdminPreferences, component: PreferencesComponent},
  { path: AdminSalary, component: SalaryComponent},
  { path: AdminDeclaration, component: DeclarationComponent},
  { path: Leave, component: LeaveComponent},
  { path: AdminPreviousIncome, component: PreviousincomeComponent},
  { path: AdminForm12B, component: Form12BbComponent},
  { path: AdminFreeTaxFilling, component: FreetaxfillingComponent},
  { path: AdminTaxSavingInvestment, component: TaxsavinginvestmentComponent},
  { path: AdminResetPassword, component: ResetpasswordComponent},
  { path: AdminIncomeTax, component: IncometaxComponent},
  { path: AdminPaySlip, component: PayslipComponent},
  { path: AdminNotification, component: NotificationComponent},
  { path: AdminApprovalRequest, component: ApprovalRequestComponent},
  { path: Settings, component: SettingsComponent},
  { path: CompanySettings, component: CompaySettingsComponent},
  { path: CompanyInfo, component: CompanyInfoComponent},
  { path: Payroll, component: PayrollComponent},
  { path: LeavesAndHoliday, component: LeavesAndHolidaysComponent},
  { path: PFESISetup, component: PfEsiSetupComponent},
  { path: Expenses, component: ExpensesComponent},
  { path: CompanyDetail, component: CompanyDetailComponent},
  { path: CompanyAccounts, component: CompanyAccountsComponent},
  { path: AdminTaxcalculation, component: TaxcalculationComponent},
  { path: SalaryComponentStructure, component: SalarycomponentStructureComponent},
  { path: CustomSalaryStructure, component: CustomsalaryStructureComponent},
  { path: PayrollComponents, component: PayrollComponentsComponent},
  { path: ManageLeavePlan, component: ManageLeaveplanComponent},
  { path: ManageYearEnding, component: ManageYearEndingComponent},
  { path: SalaryBreakup, component: SalaryBreakupComponent},
  { path: EmailService, component: EmailComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
