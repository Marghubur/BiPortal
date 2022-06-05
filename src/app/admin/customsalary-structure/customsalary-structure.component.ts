import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
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
  salaryComponents: FormArray;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: AjaxService
  ) { }

  get components(): FormArray {
    let data = this.salaryAndDeduction.get("salaryComponents") as FormArray;
    return data;
  }

  initForm() {
    this.salaryAndDeduction = this.fb.group({
      salaryComponents: this.fb.array(this.salaryComponentFields.map(item => {
        return this.createNewComponent(item)
      }))
    });
  }

  createNewComponent(elem: SalaryComponentFields): FormGroup {
    return this.fb.group({
      ComponentDescription: elem.ComponentDescription,
      Type: elem.Type,
      TaxExempt: elem.TaxExempt,
      MaxLimit: elem.MaxLimit,
      RequireDocs: elem.RequireDocs,
      IndividualOverride: elem.IndividualOverride,
      IsAllowtoOverride: elem.IsAllowtoOverride,
      IsComponentEnable: elem.IsComponentEnable,
      CalculateInPercentage: elem.CalculateInPercentage,
      ComponentId: elem.ComponentId
    });
  }

  loadData() {
    this.http.get("SalaryComponent/GetSalaryComponentsDetail").then(res => {
      if(res.ResponseBody) {
        let data = res.ResponseBody;
        let i = 0;
        this.salaryComponentFields = [];
        while(i < data.length) {
          this.salaryComponentFields.push({
            ComponentDescription: data[i]["ComponentDescription"],
            ComponentId: data[i]["ComponentId"],
            Type: data[i]["Type"],
            TaxExempt: data[i]["TaxExempt"],
            MaxLimit: data[i]["Amount"],
            RequireDocs: data[i]["RequireDocs"],
            IndividualOverride: data[i]["IndividualOverride"],
            IsAllowtoOverride: data[i]["IsAllowtoOverride"],
            IsComponentEnable: data[i]["IsComponentEnable"],
            PercentageValue: data[i]["PercentageValue"],
            CalculateInPercentage: data[i]["CalculateInPercentage"]
          });
          i++;
        }

        this.initForm();
        this.isLoading = true;
        Toast("Salary components loaded successfully.");
      } else {
        ErrorToast("Salary components loaded successfully.");
      }
    });
  }

  ngOnInit(): void {
    this.loadData();

    this.salaryStructureType = [{
      TypeName: 'Class A',
      MinAmount: 'Rs 0',
      MaxAmount: 'Rs 400000'
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
    this.isLoading = true;
    let items = this.salaryAndDeduction.controls["salaryComponents"] as FormArray;
    if(items) {
      items.controls.map(elem => {
        if(elem.value.ComponentName === this.componentFields.ComponentDescription) {
          elem.get("MaxLimit").setValue(this.componentFields.MaxLimit);
          elem.get("ComponentValueIn").setValue(this.componentFields.ComponentDescription);
        }
      });
    }
    this.isLoading = false;
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
