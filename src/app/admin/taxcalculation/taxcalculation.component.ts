import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-taxcalculation',
  templateUrl: './taxcalculation.component.html',
  styleUrls: ['./taxcalculation.component.scss']
})
export class TaxcalculationComponent implements OnInit {
  active = 1;
  currentYear: number = 0;
  taxCalculationForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    var dt = new Date();
    this.currentYear = dt.getFullYear();
    this.initForm();
  }

  navigateTab(tabName: string) {
    switch (tabName) {
      case "BasicDeatils":
        this.active = 1;
        break;
      case "IncomeDetails":
        this.active = 2;
        break;
      case "Deductions":
        this.active = 3;
        break;
      default:
        this.active = 1;
        break;
    }
  }

  calculateTax() {
    this.active = 4;
    console.table(this.taxCalculationForm.value);
  }

  initForm() {
    this.taxCalculationForm = this.fb.group({
      FinancialYear: new FormControl (''),
      Age: new FormControl (''),
      IncomeSalary: new FormControl (''),
      DeductionSalary: new FormControl (''),
      IncomeInterest: new FormControl (''),
      OtherIncome: new FormControl (''),
      InterestHomeLoan: new FormControl (''),
      RentalIncome: new FormControl (''),
      InterestLoan: new FormControl (''),
      IncomeDigitalAssets: new FormControl (''),
      BasicDeduction: new FormControl (''),
      InterestDeposit: new FormControl (''),
      MedicalInsurance: new FormControl (''),
      DonationCharity: new FormControl (''),
      InterestEducationLoan: new FormControl (''),
      InterestHousingLoan: new FormControl (''),
      EmployeeContribution: new FormControl ('')
    })
  }

}
