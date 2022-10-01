import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';
import { UtilModule } from '../util/util.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    ProjectsComponent,
    WikiComponent
  ],
  imports: [
    CommonModule,
    UtilModule,
    FormsModule,
    NgbModule,
    ProjectsRoutingModule
  ]
})
export class ProjectsModule { }
