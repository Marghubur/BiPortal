import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountsBaseRoute, AdminBaseRoute, CommonBaseRoute, ConfigBaseRoute, LeaveBaseRoute, ManageBaseRoute, OrgBaseRoute, ProjectBaseRoute, TeamBaseRoute } from 'src/providers/constants';

const routes: Routes = [
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == OrgBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../org/org.module')
    .then(m => m.OrgModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == AdminBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../admin/admin.module')
    .then(m => m.AdminModule)
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
    loadChildren: () => import('../projects/projects.module')
    .then(m => m.ProjectsModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == ConfigBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../configuration/configuration.module')
    .then(m => m.ConfigurationModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == ManageBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../manage/manage.module')
    .then(m => m.ManageModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == AccountsBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../income-declaration/income-declaration.module')
    .then(m => m.IncomeDeclarationModule)
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
    loadChildren: () => import('../user/user.module')
    .then(m => m.UserModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == LeaveBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../leave-management/leave-management.module')
    .then(m => m.LeaveManagementModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == CommonBaseRoute) {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    loadChildren: () => import('../commoncomponent/commoncomponent.module')
    .then(m => m.CommoncomponentModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
