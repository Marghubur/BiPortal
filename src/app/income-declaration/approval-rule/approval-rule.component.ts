import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminFreeTaxFilling, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-approval-rule',
  templateUrl: './approval-rule.component.html',
  styleUrls: ['./approval-rule.component.scss']
})
export class ApprovalRuleComponent implements OnInit {
  cachedData: any = null;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        break;
      case "salary-tab":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
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
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "previous-income-tab":
        this.nav.navigateRoot(AdminPreviousIncome, this.cachedData);
        break;
      case "form-12-tab":
        this.nav.navigateRoot(AdminForm12B, this.cachedData);
        break;
      case "free-tax-tab":
        this.nav.navigateRoot(AdminFreeTaxFilling, this.cachedData);
        break;
      case "approval-rule-tab":
        break;
    }
  }
}


