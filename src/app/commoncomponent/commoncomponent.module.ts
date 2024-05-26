import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommoncomponentRoutingModule } from './commoncomponent-routing.module';
import { UtilModule } from '../util/util.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonmodalModule } from '../commonmodal/commonmodal.module';
import { documentspageComponent } from './documentspage/documentspage.component';
import { documentsComponent } from './documents/documents.component';
import { ChatDashboardComponent } from './chat-dashboard/chat-dashboard.component';

@NgModule({
  declarations: [
    documentspageComponent,
    documentsComponent,
    ChatDashboardComponent,
  ],
  imports: [
    CommonModule,
    UtilModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CommonmodalModule,
    CommoncomponentRoutingModule
  ]
})
export class CommoncomponentModule { }
