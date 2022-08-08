import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { ItemStatus } from 'src/providers/constants';
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
  leave_request: Array<ApprovalRequest> = [];
  requestState: string = '';
  isLoading: boolean = false;
  currentRequest: ApprovalRequest = new ApprovalRequest();
  managerList: autoCompleteModal = null;
  editedMessage: string = '';
  itemStatus: number = 0;
  currentUser: any = null;

  constructor(
    private http: AjaxService,
    private userService: UserService
    ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getInstance();
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.itemStatus = 2;
    this.loadData();
  }

  loadData() {
    this.http.get(`Request/GetPendingRequests/${this.currentUser.UserId}/${this.itemStatus}`).then(response => {
      if(response.ResponseBody) {
        this.request = response.ResponseBody.filter(x => x.RequestType == 2);
        this.leave_request = response.ResponseBody.filter(x => x.RequestType == 1);
      } else {
        ErrorToast("Fail to fetch data. Please contact to admin.");
      }
    }).catch(e => {
      ErrorToast("Fail to fetch data. Please contact to admin.");
    });
  }

  openPopup(state: string, request: any) {
    $('#leaveModal').modal('show');
    this.requestState = state;
    this.currentRequest = request;
  }

  filterRequest(e: any) {
    this.itemStatus =Number(e.target.value);
    this.loadData();
  }

  submitRequest(header: string) {
    this.isLoading = true;
    let endPoint = '';

    switch(this.active) {
      case 1:
        endPoint = `Request`;
        break;
      case 2:
        endPoint = `Leave`;
        break;
      case 3:
        WarningToast("Invalid tab selected");
        return;
      default:
        WarningToast("Invalid tab selected");
        return;
    }

    switch(header) {
      case 'Approved':
        this.currentRequest.RequestStatusId = ItemStatus.Approved;
        endPoint = `${endPoint}/ApprovalAction`;
        break;
      case 'Rejected':
        this.currentRequest.RequestStatusId = ItemStatus.Rejected;
        endPoint = `${endPoint}/ApprovalAction`;
        break;
      case 'Othermember':
        endPoint = `${endPoint}/ApprovalAction`;
        break;
      default:
        throw 'Invalid option selected.';
        break;
    }

    this.http.put(endPoint, this.currentRequest).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Submitted Successfully");
        this.isLoading = false;
        $('#leaveModal').modal('hide');
      }
    })
    this.isLoading = false;
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
  RequestType: string = "";
}
