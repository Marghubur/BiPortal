import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-tax-regime',
  templateUrl: './tax-regime.component.html',
  styleUrls: ['./tax-regime.component.scss']
})
export class TaxRegimeComponent implements OnInit {
  active = 1;
  oldTaxRegimeForm: FormGroup;
  taxSlab:Slab = new Slab();
  isEditable: boolean = false;
  fromAgeGroup: Array<number> = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  toAgeGroup: Array<number> = [20];
  ageGroupForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.oldTaxRegime();
    this.initAgeGroup();
  }

  oldTaxRegime() {
    this.oldTaxRegimeForm = this.fb.group({
      OldTaxSlab: this.buildOldTaxSlab()
    })
  }

  buildOldTaxSlab(): FormArray {
    let data = [];
    let dataArray: FormArray = this.fb.array([]);

    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          From: new FormControl(data[i].From),
          To: new FormControl(data[i].To),
          Rate: new FormControl(data[i].Rate),
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
      From: new FormControl(this.taxSlab.From),
      To: new FormControl(this.taxSlab.To),
      Rate: new FormControl(this.taxSlab.Rate),
      TaxAmount: new FormControl(this.taxSlab.TaxAmount)
    });
  }

  addOldTaxSlab() {
    let item = this.oldTaxRegimeForm.get('OldTaxSlab') as FormArray;
    let value = item.value[item.length - 1];
    if (value.To > value.From && value.To > 0) {
      this.taxSlab = new Slab();
      this.taxSlab.From = value.To + 1;
      item.push(this.createOldaTaxSlab());
    }
  }

  removeOldTaxSlab(i: number) {
    let item = this.oldTaxRegimeForm.get('OldTaxSlab') as FormArray;
    item.removeAt(i);
    if (item.length === 0)
      this.addOldTaxSlab();
    if (i > 0) {
      let value = (item.value[i-1].To) + 1;
      (<FormArray>item).controls[i].get('From').setValue(value);
      this.calcTaxAmount();
    }
  }

  get oldSlab() {
    return this.oldTaxRegimeForm.get('OldTaxSlab') as FormArray;
  }

  calcTaxAmount() {
    let taxAmount = 0;
    let length = this.oldTaxRegimeForm.get('OldTaxSlab').value.length;
    let formArray = this.oldTaxRegimeForm.get('OldTaxSlab');
    for (let index = 0; index < length; index++) {
      let value = formArray.value[index];
      if (index > 0)
        taxAmount += formArray.value[index-1].TaxAmount
      if(value.From > 0)
        value.From = value.From -1 ;
      taxAmount = taxAmount + ((value.From * value.Rate) /100);
      (<FormArray>formArray).controls[index].get('TaxAmount').setValue(taxAmount);
    }
  }

  checkToAmount(e: any, i: number) {
    let value = this.oldTaxRegimeForm.get('OldTaxSlab').value[i];
    if (value.From >= value.To)
      e.target.closest('div').classList.add('error-field');
    else
      e.target.closest('div').classList.remove('error-field');
  }

  editSlab() {
    this.isEditable = true;
  }

  saveOldRegime() {
    this.isEditable = false;
  }

  ageGroupPopUp() {
    this.fromAgeGroup = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    $('#ageGroupModal').modal('show');
  }

  fromAgeSelect(e: any) {
    let value = Number(e.target.value) + 10;
    this.toAgeGroup = [];
    while (value <= 110) {
      this.toAgeGroup.push(value);
      value = value+10;
    }
    // let index = this.toAgeGroup.findIndex(x => x == value) + 1;
    // this.toAgeGroup = this.toAgeGroup.splice(index, this.toAgeGroup.length);
  }

  initAgeGroup() {
    this.ageGroupForm = this.fb.group({
      FromAge: new FormControl(10),
      ToAge: new FormControl(20),
    })
  }
}

class Slab {
  To: number = 0;
  From: number = 0;
  Rate: number = 0;
  TaxAmount: number = 0;
}
