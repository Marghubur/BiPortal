import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { Files } from 'src/app/admin/documents/documents.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
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
  employeeDeclaration: any = {};
  exemptionComponent: Array<any> = [];
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
  isAmountExceed: boolean = false;
  salaryDetails: any = null;
  TaxDetails: Array<any> = [];
  isEmployeeSelect: boolean = false;
  isLoading: boolean = false;
  houseRentDetail: HouseRentDetail = new HouseRentDetail();
  isRentedResidenceEdit: boolean = false;
  isShowRentedDetail: boolean = false;
  basePath: string = '';
  viewer: any = null;
  deleteFile: any = null;
  houseRentDetailFile: Array<any> = [];
  hraLetterList:Array<Files> = [];
  hraLetterCollection:Array<any> = [];
  houseRentDetailLetterFile: Array<any> = [];
  viewRentPropFile: Array<any> = [];
  viewAttachment: string = '';
  deleteType: string = '';

  constructor(private local: ApplicationStorage,
    private user: UserService,
    private fb: FormBuilder,
    private nav: iNavigation,
    private http: AjaxService
    ) { }

  ngOnInit(): void {
    this.rentalPage = 1;
    this.monthlyTaxAmount = new MonthlyTax();
    this.employeesList.placeholder = "Employee";
    this.employeesList.className = 'disable-field';
    this.isEmployeesReady = true;
    this.EmployeeId = this.local.getByKey("EmployeeId");
    this.loadData();
    this.rentedResidence();
    var dt = new Date();
    var month = 3;
    var year = dt.getFullYear();
    this.year = dt.getFullYear();
    this.basePath = this.http.GetImageBasePath();
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
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  filterDeduction(e: any, type: string) {
    let value = e.target.value.toLocaleUpperCase();
    switch (type) {
      case '1.5lac':
        this.ExemptionDeclaration = this.ExemptionDeclaration.filter(x => x.Section == value || x.ComponentId == value || x.ComponentFullName == value);
        break;
      case 'other':
        this.OtherDeclaration = this.OtherDeclaration.filter(x => x.Section == value || x.ComponentId == value || x.ComponentFullName == value);
        break;
      case 'taxsaving':
        this.TaxSavingAlloance = this.TaxSavingAlloance.filter(x => x.Section == value || x.ComponentId == value || x.ComponentFullName == value);
        break;
    }
  }

  resetFilter(e: any) {
    e.target.value = '';
    this.ExemptionDeclaration = this.employeeDeclaration.ExemptionDeclaration;
    this.OtherDeclaration = this.employeeDeclaration.OtherDeclaration;
    this.TaxSavingAlloance = this.employeeDeclaration.TaxSavingAlloance;
  }

  calculateDeclarations() {
    if(this.employeeDeclaration.Declarations != null &&
      this.employeeDeclaration.Declarations.length > 0) {
        let i = 0;
        while(i < this.employeeDeclaration.Declarations.length) {
          this.taxAmount.TotalTaxPayable += this.employeeDeclaration.Declarations[i].TotalAmountDeclared;
          this.taxAmount.TotalTaxPayable += this.employeeDeclaration.Declarations[i].AcceptedAmount;
          this.taxAmount.TotalTaxPayable += this.employeeDeclaration.Declarations[i].RejectedAmount;
          i++;
        }

        this.taxAmount = {
          NetTaxableAmount: 2050000,
          TotalTaxPayable: 444600,
          TaxAlreadyPaid: 37050,
          RemainingTaxAMount: 444600 - 37050
        };
    } else {
      this.taxAmount = {
        NetTaxableAmount: 0,
        TotalTaxPayable: 0,
        TaxAlreadyPaid: 0,
        RemainingTaxAMount: 0 - 0
      };
    }
  }

  getDeclaration(id: any) {
    this.EmployeeId = id;
    this.SectionIsReady = false;
    this.isEmployeeSelect = true;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.local.setByKey("EmployeeId", this.EmployeeId);
        this.bindData(response.ResponseBody);
        Toast("Declaration detail loaded successfully");
      }
    })
  }

  deletePopup(item: any, type: string) {
    this.deleteType = '';
    if (item) {
      this.deleteType = type;
      this.deleteFile = item;
      $('#deleteAttachmentModal').modal('show');
    }
  }

  bindData(response) {
    if(!response || response == undefined){
      ErrorToast("Fail to load declaration data. Please contact to admin.");
      return;
    } else {
      if (response.FileDetails)
        this.declarationFiles = response.FileDetails;

      if(response.SalaryComponentItems && response.SalaryComponentItems.length > 0) {
        this.employeeDeclaration = response;
        this.ExemptionDeclaration = this.employeeDeclaration.ExemptionDeclaration;
        this.OtherDeclaration = this.employeeDeclaration.OtherDeclaration;
        this.TaxSavingAlloance = this.employeeDeclaration.TaxSavingAlloance;
        this.EmployeeDeclarationId = response.EmployeeDeclarationId;
        this.employeeEmail = response.Email;

        if(this.employeeDeclaration !== null && this.employeeDeclaration.Declarations != null) {
          // this.ExemptionDeclaration = this.addSubmittedFileIds(this.ExemptionDeclaration);
          // this.OtherDeclaration = this.addSubmittedFileIds(this.OtherDeclaration);
          // this.TaxSavingAlloance = this.addSubmittedFileIds(this.TaxSavingAlloance);
          let rentDetail = this.employeeDeclaration.SalaryComponentItems.filter (x => x.ComponentId == "HRA");
          for (let index = 0; index < this.employeeDeclaration.Declarations.length; index++) {
            let component =  this.employeeDeclaration.Declarations[index].DeclarationName;
            switch (component) {
              case "1.5 Lac Exemptions":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted = this.calculatedTotalUploadFile(this.ExemptionDeclaration);
                break;
              case "Other Exemptions":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted =  this.calculatedTotalUploadFile(this.OtherDeclaration);
                break;
              case "Tax Saving Allowance":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted =  this.calculatedTotalUploadFile(this.TaxSavingAlloance);
                break;
              case "House Property":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted = this.calculatedTotalUploadFile(rentDetail);
                break;
            }
          }

          this.salaryDetails = response.SalaryDetail;
          if(this.salaryDetails !== null)
          this.TaxDetails = JSON.parse(this.salaryDetails.TaxDetail);
          if (response.HouseRentDetail && response.HouseRentDetail != '{}') {
            this.houseRentDetail = JSON.parse(response.HouseRentDetail);
          }

          this.calculateDeclarations();

          this.isEmployeeSelect = false;
          this.SectionIsReady = true;
        }
      } else {
        this.isEmployeeSelect = false;
        this.SectionIsReady = true;
      }
    }
  }

  // addSubmittedFileIds(item: any):any {
  //   let i = 0;
  //   while(i < item.length) {
  //     let currentDeclaration: any = this.declarationFiles.filter(x =>x.FileName.split('_')[0] == item[i].ComponentId);
  //     if (currentDeclaration.length > 0)
  //     item[i].UploadedFileIds = [];
  //     for (let index = 0; index < currentDeclaration.length; index++) {
  //       item[i].UploadedFileIds.push(currentDeclaration[index].FileId);
  //     }
  //     i++;
  //   }
  //   return item;
  // }

  calculatedTotalUploadFile(item: any):number {
    let totalUploadedFile = 0;
    let elem = item.filter(x => x.UploadedFileIds != null && x.UploadedFileIds != '[]');
    if (elem.length > 0) {
      totalUploadedFile = elem.map(x => JSON.parse(x.UploadedFileIds).length).reduce((acc, curr) => {return acc + curr;}, 0)
    }
    return totalUploadedFile;
  }

  rentedResidence() {
    this.rentResidenceForm = this.fb.group({
      RentedFrom: new FormControl(this.houseRentDetail.RentedFrom),
      RentedTo: new FormControl(this.houseRentDetail.RentedTo),
      TotalRent: new FormControl(this.houseRentDetail.TotalRent),
      Address: new FormControl(this.houseRentDetail.Address),
      City: new FormControl(this.houseRentDetail.City),
      OwnerName: new FormControl (this.houseRentDetail.OwnerName),
      IsPANNo: new FormControl (this.houseRentDetail.IsPANNo),
      PANNo: new FormControl (this.houseRentDetail.PANNo),
      IsOwnerAddressSame: new FormControl (this.houseRentDetail.IsOwnerAddressSame),
      LandlordType: new FormControl (this.houseRentDetail.LandlordType),
      OwnerAddress:new FormControl (this.houseRentDetail.OwnerAddress),
      IsSignedDeclaration: new FormControl (this.houseRentDetail.IsSignedDeclaration )
    })
  }

  submitRentResidence() {
    this.isLoading = true;
    let data = this.rentResidenceForm.value;
    let value = {
      ComponentId: 'HRA',
      HousePropertyDetail: data,
      EmployeeId: this.EmployeeId,
      Email: this.employeeEmail
    }

    let formData = new FormData();
    if (this.EmployeeId > 0 && this.EmployeeDeclarationId > 0) {
      for (let i = 0; i < this.hraLetterList.length; i++) {
        this.FileDocumentList.push(this.hraLetterList[i]);
        this.FilesCollection.push(this.hraLetterCollection[i]);
      }
      if (this.FileDocumentList.length > 0) {
        let i = 0;
        while (i < this.FileDocumentList.length) {
          formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
          i++;
        }
      }
      formData.append('declaration', JSON.stringify(value));
      formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      this.http.upload(`Declaration/HouseRentDeclaration/${this.EmployeeDeclarationId}`, formData).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.bindData(response.ResponseBody);
          Toast("Rent deatils added successfully.");
          $('#rentedResidenceModal').modal('hide')
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  sameOwnerAddress(e: any) {
    let status = e.target.checked;
    let value = '';
    if (status == true)
      value = this.rentResidenceForm.get('Address').value;
    this.rentResidenceForm.get('OwnerAddress').setValue(value);
  }

  editDeclaration(item: any, e: any) {
    this.editException = true;
    let current = e.target;
    this.presentRow = current.closest('div[name="table-row"]');
    this.presentRow.querySelector('div[name="view-control"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="edit-control"]').classList.remove('d-none');
    this.presentRow.querySelector('i[name="edit-declaration"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="cancel-declaration"]').classList.remove('d-none');
    this.presentRow.querySelector('a[name="upload-proof"]').classList.remove('pe-none', 'text-decoration-none', 'text-muted');
    this.presentRow.querySelector('a[name="upload-proof"]').classList.add('pe-auto', 'fw-bold', 'text-primary-c');
    this.presentRow.querySelector('input[name="DeclaratedValue"]').focus();
    if(item.UploadedFileIds != null && item.UploadedFileIds != '[]') {
      this.presentRow.querySelector('a[name="upload-proof"]').innerText = '';
      let tag = document.createElement("i");
      tag.classList.add("fa", "fa-check-circle", "text-success", "fa-lg", "pe-2");
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
      tag = document.createElement("span");
      var text = document.createTextNode("Changed");
      tag.appendChild(text);
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
    }
  }

  checkMaxLimit(e: any, maxlimit: number) {
    let value = e.target.value;
    if (value > maxlimit && maxlimit != -1) {
      ErrorToast("Amount is exceed from maxlimit");
      this.isAmountExceed = true;
      return;
    } else {
      this.isAmountExceed = false;
    }
  }

  deleteDeclaration() {
    this.isLoading = true;
    if (this.deleteFile) {
      this.http.delete(`Declaration/DeleteDeclarationValue/${this.employeeDeclaration.EmployeeDeclarationId}/${this.deleteFile.ComponentId}`).then(res => {
        if (res.ResponseBody) {
          this.bindData(res.ResponseBody);
          $('#deleteAttachmentModal').modal('hide');
          Toast("Declaration value is deleted successfully");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  deleteOnlyFile() {
    this.isLoading = true;
    if (this.deleteFile) {
      this.http.delete(`Declaration/DeleteDeclarationFile/${this.employeeDeclaration.EmployeeDeclarationId}/${this.deleteFile.FileId}/${this.attachmentForDeclaration}`).then(res => {
        if (res.ResponseBody) {
          $('#deleteAttachmentModal').modal('hide');
          $('#addAttachmentModal').modal('hide');
          $('#rentFileModal').modal('hide');
          $('#rentedResidenceModal').modal('hide');
          this.bindData(res.ResponseBody);
          Toast("Declaration file is deleted successfully");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  uploadDocument(item: any) {
    this.slectedDeclarationnFile = [];
    if (item) {
      this.attachmentForDeclaration = item.ComponentId ;
      this.isLargeFile = false;
      this.viewAttachment = '';
      this.slectedDeclarationnFile = [];
      if(item.UploadedFileIds != null) {
        if (isNaN(item.UploadedFileIds[0]))
          item.UploadedFileIds = JSON.parse(item.UploadedFileIds)
        let fileIds = item.UploadedFileIds as Array<number>;
        if (fileIds.length > 0 && this.declarationFiles.length > 0) {
          fileIds.map(x => {
            let currentFile = this.declarationFiles.find(i => i.FileId == x);
            if(currentFile != null){
              this.slectedDeclarationnFile.push(currentFile);
            }
          });
        }
      }

      if (this.FilesCollection.length > 0) {
        this.FileDocumentList = [];
        this.FilesCollection = [];
        this.removeSelectedFile()
      }
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

  fireuploadHPLetter() {
    $("#uploadHPLetter").click();
  }

  fireBrowser() {
    $("#modifyAttachment").click();
  }

  // ModifyAttachment(fileInput: any, fileId: number) {
  //   this.FileDocumentList = [];
  //   this.FilesCollection = [];
  //   let selectedFile = fileInput.target.files;
  //   if (selectedFile) {
  //     let file = null;
  //     file = <File>selectedFile[0];
  //     let item: Files = new Files();
  //     item.FileName = this.attachmentForDeclaration;
  //     item.FileType = file.type;
  //     item.FileSize = (Number(file.size) / 1024);
  //     item.FileExtension = file.type;
  //     item.DocumentId = 0;
  //     item.FileUid = fileId;
  //     item.ParentFolder = '';
  //     item.Email = this.employeeEmail;
  //     item.UserId = this.EmployeeId;
  //     this.FileDocumentList.push(item);
  //     this.FilesCollection.push(file);
  //     this.totalFileSize = 0;
  //     this.totalFileSize += selectedFile[0].size / 1024;
  //   } else {
  //     ErrorToast("You are not slected the file")
  //   }
  // }

  viewFile(userFile: any) {
    userFile.FileName = userFile.FileName.replace(/\.[^/.]+$/, "");
    let fileLocation = `${this.basePath}${userFile.FilePath}/${userFile.FileName}.${userFile.FileExtension}`;
    this.viewer = document.getElementById("file-container");
    this.viewer.classList.remove('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', fileLocation);
  }

  closePdfViewer() {
    event.stopPropagation();
    this.viewer.classList.add('d-none');
    this.viewer.querySelector('iframe').setAttribute('src', '');
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
        item.AlternateName = "HP_Receipt";
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
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

  uploadHPLetter(fileInput: any) {
    this.hraLetterList = [];
    this.hraLetterCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.AlternateName = "HP_Dec_Letter";
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size) / 1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.ParentFolder = '';
        item.Email = this.employeeEmail;
        item.UserId = this.EmployeeId;
        this.hraLetterList.push(item);
        this.hraLetterCollection.push(file);
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

  closeDeclaration(item: any, e: any) {
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
    if(item.UploadedFileIds <= 0) {
      this.presentRow.querySelector('a[name="upload-proof"]').innerText = '';
      let tag = document.createElement("i");
      tag.classList.add("fa", "fa-paperclip", "pe-2");
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
      tag = document.createElement("span");
      var text = document.createTextNode("Not Upload");
      tag.appendChild(text);
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
    } else {
      this.presentRow.querySelector('a[name="upload-proof"]').innerText = '';
      let tag = document.createElement("i");
      tag.classList.add("fa", "fa-check-circle", "text-success", "fa-lg", "pe-2");
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
      tag = document.createElement("span");
      var text = document.createTextNode("Uploaded");
      tag.appendChild(text);
      this.presentRow.querySelector('a[name="upload-proof"]').appendChild(tag);
    }
  }

  fireFileBrowser() {
    $("#uploadAttachment").click();
  }

  removeSelectedFile() {
    let elem = document.querySelectorAll('a[name="upload-proof"]');
    for (let i = 0; i < elem.length; i++) {
      (<HTMLElement> elem[i]).innerText = '';
      let tag = document.createElement("i");
      tag.classList.add("fa", "fa-paperclip", "pe-2");
      elem[i].appendChild(tag);
      tag = document.createElement("span");
      var text = document.createTextNode("Not Upload");
      tag.appendChild(text);
      elem[i].appendChild(tag);
    }
  }

  saveAttachment() {
    let length = this.FilesCollection.length;
    this.presentRow.querySelector('a[name="upload-proof"]').classList.add('text-decoration-none');
    this.presentRow.querySelector('a[name="upload-proof"]').innerText = length + " " + "file selected";
    $('#addAttachmentModal').modal('hide');
  }

  saveDeclaration(item: any, e: any) {
    let declaredValue = this.presentRow.querySelector('input[name="DeclaratedValue"]').value;
    declaredValue = Number(declaredValue);
    if (!isNaN(declaredValue) && declaredValue > 0 && this.isAmountExceed == false) {
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
        this.isLoading = true;
        formData.append('declaration', JSON.stringify(value));
        formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
        this.http.upload(`Declaration/UpdateDeclarationDetail/${this.EmployeeDeclarationId}`, formData).then((response: ResponseModel) => {
          if (response.ResponseBody) {
            this.bindData(response.ResponseBody);
            this.isLoading = false;
            Toast("Declaration detail loaded successfully");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
        });
      }
    } else {
      if (this.isAmountExceed)
        ErrorToast("Please enter declaration amount less to maxlimit");
      else
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
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";
        this.isEmployeesReady = true;
      }

      if(this.EmployeeId != null){
        if (isNaN(Number(this.EmployeeId))) {
          WarningToast("Unable to fetch previous EmployeeId. Please selecte from given dropdown.");
        } else {
          this.getDeclaration(Number(this.EmployeeId));
        }
      }
    });
  }

  rentedDecalrationPopup() {
    this.FileDocumentList = [];
    this.hraLetterList = [];
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
    else {
      this.isPanEnable = false;
      this.rentResidenceForm.get('PANNo').setValue('');
    }
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

  navDeclarationTab(index: number) {
    this.active = index;
  }

  editRentedResidence(data: any) {
    if (data) {
      this.isRentedResidenceEdit = true;
      this.FileDocumentList = [];
      this.hraLetterList = [];
      this.attachmentForDeclaration = 'HRA';
      let hosuingProp = this.employeeDeclaration.SalaryComponentItems.find (x => x.ComponentId == "HRA");
      if (hosuingProp != null && hosuingProp.UploadedFileIds != null && hosuingProp.UploadedFileIds != '[]') {
        let value = this.declarationFiles.filter(x =>x.FileName.split('_')[0] == 'HRA');
        this.houseRentDetailFile = value.filter(x =>x.FileName.split('_')[1] == "Receipt");
        this.houseRentDetailLetterFile = value.filter(x =>x.FileName.split('_')[1] == "Dec");
      }
      this.houseRentDetail = data;
      this.rentedResidence();
      $('#rentedResidenceModal').modal('show');
    }
    else
      this.isRentedResidenceEdit = false;
  }

  viewRentFilePopUp(item: any) {
    this.viewRentPropFile = [];
    this.viewRentPropFile = item;
    $('#rentFileModal').modal('show');
  }

  deleteRentDeclarationPopUp() {
    $('#deleteRentDeclrModal').modal('show');
  }

  deleteRentDeclaration() {
    this.isLoading = true;
    this.http.delete(`Declaration/DeleteDeclaredHRA/${this.employeeDeclaration.EmployeeDeclarationId}`).then(res => {
      if (res.ResponseBody) {
        $('#deleteRentDeclrModal').modal('hide');
        $('#rentedResidenceModal').modal('hide');
        this.bindData(res.ResponseBody);
        Toast("Declaration value is deleted successfully");
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  deleteRentFile(userFile: any) {
    this.deletePopup(userFile, 'deletefile')
  }

  showrentedDetail() {
    this.isShowRentedDetail = !this.isShowRentedDetail;
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

  gotoTaxSection() {
    this.nav.navigateRoot(AdminIncomeTax, this.EmployeeId)
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

export class HouseRentDetail {
  RentedFrom: string = '';
  RentedTo: string = '';
  TotalRent: number = 0;
  Address: string = '';
  City: string = '';
  OwnerName: string = '';
  IsPANNo: boolean = false;
  PANNo: string = '';
  IsOwnerAddressSame: boolean = false;
  LandlordType: string = '';
  IsSignedDeclaration: boolean = false;
  OwnerAddress: string = '';
}
