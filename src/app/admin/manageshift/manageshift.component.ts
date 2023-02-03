import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { AdminNotification, EmailLinkConfig } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manageshift',
  templateUrl: './manageshift.component.html',
  styleUrls: ['./manageshift.component.scss']
})
export class ManageshiftComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
  }

  addShiftPopUp() {

  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, AdminNotification);
  }

}
