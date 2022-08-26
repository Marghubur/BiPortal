import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
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
  taxSlab: Array<TaxSlab> = [];
  salaryDetail: any = null;
  allDeclarationSalaryDetails: any = null;
  salaryBreakup: Array<any> = [];
  TaxDetails: Array<any> = [];
  EmployeeId: number = 0;
  ExemptionDeclaration: Array<any> = [];
  OtherDeclaration: Array<any> = [];
  TaxSavingAlloance: Array<any> = [];
  Section16TaxExemption:Array<any> = [];
  Sec16TaxExemptAmount: number = 0;
  totalAllowTaxExemptAmount : number = 0;
  totalSection80CExempAmount: number = 0;
  totalOtherExemptAmount: number = 0;
  isPageReady: boolean = false;
  hraDetails: Array<any> = [];
  standardDeductionDetails: Array<any> = [];

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    var month = 3;
    this.currentYear = dt.getFullYear();
    var years = dt.getFullYear();
    let i = 0;
    while( i < 12) {
      var mnth = Number((((month + 1) < 9 ? "" : "0") + month));
      if (month == 12) {
        month = 1;
        years ++
      } else {
        month ++;
      }
      this.taxCalender.push({
        month: new Date(years, mnth, 1).toLocaleString("en-us", { month: "short" }), // result: Aug
        year: Number(years.toString().slice(-2))
      });
      i++;
    }

    this.EmployeeId = this.nav.getValue();
    if(this.EmployeeId == null || this.EmployeeId <= 0){
      ErrorToast("Unable to get data. Please contact to admin.");
      return;
    }
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.totalAllowTaxExemptAmount = 0;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.allDeclarationSalaryDetails = response.ResponseBody;
        this.allDeclarationSalaryDetails.IncomeTaxSlab = Object.entries(response.ResponseBody.IncomeTaxSlab);
        this.ExemptionDeclaration = response.ResponseBody.ExemptionDeclaration;
        if ((this.ExemptionDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.ExemptionDeclaration = [];

          this.OtherDeclaration = response.ResponseBody.OtherDeclaration;
        if ((this.OtherDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.OtherDeclaration = [];

          this.TaxSavingAlloance = response.ResponseBody.TaxSavingAlloance;
        if ((this.TaxSavingAlloance.filter(x => x.DeclaredValue > 0).length <= 0))
          this.TaxSavingAlloance = [];
        this.salaryDetail = response.ResponseBody.SalaryDetail;
        this.TaxDetails = JSON.parse(this.salaryDetail.TaxDetail);

        let annualSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        if (annualSalaryDetail && annualSalaryDetail.length == 12) {
          annualSalaryDetail.map((com) => {
            com.SalaryBreakupDetails = com.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != 'CTC' && x.ComponentId != "PTAX" && x.ComponentId != "ESI")
          });

          let i = 0;
          let value = "";
          let selectedComponent = [];
          let props = annualSalaryDetail[i].SalaryBreakupDetails.map(({ComponentId, ComponentName}) => { return { ComponentId, ComponentName } });
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

          i = 0;
          let totalAmount = 0;
          let finalAmount = 0;
          let totalAmounts: Array<any> = [];
          while(i < annualSalaryDetail.length) {
            totalAmount = annualSalaryDetail[i].SalaryBreakupDetails.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
            finalAmount += totalAmount;
            totalAmounts.push({ FinalAmount: totalAmount });
            i++;
          }

          this.salaryBreakup.push({
            key: 'Total',
            total: finalAmount,
            value: totalAmounts
          });

        } else {
          ErrorToast("Unable to get salary detail. Please contact to admin.");
          return;
        }

        let hraComponent = this.allDeclarationSalaryDetails.SalaryComponentItems.find(x => x.ComponentId == "HRA" && x.DeclaredValue > 0);
        if (hraComponent)
          this.TaxSavingAlloance.push(hraComponent);

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

        this.totalAllowTaxExemptAmount = this.componentTotalAmount(this.TaxSavingAlloance) ;
        this.getSalaryGroup();
        this.hraCalculation();
        this.totalAllowTaxExemptAmount = this.totalAllowTaxExemptAmount + this.hraDetails.reduce((acc, next) => {return acc + next.Min}, 0)
        this.isPageReady = true;
        Toast("Details get successfully")
      }
    })
  }

  getSalaryGroup() {
    this.http.get('SalaryComponent/GetSalaryGroups').
    then((response:ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody.length > 0) {
        let allSalaryGroup = response.ResponseBody;
        let salarygrp =  allSalaryGroup.find(x => x.MinAmount < this.salaryDetail.CTC && x.MaxAmount > this.salaryDetail.CTC);
        this.Section16TaxExemption = (JSON.parse(salarygrp.SalaryComponents).filter(x => x.Section == "16(IA)" || x.Section == "16(III)"));
        this.Sec16TaxExemptAmount = 0;
        for (let i = 0; i < this.Section16TaxExemption.length; i++) {
          this.Sec16TaxExemptAmount += this.Section16TaxExemption[i].DeclaredValue;
        }
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
    for (let i = 0; i < this.taxCalender.length; i++) {
      this.hraDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        RentPaid: (this.allDeclarationSalaryDetails.Declarations.find(x => x.DeclarationName == "House Property")).TotalAmountDeclared,
        HRA1: this.allDeclarationSalaryDetails.HRADeatils.HRA1,
        HRA2: this.allDeclarationSalaryDetails.HRADeatils.HRA2,
        HRA3: this.allDeclarationSalaryDetails.HRADeatils.HRA3,
        Min: this.allDeclarationSalaryDetails.HRADeatils.HRAAmount,
      })
    }
  }

  viewStandardDeductionPopUp() {
    this.standardDeductionDetails = [];
    $('#standardDeductionModal').modal('show');
    for (let i = 0; i < this.taxCalender.length; i++) {
      this.standardDeductionDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        Amount: 2400,
        Source: 'Proceed'
      })
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "salary-tab":
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
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "PaySlips":
        this.nav.navigateRoot(AdminPaySlip, this.cachedData);
        break;
      case "IncomeTax":
        break;
    }
  }

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
