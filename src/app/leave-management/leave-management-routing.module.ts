import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLeave, Leave, ManageLeavePlan, ManageYearEnding } from 'src/providers/constants';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { LeaveComponent } from './leave/leave.component';
import { ManageLeaveplanComponent } from './manage-leaveplan/manage-leaveplan.component';
import { ManageYearEndingComponent } from './manage-year-ending/manage-year-ending.component';

const routes: Routes = [
  { path: Leave, component: LeaveComponent},
  { path: ManageLeavePlan, component: ManageLeaveplanComponent},
  { path: ManageYearEnding, component: ManageYearEndingComponent},
  { path: AdminLeave, component: ApplyLeaveComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
