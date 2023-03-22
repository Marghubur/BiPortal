import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

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
  projectId: number = 0;
  employees: Array<any> = [];
  projectManagerName: string = "";
  architectName: string = "";
  teamMembers: Array<any> = [];
  employeesList: autoCompleteModal = null;

  constructor(private fb: FormBuilder,
              private nav:iNavigation,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    let value = this.nav.getValue();
    this.employeesList = new autoCompleteModal();
    this.employeesList.data = [];
    this.employeesList.placeholder = "Team Member";
    this.employeesList.data = GetEmployees();
    this.employeesList.className = "";
    this.employeesList.isMultiSelect = true;
    if (value)
      this.projectId = value.ProjectId;
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
  }

  loadData() {
    this.isReady = false;
    this.http.get(`Project/GetProjectPageDetail/${this.projectId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        if (response.ResponseBody.Project && response.ResponseBody.Project.length > 0) {
          this.projectDetail = response.ResponseBody.Project[0];
          let date = new Date(this.projectDetail.ProjectStartedOn);
          this.startedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          date = new Date(this.projectDetail.ProjectEndedOn);
          this.endedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          this.projectDetail.TeamMemberIds = JSON.parse(this.projectDetail.TeamMemberIds);
        } else {
          this.projectDetail = new ProjectModal();
        }
        this.employees = response.ResponseBody.Employees;
        this.projectManagers = response.ResponseBody.Employees.filter(x => x.DesignationId == 1);
        this.architects = response.ResponseBody.Employees.filter(x => x.DesignationId == 2);
        this.clients = response.ResponseBody.Clients;
        if (response.ResponseBody.TeamMembers && response.ResponseBody.TeamMembers.length > 0) {
          this.teamMembers = response.ResponseBody.TeamMembers;
        }
        this.initForm();
        this.isReady = true;
      }
    }).catch(e => {
      this.isReady = true;
    });
  }

  initForm() {
    if(this.projectDetail.ProjectManagerId == null)
      this.projectDetail.ProjectManagerId = 0;

    let isClientProject = false;
    if(this.projectDetail.IsClientProject)
      isClientProject = true;

    this.projectForm = this.fb.group({
      OrganizationName: new FormControl(this.currentCompany.OrganizationName),
      ProjectId: new FormControl(this.projectDetail.ProjectId),
      CompanyId: new FormControl(this.currentCompany.CompanyId),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      ProjectName: new FormControl(this.projectDetail.ProjectName, [Validators.required]),
      ProjectDescription: new FormControl(this.projectDetail.ProjectDescription),
      TeamMemberIds: new FormControl(this.projectDetail.TeamMemberIds),
      HomePageUrl: new FormControl(this.projectDetail.HomePageUrl),
      ProjectManagerId: new FormControl(this.projectDetail.ProjectManagerId),
      ArchitectId: new FormControl(this.projectDetail.ArchitectId),
      IsClientProject: new FormControl(isClientProject),
      ClientId: new FormControl(this.projectDetail.ClientId),
      ProjectStartedOn: new FormControl(this.projectDetail.ProjectStartedOn),
      ProjectEndedOn: new FormControl(this.projectDetail.ProjectEndedOn),
      TeamLeadId: new FormControl(this.projectDetail.TeamLeadId)
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
    if (this.teamMembers.length > 0) {
      value.TeamMembers = this.teamMembers;
    }
    this.http.post("Project/AddUpdateProjectDetail", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        let id = Number(res.ResponseBody);
        this.projectForm.get("ProjectId").setValue(id);
        Toast("Project created/updated successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  addMemberPopUp() {
    let projectManagerid = this.projectForm.get('ProjectManagerId').value;
    if (projectManagerid > 0){
      let manager = this.employees.find(x => x.EmployeeUid == projectManagerid);
      this.projectManagerName = manager.FirstName + " " + manager.LastName;
    }
    let architectid = this.projectForm.get('ArchitectId').value;
    if (projectManagerid > 0){
      let manager = this.employees.find(x => x.EmployeeUid == architectid);
      this.architectName = manager.FirstName + " " + manager.LastName;
    }
    $("#teamMemberModal").modal('show');
  }

  selectedEmployee(e: any) {
    let index = this.teamMembers.findIndex(x => x.EmployeeId == e.value);
    if(index == -1) {
      let emp = this.employees.find(x => x.EmployeeUid == e.value);
      this.teamMembers.push({
        ProjectMemberDetailId : 0,
        ProjectId : 0,
        EmployeeId : emp.EmployeeUid,
        DesignationId : emp.DesignationId,
        FullName : emp.FirstName + " " + emp.LastName,
        Email : emp.Email,
        IsActive : true
      });
    } else {
      this.teamMembers.splice(index, 1);
    }
  }

  closeAddMemberPopUp() {
    $('#teamMemberModal').modal('hide');
  }

  deleteTeamMember(item: any) {
    this.isLoading = true;
    if (item) {
      this.http.delete(`Project/DeleteTeamMember/${item.ProjectMemberDetailId}/${item.ProjectId}`).then(res => {
        if (res.ResponseBody) {
          this.teamMembers = res.ResponseBody;
          Toast("Team member deleted successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
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
  TeamLeadId: number = 0;
}
