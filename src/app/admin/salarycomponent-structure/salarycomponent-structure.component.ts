import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-salarycomponent-structure',
  templateUrl: './salarycomponent-structure.component.html',
  styleUrls: ['./salarycomponent-structure.component.scss']
})
export class SalarycomponentStructureComponent implements OnInit {
  ActivatedPage: number = 1;
  salaryComponentFields: Array<SalaryComponentFields> = [];
  salaryComponentActiveFields: Array<SalaryComponentFields> = [];
  currentSalaryComponent: SalaryComponentFields = null;
  editSalaryComponent: FormGroup;
  addComponentForm: FormGroup;
  isFixedType: boolean = false;
  recurringComponent:Array<any> = [];
  isLoading: boolean = false;
  componentTypeId: number = -1;
  isReady: boolean = false;
  AddActiveComponent: Array<SalaryComponentFields> = [];

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.ActivatedPage = 1;
    this.currentSalaryComponent = new SalaryComponentFields();
    this.salaryComponent();
    this.loadOnChange();
  }

  loadOnChange() {
    this.isReady = false;
    this.http.get(`Settings/FetchActiveComponents`)
    .then(res => {
      if(res.ResponseBody) {
        if(res.ResponseBody.length > 0) {
          this.salaryComponentFields = res.ResponseBody
          this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsActive);
          Toast("Component structure table loaded successfully.");
        } else {
          WarningToast("0 item found under this catagroy. Please add one.");
        }

        this.isReady = false;
      }
    });
  }

  bindData(data: any) {
    if(data) {
      if(data.length > 0) {
        this.salaryComponentFields = data
        this.salaryComponentActiveFields = this.salaryComponentFields.filter(x => x.IsActive);
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
      IsActive: new FormControl(this.currentSalaryComponent.IsActive),
      TaxExempt: new FormControl(this.currentSalaryComponent.TaxExempt),
      RequireDocs: new FormControl(this.currentSalaryComponent.RequireDocs)
    })
  }


  addComponent(event: any, item: any) {
    if (event.target.checked == true) {
      item.IsActive = true;
      this.AddActiveComponent.push(item)
    } else {
      let current = this.AddActiveComponent.find(x => x.ComponentId == item.ComponentId);
      if(current) {
        current.IsActive = false;
      } else {
        item.IsActive = false;
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
        }
      })
    } else {
      ErrorToast ("Please select the recurring components")
    }
    this.isLoading = false;
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
    $('#inactiveComponentModal').modal('show');
  }

  inactiveComponent() {

  }

  updateChanges() {
    this.isLoading = true;
    this.isReady = true;
    let value = this.editSalaryComponent.value;

    this.salaryComponentFields = [];
    this.http.put(`Settings/EnableSalaryComponentDetail/${this.currentSalaryComponent.ComponentId}`, value)
    .then(res => {
      if(res.ResponseBody) {
        this.bindData(res.ResponseBody);
        Toast("Component detail updated successfully");
      } else {
        Toast("Fail to update. Please contact to admin.");
      }

      this.isLoading = false;
      $('#editSalaryMoadl').modal('hide');
    });
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
}

