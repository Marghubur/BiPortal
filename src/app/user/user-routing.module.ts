import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UserDashboard } from 'src/providers/constants';

const routes: Routes = [
  { path: '', component: UserDashboardComponent},
  { path: UserDashboard, component: UserDashboardComponent},
  // { path: UserAttendance, component: AttendanceComponent},
  // { path: UserLeave, component: LeaveComponent},
  // { path: UserTimesheet, component: TimesheetComponent},
  // { path: UserProfilePage, component: ProfileComponent},
  // { path: Taxcalculation, component: TaxcalculationComponent},
  // { path: Notification, component: NotificationComponent},
  // { path: ApprovalRequest, component: ApprovalRequestComponent},
  // { path: UserHoliday, component: HolidayComponent},
  // { path: ResetPassword, component: ResetpasswordComponent},
  // { path: ManageTimesheet, component: ManagetimesheetComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
