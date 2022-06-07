import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-payroll-components',
  templateUrl: './payroll-components.component.html',
  styleUrls: ['./payroll-components.component.scss']
})
export class PayrollComponentsComponent implements OnInit {
  active = 1;
  NewSalaryForm: FormGroup;
  AdhocForm: FormGroup;
  DeductionForm: FormGroup;
  BonusForm:FormGroup;
  ComponentType: string = '';
  isLoading: boolean = false;
  isTaxExempt: boolean = false;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.ComponentType = '';
    this.initForm();
    this.initadhocForm();
    this.initdeductionForm();
    this.initbonusForm();
  }

  initForm() {
    this.NewSalaryForm = this.fb.group({
      ComponentName: new FormControl(''),
      Type: new FormControl(''),
      TaxExempt: new FormControl(''),
      MaxLimit: new FormControl(''),
      RequireDocs: new FormControl(false),
      CompoentDescription: new FormControl(''),
      Section: new FormControl(''),
      SectionMaxLimit: new FormControl('')
    });
  }

  initadhocForm() {
    this.AdhocForm = this.fb.group({
      ComponentName: new FormControl(''),
      CompoentDescription: new FormControl(''),
      TaxExempt: new FormControl(''),
      Section: new FormControl(''),
      SectionMaxLimit: new FormControl('')
    });
  }

  initdeductionForm() {
    this.DeductionForm = this.fb.group({
      ComponentName: new FormControl(''),
      CompoentDescription: new FormControl(''),
      IsAffectinGross: new FormControl(false)
    });
  }

  initbonusForm() {
    this.BonusForm = this.fb.group({
      ComponentName: new FormControl(''),
      CompoentDescription: new FormControl('')
    });
  }

  selectComponentType(e: any) {
    let value = e.target.value;
    if (value) {
      this.ComponentType = value;
    }
  }

  newComponentPopUp() {
    $('#NewComponentModal').modal('show');
  }

  AdhocPopUp() {
    $('#CreateAdhocModal').modal('show');
  }

  BonusPopUp() {
    $('#CreateDeductionModal').modal('show');
  }

  DeductionPopUp() {
    $('#CreateBonusModal').modal('show');
  }

  addNewComp() {
    this.isLoading = true;
    let value = this.NewSalaryForm.value;
    if (value) {
      this.http.post("", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Component added successfully.")
        } else
          ErrorToast("Fail to add component. Please contact to admin.")
      })
    }
    this.isLoading = false;
  }

  addNewAdhocAllowance() {
    this.isLoading = true;
    let value = this.AdhocForm.value;
    if (value) {
      this.http.post("", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Component added successfully.")
        } else
          ErrorToast("Fail to add component. Please contact to admin.")
      })
    }
    this.isLoading = false;
  }

  addNewDeduction() {
    this.isLoading = true;
    let value = this.DeductionForm.value;
    if (value) {
      this.http.post("", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Component added successfully.")
        } else
          ErrorToast("Fail to add component. Please contact to admin.")
      })
    }
    this.isLoading = false;
  }

  addNewBonus() {
    this.isLoading = true;
    let value = this.BonusForm.value;
    if (value) {
      this.http.post("", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Component added successfully.")
        } else
          ErrorToast("Fail to add component. Please contact to admin.")
      })
    }
    this.isLoading = false;
  }

  enableTaxExempt(e: any) {
    let value = e.target.checked;
    if (value == true)
      this.isTaxExempt = true;
    else
      this.isTaxExempt = false;
  }
}

class PayrollComponentsModal {
  ComponentName: string = null;
  Type: string = null;
  TaxExempt: string = null;
  MaxLimit: number = null;
  RequireDocs: boolean = null;
  CompoentDescription: string = null;
  Section: string = null;
  SectionMaxLimit: number = null;
  IsAffectinGross: boolean = null;
}
