import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminFreeTaxFilling, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary } from 'src/providers/constants';
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
        this.nav.navigate(AdminSalary, this.cachedData);
        break;
      case "summary-tab":
        this.nav.navigate(AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigate(AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "declaration-tab":
        this.nav.navigate(AdminDeclaration, this.cachedData);
        break;
      case "previous-income-tab":
        this.nav.navigate(AdminPreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        this.nav.navigate(AdminForm12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigate(AdminFreeTaxFilling, this.cachedData);
        break;
      case "tax-saving-tab":
        break;
    }
  }
}
