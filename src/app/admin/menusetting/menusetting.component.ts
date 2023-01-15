import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, WarningToast } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-menusetting',
  templateUrl: './menusetting.component.html',
  styleUrls: ['./menusetting.component.scss']
})
export class MenusettingComponent implements OnInit {
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
  applicationData: any = [];
  employeeId: number = 0;
  emails: Array<string> = [];

  constructor(private router: Router,
              private fb: FormBuilder,
              private local: ApplicationStorage,
              private http: AjaxService) { }

  ngOnInit(): void {
    let value = this.router.url;
    let url = value.split('/');
    let length = url.length - 1;
    this.currentPageName =url[length].toUpperCase();
    this.defaultLogoId = "";
    this.employeesList.placeholder = "Employee";
    this.employeesList.className = 'disable-field';
    this.isEmployeesReady = true;
    this.loadData();
    this.isPageLoading = true;
    this.basePath = this.http.GetImageBasePath();
    let companies = this.local.findRecord("Companies");
    if (companies) {
      let currentCompany = companies.find(x => x.IsPrimaryCompany == 1);
      if (!currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.isPageLoading = false;
        this.companyId = currentCompany.CompanyId;
        this.currentEmailLinkConfig = new EmailLink();
        this.initForm();
      }
    }
  }

  loadData() {
    this.isEmployeesReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";
        this.isEmployeesReady = true;
      }
    });
  }

  initForm() {
    this.emaillinkForm = this.fb.group({
      TemplateName: new FormControl(this.currentEmailLinkConfig.TemplateName, [Validators.required]),
      PageName: new FormControl(this.currentPageName, [Validators.required]),
      PageDescription: new FormControl(this.currentEmailLinkConfig.PageDescription, [Validators.required]),
      IsEmailGroupUsed: new FormControl(this.currentEmailLinkConfig.IsEmailGroupUsed, [Validators.required]),
      EmailGroupId: new FormControl(this.currentEmailLinkConfig.EmailGroupId),
      IsTriggeredAutomatically: new FormControl(this.currentEmailLinkConfig.IsTriggeredAutomatically, [Validators.required]),
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
    if (this.emaillinkForm.get('EmailGroupId').value == null)
      this.emaillinkForm.get('EmailGroupId').setValue(0);

    if (this.emails.length > 0)
      this.emaillinkForm.get('Emails').setValue(this.emails);

    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (this.emaillinkForm.invalid || (data && data == "")) {
      this.isLoading = false;
      return;
    }
    let value = this.emaillinkForm.value;
    value.BodyContent = data;

    console.log(this.emaillinkForm.value);
  }

  addEmployeeEmail() {
    let employeeid = this.employeeId;
    let data = this.applicationData.Employees;
    let employee = data.find(x => x.EmployeeUid == this.employeeId);
    this.emails.push(employee.Email);
    this.employees.push({
      value: employee.EmployeeUid,
      text: employee.FirstName + " " + employee.LastName
    });
    let index = this.employeesList.data.findIndex(x => x.value == this.employeeId);
    this.employeesList.data.splice(index, 1);
  }

  removeEmail(index: number) {
    if (index >-1) {
      this.employeesList.data.push(this.employees[index]);
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
      this.emaillinkForm.get('EmailGroupId').setValue(0);
      this.emaillinkForm.get('EmailGroupId').removeValidators(Validators.required);
      this.emaillinkForm.get('EmailGroupId').updateValueAndValidity();
    }
  }

}

class EmailLink {
  EmailTemplateId: number = null;
  TemplateName: string = null;
  PageName: string = null;
  PageDescription: string = null;
  IsEmailGroupUsed: boolean = false;
  EmailGroupId: number = null;
  IsTriggeredAutomatically: boolean = false;
  Emails: Array<string> = [];
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
  Description: string = null;
}
