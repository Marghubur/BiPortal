import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pf-esi-setup',
  templateUrl: './pf-esi-setup.component.html',
  styleUrls: ['./pf-esi-setup.component.scss']
})
export class PfEsiSetupComponent implements OnInit {
  PFandESIForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.PFandESIForm = this.fb.group({
      PFbtn: new FormControl (''),
      PfAmountLimit: new FormControl (''),
      PfCalculated: new FormControl (''),
      AllowOverridingPf: new FormControl (''),
      PfEmployerContribution: new FormControl (''),
      EmployerPFLimit: new FormControl (''),
      HidePfEmployer: new FormControl (''),
      PayOtherCharges: new FormControl (''),
      AllowVPF: new FormControl (''),
      Esibtn: new FormControl (''),
      EligibleEsiSalary: new FormControl (''),
      EsiEmployeeContribution: new FormControl (''),
      EsiEmployerContribution: new FormControl (''),
      AllowOverridingEsi: new FormControl (''),
      HideEsiEmployer: new FormControl(''),
      EsiExcludeEmployer: new FormControl(''),
      EsiExcludeEmployee: new FormControl(''),
      RestrictEsi: new FormControl(''),
      IncludeBonusEsiEligibility: new FormControl(''),
      IncludeBonusEsiContribution: new FormControl(''),
      btnradio: new FormControl ('')
    })
  }

  submitPFESISetting() {
    console.log(this.PFandESIForm.value);
  }

}
