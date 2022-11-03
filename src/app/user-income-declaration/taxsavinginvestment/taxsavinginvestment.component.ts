import { Component, OnInit } from '@angular/core';
import { Declaration, Form12B, FreeTaxFilling, Preferences, PreviousIncome, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-taxsavinginvestment',
  templateUrl: './taxsavinginvestment.component.html',
  styleUrls: ['./taxsavinginvestment.component.scss']
})
export class TaxsavinginvestmentComponent implements OnInit {
  cachedData: any = null;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
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
        this.nav.navigateRoot(PreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        this.nav.navigateRoot(Form12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(FreeTaxFilling, this.cachedData);
        break;
      case "tax-saving-tab":
        break;
    }
  }
}
