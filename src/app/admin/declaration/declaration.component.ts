import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { Files } from 'src/app/admin/documents/documents.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, AdminForm12B, AdminFreeTaxFilling, AdminIncomeTax, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminTaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import 'bootstrap';
import { MonthlyTax } from '../incometax/incometax.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
declare var $: any;

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss']
})
export class DeclarationComponent implements OnInit, AfterViewChecked {
  active = 1;
  rentResidenceForm: FormGroup;
  isPanEnable: boolean = false;
  isSignDeclareEnable: boolean = false;
  fileDetail: Array<any> = [];
  isLargeFile: boolean = false;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  userDetail: UserDetail = new UserDetail();
  isPPFSubmitted: boolean = false;
  exemptions: Array<IncomeDeclaration> = [];
  otherExemptions: Array<IncomeDeclaration> = [];
  taxSavingAllowance: Array<IncomeDeclaration> = [];
  cachedData: any = null;
  taxAmount: TaxAmount = new TaxAmount();
  myDeclaration: Array<MyDeclaration> = [];
  year: number = 0;
  taxCalender: Array<any> = [];
  monthlyTaxAmount: MonthlyTax;
  allComponentDetails: any = {};
  exemptionComponent: Array<any> = [];
  filterValue: string = '';
  editException: boolean = false;
  EmployeeId: number = 0;
  EmployeeDeclarationId: number = 0;
  SectionIsReady: boolean = false;
  presentRow: any = null;
  attachmentForDeclaration: string = '';
  employeeEmail: string = '';
  totalFileSize: number = 0;
  rentalPage: number = 0;
  declarationFiles: Array<Files> = [];
  slectedDeclarationnFile: Array<Files> = [];
  ExemptionDeclaration: Array<any> = [];
  OtherDeclaration: Array<any> = [];
  TaxSavingAlloance: Array<any> = [];
  isEmployeesReady: boolean = false;
  applicationData: any = [];
  employeesList: autoCompleteModal = new autoCompleteModal();

  constructor(private local: ApplicationStorage,
    private user: UserService,
    private fb: FormBuilder,
    private nav: iNavigation,
    private http: AjaxService,) { }

  ngOnInit(): void {
    this.filterValue = '';
    this.rentalPage =1;
    this.rentedResidence();
    this.loadData();
    var dt = new Date();
    var month = 3;
    var year = dt.getFullYear();
    this.year = dt.getFullYear();
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if (expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
      this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if (Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
    } else {
      ErrorToast("Invalid user. Please login again.")
    }

    let i = 0;
    while (i < 12) {
      var mnth = Number((((month + 1) < 9 ? "" : "0") + month));
      if (month == 12) {
        month = 1;
        year++
      } else {
        month++;
      }
      this.taxCalender.push({
        month: new Date(year, mnth, 1).toLocaleString("en-us", { month: "short" }), // result: Aug
        year: Number(year.toString().slice(-2))
      });
      i++;
    }

    this.taxAmount = {
      NetTaxableAmount: 2050000,
      TotalTaxPayable: 444600,
      TaxAlreadyPaid: 37050,
      RemainingTaxAMount: 444600 - 37050
    };
    this.myDeclaration.push({
      Declaration: "1.5 Lac Exemptions",
      NoOfDeclaration: 2,
      AmountDeclared: 21600,
      ProofSUbmitted: 0,
      AmountRejected: 0,
      AmountAccepted: 0
    },
    {
      Declaration: "Other Exemptions",
      NoOfDeclaration: 0,
      AmountDeclared: 0,
      ProofSUbmitted: 0,
      AmountRejected: 0,
      AmountAccepted: 0
    },
    {
      Declaration: "Tax Saving Allowance",
      NoOfDeclaration: 0,
      AmountDeclared: 0,
      ProofSUbmitted: 0,
      AmountRejected: 0,
      AmountAccepted: 0
    },
    {
      Declaration: "House Property",
      NoOfDeclaration: 0,
      AmountDeclared: 0,
      ProofSUbmitted: 0,
      AmountRejected: 0,
      AmountAccepted: 0
    },
    {
      Declaration: "Income From Other Sources",
      NoOfDeclaration: 0,
      AmountDeclared: 0,
      ProofSUbmitted: 0,
      AmountRejected: 0,
      AmountAccepted: 0
    });


    this.monthlyTaxAmount = {
      april: 37050,
      may: 37050,
      june: 37050,
      july: 37050,
      aug: 37050,
      sep: 37050,
      oct: 37050,
      nov: 37050,
      dec: 37050,
      jan: 37050,
      feb: 37050,
      march: 37050
    };
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle = "tooltip"]').tooltip();
  }

  filterDeduction() {
    let value = this.filterValue.toLocaleUpperCase();
  }

