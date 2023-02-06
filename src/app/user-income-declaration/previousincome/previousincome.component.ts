import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { Declaration, Form12B, FreeTaxFilling, Preferences, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import 'bootstrap';
declare var $: any;

@Component({
  selector: 'app-previousincome',
  templateUrl: './previousincome.component.html',
  styleUrls: ['./previousincome.component.scss']
})
export class PreviousincomeComponent implements OnInit, AfterViewChecked {
  cachedData: any = null;
  previousEmploymentDetail: Array<PreviousEmploymentDetail> = [];
  currentYear: number = 0;
  total: number = 0;
  isRecordFound: boolean = false;

  constructor(private nav: iNavigation) { }
  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.isRecordFound = false;
    // this.previousEmploymentDetail.push({
    //   Month: 'January',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'February',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'March',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'April',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'May',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'June',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'July',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'August',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'September',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'October',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'November',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // },
    // {
    //   Month: 'December',
    //   Gross: 0,
    //   Basic: null,
    //   HouseRent: null,
    //   EmployeePR: 0,
    //   ESI: null,
    //   LWF: null,
    //   LWFEmp: null,
    //   Professional: 0,
    //   IncomeTax: 0,
    //   OtherTax: 0,
    //   OtherTaxable: null
    // });

    // this.total = this.previousEmploymentDetail.length;
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(Salary, this.cachedData);
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
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
        break;
      case "previous-income-tab":
        break;
      case "form-12-tab":
        this.nav.navigateRoot(Form12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(FreeTaxFilling, this.cachedData);
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(TaxSavingInvestment, this.cachedData);
        break;
    }
  }

}

class PreviousEmploymentDetail {
  Month: string = '';
  Gross: number = 0;
  Basic: number = null;
  HouseRent: number = null;
  EmployeePR: number = 0;
  ESI: number = null;
  LWF: number = null;
  LWFEmp: number = null;
  Professional: number = 0;
  IncomeTax: number = 0;
  OtherTax: number = 0;
  OtherTaxable: number = null;
}
