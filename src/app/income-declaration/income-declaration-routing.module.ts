import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDeclaration, AdminForm12B, AdminIncomeTax, AdminPaySlip, AdminPreferences, AdminPreviousIncome, AdminSalary, EmployeeDeclarationList, Payroll, PayrollComponents, PFESISetup, ProfesssionalTax, SalaryAdjustment, SalaryComponentStructure, TaxRegime } from 'src/providers/constants';
import { DeclarationComponent } from './declaration/declaration.component';
import { Form12BbComponent } from './form12-bb/form12-bb.component';
import { IncometaxComponent } from './incometax/incometax.component';
import { PayrollComponentsComponent } from './payroll-components/payroll-components.component';
import { PayrollComponent } from './payroll/payroll.component';
import { PayslipComponent } from './payslip/payslip.component';
import { PfEsiSetupComponent } from './pf-esi-setup/pf-esi-setup.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { SalaryComponent } from './salary/salary.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { TaxRegimeComponent } from './tax-regime/tax-regime.component';
import { ProfessionalTaxComponent } from './professional-tax/professional-tax.component';
import { EmployeeDeclarationlistComponent } from './employee-declarationlist/employee-declarationlist.component';
import { SalaryAdjustmentComponent } from './salary-adjustment/salary-adjustment.component';

const routes: Routes = [
  { path: AdminPreferences, component: PreferencesComponent},
  { path: AdminSalary, component: SalaryComponent},
  { path: AdminDeclaration, component: DeclarationComponent},
  { path: AdminPreviousIncome, component: PreviousincomeComponent},
  { path: AdminForm12B, component: Form12BbComponent},
  { path: AdminIncomeTax, component: IncometaxComponent},
  { path: AdminPaySlip, component: PayslipComponent},
  { path: Payroll, component: PayrollComponent},
  { path: PFESISetup, component: PfEsiSetupComponent},
  { path: PayrollComponents, component: PayrollComponentsComponent},
  { path: TaxRegime, component: TaxRegimeComponent},
  { path: SalaryComponentStructure, component: SalarycomponentStructureComponent},
  { path: ProfesssionalTax, component: ProfessionalTaxComponent},
  { path: EmployeeDeclarationList, component: EmployeeDeclarationlistComponent},
  { path: SalaryAdjustment, component: SalaryAdjustmentComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeDeclarationRoutingModule { }
