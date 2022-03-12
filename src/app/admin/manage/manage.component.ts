import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  model: NgbDateStruct;
  submitted: boolean = false;
  userModal: UserDetail = null;
  itskillModal: ItSkillModal = null
  isLoading: boolean = false;
  User: string;
  isLargeFile: boolean = false;
  userDetail: UserDetail = new UserDetail();
  UserId: number = null;
  uploading: boolean = false;
  fileDetail: Array<any> = [];
  FileDocuments: Array<any> = [];
  FileDocumentList: Array<Files> = [];
  ProfileList: Array<Files> = [];
  ProfileCollection: Array<any> = [];
  FilesCollection: Array<any> = [];
  section: any = {
    isResumeHeadlineEdit: false,
    isKeySkillEdit: false,
    isEmploymentEdit: false,
    isEducationEdit: false,
    isItSkillEdit: false,
    isProjectsEdit: false,
    isProfileSummaryEdit: false,
    isCarrerProfileEdit: false,
    isPersonalDetailEdit: false,
    isOnlineProfileEdit: false,
    isResaerchEdit: false,
    isPatentEdit: false,
    isWorkSampleEdit: false,
    isPresentationEdit: false,
    isCertificationEdit: false,
    isProfileEdit: false
  };
  isKeySkillSubmit: boolean = false;
  isEmployeeSubmit: boolean = false;
  isEducationSubmit: boolean = false;
  isITSkillSubmit: boolean = false;
  isProjectSubmit: boolean = false;
  isCarrerProfileSubmit: boolean = false;
  isPersonalDetailSubmit: boolean = false;
  isProfileSubmit: boolean = false;
  isAcomplishmentSubmit: boolean = false;

  profileURL: string = "assets/images/faces/face1.jpg";

  manageUserForm: FormGroup = null;

  @Output() authentication = new EventEmitter();

    constructor(private http: AjaxService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private local: ApplicationStorage,
    private user: UserService
  ) { }

  setSections() {
    this.section = {
      isResumeHeadlineEdit: false,
      isKeySkillEdit: false,
      isEmploymentEdit: false,
      isEducationEdit: false,
      isItSkillEdit: false,
      isProjectsEdit: false,
      isProfileSummaryEdit: false,
      isCarrerProfileEdit: false,
      isPersonalDetailEdit: false,
      isProfileEdit: false,
      isOnlineProfileEdit: false,
      isResaerchEdit: false,
      isPatentEdit: false,
      isWorkSampleEdit: false,
      isPresentationEdit: false,
      isCertificationEdit: false
    }
  }

  ngOnInit(): void {
    this.setSections();
    this.model = this.calendar.getToday();
    this.userModal = new UserDetail();
    this.initForm();

    let expiredOn = this.local.getByKey(AccessTokenExpiredOn);
    this.userDetail = this.user.getInstance() as UserDetail;
    if(expiredOn === null || expiredOn === "")
    this.userDetail["TokenExpiryDuration"] = new Date();
    else
    this.userDetail["TokenExpiryDuration"] = new Date(expiredOn);
    let Master = this.local.get(null);
    if(Master !== null && Master !== "") {
      this.userDetail = Master["UserDetail"];
      this.loadData(this.userDetail)
    }
  }

  loadData(user: any) {
    this.http.post(`Login/GetUserDetail`, { MobileNo: user.Mobile, Email: user.EmailId }).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.userModal = res.ResponseBody as UserDetail;
        this.UserId = this.userModal.UserId;
      }
      this.bindForm();
    });
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.manageUserForm.controls["DOB"].setValue(date);
  }

  bindForm() {
    this.manageUserForm = this.fb.group({
      FirstName: new FormControl(this.userModal.FirstName),
      LastName: new FormControl(this.userModal.LastName),
      Mobile: new FormControl(this.userModal.Mobile),
      Email: new FormControl(this.userModal.EmailId),
      UserId: new FormControl(this.userModal.UserId),
      ProfileImg: new FormControl ( '')

    });
  }

  initForm() {
    this.manageUserForm = this.fb .group({
      KeySkill: new FormControl(''),
      Designation: new FormControl(''),
      YourOrganization: new FormControl(''),
      CurrentCompany: new FormControl(''),
      WorkingYear: new FormControl(''),
      WorkingMonth: new FormControl(''),
      WorkedYear: new FormControl(''),
      CurrentSalary: new FormControl(''),
      CurrentSalaryLakh: new FormControl(''),
      Experties: new FormControl(''),
      JobProfile: new FormControl(''),
      NoticePeriod: new FormControl(''),
      CurrentSalaryThousand: new FormControl(''),
      ITSkill: new FormControl(''),
      Version: new FormControl(''),
      LastUsed: new FormControl(''),
      ExperienceYear: new FormControl(''),
      ExperienceMonth: new FormControl(''),
      Education: new FormControl(''),
      Course: new FormControl(''),
      Specialization: new FormControl(''),
      University: new FormControl(''),
      CourseType: new FormControl(''),
      PassingYear: new FormControl(''),
      GradingSystem: new FormControl(''),
      ProjectTitle: new FormControl(''),
      ProjectTag: new FormControl(''),
      ProjectWorkingYear: new FormControl(''),
      ProjectWorkingMonth: new FormControl(''),
      ProjectWorkedYear: new FormControl(''),
      ProjectStatus: new FormControl(''),
      ClientName: new FormControl(''),
      ProjectDetail: new FormControl(''),
      CurrentIndustry: new FormControl(''),
      Department: new FormControl(''),
      RoleCategory: new FormControl(''),
      JobRole: new FormControl(''),
      DesiredJob: new FormControl(''),
      EmploymentType: new FormControl(''),
      PreferredShift: new FormControl(''),
      PreferredWorkLocation: new FormControl(''),
      ExpectedSalary: new FormControl(''),
      ExpectedSalaryLakh: new FormControl(''),
      ExpectedSalaryThousand: new FormControl(''),
      FirstName: new FormControl(''),
      LastName: new FormControl (''),
      Email: new FormControl(''),
      Mobile: new FormControl(''),
      ProfileImg: new FormControl ( ''),
      DOB: new FormControl(''),
      Gender: new FormControl(''),
      Address: new FormControl(''),
      HomeTown: new FormControl(''),
      PinCode: new FormControl(''),
      MaritalStatus: new FormControl(''),
      Category: new FormControl(''),
      DifferentlyAbled: new FormControl(''),
      PermitUSA: new FormControl(''),
      PermitOtherCountry: new FormControl(''),
      LanguageRow : this.fb.array([this.languageField()]),
      OnlineProfile: new FormControl (''),
      WorkSample: new FormControl (''),
      Research: new FormControl (''),
      Presentation: new FormControl (''),
      Patent: new FormControl (''),
      Certification: new FormControl (''),
      ProfileSummary: new FormControl('')
    })
  }


  languageField() {
    return this.fb.group({
      Language: new FormControl (''),
      LanguageRead: new FormControl (''),
      LanguageWrite: new FormControl (''),
      ProficiencyLanguage: new FormControl(''),
      LanguageSpeak: new FormControl(''),
      ResumeHeadline: new FormControl('')
    })
  }

  addLanguageForm() {
      this.formArry.push(this.languageField());
  }

  get formArry() {
    return (<FormArray>this.manageUserForm.get('LanguageRow')).controls;
  }

  get f() {
    let data = this.manageUserForm.controls;
    return data;
  }



  maritalStatusSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('MaritalStatus').setValue(value);
  }

  personalDetailsFormSubmit() {
    this.isPersonalDetailSubmit = true;

  }

  resumeHeadlineFormSubmit() {
  }

  keySkillFormSubmit() {
    this.isKeySkillSubmit = true;

  }

  employmentFormSubmit() {
    this.isEmployeeSubmit = true;

  }

  educationFormSubmit() {
    this.isEducationSubmit = true;

  }

  itSkillFormSubmit() {
    this.isITSkillSubmit = true;
      // if (errroCounter == 0) {
      //   this.http.post("user/ItSkill", this.itskillModal)
      //   .then((response: ResponseModel) => {
      //     if (response.ResponseBody !== null && response.ResponseBody !== "expired") {
      //       Toast(response.ResponseBody);
      //     } else {
      //       if (response.ResponseBody !== "expired") {
      //         Toast("Your session got expired. Log in again.");
      //       }
      //     }

      //     this.isLoading = false;
      //   }).catch(e => {
      //     this.isLoading = false;
      //     Toast("Registration fail. Please contact admin.")
      //   });
      // } else {
      //   this.isLoading = false;
      //   Toast("Please correct all the mandaroty field marded red");
      // }
  }



  UpdateUser() {
    this.isLoading = true;
    this.submitted = true;
    let errroCounter = 0;

    if (this.manageUserForm.get('FirstName').errors !== null)
      errroCounter++;
    if (this.manageUserForm.get('Email').errors !== null)
      errroCounter++;
    if (this.manageUserForm.get('Mobile').errors !== null)
      errroCounter++;

    this.userModal = this.manageUserForm.value;
    // if (errroCounter == 0) {
    //   this.http.post("user/UpdateUser", this.userModal)
    //   .then((response: ResponseModel) => {
    //     if (response.ResponseBody !== null && response.ResponseBody !== "expired") {
    //       Toast(response.ResponseBody);
    //     } else {
    //       if (response.ResponseBody !== "expired") {
    //         Toast("Your session got expired. Log in again.");
    //       }
    //     }

    //     this.isLoading = false;
    //   }).catch(e => {
    //     this.isLoading = false;
    //     Toast("Registration fail. Please contact admin.")
    //   });
    // } else {
    //   this.isLoading = false;
    //   Toast("Please correct all the mandaroty field marded red");
    // }
    Toast("Update Successfully.")
  }

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  fireresumeBrowserFile() {
    this.submitted = true;
    $("#uploadresume").click();
  }

  uploadProfilePicture(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.profileURL = event.target.result;
      }
      this.manageUserForm.patchValue({
        ProfileImg: event.target.result,
      });
      let selectedfile = event.target.files;
      this.fileDetail = selectedfile[0];
      let file = null;
      file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = file.name;
      item.FileType = file.type;
      item.FileSize = file.size;
      item.FileExtension = file.type;
      item.UserId = this.UserId;
      this.ProfileList.push(item);
      this.ProfileCollection.push(file);
    }
  }

  GetDocumentFile(fileInput: any) {
    let selectedfile = fileInput.target.files;
    if (selectedfile.length > 0) {
      this.fileDetail = selectedfile[0];
      let file = null;
      file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = file.name;
      item.FileType = file.type;
      item.FileSize = file.size;
      item.FileExtension = file.type;
      item.UserId = this.UserId;
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
      let fileSize = selectedfile[0].size/1024;
      if ( fileSize > 100) {
        this.isLargeFile = true;
      }
      this.uploading = true;
    } else {
      ErrorToast("You are not slected the file")
    }
  }

  uploadResumeFile() {
    let formData = new FormData();
    if (this.FileDocumentList.length > 0 && this.UserId > 0) {
      formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
      formData.append('fileDetail', JSON.stringify(this.FileDocumentList));
      this.http.upload('User/UploadResume', formData)
      .then(response => {
        if (response.ResponseBody) {
          Toast("Resume Uploaded Successfully")
        }
      })
    }
  }

  editEmployment() {
    this.section.isEmploymentEdit = !this.section.isEmploymentEdit;
  }

  editResumeHeadline() {
    this.section.isResumeHeadlineEdit = !this.section.isResumeHeadlineEdit;
  }

  editKeySkill() {
    this.section.isKeySkillEdit = !this.section.isKeySkillEdit;
  }

  editEducation() {
    this.section.isEducationEdit = !this.section.isEducationEdit;
  }

  editItSkill() {
    this.section.isItSkillEdit = !this.section.isItSkillEdit;
  }

  editProject() {
    this.section.isProjectsEdit = !this.section.isProjectsEdit;
  }

  editProfileSummary() {
    this.section.isProfileSummaryEdit = !this.section.isProfileSummaryEdit;
  }

  editCarrerProfile() {
    this.section.isCarrerProfileEdit = !this.section.isCarrerProfileEdit;
  }

  editPersonalDetail() {
    this.section.ispersonalDetailsEdit = !this.section.ispersonalDetailsEdit;
  }

  editOnlineProfile() {
    this.section.isOnlineProfileEdit = !this.section.isOnlineProfileEdit;
  }

  editResaerchEdit() {
    this.section.isResaerchEdit = !this.section.isResaerchEdit;
  }

  editPatentEdit() {
    this.section.isPatentEdit = !this.section.isPatentEdit;
  }

  editWorkSampleEdit() {
    this.section.isWorkSampleEdit = !this.section.isWorkSampleEdit;
  }

  editPresentationEdit() {
    this.section.isPresentationEdit = !this.section.isPresentationEdit;
  }

  editCertificationEdit() {
    this.section.isCertificationEdit = !this.section.isCertificationEdit;
  }

  editProfile() {
    this.section.isProfileEdit = !this.section.isProfileEdit;
  }

  cleanFileHandler() {
    // this.btnDisable = true;
    // this.fileAvailable = false;
    this.uploading = false;
    $("#uploadocument").val("");
    this.isLargeFile = false;
    // this.FilesCollection = [];
  }

  reset() {
    this.manageUserForm.reset();
  }
}

