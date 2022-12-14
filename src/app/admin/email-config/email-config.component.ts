import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IModalData } from 'src/app/util/message-modal/message-modal.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
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
  currentEmailTemp: EmpTempMapping = new EmpTempMapping();
  isLoading: boolean = false;
  submitted: boolean = false;
  allEmailTemplate: Array<any> = [];
  mappedData: Filter = null;
  filterEmailTemp: EmpTempMapping = new EmpTempMapping();

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
        this.mappedData = new Filter();
        this.mappedData.SearchString  = "1=1"
        this.loadData();
      }
    }
  }

  loadData() {
    this.isPageLoading = true;
    this.mappedData.SearchString += ` and CompanyId = ${this.companyId}`;
    this.http.post('Email/GetEmailTempMapping', this.mappedData).then(res => {
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
      this.mappedData.TotalRecords = this.allMappedtemplate[0].Total;
      let i = 0;
      while(i < this.allMappedtemplate.length) {
        let tempId = this.allMappedtemplate[i].TemplateId;
        if (tempId > 0) {
          this.allMappedtemplate[i].TemplateName = this.allEmailTemplate.find (x => x.EmailTemplateId == tempId).TemplateName;
          this.allMappedtemplate[i].Description = this.allEmailTemplate.find (x => x.EmailTemplateId == tempId).Description;
        } else {
          this.allMappedtemplate[i].TemplateName = null;
          this.allMappedtemplate[i].Description = null;
        }
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
      ErrorToast("Please select a valid email template.");
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
      EmailTemplateName: new FormControl(this.currentEmailTemp.EmailTemplateName, [Validators.required]),
      TemplateId: new FormControl(this.currentEmailTemp.TemplateId, [Validators.required]),
      Description: new FormControl(this.currentEmailTemp.Description),
      CompanyId: new FormControl(this.companyId, [Validators.required])
    })
  }

  get f() {
    return this.emailTempMapForm.controls;
  }

  addMapping() {
    this.isLoading = true;
    this.submitted = true;
    if (this.emailTempMapForm.get('EmailTemplateName').value == "null")
      this.emailTempMapForm.get('EmailTemplateName').setValue(null);

    if (this.emailTempMapForm.get('TemplateId').value == "0")
      this.emailTempMapForm.get('TemplateId').setValue(null);

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

  changeTemplate(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      let Description = this.allEmailTemplate.find (x => x.EmailTemplateId == value).Description;
      this.emailTempMapForm.get('Description').setValue(Description);
    } else {
      this.emailTempMapForm.get('Description').setValue(null);
    }
  }

  GetFilterResult(e: any) {
    if(e != null) {
      this.mappedData = e;
      this.loadData();
    }
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.mappedData.SearchString = ""

    if(this.filterEmailTemp.EmailTemplateName !== null && this.filterEmailTemp.EmailTemplateName !== "") {
      this.mappedData.SearchString += ` 1=1 and EmailTemplateName like '%${this.filterEmailTemp.EmailTemplateName}%'`;
        delimiter = "and";
    }

    if(this.filterEmailTemp.TemplateId !== null && this.filterEmailTemp.TemplateId !== 0) {
      this.mappedData.SearchString += `1=1 And TemplateId = ${this.filterEmailTemp.TemplateId}`;
        delimiter = "and";
    }

    this.mappedData.CompanyId = Number(this.companyId);
    this.loadData();
  }

  resetFilter() {
    this.mappedData = new Filter();
    this.currentEmailTemp = new EmpTempMapping();
    this.loadData();
  }
}

class EmpTempMapping {
  EmailTempMappingId: number = 0;
  TemplateId: number = null;
  Description: string = null;
  EmailTemplateName: string = null;
  TemplateName: string = "";
  ActionType: string = "";
  Total: number = 0;
}
