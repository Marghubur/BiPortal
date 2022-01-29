import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { tableConfig } from 'src/app/util/dynamic-table/dynamic-table.component';
import { ResopnseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { UserDetail } from 'src/providers/common-service/common.service';
import { DocumentsPage } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class documentsComponent implements OnInit {
  documentForm: FormGroup = null;
  user: UserDetail = null;
  documents: Array<OnlineDocModel> = [];
  tableConfiguration: tableConfig = null;
  openModal: string = 'hide';
  isLoading: boolean = false;
  personForm: FormGroup = null;
  isReady: boolean = false;
  personModel: PersonDetail = null;
  Menu: Array<any> = [{
    "MenuName": "Planning",
    "Icon": "null",
    "BadgeName": "New",
    "Link": "null",
    "BadgeType": "rectangle"
  },
  {
    "Category": "Planning",
    "MenuName": "Roadmap",
    "Icon": "fa fa-file-pdf-o",
    "BadgeName": "null",
    "Link": "roadmap",
    "BadgeType": "null"
  },
  {
    "Category" : "Planning",
    "MenuName" : "Backlog",
    "Icon" : "fa fa-file-pdf-o",
    "BadgeName" : "",
    "Link" : "roadmap",
    "BadgeType" : "null"
  },
  {
    "Category" : "Planning",
    "MenuName" : "Board",
    "Icon" : "fa fa-file-pdf-o",
    "BadgeName" : "",
    "Link" : "roadmap",
    "BadgeType" : "null"
  },
  {
    "Category" : "Planning",
    "MenuName" : "Issues",
    "Icon" : "fa fa-file-pdf-o",
    "BadgeName" : "",
    "Link" : "roadmap",
    "BadgeType" : "null"
  },
  {
    "MenuName": "Development",
    "Icon": "null",
    "BadgeName": "",
    "Link": "null",
    "BadgeType": ""
  },
  {
    "Category": "Development",
    "MenuName": "Code",
    "Icon": "fa fa-file-pdf-o",
    "BadgeName": "",
    "Link": "roadmap",
    "BadgeType": ""
  },
  {
    "Category" : "Development",
    "MenuName" : "Releases",
    "Icon" : "fa fa-file-pdf-o",
    "BadgeName" : "",
    "Link" : "roadmap",
    "BadgeType" : ""
  },
  {
    "MenuName": "Operation",
    "Icon": "null",
    "BadgeName": "",
    "Link": "null",
    "BadgeType": ""
  },
  {
    "Category": "Operation",
    "MenuName": "Deployments",
    "Icon": "fa fa-file-pdf-o",
    "BadgeName": "",
    "Link": "roadmap",
    "BadgeType": ""
  }
  ]

  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private userService: UserService,
    private nav: iNavigation,
  ) { }

  ngOnInit(): void {
    this.personModel = new PersonDetail();
    this.documentForm = this.fb.group({
      "Title": new FormControl(""),
      "Description": new FormControl(""),
      "CreatedOn": new FormControl(new Date()),
      "PageLink": new FormControl("")
    });

    this.user = this.userService.getInstance();
    if (this.user !== undefined && this.user !== null) {
      this.LoadData();
    } else {
      this.initForm();
      this.isReady = true;
    }
  }

  initForm() {
    this.personForm = this.fb.group({
      FirstName: new FormControl(this.personModel.FirstName, [Validators.required]),
      LastName: new FormControl(this.personModel.LastName),
      Mobile: new FormControl(this.personModel.Mobile, [Validators.required]),
      Email: new FormControl(this.personModel.Email, [Validators.required]),
      SecondaryMobile: new FormControl(this.personModel.SecondaryMobile),
      FatherName: new FormControl(this.personModel.FatherName),
      MotherName: new FormControl(this.personModel.MotherName),
      SpouseName: new FormControl(this.personModel.SpouseName),
      State: new FormControl(this.personModel.State),
      City: new FormControl(this.personModel.City),
      Pincode: new FormControl(this.personModel.Pincode),
      Address: new FormControl(this.personModel.Address),
      PANNo: new FormControl(this.personModel.PANNo),
      AadharNo: new FormControl(this.personModel.AadharNo),
      AccountNumber: new FormControl(this.personModel.AccountNumber),
      BankName: new FormControl(this.personModel.BankName),
      IFSCCode: new FormControl(this.personModel.IFSCCode),
      Domain: new FormControl(this.personModel.Domain),
      Specification: new FormControl(this.personModel.Specification),
      ExprienceInYear: new FormControl(this.personModel.ExprienceInYear),
      LastCompanyName: new FormControl(this.personModel.LastCompanyName),
      IsPermanent: new FormControl(this.personModel.IsPermanent),
      AllocatedClientId: new FormControl(this.personModel.AllocatedClientId),
      ActualPackage: new FormControl(this.personModel.ActualPackage, [Validators.required]),
      FinalPackage: new FormControl(this.personModel.FinalPackage, [Validators.required]),
      TakeHomeByCandidate: new FormControl(this.personModel.TakeHomeByCandidate, [Validators.required]),
      EmployeeUid: new FormControl(this.personModel.EmployeeUid),
      BranchName: new FormControl(this.personModel.BranchName),
      AllocatedClientName: new FormControl(this.personModel.AllocatedClientName)
    });
  }

  LoadData() {
    let filter: Filter = new Filter();
    let Mobile = '';
    let Email = '';
    if (this.user.Mobile !== null)
      Mobile = this.user.Mobile;

    if (this.user.EmailId !== null)
      Email = this.user.EmailId;

    if (Mobile !== "" || Email !== "") {
      filter.SearchString = `1=1 AND UD.MOBILENO = '${Mobile}' OR UD.EMAILID = '${Email}'`;
      this.http.post("OnlineDocument/GetOnlineDocuments", filter).then((response: ResopnseModel) => {
        let result = response.ResponseBody;
        this.BuildDocumentTable(result);
        this.isReady = true;
      });
    }
  }

  BuildDocumentTable(result: any) {
    if (result !== null && result.length > 0) {
      this.tableConfiguration = new tableConfig();
      this.tableConfiguration.totalRecords = 1;
      this.tableConfiguration.data = result;
      this.tableConfiguration.isEnableAction = true;
      this.tableConfiguration.header = [
        { DisplayName: 'S.No#', ColumnName: 'DocumentId' },
        { DisplayName: 'Company Name', ColumnName: 'Title' },
        { DisplayName: 'Description', ColumnName: 'Description' },
        { DisplayName: 'Created Date', ColumnName: 'CreatedOn' },
      ];
      this.tableConfiguration.link = [
        { iconName: 'fa fa-external-link-square' }
      ]
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
            this.isLoading = true;
          }).catch(e => {
            this.isLoading = true;
          });
      } else {
        alert("Entry name is required field.");
      }
    }
  }

  openDocument(path: OnlineDocModel) {
    this.nav.navigate(DocumentsPage, path);
  }

  loadDocumentPage(value: any) {
    if (value !== null) {
      let doc: OnlineDocModel = JSON.parse(value);
      if (doc !== null) {
        this.nav.navigate(DocumentsPage, doc);
      }
    }
  }

  toggelAddUpdateModal() {
    // if(this.openModal === 'showmodal')
    //   this.openModal = 'hide';
    // else
    //   this.openModal = 'showmodal';
    // $('#addupdateModal').modal(this.openModal)

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

export class PersonDetail {
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
