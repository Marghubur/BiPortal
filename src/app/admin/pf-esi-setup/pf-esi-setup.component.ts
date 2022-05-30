import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import 'bootstrap';
declare var $: any;

@Component({
  selector: 'app-pf-esi-setup',
  templateUrl: './pf-esi-setup.component.html',
  styleUrls: ['./pf-esi-setup.component.scss']
})
export class PfEsiSetupComponent implements OnInit, AfterViewChecked {
  PFandESIForm: FormGroup;
  pfesi: Ipfesi = null;
  IsReady: boolean = false;
  isLoading: boolean = false;
  isallowChild: boolean = false;
  isallowPFamount:boolean = false;
  isallowPFLimit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: AjaxService
  ) { }
  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip();
  }

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
    let pfesidata = data["PfEsiSettings"];

    if(pfesidata == null) {
      pfesidata = {
        PfEsi_setting_Id: null,
        IsPF_Limit_Amount_Statutory: false,
        IsPF_Allow_overriding: false,
        IsPF_EmployerContribution_Outside_GS: false,
        IsPF_OtherChgarges: false,
        IsPFAllowVPF: false,
        IsESI_Allow_overriding: false,
        IsESI_EmployerContribution_Outside_GS: false,
        IsESI_Exclude_EmployerShare: false,
        IsESI_Exclude_EmpGratuity: false,
        IsESI_Restrict_Statutory: false,
        IsESI_IncludeBonuses_Eligibility: false,
        IsESI_IncludeBonuses_Calculation: false,
        IsPF_Employer_LimitContribution: false
      };
    }

    let employeeAmount = 0;
    if(esiData.EmployeeContribution)
      employeeAmount = esiData.Amount;

    let employerAmount = 0;
    if(esiData.EmployerContribution)
      employerAmount = esiData.Amount;

    this.pfesi = {
      PFEnable: pfData.IsActive,
      IsPfCalculateInPercentage: pfData.CalculateInPercentage,
      IsAllowOverridingPf: pfesidata.IsPF_Allow_overriding,
      IsPfAmountLimitStatutory: pfesidata.IsPF_Limit_Amount_Statutory,
      IsPfEmployerContribution: pfesidata.IsPF_EmployerContribution_Outside_GS,
      EmployerPFLimit: pfData.EmployerContribution,
      IsHidePfEmployer: pfData.IncludeInPayslip,
      IsPayOtherCharges: pfesidata.IsPF_OtherChgarges,
      IsAllowVPF: pfesidata.IsPFAllowVPF,
      EsiEnable: esiData.IsActive,
      EligibilitySalaryForESI: esiData.Amount,
      EsiEmployeeContribution: esiData.EmployeeContribution,
      EsiEmployerContribution: esiData.EmployerContribution,
      IsEsiEmployerContributionOutside: pfesidata.IsESI_EmployerContribution_Outside_GS,
      IsAllowOverridingEsi: pfesidata.IsESI_Allow_overriding,
      IsHideEsiEmployer: esiData.IncludeInPayslip,
      IsEsiExcludeEmployerShare: pfesidata.IsESI_Exclude_EmployerShare,
      IsEsiExcludeEmployeeGratuity: pfesidata.IsESI_Exclude_EmpGratuity,
      IsRestrictEsi: pfesidata.IsESI_Restrict_Statutory,
      IsIncludeBonusEsiEligibility: pfesidata.IsESI_IncludeBonuses_Eligibility,
      IsIncludeBonusEsiContribution: pfesidata.IsESI_IncludeBonuses_Calculation,
      IsEmployerPFLimitContribution: pfesidata.IsPF_Employer_LimitContribution
    };
  }

  initForm() {
    this.PFandESIForm = this.fb.group({
      PFEnable: new FormControl (this.pfesi.PFEnable? 'true' : 'false'),
      IsPfAmountLimitStatutory: new FormControl(this.pfesi.IsPfAmountLimitStatutory),
      IsPfCalculateInPercentage: new FormControl(this.pfesi.IsPfCalculateInPercentage),
      IsAllowOverridingPf: new FormControl (this.pfesi.IsAllowOverridingPf? 'true' : ''),
      IsPfEmployerContribution: new FormControl (this.pfesi.IsPfEmployerContribution),
      EmployerPFLimit: new FormControl (this.pfesi.EmployerPFLimit),
      IsHidePfEmployer: new FormControl (this.pfesi.IsHidePfEmployer),
      IsPayOtherCharges: new FormControl (this.pfesi.IsPayOtherCharges),
      IsAllowVPF: new FormControl (this.pfesi.IsAllowVPF),
      EsiEnable: new FormControl (this.pfesi.EsiEnable? 'true' : 'false'),
      EligibilitySalaryForESI: new FormControl (this.pfesi.EligibilitySalaryForESI),
      EsiEmployeeContribution: new FormControl (this.pfesi.EsiEmployeeContribution),
      EsiEmployerContribution: new FormControl (this.pfesi.EsiEmployerContribution),
      IsAllowOverridingEsi: new FormControl (this.pfesi.IsAllowOverridingEsi),
      IsHideEsiEmployer: new FormControl(this.pfesi.IsHideEsiEmployer),
      IsEsiExcludeEmployerShare: new FormControl(this.pfesi.IsEsiExcludeEmployerShare),
      IsEsiExcludeEmployeeGratuity: new FormControl(this.pfesi.IsEsiExcludeEmployeeGratuity),
      IsEsiEmployerContributionOutside: new FormControl(this.pfesi.IsEsiEmployerContributionOutside),
      IsRestrictEsi: new FormControl(this.pfesi.IsRestrictEsi),
      IsIncludeBonusEsiEligibility: new FormControl(this.pfesi.IsIncludeBonusEsiEligibility),
      IsIncludeBonusEsiContribution: new FormControl(this.pfesi.IsIncludeBonusEsiContribution),
      IsEmployerPFLimitContribution: new FormControl(this.pfesi.IsEmployerPFLimitContribution? 'true' : '')
    })
  }

  submitPFESISetting() {
    this.isLoading = true;
    let data:Ipfesi = this.PFandESIForm.value;

    var ESISetting = {
      ComponentId: 'ESI',
      Amount: data.EligibilitySalaryForESI,
      EmployeeContribution: data.EsiEmployeeContribution,
      EmployerContribution: data.EsiEmployerContribution,
      IsActive: data.EsiEnable,
      IsDeductions: true,
      IncludeInPayslip: data.IsHidePfEmployer
    };
    var PFSetting = {
      ComponentId: 'PF',
      CalculateInPercentage: data.IsPfCalculateInPercentage,
      EmployerContribution: data.EmployerPFLimit,
      IsActive: data.PFEnable,
      IsDeductions: true,
      IncludeInPayslip: data.IsHideEsiEmployer
    }
    var PFESISetting = {
      PfEsi_setting_Id: 1,
      IsPF_Limit_Amount_Statutory: data.IsPfAmountLimitStatutory,
      IsPF_Allow_overriding: data.IsAllowOverridingPf,
      IsPF_EmployerContribution_Outside_GS: data.IsPfEmployerContribution,
      IsPF_OtherChgarges: data.IsPayOtherCharges,
      IsPFAllowVPF: data.IsAllowVPF,
      IsESI_Allow_overriding: data.IsAllowOverridingEsi,
      IsESI_EmployerContribution_Outside_GS: data.IsEsiEmployerContributionOutside,
      IsESI_Exclude_EmployerShare: data.IsEsiExcludeEmployerShare,
      IsESI_Exclude_EmpGratuity: data.IsEsiExcludeEmployeeGratuity,
      IsESI_Restrict_Statutory: data.IsRestrictEsi,
      IsESI_IncludeBonuses_Eligibility: data.IsIncludeBonusEsiEligibility,
      IsESI_IncludeBonuses_Calculation: data.IsIncludeBonusEsiContribution,
      IsPF_Employer_LimitContribution: data.IsEmployerPFLimitContribution
    }

    let formData = new FormData();
    formData.append('PFSetting', JSON.stringify(PFSetting));
    formData.append('ESISetting', JSON.stringify(ESISetting));
    formData.append('PFESISetting', JSON.stringify(PFESISetting));
    this.http.post('Settings/PfEsiSetting', formData).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Setting changed")
    })
    this.isLoading = false;
  }

  enableChildList(e: boolean) {
    if (e == false) {
      document.querySelector('[name="IsAllowOverridingPf"]').removeAttribute("disabled");
    } else {
      document.querySelector('[name="IsAllowOverridingPf"]').setAttribute("disabled", '');
      document.querySelector('[name="IsAllowOverridingPf"]').setAttribute("value", '');
    }
    this.isallowChild = !this.isallowChild;
  }

  allowPFContribution(e: boolean) {
    if (e == false) {
      document.querySelector('[name="IsEmployerPFLimitContribution"]').removeAttribute("disabled");
    } else {
      document.querySelector('[name="IsEmployerPFLimitContribution"]').setAttribute("disabled", '');
      this.isallowPFamount = false;
    }
    this.isallowPFLimit = !this.isallowPFLimit;
  }

  enablePfAmount(e: boolean) {
    this.isallowPFamount = !this.isallowPFamount;
  };
}


