import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
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
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { HomeComponent } from './home/home.component';
import { CommonService } from 'src/providers/common-service/common.service';
import { DateFormatter } from 'src/providers/DateFormatter';
import { EmailComponent } from './email/email.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ManageEmailtemplateComponent } from './manage-emailtemplate/manage-emailtemplate.component';
import { AdminmodalModule } from './../adminmodal/adminmodal.module'
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { NgChartsModule } from 'ng2-charts';
import { CronJobComponent } from './cron-job/cron-job.component';
import { ManageCronjobComponent } from './manage-cronjob/manage-cronjob.component';

@NgModule({
  declarations: [
    AdminComponent,
    ManageemployeeComponent,
    BuildPdfComponent,
    ReplaceEmpty,
    EmployeesComponent,
    ClientsComponent,
    RegisterclientComponent,
    FilesComponent,
    BilldetailsComponent,
    HomeComponent,
    EmailComponent,
    EmailTemplateComponent,
    ManageEmailtemplateComponent,
    CronJobComponent,
    ManageCronjobComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    AdminmodalModule,
    CommonmodalModule,
    NgChartsModule
  ],
  providers: [
    CommonService,
    DateFormatter
  ]
})
export class AdminModule { }
