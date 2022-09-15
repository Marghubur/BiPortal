import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, PlaceEmpty, Toast, ToFixed } from 'src/providers/common-service/common.service';
import { ProfileImage, SalaryBreakup, UserImage } from 'src/providers/constants';
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
  allocatedCompany: Array<any> = [];
  currentCompanyDetail: any = null;
  isAllocated: boolean = false;
  isUpdate: boolean = false;
  employeeUid: number = 0;
  isInsertingNewClient: boolean = true;
  assignedActiveClientUid: number = 0;
  isReady: boolean = false;
  currentClientId: number = 0;
  isUpdated: boolean = false;
  activeClient: any = null;
  profileURL: string = UserImage;
  fileDetail: Array<any> = [];
  activeAssignedClient: AssignedClients = new AssignedClients();
  ProfessuinalDetail_JSON: any = '';
  managerList: autoCompleteModal = null;
  userRoles: Array<any> = [];
  salaryBreakup: Array<any> = [];
  companyGroup: Array<any> = [];
  companyGroupId: number = 0;
  salaryDetail: any = null;
  addUpdateClientForm: FormGroup = null;
  leavePlans: Array<any> = [];

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
    //this.calculateExpressionUsingInfixDS('(40 % 1000 + (((20 + 60) % 10) % 10');
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.managerList.className = "autocomplete-height";
    this.model = this.calendar.getToday();
    let data = this.nav.getValue();
    this.employeeUid = 0;
    this.isUpdate = false;
    if (data) {
      this.employeeUid = data.EmployeeUid;
      this.ProfessuinalDetail_JSON = data.ProfessionalDetail_Json;
      this.isUpdate = true;
    } else {
      this.isUpdate = false;
      this.employeeModal = new EmployeeDetail();
      this.joiningDate();
      this.employeeModal.ReportingManagerId = null;
      this.employeeModal.DesignationId = null;
      this.employeeModal.AccessLevelId = null;
      this.employeeModal.CompanyId = null;
      this.employeeModal.UserTypeId = null;
      this.currentCompanyDetail = {
        CompanyId: ""
      };
    }
    this.loadData(this.employeeUid);

  }

  buildProfileImage(fileDetail: any) {
    this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}.${fileDetail.FileExtension}`;
    this.employeeModal.FileId = fileDetail.FileId;
  }

  buildPageData(response: ResponseModel) {
    if (response.ResponseBody && response.ResponseBody.Employee != undefined) {
      this.clients = response.ResponseBody.Clients;
      if (response.ResponseBody.Employee.length > 0) {
        this.employeeModal = response.ResponseBody.Employee[0] as EmployeeDetail;
        let date = new Date(this.employeeModal.DOB);
        this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        date = new Date(this.employeeModal.CreatedOn);
        this.joiningDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
      }

      if(response.ResponseBody.Roles)
        this.userRoles = response.ResponseBody.Roles;

      this.allocatedClients = response.ResponseBody.AllocatedClients;
      let profileDetail = response.ResponseBody.FileDetail;
      if(profileDetail.length > 0) {
        this.buildProfileImage(profileDetail[0]);
      }

      if(response.ResponseBody.Company && response.ResponseBody.Company.length == 1)
        this.currentCompanyDetail = response.ResponseBody.Company[0];
      else
        this.currentCompanyDetail = {
          CompanyId: ""
        };

        if(response.ResponseBody.Companies)
          this.allocatedCompany = response.ResponseBody.Companies;
        else {
          this.allocatedCompany = [{
            CompanyName: "",
            CompanyId: ""
          }]
        }

      if (response.ResponseBody.SalaryDetail && response.ResponseBody.SalaryDetail.length > 0)
        this.employeeModal.CTC = response.ResponseBody.SalaryDetail[0].CTC;

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

      if (response.ResponseBody.LeavePlans.length > 0) {
        this.leavePlans = response.ResponseBody.LeavePlans;
        if (this.employeeModal.LeavePlanId == 0) {
          let plan = this.leavePlans.find(x => x.IsDefaultPlan == 1);
          if(plan) {
            this.employeeModal.LeavePlanId = plan.LeavePlanId;
          }
        }
      } else {
        this.leavePlans = [];
      }
    } else {
      ErrorToast("Fail to get employee detail. Please contact to admin.");
    }
  }

  loadData(employeeId: number) {
    this.http.get(`employee/GetAllManageEmployeeDetail/${employeeId}`).then((res: ResponseModel) => {
      if(res.ResponseBody.EmployeesList) {
        this.managerList.data = [];
        this.managerList.placeholder = "Reporting Manager";
        this.managerList.data.push({
          value: 0,
          text: "Default Manager",
        });
        this.managerList.className = "dd";
        let i = 0;
        let managers = res.ResponseBody.EmployeesList;
        while(i < managers.length) {
          if([1, 2, 3, 10].indexOf(managers[i].DesignationId) !== -1) {
            this.managerList.data.push({
              value: managers[i].EmployeeUid,
              text: `${managers[i].FirstName} ${managers[i].LastName}`
            });
          }
          i++;
        }
      }
      this.buildPageData(res);
      this.bindForm();
      this.bindClientDetails();

      this.isReady = true;
    });
  }

  ctcChangeAmount(e: any) {
    let value = e.target.value;
    //this.salaryBreakupForm.get("ExpectedCTC").setValue(value);
    this.employeeForm.get("CTC").setValue(value);
  }

  // getAllCompany() {
  //   this.http.get("Company/GetAllCompany").then(res => {
  //     if (res.ResponseBody && res.ResponseBody.length > 0) {
  //       this.companyGroup = res.ResponseBody;
  //     }
  //   })
  // }

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

  joiningDate() {
    let date = new Date();
    this.joiningDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
  }

  bindForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl(this.employeeModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.employeeModal.LastName, [Validators.required]),
      Mobile: new FormControl(this.employeeModal.Mobile, [Validators.required]),
      Email: new FormControl(this.employeeModal.Email, [Validators.required]),
      SecondaryMobile: new FormControl(this.employeeModal.SecondaryMobile),
      LeavePlanId: new FormControl(this.employeeModal.LeavePlanId),
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
      IsActive: new FormControl(this.employeeModal.IsActive),
      EmployeeUid: new FormControl(this.employeeModal.EmployeeUid),
      BranchName: new FormControl(this.employeeModal.BranchName),
      AllocatedClientName: new FormControl(this.employeeModal.AllocatedClientName),
      ProfileImgPath: new FormControl(""),
      DateOfJoining: new FormControl(this.employeeModal.CreatedOn),
      DOB: new FormControl(this.employeeModal.DOB),
      FileId: new FormControl(this.employeeModal.FileId),
      AccessLevelId: new FormControl(this.employeeModal.AccessLevelId, [Validators.required]),
      UserTypeId: new FormControl(this.employeeModal.UserTypeId, [Validators.required]),
      ReportingManagerId: new FormControl(this.employeeModal.ReportingManagerId),
      DesignationId: new FormControl(this.employeeModal.DesignationId, [Validators.required]),
      CompanyId: new FormControl(this.currentCompanyDetail.CompanyId, [Validators.required]),
      CTC: new FormControl(this.employeeModal.CTC, [Validators.required]),
      Gender: new FormControl(this.employeeModal.Gender ? 'true' : 'false')
    });
  }

  bindClientDetails() {
    this.addUpdateClientForm = this.fb.group({
      AllocatedClientId: new FormControl("0"),
      ActualPackage: new FormControl(null),
      FinalPackage: new FormControl(null),
      TakeHomeByCandidate: new FormControl(null),
      AllocatedClients: new FormArray(this.allocatedClients.map(x => this.buildAlocatedClients(x, false)))
    })
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
    return this.addUpdateClientForm.get ("AllocatedClients") as FormArray;
  }



  RegisterEmployee() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.employeeForm.get('FirstName').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('LastName').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('Email').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('DesignationId').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('CompanyId').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('ReportingManagerId').errors !== null) {
      this.managerList = new autoCompleteModal();
      this.managerList.data = [];
      this.managerList.className = "dd";
      this.managerList.placeholder = "Reporting Manager";
      this.managerList.data.push({
        value: 0,
        text: "Default Manager"
      });
      errroCounter++;
    }
    if (this.employeeForm.get('AccessLevelId').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('UserTypeId').errors !== null)
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
        this.ProfessuinalDetail_JSON = "";
      }
      let formData = new FormData();
      formData.append("employeeDetail", JSON.stringify(this.employeeForm.value));
      if(this.employeeForm.value.AllocatedClients == undefined || this.employeeForm.value.AllocatedClients == undefined)
        this.employeeForm.value.AllocatedClients = [];
      formData.append("allocatedClients", JSON.stringify(this.employeeForm.value.AllocatedClients));
      formData.append("ProfessuinalDetail_JSON", this.ProfessuinalDetail_JSON)
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append(ProfileImage, file);

      this.http.post(`Employee/employeeregistration/${this.isUpdate}`, formData).then((response: ResponseModel) => {
        this.buildPageData(response);
        if(this.isUpdate)
          Toast("Profile updated successfully");
        else
          Toast("Registration done successfully");
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
        ErrorToast(e.HttpStatusMessage);
      });
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marded red");
    }
  }

  addDetail() {
    this.isAllocated = false;
    let clientId = Number(this.addUpdateClientForm.get("AllocatedClientId").value);
    if(isNaN(clientId) || clientId <= 0){
      ErrorToast("Invalid client selected");
      return;
    }

    this.activeAssignedClient.ClientUid = clientId;
    let actualPackage = Number(this.addUpdateClientForm.get("ActualPackage").value);
    if(isNaN(actualPackage)){
      ErrorToast("Invalid actual package supplied");
      return;
    }

    this.activeAssignedClient.ActualPackage = actualPackage;
    let finalPackage = Number(this.addUpdateClientForm.get("FinalPackage").value);
    if(isNaN(finalPackage)){
      ErrorToast("Invalid final package supplied");
      return;
    }

    this.activeAssignedClient.FinalPackage = finalPackage;
    let takeHomeByCandidate = Number(this.addUpdateClientForm.get("TakeHomeByCandidate").value);
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
          let assignedClients: FormArray = this.addUpdateClientForm.get("AllocatedClients") as FormArray;
          assignedClients.clear();
          let apiClients: FormArray = this.fb.array(this.allocatedClients.map(x => this.buildAlocatedClients(x, (x.ClientUid == this.activeAssignedClient.ClientUid) ?? false)));
          this.addUpdateClientForm.setControl("AllocatedClients", apiClients);
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
      this.addUpdateClientForm.get("AllocatedClientId").setValue(this.activeAssignedClient.ClientUid);
      this.addUpdateClientForm.get("ActualPackage").setValue(this.activeAssignedClient.ActualPackage);
      this.addUpdateClientForm.get("FinalPackage").setValue(this.activeAssignedClient.FinalPackage);
      this.addUpdateClientForm.get("TakeHomeByCandidate").setValue(this.activeAssignedClient.TakeHomeByCandidate);
      this.isUpdated = true;

      if (this.activeAssignedClient) {
        let clientsDetail = this.addUpdateClientForm.get("AllocatedClients") as FormArray;
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
          let assignedClients: FormArray = this.addUpdateClientForm.get("AllocatedClients") as FormArray;
          assignedClients.clear();
          let apiClients: FormArray = this.fb.array(this.allocatedClients.map(x => this.buildAlocatedClients(x, (x.ClientUid == this.activeAssignedClient.ClientUid) ?? false)));
          this.addUpdateClientForm.setControl("AllocatedClients", apiClients);
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

  addUpadteClientPopUp() {
    $('#addUpdateClientModal').modal('show');
  }

  navToSalaryBreakup() {
    let ctc = this.employeeForm.get('CTC').value;
    if (ctc == null || ctc == 0) {
      ErrorToast("Please enter ctc");
      return;
    }
    this.http.get(`SalaryComponent/GetSalaryGroupByCTC/${ctc}`).then(res => {
      if (res.ResponseBody) {
        this.nav.navigate(SalaryBreakup, this.employeeForm.value);
      }
    }).catch(e => {
      ErrorToast(`No Salary group found for CTC = [ ${ctc} ]. Please create group for this bracket.`);
    })
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
  Mobile: string = null;
  Email: string = null;
  BranchName: string = null;
  SecondaryMobile: string = null;
  LeavePlanId: number = 0;
  FatherName: string = null;
  CompanyId: number = null;
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
  IsActive: boolean = false;
  AllocatedClientId: number = null;
  AllocatedClientName: string = null;
  ActualPackage: number = null;
  FinalPackage: number = null;
  TakeHomeByCandidate: number = null;
  DOB: Date = null;
  CreatedOn: Date = null;
  ReportingManagerId: number = -1;
  DesignationId: number = null;
  AccessLevelId: number = null;
  UserTypeId: number = null;
  CTC: number = null;
  AllocatedClients: Array<AssignedClients> = [];
  ClientJson: string = '';
  Gender: boolean = true;
}
