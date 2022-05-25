import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { ItemStatus } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-approval-request',
  templateUrl: './approval-request.component.html',
  styleUrls: ['./approval-request.component.scss']
})
export class ApprovalRequestComponent implements OnInit {
  active = 1;
  request: Array<ApprovalRequest> = [];
  modalHeader: string = '';
  isLoading: boolean = false;
  singleLeave: ApprovalRequest = new ApprovalRequest();
  managerList: autoCompleteModal = null;
  requestType: number = 0;
  editedMessage: string = '';
  itemStatus: number = 0;
  current: any = null;
  isReady: boolean = false;

  constructor(
    private http: AjaxService,
    private nav: iNavigation,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.current = this.userService.getInstance();
    if(this.current != null) {
      this.managerList.data.push({
        value: 0,
        text: "Default Manager"
      });
      this.itemStatus = 2;
      this.loadData();
    }
  }

  loadData() {
    this.http.get(`Request/GetPendingRequests/${this.current.UserId}/${this.itemStatus}`).then(response => {
      if(response.ResponseBody) {
        this.request = response.ResponseBody;
        this.isReady = true;
      } else {
        ErrorToast("Fail to fetch data. Please contact to admin.");
      }
    }).catch(e => {
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  openPopup(e: string, request: any) {
    $('#leaveModal').modal('show');
    this.modalHeader = e;
    this.singleLeave = request;
    switch (this.modalHeader) {
      case 'Reject':
        this.requestType = 2;
        break;
      case 'Approved':
        this.requestType = 1;
      default:
        this.requestType = 3;
        break;
    }
  }

  filterRequest(e: any) {
    this.itemStatus =Number(e.target.value);
    this.loadData();
  }

  submitRequest(header: string) {
    this.isLoading = true;
    let statusId = 0;
    let endPoint = '';
    try{
      switch(header) {
        case 'Approved':
          statusId = ItemStatus.Approved;
          endPoint = `Request/ApprovalAction`;
          break;
        case 'Rejected':
          statusId = ItemStatus.Rejected;
          endPoint = `Request/RejectAction`;
          break;
        case 'Othermember':
          endPoint = `Request/ReAssigneToOtherManager`;
          break;
        default:
          throw 'Invalid option selected.';
          break;
      }
    } catch(e) {
      ErrorToast(e);
    }

    //this.isLoading = false;
    let request = {
      ApprovalRequestId: this.singleLeave.ApprovalRequestId,
      RequestType: this.requestType,
      NewAssigneeId: this.singleLeave.AssigneeId,
      DesignationId: this.singleLeave.UserTypeId,
      RequestStatusId: statusId
    }

    this.http.put(endPoint, request).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Submitted Successfully");
      } else {
        ErrorToast("Fail to approve. Please contact to admin.");
      }
      this.isLoading = false;
      $('#leaveModal').modal('hide');
    })
  }
}

export class ApprovalRequest {
  ApprovalRequestId: number = null;
	UserName:string = '';
	Message:string = '';
	UserId:number = null;
	UserTypeId: number = null;
	RequestedOn:Date = null;
	Email:string  = '';
	Mobile:string = '';
	FromDate:Date = null;
	ToDate:Date = null;
	AssigneeId:number = null;
	ProjectId:number = null;
	ProjectName:string = '';
  RequestStatusId: number = 0;
}
