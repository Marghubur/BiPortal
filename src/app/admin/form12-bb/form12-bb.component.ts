import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminFreeTaxFilling, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminTaxSavingInvestment } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-form12-bb',
  templateUrl: './form12-bb.component.html',
  styleUrls: ['./form12-bb.component.scss']
})
export class Form12BbComponent implements OnInit {
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
        break;
      case "free-tax-tab":
        this.nav.navigate(AdminFreeTaxFilling, this.cachedData);
        break;
      case "tax-saving-tab":
        this.nav.navigate(AdminTaxSavingInvestment, this.cachedData);
        break;
    }
  }

}
