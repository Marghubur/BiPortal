import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-salarycomponent-structure',
  templateUrl: './salarycomponent-structure.component.html',
  styleUrls: ['./salarycomponent-structure.component.scss']
})
export class SalarycomponentStructureComponent implements OnInit {
  ActivatedPage: number = 1;
  salaryComponentFields: Array<any> = [];
  allSalaryCOmponents: Array<any> = [];
  salaryComponentActiveFields: Array<SalaryComponentFields> = [];
  currentSalaryComponent: SalaryComponentFields = null;
  editSalaryComponent: FormGroup;
  //addComponentForm: FormGroup;
  isFixedType: boolean = false;
  recurringComponent:Array<any> = [];
  isLoading: boolean = false;
  componentTypeId: number = -1;
  isReady: boolean = false;
  AddActiveComponent: Array<SalaryComponentFields> = [];
  inactiveComponentDeatil: SalaryComponentFields = new SalaryComponentFields();
  allAdHocComponent: Array<AdHocComponentsModal> = [];
  isPageReady: boolean = true;

// ----------------------------------------
  groupComponents: Array<any> = [];
  allComponentFields: Array<any> = [];
  salaryCompFilterData: string = null;
  componentFields: UpdateSalaryComponent = new UpdateSalaryComponent();
  componentsAvailable: boolean = false;
  selectedComponent: Array<any> = [];
  activeComponent: Array<any> = [];
  groupAllComponents: Array<any> = [];
  submitted: boolean = false;
  currentGroup: any = null;

  constructor(private fb: FormBuilder,
              private http: CoreHttpService) { }

  ngOnInit(): void {
    this.ActivatedPage = 1;
    this.currentSalaryComponent = new SalaryComponentFields();
    // this.loadOnChange();
    this.salaryComponent();
    this.loadSalaryGroupComponent();
  }

  loadSalaryGroupComponent() {
    this.isPageReady = false;
    this.http.get('SalaryComponent/GetSalaryGroupAndComponent').then(res => {
      if(res.ResponseBody && res.ResponseBody.SalaryComponents != null && res.ResponseBody.SalaryGroup != null) {
        this.groupComponents = res.ResponseBody.SalaryGroup.GroupComponents;
        this.currentGroup = res.ResponseBody.SalaryGroup;
        this.activeComponent = res.ResponseBody.SalaryGroup.GroupComponents;
        this.groupAllComponents = res.ResponseBody.SalaryGroup.GroupComponents;
        this.salaryCompFilterData = null;
        this.allComponentFields = res.ResponseBody.SalaryGroup.GroupComponents;
        this.buildSalaryComponentDetail(res.ResponseBody.SalaryComponents);
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

  resetSalaryFilter(e: any) {
    e.target.value = '';
    this.salaryComponentFields = this.allComponentFields;
  }

  filterSalaryComponent(event: any) {
    let value = event.target.value.toUpperCase();
    if (value && value != '') {
      this.salaryComponentFields =  this.allComponentFields.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1)
    } else
      this.salaryComponentFields = this.allComponentFields;
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
      CompanyId: this.currentGroup.CompanyId,
      ComponentId: null,
      GroupDescription: this.currentGroup.GroupDescription,
      GroupName: this.currentGroup.GroupName,
      MaxAmount: this.currentGroup.MaxAmount,
      MinAmount: this.currentGroup.MinAmount,
      SalaryGroupId: this.currentGroup.SalaryGroupId
    };

    this.http.post("SalaryComponent/UpdateSalaryGroupComponents", updateStructure).then ((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.groupComponents = response.ResponseBody;
        this.salaryComponentFields = this.allComponentFields;
        Toast("Salary Group added suuccessfully.");
        this.componentsAvailable = true;
      } else {
        ErrorToast("Unable to add salary group.")
      }
    })
    $('#addComponentModal').modal('hide');
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




  loadOnChange() {
    this.isReady = false;
    this.isPageReady = false;
    this.http.get(`Settings/FetchActiveComponents`)
    .then(res => {
      if(res.ResponseBody) {
        if(res.ResponseBody.length > 0) {
          this.salaryComponentFields = res.ResponseBody;
          this.allSalaryCOmponents = res.ResponseBody;
          this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsOpted);
          this.allAdHocComponent = res.ResponseBody.filter(x => x.IsAdHoc == true && x.AdHocId > 0);
          this.isPageReady = true;
          Toast("Component structure table loaded successfully.");
        } else {
          this.isPageReady = true;
          WarningToast("0 item found under this catagroy. Please add one.");
        }
        this.isReady = false;
      }
    }).catch(e => {
      this.isPageReady = true;
      this.isReady = false;
    });
  }



  bindData(data: any) {
    if(data) {
      if(data.length > 0) {
        this.salaryComponentFields = data
        this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsOpted);
        Toast("Component structure table loaded successfully.");
      } else {
        WarningToast("0 item found under this catagroy. Please add one.");
      }

      this.isReady = false;
    }
  }

