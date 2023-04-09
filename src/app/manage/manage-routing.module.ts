import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLeave, AdminManageTimesheet, Attendance, Holiday, Profile, Timesheet } from 'src/providers/constants';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ManagetimesheetComponent } from './managetimesheet/managetimesheet.component';
import { ManageComponent } from './profile/profile.component';
import { TimesheetComponent } from './timesheet/timesheet.component';

const routes: Routes = [
  { path: Profile, component: ManageComponent},
  { path: Attendance, component: AttendanceComponent},
  { path: Timesheet, component: TimesheetComponent},
  { path: AdminManageTimesheet, component: ManagetimesheetComponent },
  { path: Holiday, component: HolidayComponent},
  { path: AdminLeave, component: ApplyLeaveComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
