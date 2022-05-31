import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { organizationModal } from '../company-detail/company-detail.component';

@Component({
  selector: 'app-company-accounts',
  templateUrl: './company-accounts.component.html',
  styleUrls: ['./company-accounts.component.scss']
})
export class CompanyAccountsComponent implements OnInit {
  submitted: boolean = false;
  organizationAccountsForm: FormGroup = null;
  organizationAccountModal: organizationAccountModal = null;
  OrganizationDetails: organizationModal = null;
  isLoading: boolean = false;
  isLoaded: boolean = false;
  organizationId: number = 0;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private nav: iNavigation
  ) { }

  // ngOnDestroy() {
  //   this.nav.resetValue();
  // }

  ngOnInit(): void {
    this.organizationAccountModal = new organizationAccountModal();
    this.initForm();
    this.loadData();
    this.isLoaded = true;
    this.organizationId = 0;
  }

  loadData() {
    this.http.get("Settings/GetOrganizationInfo").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.OrganizationDetails = response.ResponseBody;
        if (response.ResponseBody.length == 1) {
          let data = response.ResponseBody[0];
          this.findCompanyAccountsDeatils(data.OrganizationId);
        }
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
      OrganizationId: new FormControl(this.organizationAccountModal.OrganizationId),
      GSTINNumber: new FormControl(this.organizationAccountModal.GSTINNumber),
      AccountNumber: new FormControl(this.organizationAccountModal.AccountNumber),
      BankName: new FormControl(this.organizationAccountModal.BankName),
      Branch: new FormControl(this.organizationAccountModal.Branch),
      IFSCCode: new FormControl(this.organizationAccountModal.IFSCCode),
      PANNumber: new FormControl(this.organizationAccountModal.PANNumber),
      IsUser: new FormControl(this.organizationAccountModal.IsUser),
      TradeLiecenceNumber: new FormControl (this.organizationAccountModal.TradeLiecenceNumber)
    });
  }

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  findCompanyAccounts(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      this.findCompanyAccountsDeatils(value);
    }
  }

  findCompanyAccountsDeatils(id: number) {
    if (id > 0) {
      this.http.get(`Settings/GetOrganizationAccountsInfo/${id}`)
      .then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.organizationAccountModal = response.ResponseBody;
          this.initForm();
        }
      });
    } else
      ErrorToast("Select a valid organization.")
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;
    if (errroCounter === 0) {
      let request: organizationAccountModal = this.organizationAccountsForm.value;
      request.IsUser = false;
      if (request.OrganizationId > 0) {
        let formData = new FormData()
        // formData.append("organizationDetail", JSON.stringify(request));
        this.http.put("Settings/UpdateCompanyAccounts", request).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.organizationAccountModal = response.ResponseBody as organizationAccountModal;
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

class organizationAccountModal {
  OrganizationId: number = 0;
  GSTINNumber: string = null;
  AccountNumber: string = null;
  BankName: string = null;
  Branch: string = null;
  IFSCCode: string = null;
  PANNumber: string = null;
  IsUser: boolean = false;
  TradeLiecenceNumber: string = '';
}
