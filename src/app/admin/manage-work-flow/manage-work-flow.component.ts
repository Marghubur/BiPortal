import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-manage-work-flow',
  templateUrl: './manage-work-flow.component.html',
  styleUrls: ['./manage-work-flow.component.scss']
})
export class ManageWorkFlowComponent implements OnInit {
  workFlowForm: FormGroup = null;
  employees: Array<any> = [];
  employeesAutoComplete: autoCompleteModal = new autoCompleteModal();
  isReady: boolean = false;
  assignedEmployees: Array<any> = [];
  isEnableAddNew: boolean = false;
  isInProgress: boolean = false;
  navRecord: any = null;
  approvalChainDetail: ApprovalWorkFlowChain = new ApprovalWorkFlowChain();
  
  constructor(
    private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation
    ) { }

  ngOnInit(): void {
    this.navRecord = this.nav.getValue();
    this.employees = GetEmployees();
    this.employeesAutoComplete.data = this.employees;
    this.employeesAutoComplete.placeholder = "Employee";
    this.employeesAutoComplete.className = "normal";

    if(this.navRecord) {
      this.loadRecord();
    } else {
      this.initForm();
    }
  }

  loadRecord() {
    this.http.get(`ApprovalChain/GetApprovalChainData/${this.navRecord.ApprovalWorkFlowId}`)
    .then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.approvalChainDetail = response.ResponseBody;
        this.initForm();
      }
    });
  }

  initForm() {
    this.workFlowForm = this.fb.group({
      ApprovalChainDetails: this.workFlowArray(),
      Title: new FormControl(this.approvalChainDetail.Title, [Validators.required]),
      TitleDescription: new FormControl(this.approvalChainDetail.TitleDescription),
      IsAutoExpiredEnabled: new FormControl(this.approvalChainDetail.IsAutoExpiredEnabled),
      AutoExpireAfterDays: new FormControl(this.approvalChainDetail.AutoExpireAfterDays),
      IsSilentListner: new FormControl(this.approvalChainDetail.IsSilentListner),
      ListnerDetail: new FormControl(this.approvalChainDetail.ListnerDetail),
    });
    this.isReady = true;
  }

  addApprovalWorkFlow() {
    this.isInProgress = true;
    let request = this.workFlowForm.value;
    if (request) {
      this.http.post("ApprovalChain/InsertApprovalChain", request).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Inserted/Updated record successfully");
        } else {
          ErrorToast("Fail to insert or update record. Please contact to admin.");
        }
      });
    } else {
      this.isInProgress = false;
      ErrorToast("Invalid data pass. Please fill your form correctly.");
    }
  }

  get groupItem(): FormArray {
    return this.workFlowForm.get("ApprovalChainDetails") as FormArray;
  }

  updateListOnAdd() {
    let autoCompleteData = this.employeesAutoComplete.data;
    this.employeesAutoComplete.data = autoCompleteData.filter(x => !this.assignedEmployees.find(i => i.value === x.value))
    this.isInProgress = false;
    this.isEnableAddNew = true;
  }

  updateListOnRemove(id: number) {
    let emp = this.employees.find(x => x.value === id);
    if(emp) {
      this.employeesAutoComplete.data.push(emp);
    }
    this.isInProgress = false;
    this.isEnableAddNew = true;
  }

  approvalChain(record: ApprovalChainDetail) {
    return this.fb.group({
      ApprovalWorkFlowId: new FormControl(record.ApprovalWorkFlowId),
      AssignieId: new FormControl(record.AssignieId, [Validators.required]),
      IsRequired: new FormControl(record.IsRequired),
      IsForwardEnabled: new FormControl(record.IsForwardEnabled),
      ForwardWhen: new FormControl(record.ForwardWhen),
      ForwardAfterDays: new FormControl(record.ForwardAfterDays)
    });
  }

  workFlowArray(): FormArray {
    let array: FormArray = this.fb.array([]);
    this.approvalChainDetail.ApprovalChainDetails.map(item => {
      array.push(this.approvalChain(item));
    });
    return array;
  }

  addNewLevel() {
    this.isReady = false;
    this.isEnableAddNew = false;
    let groupArray = this.workFlowForm.get("ApprovalChainDetails") as FormArray;
    groupArray.push(this.approvalChain(new ApprovalChainDetail()));
    this.isReady = true;
  }

  blockCurrentSection(id: number, position: number) {
    let array: FormArray = this.groupItem;
    let form: FormGroup = array.controls[position] as FormGroup;
    form.get("AssignieId").setValue(id);
    Toast(`Select Employee added as a notifier.`);
  }

  onEmloyeeChanged(value: number, index: number) {
    if (value) {
      let elem = this.assignedEmployees.find(x => x.index === index);
      if (elem) {
        elem.value = value;
      } else {
        this.assignedEmployees.push({
          index: index,
          value: value
        });

      }

      this.isInProgress = true;
      this.blockCurrentSection(value, index);
      this.updateListOnAdd();
    }
  }

  removeCurrent(index: number, id: any) {
    this.isReady = false;
    let array: FormArray = this.groupItem;
    array.removeAt(index);
    this.assignedEmployees = this.assignedEmployees.filter(x => x.index !== index);
    this.updateListOnRemove(id);
    this.isReady = true;
  }
}

class ApprovalWorkFlowChain
{
     ApprovalChainDetailId: number = null;
     ApprovalWorkFlowId: number = null;
     Title: string = null;
     TitleDescription: string = null;
     Status: number = null;
     IsAutoExpiredEnabled: boolean = false;
     AutoExpireAfterDays: number = null;
     IsSilentListner: boolean = false;
     ListnerDetail: string = '[]';
     ApprovalChainDetails: Array<ApprovalChainDetail> = new Array<ApprovalChainDetail>();
}

class ApprovalChainDetail {
  ApprovalChainDetailId: number = null;
  ApprovalWorkFlowId: number = null;
  AssignieId: number = null;
  IsRequired: boolean = false;
  IsForwardEnabled: boolean = false;
  ForwardWhen: number = 0;
  ForwardAfterDays: number = null;
  ApprovalStatus: number = null;
}