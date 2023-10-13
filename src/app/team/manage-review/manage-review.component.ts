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
  selectedProject: any = null;
  projectDetails: Array<any> = [];
  allProjectAppraisal: Array<any> = [];
  appraisalReviewDetail: Array<any> = [];
  userDetail: any = null;
  designation: Array<any> = null;
  currentProjectAppraisal: any = null;
  objectives: Array<any> = [];
  isObjectivesReady: boolean = false;
  userNameIcon: string = "";
  selectedEmploye: any = null;
  project: any = null;
  promotionAndHikeForm: FormGroup;
  selectedPromotionAndHike: any = null;
  isSubmitted: boolean = false;

  constructor(private nav:iNavigation,
              private http: AjaxService,
              private fb: FormBuilder,
              private user: UserService) {}

  ngOnInit(): void {
    this.project = this.nav.getValue();
    this.userDetail = this.user.getInstance();
    this.designation = GetRoles();
    this.getProjectsMembers();
  }

  getProjectsMembers() {
    this.selectedProject = null;
    this.projectDetails = [];
    this.http.get(`ps/projects/memberdetail/${this.userDetail.UserId}/${this.project.ProjectId}`, true).then(res => {
      if (res.ResponseBody) {
        let project = res.ResponseBody.Project;
        // project = project.filter(x => x.Team == this.selectedTeam.Team);
        this.allProjectAppraisal = res.ResponseBody.ProjectAppraisal;
        this.appraisalReviewDetail = res.ResponseBody.ReviewDetail;
        if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0)
          this.isSubmitted = true;

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
          if (this.selectedProject.ProjectMembers.length > 0) {
            this.initAppraisalHike();
          } else  {
            this.isPageReady = true;
            ErrorToast("Please add team members");
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
    let dataArray: FormArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        let reviewDetail = null;
        if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0)
          reviewDetail = this.appraisalReviewDetail.find(x => x.ProjectId == data[i].ProjectId && x.CompanyId == data[i].CompanyId && x.EmployeeId == data[i].EmployeeId);

        dataArray.push(this.fb.group({
          fullName: new FormControl(data[i].FullName),
          memberType: new FormControl(data[i].MemberType),
          designationName: new FormControl(data[i].DesignationName),
          assignedOn: new FormControl(data[i].AssignedOn),
          cTC: new FormControl(data[i].CTC),
          employeeId: new FormControl(data[i].EmployeeId),
          promotedDesignation: new FormControl({value: reviewDetail != null ? reviewDetail.PromotedDesignation : 0, disabled: true}),
          hikePercentage: new FormControl(reviewDetail == null ? 0 : reviewDetail.HikePercentage),
          hikeAmount: new FormControl(reviewDetail == null ? 0 : reviewDetail.HikeAmount),
          experience: new FormControl(data[i].ExprienceInYear != null ? data[i].ExprienceInYear : 0),
          estimatedSalary: new FormControl(reviewDetail == null ? data[i].CTC : reviewDetail.EstimatedSalary),
          comments: new FormControl(reviewDetail == null ? "" : reviewDetail.Comments),
          rating: new FormControl(reviewDetail == null ? 0 : reviewDetail.Rating),
          projectId: new FormControl(data[i].ProjectId),
          companyId: new FormControl(data[i].CompanyId),
          appraisalDetailId: new FormControl(reviewDetail == null ? 0 : reviewDetail.AppraisalDetailId),
          appraisalReviewId: new FormControl(reviewDetail == null ? 0 : reviewDetail.AppraisalReviewId),
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
    let value = Number(e.target.value);
    if (value > 0) {
      if (name == "ProposedHikePercentage") {
        let hikeAmount = ((this.selectedPromotionAndHike.cTC * value)/100).toFixed(2);
        this.selectedPromotionAndHike.hikeAmount = hikeAmount;
        this.selectedPromotionAndHike.estimatedSalary = this.selectedPromotionAndHike.cTC + Number(hikeAmount);
      } else {
        let hikePercentage = ((value * 100)/this.selectedPromotionAndHike.cTC).toFixed(2);
        this.selectedPromotionAndHike.hikePercentage = hikePercentage;
        this.selectedPromotionAndHike.estimatedSalary = this.selectedPromotionAndHike.cTC + value;
      }
    } else {
      this.selectedPromotionAndHike.hikePercentage = 0;
      this.selectedPromotionAndHike.hikeAmount = 0;
    }
    // let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    // if (value > 0) {
    //   if (name == "ProposedHikePercentage") {
    //     let ctc = formArray.controls[i].get("cTC").value;
    //     let hikeAmount = ((ctc * value)/100).toFixed(2);
    //     formArray.controls[i].get("hikeAmount").setValue(hikeAmount);
    //     formArray.controls[i].get("estimatedSalary").setValue(ctc + Number(hikeAmount));
    //   } else {
    //     let ctc = formArray.controls[i].get("cTC").value;
    //     let hikePercentage = ((value * 100)/ctc).toFixed(2);
    //     formArray.controls[i].get("hikePercentage").setValue(hikePercentage);
    //     formArray.controls[i].get("estimatedSalary").setValue(ctc + value);
    //   }
    //   this.isTotalAmountExceed();
    // }
  }

  isTotalAmountExceed() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    this.isAmountExceed = false;
    let totalAmount = formArray.value.map(x => Number(x.hikeAmount)).reduce((a, b) => {return a + b;}, 0);
    if (this.currentProjectAppraisal && totalAmount > this.currentProjectAppraisal.ProjectAppraisalBudget)
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
    if (this.isSubmitted) {
      ErrorToast("You already submmited your review");
      this.isLoading = false;
      return;
    }
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
        this.appraisalReviewDetail = res.ResponseBody;
        if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0)
          this.isSubmitted = true;
        this.isLoading = false;
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
    this.http.get(`eps/performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.employeeId}/${ItemStatus.Rejected}`, true).then(res => {
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
    this.http.get(`eps/performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.employeeId}/${ItemStatus.Approved}`, true).then(res => {
      if (res.ResponseBody) {
        Toast("Objective approved successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

  promotionHikePopUp(item: FormGroup) {
    this.promotionAndHikeForm = item;
    this.selectedPromotionAndHike = item.value;
    this.promotionAndHikeForm.controls['promotedDesignation'].enable();
    $("#promotionHikeModal").modal('show');
  }

  applyPromotionHikeChanges() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let value = formArray.value.find(x => x.employeeId == this.selectedPromotionAndHike.employeeId);
    value.promotedDesignation = this.selectedPromotionAndHike.promotedDesignation;this.selectedPromotionAndHike.promotedDesignation;
    value.hikePercentage = this.selectedPromotionAndHike.hikePercentage;
    value.hikeAmount = this.selectedPromotionAndHike.hikeAmount;
    value.estimatedSalary =this.selectedPromotionAndHike.estimatedSalary;
    value.rating = this.selectedPromotionAndHike.rating;
    value.comments = this.selectedPromotionAndHike.comments;
    this.appraisalHikeForm.controls['ProjectMemberHike'].patchValue(formArray.value);
    this.promotionAndHikeForm.controls['promotedDesignation'].disable();
    $("#promotionHikeModal").modal('hide');
  }

  closePromotionHikePopup() {
    this.promotionAndHikeForm.controls['promotedDesignation'].disable();
  }
 }
