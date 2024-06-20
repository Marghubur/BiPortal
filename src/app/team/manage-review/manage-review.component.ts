import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;
import 'bootstrap';
import { ItemStatus } from 'src/providers/constants';
import { ResponseModel } from 'src/auth/jwtService';
import { ProjectHttpService } from 'src/providers/AjaxServices/project-http.service';
import { PerformanceHttpService } from 'src/providers/AjaxServices/performance-http.service';

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
  projectAppraisalBudget: any = null;
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
  submittedEmpObj: Array<any> = [];
  isRevisedEnable: boolean = true;
  revisedAppraisalComment: string = null;
  allAppraisalReviewsDetail: AppraisalReviewsDetail = {Budget: 0, NoOfEmployee: 0, ProjectManagerName: "", SalaryAmountAfterHike: 0, SalaryAmountBeforeHike: 0};

  constructor(private nav:iNavigation,
              private projectHttp: ProjectHttpService,
              private performanceHttp: PerformanceHttpService,
              private fb: FormBuilder,
              private user: UserService) {}

  ngOnInit(): void {
    this.project = this.nav.getValue();
    this.userDetail = this.user.getInstance();
    this.designation = GetRoles();
    this.getProjectsMembers();
  }

  getProjectsMembers() {
    this.projectHttp.get(`projects/memberdetail/${this.userDetail.UserId}/${this.project.ProjectId}`).then(res => {
      if (res.ResponseBody) {
        this.submittedEmpObj = res.ResponseBody.Project;
        if (res.ResponseBody.ProjectAppraisal && res.ResponseBody.ProjectAppraisal.length > 0)
          this.projectAppraisalBudget = res.ResponseBody.ProjectAppraisal[0];

        this.appraisalReviewDetail = res.ResponseBody.ReviewDetail;
        if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0) {
          if (this.appraisalReviewDetail.findIndex(x => x.AppraisalStatus == 9) >= 0)
            this.isSubmitted = true;
          else
            this.isSubmitted = false;
        }

        if (this.submittedEmpObj.length > 0) {
          this.initAppraisalHike();
          this.allAppraisalReviewsDetail = {
            NoOfEmployee : this.appraisalHikeForm.value.ProjectMemberHike.length,
            ProjectManagerName: "dsdf",
            Budget: this.projectAppraisalBudget != null ? this.projectAppraisalBudget.ProjectAppraisalBudget : 0,
            SalaryAmountAfterHike: this.appraisalHikeForm.value.ProjectMemberHike.map(x => x.EstimatedSalary).reduce((acc, curr) => { return acc + curr; }, 0),
            SalaryAmountBeforeHike: this.appraisalHikeForm.value.ProjectMemberHike.map(x => x.CTC).reduce((acc, curr) => { return acc + curr; }, 0)
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
    let data = this.submittedEmpObj;
    let dataArray: FormArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        let reviewDetail = null;
        let comment = null;
        if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0){
          reviewDetail = this.appraisalReviewDetail.find(x => x.ProjectId == data[i].ProjectId && x.CompanyId == data[i].CompanyId && x.EmployeeId == data[i].EmployeeId);
          if (reviewDetail)
            comment = JSON.parse(reviewDetail.Comments)[0].Comments;
        }
        dataArray.push(this.fb.group({
          FullName: new FormControl(data[i].FullName),
          MemberType: new FormControl(data[i].MemberType),
          DesignationName: new FormControl(data[i].DesignationName),
          CTC: new FormControl(data[i].CTC),
          EmployeeId: new FormControl(data[i].EmployeeId),
          PromotedDesignation: new FormControl({value: reviewDetail != null ? reviewDetail.PromotedDesignation : 0, disabled: true}),
          HikePercentage: new FormControl(reviewDetail == null ? 0 : reviewDetail.HikePercentage),
          HikeAmount: new FormControl(reviewDetail == null ? 0 : reviewDetail.HikeAmount),
          Experience: new FormControl(data[i].ExprienceInYear != null ? data[i].ExprienceInYear : 0),
          EstimatedSalary: new FormControl(reviewDetail == null ? data[i].CTC : reviewDetail.EstimatedSalary),
          Comments: new FormControl(reviewDetail == null ? "" : reviewDetail.Comments),
          FirstComments: new FormControl(reviewDetail == null ? "" : comment),
          Rating: new FormControl(reviewDetail == null ? 0 : reviewDetail.Rating),
          ProjectId: new FormControl(this.project.ProjectId),
          CompanyId: new FormControl(data[i].CompanyId),
          ObjectiveStatus: new FormControl(data[i].Status),
          AppraisalStatus: new FormControl(reviewDetail != null ? reviewDetail.AppraisalStatus : 0),
          AppraisalDetailId: new FormControl(reviewDetail == null ? 0 : reviewDetail.AppraisalDetailId),
          AppraisalReviewId: new FormControl(reviewDetail == null ? 0 : reviewDetail.AppraisalReviewId),
          AppraisalCycleStartDate: new FormControl(data[i].AppraisalCycleStartDate),
          Status: new FormControl(reviewDetail != null ? reviewDetail.Status : 0),
          DesignationId: new FormControl(data[i].DesignationId),
          ObjectiveCategoryId: new FormControl(data[i].ObjectiveCategoryId),
          IsActive: new FormControl(reviewDetail == null ? true : reviewDetail.IsActive)
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
      formArray.controls[i].get("HikeAmount").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let HikeAmount = (ctc * value)/100;
        formArray.controls[i].get("HikeAmount").setValue(HikeAmount);
        formArray.controls[i].get("EstimatedSalary").setValue(ctc + Number(HikeAmount));
      }
    } else {
      let elem = document.getElementsByName("ProposedHikePercentage")[i];
      elem.setAttribute("readonly", "");
      elem = document.getElementsByName("ProposedHikeAmount")[i];
      elem.removeAttribute("readonly");
      formArray.controls[i].get("HikePercentage").setValue(0);
      let value = Number(e.target.value);
      if (value > 0) {
        let ctc = formArray.controls[i].get("CTC").value;
        let HikePercentage = (value * 100)/ctc;
        formArray.controls[i].get("HikePercentage").setValue(HikePercentage);
        formArray.controls[i].get("EstimatedSalary").setValue(ctc + value);
      }
    }
  }

  proposedHikeAmountCheck(e: any, i: number) {
    let name = e.target.attributes.name.value;
    let value = Number(e.target.value);
    if (value > 0) {
      if (name == "ProposedHikePercentage") {
        let HikeAmount = ((this.selectedPromotionAndHike.CTC * value)/100).toFixed(2);
        this.selectedPromotionAndHike.HikeAmount = HikeAmount;
        this.selectedPromotionAndHike.EstimatedSalary = this.selectedPromotionAndHike.CTC + Number(HikeAmount);
      } else {
        let HikePercentage = ((value * 100)/this.selectedPromotionAndHike.CTC).toFixed(2);
        this.selectedPromotionAndHike.HikePercentage = HikePercentage;
        this.selectedPromotionAndHike.EstimatedSalary = this.selectedPromotionAndHike.CTC + value;
      }
    } else {
      this.selectedPromotionAndHike.HikePercentage = 0;
      this.selectedPromotionAndHike.HikeAmount = 0;
    }
    // let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    // if (value > 0) {
    //   if (name == "ProposedHikePercentage") {
    //     let ctc = formArray.controls[i].get("cTC").value;
    //     let HikeAmount = ((ctc * value)/100).toFixed(2);
    //     formArray.controls[i].get("HikeAmount").setValue(HikeAmount);
    //     formArray.controls[i].get("EstimatedSalary").setValue(ctc + Number(HikeAmount));
    //   } else {
    //     let ctc = formArray.controls[i].get("cTC").value;
    //     let HikePercentage = ((value * 100)/ctc).toFixed(2);
    //     formArray.controls[i].get("HikePercentage").setValue(HikePercentage);
    //     formArray.controls[i].get("EstimatedSalary").setValue(ctc + value);
    //   }
    //   this.isTotalAmountExceed();
    // }
  }

  isTotalAmountExceed() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    this.isAmountExceed = false;
    let totalAmount = formArray.value.map(x => Number(x.HikeAmount)).reduce((a, b) => {return a + b;}, 0);
    if (this.currentProjectAppraisal && totalAmount > this.currentProjectAppraisal.ProjectAppraisalBudget)
      this.isAmountExceed = true;
  }

  equalPercentage() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let equalpercent = (100 / formArray.length).toFixed(2);
    for (let i = 0; i < formArray.length; i++) {
      let ctc = formArray.controls[i].get("CTC").value;
      let HikeAmount = ((ctc * Number(equalpercent))/100).toFixed(2);
      formArray.controls[i].get("HikePercentage").setValue(equalpercent);
      formArray.controls[i].get("HikeAmount").setValue(HikeAmount);
      formArray.controls[i].get("EstimatedSalary").setValue(ctc + Number(HikeAmount));
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
    let value = this.appraisalHikeForm.get('ProjectMemberHike').getRawValue();
    let errorCount = 0;
    value.forEach(x => {
      if ( x.IsActive && x.ObjectiveStatus == 0) {
        errorCount++;
      }
    });
    if (errorCount == 0) {
      this.performanceHttp.post("promotion/addPromotionAndHike", value).then(res => {
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
    } else {
      ErrorToast("Objective of all the employee are not submitted");
      this.isLoading = false;
    }
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
    let DesignationId = 0;
    this.performanceHttp.get(`performance/getEmployeeObjective/${DesignationId}/${this.userDetail.CompanyId}/${this.selectedEmploye.EmployeeId}`).then(res => {
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
    this.performanceHttp.get(`performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.EmployeeId}/${ItemStatus.Rejected}`).then(res => {
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
    this.performanceHttp.get(`performance/changeEmployeeObjectiveStatus/${this.selectedEmploye.EmployeeId}/${ItemStatus.Approved}`).then(res => {
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
    let value = item.value
    if(value.AppraisalReviewId == 0 || value.AppraisalStatus == 10) {
      this.promotionAndHikeForm = item;
      this.selectedPromotionAndHike = item.value;
      this.selectedPromotionAndHike.PromotedDesignation ="0";
      this.promotionAndHikeForm.controls['PromotedDesignation'].enable();
      this.selectedPromotionAndHike.Comments = "";
      $("#promotionHikeModal").modal('show');
    } else {
      this.selectedPromotionAndHike = value;
      $("#reopenAppraisalModal").modal('show');
    }
  }

  applyPromotionHikeChanges() {
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    let value = formArray.value.find(x => x.EmployeeId == this.selectedPromotionAndHike.EmployeeId);
    value.PromotedDesignation = this.selectedPromotionAndHike.PromotedDesignation;
    value.HikePercentage = this.selectedPromotionAndHike.HikePercentage;
    value.HikeAmount = this.selectedPromotionAndHike.HikeAmount;
    value.EstimatedSalary =this.selectedPromotionAndHike.EstimatedSalary;
    value.Rating = this.selectedPromotionAndHike.Rating;
    value.Comments = this.selectedPromotionAndHike.Comments;
    value.FirstComments = this.selectedPromotionAndHike.Comments;
    this.appraisalHikeForm.controls['ProjectMemberHike'].patchValue(formArray.value);
    this.promotionAndHikeForm.controls['PromotedDesignation'].disable();
    $("#promotionHikeModal").modal('hide');
  }

  closePromotionHikePopup() {
    this.promotionAndHikeForm.controls['PromotedDesignation'].disable();
  }

  reOpenCurrentAppraidal() {
    if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0) {
      this.isLoading =true;
      let value = this.appraisalReviewDetail.map(x => x.AppraisalReviewId)
      this.performanceHttp.put(`promotion/reOpenAppraisalObjective/${this.userDetail.UserId}`, value)
      .then((response: ResponseModel) => {
        if (response) {
          this.isSubmitted = false;
          this.isLoading = false;
          Toast("Current appraisal object re-opened successfully");
        } else {
          this.isLoading = false;
          ErrorToast("Fail to re-opened appraisal object");
        }
      }).catch((e: any) => {
        this.isLoading = false;
      });
    }
  }

  editEmployeeObjective(item: any) {
    let value = item.value;
    if (value) {
      console.log(value)
      this.isLoading =true;
      this.performanceHttp.get(`promotion/reOpenEmployeeObjective/${value.EmployeeId}/${value.AppraisalDetailId}`)
      .then((response: ResponseModel) => {
        if (response) {
          this.isLoading = false;
          Toast("Selected employee appraisal object re-opened successfully");
        } else {
          this.isLoading = false;
          ErrorToast("Fail to re-opened appraisal object");
        }
      }).catch((e: any) => {
        this.isLoading = false;
      });
    }
  }

  removeEmployee(e: any, i: number) {
    let staus = e.target.checked;
    let formArray = this.appraisalHikeForm.get('ProjectMemberHike') as FormArray;
    if (staus) {
      formArray.controls[i].get("IsActive").setValue(true);
    } else {
      formArray.controls[i].get("IsActive").setValue(false);
    }
  }

  revisedAppraisalPopUp() {
    $("#revisedModal").modal('show');
    this.revisedAppraisalComment = null;
  }

  revisedAppraisal() {
    if (!this.revisedAppraisalComment) {
      ErrorToast("Please add comments first");
      return;
    }
    if (this.appraisalReviewDetail && this.appraisalReviewDetail.length > 0) {
      this.isLoading =true;
      this.performanceHttp.post("promotion/revisedAppraisal", this.appraisalReviewDetail)
      .then((response: ResponseModel) => {
        if (response) {
          this.isSubmitted = false;
          this.isLoading = false;
          $("#revisedModal").modal('hide');
          Toast("Appraisal send for revised successfully");
        } else {
          this.isLoading = false;
          ErrorToast("Fail to revised the appraisal");
        }
      }).catch((e: any) => {
        this.isLoading = false;
      });
    }
  }
}

interface AppraisalReviewsDetail {
  ProjectManagerName: string,
  NoOfEmployee: number,
  SalaryAmountBeforeHike: number,
  SalaryAmountAfterHike: number,
  Budget: number
}
