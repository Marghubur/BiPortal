import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-tax-regime',
  templateUrl: './tax-regime.component.html',
  styleUrls: ['./tax-regime.component.scss']
})
export class TaxRegimeComponent implements OnInit {
  taxRegimeForm: FormGroup;
  taxSlab:Slab = new Slab();
  isEditable: boolean = false;
  fromAgeGroup: Array<number> = [];
  toAgeGroup: Array<number> = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
  ageGroupForm: FormGroup;
  taxRegimeDescForm: FormGroup;
  taxRegimeDesc: TaxRegimeDesc = null;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  allTaxRegimeDesc: Array<TaxRegimeDesc> = [];
  isRecordFound: boolean = false;
  isPageReady: boolean = false;
  taxRegimeSlabs: Array<any> = [];
  allAgeGroup: Array<AgeGroup> = [];
  currentAgeGroup: AgeGroup = new AgeGroup();
  currentRegime: TaxRegimeDesc = new TaxRegimeDesc();;
  taxAgeGroup: AgeGroup = null;
  active = 1;
  surchargeForm: FormGroup;
  surchargeSlabs:Surcharge = new Surcharge();
  allSurchargeSlabs: Array<Surcharge> = [];

  constructor(private fb: FormBuilder,
              private http: CoreHttpService) { }

  ngOnInit(): void {
    this.loadData();
  }

  pageReload() {
    this.loadData();
  }

  loadData() {
    this.isRecordFound = false;
    this.http.get("TaxRegime/GetAllRegime").then(res => {
      if (res.ResponseBody) {
        this.bindPage(res.ResponseBody);
        Toast("Page loaded successfully");
        this.isRecordFound = true;
      } else {
        ErrorToast("Record not found");
      }
      this.getSurcharge();
      this.initAgeGroup();
      this.initTaxRegimeDesc();
    }).catch(e => {
      this.isRecordFound = true;
    })
  }

  bindPage(data) {
    if (data) {
      if (data.taxRegime)
        this.taxRegimeSlabs = data.taxRegime;

      if (data.taxRegimeDesc)
        this.allTaxRegimeDesc = data.taxRegimeDesc;

      if (data.ageGroup)
        this.allAgeGroup = data.ageGroup;
      this.taxRegime();
    } else {
      ErrorToast("Unable to load regime data. Please contact to admin.")
    }
  }

  taxRegime() {
    this.taxRegimeForm = this.fb.group({
      OldTaxSlab: this.buildOldTaxSlab()
    })
  }

