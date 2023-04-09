import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminApprovalRequest, AdminNotification } from 'src/providers/constants';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';

const routes: Routes = [
  { path: AdminNotification, component: NotificationComponent},
  { path: AdminApprovalRequest, component: ApprovalRequestComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule { }
