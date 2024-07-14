import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { SalaryDeclarationHttpService } from 'src/providers/AjaxServices/salary-declaration-http.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { SalaryComponentItems } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-salary-adjustment',
  templateUrl: './salary-adjustment.component.html',
  styleUrls: ['./salary-adjustment.component.scss']
})
export class SalaryAdjustmentComponent implements OnInit {
  isEmployeeSelected: boolean = false;
  isPageReady: boolean = false;
  salaryComponents: Array<any> = [];
  salaryBreakupComponents: Array<any> = [];
  isLoading: boolean = false;
  selectedData: any = null;
  currentCompny:any = null;
  netSalary: number = 0;
  totalEarning: number = 0;

  constructor(private salaryHttp: SalaryDeclarationHttpService,
              private nav: iNavigation,
              private local: ApplicationStorage) {}

  ngOnInit(): void {
    let data = this.nav.getValue();
    this.currentCompny = this.local.findRecord("Companies")[0];
    if (data) {
      this.selectedData = data;
      this.loadData();
    }
    else
      ErrorToast("Please select employee first");
  }

  loadData() {
    this.isPageReady = false;
    if (this.selectedData.EmployeeId > 0 && this.selectedData.Month > 0) {
      this.salaryHttp.get(`SalaryComponent/GetEmployeeSalaryDetail/${this.selectedData.Month}/${this.selectedData.EmployeeId}`).then((res: ResponseModel) => {
        if (res.ResponseBody) {
          this.salaryBreakupComponents = res.ResponseBody;
          this.bindDate(res.ResponseBody);
          this.isPageReady = true;
        }
      }).catch(e => {

      })
    }
  }

  bindDate(res: Array<any>) {
    this.salaryComponents = [];
    this.salaryComponents.push({
      Label: '',
      Components: res.filter(x => x.ComponentId == SalaryComponentItems.CTC)
    });
    this.salaryComponents.push({
      Label: 'Employer Deduction',
      Components: res.filter(x => x.ComponentId == SalaryComponentItems.EEPF || x.ComponentId == SalaryComponentItems.EESI)
    });
    this.salaryComponents.push({
      Label: 'Actual Gross',
      Components: res.filter(x => x.ComponentId == SalaryComponentItems.Gross)
    });
    this.salaryComponents.push({
      Label: 'Employee Earnings',
      Components: res.filter(x => x.ComponentId != SalaryComponentItems.Gross && x.ComponentId != SalaryComponentItems.CTC && x.ComponentId != SalaryComponentItems.PTAX && x.ComponentId != SalaryComponentItems.EPF && x.ComponentId != SalaryComponentItems.ESI && x.ComponentId != SalaryComponentItems.EEPF && x.ComponentId != SalaryComponentItems.EESI)
    });
    this.salaryComponents.push({
      Label: 'Deduction',
      Components: res.filter(x => x.ComponentId == SalaryComponentItems.PTAX || x.ComponentId == SalaryComponentItems.EPF || x.ComponentId == SalaryComponentItems.ESI)
    });

    this.calculateEarningAndNetSalary();
  }

  calculateEarningAndNetSalary() {
    this.totalEarning = this.salaryComponents.find(x => x.Label == "Employee Earnings").Components.map(x => x.FinalAmount).reduce((acc, next) => {return acc + next;}, 0);
    let totalDeduction = this.salaryComponents.find(x => x.Label == "Deduction").Components.map(x => x.FinalAmount).reduce((acc, next) => {return acc + next;}, 0);

    this.netSalary = this.totalEarning - totalDeduction;
  }

  selectIncludepayslip(e: any, item: any) {
    if (e.target.checked)
      item.IsIncludeInPayslip = true;
    else
      item.IsIncludeInPayslip = false;
  }

  changeSalaryAmount(item: any, e: any) {
    let amount = Number(e.target.value);
    if (item) {
      item.FinalAmount = amount;
      item.Formula = amount.toString();
      if (item.ComponentId == SalaryComponentItems.EESI || item.ComponentId == SalaryComponentItems.EEPF) {
        let ctc = this.salaryBreakupComponents.find(x => x.ComponentId == SalaryComponentItems.CTC).FinalAmount;
        let grossComponent = this.salaryComponents.find(x => x.Label == 'Actual Gross').Components[0];
        let deductionAmount = this.salaryComponents.find(x => x.Label == "Employer Deduction").Components.map(x => x.FinalAmount).reduce((acc, next) => {return acc + next;}, 0)
        grossComponent.FinalAmount = ctc - deductionAmount;
        this.calculateSpecialAllowance();
      } else if (item.ComponentId != SalaryComponentItems.ESI || item.ComponentId != SalaryComponentItems.EPF) {
        this.calculateSpecialAllowance();
      }

      this.calculateEarningAndNetSalary();
    }
  }

  calculateSpecialAllowance() {
    let autoComponent = this.salaryComponents.find(x => x.Label == 'Employee Earnings').Components.find(x => x.Formula == SalaryComponentItems.Auto);
    if (autoComponent) {
      let grossComponent = this.salaryComponents.find(x => x.Label == 'Actual Gross').Components[0].FinalAmount;
      let components = this.salaryComponents.find(x => x.Label == "Employee Earnings").Components.filter(x => x.Formula != '[AUTO]');

      let compoentsAmount = components.map(x => x.FinalAmount).reduce((acc, next) => { return acc + next;}, 0);
      autoComponent.FinalAmount = (grossComponent - compoentsAmount);

      this.totalEarning = this.salaryComponents.find(x => x.Label == "Employee Earnings").Components.map(x => x.FinalAmount).reduce((acc, next) => {return acc + next;}, 0);
    } else {
      ErrorToast("Auto component not found");
    }
  }

  saveSalaryDetail() {
    this.isLoading = true;
    this.salaryHttp.put(`SalaryComponent/UpdateEmployeeSalaryDetail/${this.selectedData.Month}/${this.selectedData.EmployeeId}`, this.salaryBreakupComponents).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Salary detail updated successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  editComponent(e: any) {
    e.currentTarget.parentElement.classList.add('d-none');
    document.querySelectorAll('input[data-name="FinalAmount"]').forEach(x => {
      x.removeAttribute('readonly');
      x.classList.remove('border-0');
    });
    document.querySelectorAll('input[data-name="IncludeInPayslip"]').forEach(x => x.removeAttribute('disabled'));
    document.querySelector('div[data-name="savebutton"]').classList.remove('d-none');
    document.querySelectorAll('input[data-name="AutoComponent"]').forEach(x => x.removeAttribute("disabled"));
  }

  changeAutoComponent(e: any, item: any) {
    if (e.target.checked) {
      let autoComponent = this.salaryComponents.find(x => x.Label == 'Employee Earnings').Components.find(x => x.Formula == SalaryComponentItems.Auto);
      document.querySelectorAll('input[data-name="AutoComponent"]').forEach(x => {
        x.removeAttribute("checked");
      })
      autoComponent.Formula = autoComponent.FinalAmount;
      item.Formula = SalaryComponentItems.Auto;
    }
  }
}
