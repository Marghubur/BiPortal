import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LoginComponent } from './login/login.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SupportComponent } from './support/support.component';
import { PriceComponent } from './price/price.component';
import { FooterComponent } from './footer/footer.component';
import { ContactComponent } from './contact/contact.component';
import { FreeTrailComponent } from './free-trail/free-trail.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '../util/util.module';
import { HRManagementComponent } from './hrmanagement/hrmanagement.component';
import { EmployeeProfilesComponent } from './employee-profiles/employee-profiles.component';
import { PayrollSoftwareComponent } from './payroll-software/payroll-software.component';
import { TimesheetManagementComponent } from './timesheet-management/timesheet-management.component';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { ExpenseManagementComponent } from './expense-management/expense-management.component';
import { ShiftManagementComponent } from './shift-management/shift-management.component';
import { EmployeefinanceComponent } from './employeefinance/employeefinance.component';
import { PerformancemanagementComponent } from './performancemanagement/performancemanagement.component';
import { DocumentmanagementComponent } from './documentmanagement/documentmanagement.component';


@NgModule({
  declarations: [
    LoginComponent,
    LandingPageComponent,
    HeaderComponent,
    HomeComponent,
    SupportComponent,
    PriceComponent,
    FooterComponent,
    ContactComponent,
    FreeTrailComponent,
    AboutusComponent,
    HRManagementComponent,
    EmployeeProfilesComponent,
    PayrollSoftwareComponent,
    TimesheetManagementComponent,
    AttendanceManagementComponent,
    LeaveManagementComponent,
    ExpenseManagementComponent,
    ShiftManagementComponent,
    EmployeefinanceComponent,
    PerformancemanagementComponent,
    DocumentmanagementComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    UtilModule
  ],
})
export class HomeModule {
  constructor(){
    console.log("Home module loaded");
  }
}
