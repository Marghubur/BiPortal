import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-annexure',
  templateUrl: './annexure.component.html',
  styleUrls: ['./annexure.component.scss']
})
export class AnnexureComponent implements OnInit {
  isPageLoading: boolean = false;
  active = 1;
  isPageReady: boolean = true;
  htmlText: any = null;
  isLoading: boolean = false;
  companyId: number = 0;
  annextureIform: FormGroup;
  currentOfferLetter: AnnexureOfferLeter = new AnnexureOfferLeter();
  currentCompany: any = null;
  employeeForm: FormGroup;
  model: NgbDateStruct;
  submitted: boolean = false;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    let companies = this.local.findRecord("Companies");
    if (companies) {
      this.currentCompany = companies.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.isPageReady = true;
        this.companyId = this.currentCompany.CompanyId;
        this.loadData();
      }
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(`Template/GetAnnexureOfferLetter/${this.companyId}/2`).then(res => {
      if (res.ResponseBody) {
        this.buildData(res.ResponseBody);
        this.isPageReady = true;
      } else {
        this.isPageReady = true;
        this.initannextureIform();
      }
    }).catch(e => {
      this.isPageReady = true;
      ErrorToast("Invalid template selected");
    })
    this.isPageReady = true;

  }

  buildData(res: any) {
    this.currentOfferLetter = res;
    this.htmlText = res.BodyContent;
    this.initannextureIform();
  }

  initannextureIform() {
    this.annextureIform = this.fb.group({
      AnnexureOfferLetterId: new FormControl(this.currentOfferLetter.AnnexureOfferLetterId),
      CompanyId: new FormControl(this.companyId),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      TemplateName: new FormControl(this.currentOfferLetter.TemplateName, [Validators.required]),
      BodyContent: new FormControl(this.currentOfferLetter.BodyContent),
      FileId: new FormControl(this.currentOfferLetter.FileId),
    })
  }

  get m () {
    return this.annextureIform.controls;
  }

  saveAnnexture() {
    this.isLoading = true;
    this.submitted = true;
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    if (!data && data == "" && this.annextureIform.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.annextureIform.value;
    value.BodyContent = data;
    let LetterType = 2;
    this.http.post(`Template/AnnexureOfferLetterInsertUpdate/${LetterType}`, value).then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody != '') {
        let data = res.ResponseBody;
        this.buildData(data);
        Toast("Template inserted/ updated successfully.");
        this.submitted = false;
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  generateOfferLetter() {
    this.submitted = true;
    this.isLoading = true;
    if (this.employeeForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.employeeForm.value;
    // this.http.post("Employee/GenerateOfferLetter", value).then(res => {
    //   if (res.ResponseBody) {
    //     Toast("Offer letter generated successfully");
    //     $("#offerLetterModal").modal('hide');
    //   }
    //   this.isLoading = false;
    // }).catch(e => {
    //   this.isLoading = false;
    // })
  }

  initEmpForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl('', [Validators.required]),
      LastName: new FormControl('', [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName, [Validators.required]),
      CompanyId: new FormControl(this.companyId, [Validators.required]),
      Designation: new FormControl('', [Validators.required]),
      CTC: new FormControl(null, [Validators.required]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      JoiningDate: new FormControl('', [Validators.required])
    })
  }

  get f() {
    return this.employeeForm.controls;
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.employeeForm.controls["JoiningDate"].setValue(date);
  }

}


class AnnexureOfferLeter {
  AnnexureOfferLetterId: number= 0;
  CompanyId: number= 0;
  CompanyName: string= '';
  TemplateName: string= "AnnextureI";
  BodyContent: string= '';
  FileId: number= 0;
}
