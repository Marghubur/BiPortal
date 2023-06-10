import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  isLoaded: boolean  = false;
  project: any = null;
  submitted: boolean = false;
  projectAppraisal: Array<ProjectAppraisal> = [];
  projectAppraisalForm: FormGroup;
  isLoading: boolean = false;
  selectedProjectAppraisal: ProjectAppraisal = new ProjectAppraisal();
  fromModel: NgbDateStruct;
  toModel: NgbDateStruct;

  constructor(private nav: iNavigation,
              private http: AjaxService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data) {
      this.project = data;
      this.selectedProjectAppraisal.ProjectId = this.project.ProjectId;
      console.log(this.project);
      this.loadData();
      this.initForm();
    } else {
      ErrorToast("Please select a valid project");
    }
  }

  loadData() {
    this.isLoaded = false;
    this.http.get(`ps/projectsAppraisal/getProjectAppraisal/${this.project.ProjectId}`, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectAppraisal = res.ResponseBody;
        Toast("Record found");
      } else {
        WarningToast("Please add project budgest first");
      }
      this.isLoaded = true;
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoaded = true;
    })
  }

  initForm() {
    this.projectAppraisalForm = this.fb.group({
      ProjectName: new FormControl(this.project.ProjectName),
      ProjectAppraisalId: new FormControl(this.selectedProjectAppraisal.ProjectAppraisalId, [Validators.required]),
      ProjectId: new FormControl(this.selectedProjectAppraisal.ProjectId, [Validators.required]),
      FromDate: new FormControl(this.selectedProjectAppraisal.FromDate, [Validators.required]),
      ToDate: new FormControl(this.selectedProjectAppraisal.ToDate, [Validators.required]),
      ProjectAppraisalBudget: new FormControl(this.selectedProjectAppraisal.ProjectAppraisalBudget, [Validators.required])
    })
  }

  addProjectAppraisalPopUp() {
    this.submitted = false;
    this.selectedProjectAppraisal = new ProjectAppraisal();
    this.selectedProjectAppraisal.ProjectId = this.project.ProjectId;
    this.initForm();
    $('#manageProjectAppraisal').modal('show');
  }

  editProjectAppraisalPopUp(item: any) {
    if (item) {
      this.submitted = false;
      this.selectedProjectAppraisal = item;
      let date = new Date(this.selectedProjectAppraisal.FromDate);
      this.fromModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      date = new Date(this.selectedProjectAppraisal.ToDate);
      this.toModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      this.initForm();
      $('#manageProjectAppraisal').modal('show');
    }
  }

  addProjectAppraisal() {
    this.isLoading = true;
    this.submitted = true;
    if (this.projectAppraisalForm.invalid) {
      ErrorToast("Please correct all the mandaroty field marked red");
      this.isLoading = false;
      return;
    }
    let value = this.projectAppraisalForm.value;
    this.http.post("ps/projectsAppraisal/addProjectAppraisal", value, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectAppraisal = res.ResponseBody;
        $('#manageProjectAppraisal').modal('hide');
        Toast("Project appraisal insert/ updated successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

  updateProjectAppraisal() {
    this.isLoading = true;
    this.submitted = true;
    if (this.projectAppraisalForm.invalid) {
      ErrorToast("Please correct all the mandaroty field marked red");
      this.isLoading = false;
      return;
    }
    let value = this.projectAppraisalForm.value;
    if (value.ProjectAppraisalId > 0) {
      this.http.put(`ps/projectsAppraisal/updateProjectAppraisal/${value.ProjectAppraisalId}`, value, true).then(res => {
        if (res.ResponseBody && res.ResponseBody.length > 0) {
          this.projectAppraisal = res.ResponseBody;
          $('#manageProjectAppraisal').modal('hide');
          Toast("Project appraisal insert/ updated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        ErrorToast(e.error);
        this.isLoading = false;
      })
    }
  }

  onFromDateSelect(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.projectAppraisalForm.controls["FromDate"].setValue(date);
  }

  onToDateSelect(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.projectAppraisalForm.controls["ToDate"].setValue(date);
  }

  get f() {
    return this.projectAppraisalForm.controls;
  }

}

class ProjectAppraisal {
  ProjectAppraisalId: number = 0;
  ProjectId: number = 0;
  FromDate: Date = null;
  ToDate: Date = null;
  ProjectAppraisalBudget: number = null;
  MembersCount: number = 0;
}
