import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService, ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { UserImage, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {
  submitted: boolean = false;
  organizationForm: FormGroup = null;
  organizationModal: organizationModal = null;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  isLoaded: boolean = false;
  profileURL: string = UserImage;
  fileDetail: Array<any> = [];
  UserTypeId: UserType= UserType.Client;
  CompanyId: number = 0;
  singleOrganization: any = null;

  constructor(private http: AjaxService,
    private fb: FormBuilder,
    private common: CommonService,
    private nav: iNavigation
  ) { }

  ngOnInit(): void {
    this.organizationModal = new organizationModal();
    let data = this.nav.getValue();
    if (data > 0) {
      this.CompanyId = data;
      this.loadData();
    } else {
      ErrorToast("Please select a company.")
    }
  }

  buildProfileImage(fileDetail: any) {
    if (fileDetail && fileDetail.length > 0) {
      let logoFile = fileDetail.find(x => x.FileName == "CompanyLogo")
      if (logoFile) {
        this.profileURL = `${this.http.GetImageBasePath()}${logoFile.FilePath}/${logoFile.FileName}.${logoFile.FileExtension}`;
        this.organizationModal.FileId = logoFile.FileId;
      }
    }
  }

  loadData() {
    this.isLoaded = false;
    this.http.get(`Company/GetCompanyById/${this.CompanyId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
          this.organizationModal = response.ResponseBody.OrganizationDetail;
          this.buildProfileImage(response.ResponseBody.Files);
          this.singleOrganization = this.organizationModal;
          this.initForm();
          this.isLoaded = true;
      } else {
        ErrorToast("Fail to get the data.");
        this.isLoaded = true;
      }
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  get f() {
    let data = this.organizationForm.controls;
    return data;
  }

  initForm() {
    this.organizationForm = this.fb.group({
      CompanyId: new FormControl(this.organizationModal.CompanyId),
      OrganizationName: new FormControl(this.organizationModal.OrganizationName, [Validators.required]),
      CompanyName: new FormControl(this.organizationModal.CompanyName, [Validators.required]),
      MobileNo: new FormControl(this.organizationModal.MobileNo),
      PrimaryPhoneNo: new FormControl(this.organizationModal.PrimaryPhoneNo),
      SecondaryPhoneNo: new FormControl(this.organizationModal.SecondaryPhoneNo),
      Email: new FormControl(this.organizationModal.Email, [Validators.required]),
      Fax: new FormControl(this.organizationModal.Fax),
      FirstAddress: new FormControl(this.organizationModal.FirstAddress),
      SecondAddress: new FormControl(this.organizationModal.SecondAddress),
      ThirdAddress: new FormControl(this.organizationModal.ThirdAddress),
      FourthAddress: new FormControl(this.organizationModal.FourthAddress),
      Pincode: new FormControl(this.organizationModal.Pincode === 0 ? null : this.organizationModal.Pincode),
      City: new FormControl(this.organizationModal.City),
      State: new FormControl(this.organizationModal.State),
      Country: new FormControl(this.organizationModal.Country),
      AdminId: new FormControl(this.organizationModal.AdminId),
      FileId: new FormControl(this.organizationModal.FileId),
      ProfileImgPath: new FormControl('')
    });
  }

  reset() {
    this.submitted = false;
    this.common.ShowToast("Form is reset.");
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;

    if (this.organizationForm.get("CompanyName").value === "" || this.organizationForm.get("CompanyName").value === null)
      errroCounter++;
    if (this.organizationForm.get("OrganizationName").value === "" || this.organizationForm.get("OrganizationName").value === null)
      errroCounter++;
    if (this.organizationForm.get("Email").value === "" || this.organizationForm.get("Email").value === null)
      errroCounter++;

    if (this.organizationForm.get("FileId").value == null)
      this.organizationForm.get("FileId").setValue(0);
    if (this.organizationForm.get("AdminId").value == null)
      this.organizationForm.get("AdminId").setValue(0);

    let organizationDetail = this.organizationForm.value;

    if (organizationDetail.Pincode === null || organizationDetail.Pincode == "")
      organizationDetail.Pincode = 0;

    organizationDetail.IsActive = true;

    if (errroCounter === 0) {
      let request = this.organizationForm.value;
      request.LegalEntity = this.singleOrganization.LegalEntity;
      request.LegalNameOfCompany =  this.singleOrganization.LegalNameOfCompany;
      request.TypeOfBusiness = this.singleOrganization.TypeOfBusiness;
      request.InCorporationDateb = this.singleOrganization.InCorporationDateb;
      request.FullAddress =this.singleOrganization.FullAddress;
      request.OrganizationName = this.singleOrganization.OrganizationName;
      request.CompanyDetail = this.singleOrganization.CompanyDetail;
      let formData = new FormData()
      formData.append("CompanyInfo", JSON.stringify(request));
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append('CompanyLogo', file)
      this.http.post("Company/UpdateCompanyDetails", formData).then((response: ResponseModel) => {
        if (response.ResponseBody !== null) {
          this.organizationModal = response.ResponseBody as organizationModal;
          this.initForm();
          Toast("Organization detail updated successfully");
        } else {
          ErrorToast("Failed to generated, Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      ErrorToast("All read marked fields are mandatory.");
    }
  }

  replaceWithOriginalValues() {

  }

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  uploadorganizationLogo(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: "CompanyLogo",
        file: file
      });
    }
  }
}

export class organizationModal {
  OrganizationId: number = 0;
  OrganizationName: string = null;
  CompanyId: number  =0;
  CompanyName: string = '';
  MobileNo: string = null;
  PrimaryPhoneNo: string = null;
  SecondaryPhoneNo: string = null;
  Email: string = null;
  Fax: string = null;
  FirstAddress: string = null;
  SecondAddress: string = null;
  ThirdAddress: string = null;
  FourthAddress: string = null;
  Pincode: number = 0;
  City: string = null;
  State: string = null;
  Country: string = null;
  GSTNO: string = null;
  AccountNo: string = null;
  BankName: string = null;
  BranchName: string = null;
  IFSC: string = null;
  PanNo: string = null;
  AdminId: number = 0
  IsActive: boolean = false;
  FileId: number = 0;
  CompanyDetail: string = '';
}
