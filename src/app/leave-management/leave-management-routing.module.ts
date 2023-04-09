import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Leave, ManageLeavePlan, ManageYearEnding } from 'src/providers/constants';
import { LeaveComponent } from './leave/leave.component';
import { ManageLeaveplanComponent } from './manage-leaveplan/manage-leaveplan.component';
import { ManageYearEndingComponent } from './manage-year-ending/manage-year-ending.component';

const routes: Routes = [
  { path: Leave, component: LeaveComponent},
  { path: ManageLeavePlan, component: ManageLeaveplanComponent},
  { path: ManageYearEnding, component: ManageYearEndingComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveManagementRoutingModule { }
