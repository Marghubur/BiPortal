import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PTax } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-professional-tax',
  templateUrl: './professional-tax.component.html',
  styleUrls: ['./professional-tax.component.scss']
})
export class ProfessionalTaxComponent implements OnInit {
  ptaxForm: FormGroup;
  isEditable: boolean = false;
  isPageReady: boolean = false;
  ptaxSlab: Array<any> = [];
  currentPTax: PTax = new PTax();
  isLoading: boolean = false;
  submitted: boolean = false;
  companyId: number = 0;
  stateName: Array<any> = [
    {"code": "AN","name": "ANDAMAN AND NICOBAR ISLANDS"},
    { "code": "AP","name": "ANDHRA PRADESH"},
    { "code": "AR","name": "ARUNACHAL PRADESH"},
    { "code": "AS","name": "ASSAM"},
    { "code": "BR","name": "BIHAR"},
    { "code": "CG","name": "CHANDIGARH"},
    { "code": "CH","name": "CHHATTISGARH"},
    { "code": "DH","name": "DADRA AND NAGAR HAVELI"},
    { "code": "DD","name": "DAMAN AND DIU"},
    { "code": "DL","name": "DELHI"},
    { "code": "GA","name": "GOA"},
    { "code": "GJ","name": "GUJARAT"},
    { "code": "HR","name": "HARYANA"},
    { "code": "HP","name": "HIMACHAL PRADESH"},
    { "code": "JK","name": "JAMMU AND KASHMIR"},
    { "code": "JH","name": "JHARKHAND"},
    { "code": "KA","name": "KARNATAKA"},
    { "code": "KL","name": "KERALA"},
    { "code": "LD","name": "LAKSHADWEEP"},
    { "code": "MP","name": "MADHYA PRADESH"},
    { "code": "MH","name": "MAHARASHTRA"},
    { "code": "MN","name": "MANIPUR"},
    { "code": "ML","name": "MEGHALAYA"},
    { "code": "MZ","name": "MIZORAM"},
    { "code": "NL","name": "NAGALAND"},
    { "code": "OR","name": "ODISHA"},
    { "code": "PY","name": "PUDUCHERRY"},
    { "code": "PB","name": "PUNJAB"},
    { "code": "RJ","name": "RAJASTHAN"},
    { "code": "SK","name": "SIKKIM"},
    { "code": "TN","name": "TAMIL NADU"},
    { "code": "TS","name": "TELANGANA"},
    { "code": "TR","name": "TRIPURA"},
    { "code": "UK","name": "UTTARAKHAND"},
    { "code": "UP","name": "UTTAR PRADESH"},
    { "code": "WB","name": "WEST BENGAL"}
  ];
  selectedState: string = null;
  
  constructor(private fb: FormBuilder,
              private http: CoreHttpService,
              private nav: iNavigation) { }

  ngOnInit(): void {
    this.companyId = Number(this.nav.getValue());
    if (this.companyId != 0)
      this.pageReload();
    else
      ErrorToast("Invalid company");
  }

  pageReload() {
    this.loadPTax();
    this.initPtax();
  }

  initPtax() {
    this.ptaxForm = this.fb.group({
      PtaxSlabs: this.buildPtaxSlab(),
    });
  }

  buildPtaxSlab(): FormArray {
    let data = this.ptaxSlab;
    let dataArray: FormArray = this.fb.array([]);
    if (data.length > 0) {
      let i = 0;
      while (i < data.length) {
        dataArray.push(
          this.fb.group({
            StateName: new FormControl(data[i].StateName),
            TaxAmount: new FormControl(data[i].TaxAmount),
            Gender: new FormControl(data[i].Gender),
            CompanyId: new FormControl(data[i].CompanyId),
            PtaxSlabId: new FormControl(data[i].PtaxSlabId),
            MinIncome: new FormControl(data[i].MinIncome),
            MaxIncome: new FormControl(data[i].MaxIncome),
          })
        );
        i++;
      }
      this.selectedState = data[0].StateName;
    } else {
      dataArray.push(this.createPtaxSlab());
    }
    return dataArray;
  }

