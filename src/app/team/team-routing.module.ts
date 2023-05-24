import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminApprovalRequest, AdminNotification, Appraisal } from 'src/providers/constants';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { AppraisalSettingComponent } from './appraisal-setting/appraisal-setting.component';

const routes: Routes = [
  { path: AdminNotification, component: NotificationComponent},
  { path: AdminApprovalRequest, component: ApprovalRequestComponent},
  { path: Appraisal, component: AppraisalSettingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule { }
