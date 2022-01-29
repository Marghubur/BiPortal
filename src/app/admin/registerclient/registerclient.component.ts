import { Component, OnDestroy, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { ResopnseModel } from 'src/auth/jwtService';

@Component({
  selector: 'app-registerclient',
  templateUrl: './registerclient.component.html',
  styleUrls: ['./registerclient.component.scss']
})
export class RegisterclientComponent implements OnInit, OnDestroy {
  submitted: boolean = false;
  clientForm: FormGroup = null;
  clientModal: clientModal = null;
  isLoading: boolean = false;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private nav: iNavigation
  ) { }

  ngOnDestroy() {
    this.nav.resetValue();
  }

  ngOnInit(): void {
    let data = this.nav.getValue();
    this.clientModal = new clientModal();
    if (data !== null && data !== "") {
      this.clientModal = data as clientModal;
    }
    this.initForm();
  }


  get f() {
    let data = this.clientForm.controls;
    return data;
  }

  initForm() {
    this.clientForm = this.fb.group({
      ClientId: new FormControl(this.clientModal.ClientId),
      ClientName: new FormControl(this.clientModal.ClientName, [Validators.required]),
      MobileNo: new FormControl(this.clientModal.MobileNo),
      PrimaryPhoneNo: new FormControl(this.clientModal.PrimaryPhoneNo, [Validators.required]),
      SecondaryPhoneNo: new FormControl(this.clientModal.SecondaryPhoneNo),
      Email: new FormControl(this.clientModal.Email, [Validators.required]),
      Fax: new FormControl(this.clientModal.Fax),
      FirstAddress: new FormControl(this.clientModal.FirstAddress),
      SecondAddress: new FormControl(this.clientModal.SecondAddress),
      ThirdAddress: new FormControl(this.clientModal.ThirdAddress),
      ForthAddress: new FormControl(this.clientModal.ForthAddress),
      Pincode: new FormControl(this.clientModal.Pincode === 0 ? null : this.clientModal.Pincode),
      City: new FormControl(this.clientModal.City),
      State: new FormControl(this.clientModal.State),
      Country: new FormControl(this.clientModal.Country),
      GSTNO: new FormControl(this.clientModal.GSTNO),
      AccountNo: new FormControl(this.clientModal.AccountNo),
      BankName: new FormControl(this.clientModal.BankName),
      BranchName: new FormControl(this.clientModal.BranchName),
      IFSC: new FormControl(this.clientModal.IFSC),
      PanNo: new FormControl(this.clientModal.PanNo),
      AdminId: new FormControl(this.clientModal.AdminId)
    });
  }

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;

    if (this.clientForm.get("ClientName").value === "")
      errroCounter++;

    if (this.clientForm.get("PrimaryPhoneNo").value === "")
      errroCounter++;

    if (this.clientForm.get("Email").value === "")
      errroCounter++;

    let clientDetail = this.clientForm.value;

    if (clientDetail.Pincode === null || clientDetail.Pincode == "")
      clientDetail.Pincode = 0;

    clientDetail.IsActive = true;

    if (errroCounter === 0) {
      let request: clientModal = this.clientForm.value;
      this.http.post("Clients/RegisterClient", request).then((response: ResopnseModel) => {
        if (response.ResponseBody !== null) {
          this.nav.replaceValue(this.clientForm.value);
          this.common.ShowToast(response.ResponseBody);
        } else {
          this.common.ShowToast("Failed to generated, Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      this.common.ShowToast("All read marked fields are mandatory.");
    }
  }

  replaceWithOriginalValues() {

  }
}

class clientModal {
  ClientId: number = 0;
  ClientName: string = null;
  MobileNo: string = null;
  PrimaryPhoneNo: string = null;
  SecondaryPhoneNo: string = null;
  Email: string = null;
  Fax: string = null;
  FirstAddress: string = null;
  SecondAddress: string = null;
  ThirdAddress: string = null;
  ForthAddress: string = null;
  Pincode: number = 0;
  City: string = null;
  State: string = null;
  Country: string = null;
  GSTNO: string = null;
  AccountNo: string = null;
  BankName: string = null;
  BranchName: string = null;
  IFSC: string = null;
  PanNo: string = null;
  AdminId: number = 0
}