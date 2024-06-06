import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ApplicationStorage, GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AdminDeclaration, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary, ItemStatus, SalaryComponentItems } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';
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
  userDetail: UserDetail = new UserDetail();
  lastIncomeTaxSlab: any = null;

  constructor(private nav: iNavigation,
              private local: ApplicationStorage,
              private http: CoreHttpService,
              private user: UserService) { }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    let id = this.nav.getValue();
    let empid = this.local.getByKey("EmployeeId");
    if(id && id > 0)
      this.EmployeeId = id;
    else if (empid && empid > 0)
      this.EmployeeId = empid;
    else {
      this.userDetail = this.user.getInstance() as UserDetail;
      this.EmployeeId = this.userDetail.UserId;
    }

    if (this.EmployeeId && this.EmployeeId <= 0) {
      ErrorToast("Not able to find employee declaration detail. Please contact to admin.");
    } else {
      this.loadUserTaxModule();
    }
  }

  loadTaxModule(): void {
    if(this.EmployeeId != null || this.EmployeeId > 0)
      this.loadData();
    else
      this.getEmployees();
  }

  loadUserTaxModule() {
    this.loadData();
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
        this.lastIncomeTaxSlab= this.allDeclarationSalaryDetails.IncomeTaxSlab.slice(-1).pop()[0];
        this.allDeclarationSalaryDetails.NewRegimIncomeTaxSlab = Object.entries(response.ResponseBody.NewRegimIncomeTaxSlab).reverse();
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
        let i = 0;
        let finalAmount = 0;
        let totalAmounts: Array<any> = [];
        while(i < annualSalaryDetail.length) {
          let amount = 0;
          let salaryComponent = annualSalaryDetail[i].SalaryBreakupDetails.filter(x => x.ComponentId != SalaryComponentItems.Gross && x.ComponentId != SalaryComponentItems.CTC && x.ComponentId != SalaryComponentItems.ESI && x.ComponentId != SalaryComponentItems.EPF);
          if (annualSalaryDetail[i].IsPayrollExecutedForThisMonth) {
            amount = salaryComponent.reduce((acc, next) => { return acc + next.FinalAmount }, 0);
          } else {
            amount = salaryComponent.reduce((acc, next) => { return acc + next.ActualAmount }, 0);
          }
          finalAmount += amount;
          totalAmounts.push({ FinalAmount: amount });
          i++;
        }

        if (annualSalaryDetail && annualSalaryDetail.length == 12) {
          annualSalaryDetail.map((com) => {
            com.SalaryBreakupDetails = com.SalaryBreakupDetails.filter(x => x.ComponentId != SalaryComponentItems.Gross && x.ComponentId != SalaryComponentItems.CTC && x.ComponentId != SalaryComponentItems.PTAX && x.ComponentId != SalaryComponentItems.ESI &&  x.ComponentId != SalaryComponentItems.EPF)
          });
          i = 0;
          let value = "";
          let props = annualSalaryDetail[i].SalaryBreakupDetails.map(({ComponentId, ComponentName, IsIncludeInPayslip}) => { return { ComponentId, ComponentName, IsIncludeInPayslip} });
          // props = props.filter(x => x.ComponentId != "ECI" && x.ComponentId != "EPER-PF" && x.ComponentId != "GRA");
          while(i < props.length) {
            let selectedComponent = [];
            value = props[i].ComponentId;
            let totalAmount = 0;
            //selectedComponent = annualSalaryDetail.map(x => x.SalaryBreakupDetails.find(i => i.ComponentId == value));
            annualSalaryDetail.forEach(x => {
              let component = x.SalaryBreakupDetails.find(i => i.ComponentId == value);
              if (component) {
                component.IsPayrollExecutedForThisMonth = x.IsPayrollExecutedForThisMonth;
                selectedComponent.push(component);
              }
            });
            let filterselectedComponent = annualSalaryDetail.filter(x => x.IsPayrollExecutedForThisMonth);
            if (filterselectedComponent && filterselectedComponent.length > 0) {
              filterselectedComponent = filterselectedComponent.map(x => x.SalaryBreakupDetails.find(i => i.ComponentId == value));
              totalAmount += filterselectedComponent.reduce((acc, cur) => { return acc + cur.FinalAmount; }, 0);
            }
            filterselectedComponent = annualSalaryDetail.filter(x => !x.IsPayrollExecutedForThisMonth);
            if (filterselectedComponent && filterselectedComponent.length > 0) {
              filterselectedComponent = filterselectedComponent.map(x => x.SalaryBreakupDetails.find(i => i.ComponentId == value));
              totalAmount += filterselectedComponent.reduce((acc, cur) => { return acc + cur.ActualAmount; }, 0);
            }
            if (!selectedComponent.includes(undefined)) {
              this.salaryBreakup.push({
                id: props[i].ComponentId,
                key: props[i].ComponentName,
                total: totalAmount,
                value: selectedComponent,
                isIncludeInPayslip: props[i].IsIncludeInPayslip
              });
            }
            i++;
          }
          this.salaryBreakup = this.salaryBreakup.sort((a, b) => a.key.localeCompare(b.key));
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
        let hraComponent = this.allDeclarationSalaryDetails.SalaryComponentItems.find(x => x.ComponentId == SalaryComponentItems.HRA && x.DeclaredValue > 0);
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

        i = 0;
        let typeId = 0;
        while( i < this.TaxDetails.length) {
          let date = new Date(annualSalaryDetail[i].PresentMonthDate);
          if(annualSalaryDetail[i].IsActive) {
            if (this.TaxDetails[i].IsPayrollCompleted) {
              typeId = 1;
            } else {
              typeId = 2;
            }
          } else {
            typeId = 0;
          }

          this.taxCalender.push({
            month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString("en-us", { month: "short" }), // result: Aug
            year: Number(this.TaxDetails[i].Year.toString().slice(-2)),
            isActive: annualSalaryDetail[i].IsActive,
            type: typeId
          });
          i++;
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
    let emptyMonth = (12 - this.allDeclarationSalaryDetails.TotalMonths) - 1;
    if (amount > 0)
      monthlyPTax = amount/this.allDeclarationSalaryDetails.TotalMonths;

    for (let i = 0; i < this.taxCalender.length; i++) {
      if (i == emptyMonth) {
        this.proTaxDetails.push({
          Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
          Amount: 0,
          Source: 'Proceed'
        })
      } else {
        this.proTaxDetails.push({
          Month: this.taxCalender[i].month + " "+ this.taxCalender[i].year,
          Amount: monthlyPTax,
          Source: 'Proceed'
        })
      }
    }
    $('#proTaxModal').modal('show');
  }

  activateMe(ele: string) {
    switch (ele) {
      case "declaration-tab":
        this.nav.navigateRoot(AdminDeclaration, null);
        break;
      case "salary-tab":
        break;
      case "summary-tab":
        this.nav.navigateRoot(AdminSummary, null);
        break;
      case "preference-tab":
        this.nav.navigateRoot(AdminPreferences, null);
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
          this.Sec16TaxExemptAmount - this.totalOtherExemptAmount - this.totalSection80CExempAmount -
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
