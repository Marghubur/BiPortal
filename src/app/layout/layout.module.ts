import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicationStorage } from '../../providers/ApplicationStorage';
import { AppService } from '../../providers/appservice';
import { CommonService } from '../../providers/common-service/common.service';
import { iNavigation } from '../../providers/iNavigation';
import { PageCache } from '../../providers/PageCache';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { AjaxService } from '../../providers/ajax.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    LayoutComponent,
    NavbarComponent,
    SidemenuComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgChartsModule,
    NgbModule

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
