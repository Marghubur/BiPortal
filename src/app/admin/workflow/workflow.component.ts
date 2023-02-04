import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ManageWorkFlow } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {
  isReady: boolean = false;
  approvalWorkFlowList: Array<any> = [];
  filter: Filter = new Filter();
  isFileFound: boolean = false;

  constructor(
    private http: AjaxService,
    private nav: iNavigation
    ) { }

  ngOnInit(): void {
    this.filter.SearchString = "1=1";
    this.filter.PageIndex = 1;
    this.filter.PageSize = 10;
    this.filter.TotalRecords = 0;
    this.loadData();
  }

  loadData() {
    this.http.post("ApprovalChain/GetPageDate", this.filter).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.isFileFound = true;
        this.isReady = true;
        this.approvalWorkFlowList = response.ResponseBody;
        Toast("Records loaded successfully");
      } else {
        this.isFileFound = false;
        Toast("Fail to load record. Please contact to admin.");
      }
    });
  }

  resetFilter() {

  }

  filterRecords() { }

  EditCurrent(item: any) {
    this.nav.navigate(ManageWorkFlow, item);
  }

  GetFilterResult(e: any){ }
}
