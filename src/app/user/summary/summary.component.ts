import { Component, OnInit } from '@angular/core';
import { Files } from 'src/app/admin/documents/documents.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  editPPF: boolean = true;
  editSeniorCitizen: boolean = true;
  editHousingLoan: boolean = true;
  editMutualFund: boolean = true;
  editNationalSaving: boolean = true;
  editUnitLink: boolean = true;
  editLifeInsurance: boolean = true;
  editTuitionFee: boolean = true;
  editBankFD: boolean = true;
  editPostOffice: boolean = true;
  editDeferredAnnuity: boolean = true;
  editSuperAnnuity: boolean = true;
  editNABARD: boolean = true;
  editSukanyaSamriddhi: boolean = true;
  editOther: boolean = true;
  editMutualPension: boolean = true;
  editNPSEmployee: boolean = true;
  editNPSEmployeeAdditional: boolean = true;
  editNPSEmployeeOther: boolean = true;
  editMedicalInsurance: boolean = true;
  editHealthCheckup: boolean = true;
  editParentInsurance: boolean = true;
  editParentHealthCheckup: boolean = true;
  editHandicapped: boolean = true;
  editSelfDependent: boolean = true;
  editEducationLoan: boolean = true;
  editHomeLoan: boolean = true;
  editHouseProperty: boolean = true;
  editVehicleLoan: boolean = true;
  editFullDonationWithoutQualifying: boolean = true;
  editHalfDonationWithoutQualifying: boolean = true;
  editFullDonationWithQualifying: boolean = true;
  editHalfDonationWithQualifying: boolean = true;
  editResearchandRural: boolean = true;
  editDonationParties: boolean = true;
  editBookRoyalty: boolean = true;
  editPatentRoyalty: boolean = true;
  editInterestTax: boolean = true;
  editInterestTaxSenior: boolean = true;
  editPhysicalDisable: boolean = true;
  editMedicalAllowance: boolean = true;
  editTravelReimbursement: boolean = true;
  editCarRunning: boolean = true;
  editInternetAllowance: boolean = true;
  fileDetail: Array<any> = [];
  isLargeFile: boolean = false;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  userDetail: UserDetail = new UserDetail();
  isPPFSubmitted: boolean = false;

  constructor(private local: ApplicationStorage,
              private user: UserService,
              private http: AjaxService,) { }

  ngOnInit(): void {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
     this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
    } else {
      ErrorToast("Invalid user. Please login again.")
    }
    $('#ExceptionsModal').modal('show');
  }

  // ------- 1.5 Lac Exemptions Start ------------

  editPPFDetail() {
    this.editPPF = false;
  }

  cancelEditPPF() {
    this.editPPF = true;
  }

  editSeniorCitizenDetail() {
    this.editSeniorCitizen = false;
  }

  cancelEditSeniorCitizen() {
    this.editSeniorCitizen = true;
  }

  editHousingLoanDetail() {
    this.editHousingLoan = false;
  }

  cancelEditHousingLoan() {
    this.editHousingLoan = true;
  }

  editMutualFundDetail() {
    this.editMutualFund = false;
  }

  cancelEditMutualFund() {
    this.editMutualFund = true;
  }

  editNationalSavingDetail() {
    this.editNationalSaving = false;
  }

  cancelEditNationalSaving() {
    this.editNationalSaving = true;
  }

  editUnitLinkDetail() {
    this.editUnitLink = false;
  }

  cancelEditUnitLink() {
    this.editUnitLink = true;
  }

  editLifeInsuranceDetail() {
    this.editLifeInsurance = false;
  }

  cancelEditLifeInsurance() {
    this.editLifeInsurance = true;
  }

  editTuitionFeeDetail() {
    this.editTuitionFee = false;
  }

  cancelEditTuitionFee() {
    this.editTuitionFee = true;
  }

  editBankFDDetail() {
    this.editBankFD = false;
  }

  cancelEditBankFD() {
    this.editBankFD = true;
  }

  editPostOfficeDetail() {
    this.editPostOffice = false;
  }

  cancelEditPostOffice() {
    this.editPostOffice = true;
  }

  editDeferredAnnuityDetail() {
    this.editDeferredAnnuity = false;
  }

  cancelEditDeferredAnnuity() {
    this.editDeferredAnnuity = true;
  }

  editSuperAnnuityDetail() {
    this.editSuperAnnuity = false;
  }

  cancelEditSuperAnnuity() {
    this.editSuperAnnuity = true;
  }

  editNABARDDetail() {
    this.editNABARD = false;
  }

  cancelEditNABARD() {
    this.editNABARD = true;
  }

  editSukanyaSamriddhiDetail() {
    this.editSukanyaSamriddhi = false;
  }

  cancelEditSukanyaSamriddhi() {
    this.editSukanyaSamriddhi = true;
  }

  editOtherDetail() {
    this.editOther = false;
  }

  cancelEditOther() {
    this.editOther = true;
  }

  editMutualPensionDetail() {
    this.editMutualPension = false;
  }

  cancelEditMutualPension() {
    this.editMutualPension = true;
  }

  editNPSEmployeeDetail() {
    this.editNPSEmployee = false;
  }

  cancelEditNPSEmployee() {
    this.editNPSEmployee = true;
  }

  gotoOtherExemptions() {
    $('#ExceptionsModal').modal('hide');
    $('#OtherExceptionsModal').modal('show');
  }

  // --------   1.5 Lac Exemptions End ----------------

  // --------    OtherExemptions Start----------

  editNPSEmployeeAdditionalDetail() {
    this.editNPSEmployeeAdditional = false;
  }

  cancelEditNPSEmployeeAdditional() {
    this.editNPSEmployeeAdditional = true;
  }

  editNPSEmployeeOtherDetail() {
    this.editNPSEmployeeOther = false;
  }

  cancelEditNPSEmployeeOther() {
    this.editNPSEmployeeOther = true;
  }

  editMedicalInsuranceDetail() {
    this.editMedicalInsurance = false;
  }

  cancelEditMedicalInsurance() {
    this.editMedicalInsurance = true;
  }

  editHealthCheckupDetail() {
    this.editHealthCheckup = false;
  }

  cancelEditHealthCheckup() {
    this.editHealthCheckup = true;
  }

  editParentInsuranceDetail() {
    this.editParentInsurance = false;
  }

  cancelEditParentInsurance() {
    this.editParentInsurance = true;
  }

  editParentHealthCheckupDetail() {
    this.editParentHealthCheckup = false;
  }

  cancelEditParentHealthCheckup() {
    this.editParentHealthCheckup = true;
  }

  editHandicappedDetail() {
    this.editHandicapped = false;
  }

  cancelEditHandicapped() {
    this.editHandicapped = true;
  }

  editSelfDependentDetail() {
    this.editSelfDependent = false;
  }

  cancelEditSelfDependent() {
    this.editSelfDependent = true;
  }

  editEducationLoanDetail() {
    this.editEducationLoan = false;
  }

  cancelEditEducationLoan() {
    this.editEducationLoan = true;
  }

  editHomeLoanDetail() {
    this.editHomeLoan = false;
  }

  cancelEditHomeLoan() {
    this.editHomeLoan = true;
  }

  editHousePropertyDetail() {
    this.editHouseProperty = false;
  }

  cancelEditHouseProperty() {
    this.editHouseProperty = true;
  }

  editVehicleLoanDetail() {
    this.editVehicleLoan = false;
  }

  cancelEditVehicleLoan() {
    this.editVehicleLoan = true;
  }

  editFullDonationWithoutQualifyingDetail() {
    this.editFullDonationWithoutQualifying = false;
  }

  cancelEditFullDonationWithoutQualifying() {
    this.editFullDonationWithoutQualifying = true;
  }

  editHalfDonationWithoutQualifyingDetail() {
    this.editHalfDonationWithoutQualifying = false;
  }

  cancelEditHalfDonationWithoutQualifying() {
    this.editHalfDonationWithoutQualifying = true;
  }

  editFullDonationWithQualifyingDetail() {
    this.editFullDonationWithQualifying = false;
  }

  cancelEditFullDonationWithQualifying() {
    this.editFullDonationWithQualifying = true;
  }

  editHalfDonationWithQualifyingDetail() {
    this.editHalfDonationWithQualifying = false;
  }

  cancelEditHalfDonationWithQualifying() {
    this.editHalfDonationWithQualifying = true;
  }

  editResearchandRuralDetail() {
    this.editResearchandRural = false;
  }

  cancelEditResearchandRural() {
    this.editResearchandRural = true;
  }

  editDonationPartiesDetail() {
    this.editDonationParties = false;
  }

  cancelEditDonationParties() {
    this.editDonationParties = true;
  }

  editBookRoyaltyDetail() {
    this.editBookRoyalty = false;
  }

  cancelEditBookRoyalty() {
    this.editBookRoyalty = true;
  }

  editPatentRoyaltyDetail() {
    this.editPatentRoyalty = false;
  }

  cancelEditPatentRoyalty() {
    this.editPatentRoyalty = true;
  }

  editTravelReimbursementDetail() {
    this.editTravelReimbursement = false;
  }

  cancelEditTravelReimbursement() {
    this.editTravelReimbursement = true;
  }

  editCarRunningDetail() {
    this.editCarRunning = false;
  }

  cancelEditCarRunning() {
    this.editCarRunning = true;
  }

  editPhysicalDisableDetail() {
    this.editPhysicalDisable = false;
  }

  cancelEditPhysicalDisable() {
    this.editPhysicalDisable = true;
  }

  gotoTaxSavingModal() {
    $('#OtherExceptionsModal').modal('hide');
    $('#TaxSavingModal').modal('show');
  }

  // ------------ End Other Exemptions -------------

  // ------- Tax Saving Allowance Start -----------

  editMedicalAllowanceDetail() {
    this.editMedicalAllowance = false;
  }

  cancelEditMedicalAllowance() {
    this.editMedicalAllowance = true;
  }

  editInterestTaxDetail() {
    this.editInterestTax = false;
  }

  cancelEditInterestTax() {
    this.editInterestTax = true;
  }

  editInterestTaxSeniorDetail() {
    this.editInterestTaxSenior = false;
  }

  cancelEditInterestTaxSenior() {
    this.editInterestTaxSenior = true;
  }

  editInternetAllowanceDetail() {
    this.editInternetAllowance = false;
  }

  cancelEditInternetAllowance() {
    this.editInternetAllowance = true;
  }

  // --------- End -------------

  submitDeclaration() {

  }

  uploadDocument() {
    $('#addAttachmentModal').modal('show');
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
        item.FileType = file.type;
        item.FileSize = (Number(file.size)/1024);
        item.FileExtension = file.type;
        item.DocumentId = 0;
        //item.FilePath = this.getRelativePath(this.routeParam);
        item.ParentFolder = '';
        item.UserId = this.userDetail.UserId;
        item.UserTypeId = this.userDetail.UserTypeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);        
        index++;
      };
      let fileSize = 0;
      let i = 0;
      while (i < selectedFile.length) {
        fileSize += selectedFile[i].size / 1024;
        i++;
      }
      if ( fileSize > 2048) {
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

  saveAttachment() {
    $('#addAttachmentModal').modal('hide');
  }

  savePPFDeclaration() {
    this.saveDeclaration();
    this.isPPFSubmitted = true;
  }

  saveDeclaration() {
    let formData = new FormData();
    if (this.FileDocumentList.length > 0 && this.userDetail.UserId > 0) {
      let i = 0;
      while (i < this.FileDocumentList.length) {
        formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
        i++;
      }
      formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      formData.append('UserDetail', JSON.stringify(this.userDetail));
      this.http.post(`User/UploadDeclaration/${this.userDetail.UserId}/${this.userDetail.UserTypeId}`, formData).then((response:ResponseModel) => {
        if (response.ResponseBody)
          Toast("Declaration Uploaded Successfully.")
      })
      this.editPPF = true;
    }
  }


}
