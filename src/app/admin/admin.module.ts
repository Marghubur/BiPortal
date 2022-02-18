import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { documentspageComponent } from './documentspage/documentspage.component';
import { documentsComponent } from './documents/documents.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilModule } from '../util/util.module';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ReplaceEmpty } from '../../../src/pipes/ReplaceEmpty';
import { EmployeesComponent } from './employees/employees.component';
import { ClientsComponent } from './clients/clients.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { FilesComponent } from './files/files.component';
import { ResumeComponent } from './resume/resume.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  declarations: [
    AdminComponent,
    documentspageComponent,
    documentsComponent,
    ManageemployeeComponent,
    BuildPdfComponent,
    ReplaceEmpty,
    EmployeesComponent,
    ClientsComponent,
    RegisterclientComponent,
    FilesComponent,
    ResumeComponent,
    BilldetailsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    UtilModule,
    NgxDocViewerModule
  ]
})
export class AdminModule { }
