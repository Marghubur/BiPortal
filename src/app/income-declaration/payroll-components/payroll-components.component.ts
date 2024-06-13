import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { SalaryDeclarationHttpService } from 'src/providers/AjaxServices/salary-declaration-http.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { PayrollSettings } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-payroll-components',
  templateUrl: './payroll-components.component.html',
  styleUrls: ['./payroll-components.component.scss']
})
export class PayrollComponentsComponent implements OnInit {
  active = 1;
  NewSalaryForm: FormGroup;
  AdhocForm: FormGroup;
  DeductionForm: FormGroup;
  BonusForm:FormGroup;
  ComponentType: string = '';
  isLoading: boolean = false;
  isTaxExempt: boolean = false;
  RecurringComponent: Array<any> = [];
  AllComponents: Array<any> = [];
  CurrentRecurringComponent: PayrollComponentsModal = new PayrollComponentsModal();
  submitted: boolean = false;
  AdhocAllowance: Array<PayrollComponentsModal> = [];
  AdhocDeduction: Array<PayrollComponentsModal> = [];
  AdhocBonus: Array<PayrollComponentsModal> = [];
  movableComponent: Array<any> = [];
  isReady = false;
  isUploadFile: boolean = true;
  fileSize: string;
  fileName: string;
  isFileReady: boolean = false;
  file: File;
  isDisable: boolean = true;
  addHocComponent: PayrollComponentsModal = new PayrollComponentsModal();
  companyId: number = 0;
  sampleFilePath: string = null;
  basePath: string = null;