  buildOldTaxSlab(): FormArray {
    let data = this.taxRegimeSlabs.filter(x => x.RegimeDescId == this.currentRegime.TaxRegimeDescId && x.StartAgeGroup == this.currentAgeGroup.StartAgeGroup && x.EndAgeGroup == this.currentAgeGroup.EndAgeGroup);
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          TaxRegimeId: new FormControl(data[i].TaxRegimeId),
          RegimeDescId: new FormControl(data[i].RegimeDescId),
          StartAgeGroup: new FormControl(data[i].StartAgeGroup),
          EndAgeGroup: new FormControl(data[i].EndAgeGroup),
          RegimeIndex: new FormControl(i),
          MinTaxSlab: new FormControl(data[i].MinTaxSlab),
          MaxTaxSlab: new FormControl(data[i].MaxTaxSlab),
          TaxRatePercentage: new FormControl(data[i].TaxRatePercentage),
          TaxAmount: new FormControl(data[i].TaxAmount)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createOldaTaxSlab());
    }

    return dataArray;
  }

  createOldaTaxSlab(): FormGroup {
    return this.fb.group({
      TaxRegimeId: new FormControl(this.taxSlab.TaxRegimeId, [Validators.required]),
      RegimeDescId: new FormControl(this.currentRegime.TaxRegimeDescId, [Validators.required]),
      StartAgeGroup: new FormControl(this.currentAgeGroup.StartAgeGroup, [Validators.required]),
      EndAgeGroup: new FormControl(this.currentAgeGroup.EndAgeGroup, [Validators.required]),
      RegimeIndex: new FormControl(this.taxSlab.RegimeIndex, [Validators.required]),
      MinTaxSlab: new FormControl(this.taxSlab.MinTaxSlab, [Validators.required]),
      MaxTaxSlab: new FormControl(this.taxSlab.MaxTaxSlab, [Validators.required]),
      TaxRatePercentage: new FormControl(this.taxSlab.TaxRatePercentage, [Validators.required]),
      TaxAmount: new FormControl(this.taxSlab.TaxAmount, [Validators.required])
    });
  }

  addOldTaxSlab() {
    let item = this.taxRegimeForm.get('OldTaxSlab') as FormArray;
    let value = item.value[item.length - 1];
    if (value.MaxTaxSlab > value.MinTaxSlab && value.MaxTaxSlab > 0) {
      this.taxSlab = new Slab();
      this.taxSlab.RegimeIndex = item.length;
      this.taxSlab.MinTaxSlab = value.MaxTaxSlab + 1;
      item.push(this.createOldaTaxSlab());
    } else {
      ErrorToast("Tax slab minimum value is greater than maximum value");
    }
  }

  removeOldTaxSlab(i: number) {
    let item = this.taxRegimeForm.get('OldTaxSlab') as FormArray;
    if (item.length > 1) {
      let taxregimeId = item.value[i];
      if (taxregimeId > 0) {
        this.http.delete(`TaxRegime/DeleteTaxRegime/${taxregimeId}`).then(res => {
          if (res.ResponseBody) {
            Toast("Regime deleted successfully");
          }
        }).catch(e => {
          ErrorToast(e.error.HttpStatusMessage);
        })
      }
      item.removeAt(i);
    }
    if (i > 0) {
      let value = (item.value[i-1].MaxTaxSlab) + 1;
      (<FormArray>item).controls[i].get('MinTaxSlab').setValue(value);
      this.calcTaxAmount();
    }
  }

  get oldSlab() {
    return this.taxRegimeForm.get('OldTaxSlab') as FormArray;
  }

  calcTaxAmount() {
    let taxAmount = 0;
    let length = this.taxRegimeForm.get('OldTaxSlab').value.length;
    let formArray = this.taxRegimeForm.get('OldTaxSlab');
    for (let index = 0; index < length; index++) {
      let value = formArray.value[index];
      if (value.MinTaxSlab >= 0 && value.MaxTaxSlab >=0 && value.TaxRatePercentage > 1) {
        if(value.MinTaxSlab > 0)
          value.MinTaxSlab = value.MinTaxSlab -1 ;
        let calculatedAmount = (((value.MaxTaxSlab - value.MinTaxSlab) * value.TaxRatePercentage) /100);
        taxAmount = taxAmount + Math.abs(calculatedAmount);
        (<FormArray>formArray).controls[index].get('TaxAmount').setValue(taxAmount);
      }
    }
  }

  checkToAmount(e: any, i: number) {
    let value = this.taxRegimeForm.get('OldTaxSlab').value[i];
    if (value.MinTaxSlab >= value.MaxTaxSlab && Number(e.target.value) <= 0)
      e.target.closest('div').classList.add('error-field');
    else
      e.target.closest('div').classList.remove('error-field');
  }

  editSlab() {
    this.isEditable = true;
  }

  saveRegime() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.taxRegimeForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.taxRegimeForm.value.OldTaxSlab;
    for (let i = 0; i < value.length; i++) {
      value[i].StartAgeGroup = this.currentAgeGroup.StartAgeGroup;
      value[i].EndAgeGroup = this.currentAgeGroup.EndAgeGroup;
    }
    this.http.post("TaxRegime/AddUpdateTaxRegime", value).then(res => {
      if (res.ResponseBody) {
        this.bindPage(res.ResponseBody)
        Toast("Regime add or update successfully");
        this.isLoading = false;
        this.isEditable = false;
        this.isSubmitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  ageGroupPopUp() {
    this.isSubmitted = false;
    this.fromAgeGroup = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    this.taxAgeGroup = new AgeGroup();
    this.initAgeGroup();
    $('#ageGroupModal').modal('show');
  }

  taxRegimePopUp() {
    this.isSubmitted = false;
    this.taxRegimeDesc = new TaxRegimeDesc();
    this.initTaxRegimeDesc();
    $('#taxRegimeModal').modal('show');
  }

  fromAgeSelect(e: any) {
    let value = Number(e.target.value) + 10;
    this.toAgeGroup = [];
    while (value <= 110) {
      this.toAgeGroup.push(value);
      value = value+10;
    }
  }

  initAgeGroup() {
    this.ageGroupForm = this.fb.group({
      AgeGroupId: new FormControl(this.taxAgeGroup.AgeGroupId, [Validators.required]),
      StartAgeGroup: new FormControl(this.taxAgeGroup.StartAgeGroup, [Validators.required]),
      EndAgeGroup: new FormControl(this.taxAgeGroup.EndAgeGroup, [Validators.required]),
    })
  }

  initTaxRegimeDesc() {
    this.taxRegimeDescForm = this.fb.group({
      TaxRegimeDescId: new FormControl(this.taxRegimeDesc.TaxRegimeDescId, [Validators.required]),
      RegimeName: new FormControl(this.taxRegimeDesc.RegimeName, [Validators.required]),
      Description: new FormControl(this.taxRegimeDesc.Description, [Validators.required]),
    })
  }

  saveTaxRegimeDesc() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.taxRegimeDescForm.invalid) {
      this.isLoading = false;
      return;
    }
    this.http.post("TaxRegime/AddUpdateTaxRegimeDesc", this.taxRegimeDescForm.value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        let taxRegime = res.ResponseBody;
        let value = this.allTaxRegimeDesc.find(x => x.TaxRegimeDescId == taxRegime.TaxRegimeDescId);
        if (value == null)
          this.allTaxRegimeDesc.push(taxRegime);
        else {
          value.RegimeName = taxRegime.RegimeName;
          value.Description = taxRegime.Description;
        }
        Toast("Tax Regime added or updated successfully");
        this.isLoading = false;
        this.isSubmitted = false
      }
    $('#taxRegimeModal').modal('hide');
    }).catch(e => {
      this.isLoading = false;
      this.isSubmitted = false
    })
  }

  get f() {
    return this.taxRegimeDescForm.controls;
  }

  get a() {
    return this.ageGroupForm.controls;
  }

  selectRegime(e: any) {
    let value = Number(e.target.value);
    this.currentRegime = this.allTaxRegimeDesc.find(x => x.TaxRegimeDescId == value);
    if (!this.currentRegime || this.currentRegime == null) {
      ErrorToast("Please select a valid tax regime");
      return;
    }
    this.currentAgeGroup.AgeGroupId = 0;
    this.isPageReady = false;
  }

  selectAgeGroup(e: any) {
    let value = Number(e.target.value);
    this.taxSlab = new Slab();
    this.currentAgeGroup = this.allAgeGroup.find(x => x.AgeGroupId == value);
    if (!this.currentAgeGroup || this.currentAgeGroup == null) {
      ErrorToast("Please select a valid tax regime");
      return;
    }

    this.taxRegime();
    this.isPageReady = true;
  }

  editRegimeDesc(item: TaxRegimeDesc) {
    if (item) {
      this.taxRegimeDesc = item;
      this.initTaxRegimeDesc();
    }
  }

  editAgeGroup(item: AgeGroup) {
    if (item) {
      this.taxAgeGroup = item;
      this.initAgeGroup();
    }
  }

  saveAgeGroup() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.ageGroupForm.invalid) {
      this.isLoading = false;
      return;
    }
    this.http.post("TaxRegime/AddUpdateAgeGroup", this.ageGroupForm.value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        let ageGroup = res.ResponseBody;
        let value = this.allAgeGroup.find(x => x.AgeGroupId == ageGroup.AgeGroupId);
        if (value == null)
          this.allAgeGroup.push(ageGroup);
        else {
          value.EndAgeGroup = ageGroup.EndAgeGroup;
          value.StartAgeGroup = ageGroup.StartAgeGroup;
        }
        Toast("Age Groupe added or updated successfully");
        this.isLoading = false;
        this.isSubmitted = false
      }
    $('#ageGroupModal').modal('hide');
    }).catch(e => {
      this.isLoading = false;
      this.isSubmitted = false
    })
  }

  cancelEditRegime() {
    this.isEditable = false;
  }

  initSurcharge() {
    this.surchargeForm = this.fb.group({
      SurchargeSlab: this.buildSurchargeSlab()
    })
  }

  buildSurchargeSlab(): FormArray {
    let data = this.allSurchargeSlabs;
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          SurchargeSlabId: new FormControl(data[i].SurchargeSlabId),
          MinSurcahrgeSlab: new FormControl(data[i].MinSurcahrgeSlab),
          MaxSurchargeSlab: new FormControl(data[i].MaxSurchargeSlab),
          SurchargeRatePercentage: new FormControl(data[i].SurchargeRatePercentage)
        }));
        i++;
      }
    } else {
      dataArray.push(this.createSurchargeSlab());
    }

    return dataArray;
  }

  createSurchargeSlab(): FormGroup {
    return this.fb.group({
      SurchargeSlabId: new FormControl(this.surchargeSlabs.SurchargeSlabId, [Validators.required]),
      MinSurcahrgeSlab: new FormControl(this.surchargeSlabs.MinSurcahrgeSlab, [Validators.required]),
      MaxSurchargeSlab: new FormControl(this.surchargeSlabs.MaxSurchargeSlab, [Validators.required]),
      SurchargeRatePercentage: new FormControl(this.surchargeSlabs.SurchargeRatePercentage, [Validators.required])
    });
  }

  addSurchargeSlab() {
    let item = this.surchargeForm.get('SurchargeSlab') as FormArray;
    let value = item.value[item.length - 1];
    if (value.MaxSurchargeSlab > value.MinSurcahrgeSlab && value.MaxSurchargeSlab > 0) {
      this.surchargeSlabs = new Surcharge();
      this.surchargeSlabs.MinSurcahrgeSlab  = value.MaxSurchargeSlab + 1;
      item.push(this.createSurchargeSlab());
    } else {
      ErrorToast("Surcharge slab minimum value is greater than maximum value");
    }
  }

  removeSurchargeSlab(i: number) {
    let item = this.surchargeForm.get('SurchargeSlab') as FormArray;
    if (item.length > 1) {
      let SurchargeSlabId = item.value[i].SurchargeSlabId;
      if (SurchargeSlabId > 0) {
        this.http.delete(`TaxRegime/DeleteSurchargeSlab/${SurchargeSlabId}`).then(res => {
          if (res.ResponseBody) {
            Toast("Regime deleted successfully");
          }
        }).catch(e => {
          ErrorToast(e.error.HttpStatusMessage);
        })
      }
      item.removeAt(i);
    }
    if (i > 0) {
      let value = (item.value[i-1].MaxSurchargeSlab) + 1;
      (<FormArray>item).controls[i].get('MinSurcahrgeSlab').setValue(value);
    }
  }

  get surchargeSlab() {
    return this.surchargeForm.get('SurchargeSlab') as FormArray;
  }

  checkSurchargeToAmount(e: any, i: number) {
    let value = this.surchargeForm.get('SurchargeSlab').value[i];
    if (value.MinSurcahrgeSlab >= value.MaxSurchargeSlab && Number(e.target.value) <= 0)
      e.target.closest('div').classList.add('error-field');
    else
      e.target.closest('div').classList.remove('error-field');
  }

  saveSurcharge() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.surchargeForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.surchargeForm.value.SurchargeSlab;
    this.http.post("TaxRegime/AddUpdateSurchargeSlab", value).then(res => {
      if (res.ResponseBody) {
        this.bindSurcharge(res.ResponseBody)
        Toast("Surcharge add or update successfully");
        this.isLoading = false;
        this.isEditable = false;
        this.isSubmitted = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  getSurcharge() {
      this.isLoading = true;
      this.http.get("TaxRegime/GetAllSurchargeSlab").then(res => {
        if (res.ResponseBody) {
          this.bindSurcharge(res.ResponseBody)
          Toast("Surcharge loaded successfully");
          this.isLoading = false;
          this.isEditable = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
  }

  cancelEditSurcharge() {
    this.isEditable = false;
  }

  bindSurcharge(data) {
    if (data) {
      this.allSurchargeSlabs = data;
      this.initSurcharge();
    } else {
      ErrorToast("Unable to load regime data. Please contact to admin.")
    }
  }
}

class Slab {
  TaxRegimeId: number =0;
  RegimeDescId: number =0;
  StartAgeGroup: number =0;
  EndAgeGroup: number =0;
  MinTaxSlab: number =0;
  MaxTaxSlab: number =0;
  TaxRatePercentage: number =0;
  TaxAmount: number =0;
  RegimeIndex: number =0;
}

class TaxRegimeDesc {
  TaxRegimeDescId: number = 0;
  RegimeName: string = null;
  Description: string = null;
}

class AgeGroup {
  AgeGroupId: number = 0;
  StartAgeGroup: number = null;
  EndAgeGroup: number = null;
}

class Surcharge {
  SurchargeSlabId: number = 0;
  MinSurcahrgeSlab: number = 0;
  MaxSurchargeSlab: number = 0;
  SurchargeRatePercentage: number = 0;
}
