import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonRoutingModule } from './util-routing.module';
import { UtilComponent } from './util.component';
import { DynamicTableComponent } from './dynamic-table/dynamic-table.component';
import { ToastComponent } from './toast/toast.component';
import { AllownumberDirective } from './directives/allownumber.directive';
import { TransformDirective } from './directives/transform.directive';
import { PaginationComponent } from '../pagination/pagination.component';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';
import { IautocompleteComponent } from "./iautocomplete/iautocomplete.component"


@NgModule({
  declarations: [
    UtilComponent,
    DynamicTableComponent,
    ToastComponent,
    AllownumberDirective,
    TransformDirective,
    PaginationComponent,
    IautocompleteComponent,
    BreadcrumsComponent
  ],
  imports: [
    CommonModule,
    CommonRoutingModule
  ],
  exports: [
    DynamicTableComponent,
    ToastComponent,
    AllownumberDirective,
    TransformDirective,
    PaginationComponent,
    BreadcrumsComponent,
    IautocompleteComponent
  ]
})
export class UtilModule { }
