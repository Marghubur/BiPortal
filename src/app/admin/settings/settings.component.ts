import { Component, OnInit } from '@angular/core';
import { PFESISetup } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;


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
    }
  }
}


interface Payroll {

}
