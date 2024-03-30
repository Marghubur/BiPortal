import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail, WarningToast } from 'src/providers/common-service/common.service';
import { AdminForm12B, AdminFreeTaxFilling, AdminIncomeTax, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminDeclarationApprovalRule } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
import { MonthlyTax } from '../incometax/incometax.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Files } from 'src/app/commonmodal/common-modals';
import 'bootstrap';
import { NgbOffcanvas, OffcanvasDismissReasons } from '@ng-bootstrap/ng-bootstrap';
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
  taxAmount: TaxAmount = new TaxAmount();
  myDeclaration: Array<MyDeclaration> = [];
  year: number = 0;
  taxCalender: Array<any> = [];
  monthlyTaxAmount: MonthlyTax;
  employeeDeclaration: any = {};
  exemptionComponent: Array<any> = [];
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
  applicationData: any = [];
  isAmountExceed: boolean = false;
  salaryDetails: any = null;
  TaxDetails: Array<any> = [];
  isEmployeeSelect: boolean = false;
  isLoading: boolean = false;
  houseRentDetail: HouseRentDetail = null;
  isRentedResidenceEdit: boolean = false;
  isShowRentedDetail: boolean = false;
  basePath: string = '';
  viewer: any = null;
  deleteFile: any = null;
  hraLetterList:Array<Files> = [];
  hraLetterCollection:Array<any> = [];
  houseRentDetailFile: Array<any> = [];
  houseRentDetailLetterFile: Array<any> = [];
  viewRentPropFile: Array<any> = [];
  deleteType: string = '';
  currentMonth: string = "";
  selectDeclaration: any = null;
  employeeName: string = null;
  taxRegimeDetails: any = [];
  taxSlab: Array<any> = [];
  dob: any = null;
  oldTaxRegimeSlab: Array<any> = [];
  newTaxRegimeSlab: Array<any> = [];
  currentYear: number = 0;
  activeVerticalPill = 'top';
  selectedOneHalfExemption: Array<any> = [];
  selectedOtherExemptions: Array<any> = [];
  selectedTaxSavingAllowance: Array<any> = [];
  tempSelectedExemtionAllowance: Array<any> = []
	closeResult = '';

  constructor(private local: ApplicationStorage,
              private user: UserService,
              private fb: FormBuilder,
              private nav: iNavigation,
              private http: CoreHttpService,
              private offcanvasService: NgbOffcanvas) { 
                
              }

  ngOnInit(): void {
    this.rentalPage = 1;
    let date = new Date();
    this.currentYear = date.getFullYear();
    this.currentMonth = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("en-us", { month: "short" })
    this.userDetail = this.user.getInstance() as UserDetail;
    this.EmployeeId = this.userDetail.UserId;
    this.year = date.getFullYear();
    this.basePath = this.http.GetImageBasePath();

    if (this.userDetail.RoleId == 1) {
      let data = this.nav.getValue();
      let emp = this.local.getByKey("EmployeeId");
      if (data) {
        this.EmployeeId = data.EmployeeId;
        this.employeeName = data.FullName;
      } else if (emp) {
        this.EmployeeId = emp;
      }
      else {
        this.EmployeeId = this.userDetail.UserId;
        this.employeeName = this.userDetail.FirstName + " " + this.userDetail.LastName;
      }
    } else {
      this.EmployeeId = this.userDetail.UserId;
      this.employeeName = this.userDetail.FirstName + " " + this.userDetail.LastName;
    }
    this.local.setByKey("EmployeeId", this.EmployeeId);
    this.loadUserModule();
  }

  loadUserModule(): void {
    this.getDeclaration(Number(this.EmployeeId));
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
        this.ExemptionDeclaration = response.ExemptionDeclaration;
        this.OtherDeclaration = response.OtherDeclaration;
        this.TaxSavingAlloance = response.TaxSavingAlloance;
        this.EmployeeDeclarationId = response.EmployeeDeclarationId;
        this.employeeEmail = response.Email;
        this.oldTaxRegimeSlab = Object.entries(this.employeeDeclaration.IncomeTaxSlab).reverse();
        this.newTaxRegimeSlab = Object.entries(this.employeeDeclaration.NewRegimIncomeTaxSlab).reverse();

        if(this.employeeDeclaration !== null && this.employeeDeclaration.Declarations != null) {
          let rentDetail = this.employeeDeclaration.SalaryComponentItems.filter (x => x.ComponentId == "HRA");
          for (let index = 0; index < this.employeeDeclaration.Declarations.length; index++) {
            let component =  this.employeeDeclaration.Declarations[index].DeclarationName;
            switch (component) {
              case "1.5 Lac Exemptions":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted = this.calculatedTotalUploadFile(this.ExemptionDeclaration);
                this.selectedOneHalfExemption = this.ExemptionDeclaration.filter(x => x.DeclaredValue > 0);
                if (this.selectedOneHalfExemption.length > 0) {
                  this.selectedOneHalfExemption.map(x => x.IsEdit = false);
                }
                break;
              case "Other Exemptions":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted =  this.calculatedTotalUploadFile(this.OtherDeclaration);
                this.selectedOtherExemptions = this.OtherDeclaration.filter(x => x.DeclaredValue > 0);
                if (this.selectedOtherExemptions.length > 0) {
                  this.selectedOtherExemptions.map(x => x.IsEdit = false);
                }
                break;
              case "Tax Saving Allowance":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted =  this.calculatedTotalUploadFile(this.TaxSavingAlloance);
                this.selectedTaxSavingAllowance = this.TaxSavingAlloance.filter(x => x.DeclaredValue > 0);
                if (this.selectedTaxSavingAllowance.length > 0) {
                  this.selectedTaxSavingAllowance.map(x => x.IsEdit = false);
                }
                break;
              case "HRA":
                this.employeeDeclaration.Declarations[index].NumberOfProofSubmitted = this.calculatedTotalUploadFile(rentDetail);
                break;
            }
          }

          this.salaryDetails = response.SalaryDetail;
          if(this.salaryDetails !== null) {
            this.TaxDetails = JSON.parse(this.salaryDetails.TaxDetail);
            let i = 0;
            let annualSalaryDetail = JSON.parse(this.salaryDetails.CompleteSalaryDetail);
            this.taxCalender = [];
            let typeId = 0;
            while( i < annualSalaryDetail.length) {
              let date = new Date(annualSalaryDetail[i].PresentMonthDate);
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
          }
          if (response.HouseRentDetail && response.HouseRentDetail != '{}') {
            this.houseRentDetail = JSON.parse(response.HouseRentDetail);
          } else {
            this.houseRentDetail = new HouseRentDetail();
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
    this.isAmountExceed = false;
    //this.selectDeclaration = null;
    this.FileDocumentList = [];
    this.FilesCollection = [];
    if (item) {
      //this.selectDeclaration = item;
      this.uploadDocument(item);
      //$("#manageDeclarationModal").modal('show');
      item.IsEdit = true;
      item.SlectedDeclarationnFile = this.slectedDeclarationnFile.length;
      // let elem = e.currentTarget;
      // elem.parentElement.previousElementSibling.querySelector('input').removeAttribute('readonly');
      // elem.previousElementSibling.classList.remove('d-none');
      // elem.classList.add('d-none');
    }
  }

  addAttechmentModal(item: any) {
    this.selectDeclaration = null;
    this.FileDocumentList = [];
    this.FilesCollection = [];
    this.selectDeclaration = item;
    this.uploadDocument(item);
    $("#manageDeclarationModal").modal('show');
  }

  closeAttachmentModal() {
    this.selectDeclaration = null;
    this.FileDocumentList = [];
    this.FilesCollection = [];
  }


  checkMaxLimit(e: any, maxlimit: number) {
    let value = e.target.value;
    if (value > maxlimit && maxlimit > 0) {
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
      if(item.UploadedFileIds != null && item.UploadedFileIds.length > 0) {
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
      } else {
        this.isLargeFile = false;
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

  saveDeclaration(item: any, e: any) {
    if (item && this.isAmountExceed == false) {
      // let elem = e.currentTarget;
      // elem.parentElement.previousElementSibling.querySelector('input').setAttribute('readonly', '');
      // elem.parentElement.querySelector('a[name="edit-declaration"]').classList.remove('d-none')
      // elem.classList.add('d-none');
      let value = {
        ComponentId: item.ComponentId,
        DeclaredValue: item.DeclaredValue,
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
            this.FileDocumentList = [];
            this.FilesCollection = [];
            $("#manageDeclarationModal").modal('hide');
            this.isLoading = false;
            Toast("Declaration detail updated successfully");
          }
          this.isLoading = false;
        }).catch(e => {
          this.isLoading = false;
          this.FileDocumentList = [];
          this.FilesCollection = [];
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

  removeDeclaration() {
    this.selectDeclaration.DeclaredValue = 0;
    this.slectedDeclarationnFile = [];
    this.selectDeclaration.declarationFiles = [];
    this.FilesCollection = [];
  }

  activateMe(ele: string) {
    switch (ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, null);
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, null);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, null);
        break;
    }
  }

  activeTab(e: string) {
    switch (e) {
      case "declaration-tab":
        break;
      case "previous-income-tab":
        this.nav.navigateRoot(AdminPreviousIncome, null);
        break;
      case "form-12-tab":
        this.nav.navigateRoot(AdminForm12B, null);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(AdminFreeTaxFilling, null);
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(AdminDeclarationApprovalRule, null);
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
    this.nav.navigate(AdminIncomeTax, this.EmployeeId)
  }

  newIncomeTaxRegimePopUp() {
    this.http.get("TaxRegime/GetAllRegime").then(res => {
      if (res.ResponseBody) {
        this.taxRegimeDetails = res.ResponseBody;
        let empRegime = this.employeeDeclaration.EmployeeCurrentRegime;
        if (empRegime == 0 || empRegime == null)
          this.active = this.taxRegimeDetails.taxRegimeDesc.find(x => x.IsDefaultRegime == 1).TaxRegimeDescId;
        else
          this.active = empRegime;
        this.filterTaxSlab();
        $('#newIncomeTaxRegime').modal('show');
      }
    })
  }

  filterTaxSlab() {
    let dob = this.employeeDeclaration.DOB;
    let age = new Date().getFullYear() - new Date(dob).getFullYear();
    this.taxSlab = this.taxRegimeDetails.taxRegime.filter(x => x.RegimeDescId == this.active && x.StartAgeGroup < age && x.EndAgeGroup >= age);
  }

  openDeclationComponentOffcanvas(content) {
    this.tempSelectedExemtionAllowance = [];
		this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title', position: 'end', panelClass: 'wide-offcanvas' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}


  private getDismissReason(reason: any): string {
		if (reason === OffcanvasDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === OffcanvasDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on the backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

  selectOneHalfExemption(e: any, item: any) {
    let value = e.target.checked;
    if (value) {
      item.IsEdit = true;
      this.tempSelectedExemtionAllowance.push(item);
    } else {
      let inddex = this.tempSelectedExemtionAllowance.findIndex(x => x.ComponentId == item.ComponentId);
      if (inddex >= 0) {
        this.tempSelectedExemtionAllowance.splice(inddex, 1);
      }
    }
  }

  selectOtherExemption(e: any, item: any) {
    let value = e.target.checked;
    if (value) {
      item.IsEdit = true;
      this.tempSelectedExemtionAllowance.push(item);
    } else {
      let inddex = this.tempSelectedExemtionAllowance.findIndex(x => x.ComponentId == item.ComponentId);
      if (inddex >= 0) {
        this.tempSelectedExemtionAllowance.splice(inddex, 1);
      }
    }
  }

  selectTaxSavingAllowance(e: any, item: any) {
    let value = e.target.checked;
    if (value) {
      item.IsEdit = true;
      this.tempSelectedExemtionAllowance.push(item);
    } else {
      let inddex = this.tempSelectedExemtionAllowance.findIndex(x => x.ComponentId == item.ComponentId);
      if (inddex >= 0) {
        this.tempSelectedExemtionAllowance.splice(inddex, 1);
      }
    }
  }

  addSelectDeclationComponent(value: string) {
    if (value && this.tempSelectedExemtionAllowance.length > 0) {
      switch (value) {
        case '1.5lac':
          this.selectedOneHalfExemption = this.selectedOneHalfExemption.concat(this.tempSelectedExemtionAllowance);
          break;
        case 'other':
          this.selectedOtherExemptions = this.selectedOtherExemptions.concat(this.tempSelectedExemtionAllowance);
          break;
        case 'taxsaving':
          this.selectedTaxSavingAllowance = this.selectedTaxSavingAllowance.concat(this.tempSelectedExemtionAllowance);
          break;
      }
      this.offcanvasService.dismiss('save');
    }
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