class UserPersonalDetail {
  FirstName: string = '';
  LastName: string = '';
  Mobile: number = 0;
  Email: string = '';
  ProfileImg: string = '';
}

class EmploymentDetail {
  Designation: string = '';
  YourOrganization: string = '';
  CurrentCompany: string = '';
  WorkingYear: number = 0;
  WorkingMonth: number = 0;
  WorkedYear: number = 0;
  CurrentSalary: string= '';
  CurrentSalaryLakh: number = 0;
  Experties: number = 0;
  JobProfile: string = '';
  NoticePeriod: string = '';
  CurrentSalaryThousand: number = 0;
}
class ItSkillModal {
  ITSkill: string = '';
  Version: number = 0;
  LastUsed: string= '';
  ExperienceYear: number = 0;
  ExperienceMonth: number = 0;
}

class Files {
  LocalImgPath: string = "";
  UserId: number = 0;
  FileName: string = "";
  FileExtension: string = "";
  FilePath: string = "";
  FileUid: number = 0;
  ProfileUid: string = "";
  DocumentId: number = 0;
  FileType: string = "";
  FileSize: number = 0;
}

class KeySkill {
    KeySkill: string = ''
}

class Education {
    Education: string = '';
    Course: string = '';
    Specialization: string = '';
    University: string = '';
    CourseType: string = '';
    PassingYear: number = 0;
    GradingSystem: string = ''
}

