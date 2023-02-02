import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-incometax',
  templateUrl: './incometax.component.html',
  styleUrls: ['./incometax.component.scss']
})
export class IncometaxComponent implements OnInit {
  cachedData: any = null;
  taxCalender: Array<any> = [];
  currentYear: number = 0;
  taxSlab: Array<TaxSlab> = [];
  salaryDetail: any = null;
  allDeclarationSalaryDetails: any = null;
  salaryBreakup: Array<any> = [];
  TaxDetails: Array<any> = [];
  EmployeeId: number = 0;
  ExemptionDeclaration: Array<any> = [];
  OtherDeclaration: Array<any> = [];
  TaxSavingAlloance: Array<any> = [];
  Section16TaxExemption:Array<any> = [];
  Sec16TaxExemptAmount: number = 0;
  totalAllowTaxExemptAmount : number = 0;
  totalSection80CExempAmount: number = 0;
  totalOtherExemptAmount: number = 0;
  isPageReady: boolean = false;
  hraDetails: Array<any> = [];
  proTaxDetails: Array<any> = [];
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  isEmployeesReady:boolean = false;
  isEmployeeSelect: boolean = false;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    var month = 3;
    this.currentYear = dt.getFullYear();
    var years = dt.getFullYear();
    if (new Date().getMonth() + 1 <= 4)
      years = years -1;
    let i = 0;
    while( i < 12) {
      var mnth = Number((((month + 1) < 9 ? "" : "0") + month));
      if (month == 12) {
        month = 1;
        years ++
      } else {
        month ++;
      }
      this.taxCalender.push({
        month: new Date(years, mnth, 1).toLocaleString("en-us", { month: "short" }), // result: Aug
        year: Number(years.toString().slice(-2))
      });
      i++;
    }

