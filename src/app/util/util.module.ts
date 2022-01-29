import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonRoutingModule } from './util-routing.module';
import { UtilComponent } from './util.component';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { ToastComponent } from './toast/toast.component';
import { AllownumberDirective } from './directives/allownumber.directive';
import { TransformDirective } from './directives/transform.directive';


@NgModule({
  declarations: [
    UtilComponent,
    DynamicTableComponent,
    ToastComponent,
    AllownumberDirective,
    TransformDirective
  ],
  imports: [
    CommonModule,
    CommonRoutingModule
  ],
  exports: [
    DynamicTableComponent,
    ToastComponent,
    AllownumberDirective,
    TransformDirective
  ]
})
export class UtilModule { }
