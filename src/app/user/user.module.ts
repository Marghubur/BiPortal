import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { ProfileComponent } from './profile/profile.component';
import { UserIncomeDeclarationModule } from '../user-income-declaration/user-income-declaration.module';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TimesheetComponent } from './timesheet/timesheet.component';
import { LeaveComponent } from './leave/leave.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { CommonService } from 'src/providers/common-service/common.service';
import { HolidayComponent } from './holiday/holiday.component';
import { ProjectsModule } from '../projects/projects.module';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { ManagetimesheetComponent } from './managetimesheet/managetimesheet.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    UserDashboardComponent,
    AttendanceComponent,
    ProfileComponent,
    TimesheetComponent,
    LeaveComponent,
    TaxcalculationComponent,
    ResetpasswordComponent,
    NotificationComponent,
    ApprovalRequestComponent,
    HolidayComponent,
    ServiceRequestComponent,
    ManagetimesheetComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UserRoutingModule,
    UtilModule,
    ProjectsModule,
    NgChartsModule,
    UserIncomeDeclarationModule
  ],
  providers: [
    CommonService
  ]
})
export class UserModule { }
