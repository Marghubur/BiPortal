import { Component, OnInit } from '@angular/core';
import { AjaxService, tableConfig } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ProjectWiki, ProjectBudget, ManageProject } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';

import 'bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { ProjectModal } from 'src/app/projects/manage-project/manage-project.component';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;
declare var bootstrap: any;

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
  userDetail: any = null;
  selectedProject: any = null;
  isProjectDetailReady: boolean = false;
  designation: Array<any> = null;
  projectDetails: Array<any> = [];
  allProjectAppraisal: Array<any> = [];
  currentProjectAppraisal: any = null;
  appraisalHikeForm: FormGroup;
  isLoading: boolean = false;

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private user: UserService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.projectData = new Filter();
    this.userDetail = this.user.getInstance();
    this.loadData();
  }

  addUpdateWiki(project: any) {
    this.nav.navigate(ProjectWiki, project);
  }

  loadProjectBudgetPage(project: any) {
    this.nav.navigate(ProjectBudget, project);
  }

  loadData() {
    this.isFileFound= false;
    this.isLoaded = false;
    this.http.get(`ps/projects/get/${this.userDetail.UserId}`, true).then((res:ResponseModel) => {
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

  showOffCanvas(item: any) {
    if (item) {
      this.isProjectDetailReady = false;
      this.selectedProject = item;
      this.getProjectsMembers();
    }
  }

  getProjectsMembers() {
    this.selectedProject = null;
    this.http.get(`ps/projects/memberdetail/${this.userDetail.UserId}`, true).then(res => {
      if (res.ResponseBody) {
        let project = res.ResponseBody.Project;
        this.designation = res.ResponseBody.Designation;
        this.allProjectAppraisal = res.ResponseBody.ProjectAppraisal;
        if (project.length > 0) {
          let result = project.reduce((a, b) => {
            a[b.ProjectId] = a[b.ProjectId] || [];
            a[b.ProjectId].push(b);
            return a;
          }, Object.create(null));

          let keys = Object.keys(result);
          let i = 0;
          while(i < keys.length) {
            this.projectDetails.push({
              ProjectId:result[keys[0]][0].ProjectId,
              ProjectName:result[keys[0]][0].ProjectName,
              ProjectDescription:result[keys[0]][0].ProjectDescription,
              ProjectMembers: result[keys[i]]
            });
            i++;
          }
          this.selectedProject = this.projectDetails[0];
          this.currentProjectAppraisal = this.allProjectAppraisal.find(x => x.ProjectId == this.selectedProject.ProjectId);
          if (this.currentProjectAppraisal && this.selectedProject.ProjectMembers.length > 0) {
            var offcanvasRight = document.getElementById('offcanvasRight');
            var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
            bsOffcanvas.show();
            this.initAppraisalHike();
          } else if(this.selectedProject.ProjectMembers.length <= 0) {
            ErrorToast("Please add team members");
            return;
          } else {
            ErrorToast("Please add project appraisal budgest");
            return;
          }
          this.isProjectDetailReady = true;
          Toast("Project details found");
        } else {
          WarningToast("Please add project and their team members first");
          this.isProjectDetailReady = true;
        }
      }
    }).catch(e => {
      this.isProjectDetailReady = true;
    })
  }

  initAppraisalHike() {
    this.appraisalHikeForm = this.fb.group({
      ProjectMemberHike: this.buildProjectMemberHike()
    })
  }

  buildProjectMemberHike(): FormArray {
    let data = this.selectedProject.ProjectMembers;
    console.log(data)
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          FullName: new FormControl(data[i].FullName),
          MemberType: new FormControl(data[i].MemberType),
          DesignationName: new FormControl(data[i].DesignationName),
          AssignedOn: new FormControl(data[i].AssignedOn),
          CTC: new FormControl(data[i].CTC),
          ProposedPromotion: new FormControl(data[i].ProposedPromotion != null ? data[i].ProposedPromotion : 0),
          ProposedHikePercentage: new FormControl(data[i].ProposedHikePercentage != null ? data[i].ProposedHikePercentage : 0),
          ProposedHikeAmount: new FormControl(data[i].ProposedHikeAmount != null ? data[i].ProposedHikeAmount : 0),
          Experience: new FormControl(data[i].Experience != null ? data[i].Experience : 0)
        }));
        i++;
      }
    } else {
      ErrorToast("No recoed found");
      return;
    }
    return dataArray;
  }

  get hikeDetail() {
    return this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
  }

  

}
