import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, PlaceEmpty, Toast } from 'src/providers/common-service/common.service';
import { UserImage } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manageemployee',
  templateUrl: './manageemployee.component.html',
  styleUrls: ['./manageemployee.component.scss']
})
export class ManageemployeeComponent implements OnInit, OnDestroy {
  model: NgbDateStruct;
  submitted: boolean = false;
  employeeForm: FormGroup = null;
  employeeModal: EmployeeDetail = null;
  employees: Array<EmployeeDetail> = [];
  grandTotalAmount: number = 0;
  packageAmount: number = 0;
  isDeveloperSelected: boolean = false;
  cgstAmount: number = 0;
  sgstAmount: number = 0;
  igstAmount: number = 0;
  months: Array<any> = null;
  isLoading: boolean = false;
  clients: Array<any> = [];
  allocatedClients: Array<any> = [];
  isAllocated: boolean = false;
  isUpdate: boolean = false;
  employeeUid: number = 0;
  isInsertingNewClient: boolean = true;
  assignedActiveClientUid: number = 0;
  idReady: boolean = false;
  currentClientId: number = 0;
  isUpdated: boolean = false;
  activeClient: any = null;
  profileURL: string = UserImage;

  get f() {
    let data = this.employeeForm.controls;
    return data;
  }

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private calendar: NgbCalendar,
    private nav: iNavigation
  ) { }

  ngOnDestroy() {
    this.nav.resetValue();
  }

  ngOnInit(): void {
    this.model = this.calendar.getToday();
    let data = this.nav.getValue();
    this.employeeUid = 0;
    this.isUpdate = false;
    if (data) {
      this.employeeUid = data.EmployeeUid;
      this.loadData(this.employeeUid);
      this.isUpdate = true;
    } else {
      this.employeeModal = new EmployeeDetail();
      this.initForm();
      this.idReady = true;
    }
  }

  loadData(employeeId: number) {
    this.http.get(`employee/GetManageEmployeeDetail/${employeeId}`).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.clients = res.ResponseBody.Clients;
        if (res.ResponseBody.Employee.length > 0)
          this.employeeModal = res.ResponseBody.Employee[0] as EmployeeDetail;
        this.allocatedClients = res.ResponseBody.AllocatedClients;
        if(this.allocatedClients.length > 0) {
          this.allocatedClients.map((item, index) => {
            if(index == 0) {
              this.activeClient = item;
              item["IsActiveRow"] = 1;
             } else {
              item["IsActiveRow"] = 0;
             }
          });
          this.isAllocated = true;
        }
      }
      this.bindForm();
      this.idReady = true;
    });
  }

  daysInMonth(monthNumber: number) {
    var now = new Date();
    return new Date(now.getFullYear(), monthNumber, 0).getDate();
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.employeeForm.controls["dateOfBilling"].setValue(date);
  }

  bindForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl(this.employeeModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.employeeModal.LastName),
      Mobile: new FormControl(this.employeeModal.Mobile),
      Email: new FormControl(this.employeeModal.Email),
      SecondaryMobile: new FormControl(this.employeeModal.SecondaryMobile),
      FatherName: new FormControl(this.employeeModal.FatherName),
      MotherName: new FormControl(this.employeeModal.MotherName),
      SpouseName: new FormControl(this.employeeModal.SpouseName),
      State: new FormControl(this.employeeModal.State),
      City: new FormControl(this.employeeModal.City),
      Pincode: new FormControl(PlaceEmpty(this.employeeModal.Pincode)),
      Address: new FormControl(this.employeeModal.Address),
      PANNo: new FormControl(this.employeeModal.PANNo),
      AadharNo: new FormControl(this.employeeModal.AadharNo),
      AccountNumber: new FormControl(this.employeeModal.AccountNumber),
      BankName: new FormControl(this.employeeModal.BankName),
      IFSCCode: new FormControl(this.employeeModal.IFSCCode),
      Domain: new FormControl(this.employeeModal.Domain),
      Specification: new FormControl(this.employeeModal.Specification),
      ExprienceInYear: new FormControl(PlaceEmpty(this.employeeModal.ExprienceInYear)),
      LastCompanyName: new FormControl(this.employeeModal.LastCompanyName),
      IsPermanent: new FormControl(this.employeeModal.IsPermanent),
      AllocatedClientId: new FormControl(this.employeeModal.AllocatedClientId),
      ActualPackage: new FormControl(this.employeeModal.ActualPackage, [Validators.required]),
      FinalPackage: new FormControl(this.employeeModal.FinalPackage, [Validators.required]),
      TakeHomeByCandidate: new FormControl(this.employeeModal.TakeHomeByCandidate, [Validators.required]),
      EmployeeUid: new FormControl(this.employeeModal.EmployeeUid),
      BranchName: new FormControl(this.employeeModal.BranchName),
      AllocatedClientName: new FormControl(this.employeeModal.AllocatedClientName)
    });
  }

  initForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl("", [Validators.required]),
      LastName: new FormControl("", [Validators.required]),
      Mobile: new FormControl("0000000000"),
      Email: new FormControl("xxxxx@xxx.com"),
      SecondaryMobile: new FormControl(""),
      FatherName: new FormControl(""),
      MotherName: new FormControl(""),
      SpouseName: new FormControl(""),
      State: new FormControl(""),
      City: new FormControl(""),
      Pincode: new FormControl(PlaceEmpty("")),
      Address: new FormControl(""),
      PANNo: new FormControl(""),
      AadharNo: new FormControl(""),
      AccountNumber: new FormControl(""),
      BankName: new FormControl(""),
      IFSCCode: new FormControl(""),
      Domain: new FormControl(""),
      Specification: new FormControl(""),
      ExprienceInYear: new FormControl(PlaceEmpty("")),
      LastCompanyName: new FormControl(""),
      IsPermanent: new FormControl(""),
      AllocatedClientId: new FormControl(""),
      ActualPackage: new FormControl(""),
      FinalPackage: new FormControl(""),
      TakeHomeByCandidate: new FormControl(""),
      EmployeeUid: new FormControl(""),
      BranchName: new FormControl(""),
      AllocatedClientName: new FormControl("")
    });
  }

  RegisterEmployee() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.employeeForm.get('FirstName').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('Email').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('Mobile').errors !== null)
      errroCounter++;

    this.employeeModal = this.employeeForm.value;

    if (this.employeeModal.Pincode === null)
      this.employeeModal.Pincode = 0;
    if (this.employeeModal.ExprienceInYear === null)
      this.employeeModal.ExprienceInYear = 0;
    if (this.employeeModal.AllocatedClientId === null)
      this.employeeModal.AllocatedClientId = 0;
    if (this.employeeModal.ActualPackage === null)
      this.employeeModal.ActualPackage = 0;
    if (this.employeeModal.FinalPackage === null)
      this.employeeModal.FinalPackage = 0;
    if (this.employeeModal.TakeHomeByCandidate === null)
      this.employeeModal.TakeHomeByCandidate = 0;

    if (errroCounter == 0) {
      
      let formData = new FormData();
      formData.append("employeeDetail", JSON.stringify(this.employeeForm.value));
      formData.append("allocatedClients", JSON.stringify(this.employeeForm.value));

      this.http.post("login/employeeregistration", this.employeeForm.value).then((response: ResponseModel) => {
        if (response.ResponseBody !== null && response.ResponseBody !== "expired") {
          Toast(response.ResponseBody);
        } else {
          if (response.ResponseBody !== "expired") {
            Toast("Your session got expired. Log in again.");
          }
        }

        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
        Toast("Registration fail. Please contact admin.")
      });
    } else {
      this.isLoading = false;
      Toast("Please correct all the mandaroty field marded red");
    }
  }

  addDetail() {
    if (this.employeeForm.get("AllocatedClientId").value > 0) {
      this.activeClient.TakeHomeByCandidate = Number(this.employeeForm.get("TakeHomeByCandidate").value);
      this.http.post(`employee/UpdateEmployeeDetail/${true}`, this.activeClient).then((response: ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody != {}) {
          Toast("Updated Successfully");
        } else {
          ErrorToast("Fail to add");
        }
      });
    } else {
      ErrorToast("Please select client first");
    }
  }

  bindCurrentClientDetail(clientId: number) {
    if (clientId) {
      this.activeClient = this.allocatedClients.find(x => x.ClientUid == clientId);
      this.isUpdated = true;

      if (this.activeClient) {
        //this.currentClientId = clientId;
        this.employeeForm.get("AllocatedClientId").setValue(clientId);
        this.employeeForm.get("ActualPackage").setValue(this.activeClient.ActualPackage);
        this.employeeForm.get("FinalPackage").setValue(this.activeClient.FinalPackage);
        this.employeeForm.get("TakeHomeByCandidate").setValue(this.activeClient.TakeHomeByCandidate);
        this.allocatedClients.map(item => item["IsActiveRow"] = 0);
        this.activeClient.IsActiveRow = 1;
      }
    }
  }

  deleteCurrentClient(client: any) {
    this.activeClient = client;
    $("#remoteClient").modal('show');
  }

  reset() {
    this.employeeForm.reset();
  }

  removeClient(){
    this.http.delete(`clients/DeactivateClient`, {
      EmployeeUid:  this.activeClient.EmployeeUid,
      EmployeeMappedClientsUid: this.activeClient.EmployeeMappedClientsUid
    }).then(response => {
      if(response.ResponseBody) {
        this.allocatedClients = response.ResponseBody.Table;
        Toast("Client de-activated successfully.");
      } else {
        ErrorToast("Fail de-activated it. Please contact to admin.");
      }

      $("#remoteClient").modal('hide');
    })
  }
}

export class EmployeeDetail {
  EmployeeUid: number = 0;
  FirstName: string = null;
  LastName: string = null;
  Mobile: string = null;
  Email: string = null;
  BranchName: string = null;
  SecondaryMobile: string = null;
  FatherName: string = null;
  MotherName: string = null;
  SpouseName: string = null;
  State: string = null;
  City: string = null;
  Pincode: number = null;
  Address: string = null;
  PANNo: string = null;
  AadharNo: string = null;
  AccountNumber: string = null;
  BankName: string = null;
  IFSCCode: string = null;
  Domain: string = null;
  Specification: string = null;
  ExprienceInYear: number = null;
  LastCompanyName: string = null;
  IsPermanent: boolean = false;
  AllocatedClientId: number = null;
  AllocatedClientName: string = null;
  ActualPackage: number = null;
  FinalPackage: number = null;
  TakeHomeByCandidate: number = null;
}
