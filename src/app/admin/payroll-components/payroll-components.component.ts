import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-payroll-components',
  templateUrl: './payroll-components.component.html',
  styleUrls: ['./payroll-components.component.scss']
})
export class PayrollComponentsComponent implements OnInit {
  active = 1;
  NewSalaryForm: FormGroup;
  ComponentType: string = '';
  isLoading: boolean = false;
  isTaxExempt: boolean = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
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
      SectionMaxLimit: new FormControl(''),
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

  addNewComp() {
    this.isLoading = true;
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
