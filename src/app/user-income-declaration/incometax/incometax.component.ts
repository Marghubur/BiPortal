import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, Declaration, PaySlip, Preferences, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-incometax',
  templateUrl: './incometax.component.html',
  styleUrls: ['./incometax.component.scss']
})
export class IncometaxComponent implements OnInit {
  cachedData: any = null;
  taxCalender: Array<any> = [];
  currentYear: number = 0;
  grossEarning: Array<GrossEarning> = [];
  taxSlab: Array<TaxSlab> = [];
  monthlyTaxAmount: MonthlyTax;
  salaryDetail: any = null;
  allDeclarationSalaryDetails: any = null;
  salaryBreakup: Array<any> = [];
  TaxDetails: Array<any> = [];
  EmployeeId: number = 0;
  userDetail: UserDetail = new UserDetail();
  pageReady: boolean = false;
  hraDetails: Array<any> = [];
  isPageReady: boolean = false;
  isEmployeesReady:boolean = false;
  isEmployeeSelect: boolean = false;
  ExemptionDeclaration: Array<any> = [];
  OtherDeclaration: Array<any> = [];
  TaxSavingAlloance: Array<any> = [];
  Section16TaxExemption:Array<any> = [];
  Sec16TaxExemptAmount: number = 0;
  totalAllowTaxExemptAmount : number = 0;
  totalSection80CExempAmount: number = 0;
  totalOtherExemptAmount: number = 0;
  proTaxDetails: Array<any> = [];

  constructor(private local: ApplicationStorage,
              private user: UserService,
              private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.userDetail = this.user.getInstance() as UserDetail;
    this.EmployeeId = this.userDetail.UserId;
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.isEmployeeSelect = false;
    this.totalAllowTaxExemptAmount = 0;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.allDeclarationSalaryDetails = response.ResponseBody;
        this.allDeclarationSalaryDetails.IncomeTaxSlab = Object.entries(response.ResponseBody.IncomeTaxSlab).reverse();
        this.allDeclarationSalaryDetails.NewRegimIncomeTaxSlab = Object.entries(response.ResponseBody.NewRegimIncomeTaxSlab).reverse();
        this.ExemptionDeclaration = response.ResponseBody.ExemptionDeclaration;
        if ((this.ExemptionDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.ExemptionDeclaration = [];

        this.OtherDeclaration = response.ResponseBody.OtherDeclaration;
        if ((this.OtherDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.OtherDeclaration = [];

        this.TaxSavingAlloance = response.ResponseBody.TaxSavingAlloance;
        if ((this.TaxSavingAlloance.filter(x => x.DeclaredValue > 0).length <= 0))
          this.TaxSavingAlloance = [];

        this.Section16TaxExemption = response.ResponseBody.Section16TaxExemption;
        this.Sec16TaxExemptAmount = 0;
        for (let i = 0; i < this.Section16TaxExemption.length; i++) {
          this.Sec16TaxExemptAmount += this.Section16TaxExemption[i].DeclaredValue;
        }

        this.salaryDetail = response.ResponseBody.SalaryDetail;
        this.TaxDetails = JSON.parse(this.salaryDetail.TaxDetail);

        let annualSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        let i = 0;
        let totalAmount = 0;
        let finalAmount = 0;
        let totalAmounts: Array<any> = [];
        while(i < annualSalaryDetail.length) {
          let salaryComponent = annualSalaryDetail[i].SalaryBreakupDetails.find(x => x.ComponentId == "Gross");
          // totalAmount = salaryComponent.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
          finalAmount += salaryComponent.FinalAmount;
          totalAmounts.push({ FinalAmount: salaryComponent.FinalAmount });
          i++;
        }

        this.salaryBreakup.push({
          key: 'Total',
          total: finalAmount,
          value: totalAmounts
        });
        if (annualSalaryDetail && annualSalaryDetail.length == 12) {
          annualSalaryDetail.map((com) => {
            com.SalaryBreakupDetails = com.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != 'CTC' && x.ComponentId != "PTAX" && x.ComponentId != "ESI")
          });

          i = 0;
          let value = "";
          let selectedComponent = [];
          let props = annualSalaryDetail[i].SalaryBreakupDetails.map(({ComponentId, ComponentName}) => { return { ComponentId, ComponentName } });
          props = props.filter(x => x.ComponentId != "ECI" && x.ComponentId != "EPER-PF" && x.ComponentId != "GRA");
          while(i < props.length) {
            value = props[i].ComponentId;
            selectedComponent = annualSalaryDetail.map(x => x.SalaryBreakupDetails.find(i => i.ComponentId == value));
            this.salaryBreakup.push({
              id: props[i].ComponentId,
              key: props[i].ComponentName,
              total: selectedComponent.reduce((acc, cur) => { return acc + cur.FinalAmount; }, 0),
              value: selectedComponent
            });

            i++;
          }
          this.salaryBreakup = this.salaryBreakup.sort((a, b) => a.key.localeCompare(b.key));
        } else {
          ErrorToast("Unable to get salary detail. Please contact to admin.");
          return;
        }

        let hraAmount = 0;
        let hraComponent = this.allDeclarationSalaryDetails.SalaryComponentItems.find(x => x.ComponentId == "HRA" && x.DeclaredValue > 0);
        if (hraComponent) {
          this.TaxSavingAlloance.push(hraComponent);
          this.hraCalculation();
          hraAmount = this.hraDetails.reduce((acc, next) => {return acc + next.Min}, 0)
        }

        for (let i = 0; i < this.allDeclarationSalaryDetails.Declarations.length; i++) {
          switch (this.allDeclarationSalaryDetails.Declarations[i].DeclarationName) {
            case "1.5 Lac Exemptions":
              this.totalSection80CExempAmount = this.allDeclarationSalaryDetails.Declarations[i].TotalAmountDeclared;
              break;
            case "Other Exemptions":
              this.totalOtherExemptAmount = this.allDeclarationSalaryDetails.Declarations[i].TotalAmountDeclared;
              break;
          }
        }
        let isProjected = false;
        i = 0;
        while( i < annualSalaryDetail.length) {
          let date = new Date(annualSalaryDetail[i].MonthFirstDate);
          if (date.getMonth() == new Date().getMonth())
            isProjected = true;

          this.taxCalender.push({
            month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("en-us", { month: "short" }), // result: Aug
            year: Number(date.getFullYear().toString().slice(-2)),
            isActive: annualSalaryDetail[i].IsActive,
            isProjected: isProjected
          });
          i++;
        }

        this.totalAllowTaxExemptAmount = this.componentTotalAmount(this.TaxSavingAlloance) ;
        this.totalAllowTaxExemptAmount = this.totalAllowTaxExemptAmount + hraAmount;
        this.isPageReady = true;
         this.isEmployeeSelect = true;
        console.log(this.salaryBreakup);

        Toast("Details get successfully")
      }
    })
  }

  componentTotalAmount(value: Array<any>) {
    let item = value.filter(x => x.ComponentId != "HRA");
    let totalAmount = 0;
    for (let i = 0; i < item.length; i++) {
      if (item[i].DeclaredValue > 0)
        totalAmount += item[i].DeclaredValue;
    }
    return totalAmount;
  }

  viewHRAPopUp() {
    this.hraDetails = [];
    $('#viewHRAModal').modal('show');
    this.hraCalculation();
  }

  hraCalculation() {
    let rent = 0;
    let hpComponent = this.allDeclarationSalaryDetails.Declarations.find(x => x.DeclarationName == "House Property");
    if (hpComponent && hpComponent!= null)
      rent = hpComponent.TotalAmountDeclared;

    for (let i = 0; i < this.taxCalender.length; i++) {
      this.hraDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        RentPaid: rent,
        HRA1: this.allDeclarationSalaryDetails.HRADeatils.HRA1,
        HRA2: this.allDeclarationSalaryDetails.HRADeatils.HRA2,
        HRA3: this.allDeclarationSalaryDetails.HRADeatils.HRA3,
        Min: this.allDeclarationSalaryDetails.HRADeatils.HRAAmount,
      })
    }
  }

  viewProTaxPopUp(amount: number) {
    this.proTaxDetails = [];
    var monthlyPTax = 0;
    if (amount > 0)
      monthlyPTax = amount/12;
    for (let i = 0; i < this.taxCalender.length; i++) {
      this.proTaxDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        Amount: monthlyPTax,
        Source: 'Proceed'
      })
    }
    $('#proTaxModal').modal('show');
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
        this.nav.navigateRoot(Salary, this.cachedData);
        break;
      case "PaySlips":
        this.nav.navigateRoot(PaySlip, this.cachedData);
        break;
      case "IncomeTax":
        break;
    }
  }

  saveTaxDetail() {
    let presentMonth = new Date().getMonth() + 1;
    let presentYear = new Date().getFullYear();
    let formData = new FormData();
    this.http.get(`Declaration/UpdateTaxDetail/
        ${this.EmployeeId}/${presentMonth}/${presentYear}`).then(res => {
      if (res.ResponseBody) {
        Toast("Salary breakup added successfully.");
      }
    })
}

getTotalTaxableAmount(index: number) {
  let value: number = 0;
  switch(index) {
    case 1:
      value = (this.salaryDetail.GrossIncome - this.totalAllowTaxExemptAmount -
        52400 - this.totalOtherExemptAmount - this.totalSection80CExempAmount -
        this.allDeclarationSalaryDetails.HRADeatils.HRAAmount * 12);
      break;
    case 2:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
  }

  return value;
}

}

class GrossEarning {
  salaryBreakup: string = '';
  total: number = 0;
  april: number = 0;
  may: number = 0;
  june: number = 0;
  july: number = 0;
  aug: number = 0;
  sep: number = 0;
  oct: number = 0;
  nov: number = 0;
  dec: number = 0;
  jan: number = 0;
  feb: number = 0;
  march: number = 0
}

class TaxSlab {
  taxableincomeslab: string = '';
  taxamount: number = 0;
}

export class MonthlyTax {
  april: number = 0;
  may: number = 0;
  june: number = 0;
  july: number = 0;
  aug: number = 0;
  sep: number = 0;
  oct: number = 0;
  nov: number = 0;
  dec: number = 0;
  jan: number = 0;
  feb: number = 0;
  march: number = 0
}
