import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AssignedClients, EmployeeDetail } from 'src/app/adminmodal/admin-modals';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, PlaceEmpty, Toast, ToFixed, ToLocateDate } from 'src/providers/common-service/common.service';
import { EmailLinkConfig, Employees, ManageEmployee, OrganizationSetting, ProfileImage, SalaryBreakup, UserImage } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manageemployee',
  templateUrl: './manageemployee.component.html',
  styleUrls: ['./manageemployee.component.scss']
})
export class ManageemployeeComponent implements OnInit, OnDestroy {
  model: NgbDateStruct;
  assignDateModel: NgbDateStruct;
  joiningDatemodel: NgbDateStruct;
  pfDatemodel: NgbDateStruct;
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
  companies: Array<any> = [];
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
  managerList: autoCompleteModal = null;
  userRoles: Array<any> = [];
  salaryBreakup: Array<any> = [];
  companyGroup: Array<any> = [];
  companyGroupId: number = 0;
  salaryDetail: any = null;
  addUpdateClientForm: FormGroup = null;
  leavePlans: Array<any> = [];
  isCompaniesDetails: boolean = true;
  minDate: any = null;
  assignMaxDate: any = null;
  imageIndex: number = 0;
  isSubmitted: boolean = false;
  shiftDetail: autoCompleteModal = null;
  shifts: Array<any> = [];
  designations: Array<any> = [];
  salaryGroup: Array<any> = [];

