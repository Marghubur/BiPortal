import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Appraisal } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-manage-appraisal-category',
  templateUrl: './manage-appraisal-category.component.html',
  styleUrls: ['./manage-appraisal-category.component.scss']
})
export class ManageAppraisalCategoryComponent implements OnInit {
  appraisalForm: FormGroup;
  isPageReady: boolean = false;
  currentApprisalCycle: ApprisalCycle = new ApprisalCycle();
  selectedWorkflow: any = null;
  approvalWorkFlows: Array<any> = null;
  isAppraisalCycleInSamePeriod: boolean = false;
  apprisalCycleDetail: Array<ApprisalCycle> = [];
  isSubmitted: boolean = false;
  isLoading: boolean = false;
  fromDate: NgbDateStruct | null;
	toDate: NgbDateStruct | null;
  selfAppraisalFromDate: NgbDateStruct;
  selfAppraisalToDate: NgbDateStruct;
  selectionPeriodFromDate: NgbDateStruct;
  selectionPeriodToDate: NgbDateStruct;
  feedbackFromDate: NgbDateStruct;
  feedbackToDate: NgbDateStruct;
  reviewFromDate: NgbDateStruct;
  reviewToDate: NgbDateStruct;
  minDate: any = null;
  maxDate: any = null;
  roleList: autoCompleteModal = null;
  designation: autoCompleteModal = new autoCompleteModal();
  roles: Array<any> = [];
  selectedRoles: Array<any> = [];
  currentAppraisalObjective: Array<any> = [];
  appraisalDetailAndCategory: Array<any> = [];
  isWorkFlownChainShow: boolean = false;
  selectedWorkFlowDetail: any = null;

  constructor(private http: AjaxService,
              private nav:iNavigation,
              private fb: FormBuilder) {}

  ngOnInit(): void {
    this.roles = GetRoles();
    this.designation.className = "disabled-input"
    this.roleList = new autoCompleteModal();
    this.roleList.placeholder = "Select Role";
    this.roleList.className = "";
    this.roles.forEach(x => {
      this.roleList.data.push({
        text: x.RoleName,
        value: x.RoleId,
        selected: false
      })
      this.designation.data.push({
        text: x.RoleName,
        value: x.RoleId,
        selected: false
      })
    })
    this.isSubmitted = false;
    let data = this.nav.getValue();
    if (data) {
      this.loadData(data.ObjectiveCatagoryId);
    } else {
      this.currentApprisalCycle = new ApprisalCycle();
      this.selectedRoles = [];
      this.loadData(0);
      this.initForm();
      this.roleList.data.map(i => {
        i.selected = false;
      })
      this.fromDate = null;
      this.toDate = null;
      this.selfAppraisalFromDate = null;
      this.selfAppraisalToDate = null;
      this.selectionPeriodFromDate = null;
      this.selectionPeriodToDate = null;
      this.feedbackFromDate = null;
      this.feedbackToDate = null;
      this.reviewFromDate = null;
      this.reviewToDate = null;
      this.isApprisalCycleSelected();
    }
  }

