import { RouterModule, Routes } from '@angular/router';
import { Initialpage, Login } from 'src/providers/constants';
import { NgModule } from '@angular/core';
import { LoginComponent } from './home/login/login.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    loadChildren: () => import('./home/home.module')
    .then(m => m.HomeModule)
  },
  {
    matcher: (url) => {
      if(url[0].path.split(/\/(.*)/s)[0] == 'bot') {
        return {
          consumed: url
        };
      }
      return null;
    },
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./layout/layout.module')
    .then(m => m.LayoutModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
