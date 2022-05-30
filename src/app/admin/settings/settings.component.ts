import { Component, OnInit } from '@angular/core';
import { CompanyInfo, CompanySettings, Payroll, PFESISetup } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
  CompanyInfoPage: string = CompanyInfo
  menuItem: any = {};

  PayRollPage: string = Payroll

  constructor(
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.menuItem = {
      CS: true,
      PR: false,
      LAH: false,
      EX: false
    }
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

  changeMdneu(code: string) {
    this.menuItem = {
      CS: false,
      PR: false,
      LAH: false,
      EX: false
    };

    switch(code) {
      case 'CS':
        this.menuItem.CS = true;
        break;
      case 'PR':
        this.menuItem.PR = true;
        break;
      case 'LAH':
        this.menuItem.LAH = true;
        break;
      case 'EX':
        this.menuItem.EX = true;
        break;
    }
  }
}


interface Payroll {

}
