import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Documents, DocumentsPage, EmpPerformance, EmpServiceRequest, Performance, ServiceRequest, UserDocuments, UserDocumentsPage } from 'src/providers/constants';
import { PerformanceComponent } from './performance/performance.component';
import { ServiceRequestComponent } from './service-request/service-request.component';
import { documentsComponent } from './documents/documents.component';
import { documentspageComponent } from './documentspage/documentspage.component';

const routes: Routes = [
  { path: Performance, component: PerformanceComponent },
  { path: EmpPerformance, component: PerformanceComponent },
  { path: ServiceRequest, component: ServiceRequestComponent},
  { path: EmpServiceRequest, component: ServiceRequestComponent},
  { path: Documents, component: documentsComponent },
  { path: DocumentsPage, component: documentspageComponent },
  { path: UserDocuments, component: documentsComponent },
  { path: UserDocumentsPage, component: documentspageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommoncomponentRoutingModule { }
