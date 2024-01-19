import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, ToLocateDate } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
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
  orderBTargetValueAsc: boolean = null;
  submitted: boolean = false;
  objectiveDetails: Array<any> = [];
  currentCompny: any = null;
  roleId: number = 0;
  tagsRole: Array<any> = [];
  selectedAppraisalCycle: any = null;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.currentCompny = this.local.findRecord("Companies")[0];
    this.selectedAppraisalCycle = this.nav.getValue();
    this.objectiveData.SearchString += ` And CompanyId = ${this.currentCompny.CompanyId}`;
    this.loadData();
    this.initForm();
  }

  loadData() {
    this.isPageReady = false;
    if (this.currentCompny.CompanyId > 0) {
      this.http.post("eps/performance/getPerformanceObjective", this.objectiveData, true)
      .then(res => {
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
    if (res.ResponseBody.length > 0) {
      this.objectiveDetails = [];
      this.objectiveDetails = res.ResponseBody;
      this.objectiveData = new Filter();
      this.objectiveData.TotalRecords = this.objectiveDetails[0].Total;
    }
    else
      this.objectiveData.TotalRecords = 0;
  }

  initForm() {
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

  get f() {
    return this.objectForm.controls;
  }

  addObjectivePopUp() {
    this.submitted = false;
    this.currentObject = new Objective();
    this.initForm();
    $('#addObjectiveModal').modal('show');
  }

  addObjective() {
    this.isLoading = true;
    this.submitted = true;
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
  }

  filterRecords() {
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

    if (FieldName == 'TargetValue')
      this.orderBTargetValueAsc = !flag;

    this.objectiveData = new Filter();
    this.objectiveData.SortBy = FieldName + " " + Order;
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
      this.htmlText = item.Description;
      this.initForm();
      this.submitted = false;
      $('#addObjectiveModal').modal('show');
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
