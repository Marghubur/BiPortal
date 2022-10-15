import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageProject, ProjectList, ProjectWiki } from 'src/providers/constants';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';

const routes: Routes = [
  { path: ProjectWiki, component: WikiComponent },
  { path: ProjectList, component: ProjectsComponent },
  { path: ManageProject, component: ManageProjectComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
