import { Component, DoCheck, OnInit } from '@angular/core';
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
export class ManageProjectComponent implements OnInit, DoCheck {
  isReady: boolean = true;
  projectForm: FormGroup;
  isCompaniesDetails: boolean = true;
  startedOnModel: NgbDateStruct;
  endedOnModel: NgbDateStruct;
  projectDetail: ProjectModal = null;
  currentCompany: any = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  clients: Array<any> = [];
  projectId: number = 0;
  employees: Array<any> = [];
  teamMembers: Array<any> = [];
  employeesList: autoCompleteModal = null;

  constructor(private fb: FormBuilder,
              private nav:iNavigation,
              private local: ApplicationStorage,
              private http: AjaxService) { }
  ngDoCheck(): void {
    this.onChnages();
  }

  ngOnInit(): void {
    let value = this.nav.getValue();
    this.employeesList = new autoCompleteModal();
    this.employeesList.data = [];
    this.employeesList.placeholder = "Team Member";
    this.employeesList.className = "";

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

  onChnages() {
    if (this.projectForm) {
      this.projectForm.get('IsClientProject').valueChanges.subscribe(x => {
        if (x == 'false') {
          this.projectForm.get('ClientId').setValue(0);
          this.projectForm.get('ClientId').disable();
        } else {
          this.projectForm.get('ClientId').enable();
        }
      })
    }
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
        } else {
          this.projectDetail = new ProjectModal();
        }

        this.employees = GetEmployees();
        this.clients = response.ResponseBody.Clients;

        if (response.ResponseBody.TeamMembers && response.ResponseBody.TeamMembers.length > 0) {
          this.teamMembers = response.ResponseBody.TeamMembers;

          this.employees.map(item => {
            if(this.teamMembers.find(x => x.EmployeeId == item.value)) {
              item.selected = true;
            } else {
              item.selected = false;
            }

            this.employeesList.data.push(item);
          });
        } else {
          this.employeesList.data = this.employees;
        }

        this.initForm();
        this.isReady = true;
      }
    }).catch(e => {
      this.isReady = true;
    });
  }



  initForm() {
    this.projectForm = this.fb.group({
      OrganizationName: new FormControl(this.currentCompany.OrganizationName),
      ProjectId: new FormControl(this.projectDetail.ProjectId),
      CompanyId: new FormControl(this.currentCompany.CompanyId),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      ProjectName: new FormControl(this.projectDetail.ProjectName, [Validators.required]),
      ProjectDescription: new FormControl(this.projectDetail.ProjectDescription),
      HomePageUrl: new FormControl(this.projectDetail.HomePageUrl),
      ClientId: new FormControl({value: this.projectDetail.ClientId, disabled: this.projectDetail.IsClientProject ? false : true}),
      IsClientProject: new FormControl(this.projectDetail.IsClientProject ? 'true' : 'false'),
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
    let errroCounter = 0;
    if(this.projectForm.get("ProjectName").value == null || this.projectForm.get("ProjectName").value == "")
        errroCounter++;
    let teammember = this.teamMembers.filter(x => x.DesignationId != 2 && x.DesignationId != 3);
    if (teammember.length > 0) {
      let notSelectedGrade = teammember.filter(x => x.Grade == null || x.Grade == "");
      if (notSelectedGrade.length > 0) {
        ErrorToast("Please add employee's grade first");
        this.isLoading = false;
        return;
      }
      let membertype = teammember.filter(x => x.MemberType == null || x.MemberType == 0);
      if (membertype.length > 0) {
        this.isLoading = false;
        ErrorToast("Please add type of the employee first");
        return;
      }
    }
    if (errroCounter === 0) {
      let value = this.projectForm.value;
      if (this.teamMembers.length > 0) {
        value.TeamMembers = this.teamMembers;
        let member = value.TeamMembers.filter(x => x.MemberType == null)
        if (member.length > 0) {
          member.forEach(y => {
            y.MemberType = 0;
          });
        }
      }

      if(value.ArchitectId == null) {
        value.ArchitectId = 0;
      }

      this.http.post("Project/AddUpdateProjectDetail", value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          if (res.ResponseBody) {
            this.projectDetail =res.ResponseBody;
            this.projectId = this.projectDetail.ProjectId;
            let date = new Date(this.projectDetail.ProjectStartedOn);
            this.startedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
            date = new Date(this.projectDetail.ProjectEndedOn);
            this.endedOnModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
            if (res.ResponseBody.TeamMembers && res.ResponseBody.TeamMembers.length > 0)
              this.teamMembers = res.ResponseBody.TeamMembers;
          }

          Toast("Project created/updated successfully.");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Please correct all the mandaroty field marked red");
      this.isLoading = false;
    }
  }

  addMemberPopUp() {
    $("#teamMemberModal").modal('show');
  }

  selectedEmployee(e: any) {
    let index = this.teamMembers.findIndex(x => x.EmployeeId == e.value);
    if(index == -1) {
      let emp = this.employees.find(x => x.value == e.value);
      this.teamMembers.push({
        ProjectMemberDetailId : 0,
        ProjectId : 0,
        EmployeeId : emp.value,
        DesignationId : 0,
        FullName : emp.text,
        Email : emp.email,
        MemberType: 13,
        Grade: null,
        IsActive : true
      });
    } else {
      this.teamMembers.splice(index, 1);
    }
  }

  // selectedTeamLead(e: any) {
  //   let value = Number(e.target.value);
  //   let index = this.teamMembers.findIndex(x => x.EmployeeId == value);
  //   if(index == -1) {
  //     let emp = this.employees.find(x => x.EmployeeUid == value);
  //     this.teamMembers.push({
  //       ProjectMemberDetailId : 0,
  //       ProjectId : 0,
  //       EmployeeId : emp.EmployeeUid,
  //       DesignationId : emp.DesignationId,
  //       FullName : emp.FirstName + " " + emp.LastName,
  //       Email : emp.Email,
  //       IsActive : true
  //     });
  //   } else {
  //     this.teamMembers.splice(index, 1);
  //   }
  // }

  closeAddMemberPopUp() {
    $('#teamMemberModal').modal('hide');
  }

  deleteTeamMember(item: any) {
    if (item) {
      this.isLoading = true;
      this.http.delete(`Project/DeleteTeamMember/${item.ProjectMemberDetailId}/${item.ProjectId}`).then(res => {
        if (res.ResponseBody) {
          this.teamMembers = res.ResponseBody;
          Toast("Team member deleted successfully");
        }
        this.isLoading = false;
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
  HomePageUrl: string = null;
  IsClientProject: boolean = true;
  ClientId: number = 0;
  ProjectStartedOn: Date = null;
  ProjectEndedOn: Date = null;
}
