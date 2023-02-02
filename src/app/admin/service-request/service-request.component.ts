import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss']
})
export class ServiceRequestComponent implements OnInit {
  isPageReady: boolean = false;
  orderByNameAsc: boolean = false;
  requestDetail: Array<any> = [];
  requestFilter: Filter = null;
  requestForm: FormGroup = null;
  isLoading: boolean = false;
  isFormReady: boolean = false;
  requestId: string = '';
  employeesList: autoCompleteModal = null;
  employeeId: number = 0;
  managers: Array<any> = [];
  
  constructor(
    private http: AjaxService,
    private fb: FormBuilder
    ) { }

  ngOnInit(): void {
    this.employeesList = new autoCompleteModal();
    this.employeesList.data = [];
    this.employeesList.placeholder = "Employee";
    this.employeesList.data = GetEmployees();
    this.employeesList.className = "";
    this.employeesList.isMultiSelect = true;

    this.requestFilter = new Filter();
    this.loadPageData()
  }

  selectedEmployee(e: any) {
    console.log(e);
    let index = this.managers.findIndex(x => x.value == e.value);
    if(index == -1) {
      this.managers.push(e);
    } else {
      this.managers.splice(index, 1);
    }
  }

  loadPageData() {
    this.http.post("ServiceRequest/GetServiceRequest", this.requestFilter).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.requestDetail = response.ResponseBody;
        this.isPageReady = true;
        Toast("Request service data loaded successfully.")
      } else {
        ErrorToast("Fail to get the result.");
      }
    });
  }

  initForm(service: any) {
    this.requestForm = this.fb.group({
      ServiceRequestId: new FormControl(service.ServiceRequestId),
      CompanyId: new FormControl(service.CompanyId),
      RequestTypeId: new FormControl(service.RequestTypeId, [Validators.required]),
      RequestTitle: new FormControl(service.RequestTitle, [Validators.required]),
      RequestDescription: new FormControl(service.RequestDescription, [Validators.required]),
      Quantity: new FormControl(service.Quantity),
      Duration: new FormControl(service.Duration),
      FromDate: new FormControl(service.FromDate),
      ToDate: new FormControl(service.ToDate),
      RequestedTo_1: new FormControl(service.RequestedTo_1),
      RequestedTo_2: new FormControl(service.RequestedTo_2),
      RequestedTo_3: new FormControl(service.RequestedTo_3),
      Reference: new FormControl(service.Reference),
      RequestStatus: new FormControl(service.RequestStatus),
      RequestedBy: new FormControl(service.RequestedBy),
      RequestedOn: new FormControl(service.RequestedOn),
      UpdatedOn: new FormControl(service.UpdatedOn)
    });
  }

  CreateUpdateRequest() {

  }

  resetFilter() {

  }

  filterRecords() { }

  arrangeDetails() { }

  EditCurrent(service: any) {
    this.isFormReady = false;
    if (service) {
      this.requestId = service.RequestTypeId;
      this.initForm(service);
      this.isFormReady = true;
      $('#addupdateModal').modal('show');
    }
  }

  enableAppropiateSection(e: any) {
    let value = e.target.value;
    if (value) {
      this.requestId = value;
    }
  }

  GetFilterResult(result: any) { }
}
