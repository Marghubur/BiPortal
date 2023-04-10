import { CommonModule } from '@angular/common';
import { MysalaryComponent } from '../user-income-declaration/mysalary/mysalary.component';
import { PayslipsComponent } from '../user-income-declaration/payslips/payslips.component';
import { IncometaxComponent } from '../user-income-declaration/incometax/incometax.component';
import { DeclarationComponent } from '../user-income-declaration/declaration/declaration.component';
import { PreviousincomeComponent } from '../user-income-declaration/previousincome/previousincome.component';
import { Form12BBComponent } from '../user-income-declaration/form12-bb/form12-bb.component';
import { UserIncomeDeclarationRoutingModule } from './user-income-declaration-routing.module';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PreferencesComponent } from '../user-income-declaration/preferences/preferences.component';
import { CommoncomponentModule } from '../commoncomponent/commoncomponent.module';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    MysalaryComponent,
    PayslipsComponent,
    PreferencesComponent,
    IncometaxComponent,
    DeclarationComponent,
    PreviousincomeComponent,
    Form12BBComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    UserIncomeDeclarationRoutingModule,
    CommoncomponentModule
  ]
})
export class UserIncomeDeclarationModule {
  constructor() {
    console.log("User income module loaded");
  }
}
