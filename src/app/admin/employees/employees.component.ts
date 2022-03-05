import { fn } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { Attendance, DocumentsPage, Employees, Files, ManageEmployee, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
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
  isActiveTab: any = {}

  displayActivePage(activePageNumber:number){
    this.activePage = activePageNumber
  }

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private userService: UserService,
    private nav: iNavigation,
    private common: CommonService
  ) { }

  ngOnInit(): void {
    this.isActiveTab = {
      Active: true,
      InActive: false,
      All: false
    };
    this.employeeData = new Filter();
    this.employeeData.SearchString = "";
    this.employeeDetails = new employeeModel();


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
    this.isActiveEmployee = value;
    this.LoadData();
  }

  LoadData() {
    let query = " 1=1 ";
    if(this.employeeData.SearchString.trim() !== "") {
      query = ` 1=1 And ${this.employeeData.SearchString}`;
    }

    if(this.isActiveEmployee != -1){
      query += ` And IsActive = ${this.isActiveEmployee}`;
    }

    this.http.post("Employee/GetEmployees", {
      SearchString: query,
      PageIndex: this.employeeData.PageIndex,
      PageSize: this.employeeData.PageSize,
      SortBy: this.employeeData.SortBy,
    }).then((response: ResponseModel) => {
      this.employeeDetail = response.ResponseBody;
      if (this.employeeDetail.length > 0) {
        this.employeeData.TotalRecords = this.employeeDetail[0].Total;
        this.isEmpPageReady = true;
      } else {
        this.employeeData.TotalRecords = 0;
      }
    });
  }

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";

    if(this.employeeDetails.Name !== null && this.employeeDetails.Name !== "") {
      this.employeeData.SearchString += ` FirstName like '${this.employeeDetails.Name}%' OR LastName like '${this.employeeDetails.Name}%'`;
        delimiter = "and";
    }

    if(this.employeeDetails.Email !== null && this.employeeDetails.Email !== "") {
      this.employeeData.SearchString += ` ${delimiter} Email like '%${this.employeeDetails.Email}%' `;
        delimiter = "and";
    }

    if(this.employeeDetails.Mobile !== null && this.employeeDetails.Mobile !== 0) {
      this.employeeData.SearchString += ` ${delimiter} Mobile like '%${this.employeeDetails.Mobile}%' `;
        delimiter = "and";
    }

    this.LoadData();
  }

  globalFilter() {
    let searchQuery = "";
    this.employeeData.SearchString = ` FirstName like '${this.anyFilter}%' OR LastName like '${this.anyFilter}%' OR Email like '%${this.anyFilter}%' OR Mobile like '${this.anyFilter}%'`;

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
        this.http.delete(`Employee/DeleteEmployeeById/${empId}/${item.IsActive}`).then((response: ResponseModel) => {
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
        this.http.delete(`Employee/DeleteEmployeeById/${empId}/${item.IsActive}`).then((response: ResponseModel) => {
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
        this.http.get(`Employee/GetEmployeeById/${EmpId}/${item.IsActive}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(ManageEmployee, response.ResponseBody);
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
  Mobile: number = null;
  Email: string = '';
  Total: number = 0;
}


