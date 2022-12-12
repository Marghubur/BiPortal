import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IModalData } from 'src/app/util/message-modal/message-modal.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
declare var $: any;
import { EmailTemplate } from '../manage-emailtemplate/manage-emailtemplate.component';

@Component({
  selector: 'app-email-config',
  templateUrl: './email-config.component.html',
  styleUrls: ['./email-config.component.scss']
})
export class EmailConfigComponent implements OnInit {
  isPageLoading: boolean = false;
  templateData: Filter = null;
  allEmailtemplate: Array<any> = [];
  companyId: number = 0;
  modalData: IModalData = null;
  emailTemplateDetail: EmailTemplate = null;
  emailTempMapForm: FormGroup;
  currentEmailTemp: EmpTempMapping = null;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private fb: FormBuilder) { }

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
    this.isPageLoading = true;
    this.templateData.SearchString = `1=1 and CompanyId=${this.companyId}`;
    this.http.post("Email/GetEmailTemplate", this.templateData).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.allEmailtemplate = res.ResponseBody;
        this.templateData.TotalRecords = this.allEmailtemplate[0].Total;
        this.isPageLoading = false;
        Toast("Email Template found");
      } else
        this.templateData.TotalRecords = 0;
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("No Email Template found");
    })
  }

  emailConfigPopUp() {
    this.currentEmailTemp = new EmpTempMapping();
    this.initForm();
    $('#emailConfigModal').modal('show');
  }

  editEmailTempConfig(item: EmpTempMapping) {
    this.currentEmailTemp = item;
    this.initForm();
    $('#emailConfigModal').modal('show');
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

  initForm() {
    this.emailTempMapForm = this.fb.group({
      EmailTempMappingId: new FormControl(this.currentEmailTemp.EmailTempMappingId),
      RequestType: new FormControl(this.currentEmailTemp.RequestType),
      EmailTemplateId: new FormControl(this.currentEmailTemp.EmailTemplateId),
      Description: new FormControl(this.currentEmailTemp.Description),
      CompanyId: new FormControl(this.companyId)
    })
  }

  addMapping() {
    this.isLoading = true;
    this.submitted = true;
    if (this.emailTempMapForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.emailTempMapForm.value;
    this.http.post("", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        $('#emailConfigModal').modal('hide');
        Toast("Email template mapping successfully");
      }
      this.isLoading = false;
      this.submitted = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

}

class EmpTempMapping {
  EmailTempMappingId: number = 0;
  RequestType: number = 0;
  EmailTemplateId: number = 0;
  Description: string = null;
}
