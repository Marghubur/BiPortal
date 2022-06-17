import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ApplicationStorage } from '../../providers/ApplicationStorage';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    LayoutComponent,
    NavbarComponent,
    SidemenuComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    NgChartsModule
  ],
  providers: [
    ApplicationStorage
  ],
})
export class LayoutModule { }
