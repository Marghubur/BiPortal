import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { ProfileComponent } from './profile/profile.component';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SummaryComponent } from './summary/summary.component';
import { MysalaryComponent } from './mysalary/mysalary.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { Form12BBComponent } from './form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from './freetaxfilling/freetaxfilling.component';
import { TaxsavinginvestmentComponent } from './taxsavinginvestment/taxsavinginvestment.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { LeaveComponent } from './leave/leave.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';
import { CommonService } from 'src/providers/common-service/common.service';
import { HolidayComponent } from './holiday/holiday.component';


@NgModule({
  declarations: [
    UserDashboardComponent,
    AttendanceComponent,
    ProfileComponent,
    SummaryComponent,
    MysalaryComponent,
    PayslipsComponent,
    IncometaxComponent,
    DeclarationComponent,
    PreviousincomeComponent,
    Form12BBComponent,
    FreetaxfillingComponent,
    TaxsavinginvestmentComponent,
    TimesheetComponent,
    LeaveComponent,
    PreferencesComponent,
    TaxcalculationComponent,
    ResetpasswordComponent,
    NotificationComponent,
    ApprovalRequestComponent,
    HolidayComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UserRoutingModule,
    UtilModule
  ],
  providers: [
    CommonService
  ]
})
export class UserModule { }
