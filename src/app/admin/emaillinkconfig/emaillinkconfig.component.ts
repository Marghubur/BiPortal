import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmailLink } from 'src/app/adminmodal/admin-modals';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-emaillinkconfig',
  templateUrl: './emaillinkconfig.component.html',
  styleUrls: ['./emaillinkconfig.component.scss']
})
export class EmaillinkconfigComponent implements OnInit {
  isLoading: boolean = false;
  employees: Array<any> = [];
  currentPageName: string = "";
  emaillinkForm: FormGroup;
  currentEmailLinkConfig: EmailLink = null;
  submitted: boolean = false;
  isPageLoading: boolean = false;
  companyId: number = 0;
  logoUrl: string = '';
  defaultLogoId: string = null;
  basePath: string = null;
  emailTemplateId: number = 0;
  companyFiles: Array<any> = [];
  isEmployeesReady: boolean = false;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: Array<any> = [];
  employeeId: number = 0;
  emails: Array<string> = [];
  isAutoTrigger: boolean = false;

  constructor(private nav: iNavigation,
              private route: Router,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }
  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data == null || data == undefined)
      data = this.route.url;

    let url = data.split('/');
    let length = url.length - 1;
    this.currentPageName =url[length].toUpperCase();
    //this.currentPageName = "EMAILSETTING"
    this.defaultLogoId = "";
    this.employeesList.placeholder = "Employee";
    this.employeesList.className = 'disable-field';
    this.loadAutoComplete();
    this.basePath = this.http.GetImageBasePath();
    let companies = this.local.findRecord("Companies");
    if (companies) {
      let currentCompany = companies.find(x => x.IsPrimaryCompany == 1);
      if (!currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = currentCompany.CompanyId;
        if (this.currentPageName && this.companyId > 0) {
          this.loadData();
        }
      }
    }
  }

  loadAutoComplete() {
    this.isEmployeesReady = false;
    this.employeesList.data = [];
    this.employeesList.placeholder = "Employee";
    this.employeesList.data = GetEmployees();
    this.applicationData = GetEmployees();
    this.employeesList.className = "";
    this.isEmployeesReady = true;
  }

  loadData() {
    this.isPageLoading = true;
    this.http.get(`Template/GetEmailLinkConfigByPageName/${this.currentPageName}/${this.companyId}`).then(res => {
      if (res.ResponseBody.Result && res.ResponseBody.Result.EmailLinkConfig) {
        this.currentEmailLinkConfig = res.ResponseBody.Result.EmailLinkConfig;
        this.companyFiles = res.ResponseBody.Result.Files;
        this.currentEmailLinkConfig.BodyContent = JSON.parse(this.currentEmailLinkConfig.BodyContent);
        this.emails = JSON.parse(this.currentEmailLinkConfig.EmailsJson);
        if (this.emails && this.emails.length > 0) {
          for (let i = 0; i < this.emails.length; i++) {
            let employee = this.applicationData.find(x => x.email == this.emails[i]);
            if (employee) {
              this.employees.push({
                Id: employee.value,
                Name: employee.text,
                Email: employee.email
              });
              let index = this.employeesList.data.findIndex(x => x.value == employee.value);
              this.employeesList.data.splice(index, 1);
            }
          }
        } else {
          this.emails = [];
        }
        this.bindImage(this.currentEmailLinkConfig.FileId);
        this.initForm();
        this.isPageLoading = false;
      } else {
        this.currentEmailLinkConfig = new EmailLink();
        this.initForm();
        this.isPageLoading = false;
      }
    }).catch(e => {
      this.isPageLoading = false;
    })
  }

  initForm() {
    this.emaillinkForm = this.fb.group({
      TemplateName: new FormControl(this.currentEmailLinkConfig.TemplateName, [Validators.required]),
      PageName: new FormControl(this.currentPageName, [Validators.required]),
      PageDescription: new FormControl(this.currentEmailLinkConfig.PageDescription, [Validators.required]),
      IsEmailGroupUsed: new FormControl(this.currentEmailLinkConfig.IsEmailGroupUsed ? 'true' : 'false', [Validators.required]),
      EmailGroupId: new FormControl(this.currentEmailLinkConfig.EmailGroupId),
      IsTriggeredAutomatically: new FormControl(this.currentEmailLinkConfig.IsTriggeredAutomatically ? 'true' : 'false', [Validators.required]),
      Emails: new FormControl(this.currentEmailLinkConfig.Emails),
      EmailTemplateId: new FormControl(this.currentEmailLinkConfig.EmailTemplateId),
      CompanyId: new FormControl(this.companyId),
      EmailTitle: new FormControl(this.currentEmailLinkConfig.EmailTitle, [Validators.required]),
      SubjectLine: new FormControl(this.currentEmailLinkConfig.SubjectLine, [Validators.required]),
      Salutation: new FormControl(this.currentEmailLinkConfig.Salutation, [Validators.required]),
      EmailClosingStatement: new FormControl(this.currentEmailLinkConfig.EmailClosingStatement, [Validators.required]),
      BodyContent: new FormControl(this.currentEmailLinkConfig.BodyContent),
      EmailNote: new FormControl(this.currentEmailLinkConfig.EmailNote),
      SignatureDetail: new FormControl(this.currentEmailLinkConfig.SignatureDetail, [Validators.required]),
      ContactNo: new FormControl(this.currentEmailLinkConfig.ContactNo),
      FileId: new FormControl(this.currentEmailLinkConfig.FileId),
      LogoPath: new FormControl(this.currentEmailLinkConfig.LogoPath),
    })
  }

  saveTemplate() {
    this.submitted = true;
    this.isLoading = true;
    if (this.emails.length > 0)
      this.emaillinkForm.get('Emails').setValue(this.emails);

    if (this.emaillinkForm.get('IsEmailGroupUsed').value == 'true') {
      if (this.emaillinkForm.get('EmailGroupId').value == 0)
        this.emaillinkForm.get('EmailGroupId').setValue(null);
    } else {
      this.emaillinkForm.get('EmailGroupId').setValue(0);
    }
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (this.emaillinkForm.invalid || (data && data == "")) {
      this.isLoading = false;
      return;
    }
    let value = this.emaillinkForm.value;
    value.BodyContent = data;

    this.http.post("Template/EmailLinkConfigInsUpdate", value).then(res => {
      if (res.ResponseBody) {
        this.emailTemplateId = Number(res.ResponseBody);
        this.emaillinkForm.get('EmailTemplateId').setValue(this.emailTemplateId);
        Toast("Template inserted/ updated successfully.");
      this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  addEmployeeEmail() {
    let employee = this.applicationData.find(x => x.value == this.employeeId);
    this.emails.push(employee.email);
    this.employees.push({
      Id: employee.value,
      Name: employee.text,
      Email: employee.email
    });
    let index = this.employeesList.data.findIndex(x => x.value == this.employeeId);
    this.employeesList.data.splice(index, 1);
  }

  removeEmail(index: number) {
    if (index >-1) {
      this.employeesList.data.push({
        value: this.employees[index].Id,
        text: this.employees[index].Name
      });
      this.employees.splice(index, 1);
    }
  }

  get f() {
    return this.emaillinkForm.controls;
  }

  loadImageLocally(e: any) {
    if(e) {
      let fileId = Number(e.target.value);
      if(!isNaN(fileId)) {
        this.bindImage(fileId);
      }
    }
  }

  bindImage(fileId: number) {
    let currentFile = this.companyFiles.find(x => x.FileId == fileId);
    if (currentFile) {
      this.logoUrl = `${this.basePath}${currentFile.FilePath}/${currentFile.FileName}`;
    } else {
      WarningToast("Unable to find the current file.");
    }
  }

  EmailGroupUsed(e: any) {
    let value = e.target.value;
    if (value == "true") {
      document.getElementsByName("EmailGroupId")[0].removeAttribute('disabled');
      this.emaillinkForm.get('EmailGroupId').setValidators(Validators.required);
      this.emaillinkForm.get('EmailGroupId').updateValueAndValidity();
    } else {
      document.getElementsByName("EmailGroupId")[0].setAttribute('disabled', '');
      this.emaillinkForm.get('EmailGroupId').setValue(null);
      this.emaillinkForm.get('EmailGroupId').removeValidators(Validators.required);
      this.emaillinkForm.get('EmailGroupId').updateValueAndValidity();
    }
  }

  sendEmail() {
    this.isLoading = true;
    if (this.currentEmailLinkConfig.EmailTemplateId > 0 && this.emails.length > 0) {
      let value = {
        EmailTemplateId: this.currentEmailLinkConfig.EmailTemplateId,
        Emails: this.emails
      }
      this.http.post("Template/GenerateUpdatedPageMail", value).then(res => {
        if (res.ResponseBody){
          Toast(res.ResponseBody);
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  triggerStatus(e: any) {
    let  value= e.target.value;
    if (value == 'true')
      this.isAutoTrigger = true;
    else
      this.isAutoTrigger = false;
  }
}

