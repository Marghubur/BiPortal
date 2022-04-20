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
    TaxsavinginvestmentComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UserRoutingModule,
    UtilModule
  ]
})
export class UserModule { }
