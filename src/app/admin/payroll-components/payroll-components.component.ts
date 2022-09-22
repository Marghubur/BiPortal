import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService, tableConfig } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { Settings } from 'src/providers/constants';
import { Dictionary } from 'src/providers/Generic/Code/Dictionary';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter } from 'src/providers/userService';
import { read, utils } from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-payroll-components',
  templateUrl: './payroll-components.component.html',
  styleUrls: ['./payroll-components.component.scss']
})
export class PayrollComponentsComponent implements OnInit {
  active = 1;
  activetab = 2;
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
  noOfRecords: number;
  recordToUpload: any;
  ws: any;
  file: File;
  tableConfiguration: tableConfig = null;
  isAvailable: boolean = false;
  uploadedCandidatesData: Filter = null;
  isDisable: boolean = true;
  SalaryComponentsDetail: Array<any> = [];
  expandedTable: boolean = true;
  addHocComponent: PayrollComponentsModal = new PayrollComponentsModal();
  companyId: number = 0;

  constructor(private fb: FormBuilder,
              private http: AjaxService,
              private nav:iNavigation) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    this.initadhocForm();
    this.initdeductionForm();
    this.initbonusForm();
    this.loadData();

    if (data > 0) {
      this.companyId = data;
      this.ComponentType = '';
    }// else {
    //   ErrorToast("Company was not selected. Please visit page again.");
    // }
  }

  navigate() {
    this.nav.navigate(Settings, null)
  }

  loadData() {
    this.isReady = false;
    this.http.get("SalaryComponent/GetSalaryComponentsDetail").then((response:ResponseModel) => {
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
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl(''),
      ComponentFullName: new FormControl(''),
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
      ComponentCatagoryId: new FormControl(this.CurrentRecurringComponent.ComponentCatagoryId == 1? '1': this.CurrentRecurringComponent.ComponentCatagoryId == 6? '6': '')
    });
  }



  initdeductionForm() {
    this.DeductionForm = this.fb.group({
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl(''),
      ComponentFullName: new FormControl(''),
      IsAffectinGross: new FormControl(false),
      IsAdHoc: new FormControl(true),
      AdHocId: new FormControl(3)
    });
  }

  initbonusForm() {
    this.BonusForm = this.fb.group({
      ComponentName: new FormControl(''),
      ComponentDescription: new FormControl(''),
      ComponentFullName: new FormControl(''),
      IsAdHoc: new FormControl(true),
      AdHocId: new FormControl(2)
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
    $('#CreateAdhocModal').modal('show');
  }

  BonusPopUp() {
    this.BonusForm.reset();
    $('#CreateBonusModal').modal('show');
  }

  DeductionPopUp() {
    this.DeductionForm.reset();
    $('#CreateDeductionModal').modal('show');
  }

  editRecurring(item: any) {
    this.submitted = false;
    this.ComponentType = '';
    if (item) {
      this.CurrentRecurringComponent = item;
      if (item.ComponentTypeId != 0)
        this.ComponentType = item.ComponentTypeId;

      if(item.TaxExempt == 'true')
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
        this.http.post("SalaryComponent/AddUpdateRecurringComponents", value).then((response:ResponseModel) => {
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
    }
  }

  addNewAdhocAllowance() {
    this.isLoading = true;
    let value = this.AdhocForm.value;
    value.IsAdHoc = true;
    value.AdHocId = 1;
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
    let value = this.DeductionForm.value;
    value.AdHocId = 3;
    value.IsAdHoc = true;
    if (value) {
      this.http.post("SalaryComponent/AddDeductionComponents", value).then((response:ResponseModel) => {
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
    let value: PayrollComponentsModal = this.BonusForm.value;
    value.AdHocId = 2;
    value.IsAdHoc = true;
    if (value) {
      this.http.post("SalaryComponent/AddBonusComponents", value).then((response:ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody.length > 0) {
          this.AdhocBonus = response.ResponseBody.filter(x => x.IsAdHoc == true && x.AdHocId == 3);
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
    if (value == true)
      this.isTaxExempt = true;
    else
      this.isTaxExempt = false;
  }

  filterRecords(e: any) {
    this.isReady = false;
    let text = e.target.value.toUpperCase();
    this.RecurringComponent = this.AllComponents.filter (x => x.ComponentFullName.indexOf(text) != -1 || x.ComponentId.indexOf(text) != -1);
    this.isReady = true;
  }

  reloadAllRecurring(e: any) {
    this.isReady = false;
    e.target.value = '';
    this.RecurringComponent = this.AllComponents.filter (x => x.IsAdHoc == false);
    this.isReady = true;
  }

  excelSheetModal() {
    $('#excelSheetModal').modal('show');
  }

  readExcelData(e: any) {
    this.file = e.target.files[0];
    if (this.file !== undefined && this.file !== null) {
      this.convertToJson(false).then(data => {
        if (data) {
          this.recordToUpload = data;
          this.fileSize = (this.file.size / 1024).toFixed(2);
          this.fileName = this.file.name;
          this.noOfRecords = this.recordToUpload.length;
          this.isFileReady = true;
          this.isDisable = false;
          this.isUploadFile = false;
          let excelData = data.mapTable[0];
          let rows: any = excelData;
          if (excelData) {
            this.tableConfiguration = new tableConfig();
            this.tableConfiguration.totalRecords = 1;
            this.tableConfiguration.header = excelData.value.Keys;
            this.tableConfiguration.data = rows.value.Data;
            // this.uploadedCandidatesData.TotalRecords = 0;
            // if(this.tableConfiguration.data.length > 0) {
            //   this.uploadedCandidatesData.TotalRecords = this.tableConfiguration.data.length;
            // }
            this.SalaryComponentsDetail = this.tableConfiguration.data;
            this.tableConfiguration.isEnableAction = true;
            this.isAvailable = true;
          }
        } else {
          this.cleanFileHandler();
          ErrorToast("Excel data is not valid.");
        }
      });
    }
  }

  convertToJson(onlyHeader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      let workbookkk;
      let XL_row_object;
      let TempDictionary = new Dictionary<string, any>();
      reader.readAsBinaryString(this.file);
      reader.onload = function () {
        let data = reader.result;
        workbookkk = read(data, { type: "binary" });
        workbookkk.SheetNames.forEach(function (sheetName) {
          XL_row_object = utils.sheet_to_json(workbookkk.Sheets[sheetName]);
          let position = TempDictionary.hasKey(sheetName);
          if (
            position === -1 &&
            XL_row_object !== null &&
            XL_row_object.length > 0
          ) {
            let RowDetail = XL_row_object[0];
            let ColumnDetail = [];
            if (RowDetail !== null) {
              if (typeof RowDetail === "object") {
                let Keys = Object.keys(RowDetail);
                let index = 0;
                let Type = "";
                while (index < Keys.length) {
                  Type = typeof RowDetail[Keys[index]];
                  if (
                    Type === "undefined" ||
                    RowDetail[Keys[index]] === null ||
                    RowDetail[Keys[index]] == ""
                  ) {
                    Type = "string";
                  }
                  ColumnDetail.push({
                    ColumnName: Keys[index],
                    ColumnType: Type
                  });
                  index++;
                }
              }
            }
            let SheetData = {
              Keys: ColumnDetail,
              Data: onlyHeader ? null : XL_row_object
            };
            TempDictionary.insert(sheetName, SheetData);
          }
          resolve(TempDictionary);
        });
      };
    });
  }

  expandTable() {
    this.expandedTable = false;
  }
  closeExpandModel(){
    this.expandedTable = true;
  }

  excelfireBrowserFile() {
    $("#uploadexcel").click();
  }

  cleanFileHandler() {
    $("#uploadexcel").val("");
    this.fileSize = "";
    this.fileName = "";
    this.isFileReady = false;
    this.noOfRecords = 0;
    event.stopPropagation();
    event.preventDefault();
    this.isAvailable=false;
    this.isDisable = true;
    this.isUploadFile = true;
  }

  uploadExcelSheet($e: any) {
    this.isLoading = true;
    $e.preventDefault();
    $e.stopPropagation();
    let errroCounter = 0;
    let i = 0;
    while (i < this.SalaryComponentsDetail.length) {
      let componentId = this.SalaryComponentsDetail.filter(x => x.ComponentId == this.SalaryComponentsDetail[i].ComponentId);
      let componentname = this.SalaryComponentsDetail.filter(x => x.ComponentFullName == this.SalaryComponentsDetail[i].ComponentFullName && x.Section == this.SalaryComponentsDetail[i].Section);
      if (componentId.length > 1 || componentname.length > 1) {
        ErrorToast("Component Name or Component Full Name are duplicate.");
        errroCounter ++;
      }
      i++;
    }

    if (errroCounter === 0 && this.SalaryComponentsDetail.length > 0) {
      this.http.post("SalaryComponent/InsertUpdateSalaryComponentsByExcel", this.SalaryComponentsDetail)
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
      WarningToast("Please upload atleast one record");
    }
  }
}

export class PayrollComponentsModal {
  ComponentName: string = null;
  ComponentTypeId: number = 0;
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
  ComponentCatagoryId: number = 0;
}
