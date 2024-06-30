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
  isLoading: boolean = false;
  selectedData: any = null;
  currentCompny:any = null;

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
          this.salaryComponents = res.ResponseBody;
          this.isPageReady = true;
        }
      }).catch(e => {

      })
    }
  }

  selectIncludepayslip(e: any, item: any) {
    if (e.target.checked)
      item.IsIncludeInPayslip = true;
    else
      item.IsIncludeInPayslip = false;
  }

  changeSalaryAmount(item: any, e: any) {
    let amount = Number(e.target.value);
    if (item && amount) {
      item.FinalAmount = amount;
      if (item.ComponentId == SalaryComponentItems.EESI || item.ComponentId == SalaryComponentItems.EEPF) {
        let ctc = this.salaryComponents.find(x => x.ComponentId == SalaryComponentItems.CTC).FinalAmount;
        let grossAmount = this.salaryComponents.find(x => x.ComponentId == SalaryComponentItems.Gross);
        let deductionComponent = this.salaryComponents.filter(x => x.ComponentId == SalaryComponentItems.EESI || x.ComponentId == SalaryComponentItems.EEPF);
        let deductionAmount = deductionComponent.map(x => x.FinalAmount).reduce((acc, pre) => {return acc + pre;}, 0);
        grossAmount.FinalAmount = ctc - deductionAmount;
        this.calculateSpecialAllowance();
      } else if (item.ComponentId != SalaryComponentItems.ESI && item.ComponentId != SalaryComponentItems.EPF) {
        this.calculateSpecialAllowance();
      }
    }
  }

  calculateSpecialAllowance() {
    let autoComponent = this.salaryComponents.find(x => x.Formula == SalaryComponentItems.Auto);
    if (autoComponent) {
      let grossComponent = this.salaryComponents.find(x => x.ComponentId == SalaryComponentItems.Gross).FinalAmount;
      let components = this.salaryComponents.filter(x => x.ComponentId != SalaryComponentItems.Gross && x.ComponentId != SalaryComponentItems.CTC && x.ComponentId != SalaryComponentItems.ESI && x.ComponentId != SalaryComponentItems.EESI && x.ComponentId != SalaryComponentItems.EEPF && x.ComponentId != SalaryComponentItems.EPF && x.Formula != SalaryComponentItems.Auto && x.ComponentId != SalaryComponentItems.PTAX);
      let compoentsAmount = components.map(x => x.FinalAmount).reduce((acc, next) => { return acc + next;}, 0);
      autoComponent.FinalAmount = (grossComponent - compoentsAmount);
    } else {
      ErrorToast("Auto component not found");
    }
  }

  saveSalaryDetail() {
    this.isLoading = true;
    this.salaryHttp.put(`SalaryComponent/UpdateEmployeeSalaryDetail/${4}/${35}`, this.salaryComponents).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        Toast("Salary detail updated successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  editComponent(e: any, i: number, item: any) {
    e.currentTarget.classList.add("d-none");
    document.querySelectorAll('input[data-name="FinalAmount"]')[i].removeAttribute('readonly');
    document.querySelectorAll('input[data-name="IncludeInPayslip"]')[i].removeAttribute('disabled');
    if (item.ComponentId != SalaryComponentItems.CTC && item.ComponentId != SalaryComponentItems.Gross && item.ComponentId != SalaryComponentItems.ESI && item.ComponentId != SalaryComponentItems.EESI && item.ComponentId != SalaryComponentItems.EPF && item.ComponentId != SalaryComponentItems.EEPF)
      document.querySelectorAll('input[data-name="AutoComponent"]')[i].removeAttribute("disabled");
  }

  changeAutoComponent(e: any, item: any) {
    if (e.target.checked) {
      let autoComponent = this.salaryComponents.find(x => x.Formula == SalaryComponentItems.Auto);
      document.querySelectorAll('input[data-name="AutoComponent"]').forEach(x => {
        x.removeAttribute("checked");
      })
      autoComponent.Formula = autoComponent.FinalAmount;
      item.Formula = SalaryComponentItems.Auto;
    }
  }
}
