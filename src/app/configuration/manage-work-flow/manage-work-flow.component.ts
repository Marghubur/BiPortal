import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApprovalChainDetail, ApprovalWorkFlowChain } from 'src/app/adminmodal/admin-modals';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

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
  submitted: boolean = false;
  isLoading: boolean = false;
  isPageReady: boolean = false;
  deleteAprrovalChain: any = null;
  approvalLevel: Array<number> = [];
  initApprovalLevel: Array<number> = [];
  approvalWorkFlowId: number = 0;

  constructor(private fb: FormBuilder,
              private http: CoreHttpService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.isPageReady = false;
    this.navRecord = this.nav.getValue();
    this.employeesAutoComplete.placeholder = "Level";
    this.approvalLevel.push(0);
    this.approvalLevel.push(1);
    this.employeesAutoComplete.className = "normal";
    if (this.navRecord ) {
      this.approvalWorkFlowId = this.navRecord.ApprovalWorkFlowId;
      if (this.approvalWorkFlowId == 1)
        this.employeesAutoComplete.className = "disabled-input"
    }

    this.loadRecord(this.approvalWorkFlowId);
  }

  loadRecord(approvalWorkFlowId: number) {
    this.http.get(`ApprovalChain/GetApprovalChainData/${approvalWorkFlowId}`)
    .then((response: ResponseModel) => {
      if (response.ResponseBody) {
        if (response.ResponseBody.approvalWorkFlowChain)
          this.approvalChainDetail = response.ResponseBody.approvalWorkFlowChain;

        let empRole = response.ResponseBody.employeeRole;
        for (let i = 0; i < empRole.length; i++) {
          this.employeesAutoComplete.data.push({
            value:empRole[i].RoleId,
            text: empRole[i].RoleName
          })
        }
        this.approvalLevel = [];
        for (let i = 0; i <= this.approvalChainDetail.NoOfApprovalLevel; i++) {
          this.approvalLevel.push(i)
        }
        this.initForm();
        this.isPageReady = true;
      }
    });
  }

  initForm() {
    this.workFlowForm = this.fb.group({
      ApprovalChainDetails: this.workFlowArray(),
      Title: new FormControl({value:this.approvalChainDetail.Title, disabled: this.approvalWorkFlowId == 1}, [Validators.required]),
      TitleDescription: new FormControl({value:this.approvalChainDetail.TitleDescription, disabled: this.approvalWorkFlowId == 1}, [Validators.required]),
      AutoExpireAfterDays: new FormControl({value:this.approvalChainDetail.AutoExpireAfterDays, disabled: this.approvalWorkFlowId == 1}, [Validators.required]),
      IsSilentListner: new FormControl({value:this.approvalChainDetail.IsSilentListner, disabled: this.approvalWorkFlowId == 1}),
      ListnerDetail: new FormControl({value:this.approvalChainDetail.ListnerDetail, disabled: this.approvalWorkFlowId == 1}),
      IsAutoExpiredEnabled: new FormControl({value:this.approvalChainDetail.IsAutoExpiredEnabled, disabled: this.approvalWorkFlowId == 1}),
      NoOfApprovalLevel: new FormControl({value:this.approvalChainDetail.NoOfApprovalLevel, disabled: this.approvalWorkFlowId == 1})
    });
    this.isReady = true;
  }

  addApprovalWorkFlow() {
    this.isInProgress = true;
    this.isLoading = true;
    this.submitted = true;
    let request = this.workFlowForm.value;
    if (request.ApprovalChainDetails.length > 0) {
      for (let i = 0; i < request.ApprovalChainDetails.length; i++) {
        if (request.ApprovalChainDetails[i].AssignieId == null || request.ApprovalChainDetails[i].AssignieId <=0) {
          this.isLoading = false;
          ErrorToast("Please add assigne first");
          return;
        }
        if (request.ApprovalChainDetails[i].IsForwardEnabled) {
          if (request.ApprovalChainDetails[i].ForwardWhen == 0) {
            this.isLoading = false;
            ErrorToast(`Please select reason for level ${i + 1}`);
            return;
          }
        }
      }
    }
    if (this.workFlowForm.invalid) {
      ErrorToast("Please fill all the manditory field");
      this.isLoading = false;
      return;
    }
    if (request) {
      this.http.post("ApprovalChain/InsertApprovalChain", request).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.isLoading = false;
          this.isInProgress = false;
          Toast("Inserted/Updated record successfully");
        } else {
          ErrorToast("Fail to insert or update record. Please contact to admin.");
        }
      }).catch(e => {
        this.isLoading = false;
        this.isInProgress = false;
        ErrorToast(e.HttpStatusMessage);
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
  }

  approvalChain(record: ApprovalChainDetail) {
    return this.fb.group({
      ApprovalWorkFlowId: new FormControl(record.ApprovalWorkFlowId),
      AssignieId: new FormControl(record.AssignieId),
      IsRequired: new FormControl({value:record.IsRequired ? 'true' : 'false', disabled: this.approvalWorkFlowId == 1}),
      ApprovalChainDetailId :new FormControl(record.ApprovalChainDetailId)
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
    let value = groupArray.value;
    groupArray.push(this.approvalChain(new ApprovalChainDetail()));
    if (value.length > 0) {
      let length = (value.length -1);
      if (value[length].AssignieId > 0) {
        this.approvalLevel = [];
        for (let i = 0; i <= length+2; i++) {
          this.approvalLevel.push(i);
        }
      }
    } else {
      let length = 0
      for (let i = 0; i <= length+2; i++) {
        this.approvalLevel.push(i);
      }
    }
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

deleteChainPopUp(item: any) {
  this.deleteAprrovalChain = null;
  this.deleteAprrovalChain = item.value;
  $('#delteChainModal').modal('show');
}

  removeCurrent() {
    this.isLoading = true;
    this.isReady = false;
    let array: FormArray = this.groupItem;
    let id = this.deleteAprrovalChain.AssignieId;
    let index = array.value.findIndex(x => x.AssignieId ==  this.deleteAprrovalChain.AssignieId);
    if (index != -1) {
      array.removeAt(index);
      this.assignedEmployees = this.assignedEmployees.filter(x => x.index !== index);
      this.updateListOnRemove(id);
      if (this.deleteAprrovalChain.ApprovalChainDetailId > 0) {
        this.http.delete(`ApprovalChain/DeleteApprovalChain/${this.deleteAprrovalChain.ApprovalChainDetailId}`).then(res => {
          if (res.ResponseBody) {
            Toast("Approval chain deleted successsfully");
            this.approvalLevel.pop();
            this.isEnableAddNew = true;
          }
        }).catch(e => {
          this.isEnableAddNew = true;
        })
      }
      $('#delteChainModal').modal('hide');
      this.isReady = true;
      this.isInProgress = false;
      this.isLoading = false;
    }
  }

  get f() {
    return this.workFlowForm.controls;
  }

  disableForwrdWhen(e: any, i: number) {
    let value = e.target.checked;
    let formarray = this.workFlowForm.get("ApprovalChainDetails") as FormArray;
    if (!value) {
      formarray.controls[i].get('ForwardAfterDays').setValue(0);
      formarray.controls[i].get('ForwardWhen').removeValidators([Validators.required]);
      formarray.controls[i].get('ForwardWhen').updateValueAndValidity();
      formarray.controls[i].get('ForwardAfterDays').removeValidators([Validators.required]);
      formarray.controls[i].get('ForwardAfterDays').updateValueAndValidity();
      if (formarray.controls[i].get('IsRequired').value == false) {
        document.querySelectorAll('select[name="ForwardWhen"]')[i].setAttribute('disabled', '');
        formarray.controls[i].get('ForwardWhen').setValue(0);
      }
    } else {
      if (formarray.controls[i].get('IsRequired').value == false)
        document.querySelectorAll('select[name="ForwardWhen"]')[i].removeAttribute('disabled');
      formarray.controls[i].get('ForwardWhen').setValidators([Validators.required]);
      formarray.controls[i].get('ForwardWhen').updateValueAndValidity();
      formarray.controls[i].get('ForwardAfterDays').setValidators([Validators.required]);
      formarray.controls[i].get('ForwardAfterDays').updateValueAndValidity();

    }
  }

  getEmployeeRole() {
    this.http.get("Employee/GenerateEmployeeRole").then(res => {
      if (res.ResponseBody) {
        let empRole = res.ResponseBody;
        empRole = empRole.filter(x => x.RoleId == 1 || x.RoleId == 2 || x.RoleId == 2|| x.RoleId == 19|| x.RoleId == 3|| x.RoleId == 5);
        for (let i = 0; i < empRole.length; i++) {
          this.employeesAutoComplete.data.push({
            value:empRole[i].RoleId,
            text: empRole[i].RoleName
          })

        }
      }
    })
  }

  requiredApprovalTrue(e: any) {
    let value = e.target.value;
    let formarray = this.workFlowForm.get("ApprovalChainDetails") as FormArray;
    let length = formarray.value.filter(x => x.IsRequired == true).length;
    if (value == "true")
      length = length + 1;
    else
      length = length -1;

    if (this.initApprovalLevel.length > 0) {
      if (length > (this.initApprovalLevel.length -1))
        this.workFlowForm.get("NoOfApprovalLevel").setValue(length);
      else
        this.workFlowForm.get("NoOfApprovalLevel").setValue(this.initApprovalLevel.length -1);
    } else {
      this.workFlowForm.get("NoOfApprovalLevel").setValue(length);
    }
  }

  selectApprovalLevel(e: any) {
    let value = Number(e.target.value);
    this.initApprovalLevel = [];
    if (value > 0) {
      for (let i = 0; i <= value; i++) {
       this.initApprovalLevel.push(i);
      }
    }
  }
}
