import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CharDashboard, Documents, DocumentsPage, UserDocuments, UserDocumentsPage } from 'src/providers/constants';
import { documentsComponent } from './documents/documents.component';
import { documentspageComponent } from './documentspage/documentspage.component';
import { ChatDashboardComponent } from './chat-dashboard/chat-dashboard.component';

const routes: Routes = [
  { path: Documents, component: documentsComponent },
  { path: DocumentsPage, component: documentspageComponent },
  { path: UserDocuments, component: documentsComponent },
  { path: UserDocumentsPage, component: documentspageComponent },
  { path: CharDashboard, component: ChatDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommoncomponentRoutingModule { }
