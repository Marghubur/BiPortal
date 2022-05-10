import { Component, OnInit } from '@angular/core';
import { Declaration, Form12B, Preferences, PreviousIncome, Salary, Summary, TaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-freetaxfilling',
  templateUrl: './freetaxfilling.component.html',
  styleUrls: ['./freetaxfilling.component.scss']
})
export class FreetaxfillingComponent implements OnInit {
  cachedData: any = null;
  currentYear: number = 0;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    var date = new Date();
    this.currentYear = date.getFullYear();
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
        this.nav.navigate(Form12B, this.cachedData);
        break;
      case "free-tax-tab":
        break;
      case "tax-saving-tab":
        this.nav.navigate(TaxSavingInvestment, this.cachedData);
        break;
    }
  }
}
