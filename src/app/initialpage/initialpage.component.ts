import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Login } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Files } from '../commonmodal/common-modals';
declare var $:any;

@Component({
  selector: 'app-initialpage',
  templateUrl: './initialpage.component.html',
  styleUrls: ['./initialpage.component.scss']
})
export class InitialpageComponent implements OnInit {
  submitted: boolean = false;
  isLoading: boolean = false;
  initialForm: FormGroup;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  companyLogo: any = null;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.initCompany();
  }

  initCompany() {
    this.initialForm = this.fb.group({
      OrganizationName: new FormControl(null, [Validators.required]),
      CompanyName: new FormControl(null, [Validators.required]),
      FirstName: new FormControl(null, [Validators.required]),
      LastName: new FormControl(null, [Validators.required]),
      EmailId: new FormControl(null, [Validators.required, Validators.email]),
      EmailHost: new FormControl(null, [Validators.required]),
      PortNo: new FormControl(null, [Validators.required]),
      EnableSsl: new FormControl(true, [Validators.required]),
      DeliveryMethod: new FormControl(null),
      UserDefaultCredentials: new FormControl(false, [Validators.required]),
      Credentials: new FormControl(null, [Validators.required]),
      EmailName: new FormControl(null, [Validators.required]),
      IsPrimary: new FormControl(true, [Validators.required]),
      GSTNo: new FormControl(null, [Validators.required]),
      AccountNo: new FormControl(null, [Validators.required]),
      BankName: new FormControl(null, [Validators.required]),
      Branch: new FormControl(null, [Validators.required]),
      BranchCode: new FormControl(null, ),
      IFSC: new FormControl(null, [Validators.required]),
      IsPrimaryAccount: new FormControl (true, [Validators.required]),
      Mobile: new FormControl(null, [Validators.required]),
      FirstAddress: new FormControl(null, [Validators.required]),
      SecondAddress: new FormControl(null, [Validators.required]),
      ThirdAddress: new FormControl(null),
      ForthAddress: new FormControl(null),
      Country: new FormControl(null),
      State: new FormControl(null, [Validators.required]),
      City: new FormControl(null),
      DeclarationStartMonth: new FormControl(4),
      DeclarationEndMonth: new FormControl(3),
      FinancialYear: new FormControl(new Date().getFullYear()),
      AttendanceSubmissionLimit: new FormControl(3),
    })
  }

  get f () {
    return this.initialForm.controls;
  }

  registerAccount() {
    this.isLoading = true;
    this.submitted = true;
    if (this.initialForm.invalid) {
      ErrorToast("Please fill all the manditory fields.");
      this.isLoading = false;
      return;
    }
    if (this.FilesCollection.length <= 0) {
      ErrorToast("Please add logo first.");
      this.isLoading = false;
      return;
    }
    let value = this.initialForm.value;
    let formData = new FormData();
    formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
    let files = {
      FileId: 0,
      Email: value.EmailId,
      CompanyId: 0,
      FileDescription: "Logo",
      FileRole: "Company Primary Logo"
    };
    formData.append('FileDetail', JSON.stringify(files));
    formData.append('RegistrationDetail', JSON.stringify(value));
    this.http.post("InitialRegistration/InitialOrgRegistration", formData).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Registration done successfully");
        $('#messageModal').modal('show');
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  gotoLoginPage() {
    $('#messageModal').modal('hide');
    this.nav.navigate(Login, null);
  }

  selectDeclartionStartMonth(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      let month = 0;
      if (value == 1)
        month = 12;
      else
        month = value - 1;

      this.initialForm.get('DeclarationEndMonth').setValue(month);
    }
  }

  fireBrowser() {
    this.FileDocumentList = [];
    this.FileDocumentList = [];
    $('#uploadCompanyPrimaryLogo').click();
  }

  logoFile(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.companyLogo = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = file.name;
      item.FileType = file.type;
      item.FileSize = (Number(file.size)/1024);
      item.FileExtension = file.type;
      item.DocumentId = 0;
      item.ParentFolder = '';
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
    }
  }

}
