import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-config-performance',
  templateUrl: './config-performance.component.html',
  styleUrls: ['./config-performance.component.scss']
})
export class ConfigPerformanceComponent implements OnInit {
  isPageReady: boolean = false;
  isLoading: boolean = false;
  objectForm: FormGroup;
  currentObject: Objective = new Objective();
  htmlText: any = null;
  startDate: NgbDateStruct;
  endDate: NgbDateStruct;
  objectDetail: Objective = new Objective();
  objectiveData: Filter = new Filter();
  orderByObjectiveAsc: boolean = null;
  orderByStartDateAsc: boolean = null;
  orderByEndDateAsc: boolean = null;
  orderBTargetValueAsc: boolean = null;
  submitted: boolean = false;
  objectiveDetails: Array<any> = [];
  currentCompny: any = null;
  empRoles:autoCompleteModal = null;
  roleId: number = 0;
  tagsRole: Array<any> = [];

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    this.objectiveData.SearchString = "1=1";
    this.currentCompny = this.local.findRecord("Companies")[0];
    this.empRoles = new autoCompleteModal();
    this.empRoles.data = [];
    this.empRoles.placeholder = "Role List";
    this.empRoles.isMultiSelect = true;
    this.loadData();
    this.initForm();
  }

  loadData() {
    this.isPageReady = false;
    if (this.currentCompny.CompanyId > 0) {
      this.objectiveData.CompanyId = this.currentCompny.CompanyId;
      this.objectiveData.SearchString = "";
      this.http.post("eps/performance/getPerformanceObjective", this.objectiveData, true).then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          this.isPageReady = true;
          Toast("Record found");
        }
      }).catch(e => {
        this.isPageReady = true;
      })
    }
  }

  bindData(res: any) {
    if (res.ResponseBody.value0.length > 0) {
      this.objectiveDetails = res.ResponseBody.value0;
      this.objectiveData.TotalRecords = this.objectiveDetails[0].total;
    }
    else
      this.objectiveData.TotalRecords = 0;

    let roles = res.ResponseBody.value1;
    if (roles.length > 0) {
      // roles.forEach(x => {
      //   this.empRoles.data.push({
      //     value: x.roleId,
      //     text: x.roleName
      //   });
      // });
      this.empRoles.data.push({
        value: 1,
        text: 'Project Manager'
      },{
        value: 2,
        text: 'Architect'
      },{
        value: 3,
        text: 'Networking'
      },{
        value: 4,
        text: 'Full stack Developer'
      },{
        value: 5,
        text: 'Backend (Server side) Developer'
      },{
        value: 6,
        text: 'Database Developer'
      },{
        value: 7,
        text: 'Frontend (UI) Developer'
      },{
        value: 8,
        text: 'System Engineer'
      },{
        value: 9,
        text: 'Associate Engineer'
      },{
        value: 10,
        text: 'Test Lead'
      },{
        value: 11,
        text: 'Admin'
      },{
        value: 12,
        text: 'Senior HR'
      },{
        value: 13,
        text: 'Direct HR'
      },{
        value: 14,
        text: 'Tester'
      },{
        value: 19,
        text: 'Team Lead'
      },{
        value: 15,
        text: 'Other'
      });
      this.empRoles.className="";
    }
  }

  initForm() {
    this.objectForm = this.fb.group({
      objectiveId: new FormControl(this.currentObject.objectiveId),
      objective: new FormControl(this.currentObject.objective, [Validators.required]),
      objSeeType: new FormControl(this.currentObject.objSeeType ? 'true' :'false', [Validators.required]),
      isIncludeReview: new FormControl(this.currentObject.isIncludeReview),
      tag: new FormControl(this.currentObject.tag),
      companyId: new FormControl(this.currentCompny.CompanyId),
      progressMeassureType: new FormControl(this.currentObject.progressMeassureType == 1 ? '1' : this.currentObject.progressMeassureType == 2 ? '2' : '3'),
      startValue: new FormControl(this.currentObject.startValue, [Validators.required]),
      targetValue: new FormControl(this.currentObject.targetValue, [Validators.required]),
      description: new FormControl(''),
      timeFrameStart: new FormControl(this.currentObject.timeFrameStart, [Validators.required]),
      timeFrmaeEnd: new FormControl(this.currentObject.timeFrmaeEnd, [Validators.required]),
      objectiveType: new FormControl(this.currentObject.objectiveType, [Validators.required])
    })
  }

  get f() {
    return this.objectForm.controls;
  }

  addObjectivePopUp() {
    this.currentObject = new Objective();
    this.initForm();
    $('#addObjectiveModal').modal('show');
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.objectForm.controls["timeFrameStart"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.objectForm.controls["timeFrmaeEnd"].setValue(date);
  }

  addObjective() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;
    if (this.objectForm.get('objective').errors !== null)
      errroCounter++;

    if (this.objectForm.get('objSeeType').errors !== null)
      errroCounter++;

    if (this.objectForm.get('startValue').errors !== null)
      errroCounter++;

    if (this.objectForm.get('timeFrmaeEnd').errors !== null)
      errroCounter++;

    if (this.objectForm.get('timeFrameStart').errors !== null)
      errroCounter++;

    if (this.objectForm.get('targetValue').errors !== null)
      errroCounter++;

    if (this.tagsRole.length == 0)
      errroCounter++;

    let value = this.objectForm.value;
    if (errroCounter === 0 && value.companyId > 0) {
      let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
      if (data)
        value.description = data;

      value.tagRole = this.tagsRole.map(x => x.value);
      this.http.post("eps/performance/objectiveInsertUpdate", value, true).then(res => {
        if (res.ResponseBody) {
          this.bindData(res);
          $('#addObjectiveModal').modal('hide');
          Toast("Objective insert/updated successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
    }
  }

  resetFilter() {
    this.objectiveData.SearchString = "1=1";
    this.objectiveData.PageIndex = 1;
    this.objectiveData.PageSize = 10;
    this.objectiveData.StartIndex = 1;
    this.objectiveData.EndIndex = (this.objectiveData.PageSize * this.objectiveData.PageIndex);
    this.loadData();
    this.objectDetail.objective="";
    this.objectDetail.targetValue = 0;
    this.objectDetail.timeFrameStart=new Date();
    this.objectDetail.timeFrmaeEnd=new Date();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.objectiveData.reset();
    searchQuery += ` Objective like '%${this.objectDetail.objective}%'`;
    if(this.objectDetail.objective !== null && this.objectDetail.objective !== "") {
        searchQuery += `${this.objectDetail.objective}`;
    }
    else {
      searchQuery += `${this.objectDetail.targetValue}`;
    }
    // if(this.objectDetail.timeFrameStart !== null) {
    //   searchQuery += ` ${delimiter} TimeFrameStart like '%${this.objectDetail.timeFrameStart}%' `;
    //     delimiter = "and";
    // }
    // if(this.objectDetail.timeFrmaeEnd !== null ) {
    //   searchQuery += ` ${delimiter} TimeFrmaeEnd like '${this.objectDetail.timeFrmaeEnd}%' `;
    //     delimiter = "and";
    // }

    if(searchQuery !== "") {
      this.objectiveData.SearchString = `${searchQuery}`;
    }

    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'ASC';
    } else {
      Order = 'DESC';
    }
    if (FieldName == 'Objective')
      this.orderByObjectiveAsc = !flag;
    if (FieldName == 'StartDate')
      this.orderByStartDateAsc = !flag;
    if (FieldName == 'EndDate')
      this.orderByEndDateAsc = !flag;
    if (FieldName == 'TargetValue')
      this.orderBTargetValueAsc = !flag;

    this.objectiveData = new Filter();
    this.objectiveData.SearchString = "";
    this.objectiveData.SortBy = FieldName;
    this.objectiveData.SortDirection = Order;
    this.loadData()
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.objectiveData = e;
      this.loadData();
    }
  }

  changeProgressMeassur(e: any) {
    let value = Number(e.target.value);
    if (value == 1) {
      this.objectForm.get('targetValue').setValue(0);
      this.objectForm.get('startValue').setValue(0);
    }
  }

  editObjectivePopUp(item: Objective) {
    if (item) {
      this.currentObject = item;
      this.currentObject.timeFrameStart = ToLocateDate(item.timeFrameStart);
      this.startDate = { day: this.currentObject.timeFrameStart.getDate(), month: this.currentObject.timeFrameStart.getMonth() + 1, year: this.currentObject.timeFrameStart.getFullYear()};
      this.currentObject.timeFrmaeEnd = ToLocateDate(this.currentObject.timeFrmaeEnd);
      this.endDate = { day: this.currentObject.timeFrmaeEnd.getDate(), month: this.currentObject.timeFrmaeEnd.getMonth() + 1, year: this.currentObject.timeFrmaeEnd.getFullYear()};
      this.htmlText = item.description;
      this.tagsRole = [];
      item.tagRole.forEach(y => {
        let roles = this.empRoles.data.find(x => x.value == y);
        this.tagsRole.push(roles);
      })
      this.initForm();
      $('#addObjectiveModal').modal('show');
    }
  }

  onRoleChanged(e: any) {
    let index = this.tagsRole.findIndex(x => x.value == e.value);
    if(index == -1) {
      let roles = this.empRoles.data.find(x => x.value == e.value);
      this.tagsRole.push(roles);
    }
    else
      this.tagsRole.splice(index, 1);
  }
}

class Objective {
  objectiveId: number = 0;
  objective: string = null;
  objSeeType: boolean = false;
  isIncludeReview: boolean = false;
  tag: string = null;
  progressMeassureType: number = 1;
  startValue: number = 0;
  targetValue: number = 0;
  timeFrameStart: Date = null;
  timeFrmaeEnd: Date = null;
  objectiveType: string = "Individual";
  description: string = null;
  tagRole: Array<number> = [];
}
