import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { organizationAccountModal } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { CommonService, ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Company, UserImage } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
  submitted: boolean = false;
  companysubmitted: boolean = false;
  organizationAccountsForm: FormGroup = null;
  companyForm: FormGroup = null;
  CompanyAccountDetails: Array<any> = [];
  isLoading: boolean = false;
  isLoaded: boolean = false;
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
  corporationDateModal: NgbDateStruct;
  currentCompany: any = null;
  fileDetail: Array<any> = [];
  profileURL: string = UserImage;
  maxdate: any = null;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private common: CommonService,
    private calendar: NgbCalendar
  ) { }

  ngOnInit(): void {
    this.maxdate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    this.initData();
  }

  initData() {
    let data = this.local.findRecord("Companies");
    if (!data) {
      return;
    } else {
      this.companyData = new Filter();
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      this.corporationDateModal = this.calendar.getToday();
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.OrganizationId = this.currentCompany.OrganizationId;
        this.companyData.SearchString = `1=1 And CompanyId=${this.currentCompany.CompanyId} And OrganizationId=${this.OrganizationId}`;
        this.loadData();
      }
    }
  }

  pageReload() {
    this.initData();
  }

  loadData() {
    this.isLoaded = false;
    let companyId = this.currentCompany.CompanyId;
    this.http.get(`Company/GetCompanyById/${companyId}`).then((response: ResponseModel) => {
      if(response.ResponseBody ) {
        this.currentCompany = response.ResponseBody.OrganizationDetail;
        let date;
        if (this.currentCompany.InCorporationDate == null || this.currentCompany.InCorporationDate != '0001-01-01T00:00:00')
          date = new Date(this.currentCompany.InCorporationDate);
        else {
          date = new Date() ;
          this.currentCompany.InCorporationDate = date;
        }

        this.corporationDateModal = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        this.buildProfileImage(response.ResponseBody.Files);
        this.getBankDetail();
        this.initBankAccountForm();
        this.initCompanyForm();
        this.isLoaded = true;
      }
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  buildProfileImage(fileDetail: any) {
    if (fileDetail && fileDetail.length > 0) {
      let logoFile = fileDetail.find(x => x.FileName == "CompanyProfile")
      if (logoFile) {
        this.profileURL = `${this.http.GetImageBasePath()}${logoFile.FilePath}/${logoFile.FileName}.${logoFile.FileExtension}`;
        this.currentCompany.FileId = logoFile.FileId;
      }
    }
  }

  getBankDetail() {
    this.isLoaded = false;
    this.http.post('Company/GetCompanyBankDetail', this.companyData).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.CompanyAccountDetails = response.ResponseBody;
        if (this.CompanyAccountDetails.length > 0) {
          this.companyData.TotalRecords = this.CompanyAccountDetails[0].Total;
        } else {
          this.companyData.TotalRecords = 0;
        }

        this.initBankAccountForm();
        this.initCompanyForm();
        this.isLoaded = true;
      }
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  get f() {
    let data = this.organizationAccountsForm.controls;
    return data;
  }

  initBankAccountForm() {
    this.organizationAccountsForm = this.fb.group({
      CompanyId: new FormControl(this.singleCompanyAccountInfo.CompanyId),
      AccountNo: new FormControl(this.singleCompanyAccountInfo.AccountNo, [Validators.required]),
      BankName: new FormControl(this.singleCompanyAccountInfo.BankName, [Validators.required]),
      Branch: new FormControl(this.singleCompanyAccountInfo.Branch, [Validators.required]),
      BranchCode: new FormControl(this.singleCompanyAccountInfo.BranchCode),
      IFSC: new FormControl(this.singleCompanyAccountInfo.IFSC, [Validators.required]),
      IsPrimaryAccount: new FormControl (this.singleCompanyAccountInfo.IsPrimaryAccount ? 'true': 'false'),
      OrganizationId: new FormControl(this.singleCompanyAccountInfo.OrganizationId),
      BankAccountId: new FormControl(this.singleCompanyAccountInfo.BankAccountId),
      OpeningDate: new FormControl(this.singleCompanyAccountInfo.OpeningDate),
      ClosingDate: new FormControl(this.singleCompanyAccountInfo.ClosingDate)
    });
  }

  initCompanyForm() {
    this.companyForm = this.fb.group({
      CompanyId: new FormControl(this.currentCompany.CompanyId),
      OrganizationId: new FormControl(this.currentCompany.OrganizationId),
      OrganizationName: new FormControl(this.currentCompany.OrganizationName, [Validators.required]),
      CompanyName: new FormControl(this.currentCompany.CompanyName, [Validators.required]),
      CompanyDetail: new FormControl(this.currentCompany.CompanyDetail),
      SectorType: new FormControl(this.currentCompany.SectorType),
      City: new FormControl(this.currentCompany.City, [Validators.required]),
      State: new FormControl(this.currentCompany.State, [Validators.required]),
      Country: new FormControl(this.currentCompany.Country, [Validators.required]),
      FirstAddress: new FormControl(this.currentCompany.FirstAddress, [Validators.required]),
      SecondAddress: new FormControl(this.currentCompany.SecondAddress, [Validators.required]),
      ThirdAddress: new FormControl(this.currentCompany.ThirdAddress),
      ForthAddress: new FormControl(this.currentCompany.ForthAddress),
      FullAddress: new FormControl(this.currentCompany.FullAddress),
      MobileNo: new FormControl(this.currentCompany.MobileNo),
      Email: new FormControl(this.currentCompany.Email, [Validators.required]),
      FirstEmail: new FormControl(this.currentCompany.FirstEmail),
      SecondEmail: new FormControl(this.currentCompany.SecondEmail),
      ThirdEmail: new FormControl(this.currentCompany.ThirdEmail),
      ForthEmail: new FormControl(this.currentCompany.ForthEmail),
      PrimaryPhoneNo: new FormControl(this.currentCompany.PrimaryPhoneNo, [Validators.required]),
      SecondaryPhoneNo: new FormControl(this.currentCompany.SecondaryPhoneNo),
      Fax: new FormControl(this.currentCompany.Fax),
      Pincode: new FormControl(this.currentCompany.Pincode, [Validators.required]),
      PANNo: new FormControl(this.currentCompany.PANNo),
      TradeLicenseNo: new FormControl(this.currentCompany.TradeLicenseNo),
      GSTNo: new FormControl(this.currentCompany.GSTNo, [Validators.required]),
      LegalEntity: new FormControl(this.currentCompany.LegalEntity),
      TypeOfBusiness: new FormControl(this.currentCompany.TypeOfBusiness),
      InCorporationDate: new FormControl(new Date(this.currentCompany.InCorporationDate)),
      IsPrimaryCompany: new FormControl(this.currentCompany.IsPrimaryCompany),
      FixedComponentsId: new FormControl(this.currentCompany.FixedComponentsId),
      FileId: new FormControl(this.currentCompany.FileId),
      LogoImgPath: new FormControl('')
    })
  }

  get m() {
    return this.companyForm.controls;
  }

  submitChanges() {
    this.companysubmitted = true;
    this.isLoading = true;
    let errroCounter = 0;
    if (this.companyForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all mandatory field");
      return;
    }
    if (this.companyForm.get("CompanyName").value === "" || this.companyForm.get("CompanyName").value === null)
      errroCounter++;

    if (this.companyForm.get("PrimaryPhoneNo").value === "" || this.companyForm.get("PrimaryPhoneNo").value === null)
      errroCounter++;

    if (this.companyForm.get("Email").value === "" || this.companyForm.get("Email").value === null)
      errroCounter++;

    if (this.companyForm.get("FileId").value == null)
      this.companyForm.get("FileId").setValue(0);

    let companyDetails = this.companyForm.value;
    if (errroCounter === 0) {
      let formData = new FormData()
      formData.append("CompanyInfo", JSON.stringify(companyDetails));
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append('CompanyProfile', file)
      this.http.post("Company/UpdateCompanyDetails", formData).then((response: ResponseModel) => {
        if (response.ResponseBody !== null) {
          this.currentCompany = response.ResponseBody;
          this.initCompanyForm();
          Toast("Company detail updated successfully");
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

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  addUpdateAccount() {
    let errroCounter = 0;
    this.submitted = true;
    if (this.organizationAccountsForm.get("AccountNo").value === "" || this.organizationAccountsForm.get("AccountNo").value === null)
      errroCounter++;

    if (this.organizationAccountsForm.invalid) {
      this.isLoading = false;
      ErrorToast("All read marked fields are mandatory.");
      return;
    }

    let request: organizationAccountModal = this.organizationAccountsForm.value;
    if (errroCounter === 0) {
      this.submitted = true;
      this.isLoading = true;
      request.OrganizationId = this.OrganizationId;
      request.CompanyId = this.currentCompany.CompanyId;
      if (request.OrganizationId > 0 && request.CompanyId > 0) {
        this.http.post("Company/InsertUpdateCompanyAccounts", request).then((response: ResponseModel) => {
          if (response.ResponseBody !== null && response.ResponseBody.length > 0) {
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

      let date = new Date(this.singleCompanyAccountInfo.OpeningDate);
      this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      date = new Date(this.singleCompanyAccountInfo.ClosingDate);
      this.closingDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      this.initBankAccountForm();
      $('#accountModal').modal('show');
    }
  }

  DeleteAccountPopUp(item: organizationAccountModal) {

  }

  addAccountPopUp() {
    this.singleCompanyAccountInfo = new organizationAccountModal();
    this.submitted = false;
    this.initBankAccountForm();
    $('#accountModal').modal('show');
  }

  fireBrowserFile() {
    $("#uploacompdocument").click();
  }

  filterRecords(e: any) {
    e.stopPropagation();
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
    this.companyData.SearchString = `1=1 And CompanyId=${this.currentCompany.CompanyId} And OrganizationId=${this.OrganizationId}`;
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

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.companyForm.controls["InCorporationDate"].setValue(date);
  }

  uploadorganizationLogo(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: "CompanyProfile",
        file: file
      });
    }
  }



  get c() {
    return this.companyForm.controls;
  }
}
