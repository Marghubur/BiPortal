import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpPerformance, Performance } from 'src/providers/constants';
import { PerformanceComponent } from './performance/performance.component';

const routes: Routes = [
  { path: Performance, component: PerformanceComponent },
  { path: EmpPerformance, component: PerformanceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommoncomponentRoutingModule { }
