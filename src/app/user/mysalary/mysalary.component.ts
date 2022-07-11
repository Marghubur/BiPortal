import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, IncomeTax, PaySlip, Preferences, Salary, Summary, Taxcalculation } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-mysalary',
  templateUrl: './mysalary.component.html',
  styleUrls: ['./mysalary.component.scss']
})
export class MysalaryComponent implements OnInit {
  active = 1;
  cachedData: any = null;
  myAnnualSalary: MyAnnualSalary = new MyAnnualSalary();
  salaryDetail: boolean = true;
  isLoading: boolean = false;
  salaryBreakup: any = {};
  salaryDeducation: Array<SalaryDeduction> = [];
  incomeTaxSlab: Array<IncomeTaxSlab> =[];
  currentYear: number = 0;
  EmployeeId: number = 0;
  userDetail: UserDetail = new UserDetail();
  salaryDetails: any = null;

  constructor(private nav: iNavigation,
              private user: UserService,
              private http: AjaxService,
              private local: ApplicationStorage) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();

    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
      this.userDetail["TokenExpiryDuration"] = new Date();
    else
     this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
      let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.EmployeeId = this.userDetail.UserId;
      this.loadData();
    } else {
      ErrorToast("Invalid user. Please login again.")
    }
    this.myAnnualSalary = {
      Annual: 2124000,
      Bonus: 0,
      Other: 21600,
      Total: 2145600,
      Effective: new Date(),
      PFperMonth: 1800,
      Perks: 0,
      SalaryMonth: 177000
    }

    this.salaryDeducation.push({
      Deduction: 'PF Employee',
      Monthly: 1800,
      Annually: 15000
    },
    {
      Deduction: 'NET PAY',
      Monthly: 175200,
      Annually: 2102400
    });

    this.incomeTaxSlab.push({
      taxSlab: 'Income Upto 2,50,000',
      rate: 'NIL'
    },
    {
      taxSlab: 'Income between 2,50,001 to 5,00,000',
      rate: '5% (Tax rebate of Rs 12,500 available under secction 87A'
    },
    {
      taxSlab: 'Income between 5,00,001 to 7,50,000',
      rate: '10%'
    },
    {
      taxSlab: 'Income between 7,50,001 to 10,00,000',
      rate: '15%'
    },
    {
      taxSlab: 'Income between 10,00,001 to 12,50,000',
      rate: '20%'
    },
    {
      taxSlab: 'Income between 12,50,001 to 15,00,000',
      rate: '25%'
    },
    {
      taxSlab: 'Income above 15,00,000',
      rate: '30%'
    })
  }

  loadData() {
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.EmployeeId}`)
    .then(response => {
      if (response.ResponseBody) {
        this.salaryDetails = response.ResponseBody;
        this.salaryBreakup = JSON.parse(response.ResponseBody.CompleteSalaryDetail);
        this.salaryBreakup.Total =  (this.salaryBreakup.BasicAnnually + this.salaryBreakup.CarRunningAnnually+this.salaryBreakup.ConveyanceAnnually+this.salaryBreakup.HRAAnnually+this.salaryBreakup.InternetAnnually+this.salaryBreakup.TravelAnnually+this.salaryBreakup.ShiftAnnually+this.salaryBreakup.SpecialAnnually);
        console.log(this.salaryBreakup);
        Toast("Record found");
      }
    })
  }

  continueCurrentTaxRegime() {
    this.nav.navigate(Salary, null);
    $('#newIncomeTaxRegime').modal('hide');
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(Preferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        break;
      case "PaySlips":
        this.nav.navigateRoot(PaySlip, this.cachedData);
        break;
      case "IncomeTax":
        this.nav.navigateRoot(IncomeTax, this.cachedData);
        break;
    }
  }

  salaryStructureHistory() {
    $('#slaryStructureHistory').modal('show');
  }

  gotoTaxCalculation() {
    $('#newIncomeTaxRegime').modal('hide');
    this.nav.navigateRoot(Taxcalculation, null);
  }

  viewSalary() {
    this.salaryDetail = !this.salaryDetail;
  }

  salaryBreakupPopup() {
    $('#fullSalaryDetail').modal('show');
  }

  closeSalaryDetails() {
    $('#fullSalaryDetail').modal('hide');
  }

  newIncomeTaxRegimePopUp() {
    $('#newIncomeTaxRegime').modal('show');
  }


}



class MyAnnualSalary {
  Annual: number = 0;
  Bonus: number = 0;
  Other: number = 0;
  Total: number = 0;
  Effective: Date = null;
  PFperMonth: number = 0;
  Perks: number = 0;
  SalaryMonth: number = 0
}

class SalaryDeduction {
  Deduction: string = '';
  Monthly: number = 0;
  Annually: number = 0;
}

class IncomeTaxSlab {
  taxSlab: string = '';
  rate: string = '';
}
