import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-managetimesheet',
  templateUrl: './managetimesheet.component.html',
  styleUrls: ['./managetimesheet.component.scss']
})
export class ManagetimesheetComponent implements OnInit {
  singleEmployee: Filter = null;
  clientDetail: autoCompleteModal = new autoCompleteModal();
  userDetail: UserDetail = null;
  employeeId: number = 0;
  clientId: number = 0;
  isEmployeesReady: boolean = false;

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private user: UserService
  ) {
    this.clientDetail.placeholder = "Select Client";
    this.clientDetail.data.push({
      value: '0',
      text: 'Select Client'
    });
  }

  ngOnInit(): void {
    this.userDetail = this.user.getInstance() as UserDetail;
    this.loadMappedClients();
  }

  loadMappedClients() {
    this.isEmployeesReady = false;
    this.http.get(`employee/LoadMappedClients/${this.userDetail.UserId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        let mappedClient = response.ResponseBody.AllocatedClients;
        if(mappedClient != null && mappedClient.length > 0) {
          let i = 0;
          while(i < mappedClient.length) {
            this.clientDetail.data.push({
              text: mappedClient[i].ClientName,
              value: mappedClient[i].ClientId,
            });
            i++;
          }

          if(mappedClient.length == 1) {
            this.clientId = mappedClient[0].ClientId;
            this.clientDetail.className = 'disabled-input';
          }
          Toast("Client loaded successfully.");
        } else {
          ErrorToast("Unable to get client detail. Please contact admin.");
        }

        this.isEmployeesReady = true;
        $('#loader').modal('hide');
      } else {
        ErrorToast("Unable to get client detail. Please contact admin.");
      }
    });
  }

}
