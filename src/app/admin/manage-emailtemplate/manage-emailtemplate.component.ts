import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-manage-emailtemplate',
  templateUrl: './manage-emailtemplate.component.html',
  styleUrls: ['./manage-emailtemplate.component.scss']
})
export class ManageEmailtemplateComponent implements OnInit {
  emailTemplateForm: FormGroup;
  emailTemplateDetail: EmailTemplate = null;
  isLoading: boolean = false;
  submitted: boolean = false;
  emailTemplateId: number = 0;
  isPageLoading: boolean = false;
  companyId: number = 0;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private nav: iNavigation,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isPageLoading = true;
    let data = this.nav.getValue();
    let companies = this.local.findRecord("Companies");
    if(data) {
      this.emailTemplateId = data.EmailTemplateId;
      this.companyId = data.CompanyId;
      this.loadData();
    } else {
      if (companies) {
        let currentCompany = companies.find(x => x.IsPrimaryCompany == 1);
        if (!currentCompany) {
          ErrorToast("Fail to get company detail. Please contact to admin.");
          return;
        } else {
          this.isPageLoading = false;
          this.companyId = currentCompany.CompanyId;
          this.emailTemplateDetail = new EmailTemplate();
          this.initForm();
        }
      }
    }
  }

  loadData() {
    this.http.get(`Email/GetEmailTemplateById/${this.emailTemplateId}`).then(res => {
      if (res.ResponseBody) {
        this.isPageLoading = false;
        this.emailTemplateDetail = res.ResponseBody;
        this.emailTemplateDetail.BodyContent = JSON.parse(this.emailTemplateDetail.BodyContent);
        this.initForm();
      } else {
      }
    }).catch(e => {
      ErrorToast("Invalid template selected");
    })
  }

  initForm() {
    this.emailTemplateForm = this.fb.group({
      EmailTemplateId: new FormControl(this.emailTemplateDetail.EmailTemplateId),
      CompanyId: new FormControl(this.companyId),
      TemplateName: new FormControl(this.emailTemplateDetail.TemplateName, [Validators.required]),
      SubjectLine: new FormControl(this.emailTemplateDetail.SubjectLine, [Validators.required]),
      Salutation: new FormControl(this.emailTemplateDetail.Salutation, [Validators.required]),
      EmailClosingStatement: new FormControl(this.emailTemplateDetail.EmailClosingStatement, [Validators.required]),
      BodyContent: new FormControl(this.emailTemplateDetail.BodyContent, [Validators.required]),
      EmailNote: new FormControl(this.emailTemplateDetail.EmailNote),
      SignatureDetail: new FormControl(this.emailTemplateDetail.SignatureDetail, [Validators.required]),
      ContactNo: new FormControl(this.emailTemplateDetail.ContactNo)
    })
  }

  get f() {
    return this.emailTemplateForm.controls;
  }

  saveEmailTemplate() {
    this.isLoading = true;
    this.submitted = true;
    if (this.emailTemplateForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.emailTemplateForm.value;
    this.http.post("Email/InsertUpdateEmailTemplate", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.isLoading = false;
        Toast(res.ResponseBody);
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

}

class EmailTemplate {
  EmailTemplateId: number = 0;
  TemplateName: string = null;
  SubjectLine: string = null;
  Salutation: string = null;
  EmailClosingStatement: string = null;
  BodyContent: string = null;
  EmailNote: string = null;
  SignatureDetail: string = null;
  ContactNo: string = null;
}
