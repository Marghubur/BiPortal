import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
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

  constructor(private http: AjaxService) { }

  ngOnInit(): void {
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.request = [{
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    },
    {
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been no missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    },
    {
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    },
    {
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    },
    {
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    },
    {
      ApprovalRequestId: 1,
      Email: "marghub12@gmail.com",
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      Message: "You've been missing out on our latest stuff!",
      FromDate: new Date(),
      ToDate: new Date(),
      ProjectId: 1,
      ProjectName: 'HiringBell'
    }]
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

  submitRequest() {
    this.isLoading = false;
    let request = {
      ApprovalRequestId: this.singleLeave.ApprovalRequestId,
      RequestType: this.requestType,
      NewAssigneeId: this.singleLeave.AssigneeId,
      DesignationId: this.singleLeave.UserTypeId
    }

    this.http.post("", request).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Submitted Successfully");
      this.isLoading = true;
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
}
