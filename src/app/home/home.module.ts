import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { LoginComponent } from './login/login.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { NgbAccordionModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { SupportComponent } from './support/support.component';
import { PriceComponent } from './price/price.component';
import { FooterComponent } from './footer/footer.component';
import { ContactComponent } from './contact/contact.component';


@NgModule({
  declarations: [
    LoginComponent,
    LandingPageComponent,
    HeaderComponent,
    HomeComponent,
    SupportComponent,
    PriceComponent,
    FooterComponent,
    ContactComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NgbAccordionModule,
    NgbDropdownModule
  ],
})
export class HomeModule {
  constructor(){
    console.log("Home module loaded");
  }
}
