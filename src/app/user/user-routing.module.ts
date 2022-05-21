import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalRequest, Notification, Declaration, Form12B, FreeTaxFilling, IncomeTax, PaySlip, Preferences, PreviousIncome, Profile, ResetPassword, Salary, Summary, Taxcalculation, TaxSavingInvestment, UserAttendance, UserDashboard, UserLeave, UserProfilePage, UserTimesheet } from 'src/providers/constants';
import { AttendanceComponent } from './attendance/attendance.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { MysalaryComponent } from './mysalary/mysalary.component';
import { ProfileComponent } from './profile/profile.component';
import { SummaryComponent } from './summary/summary.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { LeaveComponent } from './leave/leave.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { Form12BBComponent } from './form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from './freetaxfilling/freetaxfilling.component';
import { TaxsavinginvestmentComponent } from './taxsavinginvestment/taxsavinginvestment.component';
import { PayslipsComponent } from './payslips/payslips.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { TaxcalculationComponent } from './taxcalculation/taxcalculation.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { NotificationComponent } from './notification/notification.component';
import { ApprovalRequestComponent } from './approval-request/approval-request.component';

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
  { path: UserProfilePage, component: ProfileComponent},
  { path: PreviousIncome, component: PreviousincomeComponent},
  { path: Form12B, component: Form12BBComponent},
  { path: FreeTaxFilling, component: FreetaxfillingComponent},
  { path: TaxSavingInvestment, component: TaxsavinginvestmentComponent},
  { path: PaySlip, component: PayslipsComponent},
  { path: IncomeTax, component: IncometaxComponent},
  { path: Taxcalculation, component: TaxcalculationComponent},
  { path: Notification, component: NotificationComponent},
  { path: ApprovalRequest, component: ApprovalRequestComponent},
  { path: ResetPassword, component: ResetpasswordComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
