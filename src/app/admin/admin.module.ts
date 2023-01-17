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
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { NotificationComponent } from './notification/notification.component';
import { SettingsComponent } from './settings/settings.component';
import { CompanySettingsComponent } from './company-settings/company-settings.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { CompanyInfoComponent } from './company-info/company-info.component';
import { CommonService } from 'src/providers/common-service/common.service';
import { DateFormatter } from 'src/providers/DateFormatter';
import { SalaryBreakupComponent } from './salary-breakup/salary-breakup.component';
import { EmailComponent } from './email/email.component';
import { OrganizationComponent } from './organization/organization.component';
import { HolidayComponent } from './holiday/holiday.component';
import { EmailsettingComponent } from './emailsetting/emailsetting.component';
import { CompanyComponent } from './company/company.component';
import { ProjectsModule } from '../projects/projects.module';
import { IncomeDeclarationModule } from '../income-declaration/income-declaration.module';
import { LeaveManagementModule} from '../leave-management/leave-management.module';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailtemplateComponent } from './manage-emailtemplate/manage-emailtemplate.component';
import { EmployeePerformanceComponent } from './employee-performance/employee-performance.component';
import { CompanylogoComponent } from './companylogo/companylogo.component';
import { AnnexureComponent } from './annexure/annexure.component';
import { OfferletterComponent } from './offerletter/offerletter.component';
import { EmailConfigComponent } from './email-config/email-config.component';
import { EmaillinkconfigComponent } from './emaillinkconfig/emaillinkconfig.component';


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
    HomeComponent,
    TimesheetComponent,
    TaxcalculationComponent,
    ResetpasswordComponent,
    ApprovalRequestComponent,
    NotificationComponent,
    SettingsComponent,
    CompanySettingsComponent,
    ExpensesComponent,
    CompanyInfoComponent,
    SalaryBreakupComponent,
    EmailComponent,
    OrganizationComponent,
    HolidayComponent,
    EmailsettingComponent,
    CompanyComponent,
    EmailTemplateComponent,
    ManageEmailtemplateComponent,
    EmployeePerformanceComponent,
    CompanylogoComponent,
    AnnexureComponent,
    OfferletterComponent,
    EmailConfigComponent,
    EmaillinkconfigComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    ProjectsModule,
    LeaveManagementModule,
    IncomeDeclarationModule
  ],
  providers: [
    CommonService,
    DateFormatter
  ]
})
export class AdminModule { }
