import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Annexure, ConfigPayroll, ConfigPerformance, LeaveAttendanceDailywages, ManageActivity, ManageShift, ManageWorkFlow, OfferLetter, ProcessingPayroll, Products, WorkFlow } from 'src/providers/constants';
import { OfferletterComponent } from './offerletter/offerletter.component';
import { AnnexureComponent } from './annexure/annexure.component';
import { ConfigPerformanceComponent } from './config-performance/config-performance.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ManageWorkFlowComponent } from './manage-work-flow/manage-work-flow.component';
import { ManageshiftComponent } from './manageshift/manageshift.component';
import { ProductsComponent } from './products/products.component';
import { ProcessingPayrollComponent } from './processing-payroll/processing-payroll.component';
import { LeaveAttendanceDailywagesComponent } from './leave-attendance-dailywages/leave-attendance-dailywages.component';
import { ManageActivityComponent } from './manage-activity/manage-activity.component';
import { ConfigPayrollComponent } from './config-payroll/config-payroll.component';

const routes: Routes = [
  { path: OfferLetter, component: OfferletterComponent},
  { path: Annexure, component: AnnexureComponent},
  { path: ConfigPerformance, component: ConfigPerformanceComponent},
  { path: WorkFlow, component: WorkflowComponent },
  { path: ManageWorkFlow, component: ManageWorkFlowComponent },
  { path: ManageShift, component: ManageshiftComponent},
  { path: Products, component: ProductsComponent},
  { path: ManageActivity, component: ManageActivityComponent},
  { path: ProcessingPayroll, component: ProcessingPayrollComponent},
  { path: LeaveAttendanceDailywages, component: LeaveAttendanceDailywagesComponent},
  { path: ConfigPayroll, component: ConfigPayrollComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
