import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage, GetRoles } from 'src/providers/ApplicationStorage';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Appraisal, SERVICE } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { PerformanceHttpService } from 'src/providers/AjaxServices/performance-http.service';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';
declare var $: any;

@Component({
  selector: 'app-manage-appraisal-category',
  templateUrl: './manage-appraisal-category.component.html',
  styleUrls: ['./manage-appraisal-category.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageAppraisalCategoryComponent implements OnInit {
  appraisalForm: FormGroup;
  isPageReady: boolean = false;
  currentApprisalCycle: ApprisalCycle = new ApprisalCycle();
  selectedWorkflow: any = null;
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
  node: any = null;
  orgTree: Array<any> = [];
  isTreeLoaded: boolean = false;
  company: any = null;
  approvalChainGroup: Array<any> = [];
  selectedRoleId: number = 0;
  orgHierarchy: Array<any> = [];
  appraisalChainLevel: Array<any> = [];
  selectNode: any = null;
  isOptional: boolean = false;
  isActive: boolean = false;

  constructor(
    private http: CoreHttpService,
    private performanceHttp: PerformanceHttpService,
    private filterHttp: EmployeeFilterHttpService,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.company = this.local.findRecord("Companies")[0];
    this.roles = GetRoles();
    this.designation.className = "disabled-input"
    this.roleList = new autoCompleteModal();
    this.roleList.placeholder = "Select Role";
    this.roleList.className = "";
    this.roles.forEach(x => {
      this.roleList.data.push({
        text: x.RoleName,
        value: x.RoleId,
        ParentNode: x.ParentNode,
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
    this.performanceHttp.get(`apprisalcatagory/getCategoryByCategoryId/${ObjectiveCatagoryId}`).then(res => {
      if (res.ResponseBody) {
        this.orgHierarchy = res.ResponseBody.OrganizationChain;
        this.appraisalChainLevel = res.ResponseBody.AppraisalChainLevel;
        // this.orgHierarchy = this.orgHierarchy.filter(x => !x.IsDepartment);
        if (res.ResponseBody.AppraisalCategory.length > 0) {
          if (this.orgHierarchy && this.orgHierarchy.length > 0) {
            this.orgHierarchy.forEach(x => {
              x.IsOptional = false;
            })
          }
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
      this.fromDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }
    }
    if (this.currentApprisalCycle.AppraisalCycleEndDate) {
      date = new Date(this.currentApprisalCycle.AppraisalCycleEndDate);
      this.toDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.SelfAppraisalStartDate) {
      date = new Date(this.currentApprisalCycle.SelfAppraisalStartDate);
      this.selfAppraisalFromDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.SelfAppraisalEndDate) {
      date = new Date(this.currentApprisalCycle.SelfAppraisalEndDate);
      this.selfAppraisalToDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.SelectionPeriodStartDate) {
      date = new Date(this.currentApprisalCycle.SelectionPeriodStartDate);
      this.selectionPeriodFromDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.SelectionPeriodEndDate) {
      date = new Date(this.currentApprisalCycle.SelectionPeriodEndDate);
      this.selectionPeriodToDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.MultiraterFeedBackStartDate) {
      date = new Date(this.currentApprisalCycle.MultiraterFeedBackStartDate);
      this.feedbackFromDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.MultiraterFeedBackEndDate) {
      date = new Date(this.currentApprisalCycle.MultiraterFeedBackEndDate);
      this.feedbackToDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.ReviewStartDate) {
      date = new Date(this.currentApprisalCycle.ReviewStartDate);
      this.reviewFromDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    if (this.currentApprisalCycle.ReviewEndDate) {
      date = new Date(this.currentApprisalCycle.ReviewEndDate);
      this.reviewToDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
    }

    this.selectedRoles = [];
    this.initForm();
    this.isApprisalCycleSelected();
    if (this.currentApprisalCycle.RoleIds && this.currentApprisalCycle.RoleIds.length > 0) {
      this.currentApprisalCycle.RoleIds.forEach(x => {
        let role = this.roles.find(i => i.RoleId == x);
        this.selectedRoles.push({
          RoleId: role.RoleId,
          RoleName: role.RoleName,
          ParentNode: role.ParentNode
        })

      });
      this.roleList.data.map(i => {
        if (this.selectedRoles.find(a => a.RoleId == i.value))
          i.selected = true;
        else
          i.selected = false;
      });
      this.groupedRoleLevel();
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
      AppraisalName: new FormControl(this.currentApprisalCycle.AppraisalName, [Validators.required])
    });
    this.appraisalForm.controls['IsRaterSelectedByManager'].disable();
    this.appraisalForm.controls['CanRaterViewAppraisal'].disable();
    this.appraisalForm.controls['IsRaterSelectedByManager'].disable();
    this.appraisalForm.controls['CanRaterViewAppraisal'].disable();
    this.appraisalForm.controls['IsRequiredRatersFeedback'].disable();
    this.appraisalForm.controls['IsSelfAppraisal'].disable();

  }

  get f() {
    return this.appraisalForm.controls;
  }

  viewAppraisalDetails(e: any) {
    this.isAppraisalCycleInSamePeriod = false;
    let value = e.target.value;
    if (value) {
      this.performanceHttp.get(`apprisalcatagory/getCategoryByCategoryId/${value}`).then(res => {
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
    this.minDate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    this.isApprisalCycleSelected();
  }

  onToDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.appraisalForm.controls["AppraisalCycleEndDate"].setValue(date);
    this.maxDate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
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
    this.performanceHttp.post("apprisalcatagory/addAppraisalType", value).then(res => {
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
    this.performanceHttp.put(`apprisalcatagory/updateAppraisalType/${this.currentApprisalCycle.ObjectiveCatagoryId}`, value).then(res => {
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
    if (index == -1) {
      let role = this.roleList.data.find(x => x.value == e.value);
      this.selectedRoles.push({
        RoleId: role.value,
        RoleName: role.text,
        ParentNode: role.ParentNode
      });
    } else {
      this.selectedRoles.splice(index, 1);
    }
    this.groupedRoleLevel();
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

  viewApprovalChainFlow() {
    if (Number(this.selectedRoleId) > 0) {
      this.isTreeLoaded = false;
      this.orgTree = [];
      let value = this.appraisalChainLevel.filter(x => x.RoleId == Number(this.selectedRoleId));
      if (value && value.length > 0) {
        value.forEach(x => {
          let org = this.orgHierarchy.find(i => i.RoleId == x.ApprovalRoleId);
          org.IsActive = x.IsActive;
          org.IsOptional = x.IsOptional;
          org.AppraisalChainLevelId = x.AppraisalChainLevelId;
          this.orgTree.push(org);
        });
        this.orgTree.push(this.orgHierarchy.find(i => i.RoleId == Number(this.selectedRoleId)));
        $("#worflowChainModal").modal("show");
        this.isTreeLoaded = true;
      } else {
        this.filterHttp.get(`orgtree/getOrgTreeByRole/${this.company.CompanyId}/${this.selectedRoleId}`)
        .then((respone: ResponseModel) => {
          if (respone) {
            this.orgTree = respone.ResponseBody;
            if (this.orgTree && this.orgTree.length > 0) {
              this.orgTree.forEach(x => {
                x.IsOptional = false;
                x.AppraisalChainLevelId = 0;
              })
            }
            //this.orgTree = this.orgTree.filter(x => !x.IsDepartment);
            Toast("Tree structure loaded successfully.");
            $("#worflowChainModal").modal("show");
            this.isTreeLoaded = true;
          } else {
            ErrorToast("Fail to add");
          }
        }).catch(e => {
          ErrorToast(e.error);
        });
      }
    }
  }

  groupedRoleLevel() {
    this.approvalChainGroup = [];
    let result = this.selectedRoles.reduce((a, b) => {
      a[b.ParentNode] = a[b.ParentNode] || [];
      a[b.ParentNode].push(b);
      return a;
    }, Object.create(null));
    let keys = Object.keys(result);
    let i = 0;
    while(i < keys.length) {
      this.approvalChainGroup.push({
        Name:result[keys[i]].map(x => x.RoleName).join(', '),
        RoleId:result[keys[i]].map(x => x.RoleId),
        ParentNode: keys[i]
      });
      i++;
    }
  }

  removeNode(e: any) {
    this.selectNode = e.currentTarget;
    let elem = e.currentTarget.getAttribute("data-index");
    if (!elem) {
      elem = e.currentTarget.querySelector('div[data-name="edit-tree"]').getAttribute("data-index");
      this.selectNode =  e.currentTarget.querySelector('div[data-name="edit-tree"]');
    }

    let roleId = Number(elem);
    let org = this.orgTree.find(x => x.RoleId == roleId);
    this.isOptional = org.IsOptional;
    this.isActive = !org.IsActive;
  }

  activeInactiveNod(e: any) {
    let value = e.target.checked;
    let roleId = Number(this.selectNode.getAttribute("data-index"));
    let removeRole = this.orgTree.find(x => x.RoleId == roleId);
    if (value) {
      removeRole.IsActive = false;
      // if (this.orgTree.filter(x => x.RoleId == removeRole.ParentNode).length > 0)
      //   this.orgTree.filter(x => x.ParentNode == roleId).map(i => i.ParentNode = removeRole.ParentNode);
      this.selectNode.classList.add("hide-node");
    } else {
      removeRole.IsActive = true;
      // if (this.orgTree.filter(x => x.RoleId == removeRole.ParentNode).length > 0)
      //   this.orgTree.filter(x => x.ParentNode == roleId).map(i => i.ParentNode = removeRole.ParentNode);
      this.selectNode.classList.remove("hide-node");
    }
  }

  isOptionalLevel(e: any) {
    let value = e.target.checked;
    let roleId = Number(this.selectNode.getAttribute("data-index"));
    let removeRole = this.orgTree.find(x => x.RoleId == roleId);
    removeRole.IsOptional = value;
  }

  saveAppraisallevel() {
    let ids = this.approvalChainGroup.map(x => x.RoleId);
    let selectedIds = [];
    let data = [];
    if (ids != null && ids.length > 0) {
      ids.forEach(x => {
        if (x.includes(Number(this.selectedRoleId))) {
          selectedIds = x;
        }
      })
    }
    if (selectedIds && selectedIds.length > 0) {
      // this.orgTree =this.orgTree.filter(x => !x.IsDepartment);
      this.orgTree.pop();
      let chain = [];
      this.orgTree.forEach(x => {
        chain.push({
          ApprovalRoleId: x.RoleId,
          IsActive: x.IsDepartment? false : x.IsActive,
          IsOptional: x.IsDepartment? false : x.IsOptional,
          AppraisalChainLevelId: x.AppraisalChainLevelId
        })
      })
      selectedIds.forEach(x => {
        chain.forEach(i => {
          data.push({
            AppraisalChainLevelId: i.AppraisalChainLevelId,
            ObjectiveCatagoryId: this.currentApprisalCycle.ObjectiveCatagoryId,
            RoleId: x,
            IsDefaultChain: this.orgTree.filter(y => y.IsActive == true).length > 0 ? true : false,
            ApprovalRoleId: i.ApprovalRoleId,
            IsActive: i.IsActive,
            IsOptional: i.IsOptional
          })
        })
      })
    }
    if (data && data.length > 0) {
      this.isLoading = false;
      this.performanceHttp.post("apprisalcatagory/manageAppraisalLevel", data).then((res: ResponseModel) => {
        if (res.ResponseBody) {
          $("#worflowChainModal").modal("hide");
          Toast("Approval chain level insert/update successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
        ErrorToast(e.error);
      })
    }
  }

  directApprovalClick(e: any) {
    let value = e.target.checked;
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
  AppraisalName: string = null;
}
