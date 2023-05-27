import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Documents, DocumentsPage, EmpServiceRequest, UserDocuments, UserDocumentsPage } from 'src/providers/constants';
import { documentsComponent } from './documents/documents.component';
import { documentspageComponent } from './documentspage/documentspage.component';

const routes: Routes = [
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
