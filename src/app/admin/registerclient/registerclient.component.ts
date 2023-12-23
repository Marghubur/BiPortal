import { Component, OnDestroy, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService, ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { ResponseModel } from 'src/auth/jwtService';
import { Clients, OrgLogo, ProfileImage, RegisterClient, UserType } from 'src/providers/constants';
import { autoCompleteModal } from 'src/app/util/iautocomplete/iautocomplete.component';
import { clientModal } from 'src/app/adminmodal/admin-modals';
declare var $: any;

@Component({
  selector: 'app-registerclient',
  templateUrl: './registerclient.component.html',
  styleUrls: ['./registerclient.component.scss']
})
export class RegisterclientComponent implements OnInit, OnDestroy {
  submitted: boolean = false;
  clientForm: FormGroup = null;
  clientModal: clientModal = null;
  isLoading: boolean = false;
  isUpdating: boolean = false;
  isLoaded: boolean = false;
  profileURL: string = OrgLogo;
  fileDetail: Array<any> = [];
  UserTypeId: UserType= UserType.Client;
  imageIndex: number = 0;
  shifts: Array<any> = [];
  shiftDetail: autoCompleteModal = null;


  constructor(private http: AjaxService,
              private fb: FormBuilder,
              private nav: iNavigation
  ) { }

  ngOnDestroy() {
    this.nav.resetValue();
  }

  ngOnInit(): void {
    this.shiftDetail = new autoCompleteModal();
    this.shiftDetail.data = [];
    this.shiftDetail.placeholder = "Work Shift";
    this.shiftDetail.className = "disable-field";

    let data = this.nav.getValue();
    this.clientModal = new clientModal();
    if(data) {
      if (data.client.length > 0)
        this.clientModal = data.client[0] as clientModal;

      this.clientModal.IsActive = true;
      this.isUpdating = true;
      this.loadData();
    } else {
      this.clientModal = new clientModal;
      this.loadData();
      this.isLoaded = true;
    }
  }

  buildProfileImage(fileDetail: any) {
    if (fileDetail.FileName.includes(".")) {
      this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}`;
      this.clientModal.OldFileName = `${fileDetail.FileName}`;
    } else {
      this.profileURL = `${this.http.GetImageBasePath()}${fileDetail.FilePath}/${fileDetail.FileName}.${fileDetail.FileExtension}`;
      this.clientModal.OldFileName = `${fileDetail.FileName}.${fileDetail.FileExtension}`;
    }
      this.clientModal.FileId = fileDetail.FileId;
  }

  loadData() {
    this.isLoaded = false;
    this.http.get(`clients/GetClientById/${this.clientModal.ClientId}/${this.clientModal.IsActive}/${this.UserTypeId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        if (response.ResponseBody.client.length > 0)
          this.clientModal = response.ResponseBody.client[0] as clientModal;
        else
          this.clientModal = new clientModal;

        this.shifts = response.ResponseBody.shifts;
        if (this.shifts && this.shifts.length > 0) {
          this.shifts.map(x => {
            this.shiftDetail.data.push({
              value: x.WorkShiftId,
              text: x.ShiftTitle
            });
          });
          this.shiftDetail.className="";
        } else {
          this.shiftDetail.data.push({
            value: 0,
            text: "Regular shift"
          });
        }

        if(response.ResponseBody.file.length > 0) {
          let profileDetail = response.ResponseBody.file;
          this.buildProfileImage(profileDetail[0]);
        }
      } else {
        this.clientModal = new clientModal;
      }

      this.initForm();
      this.isLoaded = true;
    }).catch(e => {
      this.isLoaded = true;
    });
  }

  get f() {
    let data = this.clientForm.controls;
    return data;
  }

  initForm() {
    this.clientForm = this.fb.group({
      ClientId: new FormControl(this.clientModal.ClientId),
      ClientName: new FormControl(this.clientModal.ClientName, [Validators.required]),
      MobileNo: new FormControl(this.clientModal.MobileNo),
      PrimaryPhoneNo: new FormControl(this.clientModal.PrimaryPhoneNo, [Validators.required]),
      SecondaryPhoneNo: new FormControl(this.clientModal.SecondaryPhoneNo),
      Email: new FormControl(this.clientModal.Email, [Validators.required, Validators.email]),
      OtherEmail_1: new FormControl(this.clientModal.OtherEmail_1),
      OtherEmail_2: new FormControl(this.clientModal.OtherEmail_2),
      OtherEmail_3: new FormControl(this.clientModal.OtherEmail_3),
      OtherEmail_4: new FormControl(this.clientModal.OtherEmail_4),
      Fax: new FormControl(this.clientModal.Fax),
      FirstAddress: new FormControl(this.clientModal.FirstAddress, [Validators.required]),
      SecondAddress: new FormControl(this.clientModal.SecondAddress, [Validators.required]),
      ThirdAddress: new FormControl(this.clientModal.ThirdAddress),
      ForthAddress: new FormControl(this.clientModal.ForthAddress),
      Pincode: new FormControl(this.clientModal.Pincode === 0 ? null : this.clientModal.Pincode, [Validators.required]),
      City: new FormControl(this.clientModal.City, [Validators.required]),
      State: new FormControl(this.clientModal.State, [Validators.required]),
      Country: new FormControl(this.clientModal.Country, [Validators.required]),
      GSTNO: new FormControl(this.clientModal.GSTNO, [Validators.required]),
      AccountNo: new FormControl(this.clientModal.AccountNo),
      BankName: new FormControl(this.clientModal.BankName),
      BranchName: new FormControl(this.clientModal.BranchName),
      IFSC: new FormControl(this.clientModal.IFSC),
      PanNo: new FormControl(this.clientModal.PanNo),
      AdminId: new FormControl(this.clientModal.AdminId),
      FileId: new FormControl(this.clientModal.FileId),
      ProfileImgPath: new FormControl(''),
      OldFileName: new FormControl(this.clientModal.OldFileName),
      WorkShiftId: new FormControl(this.clientModal.WorkShiftId, [Validators.required])
    });
  }

  reset() {
    this.submitted = false;
    this.clientModal = new clientModal();
    this.initForm();
    WarningToast("Form is reset.");
  }

  generate() {
    this.submitted = true;
    this.isLoading = true;
    let errroCounter = 0;

    if (this.clientForm.get("ClientName").value === "" || this.clientForm.get("ClientName").errors !== null)
      errroCounter++;

    if (this.clientForm.get("PrimaryPhoneNo").value === "" || this.clientForm.get("PrimaryPhoneNo").errors !== null)
      errroCounter++;

    if (this.clientForm.get("Email").value === "" || this.clientForm.get("Email").errors !== null)
      errroCounter++;

    if (this.clientForm.get("Country").value === "" || this.clientForm.get("Country").errors !== null)
      errroCounter++;

    if (this.clientForm.get("State").value === "" || this.clientForm.get("State").errors !== null)
      errroCounter++;

    if (this.clientForm.get("City").value === "" || this.clientForm.get("City").errors !== null)
      errroCounter++;

    if (this.clientForm.get("FirstAddress").value === "" || this.clientForm.get("FirstAddress").errors !== null)
      errroCounter++;

    if (this.clientForm.get("SecondAddress").value === "" || this.clientForm.get("SecondAddress").errors !== null)
      errroCounter++;

    if (this.clientForm.get("GSTNO").value === "" || this.clientForm.get("GSTNO").errors !== null)
      errroCounter++;

    if (this.clientForm.get("Pincode").value === 0 || this.clientForm.get("Pincode").errors !== null)
      errroCounter++;

    if (this.clientForm.get("WorkShiftId").value === 0 || this.clientForm.get("WorkShiftId").errors !== null)
      errroCounter++;

    if (this.clientForm.get("FileId").value == null)
      this.clientForm.get("FileId").setValue(0);

    if (this.clientForm.get("AdminId").value == null)
      this.clientForm.get("AdminId").setValue(0);

    let clientDetail = this.clientForm.value;

    if (clientDetail.Pincode === null || clientDetail.Pincode == "")
      clientDetail.Pincode = 0;

    clientDetail.IsActive = true;
    let email = this.clientForm.get('Email').value;
    if (!this.emailValidation(email, "Email"))
      return;

    if (this.clientForm.get('OtherEmail_1').value && this.clientForm.get('OtherEmail_1').value != "") {
      email = this.clientForm.get('OtherEmail_1').value;
      if (!this.emailValidation(email, "OtherEmail_1"))
        return;
    }

    if (this.clientForm.get('OtherEmail_2').value && this.clientForm.get('OtherEmail_2').value != "") {
      email = this.clientForm.get('OtherEmail_2').value;
      if (!this.emailValidation(email, "OtherEmail_2"))
        return;
    }

    if (this.clientForm.get('OtherEmail_3').value && this.clientForm.get('OtherEmail_3').value != "") {
      email = this.clientForm.get('OtherEmail_3').value;
      if (!this.emailValidation(email, "OtherEmail_3"))
        return;
    }

    if (this.clientForm.get('OtherEmail_4').value && this.clientForm.get('OtherEmail_4').value != "") {
      email = this.clientForm.get('OtherEmail_4').value;
      if (!this.emailValidation(email, "OtherEmail_4"))
        return;
    }

    if (errroCounter === 0) {
      let request: clientModal = this.clientForm.value;
      let formData = new FormData()
      formData.append("clientDetail", JSON.stringify(request));
      let file = null;
      if(this.fileDetail.length > 0)
        file = this.fileDetail[0].file;
      formData.append(`${ProfileImage}_${this.imageIndex}`, file)
      this.http.post(`Clients/RegisterClient/${this.isUpdating}`, formData).then((response: ResponseModel) => {
        if (response.ResponseBody !== null) {
          this.clientModal = response.ResponseBody;
          this.clientModal.GSTNO = response.ResponseBody.GSTNo;
          this.initForm();
          Toast("Client Inserted/Updated successfully");
           $('#messageModal').modal('show');
           this.isLoading = false;
        } else {
          ErrorToast("Failed to generated, Please contact to admin.");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
      ErrorToast("All fields marked * are mandatory.");
    }
  }

  emailValidation(email: string, filedname: string) {
    let flag = false;
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!regex.test(email)){
      this.isLoading = false;
      ErrorToast(`Invalid ${filedname} address!`)
      return flag;
    }
    return flag = true;
  }

  replaceWithOriginalValues() {

  }

  fireBrowserFile() {
    $("#uploadocument").click();
  }

  gotoClientPage() {
    $('#messageModal').modal('hide');
    this.nav.navigate(Clients, null)
  }

  uploadClientLogo(event: any) {
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
      this.imageIndex = new Date().getTime();
      this.fileDetail.push({
        name: $`profile_${this.imageIndex}`,
        file: file
      });
    }
  }

  resizeImage(file: File) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.src = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = img.width * 0.5;
      canvas.height = img.height * 0.5;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        this.fileDetail.push({
          name: $`profile_${this.imageIndex}`,
          file: blob
        });
      });
    };
  }
}
