import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonRoutingModule } from './util-routing.module';
import { UtilComponent } from './util.component';
import { AllownumberDirective } from './directives/allownumber.directive';
import { DecimalnumberDirective } from './directives/decimalnumber.directive';
import { TransformDirective } from './directives/transform.directive';
import { PaginationComponent } from '../pagination/pagination.component';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';
import { IautocompleteComponent } from "./iautocomplete/iautocomplete.component";
import { PreLoadTableComponent } from './pre-load-table/pre-load-table.component';
import { ImageLoaderComponent } from './image-loader/image-loader.component';
import { EditorComponent } from './editor/editor.component';
import { MessageModalComponent } from './message-modal/message-modal.component'


@NgModule({
  declarations: [
    UtilComponent,
    AllownumberDirective,
    DecimalnumberDirective,
    TransformDirective,
    PaginationComponent,
    IautocompleteComponent,
    BreadcrumsComponent,
    PreLoadTableComponent,
    ImageLoaderComponent,
    EditorComponent,
    MessageModalComponent
  ],
  imports: [
    CommonModule,
    CommonRoutingModule
  ],
  exports: [
    AllownumberDirective,
    TransformDirective,
    DecimalnumberDirective,
    PaginationComponent,
    BreadcrumsComponent,
    IautocompleteComponent,
    PreLoadTableComponent,
    ImageLoaderComponent,
    EditorComponent,
    MessageModalComponent
  ]
})
export class UtilModule { }
