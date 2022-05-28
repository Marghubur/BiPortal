import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
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
    let pfData = data["SalaryComponent"].find(x => x.ComponentId == "PF");
    let esiData = data["SalaryComponent"].find(x => x.ComponentId == "ESI");
    let pfesidata:Ipfesisetting = data["PfEsiSettings"]

    let employeeAmount = 0;
    if(esiData.EmployeeContribution)
      employeeAmount = esiData.Amount;

    let employerAmount = 0;
    if(esiData.EmployerContribution)
      employerAmount = esiData.Amount;



    this.pfesi = {
      PFEnable: pfData.IsActive,
      PfAmountLimit: pfesidata.PF_Limit_Amount_Statutory.toString(),
      IsPfInPercentage: pfData.CalculateInPercentage,
      AllowOverridingPf: pfesidata.PF_Allow_overriding.toString(),
      PfEmployerContribution: pfesidata.PF_EmployerContribution_Outside_GS,
      EmployerPFLimit: pfData.EmployerContribution,
      HidePfEmployer: pfData.IncludeInPayslip,
      PayOtherCharges: pfesidata.PF_OtherChgarges_Outside_GS,
      AllowVPF: pfesidata.PF_Employess_Contribute_VPF,
      EsiEnable: esiData.IsActive.toString(),
      EligibilitySalaryForESI: esiData.Amount,
      EsiEmployeeContribution: esiData.EmployeeContribution,
      EsiEmployerContribution: esiData.EmployerContribution,
      EsiEmployerContributionOuside: pfesidata.ESI_EmployerContribution_Outside_GS,
      AllowOverridingEsi: pfesidata.ESI_Allow_overriding,
      HideEsiEmployer: esiData.IncludeInPayslip,
      EsiExcludeEmployer: pfesidata.ESI_Exclude_EmployerShare_fromGross,
      EsiExcludeEmployee: pfesidata.ESI_Exclude_EmpGratuity_fromGross,
      RestrictEsi: pfesidata.ESI_Restrict_Statutory,
      IncludeBonusEsiEligibility: pfesidata.ESI_IncludeBonuses_OTP_inGross_Eligibility,
      IncludeBonusEsiContribution: pfesidata.ESI_IncludeBonuses_OTP_inGross_Calculation,
      IsEmployerPFLimit: pfesidata.PF_IsEmployerPFLimit.toString()
    };
  }

  initForm() {
    this.PFandESIForm = this.fb.group({
      PFEnable: new FormControl (this.pfesi.PFEnable ? 'true' : 'false'),
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
      EsiEmployerContributionOuside: new FormControl(this.pfesi.EsiEmployerContributionOuside),
      RestrictEsi: new FormControl(this.pfesi.RestrictEsi),
      IncludeBonusEsiEligibility: new FormControl(this.pfesi.IncludeBonusEsiEligibility),
      IncludeBonusEsiContribution: new FormControl(this.pfesi.IncludeBonusEsiContribution),
      IsEmployerPFLimit: new FormControl(this.pfesi.IsEmployerPFLimit)
    })
  }

  submitPFESISetting() {
    let data:Ipfesi = this.PFandESIForm.value;

    var ESISetting = {
      ComponentId: 'ESI',
      Amount: data.EligibilitySalaryForESI,
      EmployeeContribution: data.EsiEmployeeContribution,
      EmployerContribution: data.EsiEmployerContribution,
      IsActive: data.EsiEnable,
      IsDeductions: true,
      IncludeInPayslip: data.HidePfEmployer
    };
    var PFSetting = {
      ComponentId: 'PF',
      CalculateInPercentage: data.IsPfInPercentage,
      EmployerContribution: data.EmployerPFLimit,
      IsActive: data.PFEnable,
      IsDeductions: true,
      IncludeInPayslip: data.HideEsiEmployer
    }
    var PFESISetting = {
      PfEsi_setting_Id: 1,
      PF_Limit_Amount_Statutory: data.PfAmountLimit,
      PF_Allow_overriding: data.AllowOverridingPf,
      PF_EmployerContribution_Outside_GS: data.PfEmployerContribution,
      PF_OtherChgarges_Outside_GS: data.PayOtherCharges,
      PF_Employess_Contribute_VPF: data.AllowVPF,
      ESI_Allow_overriding: data.AllowOverridingEsi,
      ESI_EmployerContribution_Outside_GS: data.EsiEmployerContributionOuside,
      ESI_Exclude_EmployerShare_fromGross: data.EsiExcludeEmployer,
      ESI_Exclude_EmpGratuity_fromGross: data.EsiExcludeEmployee,
      ESI_Restrict_Statutory: data.RestrictEsi,
      ESI_IncludeBonuses_OTP_inGross_Eligibility: data.IncludeBonusEsiEligibility,
      ESI_IncludeBonuses_OTP_inGross_Calculation: data.IncludeBonusEsiContribution,
      PF_IsEmployerPFLimit: data.IsEmployerPFLimit
    }

    let formData = new FormData();
    formData.append('PFSetting', JSON.stringify(PFSetting));
    formData.append('ESISetting', JSON.stringify(ESISetting));
    formData.append('PFESISetting', JSON.stringify(PFESISetting));
    this.http.post('Settings/PfEsiSetting', formData).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Setting changed")
    })
  }
}


interface Ipfesi {
  PFEnable: boolean;
  PfAmountLimit: string;
  IsPfInPercentage: boolean;
  AllowOverridingPf: string;
  PfEmployerContribution: boolean;
  EmployerPFLimit: number;
  HidePfEmployer: boolean;
  PayOtherCharges: boolean;
  AllowVPF: boolean;
  EsiEnable: string;
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
  EsiEmployerContributionOuside: boolean;
  IsEmployerPFLimit: string;
}

interface Ipfesisetting {
  PfEsi_setting_Id: number,
  PF_Limit_Amount_Statutory: boolean;
	PF_Allow_overriding: boolean;
  PF_EmployerContribution_Outside_GS: boolean;
  PF_OtherChgarges_Outside_GS: boolean;
	PF_Employess_Contribute_VPF: boolean;
  ESI_Allow_overriding: boolean;
  ESI_EmployerContribution_Outside_GS: boolean;
  ESI_Exclude_EmployerShare_fromGross: boolean;
  ESI_Exclude_EmpGratuity_fromGross: boolean;
  ESI_Restrict_Statutory: boolean;
  ESI_IncludeBonuses_OTP_inGross_Eligibility: boolean;
  ESI_IncludeBonuses_OTP_inGross_Calculation: boolean;
  PF_IsEmployerPFLimit: boolean;
}
