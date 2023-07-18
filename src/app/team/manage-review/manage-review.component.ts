import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;
import 'bootstrap';
import { ItemStatus } from 'src/providers/constants';

@Component({
  selector: 'app-manage-review',
  templateUrl: './manage-review.component.html',
  styleUrls: ['./manage-review.component.scss']
})
export class ManageReviewComponent implements OnInit {
  isPageReady: boolean = false;
  appraisalHikeForm: FormGroup;
  isLoading: boolean = false;
  isAmountExceed: boolean = false;
  roles: Array<any> = [];
  selectedProject: any = null;
  projectDetails: Array<any> = [];
  allProjectAppraisal: Array<any> = [];
  userDetail: any = null;
  designation: Array<any> = null;
  currentProjectAppraisal: any = null;
  objectives: Array<any> = [];
  isObjectivesReady: boolean = false;
  userNameIcon: string = "";
  selectedEmploye: any = null;
  selectedTeam: any = null;

  constructor(private nav:iNavigation,
              private http: AjaxService,
              private fb: FormBuilder,
              private user: UserService) {}

  ngOnInit(): void {
    this.selectedTeam = this.nav.getValue();
    if (this.selectedTeam && this.selectedTeam.Team) {
      this.userDetail = this.user.getInstance();
      this.designation = GetRoles();
      this.getProjectsMembers();
    }
  }

  getProjectsMembers() {
    this.selectedProject = null;
    this.projectDetails = [];
    this.http.get(`ps/projects/memberdetail/${this.userDetail.UserId}`, true).then(res => {
      if (res.ResponseBody) {
        let project = res.ResponseBody.Project;
        project = project.filter(x => x.Team == this.selectedTeam.Team);
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
            this.initAppraisalHike();
          } else if(this.selectedProject.ProjectMembers.length <= 0) {
            ErrorToast("Please add team members");
            return;
          } else {
            ErrorToast("Please add project appraisal budgest");
            return;
          }
          this.isPageReady = true;
          Toast("Project details found");
        } else {
          WarningToast("Please add project and their team members first");
          this.isPageReady = true;
        }
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  initAppraisalHike() {
    this.appraisalHikeForm = this.fb.group({
      ProjectMemberHike: this.buildProjectMemberHike()
    })
  }

  buildProjectMemberHike(): FormArray {
    let data = this.selectedProject.ProjectMembers;
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
          EmployeeId: new FormControl(data[i].EmployeeId),
          ProposedPromotion: new FormControl(data[i].ProposedPromotion != null ? data[i].ProposedPromotion : 0),
          ProposedHikePercentage: new FormControl(data[i].ProposedHikePercentage != null ? data[i].ProposedHikePercentage : 0),
          ProposedHikeAmount: new FormControl(data[i].ProposedHikeAmount != null ? data[i].ProposedHikeAmount : 0),
          Experience: new FormControl(data[i].ExprienceInYear != null ? data[i].ExprienceInYear : 0)
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

  proposedHikeCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    if (name == "ProposedHikePercentage") {
      let elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("ProposedHikeAmount").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikeAmount = (ctc * value)/100;
        formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
      }
    } else {
      let elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("ProposedHikePercentage").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("ProposedHikePercentage").setValue(hikePercentage);
      }
    }
  }

  proposedHikeAmountCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let value = Number(e.target.value);
    if (value > 0) {
      if (name == "ProposedHikePercentage") {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikeAmount = (Math.round(ctc * value)/100).toFixed(2);
        formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
      } else {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("ProposedHikePercentage").setValue(hikePercentage);
      }
      this.isTotalAmountExceed();
    }
  }

  isTotalAmountExceed() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    this.isAmountExceed = false;
    let totalAmount = formArray.value.map(x => Number(x.ProposedHikeAmount)).reduce((a, b) => {return a + b;}, 0);
    if (totalAmount > this.currentProjectAppraisal.ProjectAppraisalBudget)
      this.isAmountExceed = true;
  }

  equalPercentage() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let equalpercent = 100 / formArray.length;
    for (let i = 0; i < formArray.length; i++) {
      let ctc = formArray.controls[i].get("CTC").value;
      let hikeAmount = (Math.round(ctc * equalpercent)/100).toFixed(2);
      formArray.controls[i].get("ProposedHikePercentage").setValue(Math.round(equalpercent).toFixed(2));
      formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
    }
    this.isTotalAmountExceed();
  }

  startCycle() {
    this.isLoading = true;
    if (this.appraisalHikeForm.invalid) {
      ErrorToast("Please fill all the manditory field");
      this.isLoading = false;
      return;
    }
    if (this.isAmountExceed) {
      ErrorToast("Hike amount is exceed from project appraisal budget");
      this.isLoading = false;
      return;
    }
    let value = this.appraisalHikeForm.get('ProjectMemberHike').value;
    // this.http.put(`eps/apprisalcatagory//${this.currentApprisalCycle.ObjectiveCatagoryId}`, value, true).then(res => {
    //   if (res.ResponseBody) {
    //     this.isLoading = false;
    //     this.closeCanvasRight();
    //     Toast("Appraisal cycle started successfully");
    //   }
    // }).catch(e => {
    //   this.isLoading = false;
    // })
    console.log(value)
  }

  showOffCanvas(item: any) {
    this.selectedEmploye = item.value;
    if (this.selectedEmploye && this.selectedEmploye.EmployeeId > 0) {
      var offcanvasRight = document.getElementById('riviewObjectiveOffCanvas');
      var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
      this.loadReviewDetail()
      bsOffcanvas.show();
    }
  }

  loadReviewDetail() {
    this.isObjectivesReady = false;
    let designationId = 0;
    this.http.get(`eps/performance/getEmployeeObjective/${designationId}/${this.userDetail.CompanyId}/${this.selectedEmploye.EmployeeId}`, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.objectives = res.ResponseBody;
        this.getUserNameIcon(this.selectedEmploye.FullName);
        console.log(this.objectives)
        Toast("Employee performance objective data loaded successsfully");
        this.isObjectivesReady = true;
      } else {
        WarningToast("No objective details found. Please contact to admin.");
        this.isObjectivesReady = true;
      }
    }).catch(err => {
      ErrorToast("Fail to get objective detail. Please contact to admin.");
      this.isObjectivesReady = true;
    })
  }

  getUserNameIcon(fullName: string) {
    let names = fullName.split(" ");
    let first = fullName[0];
    let last = fullName[1];
    this.userNameIcon = first+""+last;
  }

  rejectObjective() {
    this.isLoading = true;
    this.http.get(`eps/performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.EmployeeId}/${ItemStatus.Rejected}`, true).then(res => {
      if (res.ResponseBody) {
        Toast("Objective rejected");
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

  approveObjective() {
    this.isLoading = true;
    this.http.get(`eps/performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.EmployeeId}/${ItemStatus.Approved}`, true).then(res => {
      if (res.ResponseBody) {
        Toast("Objective approved successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

 }