interface Ipfesi {
  PFEnable: boolean;
  IsPfAmountLimitStatutory: boolean;
  IsPfCalculateInPercentage: boolean;
  IsAllowOverridingPf: boolean;
  IsPfEmployerContribution: boolean;
  EmployerPFLimit: number;
  IsHidePfEmployer: boolean;
  IsPayOtherCharges: boolean;
  IsAllowVPF: boolean;
  EsiEnable: boolean;
  EligibilitySalaryForESI: number;
  EsiEmployeeContribution: number;
  EsiEmployerContribution: number;
  IsAllowOverridingEsi: boolean;
  IsHideEsiEmployer: boolean;
  IsEsiExcludeEmployerShare: boolean;
  IsEsiExcludeEmployeeGratuity: boolean;
  IsRestrictEsi: boolean;
  IsIncludeBonusEsiEligibility: boolean;
  IsIncludeBonusEsiContribution: boolean;
  IsEsiEmployerContributionOutside: boolean;
  IsEmployerPFLimitContribution: boolean;
}

interface Ipfesisetting {
  PfEsi_setting_Id: number,
  IsPF_Limit_Amount_Statutory: boolean;
	IsPF_Allow_overriding: boolean;
  IsPF_EmployerContribution_Outside_GS: boolean;
  IsPF_OtherChgarges: boolean;
	IsPFAllowVPF: boolean;
  IsESI_Allow_overriding: boolean;
  IsESI_EmployerContribution_Outside_GS: boolean;
  IsESI_Exclude_EmployerShare: boolean;
  IsESI_Exclude_EmpGratuity: boolean;
  IsESI_Restrict_Statutory: boolean;
  IsESI_IncludeBonuses_Eligibility: boolean;
  IsESI_IncludeBonuses_Calculation: boolean;
  IsPF_Employer_LimitContribution: boolean;
}
