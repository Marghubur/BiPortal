import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  completeSalaryBreakup: SalaryBreakupDetails = new SalaryBreakupDetails();
  salaryComponents: Array<any> = [];
  isSalaryGroup: boolean = false;
  salaryGroup: any = null;
  isCompanyGroupSelected: boolean = false;
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
      this.employeeCTC = data.CTC;
      this.getSalaryGroup(this.employeeCTC);
      this.loadData();
    } else {
      ErrorToast("Invalid employee selected")
    }
  }

  loadData() {
    this.isSalaryGroup = false;
    this.http.get(`SalaryComponent/GetSalaryBreakupByEmpId/${this.employeeUid}`).then(res => {
      if(res.ResponseBody) {
        this.salaryDetail = res.ResponseBody;
        if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}') {
          this.completeSalaryBreakup = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
        }else
          this.completeSalaryBreakup = new SalaryBreakupDetails();
      }else {
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
      this.salaryBreakupForm.get("ExpectedCTC").setValue(this.employeeDetails.CTC);
      if (this.salaryBreakupForm.get("ExpectedCTC").value > 0) {
        this.salaryCalculation();
        this.isSalaryGroup = true;
        this.isCompanyGroupSelected = true;
      }
    });
  }

  getSalaryGroup(CTC: number) {
    this.isSalaryGroup = false;
    this.http.get(`SalaryComponent/GetSalaryGroupByCTC/${CTC}`).then(response => {
      if(response.ResponseBody) {
        this.salaryGroup = response.ResponseBody;
        this.salaryGroupId = this.salaryGroup.SalaryGroupId;
        this.salaryComponents = JSON.parse(this.salaryGroup.SalaryComponents);
        this.salaryComponents = this.salaryComponents.filter(x => x.IncludeInPayslip == true);
        console.log(this.salaryComponents);
      } else
        ErrorToast("No salary group found. Please contact to admin.")
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

  // salaryCalculation(annualCTC: number) {
  //   let grossAnnually = annualCTC - Number (this.salaryBreakupForm.get("InsuranceAnnually").value + this.salaryBreakupForm.get("PFAnnually").value + this.salaryBreakupForm.get("GratuityAnnually").value);
  //   this.salaryBreakupForm.get("GrossAnnually").setValue(grossAnnually);
  //   this.salaryBreakupForm.get("GrossMonthly").setValue(ToFixed((grossAnnually/12), 0));
  //   let i = 0;
  //   while (i < this.salaryComponents.length) {
  //     let formula = this.salaryComponents[i].Formula;
  //     let componentId = this.salaryComponents[i].ComponentId;
  //     if (formula && formula != '') {
  //       if (formula.includes("[BASIC]")) {
  //         let calculatedOn = Number(this.salaryBreakupForm.get("BasicAnnually").value);
  //         formula = formula.replace("[BASIC]", calculatedOn);
  //       }
  //       else if (formula.includes("[CTC]")) {
  //         let calculatedOn = annualCTC;
  //         formula = formula.replace("[CTC]", calculatedOn);
  //       }
  //       else if (formula.includes("[GROSS]")) {
  //         let calculatedOn = grossAnnually;
  //         formula = formula.replace("[GROSS]", calculatedOn);
  //       }

  //       let finalvalue = this.calculateExpressionUsingInfixDS(formula);
  //       switch (componentId) {
  //         case 'BS':
  //           this.salaryBreakupForm.get("BasicAnnually").setValue(ToFixed((finalvalue), 0));
  //           this.salaryBreakupForm.get("BasicMonthly").setValue(ToFixed((finalvalue/12), 0));
  //           break;
  //         case 'HRA':
  //           this.salaryBreakupForm.get("HRAAnnually").setValue(ToFixed((finalvalue), 0));
  //           this.salaryBreakupForm.get("HRAMonthly").setValue(ToFixed((finalvalue/12), 0));
  //           break;
  //         }
  //       }
  //       i++;
  //     }
  //     let specialAllowanceAnnually = grossAnnually - (Number (this.salaryBreakupForm.get("BasicAnnually").value) + Number(this.salaryBreakupForm.get("ConveyanceAnnually").value) + Number (this.salaryBreakupForm.get("HRAAnnually").value) + Number(this.salaryBreakupForm.get("MedicalAnnually").value) + Number(this.salaryBreakupForm.get("ShiftAnnually").value));
  //     this.salaryBreakupForm.get("SpecialAnnually").setValue(ToFixed((specialAllowanceAnnually), 0));
  //     this.salaryBreakupForm.get("SpecialMonthly").setValue(ToFixed((specialAllowanceAnnually/12), 0));
  //     this.salaryBreakupForm.get("CTCAnnually").setValue(annualCTC);
  //     this.salaryBreakupForm.get("CTCMonthly").setValue(ToFixed((annualCTC/12), 0));
  // }

  // calculateExpressionUsingInfixDS(expression: string): number {
  //   expression = `(${expression})`;
  //   let operatorStact = [];
  //   let expressionStact = [];
  //   let index = 0;
  //   let lastOp = '';
  //   let ch = '';
  //   while(index < expression.length) {
  //     ch = expression[index];
  //     if(ch.trim() == ''){
  //       index++;
  //       continue;
  //     }
  //     if(isNaN(Number(ch))) {
  //       switch(ch) {
  //         case '+':
  //         case '-':
  //         case '/':
  //         case '%':
  //         case '*':
  //           if(operatorStact.length > 0) {
  //             lastOp = operatorStact[operatorStact.length - 1];
  //             if(lastOp == '+' || lastOp == '-' || lastOp == '/' || lastOp == '*' || lastOp == '%') {
  //               lastOp = operatorStact.pop();
  //               expressionStact.push(lastOp);
  //             }
  //           }
  //           operatorStact.push(ch);
  //           break;
  //         case ')':
  //           while(true) {
  //             lastOp = operatorStact.pop();
  //             if(lastOp == '(') {
  //               //operatorStact.pop();
  //               break;
  //             }
  //             expressionStact.push(lastOp);
  //           }
  //           break;
  //         case '(':
  //           operatorStact.push(ch);
  //           break;
  //         default:
  //           ErrorToast("Invalid expression");
  //           break;
  //       }
  //     } else {
  //       let value = 0;
  //       while(true) {
  //         ch = expression[index];
  //         if(ch.trim() == '') {
  //           expressionStact.push(value);
  //           break;
  //         }

  //         if(!isNaN(Number(ch))) {
  //           value = Number(`${value}${ch}`);
  //           index++;
  //         } else {
  //           index--;
  //           expressionStact.push(value);
  //           break;
  //         }
  //       }
  //     }

  //     index++;
  //   }

  //   return this.calculationUsingInfixExpression(expressionStact);
  // }

  // calculationUsingInfixExpression(expressionStact: Array<any>): number {
  //   let i = 0;
  //   let term = [];
  //   while (i < expressionStact.length) {
  //     if (!isNaN(expressionStact[i]) && !isNaN(expressionStact[i+1]) && isNaN(Number(expressionStact[i+2]))) {
  //       let  finalvalue = 0;
  //       switch (expressionStact[i+2]) {
  //         case '+':
  //           finalvalue = expressionStact[i] + expressionStact[i+1];
  //           break;
  //         case '*':
  //           finalvalue = expressionStact[i] * expressionStact[i+1];
  //           break;
  //         case '-':
  //           finalvalue = expressionStact[i] - expressionStact[i+1];
  //           break;
  //         case '%':
  //           finalvalue = (expressionStact[i] * expressionStact[i+1]) / 100;
  //           break;
  //         }
  //       term.push(finalvalue);
  //       i = i+3;
  //     }
  //     else if(!isNaN(expressionStact[i]) && isNaN(Number(expressionStact[i+1]))) {
  //       let  finalvalue = 0;
  //       let lastterm = term.pop();
  //       switch (expressionStact[i+1]) {
  //         case '+':
  //           finalvalue = lastterm + expressionStact[i];
  //           break;
  //         case '*':
  //           finalvalue = lastterm * expressionStact[i];
  //           break;
  //         case '-':
  //           finalvalue = lastterm - expressionStact[i];
  //           break;
  //         case '%':
  //           finalvalue = (lastterm * expressionStact[i]) / 100;
  //           break;
  //         }
  //       term.push(finalvalue);
  //       i = i+2;
  //     } else {
  //       let  finalvalue = 0;
  //       let lastterm = term.pop();
  //       let previousterm = term.pop();
  //       switch (expressionStact[i]) {
  //         case '+':
  //           finalvalue = previousterm + lastterm;
  //           break;
  //         case '*':
  //           finalvalue = previousterm * lastterm;
  //           break;
  //         case '-':
  //           finalvalue = previousterm - lastterm;
  //           break;
  //         case '%':
  //           finalvalue = (previousterm * lastterm) / 100;
  //           break;
  //         }
  //       term.push(finalvalue);
  //       i++;
  //     }
  //   }
  //   if (term.length === 1) {
  //     return Math.trunc(term[0]);
  //   } else {
  //     term = [];
  //     ErrorToast("Invalid expression");
  //   }
  // }

  initForm() {
    this.salaryBreakupForm = this.fb.group({
      BasicMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.BasicAnnually/12, 2)),
      BasicAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.BasicAnnually, 2)),
      ConveyanceMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.ConveyanceAnnually/12, 2)),
      ConveyanceAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.ConveyanceAnnually, 2)),
      HRAMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.HRAAnnually/12, 2)),
      HRAAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.HRAAnnually, 2)),
      MedicalMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.MedicalAnnually/12, 2)),
      MedicalAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.MedicalAnnually, 2)),
      CarRunningMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.CarRunningAnnually/12, 2)),
      CarRunningAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.CarRunningAnnually, 2)),
      InternetMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.InternetAnnually/12, 2)),
      InternetAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.InternetAnnually, 2)),
      TravelMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.TravelAnnually/12, 2)),
      TravelAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.TravelAnnually, 2)),
      ShiftMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.ShiftAnnually/12, 2)),
      ShiftAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.ShiftAnnually, 2)),
      SpecialMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.SpecialAnnually/12, 2)),
      SpecialAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.SpecialAnnually, 2)),
      GrossMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.GrossAnnually/12, 2)),
      GrossAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.GrossAnnually, 2)),
      InsuranceMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.InsuranceAnnually/12, 2)),
      InsuranceAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.InsuranceAnnually, 2)),
      PFMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.PFAnnually/12, 2)),
      PFAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.PFAnnually, 2)),
      GratuityMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.GratuityAnnually/12, 2)),
      GratuityAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.GratuityAnnually, 2)),
      FoodMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.FoodAnnually/12, 2)),
      FoodAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.FoodAnnually, 2)),
      CTCMonthly: new FormControl(ToFixed(this.completeSalaryBreakup.CTCAnnually/12, 2)),
      CTCAnnually: new FormControl(ToFixed(this.completeSalaryBreakup.CTCAnnually, 2)),
      ExpectedCTC: new FormControl(ToFixed(this.completeSalaryBreakup.CTCAnnually, 2)),
      SalaryGroupId: new FormControl(this.salaryGroupId)
    });
  }

  calculateSalary() {
    let annualCTC = Number(this.salaryBreakupForm.get("ExpectedCTC").value);
    if (annualCTC > 0) {
      this.getSalaryGroup(annualCTC);
      this.salaryCalculation();
    }
  }

  salaryCalculation() {
    let annualCTC = Number(this.salaryBreakupForm.get("ExpectedCTC").value);
    if (annualCTC > 0) {
      this.isSalaryGroup = true;
      this.http.post(`SalaryComponent/SalaryBreakupCalc/${this.employeeUid}/${this.salaryGroupId}`, annualCTC)
      .then(res => {
        if (res.ResponseBody) {
          this.completeSalaryBreakup = res.ResponseBody;
          this.initForm();
          // this.salaryComponents = res.ResponseBody;
          // let fixedvaluedComponent = this.salaryComponents.filter(x => x.PercentageValue == 0);
          // let i = 0;
          // while (i < fixedvaluedComponent.length) {
          //   let finalvalue = fixedvaluedComponent[i].MaxLimit;
          //   switch (fixedvaluedComponent[i].ComponentId) {
          //     case 'ECTG':
          //       this.salaryBreakupForm.get("GratuityAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("GratuityMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //     case 'CA':
          //       this.salaryBreakupForm.get("ConveyanceAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("ConveyanceMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //     case 'EPF':
          //       this.salaryBreakupForm.get("PFAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("PFMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //     case 'MA':
          //       this.salaryBreakupForm.get("MedicalAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("MedicalMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //     case 'SA':
          //       this.salaryBreakupForm.get("ShiftAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("ShiftMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //     case 'ESI':
          //       this.salaryBreakupForm.get("InsuranceAnnually").setValue(finalvalue);
          //       this.salaryBreakupForm.get("InsuranceMonthly").setValue(ToFixed((finalvalue/12), 0));
          //       break;
          //   }
          //   i++;
          // }
          this.isCompanyGroupSelected = true;
          // this.salaryCalculation(annualCTC);
        }
      })
    }
  }
}

