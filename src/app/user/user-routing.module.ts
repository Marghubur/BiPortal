import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalRequest, Notification, ResetPassword, Taxcalculation, UserAttendance, UserDashboard, UserLeave, UserProfilePage, UserTimesheet, UserHoliday, ManageTimesheet, UserDocuments, UserDocumentsPage} from 'src/providers/constants';
import { AttendanceComponent } from './attendance/attendance.component';
import { ProfileComponent } from './profile/profile.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { LeaveComponent } from './leave/leave.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ManagetimesheetComponent } from './managetimesheet/managetimesheet.component';

const routes: Routes = [
  { path: '', component: UserDashboardComponent},
  { path: UserDashboard, component: UserDashboardComponent},
  { path: UserAttendance, component: AttendanceComponent},
  { path: UserLeave, component: LeaveComponent},
  { path: UserTimesheet, component: TimesheetComponent},
  { path: UserProfilePage, component: ProfileComponent},
  { path: Taxcalculation, component: TaxcalculationComponent},
  { path: Notification, component: NotificationComponent},
  { path: ApprovalRequest, component: ApprovalRequestComponent},
  { path: UserHoliday, component: HolidayComponent},
  { path: ResetPassword, component: ResetpasswordComponent},
  { path: ManageTimesheet, component: ManagetimesheetComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
