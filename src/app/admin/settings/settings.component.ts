import { Component, OnInit } from '@angular/core';
import { CompanyAccounts, CompanyDetail, CompanyInfo, CompanySettings, CustomSalaryStructure, Payroll, PFESISetup, SalaryComponentStructure } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { organizationModal } from '../company-detail/company-detail.component';
declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
  CompanyInfoPage: string = CompanyInfo
  ManageCompanyDetail: string = CompanyDetail;
  ManageCompanyAccounts: string = CompanyAccounts;
  SalaryStructure: string = SalaryComponentStructure;
  CustomSalary: string = CustomSalaryStructure;
  menuItem: any = {};
  active: number = 1;
  groupActiveId: number = 1;
  organization: Array<organizationModal> = [];
  isLoading: boolean = false;

  PayRollPage: string = Payroll

  constructor(
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.menuItem = {
      CS: false,
      PR: true,
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
        break;
      case CompanyDetail:
        this.nav.navigate(CompanyDetail, null);
        break;
      case CompanyAccounts:
        this.nav.navigate(CompanyAccounts, null);
        break;
      case SalaryComponentStructure:
        this.nav.navigate(SalaryComponentStructure, null)
        break;
      case CustomSalaryStructure:
        this.nav.navigate(CustomSalaryStructure, null);
        break;
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

  openModalToAddNewCompany() {
    $('#NewComponentModal').modal('show');
  }

  addNewCompany() {

  }
}


interface Payroll {

}