  openEditModal(data: any) {
    this.isFixedType = false;
    $('#editSalaryMoadl').modal('show');
    this.currentSalaryComponent = data;
    if (this.currentSalaryComponent.Type == 'Fixed')
      this.isFixedType = true;
    this.salaryComponent();
  }

  addComponentModal() {
    $('#addComponentModal').modal('show');
  }

  salaryComponent() {
    this.editSalaryComponent = this.fb.group({
      ComponentType: new FormControl(this.currentSalaryComponent.Type),
      IsComponentEnable: new FormControl(this.currentSalaryComponent.IsComponentEnable),
      ComponentName: new FormControl(this.currentSalaryComponent.ComponentFullName),
      MaxLimit: new FormControl(this.currentSalaryComponent.MaxLimit),
      IsAllowtoOverride: new FormControl(this.currentSalaryComponent.IsAllowtoOverride),
      Section: new FormControl(this.currentSalaryComponent.Section),
      IsOpted: new FormControl(this.currentSalaryComponent.IsOpted),
      TaxExempt: new FormControl(this.currentSalaryComponent.TaxExempt),
      RequireDocs: new FormControl(this.currentSalaryComponent.RequireDocs),
      ComponentCatagoryId: new FormControl(this.currentSalaryComponent.ComponentCatagoryId),
      IncludeInPayslip: new FormControl(this.currentSalaryComponent.IncludeInPayslip)
    })
  }


  addComponent(event: any, item: any) {
    if (event.target.checked == true) {
      item.IsOpted = true;
      item.ComponentCatagoryId = 1;
      item.IncludeInPayslip = true;
      this.AddActiveComponent.push(item)
    } else {
      let current = this.AddActiveComponent.find(x => x.ComponentId == item.ComponentId);
      if(current) {
        current.IsOpted = false;
        item.IncludeInPayslip = false;
        item.ComponentCatagoryId = 0;
      } else {
        item.IsOpted = false;
        item.ComponentCatagoryId = 0;
        item.IncludeInPayslip = false;
        this.AddActiveComponent.push(item)
      }
    }
  }
  submitComponents() {
    this.isLoading = true;
    if (this.AddActiveComponent.length > 0) {
      this.http.post("Settings/ActivateCurrentComponent", this.AddActiveComponent).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.bindData(response.ResponseBody);
          Toast("Component Added Successfully");
          $('#addComponentModal').modal('hide');
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast ("Please select the recurring components")
    }
  }

  getComponentData(data: SalaryComponentFields) {
    if (data) {
      this.recurringComponent.push(data);
    }
  }

