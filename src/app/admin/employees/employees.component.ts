import { fn } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { ResopnseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, UserDetail } from 'src/providers/common-service/common.service';
import { DocumentsPage, Employees, Files, ManageEmployee } from 'src/providers/constants';
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
  employeeDetail: Array<any> = [];
  activePage:number = 0;  
  
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
    this.http.post("Employee/GetEmployees", filter).then((response: ResopnseModel) => {
      this.employeeDetail = response.ResponseBody;
      this.BuildDocumentTable(this.employeeDetail);
    });
  }

  BuildDocumentTable(result: any) {
    let rows: any = result;
    if (result === null || result.length === 0) {
      rows = [];
    }

    // this.tableConfiguration = new tableConfig();
    // this.tableConfiguration.totalRecords = 1;
    // this.tableConfiguration.data = rows;
    // this.tableConfiguration.isEnableAction = true;
    // this.tableConfiguration.header = this.userService.getColumns(Employees);
    // this.tableConfiguration.link = [
    //   { iconName: 'fa fa-pencil-square-o', fn: this.EditCurrent },
    //   { iconName: 'fa fa-trash-o', fn: this.DeleteCurrent },
    //   { iconName: 'fa fa-file-o', fn: this.ViewFiles }
    // ]
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
        this.http.get(`Employee/GetEmployeeById/${EmpId}/${item.IsActive}`).then((response: ResopnseModel) => {
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
          .then((response: ResopnseModel) => {
            let data = response.ResponseBody;
            if (data !== null) {
              this.BuildDocumentTable(data);
              this.toggelAddUpdateModal();
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
