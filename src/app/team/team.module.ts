import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { AppraisalSettingComponent } from './appraisal-setting/appraisal-setting.component';
import { NotificationComponent } from './notification/notification.component';
import { UtilModule } from '../util/util.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminmodalModule } from '../adminmodal/adminmodal.module';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';

@NgModule({
  declarations: [
    ApprovalRequestComponent,
    NotificationComponent,
    AppraisalSettingComponent
  ],
  imports: [
    CommonModule,
    TeamRoutingModule,
    UtilModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    AdminmodalModule,
    CommonmodalModule
  ]
})
export class TeamModule { }
