import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { CompanyGroup, PTax } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { CompanyInfo, CompanySettings, CustomSalaryStructure, OrganizationSetting, Payroll, PayrollComponents, PFESISetup, SalaryComponentStructure } from 'src/providers/constants';
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
  organizationId: number = 0;
  ptaxForm: FormGroup;
  ptaxSlab: Array<PTax> = [];
  isEditable: boolean = false;
  currentPTax: PTax = new PTax();
  maxDate: any = null;

  constructor(private nav: iNavigation,
              private fb: FormBuilder,
              private http: AjaxService
  ) { }

  ngOnInit(): void {
    this.initData();
  }

  initData() {
    this.currentCompnay = new CompanyGroup();
    this.menuItem = {
      CS: false,
      PR: true,
      LAH: false,
      EX: false
    }
    this.maxDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    this.loadData();
  }

  pageReload() {
    this.groupActiveId = 1;
    this.initData();
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
        this.nav.navigate(CompanyInfo, this.currentCompnay);
        break;
      case Payroll:
        this.nav.navigate(Payroll, this.currentCompnay);
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

  changeMenu(code: string) {
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
          this.organizationId = this.currentCompnay.OrganizationId;
          this.CompanyId = this.currentCompnay.CompanyId;
          this.initForm();
          this.loadPTax();
          Toast("Compnay list loaded successfully");
          this.isPageReady = true;
          this.isPageLoading = true;
        } else {
          WarningToast("No compnay found under current organization. Please add one.");
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
      CompanyId: new FormControl(this.currentCompnay.CompanyId, Validators.required),
      OrganizationId: new FormControl(this.organizationId, Validators.required),
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
    if (value && this.organizationId > 0) {
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
  gtoOrganization() {
    this.nav.navigate(OrganizationSetting, null);
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

  initPtax() {
    this.ptaxForm = this.fb.group({
      PtaxSlabs: this.buildPtaxSlab()
    })
  }

  buildPtaxSlab(): FormArray{
    let data = this.ptaxSlab;
    let dataArray: FormArray = this.fb.array([]);
    if (data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          StateName: new FormControl(data[i].StateName),
          TaxAmount: new FormControl(data[i].TaxAmount),
          Gender: new FormControl(data[i].Gender),
          CompanyId: new FormControl(data[i].CompanyId),
          PtaxSlabId: new FormControl(data[i].PtaxSlabId),
          MinIncome: new FormControl(data[i].MinIncome),
          MaxIncome: new FormControl(data[i].MaxIncome),
        }))
        i++;
      }
    } else {
      dataArray.push(this.createPtaxSlab())
    }
    return dataArray;
  }

  createPtaxSlab(): FormGroup {
    return this.fb.group({
      StateName: new FormControl(this.currentPTax.StateName, [Validators.required]),
      MinIncome: new FormControl(this.currentPTax.MinIncome, [Validators.required]),
      MaxIncome: new FormControl(this.currentPTax.MaxIncome, [Validators.required]),
      TaxAmount: new FormControl(this.currentPTax.TaxAmount, [Validators.required]),
      Gender: new FormControl(this.currentPTax.Gender, [Validators.required]),
      PtaxSlabId: new FormControl(this.currentPTax.PtaxSlabId),
      CompanyId: new FormControl(this.currentCompnay.CompanyId)
    })
  }

  get ptaxSalab() {
    return this.ptaxForm.get('PtaxSlabs') as FormArray;
  }

  addPTaxSlab() {
    let item = this.ptaxForm.get('PtaxSlabs') as FormArray;
    let value = item.value[item.length - 1];
    if (value.MaxIncome > value.MinIncome && value.MaxIncome > 0) {
      this.currentPTax = new PTax();
      this.currentPTax.MinIncome = value.MaxIncome + 1;
      this.currentPTax.StateName = value.StateName;
      item.push(this.createPtaxSlab());
    } else {
      ErrorToast("PTax slab minimum value is greater than maximum value");
    }
  }

  removePTaxSlab(index: number, item: any) {
    let value = this.ptaxForm.get('PtaxSlabs') as FormArray;
    let ptaxslabId = item.value.PtaxSlabId;
    if (value.length > 1) {
      if (ptaxslabId > 0) {
        this.http.delete(`TaxRegime/DeletePTaxSlab/${ptaxslabId}`).then(res => {
          if (res.ResponseBody) {
            Toast("Ptax slab deleted successfully.");
          }
        }).catch(e => {
          ErrorToast(e.error.HttpStatusMessage);
        })
      }
      value.removeAt(index);
    }
    if (index > 0) {
      let income = (value.value[index-1].MaxIncome) + 1;
      (<FormArray>value).controls[index].get('MinIncome').setValue(income);
    }
  }

  checkToAmount(e: any, i: number) {
    let item = this.ptaxForm.get('PtaxSlabs') as FormArray;
    if (item.length < i+1) {
      let value = item.value[i];
      if (value.MinIncome >= value.MaxIncome && Number(e.target.value) <= 0)
        e.target.classList.add('error-field');
      else
        e.target.classList.remove('error-field');
    }
  }

  savePtaxSlab() {
    this.isLoading = true;
    this.submitted = true;
    if (this.ptaxForm.invalid) {
      ErrorToast("Fill all mandatory column")
      this.isLoading = false;
      return;
    }

    let value = this.ptaxForm.value.PtaxSlabs
    this.http.post("TaxRegime/AddUpdatePTaxSlab", value).then(res => {
      if (res.ResponseBody) {
        this.ptaxSlab = res.ResponseBody;
        this.initPtax();
        this.isEditable = false;
        this.isLoading = false;
        Toast("Ptax slab added successfully.");
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  editPtax() {
    this.isEditable = true;
  }

  loadPTax() {
    this.isPageReady = false;
    this.http.get(`TaxRegime/GetPTaxSlabByCompId/${this.CompanyId}`).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.ptaxSlab = response.ResponseBody;
        this.initPtax();
        this.isPageReady = true;
      } else {
        this.isPageReady = true;
        ErrorToast("Record not found.")
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  closePTaxSetting() {
    this.isEditable = false;
  }
}
