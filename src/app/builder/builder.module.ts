import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BuilderRoutingModule } from './builder-routing.module';
import { BuilderComponent } from './builder.component';
import { BlogsComponent } from './blogs/blogs.component';
import { ArticleComponent } from './article/article.component';

@NgModule({
  declarations: [
    BuilderComponent,
    BlogsComponent,
    ArticleComponent
  ],
  imports: [
    CommonModule,
    BuilderRoutingModule
  ]
})
export class BuilderModule { }
