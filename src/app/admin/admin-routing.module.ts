import { RouterModule, Routes } from '@angular/router';
import {
  BillDetail,
  BuildPdf,
  Clients,
  Dashboard,
  Employees,
  Files,
  ManageEmployee,
  RegisterClient,
  EmailService,
  EmailTemplate,
  ManageEmailTemplate,
  ManageCronJob,
  CronJob,
  InitialSetup,
} from 'src/providers/constants';
import { HomeComponent } from './home/home.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ClientsComponent } from './clients/clients.component';
import { EmployeesComponent } from './employees/employees.component';
import { FilesComponent } from './files/files.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { EmailComponent } from './email/email.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailtemplateComponent } from './manage-emailtemplate/manage-emailtemplate.component';
import { NgModule } from '@angular/core';
import { CronJobComponent } from './cron-job/cron-job.component';
import { ManageCronjobComponent } from './manage-cronjob/manage-cronjob.component';
import { InitialSetupComponent } from './initial-setup/initial-setup.component';

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
  { path: EmailService, component: EmailComponent},
  { path: EmailTemplate, component: EmailTemplateComponent},
  { path: ManageEmailTemplate, component: ManageEmailtemplateComponent},
  { path: ManageCronJob, component: ManageCronjobComponent},
  { path: CronJob, component: CronJobComponent},
  { path: InitialSetup, component: InitialSetupComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
