import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

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
  logoUrl: string = '';
  fileDetail: Array<any> = [];
  fileName: string = "";
  companyFiles: Array<any> = [];
  basePath: string = null;
  defaultLogoId: string = null;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private nav: iNavigation,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.defaultLogoId = "";
    this.basePath = this.http.GetImageBasePath();
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
    this.http.get(`Email/GetEmailTemplateById/${this.emailTemplateId}/${this.companyId}`).then(res => {
      if (res.ResponseBody && res.ResponseBody.EmailTemplate !== null) {
        this.isPageLoading = false;
        this.emailTemplateDetail = res.ResponseBody.EmailTemplate;
        this.companyFiles = res.ResponseBody.Files;
        this.emailTemplateDetail.BodyContent = JSON.parse(this.emailTemplateDetail.BodyContent);
        this.initForm();
        this.bindImage(this.emailTemplateDetail.FileId);
      } else {
      }
    }).catch(e => {
      ErrorToast("Invalid template selected");
    })
  }

  bindImage(fileId: number) {
    let currentFile = this.companyFiles.find(x => x.FileId == fileId);
    if (currentFile) {
      this.logoUrl = `${this.basePath}${currentFile.FilePath}/${currentFile.FileName}`;
    } else {
      WarningToast("Unable to find the current file.");
    }
  }

  loadImageLocally(e: any) {
    if(e) {
      let fileId = Number(e.target.value);
      if(!isNaN(fileId)) {
        this.bindImage(fileId);
      }
    }
  }

  initForm() {
    this.emailTemplateForm = this.fb.group({
      EmailTemplateId: new FormControl(this.emailTemplateId),
      CompanyId: new FormControl(this.companyId),
      TemplateName: new FormControl(this.emailTemplateDetail.TemplateName, [Validators.required]),
      EmailTitle: new FormControl(this.emailTemplateDetail.EmailTitle, [Validators.required]),
      SubjectLine: new FormControl(this.emailTemplateDetail.SubjectLine, [Validators.required]),
      Salutation: new FormControl(this.emailTemplateDetail.Salutation, [Validators.required]),
      EmailClosingStatement: new FormControl(this.emailTemplateDetail.EmailClosingStatement, [Validators.required]),
      BodyContent: new FormControl(this.emailTemplateDetail.BodyContent),
      EmailNote: new FormControl(this.emailTemplateDetail.EmailNote),
      SignatureDetail: new FormControl(this.emailTemplateDetail.SignatureDetail, [Validators.required]),
      ContactNo: new FormControl(this.emailTemplateDetail.ContactNo),
      FileId: new FormControl(this.emailTemplateDetail.FileId),
      LogoPath: new FormControl(this.emailTemplateDetail.LogoPath)
    })
  }

  get f() {
    return this.emailTemplateForm.controls;
  }

  buildBody() {
    let bodyContent = this.emailTemplateForm.get("BodyContent").value;
    if(bodyContent != null && bodyContent != "") {

    } else {

    }
  }

  saveEmailTemplate() {
    this.buildBody();
    this.isLoading = true;
    this.submitted = true;
    let data = document.getElementById("content-container").innerHTML;
    if (this.emailTemplateForm.invalid || (data && data == '')) {
      this.isLoading = false;
      return;
    }
    let formData = new FormData();
    let value = this.emailTemplateForm.value;
    value.BodyContent = data;
    formData.append('emailtemplate', JSON.stringify(value));
    let file = null;
    if (this.fileDetail.length > 0) {
      file = this.fileDetail[0].file;
      formData.append(this.fileDetail[0].name, file)
    }
    this.http.post("Email/InsertUpdateEmailTemplate", formData).then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody != '') {
        this.emailTemplateId = Number(res.ResponseBody);
        this.emailTemplateForm.get('EmailTemplateId').setValue(this.emailTemplateId);
        Toast("Template inserted/ updated successfully.");
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  fireBrowserFile() {
    $('#uploadlogo').click();
  }

  uploadLogo(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.logoUrl = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: file.name,
        file: file
      });
      console.log(this.fileDetail[0].file)
    }
  }

  uploadFilePopup(){
    this.logoUrl = '';
    this.fileDetail = [];
    this.fileName = "";
    $('#signUpoadModal').modal('show');
  }

  resetFile() {
    this.fileDetail = [];
    this.logoUrl = "";
    this.fileName = "";
  }

  saveFile() {
    if (this.fileName && this.fileName != null) {
      this.fileDetail[0].name = this.fileName;
    }
    $('#signUpoadModal').modal('hide');
  }
}

class EmailTemplate {
  EmailTemplateId: number = 0;
  TemplateName: string = null;
  SubjectLine: string = null;
  EmailTitle: string = null;
  Salutation: string = null;
  EmailClosingStatement: string = null;
  BodyContent: string = null;
  EmailNote: string = null;
  SignatureDetail: string = null;
  ContactNo: string = null;
  FileId: number = 0;
  LogoPath: string = "";
}