  constructor(private fb: FormBuilder,
              private http: CoreHttpService,
              private salaryHttp: SalaryDeclarationHttpService,
              private nav:iNavigation) { }

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
    this.initData();
  }

  initData() {
    let data = this.nav.getValue();
    this.initadhocForm();
    this.initdeductionForm();
    this.initbonusForm();
    this.loadData();

    if (data > 0) {
      this.companyId = data;
      this.ComponentType = '';
    }
  }

  pageReload() {
    this.active = 1;
    this.initData();
  }

  loadData() {
    this.isReady = false;
    this.salaryHttp.get("SalaryComponent/GetSalaryComponentsDetail").then((response:ResponseModel) => {
      if (response.ResponseBody && response.ResponseBody.length > 0) {
        this.AllComponents = response.ResponseBody;
        this.RecurringComponent = this.AllComponents.filter (x => x.IsAdHoc == false);
        this.AdhocAllowance =  this.AllComponents.filter (x => x.IsAdHoc == true && x.AdHocId == 1);
        this.AdhocBonus =  this.AllComponents.filter (x => x.IsAdHoc == true && x.AdHocId == 2);
        this.AdhocDeduction =  this.AllComponents.filter (x => x.IsAdHoc == true && x.AdHocId == 3);
        this.initForm();
        Toast("Record found");
        this.isReady = true;
      }
    })
  }

  addToAdhoc(item: any) {
    if (item) {
      this.movableComponent.push({
        ComponentId: item.ComponentId,
        IsAdHoc: true
      });
    }
  }

  moveToAdhoc() {
    if (this.movableComponent.length > 0) {

    }
  }

  get f() {
    return this.NewSalaryForm.controls;
  }

  initadhocForm() {
    this.AdhocForm = this.fb.group({
      ComponentName: new FormControl('', [Validators.required]),
      ComponentDescription: new FormControl('', [Validators.required]),
      ComponentFullName: new FormControl('', [Validators.required]),
      TaxExempt: new FormControl(false),
      Section: new FormControl(''),
      IsAdHoc: new FormControl(true),
      SectionMaxLimit: new FormControl(0),
      AdHocId: new FormControl(1)
    });
  }

  initForm() {
    this.NewSalaryForm = this.fb.group({
      ComponentName: new FormControl(this.CurrentRecurringComponent.ComponentId, [Validators.required]),
      ComponentTypeId: new FormControl(this.CurrentRecurringComponent.ComponentTypeId, [Validators.required]),
      TaxExempt: new FormControl(this.CurrentRecurringComponent.TaxExempt),
      MaxLimit: new FormControl(this.CurrentRecurringComponent.MaxLimit),
      RequireDocs: new FormControl(this.CurrentRecurringComponent.RequireDocs),
      ComponentDescription: new FormControl(this.CurrentRecurringComponent.ComponentDescription),
      ComponentFullName: new FormControl(this.CurrentRecurringComponent.ComponentFullName),
      Section: new FormControl(this.CurrentRecurringComponent.Section),
      SectionMaxLimit: new FormControl(this.CurrentRecurringComponent.SectionMaxLimit),
      IsAdHoc: new FormControl(this.CurrentRecurringComponent.IsAdHoc),
      ComponentCatagoryId: new FormControl(this.CurrentRecurringComponent.ComponentCatagoryId == 1? '1': this.CurrentRecurringComponent.ComponentCatagoryId == 6? '6': null, [Validators.required])
    });
  }



  initdeductionForm() {
    this.DeductionForm = this.fb.group({
      ComponentName: new FormControl('', [Validators.required]),
      ComponentDescription: new FormControl('', [Validators.required]),
      ComponentFullName: new FormControl('', [Validators.required]),
      IsAffectinGross: new FormControl(false),
      IsAdHoc: new FormControl(true),
      AdHocId: new FormControl(3)
    });
  }

  initbonusForm() {
    this.BonusForm = this.fb.group({
      ComponentId: new FormControl('', [Validators.required]),
      ComponentDescription: new FormControl('', [Validators.required]),
      ComponentFullName: new FormControl('', [Validators.required]),
      AdHocId: new FormControl(0)
    });
  }

  selectComponentType(e: any) {
    let value = e.target.value;
    if (value) {
      this.ComponentType = value;
    }
  }

  newComponentPopUp() {
    this.submitted = false;
    this.ComponentType = '';
    this.CurrentRecurringComponent = new PayrollComponentsModal();
    this.initForm();
    $('#NewComponentModal').modal('show');
  }

  AdhocPopUp() {
    this.AdhocForm.reset();
    this.submitted = false;
    $('#CreateAdhocModal').modal('show');
  }

  BonusPopUp() {
    this.BonusForm.reset();
    this.submitted = false;
    $('#CreateBonusModal').modal('show');
  }

  DeductionPopUp() {
    this.DeductionForm.reset();
    this.submitted = false;
    $('#CreateDeductionModal').modal('show');
  }

  editRecurring(item: any) {
    this.submitted = false;
    this.ComponentType = '';
    if (item) {
      this.CurrentRecurringComponent = item;
      if (item.ComponentTypeId != 0)
        this.ComponentType = item.ComponentTypeId;

      if(item.TaxExempt == true)
        this.isTaxExempt = true;
      else
        this.isTaxExempt = false;
      this.initForm();
      $('#NewComponentModal').modal('show');
    } else {
      ErrorToast("Please select salary component first.")
    }
  }

  addNewComp() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.NewSalaryForm.get('ComponentName').errors !== null)
      errroCounter++;

    if (this.NewSalaryForm.get('ComponentTypeId').errors !== null)
      errroCounter++;

    if (this.NewSalaryForm.get('ComponentCatagoryId').errors !== null)
      errroCounter++;

    if (errroCounter === 0) {
      let value:PayrollComponentsModal = this.NewSalaryForm.value;
      if (value) {
        this.salaryHttp.post("SalaryComponent/AddUpdateRecurringComponents", value).then((response:ResponseModel) => {
          if (response.ResponseBody) {
            let data = response.ResponseBody;
            if (data.length > 0) {
              this.RecurringComponent = data;
              this.AllComponents = data;
              this.NewSalaryForm.reset();
            }
            $('#NewComponentModal').modal('hide');
            Toast("Component added/updated successfully.");
            this.submitted = false;
            this.isLoading = false;
          }
        }).catch(e => {
          this.isLoading = false;
          ErrorToast("Fail to add component. Please contact to admin.");
        });
      }
    } else {
      this.isLoading = false;
    }
  }

  addNewAdhocAllowance() {
    this.isLoading = true;
    this.submitted = true;
    let value = this.AdhocForm.value;
    value.IsAdHoc = true;
    value.AdHocId = 1;
    if (value.TaxExempt == null || value.TaxExempt == "")
      value.TaxExempt = false;

    if (value.SectionMaxLimit == null)
      value.SectionMaxLimit = 0;

    if (this.AdhocForm.invalid) {
      ErrorToast("Please fill all the manditory fields");
      this.isLoading = false;
      return;
    }

    if (value) {
      this.http.post("SalaryComponent/AddAdhocComponents", value).then((response:ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody.length > 0) {
          this.AdhocAllowance = response.ResponseBody.filter(x => x.IsAdHoc == true && x.AdHocId == 1);
          $('#CreateAdhocModal').modal('hide');
          Toast("Component added successfully.")
          this.isLoading = false;
        } else
          ErrorToast("Fail to add adhoc allowance component. Please contact to admin.")
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  addNewDeduction() {
    this.isLoading = true;
    this.submitted = true;
    let value = this.DeductionForm.value;
    value.AdHocId = 3;
    value.IsAdHoc = true;
    if (value.IsAffectinGross == null || value.IsAffectinGross == "")
      value.IsAffectinGross = false;

    if (this.DeductionForm.invalid) {
      ErrorToast("Please fill all the manditory fields");
      this.isLoading = false;
      return;
    }

    if (value) {
      this.salaryHttp.post("SalaryComponent/AddDeductionComponents", value).then((response:ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody.length > 0) {
          this.AdhocDeduction = response.ResponseBody.filter(x => x.IsAdHoc == true && x.AdHocId == 3);
          $('#CreateDeductionModal').modal('hide');
          Toast("Component added successfully.")
          this.isLoading = false;
        } else
          ErrorToast("Fail to add deduction component. Please contact to admin.")
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  addNewBonus() {
    this.isLoading = true;
    this.submitted = true;
    if (this.BonusForm.invalid) {
      ErrorToast("Please fill all the manditory fields");
      this.isLoading = false;
      return;
    }
    let value = this.BonusForm.value;
    value.AdHocId = 0;
    if (value) {
      this.salaryHttp.post("SalaryComponent/AddBonusComponents", value).then((response:ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody.length > 0) {
          this.AdhocBonus = response.ResponseBody.filter(x => x.IsAdHoc == true && x.AdHocId == 2);
          $('#CreateBonusModal').modal('hide');
          Toast("Component added successfully.")
          this.isLoading = false;
        } else
          ErrorToast("Fail to add bonus component. Please contact to admin.")
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  enableTaxExempt(e: any) {
    let value = e.target.checked;
    if (value == true) {
      this.isTaxExempt = true;
      this.NewSalaryForm.controls['SectionMaxLimit'].setValidators(Validators.required);
      this.NewSalaryForm.controls['SectionMaxLimit'].updateValueAndValidity();
      this.NewSalaryForm.controls['Section'].setValidators(Validators.required);
      this.NewSalaryForm.controls['Section'].updateValueAndValidity();
    }
    else {
      this.isTaxExempt = false;
      this.NewSalaryForm.controls['SectionMaxLimit'].removeValidators(Validators.required);
      this.NewSalaryForm.controls['SectionMaxLimit'].updateValueAndValidity();
      this.NewSalaryForm.controls['Section'].removeValidators(Validators.required);
      this.NewSalaryForm.controls['Section'].updateValueAndValidity();
    }
  }

  filterRecords(e: any) {
    this.isReady = false;
    let text = e.target.value.toUpperCase();
    this.RecurringComponent = this.AllComponents.filter (x => (x.ComponentFullName.indexOf(text) != -1 || x.ComponentId.indexOf(text) != -1) && (x.IsAdHoc == false));
    this.isReady = true;
  }

  reloadAllRecurring(e: any) {
    this.isReady = false;
    e.target.value = '';
    this.RecurringComponent = this.AllComponents.filter (x => x.IsAdHoc == false);
    this.isReady = true;
  }

  excelSheetModal() {
    this.cleanFileHandler();
    $('#excelSheetModal').modal('show');
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.fileSize = (this.file.size / 1024).toFixed(2);
      this.fileName = this.file.name;
      this.isFileReady = true;
      this.isDisable = false;
      this.isUploadFile = false;
    }
  }

  excelfireBrowserFile() {
    $("#uploadexcel").click();
  }

  cleanFileHandler() {
    event.stopPropagation();
    event.preventDefault();
    $("#uploadexcel").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.isDisable = true;
    this.isUploadFile = true;
  }

  uploadExcelSheet() {
    this.isLoading = true;
    if (this.file) {
      let formData = new FormData();
      formData.append("componentdata", this.file);
      this.salaryHttp.post("SalaryComponent/InsertUpdateSalaryComponentsByExcel", formData)
      .then((response: ResponseModel) => {
        if (response.ResponseBody) {
          let data = response.ResponseBody;
          if (data.length > 0) {
            this.RecurringComponent = data;
            this.AllComponents = data;
            this.cleanFileHandler();
            $('#excelSheetModal').modal('hide');
            Toast("Data Uploaded successfull");
            this.isLoading = false;
          }
        } else {
          ErrorToast("Unable to upload the data");
        }
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      WarningToast("Please upload atleast one record");
    }
  }

  getComponentSampleFile() {
    this.sampleFilePath = "https://www.emstum.com/bot/dn/Files/ApplicationFiles/SampleExcel/ComponentsSample.xlsx";
    const a = document.createElement('a');
    a.href = this.sampleFilePath;
    a.download = 'HolidaySample.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(this.sampleFilePath);
  }

  get b() {
    return this.BonusForm.controls;
  }

  get a() {
    return this.AdhocForm.controls;
  }

  get d() {
    return this.DeductionForm.controls;
  }
}

export class PayrollComponentsModal {
  ComponentName: string = null;
  ComponentTypeId: number = null;
  TaxExempt: boolean = false;
  MaxLimit: number = 0;
  RequireDocs: boolean = false;
  ComponentDescription: string = null;
  Section: string = null;
  SectionMaxLimit: number = 0;
  IsAffectinGross: boolean = false;
  ComponentId: string = '';
  ComponentFullName: string = '';
  AdHocId: number = 0;
  IsAdHoc: boolean = false;
  ComponentCatagoryId: number = null;
}
