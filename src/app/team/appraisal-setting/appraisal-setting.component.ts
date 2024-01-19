import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage, GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { ConfigPerformance, ManageAppraisalCategory } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import { ApprisalCycle } from '../manage-appraisal-category/manage-appraisal-category.component';
declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-appraisal-setting',
  templateUrl: './appraisal-setting.component.html',
  styleUrls: ['./appraisal-setting.component.scss']
})
export class AppraisalSettingComponent implements OnInit {
  isPageReady: boolean = false;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  orderByCyclePeriodAsc: boolean = null;
  orderByTypeDescriptionAsc: boolean = null;
  orderByObjectiveCatagoryTypeAsc: boolean = null;
  apprisalData: Filter = new Filter();
  apprisalDetail: ApprisalCycle = new ApprisalCycle();
  apprisalCycleDetail: Array<ApprisalCycle> = [];
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
  designation: Array<any> = [];
  appraisalDetailAndCategory: Array<ApprisalCycle> = [];
  currentApprisalCycle:ApprisalCycle = new ApprisalCycle();
  selectedAppraisalCycle:any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private nav: iNavigation,
              private local: ApplicationStorage,
              private user: UserService) {
  }

  ngOnInit(): void {
    this.designation = GetRoles();
    this.currentCompny = this.local.findRecord("Companies")[0];
    this.userDetail = this.user.getInstance();
    this.objectiveData.SearchString += ` And CompanyId = ${this.currentCompny.CompanyId}`;
    if (this.userDetail.UserId <= 0) {
      ErrorToast("Invalid user. Please login again;")
      return;
    }
    this.loadData();
    this.initObjetiveForm();
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
    this.nav.navigate(ManageAppraisalCategory, null);
  }

  viewObjectiveAppraisalPopup(item: ApprisalCycle) {
    this.nav.navigate(ManageAppraisalCategory, item);
  }


  editApprisalPopUp(item: ApprisalCycle) {
    this.nav.navigate(ManageAppraisalCategory, item);
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.apprisalData = e;
      this.loadData();
    }
  }

  navigateToObjective(item: ApprisalCycle) {
    this.nav.navigate(ConfigPerformance, item)
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
      //let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
      let data = document.getElementById("editor").innerHTML;
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

  changeAppraisalStatusPopUp(item: any) {
    this.selectedAppraisalCycle = item;
    $("#confirmationModal").modal('show');
  }

  changeAppraisalStatus() {
    if (this.selectedAppraisal) {
      this.isLoading = true;
      let value = {
        AppraisalDetailId: this.selectedAppraisalCycle.AppraisalDetailId,
        IsActiveCycle: !this.selectedAppraisalCycle.IsActiveCycle
      }
      this.http.post("eps/apprisalcatagory/manageAppraisalCategory", value, true).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.buildAppraisalCategory(res.ResponseBody);
          if (value.IsActiveCycle)
            Toast("Appraisal cycle activated successfully");
          else
            Toast("Appraisal cycle stoped successfully");

          $("#confirmationModal").modal('hide')
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }
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
