import { Component, OnInit } from '@angular/core';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { AdminDeclaration, AdminIncomeTax, AdminPaySlip, AdminPreferences, AdminSalary, AdminSummary, AdminTaxcalculation } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.scss']
})
export class SalaryComponent implements OnInit {
  active = 1;
  cachedData: any = null;
  myAnnualSalary: MyAnnualSalary = new MyAnnualSalary();
  salaryDetail: boolean = true;
  isLoading: boolean = false;
  salaryBreakup: Array<SalaryBreakup> = [];
  salaryDeducation: Array<SalaryDeduction> = [];
  incomeTaxSlab: Array<IncomeTaxSlab> =[];
  currentYear: number = 0;
  employeesList: autoCompleteModal = new autoCompleteModal();
  applicationData: any = [];
  isSalaryReady: boolean = false;

  constructor(private nav: iNavigation,
              private http: AjaxService) { }

  ngOnInit(): void {
    var dt = new Date();
    this.loadData();
    this.currentYear = dt.getFullYear();
    this.myAnnualSalary = {
      Annual: 2124000,
      Bonus: 0,
      Other: 21600,
      Total: 2145600,
      Effective: new Date(),
      PFperMonth: 1800,
      Perks: 0,
      SalaryMonth: 177000
    }

    this.salaryBreakup.push({
      Details: "Basic",
      Monthly: 70800,
      Annually: 849600
    },
    {
      Details: "Conveyance Allowance",
      Monthly: 1600,
      Annually: 19200
    },
    {
      Details: "HRA",
      Monthly: 28320,
      Annually: 339840
    },
    {
      Details: "Medical Allowance",
      Monthly: 1250,
      Annually: 15000
    },
    {
      Details: "Car Running Allowance",
      Monthly: 1800,
      Annually: 21600
    },
    {
      Details: "Telephone and Internet Allowance",
      Monthly: 1500,
      Annually: 18000
    },
    {
      Details: "Travel Reimbursement (LTA)",
      Monthly: 2500,
      Annually: 30000
    },
    {
      Details: "Shift Allowance",
      Monthly: 1500,
      Annually: 18000
    },
    {
      Details: "Special Allowance",
      Monthly: 67730,
      Annually: 812760
    },
    {
      Details: "Total",
      Monthly: 177000,
      Annually: 2121000
    });

    this.salaryDeducation.push({
      Deduction: 'PF Employee',
      Monthly: 1800,
      Annually: 15000
    },
    {
      Deduction: 'NET PAY',
      Monthly: 175200,
      Annually: 2102400
    });

    this.incomeTaxSlab.push({
      taxSlab: 'Income Upto 2,50,000',
      rate: 'NIL'
    },
    {
      taxSlab: 'Income between 2,50,001 to 5,00,000',
      rate: '5% (Tax rebate of Rs 12,500 available under secction 87A'
    },
    {
      taxSlab: 'Income between 5,00,001 to 7,50,000',
      rate: '10%'
    },
    {
      taxSlab: 'Income between 7,50,001 to 10,00,000',
      rate: '15%'
    },
    {
      taxSlab: 'Income between 10,00,001 to 12,50,000',
      rate: '20%'
    },
    {
      taxSlab: 'Income between 12,50,001 to 15,00,000',
      rate: '25%'
    },
    {
      taxSlab: 'Income above 15,00,000',
      rate: '30%'
    })
  }

  loadData() {
    this.isSalaryReady = false;
    this.http.get("User/GetEmployeeAndChients").then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.applicationData = response.ResponseBody;
        this.employeesList.data = [];
        this.employeesList.placeholder = "Employee";
        let employees = this.applicationData.Employees;
        if(employees) {
          let i = 0;
          while(i < employees.length) {
            this.employeesList.data.push({
              text: `${employees[i].FirstName} ${employees[i].LastName}`,
              value: employees[i].EmployeeUid
            });
            i++;
          }
        }
        this.employeesList.className = "";

        this.isSalaryReady = true;
      }
    });
  }

  continueCurrentTaxRegime() {
    this.nav.navigate(AdminSalary, null);
    $('#newIncomeTaxRegime').modal('hide');
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
        break;
      case "PaySlips":
        this.nav.navigateRoot(AdminPaySlip, this.cachedData);
        break;
      case "IncomeTax":
        this.nav.navigateRoot(AdminIncomeTax, this.cachedData);
        break;
    }
  }

  salaryStructureHistory() {
    $('#slaryStructureHistory').modal('show');
  }

  gotoTaxCalculation() {
    $('#newIncomeTaxRegime').modal('hide');
    this.nav.navigateRoot(AdminTaxcalculation, null);
  }

  viewSalary() {
    this.salaryDetail = !this.salaryDetail;
  }

  salaryBreakupPopup() {
    $('#fullSalaryDetail').modal('show');
  }

  closeSalaryDetails() {
    $('#fullSalaryDetail').modal('hide');
  }

  newIncomeTaxRegimePopUp() {
    $('#newIncomeTaxRegime').modal('show');
  }


}



class MyAnnualSalary {
  Annual: number = 0;
  Bonus: number = 0;
  Other: number = 0;
  Total: number = 0;
  Effective: Date = null;
  PFperMonth: number = 0;
  Perks: number = 0;
  SalaryMonth: number = 0
}

class SalaryBreakup {
  Details: string = '';
  Monthly: number = 0;
  Annually: number = 0;
}

class SalaryDeduction {
  Deduction: string = '';
  Monthly: number = 0;
  Annually: number = 0;
}

class IncomeTaxSlab {
  taxSlab: string = '';
  rate: string = '';
}

