import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Attendance, BillDetail, BuildPdf, Clients, Companies, CreateResume, Documents, DocumentsPage, Employees, Files, Leave, ManageEmployee, Profile, Recent, Recruiter, RegisterClient, Resume, Roles } from 'src/providers/constants';
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
import { ManageComponent } from './profile/profile.component';
import { ManageemployeeComponent } from './manageemployee/manageemployee.component';
import { RecentComponent } from './recent/recent.component';
import { RegisterclientComponent } from './registerclient/registerclient.component';
import { ResumeComponent } from './resume/resume.component';
import { RolesComponent } from './roles/roles.component';
import { CompaniesComponent} from './companies/companies.component';
import { CreateResumeComponent } from './create-resume/create-resume.component';
import { RecruiterComponent } from './recruiter/recruiter.component';
import { LeaveComponent } from './leave/leave.component';

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
  { path: Attendance, component: AttendanceComponent},
  { path: Profile, component: ManageComponent},
  { path: Recent, component: RecentComponent},
  { path: Roles, component: RolesComponent },
  { path: Companies, component: CompaniesComponent},
  { path: CreateResume, component: CreateResumeComponent},
  { path: Recruiter, component: RecruiterComponent},
  { path: Leave, component: LeaveComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
