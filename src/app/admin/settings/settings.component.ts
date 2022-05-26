import { Component, OnInit } from '@angular/core';
import { Payroll, PFESISetup } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
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
      case Payroll:
        this.nav.navigate(Payroll, null);
    }
  }
}


interface Payroll {

}
