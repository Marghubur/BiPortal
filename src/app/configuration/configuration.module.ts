import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '../util/util.module';
import { AdminmodalModule } from '../adminmodal/adminmodal.module';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { OfferletterComponent } from './offerletter/offerletter.component';
import { AnnexureComponent } from './annexure/annexure.component';
import { ConfigPerformanceComponent } from './config-performance/config-performance.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ManageWorkFlowComponent } from './manage-work-flow/manage-work-flow.component';
import { ManageshiftComponent } from './manageshift/manageshift.component';
import { ProductsComponent } from './products/products.component';
import { EmailConfigComponent } from './email-config/email-config.component';
import { ProcessingPayrollComponent } from './processing-payroll/processing-payroll.component';
import { LeaveAttendanceDailywagesComponent } from './leave-attendance-dailywages/leave-attendance-dailywages.component';

@NgModule({
  declarations: [
    OfferletterComponent,
    AnnexureComponent,
    ConfigPerformanceComponent,
    WorkflowComponent,
    ManageWorkFlowComponent,
    ManageshiftComponent,
    ProductsComponent,
    EmailConfigComponent,
    ProcessingPayrollComponent,
    LeaveAttendanceDailywagesComponent
  ],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    AdminmodalModule,
    CommonmodalModule,
  ]
})
export class ConfigurationModule { }