class SalaryBreakupDetails {
  EmployeeId: number  =0;
  BasicMonthly: number = 0;
  BasicAnnually: number = 0;
  ConveyanceMonthly: number = 0;
  ConveyanceAnnually: number = 0;
  HRAMonthly: number = 0;
  HRAAnnually: number = 0;
  MedicalMonthly: number = 0;
  MedicalAnnually: number = 0;
  CarRunningMonthly: number = 0;
  CarRunningAnnually: number = 0;
  InternetMonthly: number = 0;
  InternetAnnually: number = 0;
  TravelMonthly: number = 0;
  TravelAnnually: number = 0;
  ShiftMonthly: number = 0;
  ShiftAnnually: number = 0;
  SpecialMonthly: number = 0;
  SpecialAnnually: number = 0;
  GrossMonthly: number = 0;
  GrossAnnually: number = 0;
  InsuranceMonthly: number = 0;
  InsuranceAnnually: number = 0;
  PFMonthly: number = 0;
  PFAnnually: number = 0;
  GratuityMonthly: number = 0;
  GratuityAnnually: number = 0;
  CTCMonthly: number = 0;
  CTCAnnually: number = 0;
  ExpectedCTCAnnually: number = 0;
  FoodMonthly: number = 0;
  FoodAnnually: number = 0;
}
