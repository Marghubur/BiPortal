import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    ProjectsComponent,
    WikiComponent,
    ManageProjectComponent
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
