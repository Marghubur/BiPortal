import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { PlaceEmpty, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  model: NgbDateStruct;
  submitted: boolean = false;
  manageUserForm: FormGroup = null;
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
  User: string;
  userDetail: UserDetail = new UserDetail();

  @Output() authentication = new EventEmitter();

  get f() {
    let data = this.manageUserForm.controls;
    return data;
  }

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private nav: iNavigation,
    private local: ApplicationStorage,
    private user: UserService
  ) { }

  ngOnInit(): void {
    this.model = this.calendar.getToday();
    this.employeeModal = new EmployeeDetail();
    this.initForm();

    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
    this.userDetail["TokenExpiryDuration"] = new Date();
    else
    this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.loadData(this.userDetail)
    }
  }

  loadData(user: any) {
    this.http.post(`Login/GetUserDetail`, { MobileNo: user.Mobile, Email: user.EmailId }).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.employeeModal = res.ResponseBody as EmployeeDetail;
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
    this.manageUserForm.controls["dateOfBilling"].setValue(date);
  }

  bindForm() {
    this.manageUserForm = this.fb.group({
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
    this.manageUserForm = this.fb.group({
      FirstName: new FormControl("", [Validators.required]),
      LastName: new FormControl("", [Validators.required]),
      Mobile: new FormControl("0000000000"),
      Email: new FormControl("xxxxx@xxx.com"),
      SecondaryMobile: new FormControl("")
    });
  }

  RegisterEmployee() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.manageUserForm.get('FirstName').errors !== null)
      errroCounter++;
    if (this.manageUserForm.get('Email').errors !== null)
      errroCounter++;
    if (this.manageUserForm.get('Mobile').errors !== null)
      errroCounter++;

    this.employeeModal = this.manageUserForm.value;
    if (errroCounter == 0) {
      this.http.post("login/employeeregistration", this.manageUserForm.value).then((response: ResponseModel) => {
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

  // addDetail() {
  //   if (this.manageUserForm.get("AllocatedClientId").value > 0) {
  //     let updateClientRequest = {
  //       "AllocatedClientId": Number(this.manageUserForm.get("AllocatedClientId").value),
  //       "ActualPackage": Number(this.manageUserForm.get("ActualPackage").value),
  //       "FinalPackage": Number(this.manageUserForm.get("FinalPackage").value),
  //       "TakeHomeByCandidate": Number(this.manageUserForm.get("TakeHomeByCandidate").value),
  //       "EmployeeUid": this.employeeUid
  //     }

  //     this.isInsertingNewClient = true;
  //     if (this.assignedActiveClientUid > 0)
  //       this.isInsertingNewClient = false;
  //     this.http.post(`employee/UpdateEmployeeDetail/${!this.isInsertingNewClient}`, updateClientRequest).then((response: ResponseModel) => {
  //       if (response.ResponseBody && response.ResponseBody != {}) {
  //         if (this.isInsertingNewClient) {
  //           this.allocatedClients.push(response.ResponseBody.Table[0]);
  //           this.allocatedClients.map(elem => elem.IsActive = 0);
  //           Toast("Added Successfully");
  //         } else {
  //           let currentClient = this.allocatedClients.find(x => x.ClientUid == this.currentClientId);
  //           currentClient.ActualPackage = updateClientRequest.ActualPackage;
  //           currentClient.FinalPackage = updateClientRequest.FinalPackage;
  //           currentClient.TakeHomeByCandidate = updateClientRequest.TakeHomeByCandidate;
  //           Toast("Updated Successfully");
  //         }
  //         this.isAllocated = true;
  //       } else {
  //         this.common.ShowToast("Fail to add");
  //       }
  //     });
  //   } else {
  //     this.common.ShowToast("Please select client first");
  //   }


  // }

  reset() {
    this.manageUserForm.reset();
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
