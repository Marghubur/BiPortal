import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-manage-project',
  templateUrl: './manage-project.component.html',
  styleUrls: ['./manage-project.component.scss']
})
export class ManageProjectComponent implements OnInit {
  isReady: boolean = true;
  projectForm: FormGroup;
  isCompaniesDetails: boolean = true;
  startedOnModel: NgbDateStruct;
  endedOnModel: NgbDateStruct;
  projectDetail: ProjectModal = null;
  currentCompany: any = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  projectManagers: Array<any> = [];
  clients: Array<any> = [];
  architects: Array<any> = [];
  applicationData: any = null;

  constructor(private fb: FormBuilder,
              private nav:iNavigation,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    let value = this.nav.getValue();
    if (value) {
      this.projectDetail = value;
      let date = new Date(this.projectDetail.ProjectStartedOn);
      this.startedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      date = new Date(this.projectDetail.ProjectEndedOn);
      this.endedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      this.projectDetail.TeamMemberIds = JSON.parse(this.projectDetail.TeamMemberIds);
    }
    else
      this.projectDetail = new ProjectModal();

    let data = this.local.findRecord("Companies");
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      }
    }
    this.loadData();
    this.initForm();
  }

  loadData() {
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.projectManagers = response.ResponseBody.Employees.filter(x => x.DesignationId == 1);
        this.architects = response.ResponseBody.Employees.filter(x => x.DesignationId == 2);
        this.clients = response.ResponseBody.Clients;
      }
    });
  }

  initForm() {
    if(this.projectDetail.ProjectManagerId == null)
      this.projectDetail.ProjectManagerId = 0;

    this.projectForm = this.fb.group({
      OrganizationName: new FormControl(this.currentCompany.OrganizationName),
      ProjectId: new FormControl(this.projectDetail.ProjectId),
      CompanyId: new FormControl(this.currentCompany.CompanyId),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      ProjectName: new FormControl(this.projectDetail.ProjectName, [Validators.required]),
      ProjectDescription: new FormControl(this.projectDetail.ProjectDescription, [Validators.required]),
      TeamMemberIds: new FormControl(this.projectDetail.TeamMemberIds, [Validators.required]),
      HomePageUrl: new FormControl(this.projectDetail.HomePageUrl),
      ProjectManagerId: new FormControl(this.projectDetail.ProjectManagerId, [Validators.required]),
      ArchitectId: new FormControl(this.projectDetail.ArchitectId),
      IsClientProject: new FormControl(this.projectDetail.IsClientProject),
      ClientId: new FormControl(this.projectDetail.ClientId),
      ProjectStartedOn: new FormControl(this.projectDetail.ProjectStartedOn),
      ProjectEndedOn: new FormControl(this.projectDetail.ProjectEndedOn)
    })
  }

  onStartedDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.projectForm.controls["ProjectStartedOn"].setValue(date);
  }

  onEndedDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.projectForm.controls["ProjectEndedOn"].setValue(date);
  }

  get f() {
    return this.projectForm.controls;
  }

  RegisterProject() {
    this.isLoading = true;
    this.submitted = true;
    if(this.projectForm.get("ProjectName").value == null && 
      this.projectForm.get("ProjectName").value == "") {
      this.isLoading = false;
      ErrorToast("Project name if mandatory. Please provide a valid name.");
      return;
    }

    let managerId = this.projectDetail.ProjectManagerId;
    if(managerId == null) {
      this.projectForm.get("ProjectName").setValue(0);
    }

    let value = this.projectForm.value;
    this.http.post("Project/AddUpdateProjectDetail", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Project created/updated successfully.");
      }
      this.isLoading = false;
    }).then(e => {
      this.isLoading = false;
    })
    console.log(value);
    this.isLoading = false;
  }
}

export class ProjectModal {
  ProjectId: number = 0;
  ProjectName: string = null;
  ProjectDescription: string = null;
  TeamMemberIds: string = null;
  HomePageUrl: string = null;
  ProjectManagerId: number = null;
  ArchitectId: number = 0;
  IsClientProject: boolean = false;
  ClientId: number = 0;
  ProjectStartedOn: Date = null;
  ProjectEndedOn: Date = null;
}
