import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { Form12B, FreeTaxFilling, IncomeTax, Preferences, PreviousIncome, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import 'bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HouseRentDetail } from 'src/app/income-declaration/declaration/declaration.component';
import { Files } from 'src/app/commonmodal/common-modals';
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
  exemptions: Array<IncomeDeclaration> = [];
  taxAmount: TaxAmount = new TaxAmount();
  myDeclaration: Array<MyDeclaration> = [];
  year: number = 0;
  taxCalender: Array<any> = [];
  employeeDeclaration: any = {};
  EmployeeId: number = 0;
  EmployeeDeclarationId: number = 0;
  SectionIsReady: boolean = false;
  attachmentForDeclaration: string = '';
  employeeEmail: string = '';
  totalFileSize: number = 0;
  rentalPage: number = 0;
  declarationFiles: Array<Files> = [];
  slectedDeclarationnFile: Array<Files> = [];
  ExemptionDeclaration: Array<any> = [];
  OtherDeclaration: Array<any> = [];
  TaxSavingAlloance: Array<any> = [];
  isAmountExceed: boolean = false;
  salaryDetails: any = null;
  TaxDetails: Array<any> = [];
  isLoading: boolean = false;
  isRentedResidenceEdit: boolean = false;
  isShowRentedDetail: boolean = false;
  basePath: string = '';
  viewer: any = null;
  deleteFile: any = null;
  deleteType: string = '';
  houseRentDetail: HouseRentDetail = null;
  viewRentPropFile: Array<any> = [];
  hraLetterList:Array<Files> = [];
  hraLetterCollection:Array<any> = [];
  houseRentDetailFile: Array<any> = [];
  houseRentDetailLetterFile: Array<any> = [];
  currentMonth: string = "";
  selectDeclaration: any = null;

  constructor(private user: UserService,
    private fb: FormBuilder,
    private nav: iNavigation,
    private http: AjaxService
  ) { }

  ngOnInit(): void {
    this.rentalPage = 1;
    this.year = new Date().getFullYear();
    this.currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleString("en-us", { month: "short" })
    this.basePath = this.http.GetImageBasePath();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.EmployeeId = this.userDetail.UserId;
    this.getDeclaration()

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
    } else {
      this.taxAmount = {
        NetTaxableAmount: 0,
        TotalTaxPayable: 0,
        TaxAlreadyPaid: 0,
        RemainingTaxAMount: 0 - 0
      };
    }
  }

  getDeclaration() {
    this.SectionIsReady = false;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`).then((response: ResponseModel) => {
      if (response.ResponseBody) {
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
              case "HRA":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted = this.calculatedTotalUploadFile(rentDetail);
                break;
            }
          }

          this.salaryDetails = response.SalaryDetail;
          if(this.salaryDetails !== null)
          this.TaxDetails = JSON.parse(this.salaryDetails.TaxDetail);
          if (response.HouseRentDetail && response.HouseRentDetail != '{}') {
            this.houseRentDetail = JSON.parse(response.HouseRentDetail);
          } else {
            this.houseRentDetail = new HouseRentDetail();
          }
          let i = 0;
          let annualSalaryDetail = JSON.parse(response.SalaryDetail.CompleteSalaryDetail);
          this.taxCalender = [];

          let typeId = 0;
          while( i < annualSalaryDetail.length) {
            let date = new Date(annualSalaryDetail[i].MonthFirstDate);
            if(annualSalaryDetail[i].IsActive) {
              if (annualSalaryDetail[i].IsPayrollExecutedForThisMonth) {
                typeId = 1;
              } else {
                typeId = 2;
              }
            } else {
              typeId = 0;
            }

            this.taxCalender.push({
              month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("en-us", { month: "short" }), // result: Aug
              year: Number(date.getFullYear().toString().slice(-2)),
              isActive: annualSalaryDetail[i].IsActive,
              type: typeId
            });
            i++;
          }
          this.calculateDeclarations();

          this.SectionIsReady = true;
        }
      } else {
        this.SectionIsReady = true;
      }
    }
  }

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

  editDeclaration(item: any) {
    this.selectDeclaration = null;
    this.FileDocumentList = [];
    this.FilesCollection = [];
    if (item) {
      this.selectDeclaration = item;
      this.uploadDocument(item);
      $("#manageDeclarationModal").modal('show');
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
    }
  }

  cleanAttachment(index: number) {
    this.FileDocumentList.splice(index, 1);
    this.FilesCollection.splice(index, 1);
    this.slectedDeclarationnFile.splice(index, 1);
    this.totalFileSize = 0;
      let i = 0;
      while (i < this.FilesCollection.length) {
        this.totalFileSize += this.FilesCollection[i].size / 1024;
        i++;
      }
      if (this.totalFileSize > 2048) {
        this.isLargeFile = true;
        this.fileDetail = [];
      }
  }


  UploadAttachment(fileInput: any) {
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

  fireuploadHRALetter() {
    $("#uploadHRALetter").click();
  }

  fireBrowser() {
    $("#modifyAttachment").click();
  }

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
        item.AlternateName = "HRA_Receipt";
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

  uploadHRALetter(fileInput: any) {
    this.hraLetterList = [];
    this.hraLetterCollection = [];
    let selectedFile = fileInput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.AlternateName = "HRA_Dec_Letter";
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

  fireFileBrowser() {
    $("#uploadAttachment").click();
  }

  saveDeclaration(item: any) {
    let value = (document.querySelector('input[name="DeclaratedValue"]') as HTMLInputElement).value;
    let declaredValue = Number(value);
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
            $("#manageDeclarationModal").modal('hide');
            this.isLoading = false;
            Toast("Declaration detail updated successfully");
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

  rentedDecalrationPopup() {
    this.FileDocumentList = [];
    this.hraLetterList = [];
    this.houseRentDetail = new HouseRentDetail();
    this.rentedResidence();
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
      this.rentalPage = 1;
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
    this.viewRentPropFile = [];
    this.FileDocumentList = [];
    this.houseRentDetailFile = [];
    this.hraLetterList = [];
    this.houseRentDetailLetterFile = [];
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
        this.nav.navigateRoot(Salary, null);
        break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, null);
        break;
      case "preference-tab":
        this.nav.navigateRoot(Preferences, null);
        break;
    }
  }

  activeTab(e: string) {
    switch (e) {
      case "declaration-tab":
        break;
      case "previous-income-tab":
        this.nav.navigateRoot(PreviousIncome, null);
        break;
      case "form-12-tab":
        this.nav.navigateRoot(Form12B, null);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(FreeTaxFilling, null);
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(TaxSavingInvestment, null);
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
    this.nav.navigateRoot(IncomeTax, null)
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

