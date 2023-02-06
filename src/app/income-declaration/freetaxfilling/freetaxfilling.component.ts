import { Component, OnInit } from '@angular/core';
import { AdminDeclaration, AdminForm12B, AdminPreferences, AdminPreviousIncome, AdminSalary, AdminSummary, AdminDeclarationApprovalRule } from 'src/providers/constants';
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
        break;
      case "approval-rule-tab":
        this.nav.navigateRoot(AdminDeclarationApprovalRule, this.cachedData);
        break;
    }
  }
}
