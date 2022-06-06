import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
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
  isReady: boolean = false;
  componentsAvailable: boolean = false;
  ComponentName: string = '';
  OpertaionType: string = '';
  CalculationValue: string = '';
  submitted: boolean = false;
  SalaryGroupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: AjaxService
  ) { }

  get components(): FormArray {
    let data = this.salaryAndDeduction.get("salaryComponents") as FormArray;
    //console.log(JSON.stringify(data.controls));
    return data;
  }

  get f() {
    return this.SalaryGroupForm.controls;
  }

  saveChanges() {
    this.submitted = true;
    console.log(this.salaryAndDeduction.value);
  }

  addComponents() {
    this.componentsAvailable = false;
    let elems: FormArray = this.buildFormArray();
    (this.salaryAndDeduction.get("salaryComponents") as FormArray).controls = elems.controls;
    $('#addComponentModal').modal('hide');
  }

  initForm() {
    this.salaryAndDeduction = this.fb.group({
      StructureName: new FormControl (),
      salaryComponents: this.buildFormArray()
    });
  }

  buildFormArray(): FormArray {
    let elems: FormArray = this.fb.array([]);
    let i = 0;
    while(i < this.salaryComponentFields.length) {
      if(this.salaryComponentFields[i].IsActive) {
        elems.push(this.createNewComponent(this.salaryComponentFields[i]));
      }
      i++;
    }

    if(elems.controls.length > 0)
    this.componentsAvailable = true;
    return elems;
  }

  createNewComponent(elem: SalaryComponentFields): FormGroup {
    if(elem.TaxExempt == null || elem.TaxExempt == "")
      elem.TaxExempt = "NA";

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
      ComponentId: elem.ComponentId,
      Formula: elem.Formula,
      IsActive: elem.IsActive
    });
  }

  salaryGroup() {
    this.SalaryGroupForm = this.fb.group({
      ComponentId: new FormControl('', [Validators.required]),
      GroupName: new FormControl('', [Validators.required]),
      GroupDescription: new FormControl('', [Validators.required])
    })
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
            Type: data[i]["SubComponentTypeId"],
            TaxExempt: data[i]["TaxExempt"],
            Formula: data[i]["Formula"],
            MaxLimit: data[i]["MaxLimit"],
            RequireDocs: false,
            IndividualOverride: false,
            IsAllowtoOverride: false,
            IsComponentEnable: false,
            IsActive: data[i]["IsActive"],
            PercentageValue: data[i]["PercentageValue"],
            CalculateInPercentage: data[i]["CalculateInPercentage"]
          });
          i++;
        }

        this.initForm();
        this.isReady = true;
        Toast("Salary components loaded successfully.");
      } else {
        ErrorToast("Salary components loaded successfully.");
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.ComponentName = '0';
    this.OpertaionType = "0";
    this.CalculationValue = null;
    this.salaryGroup();
    this.salaryStructureType = [

    ];

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

  addSalaryGroup() {
    this.isLoading = true;
    this.submitted = true;
    let value = this.SalaryGroupForm.value;
    if (value) {
      this.http.post("SalaryComponent/AddorUpdateSalaryGroup", value).then ((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Salary Group added suuccessfully.")
        } else {
          ErrorToast("Unable to add salary group.")
        }
      })
    }
    this.isLoading = false;
    ErrorToast("Please correct all the mandaroty field marded red");
  }

  generateFormula() {
    this.componentFields.Formula =`([${this.ComponentName}] ${this.OpertaionType} ${this.CalculationValue})`;
  }

  addComponentModal() {
    $('#addComponentModal').modal('show');
  }

  updateCalcModel(item: SalaryComponentFields) {
    this.componentFields = item;
    this.CalculationValue = '',
    this.OpertaionType = '0',
    this.ComponentName = '0',
    $('#updateCalculationModal').modal('show');
  }

  addSalaryStrutModal() {
    $('#addCustomSalaryModal').modal('show');
  }

  addDailyStrutModal() {
    $('#addDailySalaryModal').modal('show');
  }

  addSalaryGroupModal() {
    $('#addSalaryGroupModal').modal('show');
  }

  updateValue() {
    this.isLoading = true;
    let items = this.salaryAndDeduction.controls["salaryComponents"] as FormArray;
    if(items) {
      items.controls.map(elem => {
        if(elem.value.ComponentDescription === this.componentFields.ComponentDescription) {
          elem.get("Formula").setValue(this.componentFields.Formula);
          elem.get("CalculateInPercentage").setValue(this.componentFields.CalculateInPercentage);
        }
      });
    }

    this.isLoading = false;
    $('#updateCalculationModal').modal('hide');
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
