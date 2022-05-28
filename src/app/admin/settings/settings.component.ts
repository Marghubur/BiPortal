import { Component, OnInit } from '@angular/core';
import { CompanyInfo, Payroll, PFESISetup } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
  CompanyInfoPage: string = CompanyInfo

  PayRollPage: string = Payroll

  constructor(
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
  }

  redirectTo(pageName: string) {
    switch(pageName) {
      case PFESISetup:
        this.nav.navigate(PFESISetup, null);
        break;
      case CompanyInfo:
        this.nav.navigate(CompanyInfo, null);
        break;
      case Payroll:
        this.nav.navigate(Payroll, null);
    }
  }
}


interface Payroll {

}
