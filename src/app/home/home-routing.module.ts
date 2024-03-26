import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AboutUs, AttendanceManagement, Contact, DocumentManagement, EmployeeFinance, EmployeeProfile, ExpenseManagement, FreeTrail, HRManagement, LeaveManagement, Login, PayrollSoftware, PerformanceManagement, Price, ShiftManagement, Support, TimesheetManagement } from 'src/providers/constants';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PriceComponent } from './price/price.component';
import { SupportComponent } from './support/support.component';
import { ContactComponent } from './contact/contact.component';
import { FreeTrailComponent } from './free-trail/free-trail.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { PayrollSoftwareComponent } from './payroll-software/payroll-software.component';
import { HRManagementComponent } from './hrmanagement/hrmanagement.component';
import { EmployeeProfilesComponent } from './employee-profiles/employee-profiles.component';
import { TimesheetManagementComponent } from './timesheet-management/timesheet-management.component';
import { AttendanceManagementComponent } from './attendance-management/attendance-management.component';
import { LeaveManagementComponent } from './leave-management/leave-management.component';
import { ShiftManagementComponent } from './shift-management/shift-management.component';
import { ExpenseManagementComponent } from './expense-management/expense-management.component';
import { EmployeefinanceComponent } from './employeefinance/employeefinance.component';
import { PerformancemanagementComponent } from './performancemanagement/performancemanagement.component';
import { DocumentmanagementComponent } from './documentmanagement/documentmanagement.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: Login, component: LoginComponent },
  { path: Support, component: SupportComponent },
  { path: Price, component: PriceComponent },
  { path: Contact, component: ContactComponent },
  { path: FreeTrail, component: FreeTrailComponent },
  { path: AboutUs, component: AboutusComponent },
  { path: PayrollSoftware, component: PayrollSoftwareComponent },
  { path: HRManagement, component: HRManagementComponent },
  { path: EmployeeProfile, component: EmployeeProfilesComponent },
  { path: TimesheetManagement, component: TimesheetManagementComponent },
  { path: AttendanceManagement, component: AttendanceManagementComponent },
  { path: LeaveManagement, component: LeaveManagementComponent },
  { path: ShiftManagement, component: ShiftManagementComponent },
  { path: ExpenseManagement, component: ExpenseManagementComponent },
  { path: EmployeeFinance, component: EmployeefinanceComponent },
  { path: PerformanceManagement, component: PerformancemanagementComponent },
  { path: DocumentManagement, component: DocumentmanagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
