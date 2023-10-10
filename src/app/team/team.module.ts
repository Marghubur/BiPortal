import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { AppraisalSettingComponent } from './appraisal-setting/appraisal-setting.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprisalReviewComponent } from './apprisal-review/apprisal-review.component';
import { UtilModule } from '../util/util.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminmodalModule } from '../adminmodal/adminmodal.module';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { PerformanceComponent } from './performance/performance.component';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { ManageReviewComponent } from './manage-review/manage-review.component';
import { ManageAppraisalCategoryComponent } from './manage-appraisal-category/manage-appraisal-category.component';

@NgModule({
  declarations: [
    ApprovalRequestComponent,
    NotificationComponent,
    AppraisalSettingComponent,
    ApprisalReviewComponent,
    PerformanceComponent,
    ServiceRequestComponent,
    ManageReviewComponent,
    ManageAppraisalCategoryComponent
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
