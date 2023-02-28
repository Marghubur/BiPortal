import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { ManageWorkFlow } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

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
  workflowDetail: WorkFlow = null;
  orderByTitleAsc: boolean = null;
  orderByTitleDescAsc: boolean = null;

  constructor(private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.filter.SearchString = "1=1";
    this.filter.PageIndex = 1;
    this.filter.PageSize = 10;
    this.filter.TotalRecords = 0;
    this.workflowDetail = new WorkFlow();
    this.loadData();
  }

  loadData() {
    this.isReady = false;
    this.http.post("ApprovalChain/GetPageDate", this.filter).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.isFileFound = true;
        this.isReady = true;
        this.bindaData(response.ResponseBody);
        Toast("Records loaded successfully");
      } else {
        this.isFileFound = false;
        Toast("Fail to load record. Please contact to admin.");
      }
    });
  }

  bindaData(res: any) {
    this.approvalWorkFlowList = res;
    if (this.approvalWorkFlowList.length > 0)
      this.filter.TotalRecords = this.approvalWorkFlowList[0].Total;
    else
      this.filter.TotalRecords = 0;
  }

  resetFilter() {
    this.workflowDetail = new WorkFlow();
    this.filter = new Filter();
    this.loadData();
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.filter.SearchString = ""
    this.filter.reset();

    if(this.workflowDetail.TitleDescription !== null && this.workflowDetail.TitleDescription !== "") {
      this.filter.SearchString += `1=1 And TitleDescription like '%${this.workflowDetail.TitleDescription}%'`;
        delimiter = "and";
    }

    if(this.workflowDetail.Title !== null && this.workflowDetail.Title !== "") {
      this.filter.SearchString += `1=1 And Title like '%${this.workflowDetail.Title}%'`;
        delimiter = "and";
    }

    this.loadData();
  }

  EditCurrent(item: any) {
    this.nav.navigate(ManageWorkFlow, item);
  }

  GetFilterResult(e: any){
    if(e != null) {
      this.filter = e;
      this.loadData();
    }
  }

  addWorkFlowPopUp() {
    this.nav.navigate(ManageWorkFlow, null);
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'Title') {
      this.orderByTitleAsc = !flag;
      this.orderByTitleDescAsc = null;
    } else if (FieldName == 'TitleDescription') {
      this.orderByTitleAsc = null;
      this.orderByTitleDescAsc = !flag;
    }
    this.filter = new Filter();
    this.filter.SearchString = `1=1`;
    this.filter.SortBy = FieldName +" "+ Order;
    this.loadData()
  }

}

class WorkFlow {
  ApprovalChainDetailId: number = 0;
  ApprovalWorkFlowId: number = 0;
  Title: string = null;
  TitleDescription: string = null;
  Status: number = 0;
  IsAutoExpiredEnabled: boolean = false;
  AutoExpireAfterDays: number = null;
  IsSilentListner: boolean = false;
  ListnerDetail: string = null;
  Index: number = 0;
  Total: number = 0;
}
