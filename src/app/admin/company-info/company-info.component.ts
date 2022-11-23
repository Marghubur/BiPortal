import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatter } from 'src/providers/DateFormatter';
import { Files } from '../documents/documents.component';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnInit {
  ActivatedPage: number = 1;
  companyInformationForm: FormGroup;
  companyInformation: CompanyInformationClass = new CompanyInformationClass();
  OrganizationDetails: Array<any> = [];
  submitted: boolean = false;
  model: NgbDateStruct;
  signURL: string = '';
  fileDetail: Array<any> = null;
  BankDetails: organizationAccountModal = new organizationAccountModal();
  primaryCompanyAccountInfo: organizationAccountModal = new organizationAccountModal();
  signwithoutstamp: string = '';
  FileDocuments: Array<any> = [];
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  CompanyId: number = 0;
  OrganizationId: number = 0;
  isLoading: boolean = false;
  imageBasePath: string = null;
  isPageReady: boolean = true;
  companyData: Filter = new Filter();
  CurrentCompany: any= null;
  openingmodel: NgbDateStruct;
  closingDatemodel: NgbDateStruct;
  organizationAccountsForm: FormGroup = null;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private dateFormat: DateFormatter,
              private nav: iNavigation) { }

  get f () {
    return this.companyInformationForm.controls;
  }

  ngOnInit(): void {
    this.imageBasePath = this.http.GetImageBasePath();
    this.ActivatedPage = 1;
    this.companyInformation = new CompanyInformationClass();
    this.initAccountForm();
    let data = this.nav.getValue();
    if (data) {
      this.CurrentCompany = data;
      this.CompanyId = this.CurrentCompany.CompanyId;
      this.OrganizationId = data.OrganizationId;
      this.companyData.SearchString = `1=1 And CompanyId=${this.CurrentCompany.CompanyId} And OrganizationId=${this.OrganizationId}`;
      this.initForm();
      this.loadData();
    } else {
      ErrorToast("Select company first.")
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`Company/GetCompanyById/${this.CompanyId}`).then((response: ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody.OrganizationDetail) {
        Toast("Record found.")
        this.companyInformation = response.ResponseBody.OrganizationDetail;

        this.fileDetail = [];
        if(response.ResponseBody.Files && response.ResponseBody.Files.length > 0) {
          this.fileDetail = response.ResponseBody.Files;

          response.ResponseBody.Files.map(item => {
            if(item.FileName.toLowerCase() == "signwithstamp") {
              this.signURL = `${this.imageBasePath}/${item.FilePath}/${item.FileName}.${item.FileExtension}`;
            } else if (item.FileName.toLowerCase() == "signwithoutStamp") {
              this.signwithoutstamp = `${this.imageBasePath}/${item.FilePath}/${item.FileName}.${item.FileExtension}`;
            }
          });
        }

        this.CompanyId = this.companyInformation.CompanyId;
        let date = null;
        if (this.companyInformation.InCorporationDate == null || new Date(this.companyInformation.InCorporationDate).getFullYear() == 1)
          date = new Date();
        else
          date = new Date(this.companyInformation.InCorporationDate);
        this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        this.initForm();
        this.findBankDetails();
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  initForm() {
    this.companyInformationForm = this.fb.group({
      CompanyId: new FormControl(this.companyInformation.CompanyId),
      LegalEntity: new FormControl(this.companyInformation.CompanyName),
      LegalNameOfCompany: new FormControl(this.companyInformation.LegalEntity),
      TypeOfBusiness: new FormControl(this.companyInformation.TypeOfBusiness),
      InCorporationDate: new FormControl(this.companyInformation.InCorporationDate),
      FullAddress: new FormControl(this.companyInformation.FullAddress),
      SignWithStamp: new FormControl(''),
      SignWithoutStamp: new FormControl('')
    })
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.companyInformationForm.controls["InCorporationDate"].setValue(date);
  }

  findBankDetails() {
    if (this.CompanyId > 0 && this.OrganizationId > 0) {
      this.http.post('Company/GetCompanyBankDetail', this.companyData).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          let accounts =response.ResponseBody
          this.BankDetails = accounts.find(x => x.IsPrimaryAccount == true);
          Toast("Record found.")
        }
      })
    } else {
      ErrorToast("Invalid Organization Selected.");
    }
  }

  activePage(page: number, status: string) {
    if(status == 'next' && page >= 0 && page <3)
      page = page + 1
    else if (status == 'previous' && page > 0 )
      page = page -1;

    switch (page) {
      case 2:
        this.ActivatedPage = 2;
        break;
      case 3:
        this.ActivatedPage = 3;
        break;
      case 1:
        this.ActivatedPage = 1;
        break;
    }

    var stepCount = document.querySelectorAll(".progress-step-item");
    for (let i=0; i <stepCount.length; i++) {
      stepCount[i].classList.remove('active', 'fill-success');
    }
    stepCount[page-1].classList.add('active');
    if (page > 1) {
      for (let i=0; i <page-1; i++) {
        stepCount[i].classList.add('fill-success');
      };
    }
    document.getElementById('progress').style.width = ((page - 1) *50).toString() + '%';
  }

  fireBrowserFile() {
    $('#uploasignature').click();
  }

  fireBrowsersign() {
    $('#uploasignwithoutstamp').click();
  }

  signwithStamp(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.signURL = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = "signwithStamp";
      item.FileType = file.type;
      item.FileSize = (Number(file.size)/1024);
      item.FileExtension = file.type;
      item.DocumentId = 0;
      item.ParentFolder = '';
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
    }
  }

  signwithoutStamp(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.signwithoutstamp = event.target.result;
      };
      let selectedfile = event.target.files;
      // let file = <File>selectedfile[0];
      // this.fileDetail.push({
      //   name: "signwithoutstamp",
      //   file: file
      // });
      let file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = "signwithoutStamp";
      item.FileType = file.type;
      item.FileSize = (Number(file.size)/1024);
      item.FileExtension = file.type;
      item.DocumentId = 0;
      item.ParentFolder = '';
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
    }
  }

  updateDetail() {
    this.submitted = true;
    this.isLoading = true;
    let request:CompanyInformationClass = this.companyInformationForm.value;
    if (this.companyInformationForm.invalid) {
      this.isLoading = false;
      return;
    }
    if (request.CompanyId <= 0)
      ErrorToast("Invalid Organization");
    let value = this.companyInformation;
    value.LegalEntity = request.LegalEntity;
    value.LegalNameOfCompany = request.LegalNameOfCompany;
    value.TypeOfBusiness = request.TypeOfBusiness;
    value.InCorporationDate = request.InCorporationDate;
    value.FullAddress = request.FullAddress;
    let formData = new FormData();
    formData.append("CompanyInfo", JSON.stringify(value));
    if (this.FileDocumentList.length > 0){
      let i = 0;
      while (i < this.FileDocumentList.length) {
        formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
        i++;
      }
    }
    this.http.post("Company/UpdateCompanyDetails", formData)
    .then(res => {
      if(res.ResponseBody) {
        this.companyInformation = res.ResponseBody;
        let date = new Date(this.companyInformation.InCorporationDate);
        this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        this.initForm();
        Toast("Detail inserted/updated successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    });
  }

  onOpeningDateSelect(e: NgbDateStruct) {
    let date = new Date(e.year, e.month, e.day);
    this.organizationAccountsForm.get('OpeningDate').setValue(date);
  }

  onClosingDateSelect(e: any) {
    let date = new Date(e.year, e.month, e.day);
    this.organizationAccountsForm.get('ClosingDate').setValue(date);
  }

  get m() {
    let data = this.organizationAccountsForm.controls;
    return data;
  }

  editBankAccount(item: any) {
    if (item) {
      this.primaryCompanyAccountInfo = item;
      this.initAccountForm();
      $('#accountModal').modal('show');
    }
  }

  initAccountForm() {
    this.organizationAccountsForm = this.fb.group({
      CompanyId: new FormControl(this.primaryCompanyAccountInfo.CompanyId),
      GSTNo: new FormControl(this.primaryCompanyAccountInfo.GSTNo),
      AccountNo: new FormControl(this.primaryCompanyAccountInfo.AccountNo, [Validators.required]),
      BankName: new FormControl(this.primaryCompanyAccountInfo.BankName),
      Branch: new FormControl(this.primaryCompanyAccountInfo.Branch),
      BranchCode: new FormControl(this.primaryCompanyAccountInfo.BranchCode),
      IFSC: new FormControl(this.primaryCompanyAccountInfo.IFSC),
      PANNo: new FormControl(this.primaryCompanyAccountInfo.PANNo),
      TradeLicenseNo: new FormControl (this.primaryCompanyAccountInfo.TradeLicenseNo),
      IsPrimaryAccount: new FormControl (this.primaryCompanyAccountInfo.IsPrimaryAccount ? 'true': 'false'),
      OrganizationId: new FormControl(this.primaryCompanyAccountInfo.OrganizationId),
      BankAccountId: new FormControl(this.primaryCompanyAccountInfo.BankAccountId),
      OpeningDate: new FormControl(this.primaryCompanyAccountInfo.OpeningDate),
      ClosingDate: new FormControl(this.primaryCompanyAccountInfo.ClosingDate)
    });
  }


  addUpdateAccount() {
    let errroCounter = 0;
    this.submitted = true;
    if (this.organizationAccountsForm.get("AccountNo").value === "" || this.organizationAccountsForm.get("AccountNo").value === null)
      errroCounter++;

    let request: organizationAccountModal = this.organizationAccountsForm.value;
    if (errroCounter === 0) {
      this.submitted = true;
      this.isLoading = true;
      request.OrganizationId = this.OrganizationId;
      request.CompanyId = this.CurrentCompany.CompanyId;
      if (request.OrganizationId > 0 && request.CompanyId > 0) {
        this.http.post("Company/InsertUpdateCompanyAccounts", request).then((response: ResponseModel) => {
          if (response.ResponseBody !== null && response.ResponseBody.length > 0) {
            let accounts =response.ResponseBody
            this.BankDetails = accounts.find(x => x.IsPrimaryAccount == true);
            $('#accountModal').modal('hide');
            Toast("Company account deatils inserted/updated successfully");
          } else {
            ErrorToast("Failed to generated, Please contact to admin.");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
        });
      }
    } else {
      this.isLoading = false;
      ErrorToast("All read marked fields are mandatory.");
    }
  }
}

class CompanyInformationClass {
  LegalEntity: string = '';
  Signature: string = '';
  LegalNameOfCompany: string = '';
  TypeOfBusiness: string = '';
  InCorporationDate: Date = null;
  FullAddress: string = '';
  CompanyId: number = 0;
  CompanyName: string = '';
  OrganizationId: number = 0;
}


export class organizationAccountModal {
  OrganizationId: number = 0;
  GSTNo: string = null;
  AccountNo: string = null;
  BankName: string = null;
  Branch: string = null;
  IFSC: string = null;
  PANNo: string = null;
  IsPrimaryAccount: boolean = false;
  TradeLicenseNo: string = '';
  BranchCode: string = '';
  CompanyId: number = 0;
  BankAccountId: number = 0;
  OpeningDate: Date = null;
  ClosingDate: Date = null;
}
