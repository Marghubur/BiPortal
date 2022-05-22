import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notification: Array<EmployeeNotification> = [];
  isLoading: boolean = false;

  constructor(private http: AjaxService) { }

  ngOnInit(): void {
    this.notification = [{
      Email: "marghub12@gmail.com",
      ActionTakenOn: new Date(),
      Status: 1,
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      NotificationId: 1,
      Message: "You've been missing out on our latest stuff!"
    },
    {
      Email: "marghub12@gmail.com",
      ActionTakenOn: new Date(),
      Status: 1,
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      NotificationId: 1,
      Message: "You've been missing out on our latest stuff!"
    },
    {
      Email: "marghub12@gmail.com",
      ActionTakenOn: new Date(),
      Status: 1,
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      NotificationId: 1,
      Message: "You've been missing out on our latest stuff!"
    },
    {
      Email: "marghub12@gmail.com",
      ActionTakenOn: new Date(),
      Status: 1,
      AssigneeId: 1,
      Mobile: "8293437694",
      UserName: "Marghub",
      RequestedOn: new Date(),
      UserTypeId: 1,
      UserId: 7,
      NotificationId: 1,
      Message: "You've been missing out on our latest stuff!"
    }]
  }

}

export class EmployeeNotification {
	NotificationId: number = null;
	Message: string = '';
	UserId:number = null;;
	UserTypeId:number = null;;
	RequestedOn:Date = null;
	UserName:string = '';
	Email: string = '';
	Mobile: string = '';
	AssigneeId: number = null;
	Status: number = null;
	ActionTakenOn:Date = null
}
