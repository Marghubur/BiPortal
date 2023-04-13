import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRoutingModule } from './manage-routing.module';
import { ManageComponent } from './profile/profile.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { ManagetimesheetComponent } from './managetimesheet/managetimesheet.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';
import { UtilModule } from '../util/util.module';

@NgModule({
  declarations: [
    ManageComponent,
    AttendanceComponent,
    TimesheetComponent,
    ManagetimesheetComponent,
    HolidayComponent,
    ApplyLeaveComponent
  ],
  imports: [
    CommonModule,
    ManageRoutingModule,
    UtilModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgChartsModule
  ]
})
export class ManageModule { }
