import { Component, OnInit } from '@angular/core';
import { Declaration, Salary, Summary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss']
})
export class PreferencesComponent implements OnInit {
  PanInformation: PANInformation = new PANInformation();
  salaryDeposit: SalaryDeposit = new SalaryDeposit();
  satutoryInformation: StatutoryInformation = new StatutoryInformation();
  cachedData: any = null;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    this.PanInformation = {
      NameOnCard: "MD Istayaque",
      PANNumber: "ABPANF655A",
      DOB: new Date(),
      FatherName: "MD MUSTAQUE"
    };

    this.salaryDeposit = {
      PaymentMode: 'Bank Transfer',
      Bank: 'HDFC Bank',
      ACNumber: 123456789123,
      IFSCCode: "HDFC0000123",
      NameOnAccount: 'MD ISTAYAQUE'
    };

    this.satutoryInformation = {
      PFStatus: 'Enabled',
      PFNumber: 11,
      UniversalACNumber: 123456789123,
      PFJoinDate: new Date(),
      NameOfAcccount: 'MD ISTAYAQUE',
      ESIStatus: 'Not Eligible',
      State: 'Telangana',
      RegisteredLocation: 'Telangana',
      LWFStatus: "Disabled"
    }
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(Declaration, this.cachedData);
      break;
      case "salary-tab":
        this.nav.navigateRoot(Salary, this.cachedData);
      break;
      case "summary-tab":
        this.nav.navigateRoot(Summary, this.cachedData);
      break;
      case "preference-tab":
        break;
    }
  }
}

class PANInformation {
  NameOnCard: string = '';
  PANNumber: string = '';
  DOB: Date = null;
  FatherName : string = ''
}

class SalaryDeposit {
  PaymentMode: string = '';
  Bank: string = '';
  ACNumber: number = null;
  IFSCCode: string = '';
  NameOnAccount: string = ''
}

class StatutoryInformation {
  PFStatus: string = '';
  PFNumber: number = 0;
  UniversalACNumber: number = 0;
  PFJoinDate: Date = null;
  NameOfAcccount: string = '';
  ESIStatus: string = '';
  State: string = '';
  RegisteredLocation: string = '';
  LWFStatus: string = ''
}
