import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminApprovalRequest,Performance, AdminNotification, Appraisal, ApprisalReview, ServiceRequest, ManageReview, ManageAppraisalCategory, FinalizeReview } from 'src/providers/constants';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { AppraisalSettingComponent } from './appraisal-setting/appraisal-setting.component';
import { ApprisalReviewComponent } from './apprisal-review/apprisal-review.component';
import {PerformanceComponent} from '../team/performance/performance.component'
import { ServiceRequestComponent } from './service-request/service-request.component';
import { ManageReviewComponent } from './manage-review/manage-review.component';
import { ManageAppraisalCategoryComponent } from './manage-appraisal-category/manage-appraisal-category.component';
import { FinalizeReviewComponent } from './finalize-review/finalize-review.component';

const routes: Routes = [
  { path: AdminNotification, component: NotificationComponent},
  { path: AdminApprovalRequest, component: ApprovalRequestComponent},
  { path: Appraisal, component: AppraisalSettingComponent},
  { path: ApprisalReview, component: ApprisalReviewComponent },
  { path: Performance, component: PerformanceComponent },
  { path: ServiceRequest, component: ServiceRequestComponent},
  { path: ManageReview, component: ManageReviewComponent},
  { path: ManageAppraisalCategory, component: ManageAppraisalCategoryComponent},
  { path: FinalizeReview, component: FinalizeReviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule { }
