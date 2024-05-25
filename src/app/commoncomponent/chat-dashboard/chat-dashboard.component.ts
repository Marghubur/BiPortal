import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/AjaxServices/ajax.service';
import { ErrorToast, UserDetail } from 'src/providers/common-service/common.service';
import { Dashboard } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-chat-dashboard',
  templateUrl: './chat-dashboard.component.html',
  styleUrls: ['./chat-dashboard.component.scss']
})
export class ChatDashboardComponent implements OnInit {
  gemeniRequestText: String = '';
  isLoading: boolean = false;
  chatData: Array<ChatDetail> = [];
  currentUser: UserDetail = null;

  constructor(private nav:iNavigation,
              private ajax: AjaxService,
              private user: UserService) {}

  ngOnInit(): void {
    this.currentUser = this.user.getInstance();
    console.log(this.currentUser)
  }

  switchtoDashboard() {
    this.nav.navigate(Dashboard, null);
  }

  generateResponse() {
    if (this.gemeniRequestText) {
      this.isLoading = true;
      this.ajax
        .postService('https://www.bottomhalf.in/api/b_files/query', {
          query: this.gemeniRequestText,
        })
        .then((res: any) => {
          if (res.content) {
            this.chatData.push({
              Request: this.gemeniRequestText,
              Response: res.content
            });
            console.log(res.content);
            this.gemeniRequestText = "";
            this.isLoading = false;
          } else {
            ErrorToast('Server error. Please contact to admin.');
          }
        });
    }
  }


}

interface ChatDetail {
  Request: String,
  Response: String
}
