import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-salarycomponent-structure',
  templateUrl: './salarycomponent-structure.component.html',
  styleUrls: ['./salarycomponent-structure.component.scss']
})
export class SalarycomponentStructureComponent implements OnInit {
  ActivatedPage: number = 1;
  salaryComponentFields: Array<SalaryComponentFields> = [];
  currentSalaryComponent: SalaryComponentFields = null;
  editSalaryComponent: FormGroup;
  addComponentForm: FormGroup;
  isFixedType: boolean = false;
  recurringComponent:Array<any> = [];
  isLoading: boolean = false;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.ActivatedPage = 1;
    this.currentSalaryComponent = new SalaryComponentFields();
    this.salaryComponent();
    this.addSalaryComponent();
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
    }]
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
    $('#AddComponentModal').modal('show');
  }

  salaryComponent() {
    this.editSalaryComponent = this.fb.group({
      ComponentType: new FormControl(this.currentSalaryComponent.Type),
      IsComponentEnable: new FormControl(this.currentSalaryComponent.IsComponentEnable),
      ComponentName: new FormControl(this.currentSalaryComponent.ComponentName),
      MaximumLimit: new FormControl(this.currentSalaryComponent.MaxLimit),
      IsAllowtoOverride: new FormControl(this.currentSalaryComponent.IsAllowtoOverride),
      Section: new FormControl(this.currentSalaryComponent.Section)
    })
  }
  addSalaryComponent() {
    this.addComponentForm = this.fb.group({
      ComponentType: new FormControl(''),
      IsComponentEnable: new FormControl(''),
      ComponentName: new FormControl(''),
      MaximumLimit: new FormControl(''),
      Section: new FormControl(''),
      TaxExempt: new FormControl('')
    })
  }

  addComponents() {
    this.isLoading = true;
    if (this.recurringComponent.length > 0) {
      this.http.post("Settings/InsertUpdateSalaryStructure", this.recurringComponent).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast("Component Added Successfully");
          $('#AddComponentModal').modal('hide');
        }
      })
    } else {
      ErrorToast ("Please select the recurring components")
    }
    this.isLoading = false;
  }

  getComponentData(data: SalaryComponentFields) {
    if (data) {
      // this.recurringComponent.push({
      //   text: `${data.ComponentName}`,
      //   value: data
      // });
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
}

export class SalaryComponentFields {
  ComponentName: string = '';
  Type: string = '';
  TaxExempt: string = '';
  MaxLimit: string = '';
  RequireDocs: boolean = false;
  IndividualOverride: boolean = false;
  IsComponentEnable: boolean = true;
  IsAllowtoOverride: boolean = true;
  ComponentValueIn: number = 0;
  Section?: string = '';
}

