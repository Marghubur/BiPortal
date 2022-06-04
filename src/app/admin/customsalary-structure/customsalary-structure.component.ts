import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SalaryComponentFields } from '../salarycomponent-structure/salarycomponent-structure.component';
declare var $: any;

@Component({
  selector: 'app-customsalary-structure',
  templateUrl: './customsalary-structure.component.html',
  styleUrls: ['./customsalary-structure.component.scss']
})
export class CustomsalaryStructureComponent implements OnInit {
  ActivatedPage: number = 1;
  salaryStructureType: Array<SalaryStructureType> = null;
  isEditStructure: boolean = false;
  salaryComponentFields: Array<SalaryComponentFields> = [];
  componentFields: SalaryComponentFields = new SalaryComponentFields();
  customSalaryStructure: Array<CustomSalaryStructure> = [];
  dailyWages: Array<DailyWagesStructure> = []
  salaryAndDeduction: FormGroup;
  salaryComponent: FormGroup;

  constructor(private fb: FormBuilder) { }

  initForm() {
    this.salaryAndDeduction = this.fb.group({
      salaryComponents: this.fb.array(this.salaryComponentFields.map(item => {
        return this.createNewComponent(item)
      }))
    });
  }

  createNewComponent(elem: SalaryComponentFields): FormGroup {
    return this.fb.group({
      ComponentName: elem.ComponentName,
      Type: elem.Type,
      TaxExempt: elem.TaxExempt,
      MaxLimit: elem.MaxLimit,
      RequireDocs: elem.RequireDocs,
      IndividualOverride: elem.IndividualOverride,
      IsAllowtoOverride: elem.IsAllowtoOverride,
      IsComponentEnable: elem.IsComponentEnable,
      ComponentValueIn: elem.ComponentValueIn
    });
  }

  ngOnInit(): void {
    this.salaryStructureType = [{
      TypeName: 'Class A',
      MinAmount: 'Rs 0',
      MaxAmount: 'Rs 400000'
    },
    {
      TypeName: 'Class B',
      MinAmount: 'Rs 400001',
      MaxAmount: 'Rs 480000'
    },
    {
      TypeName: 'Class C',
      MinAmount: 'Rs 480001',
      MaxAmount: 'Rs 600000'
    },
    {
      TypeName: 'Class D',
      MinAmount: 'Rs 600001',
      MaxAmount: 'Rs 800000'
    },
    {
      TypeName: 'Class E',
      MinAmount: 'Rs 800001',
      MaxAmount: 'Rs 1000000'
    },
    {
      TypeName: 'Class E',
      MinAmount: 'Rs 800001',
      MaxAmount: 'Rs 1000000'
    },
    {
      TypeName: 'Class E',
      MinAmount: 'Rs 800001',
      MaxAmount: 'Rs 1000000'
    }];

    this.salaryComponentFields = [{
      ComponentName: "Basic",
      Type: "Fixed",
      TaxExempt: "Taxable",
      MaxLimit: "Auto Calculated",
      RequireDocs: false,
      IndividualOverride: true,
      IsAllowtoOverride: true,
      IsComponentEnable: true,
      ComponentValueIn: 0
    },
    {
      ComponentName: "HRA",
      Type: "Fixed",
      TaxExempt: "Tax Exempt",
      MaxLimit: "Auto Calculated",
      RequireDocs: false,
      IndividualOverride: true,
      IsAllowtoOverride: true,
      IsComponentEnable: true,
      ComponentValueIn: 0
    },
    {
      ComponentName: "MA",
      Type: "Allowance",
      TaxExempt: "Tax Exempt",
      MaxLimit: "2,50,000",
      RequireDocs: true,
      IndividualOverride: true,
      IsAllowtoOverride: true,
      IsComponentEnable: true,
      ComponentValueIn: 0
    },
    {
      ComponentName: "Convevance Allowance",
      Type: "Allowance",
      TaxExempt: "Tax Exempt",
      MaxLimit: "50,000",
      RequireDocs: false,
      IndividualOverride: true,
      IsAllowtoOverride: true,
      IsComponentEnable: true,
      ComponentValueIn: 0
    },
    {
      ComponentName: "Special Allowance",
      Type: "Allowance",
      TaxExempt: "Taxable",
      MaxLimit: "Auto Calculated",
      RequireDocs: false,
      IndividualOverride: true,
      IsAllowtoOverride: true,
      IsComponentEnable: true,
      ComponentValueIn: 0
    },
    {
      ComponentName: "Accident Insurance",
      Type: "Deduction",
      TaxExempt: "Tax Exempt",
      MaxLimit: "50,000",
      Section: "Section 10(14)(i)",
      RequireDocs: false,
      IndividualOverride: false,
      IsAllowtoOverride: false,
      IsComponentEnable: false,
      ComponentValueIn: 0
    },
    {
      ComponentName: "PF Employer",
      Type: "Deduction",
      TaxExempt: "Tax Exempt",
      MaxLimit: "21,600",
      Section: "Section 10(14)(i)",
      RequireDocs: false,
      IndividualOverride: false,
      IsAllowtoOverride: false,
      IsComponentEnable: false,
      ComponentValueIn: 0
    },{
      ComponentName: "Telephone Allowance",
      Type: "Deduction",
      TaxExempt: "Tax Exempt",
      MaxLimit: "2,50,000",
      Section: "Section 10(14)(ii)",
      RequireDocs: false,
      IndividualOverride: false,
      IsAllowtoOverride: false,
      IsComponentEnable: false,
      ComponentValueIn: 0
    },{
      ComponentName: "Food Deduction",
      Type: "Deduction",
      TaxExempt: "Tax Exempt",
      MaxLimit: "50,000",
      Section: "Section 16(iii)",
      RequireDocs: false,
      IndividualOverride: false,
      IsAllowtoOverride: false,
      IsComponentEnable: false,
      ComponentValueIn: 0
    }];


    this.dailyWages = [{
      SalaryStructureName: 'Stehphe-II',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
      RemunerationType: 'String'
    },
    {
      SalaryStructureName: 'M-Dummy',
      NoOfEmployee: 5,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
      RemunerationType: 'String'
    },
    {
      SalaryStructureName: 'Custom Salary Structure',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
      RemunerationType: 'String'
    },
    {
      SalaryStructureName: 'Roma',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
      RemunerationType: 'String'
    },
    {
      SalaryStructureName: 'Stehphe-II',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
      RemunerationType: 'String'
    }];
    this.customSalaryStructure = [{
      SalaryStructureName: 'Stehphe-II',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
    },
    {
      SalaryStructureName: 'M-Dummy',
      NoOfEmployee: 5,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
    },
    {
      SalaryStructureName: 'Custom Salary Structure',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
    },
    {
      SalaryStructureName: 'Roma',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
    },
    {
      SalaryStructureName: 'Stehphe-II',
      NoOfEmployee: 1,
      CreatedBy: 'Admin',
      CreatedOn: new Date(),
      ModifiedBy: 'Admin',
      ModifiedOn: new Date(),
    }];

    this.initForm();
  }

