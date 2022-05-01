import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, PlaceEmpty, Toast } from 'src/providers/common-service/common.service';
import { InsertOrUpdateSuccessfull, ProfileImage, Success, UserImage } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manageemployee',
  templateUrl: './manageemployee.component.html',
  styleUrls: ['./manageemployee.component.scss']
})
export class ManageemployeeComponent implements OnInit, OnDestroy {
  model: NgbDateStruct;
  joiningDatemodel: NgbDateStruct;
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
  fileDetail: Array<any> = [];
  activeAssignedClient: AssignedClients = new AssignedClients();
  ProfessuinalDetail_JSON: any = '';
  managerList: autoCompleteModal = null; 
  
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
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });

    this.model = this.calendar.getToday();
    let data = this.nav.getValue();
    this.employeeUid = 0;
    this.isUpdate = false;
    if (data) {
      this.employeeUid = data.EmployeeUid;
      this.ProfessuinalDetail_JSON = data.ProfessionalDetail_Json;
      this.loadData(this.employeeUid);
      this.isUpdate = true;
    } else {
      this.isUpdate = false;
      this.employeeModal = new EmployeeDetail();
      this.bindForm();
      this.idReady = true;
    }
  }

  buildProfileImage(fileDetail: any) {
    this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}.${fileDetail.FileExtension}`;
    this.employeeModal.FileId = fileDetail.FileId;
  }

  buildPageData(response: ResponseModel) {
    if (response.ResponseBody) {
      this.clients = response.ResponseBody.Clients;
      if (response.ResponseBody.Employee.length > 0)
        this.employeeModal = response.ResponseBody.Employee[0] as EmployeeDetail;
      this.allocatedClients = response.ResponseBody.AllocatedClients;
      let profileDetail = response.ResponseBody.FileDetail;
      if(profileDetail.length > 0) {
        this.buildProfileImage(profileDetail[0]);
      }
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
  }

  loadData(employeeId: number) {
    this.http.get(`employee/GetManageEmployeeDetail/${employeeId}`).then((res: ResponseModel) => {
      if(res.ResponseBody.EmployeesList) {
        this.managerList.data = [];
        this.managerList.placeholder = "Reporting Manager";
        this.managerList.data.push({
          value: 0,
          text: "Default Manager"
        });

        let i = 0;
        let managers = res.ResponseBody.EmployeesList;
        while(i < managers.length) {
          this.managerList.data.push({
            value: managers[i].EmployeeUid,
            text: `${managers[i].FirstName} ${managers[i].LastName}`
          });
          i++;
        }
      }
      this.buildPageData(res);
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
    this.employeeForm.controls["DOB"].setValue(date);
  }

  onJoiningDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month -1, e.day);
    this.employeeForm.get("DateOfJoining").setValue(date);
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
      EmployeeUid: new FormControl(this.employeeModal.EmployeeUid),
      BranchName: new FormControl(this.employeeModal.BranchName),
      AllocatedClientName: new FormControl(this.employeeModal.AllocatedClientName),
      ProfileImgPath: new FormControl(""),
      AllocatedClientId: new FormControl("0"),
      ActualPackage: new FormControl(null),
      FinalPackage: new FormControl(null),
      DateOfJoining: new FormControl(this.employeeModal.DateOfJoining),
      DOB: new FormControl(this.employeeModal.DOB),
      TakeHomeByCandidate: new FormControl(null),
      FileId: new FormControl(this.employeeModal.FileId),
      ReportingManagerId: new FormControl(this.employeeModal.ReportingManagerId),
      AllocatedClients: new FormArray(this.allocatedClients.map(x => this.buildAlocatedClients(x, false)))
    });
  }

  buildAlocatedClients(client: any, flag: boolean) {
    return this.fb.group({
      IsActive: new FormControl(true),
      IsActiveRow: new FormControl(flag),
      ClientUid: new FormControl(client.ClientUid),
      ClientName: new FormControl(client.ClientName),
      ActualPackage: new FormControl(client.ActualPackage),
      FinalPackage: new FormControl(client.FinalPackage),
      TakeHomeByCandidate: new FormControl(client.TakeHomeByCandidate),
      EmployeeUid: new FormControl(this.employeeModal.EmployeeUid),
      EmployeeMappedClientsUid: new FormControl(client.EmployeeMappedClientsUid),
      IsPermanent: new FormControl(false),
    });
  }

  get allocatedClient(): FormArray {
    return this.employeeForm.get ("AllocatedClients") as FormArray;
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
    if (this.employeeModal.FileId === null)
      this.employeeModal.FileId = 0;

    if (errroCounter == 0) {
      if (this.ProfessuinalDetail_JSON == null) {
        this.ProfessuinalDetail_JSON = null;
      }
      let formData = new FormData();
      formData.append("employeeDetail", JSON.stringify(this.employeeForm.value));
      formData.append("allocatedClients", JSON.stringify(this.employeeForm.value.AllocatedClients));
      formData.append("ProfessuinalDetail_JSON", this.ProfessuinalDetail_JSON)
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append(ProfileImage, file);

      this.http.post(`Employee/employeeregistration/${this.isUpdate}`, formData).then((response: ResponseModel) => {
        this.buildPageData(response);
        Toast(InsertOrUpdateSuccessfull);
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
    this.isAllocated = false;
    let clientId = Number(this.employeeForm.get("AllocatedClientId").value);
    if(isNaN(clientId) || clientId <= 0){
      ErrorToast("Invalid client selected");
      return;
    }

    this.activeAssignedClient.ClientUid = clientId;
    let actualPackage = Number(this.employeeForm.get("ActualPackage").value);
    if(isNaN(actualPackage)){
      ErrorToast("Invalid actual package supplied");
      return;
    }

    this.activeAssignedClient.ActualPackage = actualPackage;
    let finalPackage = Number(this.employeeForm.get("FinalPackage").value);
    if(isNaN(finalPackage)){
      ErrorToast("Invalid final package supplied");
      return;
    }

    this.activeAssignedClient.FinalPackage = finalPackage;
    let takeHomeByCandidate = Number(this.employeeForm.get("TakeHomeByCandidate").value);
    if(isNaN(takeHomeByCandidate)){
      ErrorToast("Invalid takehome package supplied");
      return;
    }

    this.activeAssignedClient.TakeHomeByCandidate = takeHomeByCandidate;
    if(finalPackage < actualPackage) {
      ErrorToast("Final package must be greater that or equal to Actual package.")
      return;
    }

    let employeeId = Number(this.employeeForm.get("EmployeeUid").value);
    if(isNaN(employeeId) || employeeId <= 0){
      ErrorToast("Invalid employee id selected");
      return;
    }
    this.activeAssignedClient.EmployeeUid = employeeId;

    if(actualPackage < takeHomeByCandidate) {
      ErrorToast("Actual package must be greater that or equal to TakeHome package.")
      return;
    }

    this.http.post(`employee/UpdateEmployeeDetail/${this.isUpdated}`, this.activeAssignedClient).then((response: ResponseModel) => {
      if (response.ResponseBody.Table) {
        this.allocatedClients = response.ResponseBody.Table;
        if(this.allocatedClients.length > 0) {
          let assignedClients: FormArray = this.employeeForm.get("AllocatedClients") as FormArray;
          assignedClients.clear();
          let apiClients: FormArray = this.fb.array(this.allocatedClients.map(x => this.buildAlocatedClients(x, (x.ClientUid == this.activeAssignedClient.ClientUid) ?? false)));
          this.employeeForm.setControl("AllocatedClients", apiClients);
        }
        Toast("Organization added/updated successfully.");
      } else {
        ErrorToast("Fail to add");
      }

      this.isAllocated = true;
    });
  }

  bindCurrentClientDetail(client: any) {
    if (client) {
      this.activeAssignedClient = client.value;
      this.employeeForm.get("AllocatedClientId").setValue(this.activeAssignedClient.ClientUid);
      this.employeeForm.get("ActualPackage").setValue(this.activeAssignedClient.ActualPackage);
      this.employeeForm.get("FinalPackage").setValue(this.activeAssignedClient.FinalPackage);
      this.employeeForm.get("TakeHomeByCandidate").setValue(this.activeAssignedClient.TakeHomeByCandidate);
      this.isUpdated = true;

      if (this.activeAssignedClient) {
        let clientsDetail = this.employeeForm.get("AllocatedClients") as FormArray;
        let i = 0;
        while(i < clientsDetail.length) {
          clientsDetail.controls[i].get("IsActiveRow").setValue(false);
          i++;
        };
        client.get("IsActiveRow").setValue(true);
      }
    }
  }

  deleteCurrentClient(client: any) {
    this.activeAssignedClient = client.value;
    $("#remoteClient").modal('show');
  }

  reset() {
    this.employeeForm.reset();
  }

  removeClient(){
    this.http.delete(`clients/DeactivateClient`, {
      EmployeeUid:  this.activeAssignedClient.EmployeeUid,
      EmployeeMappedClientsUid: this.activeAssignedClient.EmployeeMappedClientsUid
    }).then(response => {
      if(response.ResponseBody) {
        this.allocatedClients = response.ResponseBody.Table;
        if(this.allocatedClient.length > 0) {
          let assignedClients: FormArray = this.employeeForm.get("AllocatedClients") as FormArray;
          assignedClients.clear();
          let apiClients: FormArray = this.fb.array(this.allocatedClients.map(x => this.buildAlocatedClients(x, (x.ClientUid == this.activeAssignedClient.ClientUid) ?? false)));
          this.employeeForm.setControl("AllocatedClients", apiClients);
        }
        Toast("Client de-activated successfully.");
      } else {
        ErrorToast("Fail de-activated it. Please contact to admin.");
      }

      $("#remoteClient").modal('hide');
    })
  }

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  uploadProfilePicture(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result;
      };
      // this.employeeForm.patchValue({
      //   ProfileImgPath: event.target.result,
      // });
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: "profile",
        file: file
      });
    }
  }
}

export class AssignedClients {
  IsActive: boolean = false;
  IsActiveRow: boolean = false;
  ClientUid: number = 0;
  ClientName: string  = null;
  ActualPackage: number = 0.0;
  FinalPackage: number = 0.0;
  TakeHomeByCandidate: number = 0.0;
  EmployeeUid: number = 0;
  EmployeeMappedClientsUid: number = 0;
  IsPermanent: boolean = false;
}

export class EmployeeDetail {
  EmployeeUid: number = 0;
  FileId: number = 0;
  FirstName: string = null;
  LastName: string = null;
  Mobile: string = "XXXXXXXXXX";
  Email: string = "example@mail.com";
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
  DOB: Date = null;
  DateOfJoining: Date = null;
  ReportingManagerId: number = null;
  AllocatedClients: Array<AssignedClients> = [];
}
