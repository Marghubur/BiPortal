import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatter } from 'src/providers/DateFormatter';
import { organizationAccountModal } from '../company-accounts/company-accounts.component';
import { Files } from '../documents/documents.component';
import { iNavigation } from 'src/providers/iNavigation';
import { environment } from 'src/environments/environment';
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
  BankDetails: organizationAccountModal = null;
  signwithoutstamp: string = '';
  FileDocuments: Array<any> = [];
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  CompanyId: number = 0;
  OrganizationId: number = 0;
  isLoading: boolean = false;
  imageBasePath: string = null;
  isPageReady: boolean = true;

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
    this.companyInformation.LegalEntity = '';
    let data = this.nav.getValue();
    if (data > 0) {
      this.CompanyId = data;
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
            } else {
              this.signwithoutstamp = `${this.imageBasePath}/${item.FilePath}/${item.FileName}.${item.FileExtension}`;
            }
          });
        }

        this.CompanyId = this.companyInformation.CompanyId;
        let date = new Date(this.companyInformation.InCorporationDate);
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
      LegalEntity: new FormControl(this.companyInformation.LegalEntity),
      Signature: new FormControl(this.companyInformation.Signature),
      LegalNameOfCompany: new FormControl(this.companyInformation.LegalNameOfCompany, [Validators.required]),
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
    this.OrganizationId =1;
    if (this.CompanyId > 0 && this.OrganizationId > 0) {
      this.http.get(`Company/GetCompanyBankDetail/${this.OrganizationId}/${this.CompanyId}`).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.BankDetails = response.ResponseBody;
          Toast("Record found.")
        }
      })
    } else {
      ErrorToast("Invalid Organization Selected.");
    }
  }

  activePage(page: number) {
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
