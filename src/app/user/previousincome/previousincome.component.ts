import { Component, OnInit } from '@angular/core';
import { Declaration, Form12B, FreeTaxFilling, Preferences, PreviousIncome, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-previousincome',
  templateUrl: './previousincome.component.html',
  styleUrls: ['./previousincome.component.scss']
})
export class PreviousincomeComponent implements OnInit {
  cachedData: any = null;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
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
        break;
      case "form-12-tab":
        this.nav.navigate(Form12B, this.cachedData);
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
