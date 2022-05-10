import { Component, OnInit } from '@angular/core';
import { Declaration, FreeTaxFilling, Preferences, PreviousIncome, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-form12-bb',
  templateUrl: './form12-bb.component.html',
  styleUrls: ['./form12-bb.component.scss']
})
export class Form12BBComponent implements OnInit {
  cachedData: any = null;
  FinacialYear: number = 0;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    let date = new Date();
    this.FinacialYear = date.getFullYear();
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

  activeTab(e: string) {
    switch(e) {
      case "declaration-tab":
        this.nav.navigate(Declaration, this.cachedData);
        break;
      case "previous-income-tab":
        this.nav.navigate(PreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        break;
      case "free-tax-tab":
        this.nav.navigate(FreeTaxFilling, this.cachedData);
        break;
      case "tax-saving-tab":
        this.nav.navigate(TaxSavingInvestment, this.cachedData);
        break;
    }
  }

}
