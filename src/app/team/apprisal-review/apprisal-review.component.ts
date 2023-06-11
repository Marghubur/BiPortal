import { Component, OnInit } from '@angular/core';
import { AjaxService, tableConfig } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { ProjectWiki, ProjectBudget, ManageProject } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

import 'bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { ProjectModal } from 'src/app/projects/manage-project/manage-project.component';
declare var $: any;

@Component({
  selector: 'app-apprisal-review',
  templateUrl: './apprisal-review.component.html',
  styleUrls: ['./apprisal-review.component.scss']
})
export class ApprisalReviewComponent implements OnInit{
  isLoaded: boolean = true;
  projectDetail: Array<ProjectModal> = [];
  isFileFound: boolean = false;
  projectData: Filter = null;
  isPageReady: boolean = false;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.projectData = new Filter();
    this.loadData();
  }

  addUpdateWiki(project: any) {
    this.nav.navigate(ProjectWiki, project);
  }

  loadProjectBudgetPage(project: any) {
    this.nav.navigate(ProjectBudget, project);
  }

  addProject() {
    this.nav.navigate(ManageProject, null);
  }

  loadData() {
    this.isFileFound= false;
    this.isLoaded = false;
    this.http.post("Project/GetAllProjectDeatil", this.projectData).then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectDetail = res.ResponseBody;
        this.projectData.TotalRecords = res.ResponseBody[0].Total;
        this.isFileFound = true;
        this.isLoaded = true;
        Toast("Record found");
      } else {
         this.isFileFound= false;
        this.isLoaded = true;
        this.projectData.TotalRecords = 0;
      }
    })
  }

  editProjectDetail(item: ProjectModal) {
    this.nav.navigate(ManageProject, item);
  }

  GetFilterResult(e: any) {
    if(e != null) {
      this.projectData = e;
      this.loadData();
    }
  }

}
