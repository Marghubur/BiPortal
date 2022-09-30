import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { UserImage } from 'src/providers/constants';

@Component({
  selector: 'app-emailsetting',
  templateUrl: './emailsetting.component.html',
  styleUrls: ['./emailsetting.component.scss']
})
export class EmailsettingComponent implements OnInit {
  isLoaded: boolean = false;
  emailSettingForm: FormGroup = null;
  submitted: boolean = false;
  fileDetail: Array<any> = [];
  profileURL: string = UserImage;
  emailSettings: EmailSettings = new EmailSettings();
  currentCompany: any = null;
  companyId: number = 0;
  isLoading: boolean = false;

  constructor(private http: AjaxService,
              private local: ApplicationStorage,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    let data = this.local.findRecord("Companies");
    if (!data) {
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);

      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      } else {
        this.companyId = this.currentCompany.CompanyId;
        this.loadData();
      }
    }
  }

  loadData() {
    this.isLoaded = false;
    this.http.get(`Email/GetEmailSettingByCompId/${this.companyId}`).then(res => {
      if (res.ResponseBody) {
        this.emailSettings = res.ResponseBody;
        this.initForm();
        Toast("Email setting found");
      }
      this.isLoaded = true;
    }).catch(e => {
      this.isLoaded = true;
    })
  }

  initForm() {
    this.emailSettingForm = this.fb.group({
      EmailSettingDetailId: new FormControl(this.emailSettings.EmailSettingDetailId),
      CompanyId: new FormControl(this.emailSettings.CompanyId, [Validators.required]),
      OrganizationName: new FormControl(this.currentCompany.OrganizationName),
      CompanyName: new FormControl(this.currentCompany.CompanyName),
      EmailAddress: new FormControl(this.emailSettings.EmailAddress, [Validators.required]),
      EmailHost: new FormControl(this.emailSettings.EmailHost, [Validators.required]),
      PortNo: new FormControl(this.emailSettings.PortNo,[Validators.required]),
      EnableSsl: new FormControl(this.emailSettings.EnableSsl ? 'true' : 'false', [Validators.required]),
      DeliveryMethod: new FormControl(this.emailSettings.DeliveryMethod ),
      UserDefaultCredentials: new FormControl(this.emailSettings.UserDefaultCredentials ? 'true' : 'false', [Validators.required]),
      Credentials: new FormControl(this.emailSettings.Credentials, [Validators.required]),
      LogoImgPath: new FormControl(this.emailSettings.LogoImgPath),
      FileId: new FormControl(this.emailSettings.FileId),
      EmailName: new FormControl(this.emailSettings.EmailName, [Validators.required]),
      POP3EmailHost: new FormControl(this.emailSettings.POP3EmailHost),
      POP3PortNo: new FormControl(this.emailSettings.POP3PortNo),
      POP3EnableSsl: new FormControl(this.emailSettings.POP3EnableSsl ? 'true' : 'false')
    })
  }

  submitChanges() {
    this.isLoading = true;
    this.submitted = true;
    if (this.emailSettingForm.invalid) {
      ErrorToast("All read marked fields are mandatory.");
      this.isLoading = false;
      return;
    }
    let value = this.emailSettingForm.value;
    if (this.companyId > 0 && value) {
      this.http.post('Email/InsertUpdateEmailSetting', value).then(res => {
        if (res.ResponseBody) {
          Toast("Email setting insert/ updated successfully.");
        }else {
          ErrorToast("Failed to generated, Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
          this.isLoading = false;
      });
    }
  }

  get c() {
    return this.emailSettingForm.controls;
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

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

}

class EmailSettings {
  EmailSettingDetailId: number = 0;
  CompanyId: number = 0;
  OrganizationName: string = null;
  CompanyName: string = null;
  EmailAddress: string = null;
  EmailHost: string = null;
  PortNo: number = null;
  EnableSsl: boolean = null;
  DeliveryMethod: string = null;
  UserDefaultCredentials: boolean = null;
  Credentials: string = null;
  LogoImgPath: string = null;
  FileId: number = 0;
  EmailName: string = null;
  POP3EmailHost: string = null;
  POP3PortNo: number = null;
  POP3EnableSsl: boolean = false;
}
