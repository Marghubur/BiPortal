import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { documentspageComponent } from './documentspage/documentspage.component';
import { documentsComponent } from './documents/documents.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '../util/util.module';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ReplaceEmpty } from '../../../src/pipes/ReplaceEmpty';
import { EmployeesComponent } from './employees/employees.component';
import { ClientsComponent } from './clients/clients.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { FilesComponent } from './files/files.component';
import { ResumeComponent } from './resume/resume.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { HomeComponent } from './home/home.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { ManageComponent } from './profile/profile.component';
import { RecentComponent } from './recent/recent.component';
import { RolesComponent } from './roles/roles.component';
import { CreateResumeComponent } from './create-resume/create-resume.component';
import { CompaniesComponent } from './companies/companies.component';
import { RecruiterComponent } from './recruiter/recruiter.component';
import { LeaveComponent } from './leave/leave.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { SummaryComponent } from './summary/summary.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { SalaryComponent } from './salary/salary.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { Form12BbComponent } from './form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from './freetaxfilling/freetaxfilling.component';
import { TaxsavinginvestmentComponent } from './taxsavinginvestment/taxsavinginvestment.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { PayslipComponent } from './payslip/payslip.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { NotificationComponent } from './notification/notification.component';
import { SettingsComponent } from './settings/settings.component';
import { CompaySettingsComponent } from './compay-settings/compay-settings.component';
import { PayrollComponent } from './payroll/payroll.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { PfEsiSetupComponent } from './pf-esi-setup/pf-esi-setup.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { CompanyAccountsComponent } from './company-accounts/company-accounts.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { CustomsalaryStructureComponent } from './customsalary-structure/customsalary-structure.component';
import { PayrollComponentsComponent } from './payroll-components/payroll-components.component';
import { CommonService } from 'src/providers/common-service/common.service';
import { DateFormatter } from 'src/providers/DateFormatter';
import { ManageLeaveplanComponent } from './manage-leaveplan/manage-leaveplan.component';
import { ManageYearEndingComponent } from './manage-year-ending/manage-year-ending.component';
import { SalaryBreakupComponent } from './salary-breakup/salary-breakup.component';
import { EmailComponent } from './email/email.component';
import { OrganizationComponent } from './organization/organization.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ProjectComponent } from './project/project.component';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { MenusettingComponent } from './menusetting/menusetting.component';
import { CompanyComponent } from './company/company.component';

@NgModule({
  declarations: [
    AdminComponent,
    documentspageComponent,
    documentsComponent,
    ManageemployeeComponent,
    BuildPdfComponent,
    ReplaceEmpty,
    EmployeesComponent,
    ClientsComponent,
    RegisterclientComponent,
    FilesComponent,
    ResumeComponent,
    BilldetailsComponent,
    HomeComponent,
    AttendanceComponent,
    ManageComponent,
    RecentComponent,
    RolesComponent,
    CreateResumeComponent,
    RecruiterComponent,
    CompaniesComponent,
    LeaveComponent,
    HomeComponent,
    TimesheetComponent,
    SummaryComponent,
    DeclarationComponent,
    SalaryComponent,
    PreferencesComponent,
    PreviousincomeComponent,
    Form12BbComponent,
    FreetaxfillingComponent,
    TaxsavinginvestmentComponent,
    TaxcalculationComponent,
    ResetpasswordComponent,
    IncometaxComponent,
    PayslipComponent,
    ApprovalRequestComponent,
    NotificationComponent,
    SettingsComponent,
    CompaySettingsComponent,
    PayrollComponent,
    ExpensesComponent,
    PfEsiSetupComponent,
    CompanyInfoComponent,
    CompanyDetailComponent,
    CompanyAccountsComponent,
    SalarycomponentStructureComponent,
    CustomsalaryStructureComponent,
    PayrollComponentsComponent,
    ManageLeaveplanComponent,
    ManageYearEndingComponent,
    SalaryBreakupComponent,
    EmailComponent,
    OrganizationComponent,
    HolidayComponent,
    ProjectComponent,
    EmailsettingComponent,
    MenusettingComponent,
    CompanyComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule
  ],
  providers: [
    CommonService,
    DateFormatter
  ]
})
export class AdminModule { }
