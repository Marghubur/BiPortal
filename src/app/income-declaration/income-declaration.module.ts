import { CommonModule } from '@angular/common';
import { DeclarationComponent } from './declaration/declaration.component';
import { PreferencesComponent } from './preferences/preferences.component';
import { PreviousincomeComponent } from './previousincome/previousincome.component';
import { Form12BbComponent } from '../income-declaration/form12-bb/form12-bb.component';
import { FreetaxfillingComponent } from '../income-declaration/freetaxfilling/freetaxfilling.component';
import { IncometaxComponent } from '../income-declaration/incometax/incometax.component';
import { PayslipComponent } from '../income-declaration/payslip/payslip.component';
import { PayrollComponent } from '../income-declaration/payroll/payroll.component';
import { PfEsiSetupComponent } from '../income-declaration/pf-esi-setup/pf-esi-setup.component';
import { PayrollComponentsComponent } from '../income-declaration/payroll-components/payroll-components.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UtilModule } from '../util/util.module';
import { SalaryComponent } from '../income-declaration/salary/salary.component';

import { IncomeDeclarationRoutingModule } from './income-declaration-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaxRegimeComponent } from './tax-regime/tax-regime.component';
import { CustomsalaryStructureComponent } from './customsalary-structure/customsalary-structure.component';
import { SalarycomponentStructureComponent } from './salarycomponent-structure/salarycomponent-structure.component';
import { ApprovalRuleComponent } from './approval-rule/approval-rule.component';
import { AdminmodalModule } from '../adminmodal/adminmodal.module';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { NgModule } from '@angular/core';


@NgModule({
  declarations: [
    DeclarationComponent,
    Form12BbComponent,
    FreetaxfillingComponent,
    IncometaxComponent,
    PayslipComponent,
    PayrollComponent,
    PayrollComponentsComponent,
    PfEsiSetupComponent,
    PreferencesComponent,
    PreviousincomeComponent,
    SalaryComponent,
    TaxRegimeComponent,
    CustomsalaryStructureComponent,
    SalarycomponentStructureComponent,
    ApprovalRuleComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    IncomeDeclarationRoutingModule,
    AdminmodalModule,
    CommonmodalModule
  ]
})
export class IncomeDeclarationModule {
  constructor() {
    console.log("Income Declaration module loaded");
  }
}
