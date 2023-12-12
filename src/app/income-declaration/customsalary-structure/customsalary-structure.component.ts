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
  selectedSalaryStructure: SalaryStructureType = new SalaryStructureType();
  isSalaryGrpSelected: boolean = false;
  isPageReady: boolean = true;
  payrollCompoent: string = PayrollComponents;
  groupComponents: Array<any> = [];
  groupAllComponents: Array<any> = [];
  customSalaryStructComp: Array<any> = []
  activeComponent: Array<any> = [];
  addedFormula: string = '';
  isEditSalaryGroup: boolean = false;
  customSalaryStructureForm: FormGroup;
  currentGroup: any = null;
  compnayDetail: any = null;
  salaryCompFilterData: string = null;
  selectedComponent: Array<any> = [];
  isClone: boolean = false;

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

  closeAddCompPopUp() {
    if (this.selectedComponent && this.selectedComponent.length > 0) {
      this.groupComponents = this.selectedComponent;
      this.activeComponent = this.selectedComponent;
    }
  }

  selectToAddComponent(event: any, item: any) {
    this.selectedComponent = [...this.activeComponent];
    if (event.target.checked == true) {
      let elem = this.activeComponent.find(x => x.ComponentId === item.ComponentId);
      if (elem != null)
        ErrorToast("Component already added. Please select another component.");
      else {
        if (!item.Formula || item.Formula == null)
          item.Formula = "0";
        this.activeComponent.push(item);
      }
    } else {
        let index = this.activeComponent.findIndex(x => x.ComponentId === item.ComponentId);
        if (index > -1)
          this.activeComponent.splice(index, 1);
    }
  }

  addComponents() {
    this.componentsAvailable = false;
    let updateStructure: SalaryStructureType = {
      GroupComponents: this.activeComponent,
      CompanyId: this.compnayDetail.CompanyId,
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
        this.salaryComponentFields = this.allComponentFields;
        Toast("Salary Group added suuccessfully.");
        this.componentsAvailable = true;
      } else {
        ErrorToast("Unable to add salary group.")
      }
    })
    $('#addComponentModal').modal('hide');
  }

  salaryGroup() {
    this.SalaryGroupForm = this.fb.group({
      CompanyId: new FormControl(this.compnayDetail.CompanyId),
      ComponentId: new FormControl(this.selectedSalaryStructure.ComponentId),
      GroupName: new FormControl(this.selectedSalaryStructure.GroupName, [Validators.required]),
      GroupDescription: new FormControl(this.selectedSalaryStructure.GroupDescription, [Validators.required]),
      MinAmount: new FormControl(this.selectedSalaryStructure.MinAmount, [Validators.required, numberZero]),
      MaxAmount: new FormControl(this.selectedSalaryStructure.MaxAmount, [Validators.required, numberZero]),
      SalaryGroupId: new FormControl(this.selectedSalaryStructure.SalaryGroupId)
    });
  }

  createCustomSalaryStructure() {
    this.customSalaryStructureForm = this.fb.group({
      StructureName: new FormControl(''),
      StructureDescription: new FormControl(''),
      EPF: new FormControl(false),
      ESI: new FormControl(false),
      IsPaidSeparately: new FormControl(false),
      IsDeductedFlatIncome: new FormControl(false),
      DeductedAmount: new FormControl(0),
      DeductedIncomeTax: new FormControl(false)
    })
  }

  buildSalaryComponentDetail(components: Array<any>) {
    this.isPageReady = false;
    //components = components.filter(x => x.IsAdHoc == 0);
    let i = 0;
    this.salaryComponentFields = [];
    while(i < components.length) {
      this.salaryComponentFields.push({
        ComponentFullName: components[i]["ComponentFullName"],
        ComponentDescription: components[i]["ComponentDescription"],
        ComponentId: components[i]["ComponentId"],
        Type: components[i]["ComponentTypeId"],
        TaxExempt: components[i]["TaxExempt"],
        Formula: components[i]["Formula"],
        MaxLimit: components[i]["MaxLimit"],
        RequireDocs: false,
        IndividualOverride: false,
        IsAllowtoOverride: false,
        IsComponentEnable: false,
        IsActive: components[i]["IsActive"],
        PercentageValue: components[i]["PercentageValue"],
        CalculateInPercentage: components[i]["CalculateInPercentage"],
        EmployerContribution: components[i]["EmployerContribution"],
        IncludeInPayslip: components[i]["IncludeInPayslip"],
        IsOpted: components[i]["IsOpted"],
        EmployeeContribution: components[i]["EmployeeContribution"],
        Section: components[i]["Section"]
      });
      i++;
    }
    this.allComponentFields = this.salaryComponentFields;
  }

  loadData() {
    this.isPageReady = false;
    this.salaryStructureType = [];
    this.http.get(`SalaryComponent/GetCustomSalryPageData/${this.compnayDetail.CompanyId}`).then(res => {
      if(res.ResponseBody && res.ResponseBody.SalaryComponents != null && res.ResponseBody.SalaryGroups != null) {
        this.salaryStructureType = res.ResponseBody.SalaryGroups;
        this.buildSalaryComponentDetail(res.ResponseBody.SalaryComponents);
        this.salaryGroup();
        this.isPageReady = true;
        this.isReady = true;
        Toast("Salary components loaded successfully.");
      } else {
        ErrorToast("Salary components loaded successfully.");
      }
    }).catch(e => {
      this.isPageReady = true;
    });
  }

  addCustomSalaryStruct() {
    this.isLoading = true;
    let value = this.customSalaryStructureForm.value;
  }

  ngOnInit(): void {
    this.salaryStructureType = [];
    this.selectedSalaryStructure = new SalaryStructureType();
    this.ComponentName = '0';
    this.OpertaionType = "0";
    this.CalculationValue = null;
    this.compnayDetail = this.nav.getValue();
    if (this.compnayDetail != null) {
      this.selectedSalaryStructure.CompanyId = this.compnayDetail.CompanyId;
      this.loadData();
      this.createCustomSalaryStructure();
    } else {
      ErrorToast("Invalid company selected.");
    }
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
      this.isEditSalaryGroup = true;
      this.selectedSalaryStructure = item;
      this.salaryGroup();
      this.isClone = false;
      $('#addSalaryGroupModal').modal('show');
    }
  }

  addSalaryGroup() {
    this.isEditSalaryGroup = false;
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
          $('#addSalaryGroupModal').modal('hide');
          this.isLoading = false;
        } else {
          ErrorToast("Unable to add salary group.")
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marded red");
    }
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
        $('#addSalaryGroupModal').modal('hide');
        this.isLoading = false;
      } else {
        ErrorToast("Unable to add salary group.")
      }
    }).catch(e => {
      this.isLoading = false;
    })

  }

  formulaAppliedOn(item: string) {
    if (item && item != '') {
      let index = 0;
      switch (item) {
        case 'ctc':
          index = 0;
          break;
        case 'basic':
          index = 1;
          break;
        // case 'gross':
        //   index = 1;
        //   break;
        case 'auto':
          index = 2;
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
    let elem = document.querySelector('[name="addedFormula"]') as HTMLInputElement;
    this.componentFields.Formula = elem.innerText;
  }

  addComponentModal() {
    let i = 0;
    this.salaryComponentFields = this.allComponentFields;
    this.salaryCompFilterData = null;
    while (i < this.salaryComponentFields.length) {
      for (let index = 0; index < this.activeComponent.length; index++) {
        let value = this.salaryComponentFields.filter(x => x.ComponentId == this.activeComponent[index].ComponentId);
        if (value.length > 0) {
          value[0].IsActive = true;
        }
      }
      i++;
    }
    $('#addComponentModal').modal('show');
  }

  selectSalaryGroup(item: SalaryStructureType) {
    event.stopPropagation();
    if (item) {
      this.currentGroup = item;
      this.isSalaryGrpSelected = false;
      this.http.get(`SalaryComponent/GetSalaryGroupComponents/${item.SalaryGroupId}/0`)
      .then(res => {
        if (res.ResponseBody) {
          let value = res.ResponseBody;
          this.activeComponent = value;
          this.groupComponents = value;
          this.groupAllComponents = value;
          this.salaryCompFilterData = null;
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
    if (this.componentFields.IncludeInPayslip)
      (document.getElementsByName("include-in-payslip")[0] as HTMLInputElement).checked = true;
    else
      (document.getElementsByName("include-in-payslip")[0] as HTMLInputElement).checked = false;
    tag.focus();
    this.submitted = false;
    $('#updateCalculationModal').modal('show');
  }

  addSalaryStrutModal() {
    let SalaryGroupId = 0;
    this.http.get(`SalaryComponent/GetSalaryGroupComponents/${SalaryGroupId}/0`)
      .then(res => {
        if (res.ResponseBody) {
          this.customSalaryStructComp = res.ResponseBody;
        }
      })
    let value = this.customSalaryStructComp.find(x => x.ComponentId == 'EPF');
    if (value != null)
      this.customSalaryStructureForm.get('EPF').setValue(true);
    value = this.customSalaryStructComp.find(x => x.ComponentId == 'ESI');
    if (value != null)
      this.customSalaryStructureForm.get('ESI').setValue(true);
    $('#addCustomSalaryModal').modal('show');
  }

  addDailyStrutModal() {
    $('#addDailySalaryModal').modal('show');
  }

  addSalaryGroupModal() {
    this.submitted = false;
    this.isEditSalaryGroup = false;
    this.selectedSalaryStructure = new SalaryStructureType();
    this.salaryGroup();
    this.isClone = false;
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

    if(this.componentFields.Formula != "([AUTO])") {
      let formula = this.calculateExpressionUsingInfixDS(this.componentFields.Formula);
      if (isNaN(formula)) {
        ErrorToast("Invalid formula entered");
        this.isLoading = false;
        return;
      }
    } else {
      this.componentFields.Formula = this.componentFields.Formula.replace(/\(/g, '').replace(/\)/g, '');
    }

    let isincludeInPayslip = (document.getElementsByName("include-in-payslip")[0] as HTMLInputElement).checked;
    value.IncludeInPayslip = isincludeInPayslip;
    if (this.currentGroup.SalaryGroupId > 0) {
        this.http.put(`Settings/UpdateGroupSalaryComponentDetail/
            ${this.componentFields.ComponentId}/
            ${this.currentGroup.SalaryGroupId}`, value).then((response:ResponseModel) => {
          if (response.ResponseBody) {
            this.isLoading = false;
            Toast('Updated Successfully')
          }
          $('#updateCalculationModal').modal('hide');
        }).catch(e => {
          this.isLoading = false;
        })
    } else {
      WarningToast("Group not selected.");
    }
    this.submitted = true;
  }

  navigateTo(name: string) {
    if (name == PayrollComponents)
      this.nav.navigate(PayrollComponents, null);
  }

  filterRecords(e: any) {
    this.isReady = false;
    let value = e.target.value.toUpperCase();
    if (value && value != '') {
      this.groupComponents =  this.groupAllComponents.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1)
    } else
    this.groupComponents =  this.groupAllComponents;
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
    if (value && value != '') {
      this.salaryComponentFields =  this.allComponentFields.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1)
    } else
      this.salaryComponentFields = this.allComponentFields;
  }

  resetSalaryFilter(e: any) {
    e.target.value = '';
    this.salaryComponentFields = this.allComponentFields;
  }

  openComponentDeleteOrUpdateModel(item: any) {
    $("#componentDeleteOrUpdateModel").modal('show');
    this.componentFields = item;
  }

  removeFromSalaryGroup() {
    this.isLoading = true;
    this.http.delete(`SalaryComponent/RemoveAndUpdateSalaryGroup/${this.componentFields.ComponentId}/${this.currentGroup.SalaryGroupId}`)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.groupComponents = JSON.parse(response.ResponseBody.SalaryComponents);
        Toast("Component removed from salary group successfully");
        $('#componentDeleteOrUpdateModel').modal('hide');
        this.isLoading = false;
      } else {
        ErrorToast("Unable to add salary group.")
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }


  calculateExpressionUsingInfixDS(expression: string): number {
    if (expression.includes('[CTC]'))
      expression = expression.replace('[CTC]', '100');
    else if(expression.includes('[BASIC]'))
      expression = expression.replace('[BASIC]', '100');

    expression = `(${expression})`;
    let operatorStact = [];
    let expressionStact = [];
    let index = 0;
    let lastOp = '';
    let ch = '';
    while(index < expression.length) {
      ch = expression[index];
      if(ch.trim() == ''){
        index++;
        continue;
      }
      if(isNaN(Number(ch))) {
        switch(ch) {
          case '+':
          case '-':
          case '/':
          case '%':
          case '*':
          case '>':
          case '<':
          case '=':
            if(operatorStact.length > 0) {
              lastOp = operatorStact[operatorStact.length - 1];
              if(lastOp == '+' || lastOp == '-' || lastOp == '/' || lastOp == '*' || lastOp == '%' || lastOp == '<' || lastOp == '=' || lastOp == '>') {
                lastOp = operatorStact.pop();
                expressionStact.push(lastOp);
              }
            }
            operatorStact.push(ch);
            break;
          case ')':
            while(true) {
              lastOp = operatorStact.pop();
              if(lastOp == '(') {
                //operatorStact.pop();
                break;
              }
              expressionStact.push(lastOp);
            }
            break;
          case '(':
            operatorStact.push(ch);
            break;
          default:
            ErrorToast("Invalid expression");
            break;
        }
      } else {
        let value = 0;
        while(true) {
          ch = expression[index];
          if(ch.trim() == '') {
            expressionStact.push(value);
            break;
          }

          if(!isNaN(Number(ch))) {
            value = Number(`${value}${ch}`);
            index++;
          } else {
            index--;
            expressionStact.push(value);
            break;
          }
        }
      }

      index++;
    }

    return this.calculationUsingInfixExpression(expressionStact);
  }

  calculationUsingInfixExpression(expressionStact: Array<any>): number {
    let i = 0;
    let term = [];
    while (i < expressionStact.length) {
      if (!isNaN(expressionStact[i]) && !isNaN(expressionStact[i+1]) && isNaN(Number(expressionStact[i+2]))) {
        let  finalvalue = 0;
        switch (expressionStact[i+2]) {
          case '+':
            finalvalue = expressionStact[i] + expressionStact[i+1];
            break;
          case '*':
            finalvalue = expressionStact[i] * expressionStact[i+1];
            break;
          case '-':
            finalvalue = expressionStact[i] - expressionStact[i+1];
            break;
          case '%':
            finalvalue = (expressionStact[i] * expressionStact[i+1]) / 100;
            break;
          }
        if (isNaN(finalvalue)) {
          ErrorToast("Invalid expression");
          this.isLoading = false;
          return;
        }
        term.push(finalvalue);
        i = i+3;
      }
      else if(!isNaN(expressionStact[i]) && isNaN(Number(expressionStact[i+1]))) {
        let  finalvalue = 0;
        let lastterm = term.pop();
        switch (expressionStact[i+1]) {
          case '+':
            finalvalue = lastterm + expressionStact[i];
            break;
          case '*':
            finalvalue = lastterm * expressionStact[i];
            break;
          case '-':
            finalvalue = lastterm - expressionStact[i];
            break;
          case '%':
            finalvalue = (lastterm * expressionStact[i]) / 100;
            break;
          }
          if (isNaN(finalvalue)) {
            ErrorToast("Invalid expression");
            this.isLoading = false;
            return;
          }
        term.push(finalvalue);
        i = i+2;
      } else {
        let  finalvalue = 0;
        let lastterm = term.pop();
        let previousterm = term.pop();
        switch (expressionStact[i]) {
          case '+':
            finalvalue = previousterm + lastterm;
            break;
          case '*':
            finalvalue = previousterm * lastterm;
            break;
          case '-':
            finalvalue = previousterm - lastterm;
            break;
          case '%':
            finalvalue = (previousterm * lastterm) / 100;
            break;
          }
        if (isNaN(finalvalue)) {
          ErrorToast("Invalid expression");
          this.isLoading = false;
          return;
        }
        term.push(finalvalue);
        i++;
      }
    }
    if (term.length === 1) {
      return Math.trunc(term[0]);
    } else {
      term = [];
      ErrorToast("Invalid expression");
    }
  }

  cloneSalaryGroupPopup(item: any) {
    if (item) {
      this.isEditSalaryGroup = true;
      this.selectedSalaryStructure = new SalaryStructureType();
      this.selectedSalaryStructure.SalaryGroupId = item.SalaryGroupId;
      this.salaryGroup();
      this.isClone = true;
      $('#addSalaryGroupModal').modal('show');
    }
  }

  cloneSalaryGroup() {
    this.isEditSalaryGroup = false;
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
    if (value && errorCounter === 0 && value.SalaryGroupId > 0) {
      this.http.post("SalaryComponent/CloneSalaryGroup", value).then ((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.salaryStructureType = response.ResponseBody;
          Toast("Salary Group added suuccessfully.");
          $('#addSalaryGroupModal').modal('hide');
          this.isLoading = false;
        } else {
          ErrorToast("Unable to add salary group.")
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marded red");
    }
  }
}

class SalaryStructureType {
  SalaryGroupId: number = 0;
  CompanyId: number = 0;
  ComponentId: string = null;
  GroupComponents: Array<any> = [];
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