  resetFilter() {
    this.filterValue = '';

    this.ExemptionDeclaration = this.allComponentDetails.ExemptionDeclaration;
    this.OtherDeclaration = this.allComponentDetails.OtherDeclaration;
    this.TaxSavingAlloance = this.allComponentDetails.TaxSavingAlloance;
  }

  getDeclaration(id: any) {
    this.EmployeeId = id;
    this.SectionIsReady = false;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        if(response.ResponseBody.SalaryComponentItems && response.ResponseBody.SalaryComponentItems.length > 0) {
          this.allComponentDetails = response.ResponseBody;
          this.resetFilter();
          this.EmployeeDeclarationId = response.ResponseBody.EmployeeDeclarationId;
          this.employeeEmail = response.ResponseBody.Email;
        }

        if (response.ResponseBody && response.ResponseBody.FileDetails)
          this.declarationFiles = response.ResponseBody.FileDetails;

        Toast("Declaration detail loaded successfully");
      }

      this.SectionIsReady = true;
    })
  }

  rentedResidence() {
    this.rentResidenceForm = this.fb.group({
      RentedFrom: new FormControl(''),
      RentedTo: new FormControl(''),
      TotalRent: new FormControl(''),
      Address: new FormControl(''),
      City: new FormControl(''),
      OwnerName: new FormControl (''),
      IsPanNumber: new FormControl (false),
      PanNumber: new FormControl (''),
      IsOwnerAddress: new FormControl (false),
      OwnerType: new FormControl (''),
      IsSignedDeclaration: new FormControl (false)
    })
  }

  submitRentResidence() {
    console.log(this.rentResidenceForm.value);
  }

  editDeclaration(e: any) {
    this.editException = true;
    let current = e.target;
    this.presentRow = current.closest('div[name="table-row"]')
    this.presentRow.querySelector('div[name="view-control"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="edit-control"]').classList.remove('d-none');
    this.presentRow.querySelector('i[name="edit-declaration"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="cancel-declaration"]').classList.remove('d-none');
    this.presentRow.querySelector('a[name="upload-proof"]').classList.remove('pe-none', 'text-decoration-none', 'text-muted');
    this.presentRow.querySelector('a[name="upload-proof"]').classList.add('pe-auto', 'fw-bold', 'text-primary-c');
    this.presentRow.querySelector('input[name="DeclaratedValue"]').focus();
  }

  uploadDocument(item: any) {
    this.slectedDeclarationnFile = [];
    if (item) {
      this.attachmentForDeclaration = item.ComponentId ;
      this.isLargeFile = false;
      let currentDeclaration = this.declarationFiles.filter(x =>x.FileName.split('_')[0] == item.ComponentId);
      if (currentDeclaration.length > 0)
        this.slectedDeclarationnFile = currentDeclaration;
      $("#addAttachmentModal").modal('show');
    }
  }

  UploadAttachment(fileInput: any) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.FileName = file.name;
        item.AlternateName = this.attachmentForDeclaration;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        //item.FilePath = this.getRelativePath(this.routeParam);
        item.ParentFolder = '';
        item.Email = this.employeeEmail;
        item.UserId = this.EmployeeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        if (this.slectedDeclarationnFile.length > 0)
          this.slectedDeclarationnFile.push(item);
        index++;
      };
      this.totalFileSize = 0;
      let i = 0;
      while (i < selectedFile.length) {
        this.totalFileSize += selectedFile[i].size / 1024;
        i++;
      }
      if (this.totalFileSize > 2048) {
        this.isLargeFile = true;
        this.fileDetail = [];
      }
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  fireuploadreceipt() {
    $("#uploadreceipt").click();
  }

  fireBrowser() {
    $("#modifyAttachment").click();
  }

  ModifyAttachment(fileInput: any, fileId: number) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile) {
      let file = null;
      file = <File>selectedFile[0];
      let item: Files = new Files();
      item.FileName = this.attachmentForDeclaration;
      item.FileType = file.type;
      item.FileSize = (Number(file.size) / 1024);
      item.FileExtension = file.type;
      item.DocumentId = 0;
      item.FileUid = fileId;
      item.ParentFolder = '';
      item.Email = this.employeeEmail;
      item.UserId = this.EmployeeId;
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
      this.totalFileSize = 0;
      this.totalFileSize += selectedFile[0].size / 1024;
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  uploadReceipts(fileInput: any) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.FileName = this.attachmentForDeclaration;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        //item.FilePath = this.getRelativePath(this.routeParam);
        item.ParentFolder = '';
        item.Email = this.employeeEmail;
        item.UserId = this.EmployeeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      };
      this.totalFileSize = 0;
      let i = 0;
      while (i < selectedFile.length) {
        this.totalFileSize += selectedFile[i].size / 1024;
        i++;
      }
      if (this.totalFileSize > 2048) {
        this.isLargeFile = true;
        this.fileDetail = [];
      }
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  closeAttachmentModal() {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    $("#addAttachmentModal").modal('hide');
  }

  closeDeclaration(e: any) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    this.editException = true;
    let current = e.target;
    let elem = current.closest('div[name="table-row"]')
    elem.querySelector('div[name="view-control"]').classList.remove('d-none');
    elem.querySelector('div[name="edit-control"]').classList.add('d-none');
    elem.querySelector('i[name="edit-declaration"]').classList.remove('d-none');
    elem.querySelector('div[name="cancel-declaration"]').classList.add('d-none');
    elem.querySelector('a[name="upload-proof"]').classList.remove('pe-auto', 'fw-bold', 'text-primary-c');
    elem.querySelector('a[name="upload-proof"]').classList.add('pe-none', 'text-decoration-none', 'text-muted');
  }

  fireFileBrowser() {
    $("#uploadAttachment").click();
  }

  saveAttachment() {
    $('#addAttachmentModal').modal('hide');
  }

  saveDeclaration(item: any, e: any) {
    let declaredValue = this.presentRow.querySelector('input[name="DeclaratedValue"]').value;
    declaredValue = Number(declaredValue);
    if (!isNaN(declaredValue) && declaredValue > 0) {
      let value = {
        ComponentId: item.ComponentId,
        DeclaredValue: declaredValue,
        EmployeeId: this.EmployeeId,
        Email: this.employeeEmail
      }

      let formData = new FormData();
      if (this.EmployeeId > 0 && this.EmployeeDeclarationId > 0) {
        if (this.FileDocumentList.length > 0) {
          let i = 0;
          while (i < this.FileDocumentList.length) {
            formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
            i++;
          }
        }
        this.SectionIsReady = false;
        formData.append('declaration', JSON.stringify(value));
        formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
        this.http.upload(`Declaration/UpdateDeclarationDetail/${this.EmployeeDeclarationId}`, formData).then((response: ResponseModel) => {
          if (response.ResponseBody) {
            if(response.ResponseBody.length > 0) {
              this.allComponentDetails = response.ResponseBody;
              this.resetFilter();
            }

            this.closeDeclaration(e);
            Toast("Declaration Uploaded Successfully.");
            this.SectionIsReady = true;
          }
        });
      }
    } else {
      WarningToast("Only numeric value is allowed");
    }
  }

  loadData() {
    this.isEmployeesReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        if(employees) {
          let i = 0;
          while(i < employees.length) {
            this.employeesList.data.push({
              text: `${employees[i].FirstName} ${employees[i].LastName}`,
              value: employees[i].EmployeeUid
            });
            i++;
          }
        }
        this.employeesList.className = "";

        this.isEmployeesReady = true;
      }
    });
  }

  rentedDecalrationPopup() {
    $('#rentedResidenceModal').modal('show');
  }

  signDeclFieldEnable(e: any) {
    let value = e.target.checked;
    if (value == true)
      this.isSignDeclareEnable = true;
    else
      this.isSignDeclareEnable = false;
  }

  panFieldEnable(e: any) {
    let value = e.target.checked;
    if (value == true)
      this.isPanEnable = true;
    else
      this.isPanEnable = false;
  }

  nextDeclaration(value: string) {
    if (value == 'otherExemptions') {
      this.active = 3;
    } else if (value == 'exemptions') {
      this.active = 2;
    } else {
      this.active = 4;
    }
  }

  activateMe(ele: string) {
    switch (ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch (e) {
      case "declaration-tab":
        break;
      case "previous-income-tab":
        this.nav.navigateRoot(AdminPreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        this.nav.navigateRoot(AdminForm12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(AdminFreeTaxFilling, this.cachedData);
        break;
      case "tax-saving-tab":
        this.nav.navigateRoot(AdminTaxSavingInvestment, this.cachedData);
        break;
    }
  }

  navRentalpage(item: number) {
    if (item == 1)
      this.rentalPage = 1;
    else
      this.rentalPage = 2;
  }

  gotoTaxSection(value: string) {
    this.nav.navigateRoot(AdminIncomeTax, value)
  }
}

interface IncomeDeclaration {
  Section: string;
  DeductionName: string;
  DeductionDesc: string;
  MaxLimit: string;
  Declaration: number;
  Proof: any;
  Status: number;
}

class TaxAmount {
  NetTaxableAmount: number = 0;
  TotalTaxPayable: number = 0;
  TaxAlreadyPaid: number = 0;
  RemainingTaxAMount: number = 0;
}

class MyDeclaration {
  Declaration: string = '';
  NoOfDeclaration: number = 0;
  AmountDeclared: number = 0;
  ProofSUbmitted: number = 0;
  AmountRejected: number = 0;
  AmountAccepted: number = 0;
}
