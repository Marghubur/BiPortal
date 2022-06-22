import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { PayrollComponents } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
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
  allComponentFields: Array<SalaryComponentFields> = [];
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
  isPageReady: boolean = false;
  filterText: string = "";
  payrollCompoent: string = PayrollComponents;
  groupComponents: Array<any> = [];
  groupAllComponents: Array<any> = [];
  activeComponent: Array<any> = [];
  addedFormula: string = '';

  constructor(
    private fb: FormBuilder,
    private http: AjaxService,
    private nav:iNavigation
  ) { }

  get components(): FormArray {
    let data = this.salaryAndDeduction.get("salaryComponents") as FormArray;
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

  selectToAddComponent(event: any, item: any) {
    if (event.target.checked == true) {
      let index = this.activeComponent.indexOf(item.ComponentId);
        if (index > -1)
          ErrorToast("Component already added. Please select another component.");
        else
          this.activeComponent.push(item.ComponentId)
    } else {
        let index = this.activeComponent.indexOf(item.ComponentId);
        if (index > -1)
          this.activeComponent.splice(index, 1);
    }
  }

  addComponents() {
    this.componentsAvailable = false;
    let updateStructure: SalaryStructureType = {
      ComponentIdList: this.activeComponent,
      ComponentId: null,
      GroupDescription: this.selectedSalaryStructure.GroupDescription,
      GroupName: this.selectedSalaryStructure.GroupName,
      MaxAmount: this.selectedSalaryStructure.MaxAmount,
      MinAmount: this.selectedSalaryStructure.MinAmount,
      SalaryGroupId: this.selectedSalaryStructure.SalaryGroupId
    };

    this.http.post("SalaryComponent/UpdateSalaryGroupComponents", updateStructure).then ((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.groupComponents = response.ResponseBody;
        this.groupAllComponents = response.ResponseBody;
        Toast("Salary Group added suuccessfully.");
        this.SalaryGroupForm.reset();
        this.componentsAvailable = true;
      } else {
        ErrorToast("Unable to add salary group.")
      }
    })
    $('#addComponentModal').modal('hide');
  }

  salaryGroup() {
    this.SalaryGroupForm = this.fb.group({
      ComponentId: new FormControl(this.selectedSalaryStructure.ComponentId),
      GroupName: new FormControl(this.selectedSalaryStructure.GroupName, [Validators.required]),
      GroupDescription: new FormControl(this.selectedSalaryStructure.GroupDescription, [Validators.required]),
      MinAmount: new FormControl(this.selectedSalaryStructure.MinAmount, [Validators.required, numberZero]),
      MaxAmount: new FormControl(this.selectedSalaryStructure.MaxAmount, [Validators.required, numberZero]),
      SalaryGroupId: new FormControl(this.selectedSalaryStructure.SalaryGroupId)
    });
  }

  loadSalaryComponentDetail() {
    this.isPageReady = false;
    this.http.get("SalaryComponent/GetSalaryComponentsDetail").then(res => {
      if(res.ResponseBody) {
        let data = res.ResponseBody;
        data = data.filter(x => x.ComponentCatagoryId != 1);
        let i = 0;
        this.salaryComponentFields = [];
        while(i < data.length) {
          this.salaryComponentFields.push({
            ComponentFullName: data[i]["ComponentFullName"],
            ComponentDescription: data[i]["ComponentDescription"],
            ComponentId: data[i]["ComponentId"],
            Type: data[i]["ComponentTypeId"],
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
            EmployeeContribution: data[i]["EmployeeContribution"],
            Section: data[i]["Section"]
          });
          i++;
        }
        this.allComponentFields = this.salaryComponentFields;
        this.isPageReady = true;
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
    this.OpertaionType = "0";
    this.CalculationValue = null;
    this.salaryGroup();
    this.loadSalaryComponentDetail();
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

  ediitSalaryGrouop(item: any) {
    if (item) {
      this.selectedSalaryStructure = item;
      this.salaryGroup();
      $('#addSalaryGroupModal').modal('show');
    }
  }

  addSalaryGroup() {
    this.isLoading = true;
    this.submitted = true;
    let errorCounter = 0;
    if (this.SalaryGroupForm.get('GroupName').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('GroupDescription').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('MinAmount').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('MaxAmount').errors !== null)
      errorCounter++;

    let value:SalaryStructureType = this.SalaryGroupForm.value;
    if (value && errorCounter === 0) {
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
    } else {
      ErrorToast("Please correct all the mandaroty field marded red");
    }
    this.isLoading = false;
  }

  updateSalaryGroup() {
    this.isLoading = true;
    this.submitted = true;
    let errorCounter = 0;
    if (this.SalaryGroupForm.get('GroupName').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('GroupDescription').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('MinAmount').errors !== null)
      errorCounter++;
    if (this.SalaryGroupForm.get('MaxAmount').errors !== null)
      errorCounter++;

    let value:SalaryStructureType = this.SalaryGroupForm.value;
    if (value.SalaryGroupId <= 0) {
      ErrorToast("Please select a Salary Group first.");
      errorCounter++;
    }

    if (value && errorCounter === 0) {
      this.callUpdateSalaryGroup(value);
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marded red");
    }
  }

  callUpdateSalaryGroup(value: SalaryStructureType) {
    this.http.post("SalaryComponent/UpdateSalaryGroup", value).then ((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.salaryStructureType = response.ResponseBody;
        Toast("Salary Group added suuccessfully.");
        this.SalaryGroupForm.reset();
        $('#addSalaryGroupModal').modal('hide');
      } else {
        ErrorToast("Unable to add salary group.")
      }
    })

    this.isLoading = false;
  }

  formulaAppliedOn(item: string) {
    if (item && item != '') {
      let index = 0;
      switch (item) {
        case 'ctc':
          index = 0;
          break;
        case 'gross':
          index = 1;
          break;
        case 'net':
          index = 2;
          break;
        case 'basic':
          index = 3;
          break;
      }

      let elem = document.querySelectorAll('div[name="formulaComponent"] a');
      let i = 0;
      while (i < elem.length) {
        elem[i].classList.remove('active');
        i++;
      }
      elem[index].classList.add('active');
      let tag = document.getElementById('addedFormula');
      tag.innerText = `[${item.toLocaleUpperCase()}]`
      this.componentFields.Formula =`([${item.toLocaleUpperCase()}])`;
      tag.focus();
    }
  }

  addFormula() {
    let elem = document.querySelector('[name="addedFormula"]');
    this.componentFields.Formula = elem.innerHTML;
  }

  addComponentModal() {
    let i = 0;
    this.salaryComponentFields = this.allComponentFields;
    while (i < this.salaryComponentFields.length) {
      for (let index = 0; index < this.activeComponent.length; index++) {
        let value = this.salaryComponentFields.filter(x => x.ComponentId == this.activeComponent[index]);
        if (value.length > 0) {
          value[0].IsActive = true;
        }
      }
      i++;
    }
    $('#addComponentModal').modal('show');
  }

  selectSalaryGroup(item: SalaryStructureType) {
    if (item) {
      this.isSalaryGrpSelected = false;
      this.http.get(`SalaryComponent/GetSalaryGroupComponents/${item.SalaryGroupId}`)
      .then(res => {
        if (res.ResponseBody) {
          let value = res.ResponseBody;
          for (let index = 0; index < value.length; index++) {
            this.activeComponent.push(value[index].ComponentId);
          }
          this.groupComponents = value;
          this.groupAllComponents = value;
          this.isSalaryGrpSelected = true;
          this.componentsAvailable = true;
          Toast("Salary group record found");
        }
      })
      this.selectedSalaryStructure = this.salaryStructureType.find(x => x.GroupName == item.GroupName);
    } else {
      ErrorToast("Please select salary group.")
    }
  }

  updateCalcModel(item: UpdateSalaryComponent) {
    this.componentFields = item;
    if(this.componentFields.CalculateInPercentage == true) {
      this.componentFields.MaxLimit = this.componentFields.PercentageValue;
    }
    let elem = document.querySelectorAll('div[name="formulaComponent"] a');
    let i = 0;
    while (i < elem.length) {
      elem[i].classList.remove('active');
      i++;
    }

    let tag = document.getElementById('addedFormula');
    if (this.componentFields.Formula){
      tag.innerText = `${this.componentFields.Formula}`;
      this.componentFields.Formula =`${this.componentFields.Formula}`;
    } else {
      tag.innerText = '';
      this.componentFields.Formula = '';
    }
    tag.focus();
    this.submitted = false;
    $('#updateCalculationModal').modal('show');
  }

  addSalaryStrutModal() {
    $('#addCustomSalaryModal').modal('show');
  }

  addDailyStrutModal() {
    $('#addDailySalaryModal').modal('show');
  }

  addSalaryGroupModal() {
    this.submitted = false;
    $('#addSalaryGroupModal').modal('show');
  }

  updateValue() {
    this.isLoading = true;
    this.submitted = true;
    let value = this.componentFields;
    if (value.Formula.indexOf('%') > -1) {
      value.CalculateInPercentage = true;
      this.componentFields.MaxLimit = this.componentFields.PercentageValue;
    }
    let errorCounter =0;
    if (errorCounter === 0) {
        this.http.put(`Settings/UpdateSalaryComponentDetail/${this.componentFields.ComponentId}`, value).then((response:ResponseModel) => {
          if (response.ResponseBody)
            Toast('Updated Successfully')
          $('#updateCalculationModal').modal('hide');
        })
    }
    this.submitted = true;
    this.isLoading = false;
  }

  navigateTo(name: string) {
    if (name == PayrollComponents)
      this.nav.navigate(PayrollComponents, null);
  }

  filterRecords(e: any) {
    this.isReady = false;
    let value = e.target.value.toUpperCase();
    if (value) {
      this.groupComponents =  this.groupAllComponents.filter(x => x.ComponentId == value || x.ComponentFullName == value)
    }
    this.isReady = true;
  }

  clearFilter(e: any) {
    this.isReady = false;
    e.target.value = '';
    this.groupComponents = this.groupAllComponents;
    this.isReady = true;
  }

  filterSalaryComponent(event: any) {
    let value = event.target.value.toUpperCase();
    if (value) {
      this.salaryComponentFields =  this.allComponentFields.filter(x => x.ComponentId == value || x.ComponentFullName == value)
    }
  }

  resetSalaryFilter(e: any) {
    e.target.value = '';
    this.salaryComponentFields = this.allComponentFields;
  }
}

class SalaryStructureType {
  SalaryGroupId: number = 0;
  ComponentId: string = null;
  ComponentIdList: Array<string> = [];
  GroupName: string = null;
  GroupDescription: string = null;
  MinAmount: number = 0;
  MaxAmount: number = 0;
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
  TaxExempt: boolean = false;
  MaxLimit: number = 0;
  Formula: string = '';
  EmployeeContribution: boolean = false;
  EmployerContribution: boolean = false;
  IsOpted: boolean = false;
  IncludeInPayslip: boolean = false;
  ComponentId: string = '';
  ComponentDescription: string = '';
  ComponentFullName: string = '';
  PercentageValue: number = 0;
  Operator: string = '';
  FormulaBasedOn: string = 'CTC';
}

export function numberZero(control:AbstractControl): {[key: string]: any} | null {
  const value = control.value;
  if (value < 0)
    return {'numberZero': true}
  else
    null;
}
