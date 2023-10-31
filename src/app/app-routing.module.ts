import { RouterModule, Routes } from '@angular/router';
import { Initialpage, Login } from 'src/providers/constants';
import { InitialpageComponent } from './initialpage/initialpage.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '/bot', component: LoginComponent},
  { path: Login, component: LoginComponent },
  { path: Initialpage, component: InitialpageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
