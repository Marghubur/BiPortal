import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { CompanyAccounts, CompanyDetail, CompanyInfo, CompanySettings, CustomSalaryStructure, Payroll, PayrollComponents, PFESISetup, SalaryComponentStructure } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
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
  PayrollComponent: string = PayrollComponents;
  PayRollPage: string = Payroll;
  CompanySettingPage: string = CompanySettings;
  menuItem: any = {};
  active: number = 1;
  groupActiveId: number = 1;
  isLoading: boolean = false;
  submitted: boolean = false;
  companyGroupForm: FormGroup;
  model: NgbDateStruct;
  Companys: Array<CompanyGroup> = [];
  CompanyId: number = 0;
  isPageReady: boolean = false;
  currentCompnay: CompanyGroup = null;
  isPageLoading: boolean = false;
  constructor(private nav: iNavigation,
              private fb: FormBuilder,
              private http: AjaxService
  ) { }

  ngOnInit(): void {
    this.currentCompnay = new CompanyGroup();
    this.menuItem = {
      CS: false,
      PR: true,
      LAH: false,
      EX: false
    }
    this.loadData();
    this.initForm();
  }

  get f() {
    return this.companyGroupForm.controls;
  }

  redirectTo(pageName: string) {
    switch(pageName) {
      case PFESISetup:
        this.nav.navigate(PFESISetup, this.currentCompnay.CompanyId);
        break;
      case CompanyInfo:
        this.nav.navigate(CompanyInfo, this.CompanyId);
        break;
      case Payroll:
        this.nav.navigate(Payroll, this.currentCompnay);
        break;
      case CompanyDetail:
        this.nav.navigate(CompanyDetail, this.CompanyId);
        break;
      case CompanyAccounts:
        this.nav.navigate(CompanyAccounts, this.currentCompnay);
        break;
      case SalaryComponentStructure:
        this.nav.navigate(SalaryComponentStructure, null)
        break;
      case CustomSalaryStructure:
        this.nav.navigate(CustomSalaryStructure, this.currentCompnay);
        break;
      case PayrollComponents:
        this.nav.navigate(PayrollComponents, null);
        break;
      case CompanySettings:
        this.nav.navigate(CompanySettings, this.currentCompnay);
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
    this.currentCompnay =new CompanyGroup();
    this.initForm();
    $('#NewCompanyModal').modal('show');
  }

  editCompanyDetail(current: CompanyGroup) {
    this.currentCompnay = current;
    let date = new Date(this.currentCompnay.InCorporationDate);
    this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
    this.initForm();
    $('#NewCompanyModal').modal('show');
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.companyGroupForm.controls["InCorporationDate"].setValue(date);
  }

  loadData() {
    this.isPageReady = false;
    this.isPageLoading = false;
    this.http.get("Company/GetAllCompany").then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.Companys = response.ResponseBody;
        if(this.Companys && this.Companys.length > 0) {
          this.currentCompnay = this.Companys[0];
          this.CompanyId = this.currentCompnay.CompanyId;
          Toast("Compnay list loaded successfully");
          this.isPageReady = true;
          this.isPageLoading = true;
        } else {
          Toast("No compnay found under current organization. Please add one.");
          this.isPageLoading = true;
        }
      } else {
        ErrorToast("Record not found.")
      }
    }).catch(e => {
      this.isPageReady = true;
      this.isPageLoading = true;
    })
  }

  initForm() {
    this.companyGroupForm = this.fb.group({
      CompanyName: new FormControl(this.currentCompnay.CompanyName, [Validators.required]),
      CompanyDetail: new FormControl(this.currentCompnay.CompanyDetail, [Validators.required]),
      InCorporationDate: new FormControl(this.currentCompnay.InCorporationDate, [Validators.required]),
      Email: new FormControl(this.currentCompnay.Email, Validators.required),
      CompanyId: new FormControl(this.currentCompnay.CompanyId, Validators.required)
    })
  }

  addNewCompany() {
    this.isLoading = true;
    this.submitted = true;
    if (this.companyGroupForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value:CompanyGroup = this.companyGroupForm.value;
    if (value) {
      this.http.post("Company/AddCompanyGroup", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.Companys = response.ResponseBody;
          Toast("Company Group added successfully.");
          $('#NewCompanyModal').modal('hide');
          this.isLoading = false;
        }
        else
          ErrorToast("Fail to add company group. Please contact to admin.");

        this.submitted = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  updateCompany() {
    this.isLoading = true;
    this.submitted = true;
    if (this.companyGroupForm.invalid) {
      this.isLoading = false;
      return;
    }

    this.Companys = [];
    let value:CompanyGroup = this.companyGroupForm.value;
    if (value) {
      this.http.put(`Company/UpdateCompanyGroup/${value.CompanyId}`, value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.Companys = response.ResponseBody;
          Toast("Company detail updated successfully.");
          $('#NewCompanyModal').modal('hide');
          this.isLoading = false;
        }
        else
          ErrorToast("Fail to add company group. Please contact to admin.");

        this.submitted = false;
      }).catch(e => {
        this.isLoading = false;
      });
    }
  }

  changeTab(index: number, item: CompanyGroup) {
    this.isPageReady = false;
    this.currentCompnay = item;
    if(index >= 0 &&  item.CompanyId > 0) {
      let result = document.querySelectorAll('.list-group-item > a');
      let i = 0;
      while (i < result.length) {
        result[i].classList.remove('active-tab');
        i++;
      }
      result[index].classList.add('active-tab');
      this.CompanyId =  item.CompanyId;
      this.isPageReady = true;
    } else {
      ErrorToast("Please select a company.")
    }
  }
}

class CompanyGroup {
  CompanyId: number = 0;
  CompanyName: string = '';
  CompanyDetail: string = '';
  InCorporationDate: Date = null;
  Email: string = '';
}
interface Payroll {

}
