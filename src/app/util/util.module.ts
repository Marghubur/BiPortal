import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonRoutingModule } from './util-routing.module';
import { UtilComponent } from './util.component';
import { AllownumberDirective } from './directives/allownumber.directive';
import { TransformDirective } from './directives/transform.directive';
import { PaginationComponent } from '../pagination/pagination.component';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';
import { IautocompleteComponent } from "./iautocomplete/iautocomplete.component";
import { PreLoadTableComponent } from './pre-load-table/pre-load-table.component';
import { ImageLoaderComponent } from './image-loader/image-loader.component'


@NgModule({
  declarations: [
    UtilComponent,
    AllownumberDirective,
    TransformDirective,
    PaginationComponent,
    IautocompleteComponent,
    BreadcrumsComponent,
    PreLoadTableComponent,
    ImageLoaderComponent
  ],
  imports: [
    CommonModule,
    CommonRoutingModule
  ],
  exports: [
    AllownumberDirective,
    TransformDirective,
    PaginationComponent,
    BreadcrumsComponent,
    IautocompleteComponent,
    PreLoadTableComponent,
    ImageLoaderComponent
  ]
})
export class UtilModule { }