  editStructure() {
    this.isEditStructure = true;
  }

  cancleEditStructure() {
    this.isEditStructure = false;
  }

  activePage(page: number) {
    if (page > 0 && page <=3){
      switch (page) {
        case 2:
          this.ActivatedPage = 2;
          break;
        case 3:
          this.ActivatedPage = 3;
          break;
        case 1:
          this.ActivatedPage = 1;
          break;
      }

      var stepCount = document.querySelectorAll(".progress-step-item");
      for (let i=0; i <stepCount.length; i++) {
        stepCount[i].classList.remove('active', 'fill-success');
      }
      stepCount[page-1].classList.add('active');
      if (page > 1) {
        for (let i=0; i <page-1; i++) {
          stepCount[i].classList.add('fill-success');
        };
      }
      document.getElementById('progressbar').style.width = ((page - 1) *50).toString() + '%';
    }
  }

  addComponentModal() {
    $('#addComponentModal').modal('show');
  }

  updateCalcModel(item: SalaryComponentFields) {
    this.componentFields = item;
    $('#updateCalculationModal').modal('show');
  }

  addSalaryStrutModal() {
    $('#addCustomSalaryModal').modal('show');
  }

  addDailyStrutModal() {
    $('#addDailySalaryModal').modal('show');
  }

  updateValue() {
    let items = this.salaryAndDeduction.controls["salaryComponents"] as FormArray;
    if(items) {
      items.controls.map(elem => {
        if(elem.value.ComponentName === this.componentFields.ComponentName) {
          elem.get("MaxLimit").setValue(this.componentFields.MaxLimit);
          elem.get("ComponentValueIn").setValue(this.componentFields.ComponentValueIn);
        }
      });
    }
  }
}

class SalaryStructureType {
  TypeName: string = '';
  MinAmount: string = '';
  MaxAmount: string = '';
}

class CustomSalaryStructure {
  SalaryStructureName: string = '';
  NoOfEmployee: number = 0;
  CreatedBy: string = '';
  CreatedOn: Date = null;
  ModifiedBy: string = '';
  ModifiedOn: Date = null;
}

class DailyWagesStructure {
  SalaryStructureName: string = '';
  NoOfEmployee: number = 0;
  CreatedBy: string = '';
  CreatedOn: Date = null;
  ModifiedBy: string = '';
  ModifiedOn: Date = null;
  RemunerationType: string = '';
}
