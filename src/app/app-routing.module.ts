import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from 'src/providers/constants';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: Login, component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