    this.EmployeeId = this.nav.getValue();
    if(this.EmployeeId != null || this.EmployeeId > 0)
      this.loadData();
    else
      this.getEmployees();
  }

  getIncomeTaxDetail(id: any) {
    this.EmployeeId =0 ;
    if (id > 0) {
      this.EmployeeId = id;
      this.loadData();
    } else {
      ErrorToast("Unable to get data. Please contact to admin.");
    }
  }

  loadData() {
    this.isPageReady = false;
    this.isEmployeeSelect = false;
    this.totalAllowTaxExemptAmount = 0;
    this.http.get(`Declaration/GetEmployeeDeclarationDetailById/${this.EmployeeId}`)
    .then((response:ResponseModel) => {
      if (response.ResponseBody) {
        this.allDeclarationSalaryDetails = response.ResponseBody;
        this.allDeclarationSalaryDetails.IncomeTaxSlab = Object.entries(response.ResponseBody.IncomeTaxSlab).reverse();
        this.ExemptionDeclaration = response.ResponseBody.ExemptionDeclaration;
        if ((this.ExemptionDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.ExemptionDeclaration = [];

        this.OtherDeclaration = response.ResponseBody.OtherDeclaration;
        if ((this.OtherDeclaration.filter(x => x.DeclaredValue > 0).length <= 0))
          this.OtherDeclaration = [];

        this.TaxSavingAlloance = response.ResponseBody.TaxSavingAlloance;
        if ((this.TaxSavingAlloance.filter(x => x.DeclaredValue > 0).length <= 0))
          this.TaxSavingAlloance = [];

        this.Section16TaxExemption = response.ResponseBody.Section16TaxExemption;
        this.Sec16TaxExemptAmount = 0;
        for (let i = 0; i < this.Section16TaxExemption.length; i++) {
          this.Sec16TaxExemptAmount += this.Section16TaxExemption[i].DeclaredValue;
        }

        this.salaryDetail = response.ResponseBody.SalaryDetail;
        this.TaxDetails = JSON.parse(this.salaryDetail.TaxDetail);

        let annualSalaryDetail = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        if (annualSalaryDetail && annualSalaryDetail.length == 12) {
          annualSalaryDetail.map((com) => {
            com.SalaryBreakupDetails = com.SalaryBreakupDetails.filter(x => x.ComponentId != "Gross" && x.ComponentId != 'CTC' && x.ComponentId != "PTAX" && x.ComponentId != "ESI")
          });

          let i = 0;
          let value = "";
          let selectedComponent = [];
          let props = annualSalaryDetail[i].SalaryBreakupDetails.map(({ComponentId, ComponentName}) => { return { ComponentId, ComponentName } });
          props = props.filter(x => x.ComponentId != "ECI" && x.ComponentId != "EPER-PF" && x.ComponentId != "GRA");
          while(i < props.length) {
            value = props[i].ComponentId;
            selectedComponent = annualSalaryDetail.map(x => x.SalaryBreakupDetails.find(i => i.ComponentId == value));
            this.salaryBreakup.push({
              id: props[i].ComponentId,
              key: props[i].ComponentName,
              total: selectedComponent.reduce((acc, cur) => { return acc + cur.FinalAmount; }, 0),
              value: selectedComponent
            });

            i++;
          }

          i = 0;
          let totalAmount = 0;
          let finalAmount = 0;
          let totalAmounts: Array<any> = [];
          while(i < annualSalaryDetail.length) {
            let salaryComponent = annualSalaryDetail[i].SalaryBreakupDetails.filter(x => x.ComponentId != "ECI" && x.ComponentId != "EPER-PF" && x.ComponentId != "GRA");
            totalAmount = salaryComponent.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
            finalAmount += totalAmount;
            totalAmounts.push({ FinalAmount: totalAmount });
            i++;
          }

          this.salaryBreakup.push({
            key: 'Total',
            total: finalAmount,
            value: totalAmounts
          });

        } else {
          ErrorToast("Unable to get salary detail. Please contact to admin.");
          return;
        }

        let hraAmount = 0;
        let hraComponent = this.allDeclarationSalaryDetails.SalaryComponentItems.find(x => x.ComponentId == "HRA" && x.DeclaredValue > 0);
        if (hraComponent) {
          this.TaxSavingAlloance.push(hraComponent);
          this.hraCalculation();
          hraAmount = this.hraDetails.reduce((acc, next) => {return acc + next.Min}, 0)
        }

        for (let i = 0; i < this.allDeclarationSalaryDetails.Declarations.length; i++) {
          switch (this.allDeclarationSalaryDetails.Declarations[i].DeclarationName) {
            case "1.5 Lac Exemptions":
              this.totalSection80CExempAmount = this.allDeclarationSalaryDetails.Declarations[i].TotalAmountDeclared;
              break;
            case "Other Exemptions":
              this.totalOtherExemptAmount = this.allDeclarationSalaryDetails.Declarations[i].TotalAmountDeclared;
              break;
          }
        }

        this.totalAllowTaxExemptAmount = this.componentTotalAmount(this.TaxSavingAlloance) ;
        this.totalAllowTaxExemptAmount = this.totalAllowTaxExemptAmount + hraAmount;
        this.isPageReady = true;
         this.isEmployeeSelect = true;
        Toast("Details get successfully")
      }
    })
  }

  getEmployees() {
    this.isEmployeesReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        this.employeesList.data = GetEmployees();
        this.employeesList.className = "";

        this.isEmployeesReady = true;
      }
    });
  }

  componentTotalAmount(value: Array<any>) {
    let item = value.filter(x => x.ComponentId != "HRA");
    let totalAmount = 0;
    for (let i = 0; i < item.length; i++) {
      if (item[i].DeclaredValue > 0)
        totalAmount += item[i].DeclaredValue;
    }
    return totalAmount;
  }

  viewHRAPopUp() {
    this.hraDetails = [];
    $('#viewHRAModal').modal('show');
    this.hraCalculation();
  }

  hraCalculation() {
    let rent = 0;
    let hpComponent = this.allDeclarationSalaryDetails.Declarations.find(x => x.DeclarationName == "House Property");
    if (hpComponent && hpComponent!= null)
      rent = hpComponent.TotalAmountDeclared;

    for (let i = 0; i < this.taxCalender.length; i++) {
      this.hraDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        RentPaid: rent,
        HRA1: this.allDeclarationSalaryDetails.HRADeatils.HRA1,
        HRA2: this.allDeclarationSalaryDetails.HRADeatils.HRA2,
        HRA3: this.allDeclarationSalaryDetails.HRADeatils.HRA3,
        Min: this.allDeclarationSalaryDetails.HRADeatils.HRAAmount,
      })
    }
  }

  viewProTaxPopUp(amount: number) {
    this.proTaxDetails = [];
    var monthlyPTax = 0;
    if (amount > 0)
      monthlyPTax = amount/12;
    for (let i = 0; i < this.taxCalender.length; i++) {
      this.proTaxDetails.push({
        Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
        Amount: monthlyPTax,
        Source: 'Proceed'
      })
    }
    $('#proTaxModal').modal('show');
  }

  activateMe(ele: string) {
    switch(ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, this.cachedData);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, this.cachedData);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, this.cachedData);
        break;
    }
  }

  activeTab(e: string) {
    switch(e) {
      case "MySalary":
        this.nav.navigateRoot(AdminSalary, this.cachedData);
        break;
      case "PaySlips":
        this.nav.navigateRoot(AdminPaySlip, this.cachedData);
        break;
      case "IncomeTax":
        break;
    }
  }

  saveTaxDetail() {
      let presentMonth = new Date().getMonth() + 1;
      let presentYear = new Date().getFullYear();
      let formData = new FormData();
      this.http.get(`Declaration/UpdateTaxDetail/
          ${this.EmployeeId}/${presentMonth}/${presentYear}`).then(res => {
        if (res.ResponseBody) {
          Toast("Salary breakup added successfully.");
        }
      })
  }

  getTotalTaxableAmount(index: number) {
    let value: number = 0;
    switch(index) {
      case 1:
        value = (this.salaryDetail.GrossIncome - this.totalAllowTaxExemptAmount -
          52400 - this.totalOtherExemptAmount - this.totalSection80CExempAmount -
          this.allDeclarationSalaryDetails.HRADeatils.HRAAmount * 12);
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case 5:
        break;
    }

    return value;
  }
}

class TaxSlab {
  taxableincomeslab: string = '';
  taxamount: number = 0;
}

export class MonthlyTax {
  april: number = 0;
  may: number = 0;
  june: number = 0;
  july: number = 0;
  aug: number = 0;
  sep: number = 0;
  oct: number = 0;
  nov: number = 0;
  dec: number = 0;
  jan: number = 0;
  feb: number = 0;
  march: number = 0
}
