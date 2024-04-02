import { Component, OnInit } from '@angular/core';
import { CompanyGroup, PTax } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { CompanyInfo, CompanySettings, OrganizationSetting, Payroll, PayrollComponents, PFESISetup, ProfesssionalTax, SalaryComponentStructure,
} from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  PfNEsiPage: string = PFESISetup;
  CompanyInfoPage: string = CompanyInfo;
  SalaryStructure: string = SalaryComponentStructure;
  PayrollComponent: string = PayrollComponents;
  PayRollPage: string = Payroll;
  CompanySettingPage: string = CompanySettings;
  isLoading: boolean = false;
  Companys: Array<CompanyGroup> = [];
  CompanyId: number = 0;
  isPageReady: boolean = false;
  currentCompnay: CompanyGroup = null;
  isPageLoading: boolean = false;
  organizationId: number = 0;
  actionCardDetail: Array<any> = [];

  constructor(
    private nav: iNavigation,
    private http: CoreHttpService
  ) {}

  ngOnInit(): void {
    this.prepareCardDetail();
    this.initData();
  }

  prepareCardDetail() {
    this.actionCardDetail = [
      [
        {
          Index: 1,
          Name: 'Payroll Setting',
          Tag: Payroll,
          Icon: "fa-solid fa-file-invoice-dollar",
          color: "var(--bs-purple)",
          Description: 'Manage your organization\'s payroll configurations effortlessly',
        },
        {
          Index: 2,
          Name: 'Tax Components',
          Tag: PayrollComponents,
          Icon: "fa-brands fa-creative-commons-sa",
          color: "var(--bs-purple)",
          Description: 'Efficiently manage taxable components, ensuring accurate payroll deductions and compliance with tax regulations',
        },
      ],
      [
        {
          Index: 3,
          Name: 'Basic Information',
          Tag: CompanyInfo,
          Icon: "fa-solid fa-circle-info",
          color: "var(--bs-info)",
          Description: 'Company legal entity, authorized signatories and bank account information',
        },
        {
          Index: 4,
          Name: 'Professional Tax',
          Tag: ProfesssionalTax,
          Icon: "fa-solid fa-sack-dollar",
          color: "red",
          Description:
            'Simplify professional tax management for smoother payroll processing and compliance',
        },
      ],
      [
        {
          Index: 5,
          Name: 'PF & ESI',
          Tag: PFESISetup,
          Icon: "fa-solid fa-laptop-file",
          color: "green",
          Description: 'Refine PF and ESI parameters for meticulous administration of employee benefits',
        },
        {
          Index: 6,
          Name: 'Salary Component',
          Tag: SalaryComponentStructure,
          Icon: "fa-solid fa-indian-rupee-sign",
          color: "var(--bs-pink)",
          Description:
            'Configure salary components and formulas with precision for accurate payroll calculations',
        },
      ],
    ];
  }

  initData() {
    this.currentCompnay = new CompanyGroup();
    this.loadData();
  }

  pageReload() {
    this.initData();
  }

  redirectTo(pageName: string) {
    switch (pageName) {
      case PFESISetup:
        this.nav.navigate(PFESISetup, this.currentCompnay.CompanyId);
        break;
      case CompanyInfo:
        this.nav.navigate(CompanyInfo, this.currentCompnay);
        break;
      case Payroll:
        this.nav.navigate(Payroll, this.currentCompnay);
        break;
      case SalaryComponentStructure:
        this.nav.navigate(SalaryComponentStructure, null);
        break;
      case PayrollComponents:
        this.nav.navigate(PayrollComponents, null);
        break;
      case CompanySettings:
        this.nav.navigate(CompanySettings, this.currentCompnay);
        break;
      case ProfesssionalTax:
        this.nav.navigate(ProfesssionalTax, this.currentCompnay.CompanyId);
        break;
    }
  }

  loadData() {
    this.isPageReady = false;
    this.isPageLoading = false;
    this.http
      .get('Company/GetAllCompany')
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.Companys = response.ResponseBody;
          if (this.Companys && this.Companys.length > 0) {
            this.currentCompnay = this.Companys[0];
            this.organizationId = this.currentCompnay.OrganizationId;
            this.CompanyId = this.currentCompnay.CompanyId;
            Toast('Compnay list loaded successfully');
            this.isPageReady = true;
            this.isPageLoading = true;
          } else {
            WarningToast(
              'No compnay found under current organization. Please add one.'
            );
            this.isPageLoading = true;
          }
        } else {
          ErrorToast('Record not found.');
        }
      })
      .catch((e) => {
        this.isPageReady = true;
        this.isPageLoading = true;
      });
  }

  gtoOrganization() {
    this.nav.navigate(OrganizationSetting, null);
  }
}
