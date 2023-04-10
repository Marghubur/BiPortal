import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminFreeTaxFilling, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminDeclarationApprovalRule, AccountsBaseRoute, Declaration } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-form12-bb',
  templateUrl: './form12-bb.component.html',
  styleUrls: ['./form12-bb.component.scss']
})
export class Form12BbComponent implements OnInit {
  cachedData: any = null;
  FinacialYear: number = 0;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    let date = new Date();
    this.FinacialYear = date.getFullYear();
  }

  activateMe(ele: string) {
    switch (ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/" +AdminSalary, null);
        break;
      case "summary-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/" +AdminSummary, null);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/" +AdminPreferences, null);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "declaration-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/" + AdminDeclaration, this.cachedData);
        break;
      case "previous-income-tab":
        this.nav.navigateRoot(AccountsBaseRoute + "/" + AdminPreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        break;
    }
  }

}