  loadData(ObjectiveCatagoryId: number) {
    this.isPageReady = false;
    this.http.get(`eps/apprisalcatagory/getCategoryByCategoryId/${ObjectiveCatagoryId}`, true).then(res => {
      if (res.ResponseBody) {
        this.approvalWorkFlows = res.ResponseBody.ApprovalWorkflow;
        if (res.ResponseBody.AppraisalCategory.length > 0) {
          this.appraisalDetailAndCategory = res.ResponseBody.AppraisalCategory;
          this.onEditCategory(this.appraisalDetailAndCategory[0]);
        }
        this.apprisalCycleDetail = res.ResponseBody.ObjectiveCategory;
        this.isAppraisalCycleInSamePeriod = false;
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  onEditCategory(item: ApprisalCycle) {
    this.currentApprisalCycle = item;
    this.selectedRoles = [];
    let date;
    if (this.currentApprisalCycle.AppraisalCycleStartDate) {
      date = new Date(this.currentApprisalCycle.AppraisalCycleStartDate);
      this.fromDate={day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()}
    }
    if (this.currentApprisalCycle.AppraisalCycleEndDate) {
      date = new Date(this.currentApprisalCycle.AppraisalCycleEndDate);
      this.toDate = {day: date.getDate(),month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.SelfAppraisalStartDate) {
      date = new Date(this.currentApprisalCycle.SelfAppraisalStartDate);
      this.selfAppraisalFromDate= {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.SelfAppraisalEndDate) {
      date = new Date(this.currentApprisalCycle.SelfAppraisalEndDate);
      this.selfAppraisalToDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.SelectionPeriodStartDate) {
      date = new Date(this.currentApprisalCycle.SelectionPeriodStartDate);
      this.selectionPeriodFromDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.SelectionPeriodEndDate) {
      date = new Date(this.currentApprisalCycle.SelectionPeriodEndDate);
      this.selectionPeriodToDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.MultiraterFeedBackStartDate) {
      date = new Date(this.currentApprisalCycle.MultiraterFeedBackStartDate);
      this.feedbackFromDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.MultiraterFeedBackEndDate) {
      date = new Date(this.currentApprisalCycle.MultiraterFeedBackEndDate);
      this.feedbackToDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.ReviewStartDate) {
      date = new Date(this.currentApprisalCycle.ReviewStartDate);
      this.reviewFromDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    if (this.currentApprisalCycle.ReviewEndDate) {
      date = new Date(this.currentApprisalCycle.ReviewEndDate);
      this.reviewToDate = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    }

    this.selectedRoles = [];
    this.initForm();
    this.isApprisalCycleSelected();
    if (this.currentApprisalCycle.RoleIds && this.currentApprisalCycle.RoleIds.length > 0) {
      this.currentApprisalCycle.RoleIds.forEach(x => {
        let role = this.roles.find(i => i.RoleId == x);
        this.selectedRoles.push({
          RoleId : role.RoleId,
          RoleName: role.RoleName
        })

      });
      this.roleList.data.map(i => {
        if (this.selectedRoles.find(a => a.RoleId == i.value))
          i.selected = true;
        else
          i.selected = false;
      })
    }
  }

  initForm() {
    this.appraisalForm = this.fb.group({
      ObjectiveCatagoryType: new FormControl(this.currentApprisalCycle.ObjectiveCatagoryType, [Validators.required]),
      TypeDescription: new FormControl(this.currentApprisalCycle.TypeDescription, [Validators.required]),
      AppraisalCycleStartDate: new FormControl(this.currentApprisalCycle.AppraisalCycleStartDate),
      AppraisalCycleEndDate: new FormControl(this.currentApprisalCycle.AppraisalCycleEndDate),
      IsSelfAppraisal: new FormControl(this.currentApprisalCycle.IsSelfAppraisal),
      SelfAppraisalStartDate: new FormControl(this.currentApprisalCycle.SelfAppraisalStartDate),
      SelfAppraisalEndDate: new FormControl(this.currentApprisalCycle.SelfAppraisalEndDate),
      IsRequiredRatersFeedback: new FormControl(this.currentApprisalCycle.IsRequiredRatersFeedback),
      SelectionPeriodStartDate: new FormControl(this.currentApprisalCycle.SelectionPeriodStartDate),
      SelectionPeriodEndDate: new FormControl(this.currentApprisalCycle.SelectionPeriodEndDate),
      MultiraterFeedBackStartDate: new FormControl(this.currentApprisalCycle.MultiraterFeedBackStartDate),
      MultiraterFeedBackEndDate: new FormControl(this.currentApprisalCycle.MultiraterFeedBackEndDate),
      IsRaterSelectedByManager: new FormControl(this.currentApprisalCycle.IsRaterSelectedByManager),
      CanRaterViewAppraisal: new FormControl(this.currentApprisalCycle.CanRaterViewAppraisal),
      RoleIds: new FormControl(this.currentApprisalCycle.RoleIds),
      DepartmentIds: new FormControl(this.currentApprisalCycle.DepartmentIds),
      ReviewStartDate: new FormControl(this.currentApprisalCycle.ReviewStartDate, [Validators.required]),
      ReviewEndDate: new FormControl(this.currentApprisalCycle.ReviewEndDate, [Validators.required]),
      IsHikeApproval: new FormControl(this.currentApprisalCycle.IsHikeApproval),
      AppraisalDetailId: new FormControl(this.currentApprisalCycle.AppraisalDetailId),
      ApprovalWorkflowId: new FormControl(this.currentApprisalCycle.ApprovalWorkflowId),
      AppraisalName: new FormControl(this.currentApprisalCycle.AppraisalName, [Validators.required])
    });
    this.appraisalForm.controls['IsRaterSelectedByManager'].disable();
    this.appraisalForm.controls['CanRaterViewAppraisal'].disable();
    this.appraisalForm.controls['IsRaterSelectedByManager'].disable();
    this.appraisalForm.controls['CanRaterViewAppraisal'].disable();
    this.appraisalForm.controls['IsRequiredRatersFeedback'].disable();
    this.appraisalForm.controls['IsSelfAppraisal'].disable();
    if (this.currentApprisalCycle.ApprovalWorkflowId && this.currentApprisalCycle.ApprovalWorkflowId > 0)
      this.selectedWorkflow = this.approvalWorkFlows.find(x => x.ApprovalWorkFlowId == this.currentApprisalCycle.ApprovalWorkflowId);
  }

  get f() {
    return this.appraisalForm.controls;
  }

  viewAppraisalDetails(e: any) {
    this.isAppraisalCycleInSamePeriod = false;
    let value = e.target.value;
    if (value) {
      this.http.get(`eps/apprisalcatagory/getCategoryByCategoryId/${value}`, true).then(res => {
        if (res.ResponseBody && res.ResponseBody.AppraisalCategory.length > 0) {
          this.appraisalDetailAndCategory = res.ResponseBody.AppraisalCategory;
          let data: ApprisalCycle = this.appraisalDetailAndCategory[0];
          data.ObjectiveCatagoryId = 0;
          data.ObjectiveCatagoryType = null;
          data.TypeDescription = null;
          data.RoleIds = [];
          data.ObjectiveIds = [];
          data.IsHikeApproval = false;
          data.Status = null;
          this.isAppraisalCycleInSamePeriod = true;
          this.onEditCategory(data);
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["AppraisalCycleStartDate"].setValue(date);
    this.minDate = {year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate()};
    this.isApprisalCycleSelected();
  }

  onToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["AppraisalCycleEndDate"].setValue(date);
    this.maxDate = {year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate()};
    this.isApprisalCycleSelected();
  }

  onSelfAppraislFromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["SelfAppraisalStartDate"].setValue(date);
  }

  onSelfAppraislToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["SelfAppraisalEndDate"].setValue(date);
  }

  onSelectionPeriodFromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["SelectionPeriodStartDate"].setValue(date);
  }

  onSelectionPeriodToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["SelectionPeriodEndDate"].setValue(date);
  }

  onFeedbackFromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["MultiraterFeedBackStartDate"].setValue(date);
  }

  onFeedbackToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["MultiraterFeedBackEndDate"].setValue(date);
  }

  onReviewFromDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["ReviewStartDate"].setValue(date);
  }

  onReviewToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["ReviewEndDate"].setValue(date);
  }

  isApprisalCycleSelected() {
    if (this.appraisalForm.get('AppraisalCycleStartDate').value != null && this.appraisalForm.get('AppraisalCycleEndDate').value != null && !this.isAppraisalCycleInSamePeriod) {
      this.appraisalForm.controls['IsRaterSelectedByManager'].enable();
      this.appraisalForm.controls['CanRaterViewAppraisal'].enable();
      this.appraisalForm.controls['IsRequiredRatersFeedback'].enable();
      this.appraisalForm.controls['IsSelfAppraisal'].enable();
      this.appraisalForm.controls['IsRaterSelectedByManager'].enable();
      this.appraisalForm.controls['CanRaterViewAppraisal'].enable();
    }
  }

  selectSelfAppraisal(e: any) {
    let value = e.target.checked;
    if (value) {
      this.appraisalForm.get("SelfAppraisalStartDate").setValidators([Validators.required]);
      this.appraisalForm.get("SelfAppraisalStartDate").updateValueAndValidity();
      this.appraisalForm.get("SelfAppraisalEndDate").setValidators([Validators.required]);
      this.appraisalForm.get("SelfAppraisalEndDate").updateValueAndValidity();
      this.appraisalForm.get("AppraisalCycleStartDate").setValidators([Validators.required]);
      this.appraisalForm.get("AppraisalCycleStartDate").updateValueAndValidity();
      this.appraisalForm.get("AppraisalCycleEndDate").setValidators([Validators.required]);
      this.appraisalForm.get("AppraisalCycleEndDate").updateValueAndValidity();
    } else {
      this.appraisalForm.get("SelfAppraisalStartDate").removeValidators([Validators.required]);
      this.appraisalForm.get("SelfAppraisalStartDate").updateValueAndValidity();
      this.appraisalForm.get("SelfAppraisalEndDate").removeValidators([Validators.required]);
      this.appraisalForm.get("SelfAppraisalEndDate").updateValueAndValidity();
      this.appraisalForm.get("AppraisalCycleStartDate").removeValidators([Validators.required]);
      this.appraisalForm.get("AppraisalCycleStartDate").updateValueAndValidity();
      this.appraisalForm.get("AppraisalCycleEndDate").removeValidators([Validators.required]);
      this.appraisalForm.get("AppraisalCycleEndDate").updateValueAndValidity();
    }
  }

  selectMultiraterFeedback(e: any) {
    let value = e.target.checked;
    if (value) {
      this.appraisalForm.get("SelectionPeriodStartDate").setValidators([Validators.required]);
      this.appraisalForm.get("SelectionPeriodStartDate").updateValueAndValidity();
      this.appraisalForm.get("SelectionPeriodEndDate").setValidators([Validators.required]);
      this.appraisalForm.get("SelectionPeriodEndDate").updateValueAndValidity();
      this.appraisalForm.get("MultiraterFeedBackStartDate").setValidators([Validators.required]);
      this.appraisalForm.get("MultiraterFeedBackStartDate").updateValueAndValidity();
      this.appraisalForm.get("MultiraterFeedBackEndDate").setValidators([Validators.required]);
      this.appraisalForm.get("MultiraterFeedBackEndDate").updateValueAndValidity();
      this.appraisalForm.controls['IsRaterSelectedByManager'].enable();
      this.appraisalForm.controls['CanRaterViewAppraisal'].enable();
    } else {
      this.appraisalForm.get("SelectionPeriodStartDate").removeValidators([Validators.required]);
      this.appraisalForm.get("SelectionPeriodStartDate").updateValueAndValidity();
      this.appraisalForm.get("SelectionPeriodEndDate").removeValidators([Validators.required]);
      this.appraisalForm.get("SelectionPeriodEndDate").updateValueAndValidity();
      this.appraisalForm.get("MultiraterFeedBackStartDate").removeValidators([Validators.required]);
      this.appraisalForm.get("MultiraterFeedBackStartDate").updateValueAndValidity();
      this.appraisalForm.get("MultiraterFeedBackEndDate").removeValidators([Validators.required]);
      this.appraisalForm.get("MultiraterFeedBackEndDate").updateValueAndValidity();
      this.appraisalForm.controls['IsRaterSelectedByManager'].disable();
      this.appraisalForm.controls['CanRaterViewAppraisal'].disable();
    }
  }

  changeWorkflow(e: any) {
    let value = Number(e.target.value);
    if (value > 0)
      this.selectedWorkflow = this.approvalWorkFlows.find(x => x.ApprovalWorkFlowId == value);
  }

  addApprisalCycle() {
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.appraisalForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    if (this.selectedRoles.length <= 0) {
      this.isLoading = false;
      ErrorToast("Please select role first");
      return;
    }
    let value = this.appraisalForm.value;
    value.RoleIds = this.selectedRoles.map(x => x.RoleId);
    this.http.post("eps/apprisalcatagory/addAppraisalType", value, true).then(res => {
      if (res.ResponseBody) {
        this.currentAppraisalObjective = [];
        this.isAppraisalCycleInSamePeriod = false;
        Toast("Apprisal cycle inserted successfully");
        this.nav.navigate(Appraisal, null);
        this.isLoading = false;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isLoading = false;
    })
  }

  addApprisalInSameCycle() {
    this.isLoading = true;
    this.isSubmitted = true;

    if (this.appraisalForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    if (this.selectedRoles.length <= 0) {
      this.isLoading = false;
      ErrorToast("Please select role first");
      return;
    }
    let value = this.appraisalForm.value;
    value.RoleIds = this.selectedRoles.map(x => x.RoleId);
  }

  updateApprisalCycle() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.appraisalForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
      return;
    }
    if (this.selectedRoles.length <= 0) {
      this.isLoading = false;
      ErrorToast("Please select role first");
      return;
    }
    let value = this.appraisalForm.value;
    value.RoleIds = this.selectedRoles.map(x => x.RoleId);
    this.http.put(`eps/apprisalcatagory/updateAppraisalType/${this.currentApprisalCycle.ObjectiveCatagoryId}`, value, true).then(res => {
      if (res.ResponseBody) {
        this.currentAppraisalObjective = [];
        Toast("Apprisal cycle inserted successfully");
        this.nav.navigate(Appraisal, null);
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  selectedroles(e: any) {
    let index = this.selectedRoles.findIndex(x => x.RoleId == e.value);
    if(index == -1) {
      let role = this.roleList.data.find(x => x.value == e.value);
      this.selectedRoles.push({
        RoleId : role.value,
        RoleName: role.text
      });
    } else {
      this.selectedRoles.splice(index, 1);
    }
  }

  viewWorkflowChain() {
    this.isWorkFlownChainShow = !this.isWorkFlownChainShow;
    if (this.isWorkFlownChainShow) {
      this.http.get(`ApprovalChain/GetApprovalChainData/${this.selectedWorkflow.ApprovalWorkFlowId}`)
      .then(res => {
        if (res.ResponseBody) {
          this.selectedWorkFlowDetail = res.ResponseBody.approvalWorkFlowChain;
          console.log(this.selectedWorkFlowDetail)
        }
      })
    }
  }

}

export class ApprisalCycle {
  ObjectiveCatagoryType: string = null;
  TypeDescription: string = null;
  AppraisalCycleStartDate: Date = null;
  AppraisalCycleEndDate: Date = null;
  Total: number = 0;
  ObjectiveCatagoryId: number = 0;
  Index: number = 0;
  Status: String = null;
  ObjectiveIds: Array<number> = [];
  IsSelfAppraisal: boolean = false;
  SelfAppraisalStartDate: Date = null;
  SelfAppraisalEndDate: Date = null;
  SelectionPeriodStartDate: Date = null;
  SelectionPeriodEndDate: Date = null;
  MultiraterFeedBackStartDate: Date = null;
  MultiraterFeedBackEndDate: Date = null;
  RoleIds: Array<number> = [];
  DepartmentIds: number = 1;
  ReviewStartDate: Date = null;
  ReviewEndDate: Date = null;
  IsHikeApproval: boolean = false;
  IsRequiredRatersFeedback: boolean = false;
  IsRaterSelectedByManager: boolean = false;
  CanRaterViewAppraisal: boolean = false;
  AppraisalDetailId: number = 0;
  RatersRequired: boolean = false;
  RolesId: string = null;
  Tags: Array<string> = [];
  ApprovalWorkflowId: number = 0;
  AppraisalName: string = null;
}
