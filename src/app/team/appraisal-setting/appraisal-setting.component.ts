import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage, GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ConfigPerformance } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-appraisal-setting',
  templateUrl: './appraisal-setting.component.html',
  styleUrls: ['./appraisal-setting.component.scss']
})
export class AppraisalSettingComponent implements OnInit {
  isPageReady: boolean = false;
  appraisalForm: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  orderByCyclePeriodAsc: boolean = null;
  orderByTypeDescriptionAsc: boolean = null;
  orderByObjectiveCatagoryTypeAsc: boolean = null;
  apprisalData: Filter = new Filter();
  apprisalDetail: ApprisalCycle = new ApprisalCycle();
  apprisalCycleDetail: Array<ApprisalCycle> = [];
  currentApprisalCycle: ApprisalCycle = new ApprisalCycle();
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
  projectDetails: Array<any> = [];
  selectedProject: any = null;
  userDetail: any = null;
  isViewInList: boolean = true;
  isObjectiveFound: boolean = false;
  currentAppraisalObjective: Array<any> = [];
  active = 1;
  currentCompny: any = null;
  objectDetail: Objective = new Objective();
  objectiveData: Filter = new Filter();
  orderByObjectiveAsc: boolean = null;
  orderBTargetValueAsc: boolean = null;
  objectiveDetails: Array<any> = [];
  objectForm: FormGroup;
  currentObject: Objective = new Objective();
  htmlText: any = null;
  selectedObjective: Array<any> = [];
  isProjectDetailReady: boolean = false;
  designation: Array<any> = [];
  appraisalHikeForm: FormGroup;
  allProjectAppraisal: Array<any> = [];
  currentProjectAppraisal: any = null;
  isAmountExceed: boolean = false;
  roles: Array<any> = [];
  roleList: autoCompleteModal = null;
  selectedRoles: Array<any> = [];
  appraisalDetailAndCategory: Array<ApprisalCycle> = [];
  isAppraisalCycleInSamePeriod: boolean = false;
  minDate: any = null;
  maxDate: any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private nav: iNavigation,
              private local: ApplicationStorage,
              private user: UserService) {
  }

  ngOnInit(): void {
    this.roles = GetRoles();
    this.roleList = new autoCompleteModal();
    this.roleList.placeholder = "Select Role";
    this.roleList.className = "";
    this.roles.forEach(x => {
      this.roleList.data.push({
        text: x.RoleName,
        value: x.RoleId,
        selected: false
      })
    })
    this.designation = GetRoles();
    this.currentCompny = this.local.findRecord("Companies")[0];
    this.userDetail = this.user.getInstance();
    this.objectiveData.SearchString += ` And CompanyId = ${this.currentCompny.CompanyId}`;
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid user. Please login again;")
      return;
    }
    this.loadData();
    this.initForm();
    this.initObjetiveForm();
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
      AppraisalDetailId: new FormControl(this.currentApprisalCycle.AppraisalDetailId)
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

  buildAppraisalCategory(response: any) {
    this.apprisalCycleDetail = response;
    if (this.apprisalCycleDetail.length > 0) {
      this.apprisalData.TotalRecords = this.apprisalCycleDetail[0].Total;
      this.apprisalCycleDetail.forEach(x => {
        x.RoleIds = JSON.parse(x.RolesId);
        if (x.RoleIds.length > 0) {
          x.Tags = [];
          x.RoleIds.forEach(i => {
            let department = this.designation.find(y => y.RoleId == i);
            if (department) {
              x.Tags.push(department.RoleName);
            }
          })
        }
      })
    }
    else
      this.apprisalData.TotalRecords = 0;
  }

  loadData() {
    this.isPageReady = false;
    this.http.post("eps/apprisalcatagory/get", this.apprisalData, true).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.buildAppraisalCategory(response.ResponseBody);
        this.isPageReady = true;
      } else {
        Toast("No record found. Please create one.");
        this.isPageReady = true;
      }
    }).catch(e => {
      ErrorToast(e.error);
    });
  }

  resetFilter() {
    this.apprisalData.PageIndex = 1;
    this.apprisalData.PageSize = 10;
    this.apprisalData.StartIndex = 1;
    this.apprisalData.ObjectiveCatagoryType = null;
    this.apprisalData.TypeDescription = null;
    this.apprisalData.EndIndex = (this.apprisalData.PageSize * this.apprisalData.PageIndex);
    this.apprisalDetail.ObjectiveCatagoryType = null;
    this.apprisalDetail.TypeDescription = null;
    this.loadData();
  }

  filterRecords() {
    this.apprisalData.reset();
    if(this.apprisalDetail.ObjectiveCatagoryType !== null &&
      this.apprisalDetail.ObjectiveCatagoryType !== "")
      this.apprisalData.ObjectiveCatagoryType = this.apprisalDetail.ObjectiveCatagoryType;

    if(this.apprisalDetail.TypeDescription !== null)
      this.apprisalData.TypeDescription = this.apprisalDetail.TypeDescription;

      if(this.apprisalDetail.RolesId !== null)
      this.apprisalData.RolesId = this.apprisalDetail.RolesId;

    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'ASC';
    } else {
      Order = 'DESC';
    }
    if (FieldName == 'ObjectiveCatagoryType')
      this.orderByObjectiveCatagoryTypeAsc = !flag;
    if (FieldName == 'TypeDescription')
      this.orderByTypeDescriptionAsc = !flag;
    if (FieldName == 'AppraisalCycleStartDate')
      this.orderByCyclePeriodAsc = !flag;

    this.apprisalData = new Filter();
    this.apprisalData.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

  addAprisalCyclePopUp() {
    this.isSubmitted = false;
    this.currentApprisalCycle = new ApprisalCycle();
    this.selectedRoles = [];
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
    $('#manageApprisal').modal('show');
  }

  viewAppraisalDetails(e: any) {
    this.isAppraisalCycleInSamePeriod = false;
    let value = e.target.value;
    if (value) {
      this.http.get(`eps/apprisalcatagory/getCategoryByCategoryId/${value}`, true).then(res => {
        if (res.ResponseBody && res.ResponseBody.length > 0) {
          this.appraisalDetailAndCategory = res.ResponseBody;
          let data: ApprisalCycle = this.appraisalDetailAndCategory[0];
          data.ObjectiveCatagoryId = 0;
          data.ObjectiveCatagoryType = null;
          data.TypeDescription = null;
          data.RoleIds = [];
          data.ObjectiveIds = [];
          data.IsHikeApproval = false;
          data.Status = null;
          this.isAppraisalCycleInSamePeriod = true;
          this.editApprisalPopUp(data);
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  viewObjectiveAppraisalPopup(item: ApprisalCycle) {
    this.appraisalDetailAndCategory = [];
    this.isLoading = true;
    if (item) {
      this.http.get(`eps/apprisalcatagory/getCategoryByCategoryId/${item.ObjectiveCatagoryId}`, true).then(res => {
        if (res.ResponseBody && res.ResponseBody.length > 0) {
          this.appraisalDetailAndCategory = res.ResponseBody;
          this.isAppraisalCycleInSamePeriod = false;
          $('#manageAppraisalCategory').modal('show');
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  editApprisalPopUp(item: ApprisalCycle) {
    $('#manageAppraisalCategory').modal('hide');
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
    $('#manageApprisal').modal('show');
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.apprisalData = e;
      this.loadData();
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
    this.http.post("eps/apprisalcatagory/addAppraisalType", value, true).then(res => {
      if (res.ResponseBody) {
        this.buildAppraisalCategory(res.ResponseBody);
        this.currentAppraisalObjective = [];
        this.isAppraisalCycleInSamePeriod = false;
        $('#manageApprisal').modal('hide');
        Toast("Apprisal cycle inserted successfully");
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
    // this.http.post("eps/apprisalcatagory/addAppraisalType", value, true).then(res => {
    //   if (res.ResponseBody) {
    //     this.apprisalCycleDetail = res.ResponseBody;
    //     if (this.apprisalCycleDetail.length > 0)
    //       this.apprisalData.TotalRecords = this.apprisalCycleDetail[0].Total;
    //     else
    //       this.apprisalData.TotalRecords = 0;
    //     this.currentAppraisalObjective = [];
    //     this.isAppraisalCycleInSamePeriod = false;
    //     $('#manageApprisal').modal('hide');
    //     Toast("Apprisal cycle inserted successfully");
    //     this.isLoading = false;
    //   }
    // }).catch(e => {
    //   ErrorToast(e.error);
    //   this.isLoading = false;
    // })
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
        this.buildAppraisalCategory(res.ResponseBody);
        this.currentAppraisalObjective = [];
        $('#manageApprisal').modal('hide');
        Toast("Apprisal cycle inserted successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
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

  navigateToObjective(item: ApprisalCycle) {
    this.nav.navigate(ConfigPerformance, item)
  }

  showOffCanvas(item: any) {
    if (item) {
      this.isProjectDetailReady = false;
      this.currentApprisalCycle = item;
      this.getProjects();
    }
  }

  hideOffCanvas() {
    $('#offcanvasRight').offcanvas('hide');
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
    let value = this.appraisalHikeForm.value;
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

  getProjects() {
    this.projectDetails = [];
    this.selectedProject = null;
    // ${this.userDetail.UserId}
    this.http.get(`ps/projects/memberdetail/26`, true).then(res => {
      if (res.ResponseBody) {
        let project = res.ResponseBody.Project;
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
            var offcanvasRight = document.getElementById('offcanvasRight');
            var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
            bsOffcanvas.show();
            this.initAppraisalHike();
            this.isTotalAmountExceed();
          } else if(this.selectedProject.ProjectMembers.length <= 0) {
            ErrorToast("Please add team members");
            return;
          } else {
            ErrorToast("Please add project appraisal budgest");
            return;
          }
          this.isProjectDetailReady = true;
          Toast("Project details found");
        } else {
          WarningToast("Please add project and their team members first");
          this.isProjectDetailReady = true;
        }
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isProjectDetailReady = true;
    })
  }

  changeProject(item: any) {
    if (item) {
      this.selectedProject = this.projectDetails.find(x => x.ProjectId == item.ProjectId);
      this.currentProjectAppraisal = this.allProjectAppraisal.find(x => x.ProjectId == this.selectedProject.ProjectId);
      if (this.currentProjectAppraisal) {
        this.initAppraisalHike();
        this.isTotalAmountExceed();
      }
      else {
        ErrorToast("Please add project appraisal budgest");
        return;
      }
    }
  }

  closeCanvasRight() {
    var offcanvasRight = document.getElementById('offcanvasRight');
    var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
    bsOffcanvas.hide();
  }

  selectedAppraisal(index: number, item: any) {
    this.isObjectiveFound = false;
    this.currentApprisalCycle = item;
    if(index >= 0 &&  item.ObjectiveCatagoryId > 0) {
      let result = document.querySelectorAll('.list-group-item > a');
      let i = 0;
      while (i < result.length) {
        result[i].classList.remove('active-tab');
        i++;
      }

      result[index].classList.add('active-tab');
      this.getObjectiveByObjtiveId();

    } else {
      ErrorToast("Please select a appraisal group.")
    }
  }

  getObjectiveByObjtiveId() {
    this.isObjectiveFound = false;
    this.http.get(`eps/apprisalcatagory/getObjectiveByCategoryId/${this.currentApprisalCycle.ObjectiveCatagoryId}`, true).then(res => {
      if (res.ResponseBody) {
        this.currentAppraisalObjective = res.ResponseBody;
        this.isObjectiveFound = true;
      }
    })
  }

  loadAllObjective() {
    this.isPageReady = false;
    this.getAllPerformanceObjective();
  }

  getAllPerformanceObjective() {
    this.objectiveDetails = [];
    if (this.currentCompny.CompanyId > 0) {
      this.http.post("eps/performance/getPerformanceObjective", this.objectiveData, true)
      .then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          this.isPageReady = true;
          Toast("Record found");
        }
      }).catch(e => {
        ErrorToast(e.error);
        this.isPageReady = true;
      })
    }
  }

  bindData(res: any) {
    if (res.ResponseBody.length > 0) {
      this.objectiveDetails = res.ResponseBody;
      this.objectiveData.TotalRecords = this.objectiveDetails[0].Total;
      if (this.currentAppraisalObjective && this.currentAppraisalObjective.length > 0) {
        this.objectiveDetails.forEach(x => {
          let value = this.currentAppraisalObjective.find(i => i.ObjectiveId == x.ObjectiveId);
          if (value)
            x.IsAdded = true;
          else
            x.IsAdded = false;
        });
      }
    }
    else
      this.objectiveData.TotalRecords = 0;
  }

  initObjetiveForm() {
    this.objectForm = this.fb.group({
      ObjectiveId: new FormControl(this.currentObject.ObjectiveId),
      Objective: new FormControl(this.currentObject.Objective, [Validators.required]),
      CanManagerSee: new FormControl(this.currentObject.CanManagerSee ? 'true' :'false', [Validators.required]),
      IsIncludeReview: new FormControl(this.currentObject.IsIncludeReview),
      CompanyId: new FormControl(this.currentCompny.CompanyId),
      ProgressMeassureType: new FormControl(this.currentObject.ProgressMeassureType == 1 ? '1' : this.currentObject.ProgressMeassureType == 2 ? '2' : '3'),
      StartValue: new FormControl(this.currentObject.StartValue, [Validators.required]),
      TargetValue: new FormControl(this.currentObject.TargetValue, [Validators.required]),
      Description: new FormControl(''),
    })
  }

  get m() {
    return this.objectForm.controls;
  }

  addObjectivePopUp() {
    this.isSubmitted = false;
    this.currentObject = new Objective();
    this.initObjetiveForm();
    $('#addObjectiveModal').modal('show');
  }

  addObjective() {
    this.isLoading = true;
    this.isSubmitted = true;
    let errroCounter = 0;
    if (this.objectForm.get('Objective').errors !== null)
      errroCounter++;

    if (this.objectForm.get('CanManagerSee').errors !== null)
      errroCounter++;

    if (this.objectForm.get('StartValue').errors !== null)
      errroCounter++;

    if (this.objectForm.get('TargetValue').errors !== null)
      errroCounter++;

    let value = this.objectForm.value;
    if (errroCounter === 0 && value.CompanyId > 0) {
      let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
      if (data)
        value.Description = data;

      value.CanManagerSee = value.CanManagerSee == "true" ? true : false;
      this.http.post("eps/performance/objectiveInsertUpdate", value, true).then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          $('#addObjectiveModal').modal('hide');
          Toast("Objective insert/updated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        ErrorToast(e.error);
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
    }
  }

  resetFilterObjective() {
    this.objectiveData.SearchString = "1=1";
    this.objectiveData.PageIndex = 1;
    this.objectiveData.PageSize = 10;
    this.objectiveData.StartIndex = 1;
    this.objectiveData.ActivePageNumber = 1;
    this.objectiveData.EndIndex = (this.objectiveData.PageSize * this.objectiveData.PageIndex);
    this.getAllPerformanceObjective();
    this.objectDetail.Objective="";
    this.objectDetail.TargetValue = 0;
  }

  filterRecordsObjective() {
    let searchQuery = "";
    let delimiter = "";
    this.objectiveData.reset();
    if(this.objectDetail.Objective !== null && this.objectDetail.Objective !== "") {
      searchQuery += ` ${delimiter} Objective like '%${this.objectDetail.Objective}%' `;
        delimiter = "and";
    }

    if(this.objectDetail.TargetValue !== null && this.objectDetail.TargetValue > 0) {
      searchQuery += ` ${delimiter} TargetValue like '%${this.objectDetail.TargetValue}%' `;
        delimiter = "and";
    }

    if(searchQuery !== "") {
      this.objectiveData.SearchString = `${searchQuery}`;
    }

    this.getAllPerformanceObjective();
  }

  arrangeObjectiveDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'ASC';
    } else {
      Order = 'DESC';
    }
    if (FieldName == 'Objective')
      this.orderByObjectiveAsc = !flag;

    if (FieldName == 'TargetValue')
      this.orderBTargetValueAsc = !flag;

    this.objectiveData = new Filter();
    this.objectiveData.SortBy = FieldName + " " + Order;
    this.getAllPerformanceObjective()
  }

  GetFilterObjectiveResult(e: Filter) {
    if(e != null) {
      this.objectiveData = e;
      this.getAllPerformanceObjective();
    }
  }

  changeProgressMeassur(e: any) {
    let value = Number(e.target.value);
    if (value == 1) {
      this.objectForm.get('TargetValue').setValue(0);
      this.objectForm.get('StartValue').setValue(0);
    }
  }

  editObjectivePopUp(item: Objective) {
    if (item) {
      this.currentObject = item;
      this.htmlText = item.Description;
      this.initObjetiveForm();
      this.isSubmitted = false;
      $('#addObjectiveModal').modal('show');
    }
  }

  manageAppraisalObjectivePopUp() {
    this.getAllPerformanceObjective();
    this.selectedObjective = [...this.currentAppraisalObjective]
    $('#addAppraisalObjective').modal('show');
  }

  manageObjective(e: any, item: Objective) {
    let value = e.target.checked;
    if (value) {
      let objective = this.selectedObjective.find(x => x.ObjectiveId == item.ObjectiveId);
      if (objective == null)
        this.selectedObjective.push(item);
    } else {
      let index = this.selectedObjective.findIndex( x=> x.ObjectiveId == item.ObjectiveId);
      if (index != -1)
        this.selectedObjective.splice(index, 1);
    }
  }

  addAppraisalObjective() {
    this.isLoading = true;
    if (this.selectedObjective && this.selectedObjective.length > 0 && this.currentApprisalCycle && this.currentApprisalCycle.ObjectiveCatagoryId > 0) {
      this.currentApprisalCycle.ObjectiveIds = this.selectedObjective.map(x => x.ObjectiveId);
      this.http.put(`eps/apprisalcatagory/manageAppraisalCycle/${this.currentApprisalCycle.ObjectiveCatagoryId}`,this.currentApprisalCycle, true).then(res => {
        if (res.ResponseBody) {
          this.getObjectiveByObjtiveId();
          Toast("Objective added/updated in appraisal category successfully");
          $('#addAppraisalObjective').modal('hide');
          this.isLoading = false;
        }
      }).catch(e => {
        ErrorToast(e.error);
        this.isLoading = false;
      })
    } else {
      ErrorToast("Please select objective first");
      this.isLoading = false;
    }
  }

  listview() {
    this.isObjectiveFound = false;
    this.isViewInList = !this.isViewInList;
    if (!this.isViewInList) {
      if (this.apprisalCycleDetail.length > 0)
      this.currentApprisalCycle = this.apprisalCycleDetail[0];
      this.getObjectiveByObjtiveId();
    }
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
          FullName: new FormControl(data[i].FullName),
          MemberType: new FormControl(data[i].MemberType),
          DesignationName: new FormControl(data[i].DesignationName),
          AssignedOn: new FormControl(data[i].AssignedOn),
          CTC: new FormControl(data[i].CTC),
          ProposedPromotion: new FormControl(data[i].ProposedPromotion != null ? data[i].ProposedPromotion : 0),
          ProposedHikePercentage: new FormControl(data[i].ProposedHikePercentage != null ? data[i].ProposedHikePercentage : 0),
          ProposedHikeAmount: new FormControl(data[i].ProposedHikeAmount != null ? data[i].ProposedHikeAmount : 0),
          Experience: new FormControl(data[i].Experience != null ? data[i].Experience : 0)
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
        let hikeAmount = (ctc * value)/100;
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
      let hikeAmount = (ctc * equalpercent)/100;
      formArray.controls[i].get("ProposedHikePercentage").setValue(equalpercent);
      formArray.controls[i].get("ProposedHikeAmount").setValue(hikeAmount);
    }
    this.isTotalAmountExceed();
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
}

class ApprisalCycle {
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
}

class Objective {
  ObjectiveId: number = 0;
  Objective: string = null;
  CanManagerSee: boolean = false;
  IsIncludeReview: boolean = false;
  ProgressMeassureType: number = 1;
  StartValue: number = 0;
  TargetValue: number = 0;
  Description: string = null;
}

export class Filter {
  EmployeeId: number = 0;
  ClientId: number = 0;
  SearchString: string = "1=1";
  PageIndex: number = 1;
  StartIndex: number = 0;
  EndIndex: number = 0;
  PageSize: number = 10;
  SortBy: string = "";
  CompanyId: number = 0;
  TotalRecords: number = 0;
  ShowPageNo: number = 5;
  ActivePageNumber: number = 1;
  isReUseSame: boolean = false;
  isActive?: boolean = true;
  SortDirection: string = null;
  ObjectiveCatagoryType: string = null;
  TypeDescription: string = null;
  RolesId: string = null;

  update(total: any) {
    if(!isNaN(Number(total))) {
      this.TotalRecords = total;
      this.StartIndex = 1;
      this.PageIndex = 1;
    }
  }

  reset() {
    this.TotalRecords = 0;
    this.StartIndex = 1;
    this.PageIndex = 1;
    this.ActivePageNumber = 1;
    this.SortDirection = null;
  }
}