  activePage(page: number) {
    if (page > 0 && page <3) {
      switch (page) {
        case 2:
          this.ActivatedPage = 2;
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
      document.getElementById('progressbar').style.width = ((page - 1) *100).toString() + '%';
    }
  }

  inactiveComponentModal(item: any) {
    this.inactiveComponentDeatil = item;
    $('#inactiveComponentModal').modal('show');
  }

  inactiveComponent() {
    this.inactiveComponentDeatil.IsOpted = false;
    this.inactiveComponentDeatil.ComponentCatagoryId = 0;
    let inactiveComponent = [];
    inactiveComponent.push(this.inactiveComponentDeatil);
    this.http.post(`Settings/ActivateCurrentComponent`, inactiveComponent)
    .then(res => {
      if(res.ResponseBody) {
        this.bindData(res.ResponseBody);
        $('#inactiveComponentModal').modal('hide');
        Toast("Component detail updated successfully");
        this.isLoading = false;
      } else {
        Toast("Fail to update. Please contact to admin.");
      }

      $('#editSalaryMoadl').modal('hide');
    }).catch(e => {
      this.isLoading = false;
    });
  }

  updateChanges() {
    this.isLoading = true;
    this.isReady = true;
    let value = this.editSalaryComponent.value;

    this.salaryComponentFields = [];
    this.http.put(`Settings/UpdateSalaryComponentDetail/${this.currentSalaryComponent.ComponentId}`, value)
    .then(res => {
      if(res.ResponseBody) {
        this.bindData(res.ResponseBody);
        this.isLoading = false;
        Toast("Component detail updated successfully");
      } else {
        Toast("Fail to update. Please contact to admin.");
      }

      $('#editSalaryMoadl').modal('hide');
    }).catch(e => {
      this.isLoading = false;
    });
  }


  filterComponent(e: any) {
    let value = e.target.value.toUpperCase();
    if (value) {
      this.salaryComponentFields = this.allSalaryCOmponents.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1);
    } else
      this.salaryComponentFields = this.allSalaryCOmponents;
  }

  filterAdHocComponent(e: any) {
    let value = e.target.value.toUpperCase();
    if (value && value != '') {
      this.allAdHocComponent = this.allAdHocComponent.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1);
    }
  }

  filterFixedComponent(e: any) {
    let value = e.target.value.toUpperCase();
    let data = this.salaryComponentFields.filter(x => x.IsOpted);
    if (value) {
      this.salaryComponentActiveFields = data.filter(x => x.ComponentId.toUpperCase().indexOf(value) != -1 || x.ComponentFullName.toUpperCase().indexOf(value) != -1);
    } else
      this.salaryComponentActiveFields = data;
  }

  resetFixedCompFilter(e: any) {
    e.target.value = '';
    this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsOpted);
  }

  resetFilter(e: any) {
    e.target.value = '';
    this.salaryComponentFields = this.allSalaryCOmponents;
    //this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsOpted);
  }

  resetAdHocFilter(e: any) {
    e.target.value = '';
    this.allAdHocComponent = this.salaryComponentFields.filter(x => x.IsAdHoc == true && x.AdHocId > 0);
  }

  selectIncludepayslip(e: any, item: any) {
    if (item) {
      this.isLoading = true;
      if (e.target.checked)
        item.IncludeInPayslip = true;
      else
        item.IncludeInPayslip = false;

      this.http.put(`Settings/UpdateGroupSalaryComponentDetail/${item.ComponentId}/${this.currentGroup.SalaryGroupId}`, item).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          this.isLoading = false;
          Toast('Updated Successfully')
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }
}

export class SalaryComponentFields {
  ComponentDescription: string = '';
  ComponentId: string = "";
  Type: string = '';
  TaxExempt: string = '';
  MaxLimit: string = null;
  PercentageValue: number = null;
  RequireDocs: boolean = false;
  IndividualOverride: boolean = false;
  IsComponentEnable: boolean = true;
  IsAllowtoOverride: boolean = true;
  CalculateInPercentage: boolean = false;
  Section?: string = '';
  Formula: string = null;
  IsActive: boolean = false;
  EmployerContribution: number = 0;
  EmployeeContribution: number = 0;
  IncludeInPayslip: boolean = false;
  IsOpted: boolean = false;
  ComponentFullName: string = '';
  ComponentCatagoryId?: number = 0;
}

export class AdHocComponentsModal {
  ComponentName: string = null;
  ComponentTypeId: number = 0;
  TaxExempt: boolean = false;
  ComponentDescription: string = null;
  Section: string = null;
  SectionMaxLimit: number = 0;
  IsAffectinGross: boolean = false;
  ComponentId: string = '';
  ComponentFullName: string = '';
  AdHocId: number = 0;
  IsAdHoc: boolean = false;
  ComponentCatagoryId: number = 0;
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
