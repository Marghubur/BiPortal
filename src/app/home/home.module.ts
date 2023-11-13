import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LoginComponent } from './login/login.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SupportComponent } from './support/support.component';
import { PriceComponent } from './price/price.component';


@NgModule({
  declarations: [
    LoginComponent,
    LandingPageComponent,
    HeaderComponent,
    HomeComponent,
    SupportComponent,
    PriceComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgbDropdownModule
  ],
})
export class HomeModule {
  constructor(){
    console.log("Home module loaded");
  }
}
