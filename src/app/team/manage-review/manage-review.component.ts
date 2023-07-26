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
      ErrorToast(e.error);
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
    console.log(data)
    let dataArray: FormArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          fullName: new FormControl(data[i].FullName),
          memberType: new FormControl(data[i].MemberType),
          designationName: new FormControl(data[i].DesignationName),
          assignedOn: new FormControl(data[i].AssignedOn),
          cTC: new FormControl(data[i].CTC),
          employeeId: new FormControl(data[i].EmployeeId),
          promotedDesignation: new FormControl(data[i].ProposedPromotion != null ? data[i].ProposedPromotion : 0),
          hikePercentage: new FormControl(data[i].ProposedHikePercentage != null ? data[i].ProposedHikePercentage : 0),
          hikeAmount: new FormControl(data[i].ProposedHikeAmount != null ? data[i].ProposedHikeAmount : 0),
          experience: new FormControl(data[i].ExprienceInYear != null ? data[i].ExprienceInYear : 0),
          estimatedSalary: new FormControl(data[i].CTC),
          comments: new FormControl(data[i].Review),
          rating: new FormControl(data[i].Rating),
          projectId: new FormControl(data[i].ProjectId),
          companyId: new FormControl(data[i].CompanyId),
          appraisalDetailId: new FormControl(data[i].appraisalDetailId),
          appraisalReviewId: new FormControl(0),
          appraisalCycleStartDate: new FormControl(data[i].appraisalCycleStartDate)
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
      formArray.controls[i].get("hikeAmount").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("cTC").value;
        let hikeAmount = (ctc * value)/100;
        formArray.controls[i].get("hikeAmount").setValue(hikeAmount);
        formArray.controls[i].get("estimatedSalary").setValue(ctc + Number(hikeAmount));
      }
    } else {
      let elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("hikePercentage").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let hikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("hikePercentage").setValue(hikePercentage);
        formArray.controls[i].get("estimatedSalary").setValue(ctc + value);
      }
    }
  }

  proposedHikeAmountCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let value = Number(e.target.value);
    if (value > 0) {
      if (name == "ProposedHikePercentage") {
        let ctc = formArray.controls[i].get("cTC").value;
        let hikeAmount = ((ctc * value)/100).toFixed(2);
        formArray.controls[i].get("hikeAmount").setValue(hikeAmount);
        formArray.controls[i].get("estimatedSalary").setValue(ctc + Number(hikeAmount));
      } else {
        let ctc = formArray.controls[i].get("cTC").value;
        let hikePercentage = ((value * 100)/ctc).toFixed(2);
        formArray.controls[i].get("hikePercentage").setValue(hikePercentage);
        formArray.controls[i].get("estimatedSalary").setValue(ctc + value);
      }
      this.isTotalAmountExceed();
    }
  }

  isTotalAmountExceed() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    this.isAmountExceed = false;
    let totalAmount = formArray.value.map(x => Number(x.hikeAmount)).reduce((a, b) => {return a + b;}, 0);
    if (totalAmount > this.currentProjectAppraisal.ProjectAppraisalBudget)
      this.isAmountExceed = true;
  }

  equalPercentage() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let equalpercent = (100 / formArray.length).toFixed(2);
    for (let i = 0; i < formArray.length; i++) {
      let ctc = formArray.controls[i].get("cTC").value;
      let hikeAmount = ((ctc * Number(equalpercent))/100).toFixed(2);
      formArray.controls[i].get("hikePercentage").setValue(equalpercent);
      formArray.controls[i].get("hikeAmount").setValue(hikeAmount);
      formArray.controls[i].get("estimatedSalary").setValue(ctc + Number(hikeAmount));
    }
    this.isTotalAmountExceed();
  }

  applyHikeAndPromotion() {
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
    this.http.post("eps/promotion/addPromotionAndHike", value, true).then(res => {
      if (res.ResponseBody) {
        this.isLoading = false;
        //this.closeCanvasRight();
        Toast("Appraisal cycle started successfully");
      } else {
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

  showOffCanvas(item: any) {
    this.selectedEmploye = item.value;
    if (this.selectedEmploye && this.selectedEmploye.employeeId > 0) {
      var offcanvasRight = document.getElementById('riviewObjectiveOffCanvas');
      var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
      this.loadReviewDetail()
      bsOffcanvas.show();
    }
  }

  loadReviewDetail() {
    this.isObjectivesReady = false;
    let designationId = 0;
    this.http.get(`eps/performance/getEmployeeObjective/${designationId}/${this.userDetail.CompanyId}/${this.selectedEmploye.employeeId}`, true).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.objectives = res.ResponseBody;
        this.getUserNameIcon(this.selectedEmploye.fullName);
        console.log(this.objectives)
        Toast("Employee performance objective data loaded successsfully");
        this.isObjectivesReady = true;
      } else {
        WarningToast("No objective details found. Please contact to admin.");
        this.isObjectivesReady = true;
      }
    }).catch(err => {
      ErrorToast(err.error);
      this.isObjectivesReady = true;
    })
  }

  getUserNameIcon(fullName: string) {
    let names = fullName.split(" ");
    let first = names[0];
    let last = names[1];
    this.userNameIcon = first[0]+""+last[0];
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