  createPtaxSlab(): FormGroup {
    return this.fb.group({
      StateName: new FormControl(this.currentPTax.StateName, [
        Validators.required,
      ]),
      MinIncome: new FormControl(this.currentPTax.MinIncome, [
        Validators.required,
      ]),
      MaxIncome: new FormControl(this.currentPTax.MaxIncome, [
        Validators.required,
      ]),
      TaxAmount: new FormControl(this.currentPTax.TaxAmount, [
        Validators.required,
      ]),
      Gender: new FormControl(this.currentPTax.Gender, [Validators.required]),
      PtaxSlabId: new FormControl(this.currentPTax.PtaxSlabId),
      CompanyId: new FormControl(this.companyId),
    });
  }

  get ptaxSalab() {
    return this.ptaxForm.get('PtaxSlabs') as FormArray;
  }

  addPTaxSlab() {
    let item = this.ptaxForm.get('PtaxSlabs') as FormArray;
    let value = item.value[item.length - 1];
    if (this.selectedState == null || this.selectedState == "") {
      ErrorToast("Please selected stae first");
      return;
    }
    if (value.MaxIncome > value.MinIncome && value.MaxIncome > 0 ) {
      this.currentPTax = new PTax();
      this.currentPTax.MinIncome = value.MaxIncome + 1;
      this.currentPTax.StateName = this.selectedState;
      item.push(this.createPtaxSlab());
    } else {
      ErrorToast('PTax slab minimum value is greater than maximum value');
    }
  }

  removePTaxSlab(index: number, item: any) {
    let value = this.ptaxForm.get('PtaxSlabs') as FormArray;
    let ptaxslabId = item.value.PtaxSlabId;
    if (value.length > 1) {
      if (ptaxslabId > 0) {
        this.http
          .delete(`TaxRegime/DeletePTaxSlab/${ptaxslabId}`)
          .then((res) => {
            if (res.ResponseBody) {
              Toast('Ptax slab deleted successfully.');
            }
          })
          .catch((e) => {
            ErrorToast(e.error.HttpStatusMessage);
          });
      }
      value.removeAt(index);
    }
    if (index > 0) {
      let income = value.value[index - 1].MaxIncome + 1;
      (<FormArray>value).controls[index].get('MinIncome').setValue(income);
    }
  }

  checkToAmount(e: any, i: number) {
    let item = this.ptaxForm.get('PtaxSlabs') as FormArray;
    if (item.length < i + 1) {
      let value = item.value[i];
      if (value.MinIncome >= value.MaxIncome && Number(e.target.value) <= 0)
        e.target.classList.add('error-field');
      else e.target.classList.remove('error-field');
    }
  }

  savePtaxSlab() {
    this.isLoading = true;
    this.submitted = true;
    if (this.ptaxForm.invalid) {
      ErrorToast('Fill all mandatory column');
      this.isLoading = false;
      return;
    }

    let value = this.ptaxForm.value.PtaxSlabs;
    this.http
      .post('TaxRegime/AddUpdatePTaxSlab', value)
      .then((res) => {
        if (res.ResponseBody) {
          this.ptaxSlab = res.ResponseBody;
          this.initPtax();
          this.isEditable = false;
          this.isLoading = false;
          Toast('Ptax slab added successfully.');
        }
      })
      .catch((e) => {
        this.isLoading = false;
      });
  }

  editPtax() {
    this.isEditable = true;
  }

  loadPTax() {
    this.isPageReady = false;
    this.http.get(`TaxRegime/GetPTaxSlabByCompId/${this.companyId}`)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.ptaxSlab = response.ResponseBody;
          this.initPtax();
          this.isPageReady = true;
        } else {
          this.isPageReady = true;
          ErrorToast('Record not found.');
        }
      })
      .catch((e) => {
        this.isPageReady = true;
      });
  }

  closePTaxSetting() {
    this.isEditable = false;
  }

}