import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-pf-esi-setup',
  templateUrl: './pf-esi-setup.component.html',
  styleUrls: ['./pf-esi-setup.component.scss']
})
export class PfEsiSetupComponent implements OnInit {
  PFandESIForm: FormGroup;
  pfesi: Ipfesi = null;
  IsReady: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: AjaxService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.http.get("Settings/GetSalaryComponents").then(res => {
      if(res.ResponseBody) {
        this.IsReady = true;
        this.buildData(res.ResponseBody);
        this.initForm();
        Toast("Page data loaded successfully.");
      } else {
        ErrorToast("Page data loaded successfully.");
      }
    });
  }

  buildData(data: Array<any>) {
    let pfData = data.find(x => x.ComponentId == "PF");
    let esiData = data.find(x => x.ComponentId == "ESI");

    let employeeAmount = 0;
    if(esiData.EmployeeContribution)
      employeeAmount = esiData.Amount;

    let employerAmount = 0;
    if(esiData.EmployerContribution)
      employerAmount = esiData.Amount;

    this.pfesi = {
      PFEnable: false,
      PfAmountLimit: 10,
      IsPfInPercentage: pfData.CalculateInPercentage,
      AllowOverridingPf: false,
      PfEmployerContribution: true,
      EmployerPFLimit: pfData.Amount,
      HidePfEmployer: false,
      PayOtherCharges: false,
      AllowVPF: false,
      EsiEnable: false,
      EligibilitySalaryForESI: esiData.Amount,
      EsiEmployeeContribution: employeeAmount,
      EsiEmployerContribution: employerAmount,
      AllowOverridingEsi: false,
      HideEsiEmployer: false,
      EsiExcludeEmployer: false,
      EsiExcludeEmployee: false,
      RestrictEsi: false,
      IncludeBonusEsiEligibility: false,
      IncludeBonusEsiContribution: false
    };
  }

  initForm() {
    this.PFandESIForm = this.fb.group({
      PFEnable: new FormControl (this.pfesi.PFEnable),
      PfAmountLimit: new FormControl(this.pfesi.PfAmountLimit),
      IsPfInPercentage: new FormControl(this.pfesi.IsPfInPercentage),
      AllowOverridingPf: new FormControl (this.pfesi.AllowOverridingPf),
      PfEmployerContribution: new FormControl (this.pfesi.PfEmployerContribution),
      EmployerPFLimit: new FormControl (this.pfesi.EmployerPFLimit),
      HidePfEmployer: new FormControl (this.pfesi.HidePfEmployer),
      PayOtherCharges: new FormControl (this.pfesi.PayOtherCharges),
      AllowVPF: new FormControl (this.pfesi.AllowVPF),
      EsiEnable: new FormControl (this.pfesi.EsiEnable),
      EligibilitySalaryForESI: new FormControl (this.pfesi.EligibilitySalaryForESI),
      EsiEmployeeContribution: new FormControl (this.pfesi.EsiEmployeeContribution),
      EsiEmployerContribution: new FormControl (this.pfesi.EsiEmployerContribution),
      AllowOverridingEsi: new FormControl (this.pfesi.AllowOverridingEsi),
      HideEsiEmployer: new FormControl(this.pfesi.HideEsiEmployer),
      EsiExcludeEmployer: new FormControl(this.pfesi.EsiExcludeEmployer),
      EsiExcludeEmployee: new FormControl(this.pfesi.EsiExcludeEmployee),
      RestrictEsi: new FormControl(this.pfesi.RestrictEsi),
      IncludeBonusEsiEligibility: new FormControl(this.pfesi.IncludeBonusEsiEligibility),
      IncludeBonusEsiContribution: new FormControl(this.pfesi.IncludeBonusEsiContribution)
    })
  }

  submitPFESISetting() {
    console.log(this.PFandESIForm.value);
  }
}


interface Ipfesi {
  PFEnable: boolean;
  PfAmountLimit: number;
  IsPfInPercentage: boolean;
  AllowOverridingPf: boolean;
  PfEmployerContribution: boolean;
  EmployerPFLimit: number;
  HidePfEmployer: boolean;
  PayOtherCharges: boolean;
  AllowVPF: boolean;
  EsiEnable: boolean;
  EligibilitySalaryForESI: number;
  EsiEmployeeContribution: number;
  EsiEmployerContribution: number;
  AllowOverridingEsi: boolean;
  HideEsiEmployer: boolean;
  EsiExcludeEmployer: boolean;
  EsiExcludeEmployee: boolean;
  RestrictEsi: boolean;
  IncludeBonusEsiEligibility: boolean;
  IncludeBonusEsiContribution: boolean;
}
