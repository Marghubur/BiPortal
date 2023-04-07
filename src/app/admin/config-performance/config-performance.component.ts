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
      this.http.post("Objective/GetPerformanceObjective", this.objectiveData).then(res => {
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
    this.objectiveDetails = res.ResponseBody.ObjectiveDetails;
    if (this.objectiveDetails.length > 0)
      this.objectiveData.TotalRecords = this.objectiveDetails[0].Total;
    else
      this.objectiveData.TotalRecords = 0;

    let roles = res.ResponseBody.EmployeeRoles;
    if (roles.length > 0) {
      roles.forEach(x => {
        this.empRoles.data.push({
          value: x.RoleId,
          text: x.RoleName
        });
      });
      this.empRoles.className="";
    }
  }

  initForm() {
    this.objectForm = this.fb.group({
      ObjectiveId: new FormControl(this.currentObject.ObjectiveId),
      Objective: new FormControl(this.currentObject.Objective, [Validators.required]),
      ObjSeeType: new FormControl(this.currentObject.ObjSeeType ? 'true' :'false', [Validators.required]),
      IsIncludeReview: new FormControl(this.currentObject.IsIncludeReview),
      Tag: new FormControl(this.currentObject.Tag),
      CompanyId: new FormControl(this.currentCompny.CompanyId),
      ProgressMeassureType: new FormControl(this.currentObject.ProgressMeassureType == 1 ? '1' : this.currentObject.ProgressMeassureType == 2 ? '2' : '3'),
      StartValue: new FormControl(this.currentObject.StartValue, [Validators.required]),
      TargetValue: new FormControl(this.currentObject.TargetValue, [Validators.required]),
      Description: new FormControl(''),
      TimeFrameStart: new FormControl(this.currentObject.TimeFrameStart, [Validators.required]),
      TimeFrmaeEnd: new FormControl(this.currentObject.TimeFrmaeEnd, [Validators.required]),
      ObjectiveType: new FormControl(this.currentObject.ObjectiveType, [Validators.required])
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
    this.objectForm.controls["TimeFrameStart"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.objectForm.controls["TimeFrmaeEnd"].setValue(date);
  }

  addObjective() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;
    if (this.objectForm.get('Objective').errors !== null)
      errroCounter++;

    if (this.objectForm.get('ObjSeeType').errors !== null)
      errroCounter++;

    if (this.objectForm.get('StartValue').errors !== null)
      errroCounter++;

    if (this.objectForm.get('TimeFrmaeEnd').errors !== null)
      errroCounter++;

    if (this.objectForm.get('TimeFrameStart').errors !== null)
      errroCounter++;

    if (this.objectForm.get('TargetValue').errors !== null)
      errroCounter++;

    if (this.tagsRole.length == 0)
      errroCounter++;

    let value = this.objectForm.value;
    if (errroCounter === 0 && value.CompanyId > 0) {
      let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
      if (data)
        value.Description = data;

      value.TagRole = this.tagsRole.map(x => x.value);
      this.http.post("Objective/ObjectiveInsertUpdate", value).then(res => {
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
    this.objectDetail.Objective="";
    this.objectDetail.TargetValue = 0;
    this.objectDetail.TimeFrameStart=new Date();
    this.objectDetail.TimeFrmaeEnd=new Date();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.objectiveData.reset();

    if(this.objectDetail.Objective !== null && this.objectDetail.Objective !== "") {
        searchQuery += ` Objective like '%${this.objectDetail.Objective}%'`;
        delimiter = "and";
      }

    if(this.objectDetail.TargetValue !== null && this.objectDetail.TargetValue !== 0) {
      searchQuery += ` ${delimiter} TargetValue = ${this.objectDetail.TargetValue} `;
        delimiter = "and";
    }
    if(this.objectDetail.TimeFrameStart !== null) {
      searchQuery += ` ${delimiter} TimeFrameStart like '%${this.objectDetail.TimeFrameStart}%' `;
        delimiter = "and";
    }
    if(this.objectDetail.TimeFrmaeEnd !== null ) {
      searchQuery += ` ${delimiter} TimeFrmaeEnd like '${this.objectDetail.TimeFrmaeEnd}%' `;
        delimiter = "and";
    }

    if(searchQuery !== "") {
      this.objectiveData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
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
    this.objectiveData.SortBy = FieldName +" "+ Order;
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
      this.objectForm.get('TargetValue').setValue(0);
      this.objectForm.get('StartValue').setValue(0);
    }
  }

  editObjectivePopUp(item: Objective) {
    if (item) {
      this.currentObject = item;
      this.currentObject.TimeFrameStart = ToLocateDate(item.TimeFrameStart);
      this.startDate = { day: this.currentObject.TimeFrameStart.getDate(), month: this.currentObject.TimeFrameStart.getMonth() + 1, year: this.currentObject.TimeFrameStart.getFullYear()};
      this.currentObject.TimeFrmaeEnd = ToLocateDate(this.currentObject.TimeFrmaeEnd);
      this.endDate = { day: this.currentObject.TimeFrmaeEnd.getDate(), month: this.currentObject.TimeFrmaeEnd.getMonth() + 1, year: this.currentObject.TimeFrmaeEnd.getFullYear()};
      this.htmlText = item.Description;
      this.tagsRole = [];
      item.TagRole.forEach(y => {
        let index = this.tagsRole.findIndex(x => x == y);
        if(index == -1) {
          let roles = this.empRoles.data.find(x => x.value == y);
          this.tagsRole.push(roles);
        }
      })
      this.initForm();
      $('#addObjectiveModal').modal('show');
    }
  }

  onRoleChanged(e: any) {
    let index = this.tagsRole.findIndex(x => x == e.value);
    if(index == -1) {
      let roles = this.empRoles.data.find(x => x.value == e.value);
      this.tagsRole.push(roles);
    }
    else
      this.tagsRole.splice(index, 1);
  }
}

class Objective {
  ObjectiveId: number = 0;
  Objective: string = null;
  ObjSeeType: boolean = false;
  IsIncludeReview: boolean = false;
  Tag: string = null;
  ProgressMeassureType: number = 1;
  StartValue: number = 0;
  TargetValue: number = 0;
  TimeFrameStart: Date = null;
  TimeFrmaeEnd: Date = null;
  ObjectiveType: string = null;
  Description: string = null;
  TagRole: Array<any> = [];
}
