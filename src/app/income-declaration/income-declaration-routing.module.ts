import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDeclaration, AdminForm12B, AdminFreeTaxFilling, AdminIncomeTax, AdminPaySlip, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminDeclarationApprovalRule, CustomSalaryStructure, Payroll, PayrollComponents, PFESISetup, SalaryComponentStructure, TaxRegime } from 'src/providers/constants';
import { ApprovalRuleComponent } from './approval-rule/approval-rule.component';
import { CustomsalaryStructureComponent } from './customsalary-structure/customsalary-structure.component';
import { DeclarationComponent } from './declaration/declaration.component';
import { Form12BbComponent } from './form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from './freetaxfilling/freetaxfilling.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { PayrollComponentsComponent } from './payroll-components/payroll-components.component';
import { PayrollComponent } from './payroll/payroll.component';
import { PayslipComponent } from './payslip/payslip.component';
import { PfEsiSetupComponent } from './pf-esi-setup/pf-esi-setup.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { SalaryComponent } from './salary/salary.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { SummaryComponent } from './summary/summary.component';
import { TaxRegimeComponent } from './tax-regime/tax-regime.component';

const routes: Routes = [
  { path: AdminSummary, component: SummaryComponent},
  { path: AdminPreferences, component: PreferencesComponent},
  { path: AdminSalary, component: SalaryComponent},
  { path: AdminDeclaration, component: DeclarationComponent},
  { path: AdminPreviousIncome, component: PreviousincomeComponent},
  { path: AdminForm12B, component: Form12BbComponent},
  { path: AdminFreeTaxFilling, component: FreetaxfillingComponent},
  { path: AdminDeclarationApprovalRule, component: ApprovalRuleComponent},
  { path: AdminIncomeTax, component: IncometaxComponent},
  { path: AdminPaySlip, component: PayslipComponent},
  { path: Payroll, component: PayrollComponent},
  { path: PFESISetup, component: PfEsiSetupComponent},
  { path: PayrollComponents, component: PayrollComponentsComponent},
  { path: TaxRegime, component: TaxRegimeComponent},
  { path: SalaryComponentStructure, component: SalarycomponentStructureComponent},
  { path: CustomSalaryStructure, component: CustomsalaryStructureComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeDeclarationRoutingModule { }
