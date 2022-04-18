import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAttendance, UserDashboard, UserProfilePage } from 'src/providers/constants';
import { AttendanceComponent } from './attendance/attendance.component';
import { ProfileComponent } from './profile/profile.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

const routes: Routes = [
  { path: '', component: UserDashboardComponent},
  { path: UserDashboard, component: UserDashboardComponent},
  { path: UserAttendance, component: AttendanceComponent},
  { path: UserProfilePage, component: ProfileComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
