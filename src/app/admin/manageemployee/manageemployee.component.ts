import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, PlaceEmpty, Toast, ToFixed } from 'src/providers/common-service/common.service';
import { ProfileImage, UserImage } from 'src/providers/constants';
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
  userRoles: Array<any> = [];
  salaryBreakup: Array<any> = [];
  salaryBreakupForm: FormGroup = null;
  companyGroup: Array<any> = [];
  companyGroupId: number = 0;
  salaryGroup: Array<any> = [];
  salaryGroupId: number = 0;
  isCompanyGroupSelected: boolean = false;
  isSalaryGroup: boolean = false;
  salaryComponents: Array<any> = [];
  salaryDetail: any = null;
  completeSalaryBreakup: SalaryBreakupDetails = new SalaryBreakupDetails();

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
      this.employeeModal.ReportingManagerId = null;
      this.employeeModal.DesignationId = null;
      this.bindForm();
      this.idReady = true;
    }
    this.loadData(this.employeeUid);
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

      if(response.ResponseBody.Roles)
        this.userRoles = response.ResponseBody.Roles;

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
          if([1, 2, 3, 10].indexOf(managers[i].DesignationId) !== -1) {
            this.managerList.data.push({
              value: managers[i].EmployeeUid,
              text: `${managers[i].FirstName} ${managers[i].LastName}`
            });
          }
          i++;
        }

        if(res.ResponseBody.Companies && res.ResponseBody.Companies.length > 0) {
          let Companies = res.ResponseBody.Companies;
          if (Companies.length == 1) {
            this.companyGroup.push ({
              CompanyName: Companies[0].CompanyName,
              CompanyId: Companies[0].CompanyId
            })

            this.companyGroupId = 0;
          } else {
            this.companyGroup = Companies;
          }
        }

        if (res.ResponseBody.SalaryDetail.length > 0)
          this.salaryDetail = res.ResponseBody.SalaryDetail[0];
      }

      this.buildPageData(res);
      this.bindForm();
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
    this.employeeForm.controls["DOB"].setValue(date);
  }

  onJoiningDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month -1, e.day);
    this.employeeForm.get("DateOfJoining").setValue(date);
  }

  bindForm() {
    this.employeeForm = this.fb.group({
      FirstName: new FormControl(this.employeeModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.employeeModal.LastName, [Validators.required]),
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
      AccessLevelId: new FormControl(this.employeeModal.AccessLevelId, [Validators.required]),
      UserTypeId: new FormControl(this.employeeModal.UserTypeId, [Validators.required]),
      ReportingManagerId: new FormControl(this.employeeModal.ReportingManagerId, [Validators.required]),
      DesignationId: new FormControl(this.employeeModal.DesignationId, [Validators.required]),
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
    if (this.employeeForm.get('LastName').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('Email').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('DesignationId').errors !== null)
      errroCounter++;
    if (this.employeeForm.get('ReportingManagerId').errors !== null) {
      this.managerList = new autoCompleteModal();
      this.managerList.data = [];
      this.managerList.className = "error-field";
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
        if(this.isUpdate)
          Toast("Profile updated successfully");
        else
          Toast("Registration done successfully");
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
        ErrorToast("Registration fail. Please contact admin.")
      });
    } else {
      this.isLoading = false;
      ErrorToast("Please correct all the mandaroty field marded red");
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

  salryBreakupPopup() {
    $('#fullSalaryDetail').modal('show');
    if (this.companyGroup.length == 1)
      this.findSalaryGroup();
  }

  selectCompanyGroup(event: any) {
    let value = Number(event.target.value);
    if (value > 0) {
      this.companyGroupId = value;
      this.findSalaryGroup();
    }
  }

  findSalaryGroup() {
    this.http.get("SalaryComponent/GetSalaryGroups").then(res => {
      if(res.ResponseBody) {
        this.salaryGroup = res.ResponseBody;
        if (this.salaryDetail.CompleteSalaryDetail) {
          if (this.salaryDetail.CompleteSalaryDetail != null && this.salaryDetail.CompleteSalaryDetail != '{}')
            this.completeSalaryBreakup = JSON.parse(this.salaryDetail.CompleteSalaryDetail);
          else
            this.completeSalaryBreakup = new SalaryBreakupDetails();
          this.initForm();
          this.salaryBreakupForm.get("ExpectedCTC").setValue(this.salaryDetail.CTC);
          this.isSalaryGroup = true;
          this.isCompanyGroupSelected = true;
        } else {
          this.isCompanyGroupSelected = false;
          this.isSalaryGroup = false;
        }
        Toast("Salary components loaded successfully.");
      } else {
        ErrorToast("Salary components loaded successfully.");
      }
    });
  }

  salaryGroupDetail() {

  }

  initForm() {
    this.salaryBreakupForm = this.fb.group({
      BasicMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.BasicAnnually/12)),
      BasicAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.BasicAnnually)),
      ConveyanceMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.ConveyanceAnnually/12)),
      ConveyanceAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.ConveyanceAnnually)),
      HRAMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.HRAAnnually/12)),
      HRAAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.HRAAnnually)),
      MedicalMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.MedicalAnnually/12)),
      MedicalAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.MedicalAnnually)),
      CarRunningMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.CarRunningAnnually/12)),
      CarRunningAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.CarRunningAnnually)),
      InternetMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.InternetAnnually/12)),
      InternetAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.InternetAnnually)),
      TravelMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.TravelAnnually/12)),
      TravelAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.TravelAnnually)),
      ShiftMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.ShiftAnnually/12)),
      ShiftAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.ShiftAnnually)),
      SpecialMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.SpecialAnnually/12)),
      SpecialAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.SpecialAnnually)),
      GrossMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.GrossAnnually/12)),
      GrossAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.GrossAnnually)),
      InsuranceMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.InsuranceAnnually/12)),
      InsuranceAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.InsuranceAnnually)),
      PFMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.PFAnnually/12)),
      PFAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.PFAnnually)),
      GratuityMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.GratuityAnnually/12)),
      GratuityAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.GratuityAnnually)),
      FoodMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.FoodAnnually/12)),
      FoodAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.FoodAnnually)),
      CTCMonthly: new FormControl(Math.trunc(this.completeSalaryBreakup.CTCAnnually/12)),
      CTCAnnually: new FormControl(Math.trunc(this.completeSalaryBreakup.CTCAnnually)),
      ExpectedCTC: new FormControl(Math.trunc(this.salaryDetail.CTC))
    });
  }

  calculateSalary() {
    let annualCTC = Number(this.salaryBreakupForm.get("ExpectedCTC").value);
    if (annualCTC > 0) {
      let salarygrpDetail = this.salaryGroup.find(x => x.MinAmount <= annualCTC && x.MaxAmount >= annualCTC);

      if (salarygrpDetail) {
        this.salaryGroupId = salarygrpDetail.SalaryGroupId;
        this.isSalaryGroup = true;
        this.http.post(`SalaryComponent/SalaryBreakupCalc/${this.employeeUid}/${this.salaryGroupId}`, annualCTC)
        .then(res => {
          if (res.ResponseBody) {
            this.completeSalaryBreakup = res.ResponseBody;
            this.initForm();
            // this.salaryComponents = res.ResponseBody;
            // let fixedvaluedComponent = this.salaryComponents.filter(x => x.PercentageValue == 0);
            // let i = 0;
            // while (i < fixedvaluedComponent.length) {
            //   let finalvalue = fixedvaluedComponent[i].MaxLimit;
            //   switch (fixedvaluedComponent[i].ComponentId) {
            //     case 'ECTG':
            //       this.salaryBreakupForm.get("GratuityAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("GratuityMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //     case 'CA':
            //       this.salaryBreakupForm.get("ConveyanceAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("ConveyanceMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //     case 'EPF':
            //       this.salaryBreakupForm.get("PFAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("PFMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //     case 'MA':
            //       this.salaryBreakupForm.get("MedicalAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("MedicalMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //     case 'SA':
            //       this.salaryBreakupForm.get("ShiftAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("ShiftMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //     case 'ESI':
            //       this.salaryBreakupForm.get("InsuranceAnnually").setValue(finalvalue);
            //       this.salaryBreakupForm.get("InsuranceMonthly").setValue(ToFixed((finalvalue/12), 0));
            //       break;
            //   }
            //   i++;
            // }
            this.isCompanyGroupSelected = true;
            // this.salaryCalculation(annualCTC);
          }
        })
      } else {
        ErrorToast("Please select salary group.")
      }
    }
  }

  calculateExpressionUsingInfixDS(expression: string): number {
    expression = `(${expression})`;
    let operatorStact = [];
    let expressionStact = [];
    let index = 0;
    let lastOp = '';
    let ch = '';
    while(index < expression.length) {
      ch = expression[index];
      if(ch.trim() == ''){
        index++;
        continue;
      }
      if(isNaN(Number(ch))) {
        switch(ch) {
          case '+':
          case '-':
          case '/':
          case '%':
          case '*':
            if(operatorStact.length > 0) {
              lastOp = operatorStact[operatorStact.length - 1];
              if(lastOp == '+' || lastOp == '-' || lastOp == '/' || lastOp == '*' || lastOp == '%') {
                lastOp = operatorStact.pop();
                expressionStact.push(lastOp);
              }
            }
            operatorStact.push(ch);
            break;
          case ')':
            while(true) {
              lastOp = operatorStact.pop();
              if(lastOp == '(') {
                //operatorStact.pop();
                break;
              }
              expressionStact.push(lastOp);
            }
            break;
          case '(':
            operatorStact.push(ch);
            break;
          default:
            ErrorToast("Invalid expression");
            break;
        }
      } else {
        let value = 0;
        while(true) {
          ch = expression[index];
          if(ch.trim() == '') {
            expressionStact.push(value);
            break;
          }

          if(!isNaN(Number(ch))) {
            value = Number(`${value}${ch}`);
            index++;
          } else {
            index--;
            expressionStact.push(value);
            break;
          }
        }
      }

      index++;
    }

    return this.calculationUsingInfixExpression(expressionStact);
  }

  calculationUsingInfixExpression(expressionStact: Array<any>): number {
    let i = 0;
    let term = [];
    while (i < expressionStact.length) {
      if (!isNaN(expressionStact[i]) && !isNaN(expressionStact[i+1]) && isNaN(Number(expressionStact[i+2]))) {
        let  finalvalue = 0;
        switch (expressionStact[i+2]) {
          case '+':
            finalvalue = expressionStact[i] + expressionStact[i+1];
            break;
          case '*':
            finalvalue = expressionStact[i] * expressionStact[i+1];
            break;
          case '-':
            finalvalue = expressionStact[i] - expressionStact[i+1];
            break;
          case '%':
            finalvalue = (expressionStact[i] * expressionStact[i+1]) / 100;
            break;
          }
        term.push(finalvalue);
        i = i+3;
      }
      else if(!isNaN(expressionStact[i]) && isNaN(Number(expressionStact[i+1]))) {
        let  finalvalue = 0;
        let lastterm = term.pop();
        switch (expressionStact[i+1]) {
          case '+':
            finalvalue = lastterm + expressionStact[i];
            break;
          case '*':
            finalvalue = lastterm * expressionStact[i];
            break;
          case '-':
            finalvalue = lastterm - expressionStact[i];
            break;
          case '%':
            finalvalue = (lastterm * expressionStact[i]) / 100;
            break;
          }
        term.push(finalvalue);
        i = i+2;
      } else {
        let  finalvalue = 0;
        let lastterm = term.pop();
        let previousterm = term.pop();
        switch (expressionStact[i]) {
          case '+':
            finalvalue = previousterm + lastterm;
            break;
          case '*':
            finalvalue = previousterm * lastterm;
            break;
          case '-':
            finalvalue = previousterm - lastterm;
            break;
          case '%':
            finalvalue = (previousterm * lastterm) / 100;
            break;
          }
        term.push(finalvalue);
        i++;
      }
    }
    if (term.length === 1) {
      return Math.trunc(term[0]);
    } else {
      term = [];
      ErrorToast("Invalid expression");
    }
  }

  salaryCalculation(annualCTC: number) {
    let grossAnnually = annualCTC - Number (this.salaryBreakupForm.get("InsuranceAnnually").value + this.salaryBreakupForm.get("PFAnnually").value + this.salaryBreakupForm.get("GratuityAnnually").value);
    this.salaryBreakupForm.get("GrossAnnually").setValue(grossAnnually);
    this.salaryBreakupForm.get("GrossMonthly").setValue(ToFixed((grossAnnually/12), 0));
    let i = 0;
    while (i < this.salaryComponents.length) {
      let formula = this.salaryComponents[i].Formula;
      let componentId = this.salaryComponents[i].ComponentId;
      if (formula && formula != '') {
        if (formula.includes("[BASIC]")) {
          let calculatedOn = Number(this.salaryBreakupForm.get("BasicAnnually").value);
          formula = formula.replace("[BASIC]", calculatedOn);
        }
        else if (formula.includes("[CTC]")) {
          let calculatedOn = annualCTC;
          formula = formula.replace("[CTC]", calculatedOn);
        }
        else if (formula.includes("[GROSS]")) {
          let calculatedOn = grossAnnually;
          formula = formula.replace("[GROSS]", calculatedOn);
        }

        let finalvalue = this.calculateExpressionUsingInfixDS(formula);
        switch (componentId) {
          case 'BS':
            this.salaryBreakupForm.get("BasicAnnually").setValue(ToFixed((finalvalue), 0));
            this.salaryBreakupForm.get("BasicMonthly").setValue(ToFixed((finalvalue/12), 0));
            break;
          case 'HRA':
            this.salaryBreakupForm.get("HRAAnnually").setValue(ToFixed((finalvalue), 0));
            this.salaryBreakupForm.get("HRAMonthly").setValue(ToFixed((finalvalue/12), 0));
            break;
          }
        }
        i++;
      }
      let specialAllowanceAnnually = grossAnnually - (Number (this.salaryBreakupForm.get("BasicAnnually").value) + Number(this.salaryBreakupForm.get("ConveyanceAnnually").value) + Number (this.salaryBreakupForm.get("HRAAnnually").value) + Number(this.salaryBreakupForm.get("MedicalAnnually").value) + Number(this.salaryBreakupForm.get("ShiftAnnually").value));
      this.salaryBreakupForm.get("SpecialAnnually").setValue(ToFixed((specialAllowanceAnnually), 0));
      this.salaryBreakupForm.get("SpecialMonthly").setValue(ToFixed((specialAllowanceAnnually/12), 0));
      this.salaryBreakupForm.get("CTCAnnually").setValue(annualCTC);
      this.salaryBreakupForm.get("CTCMonthly").setValue(ToFixed((annualCTC/12), 0));
  }

  saveSalaryBreakup() {
    this.isLoading = true;
    let value = this.salaryBreakupForm.value;
    if (value) {
      let empSalary = {
        EmployeeId: this.employeeUid,
        CTC: value.ExpectedCTC,
        GrossIncome: value.GrossAnnually,
        NetSalary: 0,
        GroupId: this.salaryGroupId
      }
      let formData = new FormData();
      formData.append('completesalarydetail', JSON.stringify(value));
      formData.append('salarydeatil', JSON.stringify(empSalary));
      this.http.post(`SalaryComponent/InsertUpdateSalaryBreakUp/${this.employeeUid}`, formData).then(res => {
        if (res.ResponseBody) {
          Toast("Salary breakup added successfully.");
          $('#fullSalaryDetail').modal('hide');
        }
        this.isLoading = false;
      })
    }
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
  ReportingManagerId: number = -1;
  DesignationId: number = null;
  AccessLevelId: number = null;
  UserTypeId: number = null;
  AllocatedClients: Array<AssignedClients> = [];
}

