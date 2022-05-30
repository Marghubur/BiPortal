import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
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

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  get f () {
    return this.companyInformationForm.controls;
  }

  ngOnInit(): void {
    this.ActivatedPage = 1;
    this.companyInformation = new CompanyInformationClass();
    this.initForm();
    this.companyInformation.LegalEntity = '';
    this.loadData();
  }

  loadData() {
    this.http.get("Settings/GetOrganizationInfo").then((response: ResponseModel) => {
      if (response.ResponseBody ) {
        Toast("Record found.")
        this.OrganizationDetails = response.ResponseBody;
        if (this.OrganizationDetails.length == 1) {
          this.companyInformation = this.OrganizationDetails[0];
          let date = new Date(this.companyInformation.InCorporationDate);
          this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          this.initForm();
        }
      }
    })
  }

  initForm() {
    this.companyInformationForm = this.fb.group({
      OrganizationId: new FormControl(this.companyInformation.OrganizationId),
      LegalEntity: new FormControl(this.companyInformation.LegalEntity),
      Signature: new FormControl(this.companyInformation.Signature),
      LegalNameOfCompany: new FormControl(this.companyInformation.LegalNameOfCompany, [Validators.required]),
      TypeOfBusiness: new FormControl(this.companyInformation.TypeOfBusiness),
      InCorporationDate: new FormControl(this.companyInformation.InCorporationDate),
      FullAddress: new FormControl(this.companyInformation.FullAddress)
    })
  }

  findCompany(e: any) {
    let value = e.target.value;
    this.companyInformation = new CompanyInformationClass();
    if (value  != '0') {
      this.companyInformation = this.OrganizationDetails.find (x => x.OrganizationId == value);
      let date = new Date(this.companyInformation.InCorporationDate)
      this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    } else {
      ErrorToast("Please select organization.")
    }
    this.initForm();
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.companyInformationForm.controls["InCorporationDate"].setValue(date);
  }

  activePage(page: number) {
    switch (page) {
      case 2:
        this.ActivatedPage = 2;
        break;
      case 3:
        this.ActivatedPage = 3;
        break;
      default:
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

  AddSigntureModel() {
    $('#addSignature').modal('show');
  }

  addSignature() {

  }

  updateDetail() {
    this.submitted = true;
    let request:CompanyInformationClass = this.companyInformationForm.value;
    if (request.OrganizationId <= 0)
      ErrorToast("Invalid Organization");
    let value = this.OrganizationDetails.find (x => x.OrganizationId == request.OrganizationId);
    value.LegalEntity = request.LegalEntity;
    value.LegalNameOfCompany = request.LegalNameOfCompany;
    value.TypeOfBusiness = request.TypeOfBusiness;
    value.InCorporationDate = request.InCorporationDate;
    value.FullAddress = request.FullAddress;

    this.http.post("Settings/InsertUpdateCompanyDetail", value)
    .then(res => {
      if(res.ResponseBody) {
        Toast("Detail inserted/updated successfully.");
      }
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
  OrganizationId: number = 0;
}
