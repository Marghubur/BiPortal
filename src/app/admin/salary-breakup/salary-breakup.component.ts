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
      let completeSalaryDetail = [];
      if(res.ResponseBody) {
        this.salaryDetail = res.ResponseBody;
        if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}') {
          completeSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        } else {
          ErrorToast("Fail to get salary detail. Please contact to admin.");
          return;
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

      this.buildAndBindData(completeSalaryDetail);
    });
  }

  buildAndBindData(completeSalaryDetail: any) {
    if (completeSalaryDetail && completeSalaryDetail.length > 0) {
      let presentMonth = new Date().getMonth() + 1;
      let singleDetail = completeSalaryDetail.find(x => x.MonthNumber == presentMonth);

      if (singleDetail) {
        this.salaryComponents = singleDetail.SalaryBreakupDetails;
        this.isReady = true;
      } else {
        ErrorToast("Fail to get salary detail. Please contact to admin.");
        return;
      }
    } else {
      this.salaryComponents = [];
    }

    this.initForm();
    this.isSalaryGroup = true;
  }

  saveSalaryBreakup() {
    this.isLoading = true;
    let value = this.salaryBreakupForm.value;
    if (value) {
      let presentMonth = new Date().getMonth() + 1;
      let presentYear = new Date().getFullYear();
      let formData = new FormData();
      formData.append('completesalarydetail', JSON.stringify(value.Components));
      this.http.post(`SalaryComponent/InsertUpdateSalaryBreakUp/
          ${this.employeeUid}/${presentMonth}/${presentYear}`, formData).then(res => {
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
      Components: this.buildComponents()
    });
  }

  buildComponents(): FormArray {
    let i = 0;
    let elems = [];
    let flag = false;
    let finalItemArray: FormArray = this.fb.array([]);
    while(i < 6) {
      flag = false;
      switch(i) {
        case 0: // fixed
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 2);
          break;
        case 1: // special
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 102);
          flag = true;
          break;
        case 2: // perquisite
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 6);
          break;
        case 3: // gross
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 100);
          flag = true;
          break;
        case 4: // employer
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 7);
          break;
        case 5: // ctc
          elems = this.salaryComponents.filter(x => x.ComponentTypeId == 101);
          flag = true;
          break;
      }

      this.fb.array(
        elems.map((elem, index) => {
          finalItemArray.push(this.addGroupItems(elem, flag))
        })
      );

      i++;
    }

    return finalItemArray;
  }

  addGroupItems(item: any, flag: boolean): FormGroup {
    return this.fb.group({
      ComponentId: new FormControl(item.ComponentId),
      ComponentName: new FormControl(item.ComponentName),
      FinalAmount: new FormControl(item.FinalAmount * 12),
      MonthlyAmount: new FormControl(ToFixed(item.FinalAmount, 2)),
      ComponentTypeId: new FormControl(item.ComponentTypeId),
      IsHighlight: new FormControl(flag),
    });
  }


  calculateSalary() {
    this.employeeCTC = Number(this.employeeCTC);
    if (!isNaN(this.employeeCTC) && this.employeeCTC > 0) {
      this.salaryCalculation();
    }
  }

  salaryCalculation() {
    if (this.employeeCTC > 0) {
      this.isSalaryGroup = true;
      this.http.get(`SalaryComponent/SalaryBreakupCalc/${this.employeeUid}/${this.employeeCTC}`)
      .then(res => {
        if (res.ResponseBody) {
          this.buildAndBindData(res.ResponseBody);
        }
      });
    }
  }
}
