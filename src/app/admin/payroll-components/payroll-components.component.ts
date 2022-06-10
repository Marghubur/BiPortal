import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Settings } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-payroll-components',
  templateUrl: './payroll-components.component.html',
  styleUrls: ['./payroll-components.component.scss']
})
export class PayrollComponentsComponent implements OnInit {
  active = 1;
  activetab = 2;
  NewSalaryForm: FormGroup;
  AdhocForm: FormGroup;
  DeductionForm: FormGroup;
  BonusForm:FormGroup;
  ComponentType: string = '';
  isLoading: boolean = false;
  isTaxExempt: boolean = false;
  RecurringComponent: Array<any> = [];
  CurrentRecurringComponent: PayrollComponentsModal = new PayrollComponentsModal();
  submitted: boolean = false;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav:iNavigation) { }

  ngOnInit(): void {
    this.ComponentType = '';
    this.loadData()
    this.initForm();
    this.initadhocForm();
    this.initdeductionForm();
    this.initbonusForm();
  }

  navigate() {
    this.nav.navigate(Settings, null)
  }

  loadData() {
    this.http.get("SalaryComponent/GetSalaryComponentsDetail").then((response:ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody.length > 0) {
        this.RecurringComponent = response.ResponseBody;
        let i =0;
        while(i < this.RecurringComponent.length) {
          this.componentType(this.RecurringComponent[i].ComponentTypeId, i);
          i++;
        }
        Toast("Record found");
      }
    })
  }

  componentType(value: number, i: number) {
    switch (value) {
      case 2:
        this.RecurringComponent[i].ComponentTypeId = "Allowance"
        break;
      case 3:
        this.RecurringComponent[i].ComponentTypeId = "Rembursement"
        break;
      case 4:
        this.RecurringComponent[i].ComponentTypeId = "Reimbursable"
        break;
    }
  }

  get f() {
    return this.NewSalaryForm.controls;
  }

  initForm() {
    this.NewSalaryForm = this.fb.group({
      ComponentName: new FormControl(this.CurrentRecurringComponent.ComponentId, [Validators.required]),
      Type: new FormControl(this.CurrentRecurringComponent.Type, [Validators.required]),
      TaxExempt: new FormControl(this.CurrentRecurringComponent.TaxExempt),
      MaxLimit: new FormControl(this.CurrentRecurringComponent.MaxLimit),
      RequireDocs: new FormControl(this.CurrentRecurringComponent.RequireDocs),
      ComponentDescription: new FormControl(this.CurrentRecurringComponent.ComponentDescription),
      Section: new FormControl(this.CurrentRecurringComponent.Section),
      SectionMaxLimit: new FormControl(this.CurrentRecurringComponent.SectionMaxLimit)
    });
  }

  initadhocForm() {
    this.AdhocForm = this.fb.group({
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl(''),
      TaxExempt: new FormControl(''),
      Section: new FormControl(''),
      SectionMaxLimit: new FormControl(0)
    });
  }

  initdeductionForm() {
    this.DeductionForm = this.fb.group({
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl(''),
      IsAffectinGross: new FormControl(false)
    });
  }

  initbonusForm() {
    this.BonusForm = this.fb.group({
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl('')
    });
  }

  selectComponentType(e: any) {
    let value = e.target.value;
    if (value) {
      this.ComponentType = value;
    }
  }

  newComponentPopUp() {
    this.submitted = false;
    this.CurrentRecurringComponent = new PayrollComponentsModal();
    this.initForm();
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

  editRecurring(item: any) {
    if (item) {
      this.CurrentRecurringComponent = item;
      switch (item.ComponentTypeId) {
        case 'Allowance':
          this.CurrentRecurringComponent.Type = "2"
          break;
        case "Rembursement":
          this.CurrentRecurringComponent.Type = "3"
          break;
        case "Reimbursable":
          this.CurrentRecurringComponent.Type = "4"
          break;
      }
      if(item.TaxExempt == 'true')
        this.isTaxExempt = true;
      else
        this.isTaxExempt = false;
      this.initForm();
      $('#NewComponentModal').modal('show');
    } else {
      ErrorToast("Please select salary component first.")
    }
  }

  addNewComp() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.NewSalaryForm.get('ComponentName').errors !== null)
      errroCounter++;
    if (this.NewSalaryForm.get('Type').value == '0')
      errroCounter++;
    if (errroCounter == 0) {
      let value:PayrollComponentsModal = this.NewSalaryForm.value;
      if (value) {
        this.http.post("SalaryComponent/AddUpdateRecurringComponents", value).then((response:ResponseModel) => {
          if (response.ResponseBody) {
            let data = response.ResponseBody;
            if (data.length > 0) {
              this.RecurringComponent = data;
              let i =0;
              while(i < this.RecurringComponent.length) {
                this.componentType(this.RecurringComponent[i].ComponentTypeId, i);
                i++;
              }
              this.NewSalaryForm.reset();
            }
            $('#NewComponentModal').modal('hide');
            Toast("Component added successfully.");
          } else
            ErrorToast("Fail to add component. Please contact to admin.");
          this.submitted = false;
        })
      }
    }
    this.isLoading = false;
  }

  addNewAdhocAllowance() {
    this.isLoading = true;
    let value = this.AdhocForm.value;
    if (value) {
      this.http.post("SalaryComponent/AddAdhocComponents", value).then((response:ResponseModel) => {
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
      this.http.post("SalaryComponent/AddDeductionComponents", value).then((response:ResponseModel) => {
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
      this.http.post("SalaryComponent/AddBonusComponents", value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          $('#CreateDeductionModal').modal('hide');
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
  Type: string = '';
  TaxExempt: boolean = false;
  MaxLimit: number = 0;
  RequireDocs: boolean = false;
  ComponentDescription: string = null;
  Section: string = null;
  SectionMaxLimit: number = 0;
  IsAffectinGross: boolean = false;
  ComponentId: string = '';
}
