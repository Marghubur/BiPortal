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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ManageComponent implements OnInit {
  active = 1;
  model: NgbDateStruct;
  submitted: boolean = false;
  userModal: UserModal = null;
  isLoading: boolean = false;
  User: string;
  isLargeFile: boolean = false;
  userDetail: UserDetail = new UserDetail();
  UserId: number = null;
  uploading: boolean = false;
  fileDetail: Array<any> = [];
  FileDocumentList: Files = null;
  ProfileList: Files = null;
  ProfileCollection: any = null;
  FilesCollection: any = null;
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

  manageUserForm: FormGroup;
  educationForm: FormGroup;
  employmentForm: FormGroup;
  skillsForm: FormGroup;
  projectsForm: FormGroup;
  accomplishmentsForm: FormGroup;

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
    this.userModal = new UserModal();

    this.initForm();
    this.buildEmploymentForm();
    this.buildEducationForm();
    this.buildSkillsForm();
    this.buildProjectsForm();
    this.buildAccomplishmentsForm();

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
        this.userModal = res.ResponseBody as UserModal;
        this.UserId = this.userModal.UserId;
      }
      this.initForm();
    });
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.manageUserForm.controls["DOB"].setValue(date);
  }



  //----------------- Projects form, group and add new ------------------------

  buildProjectsForm() {
    this.projectsForm = this.fb.group({
      Projects: this.fb.array([this.projectForm()])
    });
  }

  projectForm() {
    return this.fb.group({
      ProjectTitle: new FormControl(''),
      ProjectTag: new FormControl(''),
      ProjectWorkingYear: new FormControl(''),
      ProjectWorkingMonth: new FormControl(''),
      ProjectWorkedYear: new FormControl(''),
      ProjectWorkedMonth: new FormControl(''),
      IsProjectInProgress: new FormControl(false),
      IsProjectInCompleted: new FormControl(false),
      ClientName: new FormControl(''),
      ProjectDetail: new FormControl('')
    })
  }

  addProject() {
    let projects = this.manageUserForm.controls["Projects"] as FormArray;
    projects.push(this.projectForm());
  }

  get Projects() {
    return this.projectsForm.get('Projects') as FormArray;
  }

  //----------------- Projects END'S ------------------------





  //----------------- technical skills form, group and add new ------------------------

  buildSkillsForm() {
    this.skillsForm = this.fb.group({
      TechnicalSkills: this.fb.array([this.createTechnicalSkillsGroup()])
    })
  }

  createTechnicalSkillsGroup() {
    return this.fb.group({
      ITSkill: new FormControl(''),
      Version: new FormControl(''),
      LastUsed: new FormControl(''),
      ExperienceYear: new FormControl(''),
      ExperienceMonth: new FormControl('')
    })
  }

  addItskill() {
    let skills = this.skillsForm.get("TechnicalSkills") as FormArray;
    skills.push(this.createTechnicalSkillsGroup());
  }

  get skills(): FormArray {
    return this.skillsForm.get("TechnicalSkills") as FormArray;
  }

  //----------------- technical skills END'S ------------------------




  //----------------- technical skills form, group and add new ------------------------

    buildAccomplishmentsForm() {
      this.accomplishmentsForm = this.fb.group({
        OnlineProfiles: this.fb.array([this.buildOnlieProfiles()]),
        WorkSamples: this.fb.array([this.buildWorkSamples()]),
        Researchs: this.fb.array([this.buildResearchs()]),
        Presentations: this.fb.array([this.buildPresentations()]),
        Patents: this.fb.array([this.buildPatents()]),
        Certifications: this.fb.array([this.buildCertifications()])
      })
    }


    buildOnlieProfiles() {
      return this.fb.group({
        OnlineProfileUrl: new FormControl('')
      });
    }

    buildWorkSamples() {
      return this.fb.group({
        WorkSampleUrl: new FormControl('')
      });
    }

    buildResearchs() {
      return this.fb.group({
        ResearchUrl: new FormControl('')
      });
    }

    buildPresentations() {
      return this.fb.group({
        PresentationUrl: new FormControl('')
      });
    }

    buildPatents() {
      return this.fb.group({
        PatentUrl: new FormControl('')
      });
    }

    buildCertifications() {
      return this.fb.group({
        CertificationUrl: new FormControl('')
      });
    }


    addOnlieProfiles() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    addWorkSamples() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    addResearchs() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    addPresentations() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    addPatents() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    addCertifications() {
      let skills = this.accomplishmentsForm.get("TechnicalSkills") as FormArray;
      skills.push(this.createTechnicalSkillsGroup());
    }

    get onlieProfiles(): FormArray {
      return this.accomplishmentsForm.get("OnlineProfiles") as FormArray;
    }

    get workSamples(): FormArray {
      return this.accomplishmentsForm.get("WorkSamples") as FormArray;
    }

    get researchs(): FormArray {
      return this.accomplishmentsForm.get("Researchs") as FormArray;
    }

    get presentations(): FormArray {
      return this.accomplishmentsForm.get("Presentations") as FormArray;
    }

    get patents(): FormArray {
      return this.accomplishmentsForm.get("Patents") as FormArray;
    }

    get certifications(): FormArray {
      return this.accomplishmentsForm.get("Certifications") as FormArray;
    }

  //----------------- technical skills END'S ------------------------




  //----------------- Education form, group and add new ------------------------

  createEducationForm() {
    return this.fb.group({
      Education: new FormControl(''),
      Course: new FormControl(''),
      Specialization: new FormControl(''),
      University: new FormControl(''),
      IsFullTime: new FormControl(false),
      IsPartTime: new FormControl(false),
      IsDistance: new FormControl(false),
      PassingYear: new FormControl(''),
      GradingSystem: new FormControl('')
    })
  }

  buildEducationForm() {
    this.educationForm = this.fb.group({
      Educations: this.fb.array([this.createEducationForm()])
    })
  }

  addEducation() {
    let educations = this.educationForm.get("Educations") as FormArray;
    educations.push(this.createEducationForm());
  }

  //----------------- Education END'S ------------------------



  //----------------- Employment form, group and add new ------------------------

  buildEmploymentForm() {
    this.employmentForm = this.fb.group({
      Designation: new FormControl(''),
      YourOrganization: new FormControl(''),
      CurrentCompany: new FormControl(''),
      WorkingYear: new FormControl(''),
      WorkingMonth: new FormControl(''),
      WorkedYear: new FormControl(''),
      WorkedMonth: new FormControl(''),
      CurrentSalary: new FormControl(''),
      CurrentSalaryLakh: new FormControl(''),
      CurrentSalaryThousand: new FormControl(''),
      Experties: new FormControl(''),
      JobProfile: new FormControl(''),
      NoticePeriod: new FormControl(''),
    })
  }

  //----------------- Employment END'S ------------------------

  initForm() {
    this.manageUserForm = this.fb .group({
      FirstName: new FormControl(this.userModal.FirstName),
      LastName: new FormControl (this.userModal.LastName),
      Email: new FormControl(this.userModal.Email),
      Mobile: new FormControl(this.userModal.Mobile),
      KeySkill: new FormControl(''),

      ProfileSummary: new FormControl(''),
      Educations: this.fb.array([])
    })
  }

  // languageField() {
  //   return this.fb.group({
  //     Language: new FormControl (''),
  //     LanguageRead: new FormControl (''),
  //     LanguageWrite: new FormControl (''),
  //     ProficiencyLanguage: new FormControl(''),
  //     LanguageSpeak: new FormControl(''),
  //     ResumeHeadline: new FormControl('')
  //   })
  // }

  // addLanguageForm() {
  //   this.languageformArry.push(this.languageField());
  // }


  get educations(): FormArray {
    return this.manageUserForm.get("Educations") as FormArray;
  }

  get f() {
    let data = this.manageUserForm.controls;
    return data;
  }

  maritalStatusSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('MaritalStatus').setValue(value);
  }

  categorySelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('Category').setValue(value);
  }

  workPermitSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('PermitUSA').setValue(value);
  }

  proficiencySelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('ProficiencyLanguage').setValue(value);
  }

  gradingSystemSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('GradingSystem').setValue(value);
  }

  noticePeriodSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('NoticePeriod').setValue(value);
  }

  submitManageUserForm() {
    this.userModal = this.manageUserForm.value;
    // this.http.post("user/ManageUserDetail", this.userModal)
    // .then ((response: ResponseModel) => {
    //   Toast("Submitted successfully")
    // })
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
      this.ProfileList = item;
      this.ProfileCollection = file;
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
      this.FileDocumentList = item;
      this.FilesCollection = file;
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
    if (this.FileDocumentList != null && this.UserId > 0) {
      formData.append(this.FileDocumentList.FileName, this.FilesCollection);
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

class UserModal {
  FirstName: string = '';
  LastName: string = '';
  Mobile: string = '';
  Email: string = '';
  ProfileImg: string = '';
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
  ITSkill: string = '';
  Version: number = 0;
  LastUsed: string= '';
  ExperienceYear: number = 0;
  ExperienceMonth: number = 0;
  KeySkill: string = ''
  Education: string = '';
  Course: string = '';
  Specialization: string = '';
  University: string = '';
  CourseType: string = '';
  PassingYear: number = 0;
  GradingSystem: string = ''
  ProjectTitle: string = ';'
  ProjectTag: string = '';
  ProjectWorkingYear: number = 0;
  ProjectWorkingMonth: number = 0;
  ProjectWorkedYear: number = 0;
  ProjectStatus: string = '';
  ClientName: string = '';
  ProjectDetail: string = '';
  CurrentIndustry: string = '';
  Department: string = '';
  RoleCategory: string = '';
  JobRole: string = '';
  DesiredJob: string = '';
  EmploymentType: string = '';
  PreferredShift: string = '';
  PreferredWorkLocation: string = '';
  ExpectedSalary: string = '';
  ExpectedSalaryLakh: number = 0;
  ExpectedSalaryThousand: number = 0;
  ProfileSummary: string = '';
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
  OnlineProfile: string = '';
  WorkSample: string = '';
  Research: string = '';
  Presentation: string = '';
  Patent: string = '';
  Certification: string = '';
  UserId: number = 0;
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