  get f() {
    let data = this.employeeForm.controls;
    return data;
  }

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private nav: iNavigation
  ) { }

  ngOnDestroy() {
    this.nav.resetValue();
  }

  ngOnInit(): void {
    //this.calculateExpressionUsingInfixDS('(40 % 1000 + (((20 + 60) % 10) % 10');
    this.designations = GetRoles();
    this.managerList = new autoCompleteModal();
    this.managerList.data = [];
    this.managerList.placeholder = "Reporting Manager";
    this.managerList.data.push({
      value: 0,
      text: "Default Manager"
    });
    this.shiftDetail = new autoCompleteModal();
    this.shiftDetail.data = [];
    this.shiftDetail.placeholder = "Work Shift";
    this.shiftDetail.className = "disable-field";
    this.managerList.className = "autocomplete-height";
    this.minDate = {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()};
    let assignmaxdate = new Date(new Date().setMonth(new Date().getMonth() + 12))
    this.assignMaxDate = {year: assignmaxdate.getFullYear(), month: assignmaxdate.getMonth()+1, day: assignmaxdate.getDate()};
    this.model = this.calendar.getToday();
    let data = this.nav.getValue();
    this.employeeUid = 0;
    this.isUpdate = false;
    if (data) {
      this.employeeUid = data.EmployeeUid;
      this.isUpdate = true;
    } else {
      this.isUpdate = false;
      this.employeeModal = new EmployeeDetail();
      this.joiningDate();
      this.employeeModal.DesignationId = null;
      this.employeeModal.CompanyId = null;
      this.currentCompanyDetail = {
        CompanyId: ""
      };
    }

    this.loadData(this.employeeUid);
  }

  buildProfileImage(fileDetail: any) {
    this.profileURL = "";
    if (fileDetail.FileName.includes(".")) {
      this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}`;
      this.employeeModal.OldFileName = `${fileDetail.FileName}`;
    }
    else {
      this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}.${fileDetail.FileExtension}`;
      this.employeeModal.OldFileName = `${fileDetail.FileName}.${fileDetail.FileExtension}`;
    }
    this.employeeModal.FileId = fileDetail.FileId;
  }

  buildPageData(response: ResponseModel) {
    if (response.ResponseBody.WorkShift){
      this.shifts = response.ResponseBody.WorkShift;
        if (this.shifts && this.shifts.length > 0) {
          this.shifts.map(x => {
            this.shiftDetail.data.push({
              value: x.WorkShiftId,
              text: x.ShiftTitle
            });
          });
          this.shiftDetail.className="";
        } else {
          this.shiftDetail.data.push({
            value: 0,
            text: "Regular shift"
          });
        }
    }
    if (response.ResponseBody && response.ResponseBody.Employee != undefined) {
      this.clients = response.ResponseBody.Clients;
      if (response.ResponseBody.Employee.length > 0) {
        this.employeeModal = response.ResponseBody.Employee[0] as EmployeeDetail;
        this.employeeModal.DOB = ToLocateDate(this.employeeModal.DOB);
        this.model = { day: this.employeeModal.DOB.getDate(), month: this.employeeModal.DOB.getMonth() + 1, year: this.employeeModal.DOB.getFullYear()};
        let date = ToLocateDate(this.employeeModal.CreatedOn);
        this.joiningDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        if (this.employeeModal.PFJoinDate)
          date = ToLocateDate(this.employeeModal.PFJoinDate);
        else
          date = new Date();

        this.pfDatemodel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        if (this.employeeModal.DesignationId == 0)
          this.employeeModal.DesignationId = null;

        if (this.employeeModal.SalaryGroupId > 0)
          this.employeeModal.IsPayrollOnCTC = false;
        else
          this.employeeModal.SalaryGroupId = null;
        }

      if(response.ResponseBody.Roles)
        this.userRoles = response.ResponseBody.Roles;

      if(response.ResponseBody.SalaryGroup)
        this.salaryGroup = response.ResponseBody.SalaryGroup;

      this.allocatedClients = response.ResponseBody.AllocatedClients;
      if (this.allocatedClients.length > 0) {
        // for (let i = 0; i < this.allocatedClients.length; i++) {
        //   let index = this.clients.findIndex( x=> x.ClientId == this.allocatedClients[i].ClientUid);
        //   this.clients.splice(index, 1);
        // }
      }
      let profileDetail = response.ResponseBody.FileDetail;
      if(profileDetail.length > 0) {
        this.buildProfileImage(profileDetail[0]);
      }

      if (this.employeeModal.CompanyId > 0)
        this.currentCompanyDetail = response.ResponseBody.Companies.find(x => x.CompanyId == this.employeeModal.CompanyId);
      else
        this.currentCompanyDetail = response.ResponseBody.Companies.find(x => x.IsPrimaryCompany == 1);

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

      if(response.ResponseBody.Companies.length > 0)
        this.companies = response.ResponseBody.Companies;
      else {
        this.companies = [{
          CompanyName: "",
          CompanyId: ""
        }];
        this.isCompaniesDetails = false;
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
          this.managerList.data.push({
            value: managers[i].EmployeeUid,
            text: `${managers[i].FirstName} ${managers[i].LastName}`
          });
          i++;
        }
      }
      this.buildPageData(res);
      this.bindForm();
      this.bindClientDetails();
      this.isReady = true;
    }).catch(e => {
      this.bindForm();
      this.isCompaniesDetails = false;
      this.isReady = true;
    });
  }

  ctcChangeAmount(e: any) {
    let value = e.target.value;
    //this.salaryBreakupForm.get("ExpectedCTC").setValue(value);
    this.employeeForm.get("CTC").setValue(value);
  }

  daysInMonth(monthNumber: number) {
    var now = new Date();
    return new Date(now.getFullYear(), monthNumber, 0).getDate();
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.employeeForm.controls["DOB"].setValue(date);
  }

  onPFDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.employeeForm.controls["PFJoinDate"].setValue(date);
  }

  onAssignDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.addUpdateClientForm.controls["AssigneDate"].setValue(date);
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
    if (this.employeeModal.IsPayrollOnCTC == null)
      this.employeeModal.IsPayrollOnCTC = true;
    if (this.employeeModal.ReportingManagerId > 0) {
      let data = this.managerList.data.find(x => x.value == this.employeeModal.ReportingManagerId);
      if (!data)
        this.employeeModal.ReportingManagerId = 0;
    }

    this.employeeForm = this.fb.group({
      FirstName: new FormControl(this.employeeModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.employeeModal.LastName, [Validators.required]),
      Mobile: new FormControl(this.employeeModal.Mobile, [Validators.required]),
      Email: new FormControl(this.employeeModal.Email, [Validators.required, Validators.email]),
      SecondaryMobile: new FormControl(this.employeeModal.SecondaryMobile),
      LeavePlanId: new FormControl(this.employeeModal.LeavePlanId),
      FatherName: new FormControl(this.employeeModal.FatherName, [Validators.required]),
      MotherName: new FormControl(this.employeeModal.MotherName),
      SpouseName: new FormControl(this.employeeModal.SpouseName),
      State: new FormControl(this.employeeModal.State),
      City: new FormControl(this.employeeModal.City),
      Pincode: new FormControl(PlaceEmpty(this.employeeModal.Pincode)),
      Address: new FormControl(this.employeeModal.Address),
      PANNo: new FormControl(this.employeeModal.PANNo, [Validators.required]),
      AadharNo: new FormControl(this.employeeModal.AadharNo),
      AccountNumber: new FormControl(this.employeeModal.AccountNumber, [Validators.required]),
      BankName: new FormControl(this.employeeModal.BankName, [Validators.required]),
      IFSCCode: new FormControl(this.employeeModal.IFSCCode, [Validators.required]),
      Domain: new FormControl(this.employeeModal.Domain),
      Specification: new FormControl(this.employeeModal.Specification),
      ExprienceInYear: new FormControl(PlaceEmpty(this.employeeModal.ExprienceInYear), [Validators.required]),
      LastCompanyName: new FormControl(this.employeeModal.LastCompanyName),
      IsPermanent: new FormControl(this.employeeModal.IsPermanent),
      IsActive: new FormControl(this.employeeModal.IsActive),
      EmployeeUid: new FormControl(this.employeeModal.EmployeeUid),
      BranchName: new FormControl(this.employeeModal.BranchName),
      AllocatedClientName: new FormControl(this.employeeModal.AllocatedClientName),
      ProfileImgPath: new FormControl(""),
      DateOfJoining: new FormControl(ToLocateDate(this.employeeModal.CreatedOn)),
      DOB: new FormControl(this.employeeModal.DOB, [Validators.required]),
      FileId: new FormControl(this.employeeModal.FileId),
      AccessLevelId: new FormControl(this.employeeModal.AccessLevelId, [Validators.required]),
      UserTypeId: new FormControl(this.employeeModal.UserTypeId, [Validators.required]),
      ReportingManagerId: new FormControl(this.employeeModal.ReportingManagerId),
      DesignationId: new FormControl(this.employeeModal.DesignationId, [Validators.required]),
      OrganizationId: new FormControl(this.currentCompanyDetail.OrganizationId, [Validators.required]),
      CompanyId: new FormControl(this.currentCompanyDetail.CompanyId, [Validators.required]),
      CTC: new FormControl(this.employeeModal.CTC, [Validators.required]),
      Gender: new FormControl(this.employeeModal.Gender ? 'true' : 'false'),
      OldFileName: new FormControl(this.employeeModal.OldFileName),
      WorkShiftId: new FormControl(this.employeeModal.WorkShiftId, [Validators.required]),
      IsPayrollOnCTC: new FormControl(this.employeeModal.IsPayrollOnCTC ),
      SalaryGroupId: new FormControl(this.employeeModal.SalaryGroupId),
      PFNumber: new FormControl(this.employeeModal.PFNumber != null ? this.employeeModal.PFNumber : 0),
      UniversalAccountNumber: new FormControl(this.employeeModal.UniversalAccountNumber),
      PFJoinDate: new FormControl(this.employeeModal.PFJoinDate)
    });
    if (this.employeeModal.IsPayrollOnCTC)
      this.employeeForm.controls['SalaryGroupId'].disable();
    else
      this.employeeForm.controls['SalaryGroupId'].enable();
  }

  bindClientDetails() {
    this.addUpdateClientForm = this.fb.group({
      AllocatedClientId: new FormControl(0, [Validators.required]),
      ActualPackage: new FormControl(null, [Validators.required]),
      FinalPackage: new FormControl(null, [Validators.required]),
      TakeHomeByCandidate: new FormControl(null, [Validators.required]),
      AssigneDate: new FormControl(null, [Validators.required]),
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
      AssigneDate: new FormControl(ToLocateDate(client.AssigneDate), [Validators.required]),
    });
  }

  get allocatedClient(): FormArray {
    return this.addUpdateClientForm.get ("AllocatedClients") as FormArray;
  }



  RegisterEmployee() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;
    let email = this.employeeForm.get('Email').value;
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!regex.test(email)){
      this.isLoading = false;
      ErrorToast("Invalid email address!")
      return ;
    }

    this.employeeModal = this.employeeForm.value;
    if (this.employeeForm.get('IsPayrollOnCTC').value == "true")
      this.employeeModal.SalaryGroupId = 0;

    if (this.employeeForm.get('Mobile').value.length < 10 || this.employeeForm.get('Mobile').value.length > 10) {
      this.isLoading = false;
      ErrorToast("Mobile number must be 10 digit only");
      return;
    }
    if (this.employeeForm.get('FirstName').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('LastName').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('Email').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('PANNo').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('AccountNumber').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('BankName').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('IFSCCode').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('FatherName').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('DesignationId').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('CompanyId').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('DOB').errors !== null)
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

    if (this.employeeForm.get('SalaryGroupId').errors !== null)
      errroCounter++;

    if (this.employeeForm.get('OrganizationId').value == 0)
      errroCounter++;

    if (this.employeeForm.get('CompanyId').value == 0)
      errroCounter++;

    if (this.employeeForm.get('DateOfJoining').value == null)
      this.employeeForm.get('DateOfJoining').setValue(new Date());

    if (this.employeeForm.get('ExprienceInYear').errors !== null)
      errroCounter++;

    if (!this.employeeModal.Pincode)
      this.employeeModal.Pincode = 0;

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
      let formData = new FormData();
      formData.append("employeeDetail", JSON.stringify(this.employeeForm.value));
      if(this.employeeForm.value.AllocatedClients == undefined || this.employeeForm.value.AllocatedClients == undefined)
        this.employeeForm.value.AllocatedClients = [];
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;

      formData.append(`${ProfileImage}_${this.imageIndex}`, file);
      let url: string = "";
      if(this.isUpdate)
        url = `Employee/updateemployeedetail`;
      else
        url = `Employee/employeeregistration`;

      this.http.post(url, formData)
      .then(res => {
        if(this.isUpdate)
          Toast("Profile updated successfully");
        else
          Toast("Registration done successfully");
        $('#messageModal').modal('show');
        this.isReady = true;
        this.isLoading = false;
      }).catch(e => {
        this.isReady = true;
        this.isLoading = false;
        ErrorToast(e.HttpStatusMessage);
      })
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marked red");
    }
  }

  gotoEmpPage() {
    $('#messageModal').modal('hide');
    this.nav.navigate(Employees, null)
  }

  get n() {
    return this.addUpdateClientForm.controls;
  }

  addDetail() {
    this.isAllocated = false;
    this.isLoading = true;
    this.isSubmitted = true;
    let errroCounter = 0;
    if (this.addUpdateClientForm.value.AllocatedClients.length)
      this.isAllocated = true;

    if (this.addUpdateClientForm.get('ActualPackage').errors !== null)
      errroCounter++;

    if (this.addUpdateClientForm.get('FinalPackage').errors !== null)
      errroCounter++;

    if (this.addUpdateClientForm.get('TakeHomeByCandidate').errors !== null)
      errroCounter++;

    if (this.addUpdateClientForm.get('AssigneDate').errors !== null)
      errroCounter++;

    this.activeAssignedClient.AssigneDate = this.addUpdateClientForm.get('AssigneDate').value;

    let clientId = Number(this.addUpdateClientForm.get("AllocatedClientId").value);
    if(isNaN(clientId) || clientId <= 0){
      this.isLoading = false;
      ErrorToast("Invalid client selected");
      return;
    }

    if (!this.isUpdated) {
      let isExistClient = this.addUpdateClientForm.get("AllocatedClients").value.find(x => x.ClientUid == clientId);
      if (isExistClient) {
        this.isLoading = false;
        ErrorToast("This client is already added");
        return;
      }
    }


    this.activeAssignedClient.ClientUid = clientId;
    let actualPackage = Number(this.addUpdateClientForm.get("ActualPackage").value);
    if(isNaN(actualPackage)){
      this.isLoading = false;
      ErrorToast("Invalid actual package supplied");
      return;
    }

    this.activeAssignedClient.ActualPackage = actualPackage;
    let finalPackage = Number(this.addUpdateClientForm.get("FinalPackage").value);
    if(isNaN(finalPackage)){
      this.isLoading = false;
      ErrorToast("Invalid final package supplied");
      return;
    }

    this.activeAssignedClient.FinalPackage = finalPackage;
    let takeHomeByCandidate = Number(this.addUpdateClientForm.get("TakeHomeByCandidate").value);
    if(isNaN(takeHomeByCandidate)){
      this.isLoading = false;
      ErrorToast("Invalid takehome package supplied");
      return;
    }

    this.activeAssignedClient.TakeHomeByCandidate = takeHomeByCandidate;
    if(finalPackage < actualPackage) {
      this.isLoading = false;
      ErrorToast("Final package must be greater that or equal to Actual package.")
      return;
    }

    let employeeId = Number(this.employeeForm.get("EmployeeUid").value);
    if(isNaN(employeeId) || employeeId <= 0){
      this.isLoading = false;
      ErrorToast("Invalid employee id selected");
      return;
    }
    this.activeAssignedClient.EmployeeUid = employeeId;

    if(actualPackage < takeHomeByCandidate) {
      this.isLoading = false;
      ErrorToast("Actual package must be greater that or equal to TakeHome package.")
      return;
    }

    if (errroCounter === 0) {
      this.http.post(`employee/UpdateEmployeeMappedClientDetail/${this.isUpdated}`, this.activeAssignedClient).then((response: ResponseModel) => {
        if (response.ResponseBody.Table) {
          this.allocatedClients = response.ResponseBody.Table;
          if(this.allocatedClients.length > 0) {
            let assignedClients: FormArray = this.addUpdateClientForm.get("AllocatedClients") as FormArray;
            assignedClients.clear();
            let apiClients: FormArray = this.fb.array(this.allocatedClients.map(x => this.buildAlocatedClients(x, (x.ClientUid == this.activeAssignedClient.ClientUid) ?? false)));
            this.addUpdateClientForm.setControl("AllocatedClients", apiClients);
          }
          this.isLoading = false;
          Toast("Organization added/updated successfully.");
        } else {
          this.isLoading = false;
          ErrorToast("Fail to add");
        }
        this.isAllocated = true;
      }).catch (e => {
        this.isLoading = false;
      })
    } else {
      this.isAllocated = true;
      this.isLoading = false;
      ErrorToast("Please fill all the mandaroty field marked red");
    }
  }

  bindCurrentClientDetail(client: any) {
    if (client) {
      this.activeAssignedClient = client.value;
      this.addUpdateClientForm.get("AllocatedClientId").setValue(this.activeAssignedClient.ClientUid);
      this.addUpdateClientForm.get("ActualPackage").setValue(this.activeAssignedClient.ActualPackage);
      this.addUpdateClientForm.get("FinalPackage").setValue(this.activeAssignedClient.FinalPackage);
      this.addUpdateClientForm.get("TakeHomeByCandidate").setValue(this.activeAssignedClient.TakeHomeByCandidate);
      this.addUpdateClientForm.get("AssigneDate").setValue(this.activeAssignedClient.AssigneDate);
      this.assignDateModel = { day: this.activeAssignedClient.AssigneDate.getDate(), month: this.activeAssignedClient.AssigneDate.getMonth() + 1, year: this.activeAssignedClient.AssigneDate.getFullYear()};
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
    $("#uploadocument").click();
  }

  addUpadteClientPopUp() {
    this.isSubmitted = false;
    this.bindClientDetails();
    $('#addUpdateClientModal').modal('show');
  }

  gotoCompany() {
    this.nav.navigate(OrganizationSetting, null)
  }

  navToSalaryBreakup() {
    let ctc = this.employeeForm.get('CTC').value;
    if (ctc == null || ctc == 0) {
      ErrorToast("Please enter ctc");
      return;
    }
    this.http.get(`SalaryComponent/GetSalaryGroupByCTC/${ctc}/${this.employeeUid}`).then(res => {
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
      this.imageIndex = new Date().getTime();
      this.fileDetail.push({
        name: $`profile_${this.imageIndex}`,
        file: file
      });
    }
  }

  resizeImage(file: File) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = img.width * 0.5;
      canvas.height = img.height * 0.5;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {

      });
    };
  }

  navToEmailLinkConfig() {
    this.nav.navigate(EmailLinkConfig, ManageEmployee);
  }

  changePayrollCalculationType(e: any) {
    let value = e.target.value;
    if (value == "true") {
      this.employeeForm.get('SalaryGroupId').setValue(null);
      this.employeeForm.get('SalaryGroupId').removeValidators(Validators.required);
      this.employeeForm.get('SalaryGroupId').updateValueAndValidity();
      this.employeeForm.controls['SalaryGroupId'].disable();
    } else {
      this.employeeForm.get('SalaryGroupId').setValue(null);
      this.employeeForm.get('SalaryGroupId').setValidators(Validators.required);
      this.employeeForm.get('SalaryGroupId').updateValueAndValidity();
      this.employeeForm.controls['SalaryGroupId'].enable();
    }
  }
}