class SalaryBreakupDetails {
  EmployeeId: number  =0;
  BasicMonthly: number = 0;
  BasicAnnually: number = 0;
  ConveyanceMonthly: number = 0;
  ConveyanceAnnually: number = 0;
  HRAMonthly: number = 0;
  HRAAnnually: number = 0;
  MedicalMonthly: number = 0;
  MedicalAnnually: number = 0;
  CarRunningMonthly: number = 0;
  CarRunningAnnually: number = 0;
  InternetMonthly: number = 0;
  InternetAnnually: number = 0;
  TravelMonthly: number = 0;
  TravelAnnually: number = 0;
  ShiftMonthly: number = 0;
  ShiftAnnually: number = 0;
  SpecialMonthly: number = 0;
  SpecialAnnually: number = 0;
  GrossMonthly: number = 0;
  GrossAnnually: number = 0;
  InsuranceMonthly: number = 0;
  InsuranceAnnually: number = 0;
  PFMonthly: number = 0;
  PFAnnually: number = 0;
  GratuityMonthly: number = 0;
  GratuityAnnually: number = 0;
  CTCMonthly: number = 0;
  CTCAnnually: number = 0;
  ExpectedCTCAnnually: number = 0;
  FoodMonthly: number = 0;
  FoodAnnually: number = 0;
}
