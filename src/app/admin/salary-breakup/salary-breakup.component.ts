import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, ToFixed } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-salary-breakup',
  templateUrl: './salary-breakup.component.html',
  styleUrls: ['./salary-breakup.component.scss']
})
export class SalaryBreakupComponent implements OnInit {
  salaryBreakupForm: FormGroup = null;
  isLoading: boolean = false;
  employeeUid: number = 0;
  salaryGroupId: number = 0;
  salaryComponents: Array<any> = [];
  isSalaryGroup: boolean = false;
  salaryGroup: any = null;
  isReady: boolean = false;
  salaryDetail: any = null;
  employeeCTC: number = 0;
  employeeDetails: any = null;
  annualCTC: number = 0;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private nav: iNavigation) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data) {
      this.employeeDetails = data;
      this.employeeUid = data.EmployeeUid;
      if(!data.CTC)
        data.CTC = 0;
      this.employeeCTC = data.CTC;
      this.loadData();
    } else {
      ErrorToast("Invalid employee selected")
    }
  }

  loadData() {
    this.isSalaryGroup = false;
    this.isReady = false;
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.employeeUid}`).then(res => {
      if(res.ResponseBody) {
        this.salaryDetail = res.ResponseBody;
        if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}') {
          this.salaryComponents = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
          this.isReady = true;
        } else {
          this.salaryComponents = [];
        }
      } else {
          this.salaryDetail = {
            EmployeeId: 0,
            CTC: 0,
            GrossIncome: 0,
            NetSalary: 0,
            CompleteSalaryDetail: null,
            GroupId: 0,
            TaxDetail: null
          };
      }

      this.initForm();
      this.isSalaryGroup = true;
    });
  }

  saveSalaryBreakup() {
    this.isLoading = true;
    let value = this.salaryBreakupForm.value;
    if (value) {
      let empSalary = {
        EmployeeId: this.employeeUid,
        CTC: value.ExpectedCTC,
        GrossIncome: value.GrossAnnually,
        NetSalary: 0,
        GroupId: this.salaryGroupId
      }
      let formData = new FormData();
      formData.append('completesalarydetail', JSON.stringify(value));
      formData.append('salarydeatil', JSON.stringify(empSalary));
      this.http.post(`SalaryComponent/InsertUpdateSalaryBreakUp/${this.employeeUid}`, formData).then(res => {
        if (res.ResponseBody) {
          Toast("Salary breakup added successfully.");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  initForm() {
    this.salaryBreakupForm = this.fb.group({
      Components: this.buildItems()
    });
  }

  buildItems(): FormArray {
    let itemArray = this.fb.array(
      this.salaryComponents.map((elem, index) => {
        return this.addGroupItems(elem)
      })
    );

    return itemArray;
  }

  addGroupItems(item: any): FormGroup {
    return this.fb.group({
      ComponentId: new FormControl(item.ComponentId),
      ComponentName: new FormControl(item.ComponentName),
      FinalAmount: new FormControl(item.FinalAmount),
      AnnualAmount: new FormControl(item.FinalAmount * 12),
    });
  }


  calculateSalary() {
    this.annualCTC = Number(this.annualCTC);
    if (!isNaN(this.annualCTC) && this.annualCTC > 0) {
      this.salaryCalculation();
    }
  }

  salaryCalculation() {
    if (this.annualCTC > 0) {
      this.isSalaryGroup = true;
      this.http.get(`SalaryComponent/SalaryBreakupCalc/${this.employeeUid}/${this.annualCTC}`)
      .then(res => {
        if (res.ResponseBody) {
          let components = res.ResponseBody.filter(x => x.ComponentId != 'GROSSINCOME');
          if (components.length > 0) {
            this.salaryComponents = res.ResponseBody;
            this.initForm();
          } else {
            ErrorToast("Fail to get salary comonents. Please contact to admin.");
          }

          this.isReady = true;
        }
      })
    }
  }
}
