import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-company-accounts',
  templateUrl: './company-accounts.component.html',
  styleUrls: ['./company-accounts.component.scss']
})
export class CompanyAccountsComponent implements OnInit {
  submitted: boolean = false;
  organizationAccountsForm: FormGroup = null;
  CompanyAccountDetail: organizationAccountModal = null;
  isLoading: boolean = false;
  isLoaded: boolean = false;
  CurrentCompany: any = null;
  OrganizationId: number = 0;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.CompanyAccountDetail = new organizationAccountModal();
    let data = this.nav.getValue();
    if (data) {
      this.CurrentCompany = data;
      this.OrganizationId = 1;
      this.loadData();
      this.initForm();
    }else {
      ErrorToast("Please a company first.")
    }
    this.isLoaded = true;
  }

  loadData() {
    this.http.get(`Company/GetCompanyBankDetail/${this.OrganizationId}/${this.CurrentCompany.CompanyId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.CompanyAccountDetail = response.ResponseBody;
        this.initForm();
      }
      this.isLoaded = true;
    });
  }

  get f() {
    let data = this.organizationAccountsForm.controls;
    return data;
  }

  initForm() {
    this.organizationAccountsForm = this.fb.group({
      CompanyId: new FormControl(this.CompanyAccountDetail.CompanyId),
      GSTNO: new FormControl(this.CompanyAccountDetail.GSTNO),
      AccountNumber: new FormControl(this.CompanyAccountDetail.AccountNumber, [Validators.required]),
      BankName: new FormControl(this.CompanyAccountDetail.BankName),
      Branch: new FormControl(this.CompanyAccountDetail.Branch),
      BranchCode: new FormControl(this.CompanyAccountDetail.BranchCode),
      IFSCCode: new FormControl(this.CompanyAccountDetail.IFSCCode),
      PANNumber: new FormControl(this.CompanyAccountDetail.PANNumber),
      IsUser: new FormControl(this.CompanyAccountDetail.IsUser),
      TradeLiecenceNumber: new FormControl (this.CompanyAccountDetail.TradeLiecenceNumber),
      OrganizationId: new FormControl(this.CompanyAccountDetail.OrganizationId),
    });
  }

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;

    if (this.organizationAccountsForm.get("AccountNumber").value === "" || this.organizationAccountsForm.get("AccountNumber").value === null)
      errroCounter++;
    if (errroCounter === 0) {
      let request: organizationAccountModal = this.organizationAccountsForm.value;
      request.OrganizationId = this.OrganizationId;
      request.CompanyId = this.CurrentCompany.CompanyId;
      request.IsUser = false;
      if (request.OrganizationId > 0 && request.CompanyId > 0) {
        this.http.post("Company/InsertUpdateCompanyAccounts", request).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.CompanyAccountDetail = response.ResponseBody as organizationAccountModal;
            this.initForm();
            Toast("organization Inserted/Updated successfully");
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

export class organizationAccountModal {
  OrganizationId: number = 0;
  GSTNO: string = null;
  AccountNumber: string = null;
  BankName: string = null;
  Branch: string = null;
  IFSCCode: string = null;
  PANNumber: string = null;
  IsUser: boolean = false;
  TradeLiecenceNumber: string = '';
  BranchCode: string = '';
  CompanyId: number = 0;
}
