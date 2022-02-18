import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { LoginComponent } from '../login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AppService } from 'src/providers/appservice';
import { CommonService } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { PageCache } from 'src/providers/PageCache';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    LayoutComponent,
    NavbarComponent,
    SidemenuComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule

  ],
  providers: [
    AppService,
    AjaxService,
    CommonService,
    ApplicationStorage,
    iNavigation,
    PageCache
  ],
})
export class LayoutModule { }
