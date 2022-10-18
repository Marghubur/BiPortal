import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { ManageEmailTemplate } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss']
})
export class EmailTemplateComponent implements OnInit {
  allEmailtemplate: Array<any> = [];
  isRecordFound: boolean = false;
  templateData: Filter = null;
  isPageLoading: boolean = false;
  companyId: number = 0;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private nav:iNavigation) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    if (!data) {
      return;
    } else {
      let currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = currentCompany.CompanyId;
        this.templateData = new Filter();
        this.loadData();
      }
    }
  }

  loadData() {
    this.isRecordFound = false;
    this.isPageLoading = true;
    this.templateData.SearchString = `1=1 and CompanyId=${this.companyId}`;
    this.http.post("Email/GetEmailTemplate", this.templateData).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.allEmailtemplate = res.ResponseBody;
        this.templateData.TotalRecords = this.allEmailtemplate[0].Total;
        this.isRecordFound = true;
        this.isPageLoading = false;
        Toast("Email Template found");
      } else
        this.templateData.TotalRecords = 0;
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("No Email Template found");
    })
  }

  addeditTemplate(item: any) {
    this.nav.navigate(ManageEmailTemplate, item);
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.templateData = e;
      this.loadData();
    }
  }
}
