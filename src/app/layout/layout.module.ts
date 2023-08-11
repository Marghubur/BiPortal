import { CommonModule } from '@angular/common';
import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidemenuComponent } from '../sidemenu/sidemenu.component';
import { ApplicationStorage } from '../../providers/ApplicationStorage';
import { NgChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';

@NgModule({
  declarations: [
    LayoutComponent,
    NavbarComponent,
    SidemenuComponent,
    LoaderComponent
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
export class LayoutModule {
  constructor() {
    console.log("Layout module loaded");
  }
}
