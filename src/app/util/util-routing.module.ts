import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UtilComponent } from './util.component';

const routes: Routes = [{ path: '', component: UtilComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonRoutingModule { }
