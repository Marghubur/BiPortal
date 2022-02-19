import { fn } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, UserDetail } from 'src/providers/common-service/common.service';
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
    this.employeeData = new Filter();
    this.employeeDetails = new employeeModel();


    this.documentForm = this.fb.group({
      "Title": new FormControl(""),
      "Description": new FormControl(""),
      "CreatedOn": new FormControl(new Date()),
      "PageLink": new FormControl("")
    });

    this.user = this.userService.getInstance();
    if (this.user !== undefined && this.user !== null)
      this.LoadData(1);
  }

  LoadAllActiveOnly(){
    this.LoadData(1);
  }

  LoadAllInActiveOnly(){
    this.LoadData(0);
  }

  LoadAll(){
    this.LoadData(-1);
  }

  LoadData(IsActive: number) {
    let filter: Filter = new Filter();
    filter.SearchString = `1=1 And IsActive = ${IsActive}`;
    this.http.post("Employee/GetEmployees", this.employeeData).then((response: ResponseModel) => {
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
        searchQuery += ` FirstName like '${this.employeeDetails.Name}%' OR LastName like '${this.employeeDetails.Name}%'`;
        delimiter = "and";
      }

    if(this.employeeDetails.Email !== null && this.employeeDetails.Email !== "") {
      searchQuery += ` ${delimiter} Email like '%${this.employeeDetails.Email}%' `;
        delimiter = "and";
    }
    if(this.employeeDetails.Mobile !== null && this.employeeDetails.Mobile !== 0) {
      searchQuery += ` ${delimiter} Mobile like '${this.employeeDetails.Mobile}%' `;
        delimiter = "and";
    }
    if(searchQuery !== "") {
      this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.LoadData(1);
  }

  globalFilter() {
    let searchQuery = "";
    searchQuery = ` FirstName like '${this.anyFilter}%' OR LastName like '${this.anyFilter}%' OR Email like '%${this.anyFilter}%' OR Mobile like '${this.anyFilter}%'`;
    if(searchQuery !== "") {
      this.employeeData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.LoadData(1);
  }

  resetFilter() {
    this.employeeData.SearchString = "1=1";
    this.employeeData.PageIndex = 1;
    this.employeeData.PageSize = 10;
    this.employeeData.StartIndex = 1;
    this.employeeData.EndIndex = (this.employeeData.PageSize * this.employeeData.PageIndex);

    this.LoadData(1);
    this.employeeDetails.Name="";
    this.employeeDetails.Mobile = null;
    this.employeeDetails.Email="";
    this.anyFilter = "";
  }

  DeleteCurrent() {
    this.common.ShowToast("Its working...");
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
              this.LoadData(1);
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
      this.LoadData(1);
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

  goToAttendancePage(userId: number) {
    this.nav.navigate(Attendance, {
      "UserId": Number(userId),
      "UserTypeId" : UserType.Employee
    })
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


