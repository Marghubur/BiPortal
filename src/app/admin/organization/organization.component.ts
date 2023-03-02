import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationModal } from 'src/app/adminmodal/admin-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { OrgLogo, UserType } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  isUpdating: boolean = false;
  organizationForm: FormGroup = null;
  organization:OrganizationModal = new OrganizationModal();
  profileURL: string = OrgLogo;
  fileDetail: Array<any> = [];
  UserTypeId: UserType= UserType.Client;
  model: NgbDateStruct;
  openingDate: NgbDateStruct;
  closingDate: NgbDateStruct;

  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private ngbCalendar: NgbCalendar,
              private nav: iNavigation) { }

  ngOnDestroy() {
    this.nav.resetValue();
  }

  ngOnInit(): void {
    let data = this.nav.getValue();
    this.organization = new OrganizationModal();
    if(data) {
      if (data.client.length > 0)
        this.organization = data.client[0] as OrganizationModal;
      this.isUpdating = true;
    } else {
      this.organization = new OrganizationModal;
      this.loadData();
    }
  }

  loadData() {
    this.isLoaded = false;
    let date;
    this.http.get(`Company/GetOrganizationDetail`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        if (response.ResponseBody.OrganizationDetail) {
          this.organization = response.ResponseBody.OrganizationDetail as OrganizationModal;
          if (this.organization.InCorporationDate == null || this.organization.InCorporationDate == '0001-01-01T00:00:00')
            date = new Date();
          else
            date = new Date(this.organization.InCorporationDate);
          this.model = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          if (this.organization.OpeningDate != null)
            date = new Date(this.organization.OpeningDate);
          else
            date = new Date();
          this.openingDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          if (this.organization.ClosingDate != null)
            date = new Date(this.organization.ClosingDate);
          else
            date = new Date();
          this.closingDate = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
          this.initForm();
          this.isLoaded = true;
        }
        let profileDetail = response.ResponseBody.Files;
        if(profileDetail.length > 0) {
          let file = profileDetail.find(x => x.FileOwnerId == this.organization.OrganizationId && x.FileName == "OrganizationLogo");
          this.buildProfileImage(file);
        }
      } else {
        this.organization = new OrganizationModal;
        this.initForm();
      }
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  get f() {
    return this.organizationForm.controls;
  }

  initForm() {
    this.organizationForm = this.fb.group({
      CompanyId: new FormControl(this.organization.CompanyId),
      OrganizationId: new FormControl(this.organization.OrganizationId),
      BankAccountId: new FormControl(this.organization.BankAccountId),
      OrganizationName: new FormControl(this.organization.OrganizationName, [Validators.required]),
      CompanyName: new FormControl(this.organization.CompanyName, [Validators.required]),
      CompanyDetail: new FormControl(this.organization.CompanyDetail),
      SectorType: new FormControl(this.organization.SectorType),
      City: new FormControl(this.organization.City),
      State: new FormControl(this.organization.State),
      Country: new FormControl(this.organization.Country),
      FirstAddress: new FormControl(this.organization.FirstAddress),
      SecondAddress: new FormControl(this.organization.SecondAddress),
      ThirdAddress: new FormControl(this.organization.ThirdAddress),
      ForthAddress: new FormControl(this.organization.ForthAddress),
      FullAddress: new FormControl(this.organization.FullAddress),
      MobileNo: new FormControl(this.organization.MobileNo),
      Email: new FormControl(this.organization.Email, [Validators.required]),
      FirstEmail: new FormControl(this.organization.FirstEmail),
      SecondEmail: new FormControl(this.organization.SecondEmail),
      ThirdEmail: new FormControl(this.organization.ThirdEmail),
      ForthEmail: new FormControl(this.organization.ForthEmail),
      PrimaryPhoneNo: new FormControl(this.organization.PrimaryPhoneNo, [Validators.required]),
      SecondaryPhoneNo: new FormControl(this.organization.SecondaryPhoneNo),
      Fax: new FormControl(this.organization.Fax),
      Pincode: new FormControl(this.organization.Pincode),
      FileId: new FormControl(this.organization.FileId),
      PANNo: new FormControl(this.organization.PANNo),
      TradeLicenseNo: new FormControl(this.organization.TradeLicenseNo),
      GSTNo: new FormControl(this.organization.GSTNo),
      AccountNo: new FormControl(this.organization.AccountNo),
      BankName: new FormControl(this.organization.BankName),
      Branch: new FormControl(this.organization.Branch),
      IFSC: new FormControl(this.organization.IFSC),
      LegalDocumentPath: new FormControl(this.organization.LegalDocumentPath),
      LegalEntity: new FormControl(this.organization.LegalEntity),
      LegalNameOfCompany: new FormControl(this.organization.LegalNameOfCompany),
      TypeOfBusiness: new FormControl(this.organization.TypeOfBusiness),
      InCorporationDate: new FormControl(this.organization.InCorporationDate),
      OrgMobileNo: new FormControl(this.organization.OrgMobileNo),
      OrgEmail: new FormControl(this.organization.OrgEmail),
      OrgPrimaryPhoneNo: new FormControl(this.organization.OrgPrimaryPhoneNo),
      OrgSecondaryPhoneNo: new FormControl(this.organization.OrgSecondaryPhoneNo),
      OrgFax: new FormControl(this.organization.OrgFax),
      IsPrimaryCompany: new FormControl(this.organization.IsPrimaryCompany),
      FixedComponentsId: new FormControl(this.organization.FixedComponentsId),
      BranchCode: new FormControl(this.organization.BranchCode),
      OpeningDate: new FormControl(this.organization.OpeningDate),
      ClosingDate: new FormControl(this.organization.ClosingDate),
      ProfileImgPath: new FormControl('')
    })
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.organizationForm.controls["InCorporationDate"].setValue(date);
  }

  onOpeningSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.organizationForm.controls["OpeningDate"].setValue(date);
  }

  onClosingSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.organizationForm.controls["ClosingDate"].setValue(date);
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;

    if (this.organizationForm.get("OrganizationName").value === null)
      errroCounter++;

    if (this.organizationForm.get("CompanyName").value === null)
      errroCounter++;

    if (this.organizationForm.get("PrimaryPhoneNo").value === null)
      errroCounter++;

    if (this.organizationForm.get("Email").value === null)
      errroCounter++;

    if (this.organizationForm.get("FileId").value == null)
      this.organizationForm.get("FileId").setValue(0);

    let clientDetail = this.organizationForm.value;

    if (clientDetail.Pincode === null || clientDetail.Pincode == "")
      clientDetail.Pincode = 0;

    if (errroCounter === 0) {
      let request: OrganizationModal = this.organizationForm.value;
      let formData = new FormData()
      formData.append("OrganizationInfo", JSON.stringify(request));
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append("OrganizationLogo", file)
      this.http.post('Company/InsertUpdateOrganizationDetail', formData).then((response: ResponseModel) => {
        if (response.ResponseBody !== null) {
          this.organization = response.ResponseBody as OrganizationModal;
          this.initForm();

          Toast("Organization Inserted/Updated successfully");
        } else {
          ErrorToast("Failed to Inserted/Updated, Please contact to admin.");
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

  reset() {
    this.submitted = false;
    Toast("Form is reset.");
  }

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  uploadClientLogo(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: "organizationlogo",
        file: file
      });
    }
  }

  buildProfileImage(fileDetail: any) {
    this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}.${fileDetail.FileExtension}`;
    this.organization.FileId = fileDetail.FileId;
  }
}