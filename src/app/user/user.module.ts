import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonService } from 'src/providers/common-service/common.service';
import { NgChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    UserDashboardComponent,
    //AttendanceComponent,
    //ProfileComponent,
    //TimesheetComponent,
    //LeaveComponent,
    //TaxcalculationComponent,
    //ResetpasswordComponent,
    //NotificationComponent,
    //ApprovalRequestComponent,
    //HolidayComponent,
    //ServiceRequestComponent,
    //ManagetimesheetComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    UserRoutingModule,
    NgChartsModule
  ],
  providers: [
    CommonService
  ]
})
export class UserModule {
  constructor() {
    console.log("User module loaded");
  }
}
