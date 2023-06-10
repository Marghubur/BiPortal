import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageProject, ProjectBudget, ProjectList, ProjectWiki, UserProjectList } from 'src/providers/constants';
import { ManageProjectComponent } from './manage-project/manage-project.component';
import { ProjectsComponent } from './projects.component';
import { WikiComponent } from './wiki/wiki.component';
import { BudgetComponent } from './budget/budget.component';

const routes: Routes = [
  { path: ProjectWiki, component: WikiComponent },
  { path: ProjectList, component: ProjectsComponent },
  { path: UserProjectList, component: ProjectsComponent },
  { path: ProjectBudget, component: BudgetComponent },
  { path: ManageProject, component: ManageProjectComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
