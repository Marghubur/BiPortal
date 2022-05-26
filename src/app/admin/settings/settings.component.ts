import { Component, OnInit } from '@angular/core';
import { CompanySettings, Payroll, PFESISetup } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
  CompanyInfoPage: string = CompanySettings

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
<<<<<<< HEAD
      case CompanySettings:
        this.nav.navigate(CompanySettings, null);
        break;
=======
      case Payroll:
        this.nav.navigate(Payroll, null);
>>>>>>> main
    }
  }
}


interface Payroll {

}
