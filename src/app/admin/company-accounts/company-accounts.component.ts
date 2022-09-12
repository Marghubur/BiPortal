import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-company-accounts',
  templateUrl: './company-accounts.component.html',
  styleUrls: ['./company-accounts.component.scss']
})
export class CompanyAccountsComponent implements OnInit {
  submitted: boolean = false;
  organizationAccountsForm: FormGroup = null;
  CompanyAccountDetails: Array<any> = [];
  isLoading: boolean = false;
  isLoaded: boolean = false;
  CurrentCompany: any = null;
  OrganizationId: number = 0;
  orderByNameAsc: boolean = null;
  orderByBranchAsc: boolean = null;
  orderByAccountAsc: boolean = null;
  orderByIFSCAsc: boolean = null;
  companyData: Filter = null;
  singleCompanyAccountInfo: organizationAccountModal = new organizationAccountModal();
  filterCompanyAccountInfo: organizationAccountModal = new organizationAccountModal();
  model: NgbDateStruct;
  closingDatemodel: NgbDateStruct;
  isCompanyrInfoSubmitted: boolean = false;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.singleCompanyAccountInfo = new organizationAccountModal();
    this.filterCompanyAccountInfo = new organizationAccountModal();
    let data = this.nav.getValue();
    this.companyData = new Filter();
    if (data) {
      this.CurrentCompany = data;
      this.OrganizationId = data.OrganizationId;
      this.companyData.SearchString = `1=1 And CompanyId=${this.CurrentCompany.CompanyId} And OrganizationId=${this.OrganizationId}`;
      this.loadData();
    }else {
      ErrorToast("Please a company first.")
    }
    this.initForm();
  }

  loadData() {
    this.isLoaded = false;
    this.http.post('Company/GetCompanyBankDetail', this.companyData).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.CompanyAccountDetails = response.ResponseBody;
        if (this.CompanyAccountDetails.length > 0) {
          this.companyData.TotalRecords = this.CompanyAccountDetails[0].Total;
          this.isLoaded = true;
        } else {
          this.companyData.TotalRecords = 0;
        }
      }
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  get f() {
    let data = this.organizationAccountsForm.controls;
    return data;
  }

  initForm() {
    this.organizationAccountsForm = this.fb.group({
      CompanyId: new FormControl(this.singleCompanyAccountInfo.CompanyId),
      GSTNo: new FormControl(this.singleCompanyAccountInfo.GSTNo),
      AccountNo: new FormControl(this.singleCompanyAccountInfo.AccountNo, [Validators.required]),
      BankName: new FormControl(this.singleCompanyAccountInfo.BankName),
      Branch: new FormControl(this.singleCompanyAccountInfo.Branch),
      BranchCode: new FormControl(this.singleCompanyAccountInfo.BranchCode),
      IFSC: new FormControl(this.singleCompanyAccountInfo.IFSC),
      PANNo: new FormControl(this.singleCompanyAccountInfo.PANNo),
      TradeLicenseNo: new FormControl (this.singleCompanyAccountInfo.TradeLicenseNo),
      IsPrimaryAccount: new FormControl (this.singleCompanyAccountInfo.IsPrimaryAccount ? 'true': 'false'),
      OrganizationId: new FormControl(this.singleCompanyAccountInfo.OrganizationId),
      BankAccountId: new FormControl(this.singleCompanyAccountInfo.BankAccountId),
      OpeningDate: new FormControl(this.singleCompanyAccountInfo.OpeningDate),
      ClosingDate: new FormControl(this.singleCompanyAccountInfo.ClosingDate)
    });
  }

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  addUpdateAccount() {
    let errroCounter = 0;
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
          if (response.ResponseBody !== null) {
            this.CompanyAccountDetails = response.ResponseBody;
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

  editAccountPopUp(item: organizationAccountModal) {
    if (item && item.OrganizationId > 0) {
      this.singleCompanyAccountInfo = item;

      if ((this.singleCompanyAccountInfo.PANNo != null &&this.singleCompanyAccountInfo.PANNo != null) || (this.singleCompanyAccountInfo.GSTNo != null && this.singleCompanyAccountInfo.GSTNo != null) || (this.singleCompanyAccountInfo.TradeLicenseNo != null && this.singleCompanyAccountInfo.TradeLicenseNo))
        this.isCompanyrInfoSubmitted = false;
      else
        this.isCompanyrInfoSubmitted = true;

      let date = new Date(this.singleCompanyAccountInfo.OpeningDate);
      this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      date = new Date(this.singleCompanyAccountInfo.ClosingDate);
      this.closingDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      this.initForm();
      $('#accountModal').modal('show');
    }
  }

  DeleteAccountPopUp(item: organizationAccountModal) {

  }

  addAccountPopUp() {
    this.singleCompanyAccountInfo = new organizationAccountModal();
    let value = this.CompanyAccountDetails.filter(x => x.PANNo != null || x.GSTNo != null || x.TradeLicenseNo != null);
      if (value.length > 0)
        this.isCompanyrInfoSubmitted = true;
      else
        this.isCompanyrInfoSubmitted = false;
    this.initForm();
    $('#accountModal').modal('show');
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.companyData.SearchString = ""
    this.companyData.reset();

    if(this.filterCompanyAccountInfo.BankName !== null && this.filterCompanyAccountInfo.BankName !== "") {
      this.companyData.SearchString += ` 1=1 and BankName like '%${this.filterCompanyAccountInfo.BankName}%'`;
        delimiter = "and";
    }

    if(this.filterCompanyAccountInfo.AccountNo !== null && this.filterCompanyAccountInfo.AccountNo !== "") {
      this.companyData.SearchString += `1=1 And AccountNo like '%${this.filterCompanyAccountInfo.AccountNo}%'`;
        delimiter = "and";
    }

    if(this.filterCompanyAccountInfo.Branch !== null && this.filterCompanyAccountInfo.Branch.trim() !== '') {
      this.companyData.SearchString += `1=1 And Branch like '%${this.filterCompanyAccountInfo.Branch}%'`;
        delimiter = "and";
    }

    if(this.filterCompanyAccountInfo.IFSC !== null && this.filterCompanyAccountInfo.IFSC.trim() !== '') {
      this.companyData.SearchString += `1=1 And IFSC like '%${this.filterCompanyAccountInfo.IFSC}%'`;
        delimiter = "and";
    }

    this.loadData();
  }

  resetFilter() {
    this.companyData = new Filter();
    this.companyData.SearchString = `1=1 And CompanyId=${this.CurrentCompany.CompanyId} And OrganizationId=${this.OrganizationId}`;
    this.filterCompanyAccountInfo = new organizationAccountModal();
    this.loadData();
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'BankName') {
      this.orderByNameAsc = !flag;
      this.orderByAccountAsc = null;
      this.orderByBranchAsc = null;
      this.orderByIFSCAsc = null;
    } else if (FieldName == 'AccountNo') {
      this.orderByAccountAsc = !flag;
      this.orderByNameAsc = null;
      this.orderByBranchAsc = null;
      this.orderByIFSCAsc = null;
    }
    else if (FieldName == 'Branch') {
      this.orderByBranchAsc = !flag;
      this.orderByNameAsc = null;
      this.orderByAccountAsc = null;
      this.orderByIFSCAsc = null;
    }
    else {
      this.orderByBranchAsc = null;
      this.orderByNameAsc = null;
      this.orderByAccountAsc = null;
      this.orderByIFSCAsc = !flag;
    }
    this.companyData = new Filter();
    this.companyData.SortBy = FieldName +" "+ Order;
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.companyData = e;
      this.loadData();
    }
  }

  onOpeningDateSelect(e: NgbDateStruct) {
    let date = new Date(e.year, e.month, e.day);
    this.organizationAccountsForm.get('OpeningDate').setValue(date);
  }

  onClosingDateSelect(e: any) {
    let date = new Date(e.year, e.month, e.day);
    this.organizationAccountsForm.get('ClosingDate').setValue(date);
  }
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
