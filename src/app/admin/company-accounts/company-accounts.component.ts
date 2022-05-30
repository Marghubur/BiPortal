import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  organizationAccountModal: organizationAccountModal = null;
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
    this.loadData();
    this.initForm();
    this.isLoaded = true;
    this.organizationId = 0;
  }

  loadData() {
    this.http.get("Settings/GetOrganizationInfo").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        if (response.ResponseBody.length > 0)
          this.organizationAccountModal = response.ResponseBody as organizationAccountModal;
        this.initForm();
      } else {
        this.organizationAccountModal = new organizationAccountModal;
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
      OrganizationId: new FormControl(this.organizationAccountModal.OrganizationId),
      GSTNO: new FormControl(this.organizationAccountModal.GSTNO),
      AccountNo: new FormControl(this.organizationAccountModal.AccountNo),
      BankName: new FormControl(this.organizationAccountModal.BankName),
      BranchName: new FormControl(this.organizationAccountModal.BranchName),
      IFSC: new FormControl(this.organizationAccountModal.IFSC),
      PanNo: new FormControl(this.organizationAccountModal.PanNo),
      IsUser: new FormControl(this.organizationAccountModal.IsUser)
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

    let organizationDetail = this.organizationAccountsForm.value;

    if (errroCounter === 0) {
      let request: organizationAccountModal = this.organizationAccountsForm.value;
      let formData = new FormData()
      // formData.append("organizationDetail", JSON.stringify(request));
      this.http.post("Settings/InsertUpdateCompanyDetail", request).then((response: ResponseModel) => {
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
    } else {
      this.isLoading = false;
      ErrorToast("All read marked fields are mandatory.");
    }
  }


}

class organizationAccountModal {
  OrganizationId: number = 0;
  GSTNO: string = null;
  AccountNo: string = null;
  BankName: string = null;
  BranchName: string = null;
  IFSC: string = null;
  PanNo: string = null;
  IsUser: boolean = false;
}
