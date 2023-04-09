import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Annexure, ConfigPerformance, EmailConfiguration, ManageShift, ManageWorkFlow, OfferLetter, Products, WorkFlow } from 'src/providers/constants';
import { OfferletterComponent } from './offerletter/offerletter.component';
import { AnnexureComponent } from './annexure/annexure.component';
import { ConfigPerformanceComponent } from './config-performance/config-performance.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { EmailConfigComponent } from './email-config/email-config.component';
import { ManageWorkFlowComponent } from './manage-work-flow/manage-work-flow.component';
import { ManageshiftComponent } from './manageshift/manageshift.component';
import { ProductsComponent } from './products/products.component';

const routes: Routes = [
  { path: OfferLetter, component: OfferletterComponent},
  { path: Annexure, component: AnnexureComponent},
  { path: ConfigPerformance, component: ConfigPerformanceComponent},
  { path: WorkFlow, component: WorkflowComponent },
  { path: ManageWorkFlow, component: ManageWorkFlowComponent },
  { path: ManageShift, component: ManageshiftComponent},
  { path: Products, component: ProductsComponent},
  { path: EmailConfiguration, component: EmailConfigComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
