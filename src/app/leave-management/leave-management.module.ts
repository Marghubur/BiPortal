import { CommonModule } from '@angular/common';
import { UtilModule } from '../util/util.module';
import { LeaveManagementRoutingModule } from './leave-management-routing.module';
import {LeaveComponent } from './leave/leave.component';
import {ManageLeaveplanComponent } from './manage-leaveplan/manage-leaveplan.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageYearEndingComponent } from './manage-year-ending/manage-year-ending.component';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { ApplyLeaveComponent } from './apply-leave/apply-leave.component'
import { NgChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    LeaveComponent,
    ManageLeaveplanComponent,
    ManageYearEndingComponent,
    ManageYearEndingComponent,
    ApplyLeaveComponent
  ],
  imports: [
    CommonModule,
    UtilModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgChartsModule,
    LeaveManagementRoutingModule,
    CommonmodalModule
  ]
})
export class LeaveManagementModule { 
  constructor() {
    console.log("Leave management module loaded");
  }
}
