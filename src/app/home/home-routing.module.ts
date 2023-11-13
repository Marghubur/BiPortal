import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Login, Price, Support } from 'src/providers/constants';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SupportComponent } from './support/support.component';
import { PriceComponent } from './price/price.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: Login, component: LoginComponent },
  { path: Support, component: SupportComponent },
  { path: Price, component: PriceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
