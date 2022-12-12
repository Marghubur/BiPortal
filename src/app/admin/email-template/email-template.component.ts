import { Component, OnInit } from '@angular/core';
import { IModalData } from 'src/app/util/message-modal/message-modal.component';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { ManageEmailTemplate } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
import { EmailTemplate } from '../manage-emailtemplate/manage-emailtemplate.component';

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
  modalData: IModalData = null;
  emailTemplateDetail: EmailTemplate = null;

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

  getMessageModal(emailTemplateId: number) {
    if (emailTemplateId <=0) {
      ErrorToast("Please select a vlid email template.");
      return;
    }
    this.http.get(`Email/GetEmailTemplateById/${emailTemplateId}/${this.companyId}`).then(res => {
      if (res.ResponseBody && res.ResponseBody.EmailTemplate !== null) {
        this.isPageLoading = false;
        this.emailTemplateDetail = res.ResponseBody.EmailTemplate;
        //this.companyFiles = res.ResponseBody.Files;
        this.emailTemplateDetail.BodyContent = JSON.parse(this.emailTemplateDetail.BodyContent);
        //this.bindImage(this.emailTemplateDetail.FileId);
        this.modalData = {
          Message: this.emailTemplateDetail.BodyContent,
          IsHtml: true,
          Type: 3,
          Title: this.emailTemplateDetail.TemplateName
        };
      } else {
      }
    }).catch(e => {
      ErrorToast("Invalid template selected");
    })
  }

  convertToPlain(html: any) {

  }
}
