import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeGenerator, JsonFormatter, LiveUrl, Login, UploadScript, UserProfile } from 'src/providers/constants';
import { CodegeneratorComponent } from '../codegenerator/codegenerator.component';
import { JsonFormatterComponent } from '../json-formatter/json-formatter.component';
import { LiveurlComponent } from '../liveurl/liveurl.component';
import { LoginComponent } from '../login/login.component';
import { UploadscriptComponent } from '../uploadscript/uploadscript.component';
import { UserprofileComponent } from '../userprofile/userprofile.component';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('../admin/admin.module')
    .then(m => m.AdminModule)
  },
  { path: JsonFormatter, component: JsonFormatterComponent },
  { path: UploadScript, component: UploadscriptComponent },
  { path: UserProfile, component: UserprofileComponent },
  { path: CodeGenerator, component: CodegeneratorComponent },
  { path: LiveUrl, component: LiveurlComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }