import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, PlaceEmpty, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';

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
  isCreated: boolean = false;
  isUpdated: boolean = false;

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
        if (this.isCreated = true) {
          this.employeeModal.ActualPackage = 0;
          this.employeeModal.FinalPackage = 0;
          this.employeeModal.TakeHomeByCandidate = 0;
          this.employeeModal.AllocatedClientId = 0;
        }
        if (this.isCreated = false) {
          if (this.allocatedClients != null && this.allocatedClients.length > 0) {
            let mappedClient = this.allocatedClients[0];
            this.employeeModal.FinalPackage = mappedClient.FinalPackage;
            this.employeeModal.ActualPackage = mappedClient.ActualPackage;
            this.employeeModal.TakeHomeByCandidate = mappedClient.TakeHomeByCandidate;
            this.employeeModal.AllocatedClientId = mappedClient.ClientUid;
            this.assignedActiveClientUid = mappedClient.ClientUid;
            this.isCreated = true;
          }
        }
        if (this.allocatedClients.length > 0)
          this.isAllocated = true;
      }
      this.initForm();
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

  initForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl(this.employeeModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.employeeModal.LastName),
      Mobile: new FormControl(this.employeeModal.Mobile, [Validators.required]),
      Email: new FormControl(this.employeeModal.Email, [Validators.required]),
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
      let updateClientRequest = {
        "AllocatedClientId": Number(this.employeeForm.get("AllocatedClientId").value),
        "ActualPackage": Number(this.employeeForm.get("ActualPackage").value),
        "FinalPackage": Number(this.employeeForm.get("FinalPackage").value),
        "TakeHomeByCandidate": Number(this.employeeForm.get("TakeHomeByCandidate").value),
        "EmployeeUid": this.employeeUid
      }

      this.isInsertingNewClient = true;
      if (this.assignedActiveClientUid > 0)
        this.isInsertingNewClient = false;
      this.http.post(`employee/UpdateEmployeeDetail/${!this.isInsertingNewClient}`, updateClientRequest).then((response: ResponseModel) => {
        if (response.ResponseBody && response.ResponseBody != {}) {
          if (this.isInsertingNewClient) {
            this.allocatedClients.push(response.ResponseBody.Table[0]);
            this.allocatedClients.map(elem => elem.IsActive = 0);
            Toast("Added Successfully");
          } else {
            let currentClient = this.allocatedClients.find(x => x.ClientUid == this.currentClientId);
            currentClient.ActualPackage = updateClientRequest.ActualPackage;
            currentClient.FinalPackage = updateClientRequest.FinalPackage;
            currentClient.TakeHomeByCandidate = updateClientRequest.TakeHomeByCandidate;
            Toast("Updated Successfully");
          }
          this.isAllocated = true;
        } else {
          this.common.ShowToast("Fail to add");
        }
      });
    } else {
      this.common.ShowToast("Please select client first");
    }


  }

  bindCurrentClientDetail(clientId: number) {
    if (clientId) {
      let currentClient = this.allocatedClients.find(x => x.ClientUid == clientId);
      this.isCreated = false;
      this.isUpdated = true;

      if (currentClient) {
        //this.currentClientId = clientId;
        this.employeeForm.get("AllocatedClientId").setValue(clientId);
        this.employeeForm.get("ActualPackage").setValue(currentClient.ActualPackage);
        this.employeeForm.get("FinalPackage").setValue(currentClient.FinalPackage);
        this.employeeForm.get("TakeHomeByCandidate").setValue(currentClient.TakeHomeByCandidate);
        this.allocatedClients.map(elem => elem.IsActive = 0);
        currentClient.IsActive = 1;
      }
    }
  }

  deleteCurrentClient(clientId: number) {

  }

  reset() { }
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
