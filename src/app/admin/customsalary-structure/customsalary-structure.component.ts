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
  salaryComponentFields: Array<SalaryComponentFields> = [];
  componentFields: UpdateSalaryComponent = new UpdateSalaryComponent();
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
  selectedSalaryStructure: SalaryStructureType = null;
  isSalaryGrpSelected: boolean = false;
  updateComponentForm: FormGroup;

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
    let values: any = this.salaryAndDeduction.get("salaryComponents");
    if(values && values.controls.length > 0) {
      let i = 0;
      let items = [];
      while(i < values.controls.length) {
        items.push(values.controls[i].value);
        i++;
      }

      if(items.length > 0) {
        this.http.post("SalaryComponent/UpdateSalaryComponents", items)
        .then(res => {
          if(res.ResponseBody) {
            Toast("Updated successfully");
          } else {
            Toast("Fail to pdated records");
          }
        });
      }
    }
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
      elem.TaxExempt = "false";
    if(elem.Formula == null || elem.Formula == "")
      elem.Formula = "NA";

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
      IsActive: elem.IsActive,
      EmployeeContribution: elem.EmployeeContribution,
      EmployerContribution: elem.EmployerContribution,
      IsOpted: elem.IsOpted,
      IncludeInPayslip: elem.IncludeInPayslip,
      PercentageValue: elem.PercentageValue
    });
  }
  salaryGroup() {
    this.SalaryGroupForm = this.fb.group({
      ComponentId: new FormControl(''),
      GroupName: new FormControl('', [Validators.required]),
      GroupDescription: new FormControl('', [Validators.required]),
      MinAmount: new FormControl(0, [Validators.required]),
      MaxAmount: new FormControl(0, [Validators.required])
    })
  }

  loadSalaryComponentDetail() {
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
            CalculateInPercentage: data[i]["CalculateInPercentage"],
            EmployerContribution: data[i]["EmployerContribution"],
            IncludeInPayslip: data[i]["IncludeInPayslip"],
            IsOpted: data[i]["IsOpted"],
            EmployeeContribution: data[i]["EmployeeContribution"]
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

  loadData() {
    this.salaryStructureType = [];
    this.http.get("SalaryComponent/GetSalaryGroups").then(res => {
      if(res.ResponseBody) {
        this.salaryStructureType = res.ResponseBody;
        Toast("Salary components loaded successfully.");
      } else {
        ErrorToast("Salary components loaded successfully.");
      }
    });
  }

  ngOnInit(): void {
    this.salaryStructureType = [];
    this.selectedSalaryStructure = new SalaryStructureType();
    this.ComponentName = '0';
    this.updateComponentDeatils();
    this.OpertaionType = "0";
    this.CalculationValue = null;
    this.salaryGroup();
    this.loadSalaryComponentDetail()
    this.loadData();

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
    if (this.SalaryGroupForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value:SalaryStructureType = this.SalaryGroupForm.value;
    if (value) {
      this.http.post("SalaryComponent/AddSalaryGroup", value).then ((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.salaryStructureType = response.ResponseBody;
          Toast("Salary Group added suuccessfully.");
          this.SalaryGroupForm.reset();
          $('#addSalaryGroupModal').modal('hide');
        } else {
          ErrorToast("Unable to add salary group.")
        }
      })
    } else
      ErrorToast("Please correct all the mandaroty field marded red");
    this.isLoading = false;
  }

  generateFormula() {
    let value = this.updateComponentForm.get('MaxLimit').value
    this.componentFields.Formula =`([${this.ComponentName}] ${this.OpertaionType} ${Number(value)})`;
  }

  addComponentModal() {
    $('#addComponentModal').modal('show');
  }

  selectSalaryGroup(item: SalaryStructureType) {
    if (item) {
      this.selectedSalaryStructure = this.salaryStructureType.find(x => x.GroupName == item.GroupName);
      this.isSalaryGrpSelected = true;
    } else {
      ErrorToast("Please select salary group.")
    }
  }

  updateCalcModel(item: UpdateSalaryComponent) {
    this.componentFields = item;
    if(this.componentFields.CalculateInPercentage == true) {
      this.componentFields.MaxLimit = this.componentFields.PercentageValue;
    }

    this.updateComponentDeatils();
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

  updateComponentDeatils() {
    this.updateComponentForm = this.fb.group({
      CalculateInPercentage: new FormControl (this.componentFields.CalculateInPercentage == false ? '3': '2'),
      TaxExempt: new FormControl (this.componentFields.TaxExempt == 'true'? true: false),
      MaxLimit: new FormControl (this.componentFields.MaxLimit),
      Formula: new FormControl (this.componentFields.Formula),
      EmployeeContribution: new FormControl (this.componentFields.EmployeeContribution),
      EmployerContribution: new FormControl (this.componentFields.EmployerContribution),
      IsOpted: new FormControl (this.componentFields.IsOpted),
      IncludeInPayslip: new FormControl (this.componentFields.IncludeInPayslip)
    })
  }

  updateValue() {
    this.isLoading = true;
    let value = this.updateComponentForm.value;
    value.Formula = this.componentFields.Formula;
    switch (value.CalculateInPercentage) {
      case '2':
        value.CalculateInPercentage = true;
        break;
      case '3':
        value.CalculateInPercentage = false;
        break;
    }

    let items = this.salaryAndDeduction.controls["salaryComponents"] as FormArray;
    if(items) {
      items.controls.map(elem => {
        if(elem.value.ComponentDescription === this.componentFields.ComponentDescription) {
          elem.get("Formula").setValue(this.componentFields.Formula);
          elem.get("CalculateInPercentage").setValue(this.componentFields.CalculateInPercentage);
          elem.get("TaxExempt").setValue(value.TaxExempt);
          elem.get("MaxLimit").setValue(this.componentFields.MaxLimit);
          elem.get("EmployeeContribution").setValue(value.EmployeeContribution);
          elem.get("EmployerContribution").setValue(value.EmployerContribution);
          elem.get("IsOpted").setValue(value.IsOpted);
          elem.get("IncludeInPayslip").setValue(value.IncludeInPayslip);
          if (value.CalculateInPercentage = true) {
            elem.get("PercentageValue").setValue(value.MaxLimit);
            elem.get("MaxLimit").setValue(0);
          } else {
            elem.get("MaxLimit").setValue(value.MaxLimit);
            elem.get("PercentageValue").setValue(0);
          }
        }
      });
      this.http.put(`Settings/UpdateSalaryComponentDetail/${this.componentFields.ComponentId}`, value).then((response:ResponseModel) => {
        if (response.ResponseBody)
          Toast('Updated Successfully')
      })
    }

    this.isLoading = false;
    $('#updateCalculationModal').modal('hide');
  }
}

class SalaryStructureType {
  SalaryGroupId: number = null;
  ComponentId: string = null;
  GroupName: string = null;
  GroupDescription: string = null;
  MinAmount: number = null;
  MaxAmount: number = null;
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

class UpdateSalaryComponent {
  CalculateInPercentage: boolean = false;
  TaxExempt: string = '';
  MaxLimit: number = 0;
  Formula: string = '';
  EmployeeContribution: boolean = false;
  EmployerContribution: boolean = false;
  IsOpted: boolean = false;
  IncludeInPayslip: boolean = false;
  ComponentId: number = 0;
  ComponentDescription: string = '';
  PercentageValue: number = 0;
}
