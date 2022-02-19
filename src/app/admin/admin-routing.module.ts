import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Attendance, BillDetail, BuildPdf, Clients, Documents, DocumentsPage, Employees, Files, ManageEmployee, RegisterClient, Resume, SideMenu } from 'src/providers/constants';
import { HomeComponent } from '../home/home.component';
import { AdminComponent } from './admin.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { BilldetailsComponent } from './billdetails/billdetails.component';
import { BuildPdfComponent } from './build-pdf/build-pdf.component';
import { ClientsComponent } from './clients/clients.component';
import { documentsComponent } from './documents/documents.component';
import { documentspageComponent } from './documentspage/documentspage.component';
import { EmployeesComponent } from './employees/employees.component';
import { FilesComponent } from './files/files.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { ResumeComponent } from './resume/resume.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: ManageEmployee, component: ManageemployeeComponent },
  { path: Employees, component: EmployeesComponent },
  { path: Documents, component: documentsComponent },
  { path: DocumentsPage, component: documentspageComponent },
  { path: Clients, component: ClientsComponent },
  { path: RegisterClient, component: RegisterclientComponent },
  { path: BuildPdf, component: BuildPdfComponent },
  { path: Files, component: FilesComponent },
  { path: Resume, component: ResumeComponent },
  { path: BillDetail, component: BilldetailsComponent},
  { path: Attendance, component: AttendanceComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
