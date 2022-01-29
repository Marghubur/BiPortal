import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeGenerator, Doclist, DocumentsPage, Employees, Home, JsonFormatter, LiveUrl, Login, SamplePage, TableSampleData, UploadScript, UserProfile } from 'src/providers/constants';

import { CodegeneratorComponent } from './codegenerator/codegenerator.component';
import { HomeComponent } from './home/home.component';
import { IndexComponent } from './index/index.component';
import { JsonFormatterComponent } from './json-formatter/json-formatter.component';
import { LiveurlComponent } from './liveurl/liveurl.component';
import { LoginComponent } from './login/login.component';
import { SamplepageComponent } from './samplepage/samplepage.component';
import { TabledsampledataComponent } from './tabledsampledata/tabledsampledata.component';
import { UploadscriptComponent } from './uploadscript/uploadscript.component';
import { UserprofileComponent } from './userprofile/userprofile.component';


const routes: Routes = [
  { path: "", component: IndexComponent },
  { path: JsonFormatter, component: JsonFormatterComponent },
  { path: Home, component: HomeComponent },
  { path: TableSampleData, component: TabledsampledataComponent },
  { path: Login, component: LoginComponent },
  { path: SamplePage, component: SamplepageComponent },
  { path: UploadScript, component: UploadscriptComponent },
  { path: UserProfile, component: UserprofileComponent },
  { path: CodeGenerator, component: CodegeneratorComponent },
  { path: LiveUrl, component: LiveurlComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module')
    .then(m => m.AdminModule)
  },
  {
    path: 'api',
    loadChildren: () => import('./builder/builder.module')
    .then(m => m.BuilderModule)
  },
  { 
    path: 'service', 
    loadChildren: () => 
    import('./util/util.module').then(m => m.UtilModule) 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
