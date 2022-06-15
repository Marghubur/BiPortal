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
declare var $: any;

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss']
})
export class DeclarationComponent implements OnInit, AfterViewChecked {
  active = 1;
  editPPF: boolean = true;
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
  currentComponentDetails: Array<any> = [];
  exemptionComponent: Array<any> = [];
  filterValue: string = '';
  editException: boolean = false;
  EmployeeId: number = 0;
  EmployeeDeclarationId: number = 0;
  FirstSectionIsReady: boolean = false;
  presentRow: any = null;
  attachmentForDeclaration: string = '';
  employeeEmail: string = '';

  constructor(private local: ApplicationStorage,
    private user: UserService,
    private nav: iNavigation,
    private http: AjaxService,) { }

  ngOnInit(): void {
    this.filterValue = '';
    this.EmployeeId = 8;
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
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle = "tooltip"]').tooltip();
  }

  filterDeduction() {
    // let value = e.target.value;
    let value = this.filterValue.toLocaleUpperCase();
    if (value) {
      this.currentComponentDetails = this.allComponentDetails.filter(x => x.Section == value || x.ComponentId == value);
    }
  }

  resetFilter() {
    this.filterValue = '';
    this.currentComponentDetails = this.allComponentDetails;
  }

  loadData() {
    this.FirstSectionIsReady = false;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`).then((response:ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody.SalaryComponentItems) {
        if(response.ResponseBody.SalaryComponentItems.length > 0) {
          this.allComponentDetails = response.ResponseBody.SalaryComponentItems;
          this.currentComponentDetails = response.ResponseBody.SalaryComponentItems;
          this.EmployeeDeclarationId = response.ResponseBody.EmployeeDeclarationId;
          this.employeeEmail = response.ResponseBody.Email;
        }

        Toast("Declaration detail loaded successfully");
        this.FirstSectionIsReady = true;
      }
    })

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



  editPPFDetail() {
    this.editPPF = false;
  }

  cancelEditPPF() {
    this.editPPF = true;
  }

  editDeclaration(e: any) {
    this.editException = true;
    let current = e.target;
    this.presentRow = current.closest('div[name="table-row"]')
    this.presentRow.querySelector('div[name="view-control"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="edit-control"]').classList.remove('d-none');
    this.presentRow.querySelector('i[name="edit-declaration"]').classList.add('d-none');
    this.presentRow.querySelector('div[name="cancel-declaration"]').classList.remove('d-none');
    this.presentRow.querySelector('input[name="DeclaratedValue"]').focus();
  }

  uploadDocument(item: any) {
    if (item) {
      this.attachmentForDeclaration = item.ComponentId ;
      this.isLargeFile = false;
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
      let fileSize = 0;
      let i = 0;
      while (i < selectedFile.length) {
        fileSize += selectedFile[i].size / 1024;
        i++;
      }
      if (fileSize > 2048) {
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
      if (this.allComponentDetails.EmployeeDeclarationId > 0 && this.allComponentDetails.EmployeeId > 0) {
        formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
      }
      if (this.FileDocumentList.length > 0) {
        let i = 0;
        while (i < this.FileDocumentList.length) {
          formData.append(this.FileDocumentList[i].FileName, this.FilesCollection[i]);
          i++;
        }
        //formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
        //formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      }

      this.FirstSectionIsReady = false;
      formData.append('declaration', JSON.stringify(value));
      formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      this.http.upload(`Declaration/UpdateDeclarationDetail/${this.EmployeeDeclarationId}`, formData).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          if(response.ResponseBody.length > 0) {
            this.allComponentDetails = response.ResponseBody;
            this.currentComponentDetails = response.ResponseBody;
          }

          this.closeDeclaration(e);
          Toast("Declaration Uploaded Successfully.");
          this.FirstSectionIsReady = true;
        }
      });

      this.editPPF = true;
    } else {
      WarningToast("Only numeric value is allowed");
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
