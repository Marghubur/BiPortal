import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Article, Blogs } from 'src/providers/constants';
import { ArticleComponent } from './article/article.component';
import { BlogsComponent } from './blogs/blogs.component';
import { BuilderComponent } from './builder.component';

const routes: Routes = [
  { path: '', component: BuilderComponent },
  { path: Blogs, component: BlogsComponent },
  { path: Article, component: ArticleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuilderRoutingModule { }
