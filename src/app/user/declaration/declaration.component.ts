import { Component, OnInit } from '@angular/core';
import { Files } from 'src/app/admin/documents/documents.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, Preferences, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss']
})
export class DeclarationComponent implements OnInit {
  active = 1;
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
  exemptions: Array<IncomeDeclaration> = [];
  otherExemptions: Array<IncomeDeclaration> = [];
  taxSavingAllowance: Array<IncomeDeclaration> = [];
  cachedData: any = null;

  constructor(private local: ApplicationStorage,
              private user: UserService,
              private nav: iNavigation,
              private http: AjaxService,) { }

  ngOnInit(): void {
    this.loadData();
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
  }

  loadData() {
    this.exemptions.push({
      Section: "80C",
      DeductionName: "EPF (Deducted from salary)",
      Declaration: 12600,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: null,
      Proof: null,
      Status: 1
    },
    {
      Section: "80C",
      DeductionName: "VPF (Deducted from Salary)",
      Declaration: 0,
      DeductionDesc: `Employee's VPF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your VPF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: null,
      Proof: null,
      Status: 1
    },
    {
      Section: "80C",
      DeductionName: "PPF",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Senior Citizen Saving Scheme",
      Declaration: null,
      DeductionDesc: `Investment in SCSS qualifies for deduction under Section 80C of the income tax Act. Any
      individual age 60 and above can invest in SCSS. Early retirees between 55 and 60 years, who either opted
      for the voluntary retirement scheme (VRS) or superannuation, can also invest in the scheme, provided the
      investment is done within amonth of receiving retirement benefits.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Housing loan (Principal)",
      Declaration: null,
      DeductionDesc: `For Home Loan, u/s 80C, deduction upto Rs 1,50,000 is allowed on Principal repayment, stamp duty &
      registration charges, in the year in which the actual principal amount is paid.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Mutual Fund",
      Declaration: null,
      DeductionDesc: `Investment in mutual funds for saving purpose is called Equity Linked Saving Schemes (ELSS) which qualifies
      for section 80C deducation. Not all mutual fund can provide 80C deduction. Exampkes of ELSS SBI Magnum Tax gain,
      HDFC Tax Saver, Fidelity Tax Advantage etc.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "National Saving Certificate",
      Declaration: null,
      DeductionDesc: `The National Saving Certificate (NSC) is an investment scheme floated by the Government of India.
      It offers guaranted interest and capital protection. NSC can be bought from most post office in India, and is easily
      accessible. Investment upto Rs 1.5 lakh in the scheme qualifies for deducation u/s 80C of the income tax Act. Furthermore,
      the interest earned on the certificates are also added back to the initial investment and qualify for a tax exemption as well.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Unit Link Insurance Plan",
      Declaration: null,
      DeductionDesc: `Unit Linked Insurance Plan (ULIP) is a combination of insurance and investment. The goal of ULIP
      is to provide wealth creation along with life cover. ULIP provider invests a portion of your investment towards
      life insurance and rest into a fund. All ULIPs qualify as life insurance policy and the premium are exempted from
      income tax benefit. Deducation is available on ULIPS under section 80C, provided the sum assured is at least 10 times
      the annual premium.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Life Insurance Policy",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Education Tuition Fees",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Schedule Bank FD",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Post Office Time Deposit",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Deferred Annuity",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Super Annuity",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "NABARD notifies bond",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Sukanya Samriddhi Yojna",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80C",
      DeductionName: "Other",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80CCC",
      DeductionName: "Mutual Fund Pension",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    },
    {
      Section: "80CCD(1)",
      DeductionName: "NPS Employee Contribution",
      Declaration: null,
      DeductionDesc: `All deposit made in Public Provident Fund (PPF) are deductible under Section 80C of the income tax Act.
      Also, the accumulated amount and interest is exempted drom tax at the time of withdrawal.`,
      MaxLimit: null,
      Proof: null,
      Status: 2
    });

    this.otherExemptions.push({
      Section: "80CCD(2)",
      DeductionName: "NPS Employee Contribution",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80CCD(1B)",
      DeductionName: "Senior Citizen Saving Scheme",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80D",
      DeductionName: "Medical Insurance Premimum",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80D",
      DeductionName: "Preventive Health Check-up",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "5,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80D",
      DeductionName: "Parents Medical Insurance Premium",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80D",
      DeductionName: "Parents Preventive Health Check-up",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "5,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80DD",
      DeductionName: "Medical Expenditure for a Handicapped Relative",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "1,25,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80DDB",
      DeductionName: "Medical Expenditure on Self or Dependent",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "1,00,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80E",
      DeductionName: "Repayment of Interest on Higher Education Loan",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80EE",
      DeductionName: "Home Loan Interest for First Time Home Owners",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80EEA",
      DeductionName: "Interest on loan for acquiring residential house property",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "1,50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80EEB",
      DeductionName: "Interest on loan for acquiring Electric Vehicle",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "1,50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80G",
      DeductionName: "Donations towards Social Causes (100% deducation without qualifying limit)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80G",
      DeductionName: "Donations towards Social Causes (50% deducation without qualifying limit)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80G",
      DeductionName: "Donations towards Social Causes (100% deducation with qualifying limit)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80G",
      DeductionName: "Donations towards Social Causes (50% deducation with qualifying limit)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80GGA",
      DeductionName: "Donation for Research or Rural development",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80GGC",
      DeductionName: "Donation to Political parties",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "No Limit",
      Proof: null,
      Status: 2
    },
    {
      Section: "80QQB",
      DeductionName: "Royalty on Book",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "3,00,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80RRB",
      DeductionName: "Royalty on patent",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "3,00,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80TTA",
      DeductionName: "Savings account interest tax",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "10,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80TTB",
      DeductionName: "Savings account interest tax (senior Citizens)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "50,000",
      Proof: null,
      Status: 2
    },
    {
      Section: "80U",
      DeductionName: "Deducation with respect to Person suffering from Physical Disability",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "1,25,00",
      Proof: null,
      Status: 2
    });

    this.taxSavingAllowance.push({
      Section: "17(2)(Viii)",
      DeductionName: "Medical Allowances",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "15000",
      Proof: null,
      Status: 2
    },
    {
      Section: "10(5)",
      DeductionName: "Travel Reimbursement(LTA)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "30000",
      Proof: null,
      Status: 2
    },
    {
      Section: "10(14)(i)",
      DeductionName: "Housing loan (Principal)",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "21600",
      Proof: null,
      Status: 2
    },
    {
      Section: "10(14)(i)",
      DeductionName: "Telephone and Internet Allowance",
      Declaration: null,
      DeductionDesc: `Employee's PF contribution is eligible for deducation under section 80C of income tax Act.
      This means that your PF contribution is exempted under section 80C.Maximum exemption of 1.5 lakh per annum
      is fixed for all investments under section 80C.`,
      MaxLimit: "18000",
      Proof: null,
      Status: 2
    });
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
        item.Email = this.userDetail.EmailId;
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

  nextDeclaration(value: string) {
    if (value == 'otherExemptions') {
      this.active = 2;
    } else if (value == 'exemptions') {
      this.active = 1;
    } else {
      this.active = 3;
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigate(Salary, this.cachedData);
        break;
      case "summary-tab":
        this.nav.navigate(Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigate(Preferences, this.cachedData);
        break;
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

