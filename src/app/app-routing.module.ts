import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout/layout/layout.component';
import { HomeComponent } from './home/home/home.component';
import { RegisterNewOrgComponent } from './register-new-org/register-new-org.component';
import { RegisterNewOrg } from 'src/providers/constants';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    matcher: (url) => {
      if (url[0].path.split(/\/(.*)/s)[0] == 'bot') {
        return {
          consumed: url,
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () =>
      import('./layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: RegisterNewOrg,
    component: RegisterNewOrgComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
