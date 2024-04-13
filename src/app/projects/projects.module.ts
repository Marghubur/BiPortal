import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { NgModule } from '@angular/core';
import { BudgetComponent } from './budget/budget.component';
import { CapacityManagementComponent } from './capacity-management/capacity-management.component';

@NgModule({
  declarations: [
    ProjectsComponent,
    WikiComponent,
    ManageProjectComponent,
    BudgetComponent,
    CapacityManagementComponent
  ],
  imports: [
    CommonModule,
    UtilModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    ProjectsRoutingModule
  ]
})
export class ProjectsModule { 
  constructor() {
    console.log("Project module loaded");
  }
}
