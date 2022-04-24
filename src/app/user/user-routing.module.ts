import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Declaration, Preferences, Profile, Salary, Summary, UserAttendance, UserDashboard, UserLeave, UserProfilePage, UserTimesheet } from 'src/providers/constants';
import { AttendanceComponent } from './attendance/attendance.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { MysalaryComponent } from './mysalary/mysalary.component';
import { ProfileComponent } from './profile/profile.component';
import { SummaryComponent } from './summary/summary.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { LeaveComponent } from './leave/leave.component';

const routes: Routes = [
  { path: '', component: UserDashboardComponent},
  { path: UserDashboard, component: UserDashboardComponent},
  { path: UserAttendance, component: AttendanceComponent},
  { path: Declaration, component: DeclarationComponent},
  { path: Salary, component: MysalaryComponent},
  { path: Summary, component: SummaryComponent},
  { path: Preferences, component: PreferencesComponent},
  { path: UserLeave, component: LeaveComponent},
  { path: UserTimesheet, component: TimesheetComponent},
  { path: UserProfilePage, component: ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
