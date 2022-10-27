import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tableConfig } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { Attendance, Documents, DocumentsPage, EmployeePerformance, Employees, Files, ManageEmployee, Profile, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { DocumentUser } from '../documents/documents.component';
import 'bootstrap';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
declare var $: any;

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, AfterViewChecked {
  documentForm: FormGroup = null;
  user: UserDetail = null;
  documents: Array<OnlineDocModel> = [];
  tableConfiguration: tableConfig = null;
  openModal: string = 'hide';
  manageEmployeeRouteName: string = ManageEmployee;
  isLoading: boolean = false;
  employeeDetail: Array<employeeModel> = [];
  activePage:number = 0;
  employeeData: Filter = null;
  isEmpPageReady: boolean = false;
  anyFilter: string = "";
  employeeDetails: employeeModel = null;
  singleEmployee: any = null;
  isActiveEmployee: number = 1;
  isActiveTab: any = {};
  orderByNameAsc: boolean = null;
  orderByMobileAsc: boolean = null;
  orderByEmailAsc: boolean = null;
  isFileFound: boolean = false;
  companyId: number = 0;
  companies: Array<any> = [];

  displayActivePage(activePageNumber:number){
    this.activePage = activePageNumber
  }

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private local: ApplicationStorage,
    private userService: UserService,
    private nav: iNavigation,
    private common: CommonService
  ) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit(): void {
    this.isActiveTab = {
      Active: true,
      InActive: false,
      All: false
    };
    this.employeeData = new Filter();
    this.employeeData.SearchString = "";
    this.employeeDetails = new employeeModel();
    let Master = this.local.get(null);
    if (Master !== null && Master !== "") {
      this.companies = Master["Companies"];
    } else {
      ErrorToast("Invalid user. Please login again.")
    }

    this.documentForm = this.fb.group({
      "Title": new FormControl(""),
      "Description": new FormControl(""),
      "CreatedOn": new FormControl(new Date()),
      "PageLink": new FormControl("")
    });

    this.user = this.userService.getInstance();
    if (this.user !== undefined && this.user !== null) {
      this.LoadData();
    }
  }

  SwitchTab(e: any, value: number) {
    switch(value) {
      case 1:
        this.isActiveTab = {
          Active: true,
          InActive: false,
          All: false
        };
        break;
      case 0:
        this.isActiveTab = {
          Active: false,
          InActive: true,
          All: false
        };
        break;
      default:
        this.isActiveTab = {
          Active: false,
          InActive: false,
          All: true
        };
        break;
    }
    this.employeeData = new Filter();
    if (value == 1)
      this.isActiveEmployee = 1;
    else if (value == 0)
      this.isActiveEmployee = 0;
    else
      this.isActiveEmployee = -1;
    this.LoadData();
  }

  LoadData() {
    this.isEmpPageReady = false;
    this.isFileFound = false;
    let activeState = null;
    if(this.isActiveEmployee != -1) {
      if(this.isActiveEmployee == 1)
        this.employeeData.isActive = true;
      else
        this.employeeData.isActive = false;
    }

    this.http.post("Employee/GetEmployees", this.employeeData).then((response: ResponseModel) => {
      this.employeeDetail = response.ResponseBody;
      let i =0;
      while (i < this.employeeDetail.length) {
        let value  = JSON.parse(this.employeeDetail[i].ClientJson);
        if (value == null)
          this.employeeDetail[i].ClientJson = [];
        else
          this.employeeDetail[i].ClientJson = value;
        i++;
      }
      if (this.employeeDetail.length > 0) {
        this.employeeData.TotalRecords = this.employeeDetail[0].Total;
        this.isEmpPageReady = true;
        this.isFileFound = true;
      } else {
        this.employeeData.TotalRecords = 0;
      }
      this.isEmpPageReady = true;
      let elem = document.getElementById('namefilter');
      if(elem)elem.focus();
    });
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'FirstName') {
      this.orderByNameAsc = !flag;
      this.orderByMobileAsc = null;
      this.orderByEmailAsc = null;
    } else if (FieldName == 'Mobile') {
      this.orderByMobileAsc = !flag;
      this.orderByEmailAsc = null;
      this.orderByNameAsc = null;
    }
    if (FieldName == 'Email') {
      this.orderByEmailAsc = !flag;
      this.orderByNameAsc = null;
      this.orderByMobileAsc = null;
    }
    this.employeeData = new Filter();
    this.employeeData.SortBy = FieldName +" "+ Order;
    this.LoadData()
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.employeeData.SearchString = ""
    this.employeeData.reset();

    if(this.employeeDetails.Name !== null && this.employeeDetails.Name !== "") {
      this.employeeData.SearchString += ` 1=1 and emp.FirstName like '%${this.employeeDetails.Name}%'`;
        delimiter = "and";
    }

    if(this.employeeDetails.Email !== null && this.employeeDetails.Email !== "") {
      this.employeeData.SearchString += `1=1 And emp.Email like '%${this.employeeDetails.Email}%'`;
        delimiter = "and";
    }

    this.employeeData.CompanyId = Number(this.companyId);

    if(this.employeeDetails.Mobile !== null && this.employeeDetails.Mobile.trim() !== '') {
      this.employeeData.SearchString += `1=1 And emp.Mobile like '%${this.employeeDetails.Mobile}%'`;
        delimiter = "and";
    }

    this.LoadData();
  }

  globalFilter() {
    let searchQuery = "";
    this.employeeData.reset();
    searchQuery= `emp.FirstName like '%${this.anyFilter}%' OR emp.Email like '%${this.anyFilter}%' OR emp.Mobile like '%${this.anyFilter}%'`;
    this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    this.LoadData();
  }

  resetFilter() {
    this.isActiveEmployee = 1;
    this.isActiveTab = {
      Active: true,
      InActive: false,
      All: false
    };
    this.employeeData.SearchString = "";
    this.employeeData.PageIndex = 1;
    this.employeeData.PageSize = 10;
    this.employeeData.StartIndex = 1;
    this.employeeData.EndIndex = (this.employeeData.PageSize * this.employeeData.PageIndex);
    this.companyId = 0;
    this.LoadData();
    this.employeeDetails.Name="";
    this.employeeDetails.Mobile = null;
    this.employeeDetails.Email="";
    this.anyFilter = "";
  }


  DeleteCurrent(item: any) {
    if (item != null) {
      let empId = item.EmployeeUid;
      if (empId !== null && empId !== "") {
        item.IsActive = false;
        this.http.delete(`Employee/ActivateOrDeActiveEmployee/${empId}/${item.IsActive}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            Toast("Employee Deleted successfully")
            this.LoadData();
          }
        });
      }
    }
    this.ClosePopup();
  }

  DeactivatedEmployee(item: any) {
    if (item != null) {
      let empId = item.EmployeeUid;
      if (empId !== null && empId !== "") {
        item.IsActive = true;
        this.http.delete(`Employee/ActivateOrDeActiveEmployee/${empId}/${item.IsActive}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            Toast("Employee Activated successfully");
            this.LoadData();
          }
        });
      }
    }
    this.ClosePopup();
  }

  CreatePopup(e: any) {
    $('#deleteEmployee').modal('show');
    this.singleEmployee = e;
  }

  ClosePopup() {
    $('#deleteEmployee').modal('hide');
  }

  ViewFiles(data: any) {
    this.nav.navigate(Files, data)
  }

  EditCurrent(item: any) {
    if (item !== null) {
      let EmpId = item.EmployeeUid;
      if (EmpId !== null && EmpId !== "") {
        this.http.get(`Employee/GetEmployeeById/${EmpId}/${this.isActiveEmployee}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(ManageEmployee, response.ResponseBody);
          }
        }).catch(e => {
          this.common.ShowToast("Got error to get data. Please contact to admin.");
        })
      }
    }
  }

  editProfile(item: any) {
    if (item !== null) {
      let EmpId = item.EmployeeUid;
      let status = 1;
      if (item.IsActive == true)
        status = 1;
      else
        status = 0;

      if (EmpId !== null && EmpId !== "") {
        this.http.get(`Employee/GetEmployeeById/${EmpId}/${status}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(Profile, response.ResponseBody);
          }
        }).catch(e => {
          this.common.ShowToast("Got error to get data. Please contact to admin.");
        })
      }
    }
  }

  ClickEvents(data: any) {
    if(this[data.fn.name]) {
      this[data.fn.name](data.item);
    }
  }

  CreateDocument() {
    if (this.documentForm.valid) {
      if (this.documentForm.controls['Title'].value !== "" &&
        this.documentForm.controls['Description'].value !== "") {
        this.isLoading = true;
        let filter: Filter = new Filter();
        filter.SearchString = `1=1 AND UD.MOBILENO = '${this.user.Mobile}' OR UD.EMAILID = '${this.user.EmailId}'`;
        filter["OnlineDocumentModel"] = this.documentForm.value;
        filter["Mobile"] = this.user.Mobile;
        filter["Email"] = this.user.EmailId;
        this.http.post('OnlineDocument/CreateDocument', filter)
          .then((response: ResponseModel) => {
            let data = response.ResponseBody;
            if (data !== null) {
              // this.BuildDocumentTable(data);
              this.toggelAddUpdateModal();
              this.LoadData();
            } else {
              this.toggelAddUpdateModal();
            }
            this.isLoading = false;
          }).catch(e => {
            this.isLoading = false;
          });
      } else {
        this.common.ShowToast("Entry name is required field.");
      }
    }
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.employeeData = e;
      this.LoadData();
    }
  }


  openDocument(path: OnlineDocModel) {
    this.nav.navigate(DocumentsPage, path);
  }

  toggelAddUpdateModal() {
    if (this.openModal === 'showmodal')
      this.openModal = 'hide';
    else
      this.openModal = 'showmodal';
    $('#addupdateModal').modal(this.openModal)
  }

  goToAttendancePage(user: any) {
    if(user) {
      this.nav.navigate(Attendance, user);
    } else {
      Toast("Please select an employee")
    }
  }

  goToPerformancePage(user: any) {
    if(user) {
      this.nav.navigate(EmployeePerformance, user);
    } else {
      Toast("Please select an employee")
    }
  }

  AddEditDocuments(user: employeeModel) {
    let userDetail: DocumentUser = new DocumentUser();
    userDetail.Mobile = user.Mobile;
    userDetail.Email = user.Email;
    userDetail.PageName = Employees;
    userDetail.UserId = user.EmployeeUid,
    userDetail.Name = user.FirstName +" "+ user.LastName
    this.nav.navigate(Documents, userDetail);
  }
}

export class OnlineDocModel {
  constructor(data: any) {
    this.DocumentId = data['DocumentId'];
    this.Title = data['Title'];
    this.Description = data['Description'];
    this.UserId = data['UserId'];
    this.DocPath = data['DocPath'];
    this.CreatedOn = data['CreatedOn'];
    this.UpdatedOn = data['UpdatedOn'];
  }
  DocumentId: number = 0;
  Title: string = null;
  Description: string = null;
  UserId: string = null;
  DocPath: string = null;
  TotalRows: number = 0;
  CreatedOn: string = null;
  UpdatedOn: string = null;
}

export class employeeModel {
  Name: string = '';
  LastName: string = '';
  Mobile: string = null;
  Email: string = '';
  Total: number = 0;
  EmployeeUid: number = 0;
  FirstName?: string = '';
  ClientJson?: any = null;
  IsActive?: boolean = null;
}


