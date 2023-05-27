import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { ProjectBaseRoute, TeamBaseRoute } from 'src/providers/constants';

const routes: Routes = [
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == 'ems/admin') {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../admin/admin.module')
    .then(m => m.AdminModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == 'user') {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../user/user.module')
    .then(m => m.UserModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == TeamBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../team/team.module')
    .then(m => m.TeamModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == ProjectBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../projects/projects.module')
    .then(m => m.ProjectsModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == 'ems/manage') {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../manage/manage.module')
    .then(m => m.ManageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
