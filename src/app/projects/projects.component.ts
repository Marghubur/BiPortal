import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { ManageProject, ProjectWiki } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { ProjectModal } from './manage-project/manage-project.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  isLoaded: boolean = true;
  projectDetail: Array<ProjectModal> = [];
  isFileFound: boolean = false;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.loadData();
  }

  addUpdateWiki(project: any) {
    this.nav.navigate(ProjectWiki, project);
  }

  addProject() {
    this.nav.navigate(ManageProject, null);
  }

  loadData() {
    this.http.get("Project/GetAllProjectDeatil").then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectDetail = res.ResponseBody;
        this.isFileFound = true;
        Toast("Record found");
      }
    })
  }

  editProjectDetail(item: ProjectModal) {
    this.nav.navigate(ManageProject, item);
  }

}
