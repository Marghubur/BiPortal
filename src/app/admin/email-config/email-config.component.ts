import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IModalData } from 'src/app/util/message-modal/message-modal.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { EmailTemplate } from '../manage-emailtemplate/manage-emailtemplate.component';
declare var $: any;

@Component({
  selector: 'app-email-config',
  templateUrl: './email-config.component.html',
  styleUrls: ['./email-config.component.scss']
})
export class EmailConfigComponent implements OnInit {
  isPageLoading: boolean = false;
  allMappedtemplate: Array<EmpTempMapping> = [];
  companyId: number = 0;
  modalData: IModalData = null;
  emailTemplateDetail: EmailTemplate = null;
  emailTempMapForm: FormGroup;
  currentEmailTemp: EmpTempMapping = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  allEmailTemplate: Array<any> = [];
  requestTypes: Array<any> = [{RequestTypeId: 1, RequestTypeName: "Billing"}, {RequestTypeId: 2, RequestTypeName: "New Registration"}, {RequestTypeId: 3, RequestTypeName: "Forgot Password"},
                              {RequestTypeId: 4, RequestTypeName: "Notification"}, {RequestTypeId: 5, RequestTypeName: "Approval Notification"}];

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
        this.loadData();
      }
    }
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`Email/GetEmailTempMapping/${this.companyId}`).then(res => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        this.isPageLoading = false;
        Toast("Email Template found");
      } else {
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
      ErrorToast("No Email Template found");
    })
  }

  bindData(res: any) {
    if (res.emailTemplate)
      this.allEmailTemplate = res.emailTemplate;

    if (res.emailMappedTemplate) {
      this.allMappedtemplate = res.emailMappedTemplate;
      let i = 0;
      while(i < this.allMappedtemplate.length) {
        let tempId = this.allMappedtemplate[i].EmailTemplateId;
        this.allMappedtemplate[i].EmailTemplateName = this.allEmailTemplate.find (x => x.EmailTemplateId == tempId).TemplateName;
        this.allMappedtemplate[i].RequestTypeName = this.requestTypes.find (x => x.RequestTypeId == this.allMappedtemplate[i].RequestType).RequestTypeName;
        i++;
      }
    }
  }

  emailConfigPopUp() {
    this.submitted = false;
    this.currentEmailTemp = new EmpTempMapping();
    this.initForm();
    $('#emailConfigModal').modal('show');
  }

  editEmailTempConfig(item: EmpTempMapping) {
    this.submitted = false;
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
      RequestType: new FormControl(this.currentEmailTemp.RequestType, [Validators.required]),
      EmailTemplateId: new FormControl(this.currentEmailTemp.EmailTemplateId, [Validators.required]),
      Description: new FormControl(this.currentEmailTemp.Description, [Validators.required]),
      CompanyId: new FormControl(this.companyId, [Validators.required])
    })
  }

  get f() {
    return this.emailTempMapForm.controls;
  }

  addMapping() {
    this.isLoading = true;
    this.submitted = true;
    if (this.emailTempMapForm.get('RequestType').value == "null")
      this.emailTempMapForm.get('RequestType').setValue(null);

    if (this.emailTempMapForm.get('EmailTemplateId').value == "null")
      this.emailTempMapForm.get('EmailTemplateId').setValue(null);

    if (this.emailTempMapForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.emailTempMapForm.value;
    this.http.post("Email/EmailTempMappingInsertUpdate", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
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
  RequestType: number = null;
  EmailTemplateId: number = null;
  Description: string = null;
  EmailTemplateName: string = "";
  RequestTypeName: string = "";
}
