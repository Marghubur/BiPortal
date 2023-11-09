import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tableConfig } from 'src/providers/ajax.service';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, UserDetail } from 'src/providers/common-service/common.service';
import { BillDetail, Clients, Documents, DocumentsPage, RegisterClient, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
import { Filter, UserService } from 'src/providers/userService';
import { clientModel, DocumentUser, OnlineDocModel } from 'src/app/adminmodal/admin-modals';
declare var $:any;

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  documentForm: FormGroup = null;
  user: UserDetail = null;
  documents: Array<OnlineDocModel> = [];
  tableConfiguration: tableConfig = null;
  openModal: string = 'hide';
  isLoading: boolean = false;
  RegisterNewClient: string = RegisterClient;
  clients: Array<any> = [];
  activePage:number = 0;
  clientsData: Filter = null;
  isClientFound: boolean = false;
  clientDetails: clientModel = null;
  anyFilter: string = "";
  singleClient: any = null;
  isActiveClient: number = 1;
  orderByNameAsc: boolean = null;
  orderByMobileAsc: boolean = null;
  orderByEmailAsc: boolean = null;
  orderByCityAsc: boolean = null;
  orderByFirstAddressAsc: boolean = null;
  isFileFound: boolean = false;

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
    this.clientsData = new Filter();
    this.clientDetails = new clientModel();

    // this.paginationData.PageIndex = 1;
    // this.paginationData.PageSize = 10;
    // this.paginationData.TotalRecords = 95;
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

  AddEditDocuments(client: any) {
    let userDetail: DocumentUser = new DocumentUser();
    userDetail.PageName = Clients;
    userDetail.UserId = client.ClientId;
    userDetail.Name = client.ClientName;
    userDetail.Email = client.Email;
    userDetail.Mobile = client.PrimaryPhoneNo;
    userDetail.UserTypeId = UserType.Client;
    this.nav.navigate(Documents, userDetail);
  }

  SwitchTab(e: any, value: number) {
    let elem: any = document.getElementById("client-tab").querySelectorAll('a')
    let i = 0;
    while(i < elem.length) {
      elem[i].classList.remove('tab-active');
      i++;
    }
    e.target.classList.add('tab-active');
    this.isActiveClient = value;
    // var searchQuery = `IsActive = '${value}' `;
    // this.clientsData.SearchString = `1=1 And ${searchQuery}`;
    // this.LoadData();
  }

  LoadData() {
    this.isClientFound = false;
    this.isFileFound = false;
    let filter: Filter = new Filter();
    let Mobile = '';
    let Email = '';
    if (this.user.Mobile !== null)
      Mobile = this.user.Mobile;

    if (this.user.EmailId !== null)
      Email = this.user.EmailId;

    if (Mobile !== "" || Email !== "") {
      filter.SearchString = `1 `;
      this.clientsData.SearchString = this.clientsData.SearchString + " and CompanyId =" + this.user.CompanyId;
      this.http.post("Clients/GetClients", this.clientsData).then((response: ResponseModel) => {
        if (response.ResponseBody) {
          this.clients = response.ResponseBody;
          if (this.clients.length > 0) {
            this.clientsData.TotalRecords = this.clients[0].Total;
            this.isClientFound = true;
            this.isFileFound = true;
          } else {
            this.clientsData.TotalRecords = 0;
          }
        }
        this.isClientFound = true;
      });
    }
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'ClientName')
      this.orderByNameAsc = !flag;
    if (FieldName == 'PrimaryPhoneNo')
      this.orderByMobileAsc = !flag;
    if (FieldName == 'Email')
      this.orderByEmailAsc = !flag;
    if (FieldName == 'City')
      this.orderByCityAsc = !flag;
    if (FieldName == 'FirstAddress')
      this.orderByFirstAddressAsc = !flag;
    this.clientsData = new Filter();
    this.clientsData.SortBy = FieldName +" "+ Order;
    this.LoadData()
  }


  EditCurrent(data: any) {
    if (data !== null) {
      //data = data.item;
      let ClientId = data.ClientId;
      let UserTypeId = UserType.Client
      if (ClientId !== null && ClientId !== "") {
        this.http.get(`Clients/GetClientById/${ClientId}/${data.IsActive}/${UserTypeId}`).then((response: ResponseModel) => {
          if (response.ResponseBody !== null) {
            this.nav.navigate(RegisterClient, response.ResponseBody);
          }
        }).catch(e => {
          this.common.ShowToast("Got error to get data. Please contact to admin.");
        })
      }
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
              this.clients = data;;
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

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.clientsData = e;
      this.LoadData();
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

  filterRecords() {
    let searchQuery = "";
    let delimiter = "";
    this.clientsData.reset();

    if(this.clientDetails.ClientName !== null && this.clientDetails.ClientName !== "") {
        searchQuery += ` ClientName like '${this.clientDetails.ClientName}%'`;
        delimiter = "and";
      }

    if(this.clientDetails.Email !== null && this.clientDetails.Email !== "") {
      searchQuery += ` ${delimiter} Email like '%${this.clientDetails.Email}%' `;
        delimiter = "and";
    }
    if(this.clientDetails.PrimaryContactNo !== null && this.clientDetails.PrimaryContactNo !== 0) {
      searchQuery += ` ${delimiter} PrimaryPhoneNo like '%${this.clientDetails.PrimaryContactNo}%' `;
        delimiter = "and";
    }
    if(this.clientDetails.City !== null && this.clientDetails.City !== "") {
      searchQuery += ` ${delimiter} City like '${this.clientDetails.City}%' `;
        delimiter = "and";
    }
    if(this.clientDetails.FirstAddress !== null && this.clientDetails.FirstAddress !== "") {
      searchQuery += ` ${delimiter} FirstAddress like '${this.clientDetails.FirstAddress}%' `;
        delimiter = "and";
    }
    if(searchQuery !== "") {
      this.clientsData.SearchString = `1=1 And ${searchQuery}`;
    }

    this.LoadData();
  }

  globalFilter() {
    let searchQuery = "";
    this.clientsData.reset();
    searchQuery = ` ClientName like '${this.anyFilter}%' OR Email like '${this.anyFilter}%' OR PrimaryPhoneNo like '%${this.anyFilter}%' OR City like '${this.anyFilter}%'`;
    if(searchQuery !== "") {
      this.clientsData.SearchString = `1=1 And ${searchQuery}`;
    }
    this.LoadData();
  }

  activeClients() {
    // let searchQuery = "";
    // let delimiter = "";
    // if(this.clientDetails.FirstAddress !== null && this.clientDetails.FirstAddress !== "") {
    //   searchQuery += ` ${delimiter} IsActive = '${this.clientDetails.FirstAddress}%' `;
    //     delimiter = "and";
    // }
    // if(searchQuery !== "") {
    //   this.clientsData.SearchString = `1=1 And ${searchQuery}`;
    // }

    // this.LoadData();
  }

  resetFilter() {
    this.clientsData.SearchString = "1=1";
    this.clientsData.PageIndex = 1;
    this.clientsData.PageSize = 10;
    this.clientsData.StartIndex = 1;
    this.clientsData.EndIndex = (this.clientsData.PageSize * this.clientsData.PageIndex);
    this.LoadData();
    this.clientDetails.ClientName="";
    this.clientDetails.PrimaryContactNo = null;
    this.clientDetails.Email="";
    this.clientDetails.FirstAddress="";
    this.clientDetails.City="";
    this.anyFilter = "";
  }

  CreatePopup(e: any) {
    $('#deleteClient').modal('show');
  }

  ClosePopup() {
    $('#deleteClient').modal('hide');
  }

  viewClientFile(client: any) {
    this.nav.navigate(BillDetail, client)
  }

  navtoRegisterClient() {
    this.nav.navigate(RegisterClient, null);
  }
}
