import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Contact, FreeTrail, Login, Price, Support } from 'src/providers/constants';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { PriceComponent } from './price/price.component';
import { SupportComponent } from './support/support.component';
import { ContactComponent } from './contact/contact.component';
import { FreeTrailComponent } from './free-trail/free-trail.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: Login, component: LoginComponent },
  { path: Support, component: SupportComponent },
  { path: Price, component: PriceComponent },
  { path: Contact, component: ContactComponent },
  { path: FreeTrail, component: FreeTrailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