class Project {
    ProjectTitle: string = ';'
    ProjectTag: string = '';
    ProjectWorkingYear: number = 0;
    ProjectWorkingMonth: number = 0;
    ProjectWorkedYear: number = 0;
    ProjectStatus: string = '';
    ClientName: string = '';
    ProjectDetail: string = '';
}

class CarrerProfile {
    CurrentIndustry: string = '';
    Department: string = '';
    RoleCategory: string = '';
    JobRole: string = '';
    DesiredJob: string = '';
    EmploymentType: string = '';
    PreferredShift: string = '';
    PreferredWorkLocation: string = '';
    ExpectedSalary: number = 0;
    ExpectedSalaryLakh: number = 0;
    ExpectedSalaryThousand: number = 0;
}

class ProfileSummary {
    ProfileSummary: string = '';
}

class ManageUser {
    FirstName:string = '';
    LastName: string = '';
    Email: string = '';
    Mobile: string = '';
    ProfileImg: string = '';
}

class Personal {
    DOB: string = '';
    Gender: string = '';
    Address: string = '';
    HomeTown: string ='';
    PinCode: number = 0;
    MaritalStatus: string = '';
    Category: string = '';
    DifferentlyAbled: string = '';
    PermitUSA: string = '';
    PermitOtherCountry: string = '';
    Language: string = '';
    LanguageRead: string = '';
    LanguageWrite: string = '';
    ProficiencyLanguage: string = '';
    LanguageSpeak: string = '';
}

class Accomplishment {
    OnlineProfile: string = '';
    WorkSample: string = '';
    Research: string = '';
    Presentation: string = '';
    Patent: string = '';
    Certification: string = '';
}
