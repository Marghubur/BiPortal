import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn, UserImage } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';
declare var $: any;


@Component({
  selector: 'app-create-resume',
  templateUrl: './create-resume.component.html',
  styleUrls: ['./create-resume.component.scss']
})
export class CreateResumeComponent implements OnInit {
  resumeForm: FormGroup;
  profileURL: string = UserImage;
  fileDetail: Array<any> = [];
  userDetail: UserDetail = new UserDetail();
  profile: Files = new Files();
  UserId: number = 0;
  UserProfile: UserProfile = null;
  isFormReady: boolean = false;


  constructor(private fb: FormBuilder,
    private http: AjaxService,
    private local: ApplicationStorage,
    private user: UserService) { }

  get f () {
    return this.resumeForm.controls;
  }

  ngOnInit(): void {
    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
    this.userDetail["TokenExpiryDuration"] = new Date();
    else
    this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.loadData();
    } else {
      this.initForm();
      Toast("Invalid user. Please login again.")
    }
  }

  loadData() {
    this.http.get(`user/GetUserDetail/${this.userDetail.UserId}`).then((response: ResponseModel) => {
      if (response.ResponseBody) {
        this.profile = response.ResponseBody.profileDetail;
        this.UserProfile = response.ResponseBody.professionalUser;
        this.profileURL = `${this.http.GetImageBasePath()}${this.profile.FilePath}/${this.profile.FileName}.${this.profile.FileExtension}`;
      } else {
        ErrorToast("Invalid user. Please login again.");
      }
      this.initForm();
      this.isFormReady = true;
    })
  }

  initForm() {
    this.resumeForm = this.fb.group({
      FirstName: new FormControl(this.UserProfile.FirstName, Validators.required),
      LastName: new FormControl(this.UserProfile.LastName, Validators.required),
      Email: new FormControl(this.UserProfile.Email, Validators.required),
      Mobile: new FormControl(this.UserProfile.Mobile, Validators.required),
      UserId: new FormControl(this.UserProfile.UserId),
      ProfileImgPath: new FormControl('')
    })
  }

  fireBrowserFile() {
    $("#uploadocument").click();
  }

  uploadProfilePicture(e: any) {
    if (e.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result
      }
      let selectedFile = e.target.files;
      let file = <File>selectedFile[0];
      this.fileDetail.push({
        name: "profile",
        file: file
      })
    }
  }

  generateResume() {
    this.http.get(`user/GenerateResume/${this.userDetail.UserId}`).then((response: ResponseModel) => {
      if (response.ResponseBody)
        Toast("Resume Generated successfully")
    })
  }

}

class Files {
  LocalImgPath: string = "";
  FileName: string = "";
  UserId: number = 0;
  FileExtension: string = "";
  FilePath: string = "";
  FileUid: number = 0;
  ProfileUid: string = "";
  DocumentId: number = 0;
  FileType: string = "";
  FileSize: number = 0;
}

class UserProfile {
  FirstName: string = '';
  LastName: string = '';
  Email: string = '';
  Mobile: string = '';
  UserId: number = 0;
  FileId: number = 0;
  FileName: string = '';
  FilePath: string = '';
}
