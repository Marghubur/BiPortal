import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectList, ProjectWiki } from 'src/providers/constants';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';

const routes: Routes = [
  { path: ProjectWiki, component: WikiComponent },
  { path: ProjectList, component: ProjectsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
