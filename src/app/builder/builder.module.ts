import { CommonModule } from '@angular/common';
import { BuilderRoutingModule } from './builder-routing.module';
import { BuilderComponent } from './builder.component';
import { BlogsComponent } from './blogs/blogs.component';
import { ArticleComponent } from './article/article.component';
import { NgModule } from '@angular/core';

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
export class BuilderModule {
  constructor() {
    console.log("Builder module loaded");
  }
}
