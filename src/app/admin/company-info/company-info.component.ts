import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnInit {
  ActivatedPage: number = 1;
  companyInformationForm: FormGroup;
  companyInformation: CompanyInformationClass = new CompanyInformationClass();

  constructor(
    private fb: FormBuilder,
    private http: AjaxService
  ) { }

  ngOnInit(): void {
    this.ActivatedPage = 1;
    this.initForm();
  }

  initForm() {
    this.companyInformationForm = this.fb.group({
      LegalEntity: new FormControl(this.companyInformation.LegalEntity),
      Signature: new FormControl(this.companyInformation.Signature),
      CompanyLegalName: new FormControl(this.companyInformation.CompanyLegalName),
      BusinessType: new FormControl(this.companyInformation.BusinessType),
      InformationDate: new FormControl(this.companyInformation.InformationDate),
      RegisteredAddress: new FormControl(this.companyInformation.RegisteredAddress)
    })
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
    var stepCount = document.querySelectorAll(".progress-step");
    var stepinfo = document.querySelectorAll(".step-info");
    for (let i=0; i <stepCount.length; i++) {
      stepCount[i].classList.remove('active');
      stepinfo[i].classList.remove('step-info-active');
    }
    stepCount[page-1].classList.add('active');
    stepCount[page-1].classList.add('step-info-active');
  }

  updateDetail() {
    this.http.post("Settings/InsertUpdateCompanyDetail", this.companyInformationForm.value)
    .then(res => {
      if(res.ResponseBody) {
        Toast("Detail updated successfully.");
      }
    });
  }
}

class CompanyInformationClass {
  LegalEntity: string = '0';
  Signature: string = '';
  CompanyLegalName: string = '';
  BusinessType: string = '';
  InformationDate: string = '';
  RegisteredAddress: string = '';
}
