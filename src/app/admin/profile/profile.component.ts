import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';
import { ProfessionalUserDetail } from '../resume/resume.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ManageComponent implements OnInit {
  active = 1;
  model: NgbDateStruct;
  submitted: boolean = false;
  userModal: ProfessionalUserDetail = null;
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
  profile: Files = new Files();
  isFormReady: boolean = false;
  iTSkills: Array<Skills> = [];

  section: any = {
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
  carrerProfileForm: FormGroup;
  personalDetailForm: FormGroup;

  @Output() authentication = new EventEmitter();

    constructor(private http: AjaxService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private local: ApplicationStorage,
    private user: UserService
  ) { }

  setSections() {
    this.section = {
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
    this.userModal = new ProfessionalUserDetail();

    this.buildProjectsForm();
    this.buildAccomplishmentsForm();
    this.buildCarrerProfileForm();
    this.buildPersonalDetailForm();

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
    } else {
      this.initForm();
    }
  }

  loadData(user: any) {
    this.http.get(`user/GetUserDetail/${this.userDetail.UserId}`).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        let detail = res.ResponseBody.Table[0];
        this.userModal = detail;
        this.profile = res.ResponseBody.Table1[0];
        this.profileURL = `${this.http.GetImageBasePath()}${this.profile.FilePath}/${this.profile.FileName}.${this.profile.FileExtension}`;
        let names = detail.Name.split(" ");
        this.userModal.FirstName = names[0];
        this.userModal.LastName = names.splice(1, 1).join(" ");
        this.UserId = this.userModal.UserId;
      } else {
        ErrorToast("Invalid user. Please login again.");
      }
      this.initForm();
      this.buildEmploymentForm();
      this.buildEducationForm();
      this.buildSkills();
      this.buildSkillsForm();
      this.isFormReady = true;
    });
  }

  buildSkills() {
    let skillSet = [];
    if(this.userModal.Key_Skills) {
      skillSet = this.userModal.Key_Skills.split(",");
    }

    if(skillSet.length > 0) {
      let i = 0;
      while(i < skillSet.length) {
        this.iTSkills.push({
         Language: skillSet[i],
         LastUsed: null,
         ExperienceMonth: 0,
         Version: null,
         ExperienceYear: 0  
        });
        i++;
      }
    }
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.personalDetailForm.controls["DOB"].setValue(date);
  }


  //----------------- Personal Detail form, group and add new ------------------------

  buildPersonalDetailForm() {
    this.personalDetailForm = this.fb.group({
      DOB: new FormControl(''),
      Male: new FormControl(''),
      Female: new FormControl(''),
      Address: new FormControl(''),
      HomeTown: new FormControl(''),
      PinCode: new FormControl(''),
      MaritalStatus: new FormControl(''),
      Category: new FormControl(false),
      DifferentlyAbled: new FormControl(false),
      PermitUSA: new FormControl(''),
      PermitOtherCountry: new FormControl(''),
      Languages: this.fb.array([this.buildLanguages()]),
    })
  }

  buildLanguages() {
    return this.fb.group({
      Language: new FormControl(''),
      CanLanguageRead: new FormControl(''),
      CanLanguageWrite: new FormControl(''),
      ProficiencyLanguage: new FormControl(''),
      CanLanguageSpeak: new FormControl('')
    });
  }

  addLanguages() {
    this.langauge.push(this.buildLanguages());
  }

  get langauge() {
    return this.personalDetailForm.get('Languages') as FormArray;
  }

  //----------------- Personal Detail END'S ------------------------




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
      ProjectDetails: new FormControl('')
    })
  }

  addProject() {
    this.projects.push(this.projectForm());
  }

  get projects() {
    return this.projectsForm.get('Projects') as FormArray;
  }

  //----------------- Projects END'S ------------------------





  //----------------- technical skills form, group and add new ------------------------

  buildSkillsForm() {
    this.skillsForm = this.fb.group({
      TechnicalSkills: this.fb.array(this.iTSkills.map(item => this.createTechnicalSkillsGroup(item)))
    })
  }

  createTechnicalSkillsGroup(skill: Skills) {
    return this.fb.group({
      ITSkill: new FormControl(skill.Language),
      Version: new FormControl(skill.Version),
      LastUsed: new FormControl(skill.LastUsed),
      ExperienceYear: new FormControl(skill.ExperienceYear),
      ExperienceMonth: new FormControl(skill.ExperienceMonth)
    })
  }

  addItskill() {
    let NewSkill = new Skills(); 
    let skills = this.skillsForm.get("TechnicalSkills") as FormArray;
    skills.push(this.createTechnicalSkillsGroup(NewSkill));
  }

  get skills(): FormArray {
    return this.skillsForm.get("TechnicalSkills") as FormArray;
  }

  //----------------- technical skills END'S ------------------------




  //----------------- Accomplishments form, group and add new ------------------------

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
      this.onlieProfiles.push(this.buildOnlieProfiles());
    }

    addWorkSamples() {
      this.workSamples.push(this.buildWorkSamples());
    }

    addResearchs() {
      this.researchs.push(this.buildResearchs());
    }

    addPresentations() {
      this.presentations.push(this.buildPresentations());
    }

    addPatents() {
      this.patents.push(this.buildPatents());
    }

    addCertifications() {
      this.certifications.push(this.buildCertifications());
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

  createEducationForm(item: any) {
    return this.fb.group({
      Education: new FormControl(item.Education),
      Course: new FormControl(''),
      Specialization: new FormControl(item.Specialization),
      University: new FormControl(item.University),
      IsFullTime: new FormControl(false),
      IsPartTime: new FormControl(false),
      IsDistance: new FormControl(false),
      PassingYear: new FormControl(item.PassingYear),
      GradingSystem: new FormControl('')
    })
  }

  buildEducationForm() {
    let educationFormData = [];
    educationFormData.push({
      Education: 'Under Graduate',
      Course: '',
      Specialization: this.userModal.UG_Specialization,
      University: this.userModal.UG_University_institute_Name,
      IsFullTime: false,
      IsPartTime: false,
      IsDistance: false,
      PassingYear: this.userModal.UG_Graduation_year,
      GradingSystem: ''
    });

    educationFormData.push({
      Education: 'Post Graduate',
      Course: '',
      Specialization: this.userModal.PG_specialization,
      University: this.userModal.PG_graduation_year,
      IsFullTime: false,
      IsPartTime: false,
      IsDistance: false,
      PassingYear: this.userModal.PG_graduation_year,
      GradingSystem: ''
    });

    this.educationForm = this.fb.group({
      Educations: this.fb.array(educationFormData.map(item => {
        return this.createEducationForm(item)
      }))
    })
  }

  addEducation() {
    let educationFormData = {
      Education: 'Under Graduate',
      Course: '',
      Specialization: '',
      University: '',
      IsFullTime: false,
      IsPartTime: false,
      IsDistance: false,
      PassingYear: '',
      GradingSystem: ''
    };
    this.education.push(this.createEducationForm(educationFormData));
  }

  get education(): FormArray{
    return this.educationForm.get("Educations") as FormArray
  }

  //----------------- Education END'S ------------------------



  //----------------- Employment form, group and add new ------------------------

  buildEmploymentForm() {
    this.employmentForm = this.fb.group({
      Designation: new FormControl(this.userModal.Current_Company_Designation),
      YourOrganization: new FormControl(this.userModal.Current_Company_name),
      NoCurrentCompany: new FormControl(''),
      YesCurrentCompany: new FormControl(''),
      WorkingYear: new FormControl(''),
      WorkingMonth: new FormControl(''),
      WorkedYear: new FormControl(''),
      WorkedMonth: new FormControl(''),
      CurrentSalary: new FormControl(this.userModal.Annual_Salary),
      CurrentSalaryLakh: new FormControl(''),
      CurrentSalaryThousand: new FormControl(''),
      Experties: new FormControl(this.userModal.Key_Skills),
      JobProfile: new FormControl(this.userModal.Job_Title),
      NoticePeriod: new FormControl(this.userModal.Notice_Period),
    })
  }

  //----------------- Employment END'S ------------------------




  //----------------- Carreer Profile form, group and add new ------------------------

  createCarrerProfileForm() {
    return this.fb.group({
      Industry: new FormControl(''),
      Department: new FormControl(''),
      RoleCategory: new FormControl(''),
      JobRole: new FormControl(''),
      DesiredJob: new FormControl(''),
      EmploymentType: new FormControl(false),
      PreferredShift: new FormControl(false),
      PreferredWorkLocation: new FormControl(''),
      ExpectedSalary: new FormControl(''),
      ExpectedSalaryInLakh: new FormControl(''),
      ExpectedSalaryInThousand: new FormControl('')
    })
  }

  buildCarrerProfileForm() {
    this.carrerProfileForm = this.fb.group({
      CarrerProfile: this.fb.array([this.createCarrerProfileForm()])
    })
  }

  addCarrerProfile() {
    this.carrer.push(this.createCarrerProfileForm());
  }

  get carrer(): FormArray {
    return this.carrerProfileForm.get("CarrerProfile") as FormArray;
  }

  //----------------- Carreer Profile END'S ------------------------


  initForm() {
    this.manageUserForm = this.fb .group({
      UserId: new FormControl(this.userModal.UserId),
      FirstName: new FormControl(this.userModal.FirstName),
      LastName: new FormControl (this.userModal.LastName),
      Email: new FormControl(this.userModal.Email_ID),
      Mobile: new FormControl(this.userModal.Phone_Number),
      ResumeHeadline: new FormControl(this.userModal.Resume_Headline),
      ProfileImgPath: new FormControl(''),
      ResumePath: new FormControl(''),
      FileId: new FormControl(this.profile.FileId)
    })
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
    this.manageUserForm.patchValue({
      GradingSystem:value
    });
  }

  noticePeriodSelected(event: any) {
    let value = event.target.value;
    this.manageUserForm.get('NoticePeriod').setValue(value);
  }

  submitPersonalDetails() {
    let userDetails = this.personalDetailForm.value;
    let languages = this.personalDetailForm.controls['Languages'].value;
    this.http.post("user/personalDetail", userDetails).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Personal Deatil Form submitted successfully")
    })
  }

  submitEmploymentDetail() {
    let employment = this.employmentForm.value;
    this.http.post("user/EmploymentDetail", employment).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
  }

  submitEducationDetail() {
    let educations = this.educationForm.controls['Educations'].value;
    this.http.post("user/EducationDetail", educations).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
  }

  submitSkillDetail() {
    let skills = this.skillsForm.controls['TechnicalSkills'].value;
    this.http.post("user/SkillsDetail", skills).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
  }

  submitProjectDetail() {
    let projects = this.projectsForm.controls['Projects'].value;
    this.http.post("user/ProjectDetail", projects).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
  }

  submitAccomplishmentDetail() {
    let accomplishmentsDetail = {};
    let onlineProfiles = this.accomplishmentsForm.controls['OnlineProfiles'].value;
    let certifications = this.accomplishmentsForm.controls['Certifications'].value;
    let patents = this.accomplishmentsForm.controls['Patents'].value;
    let presentations = this.accomplishmentsForm.controls['Presentations'].value;
    let researches = this.accomplishmentsForm.controls['Researchs'].value;
    let workSamples = this.accomplishmentsForm.controls['WorkSamples'].value;
    accomplishmentsDetail = {
      OnlineProfiles: onlineProfiles,
      Certifications: certifications,
      Patents: patents,
      Presentations: presentations,
      Researches: researches,
      WorkSamples: workSamples
    }
    this.http.post("user/AccomplishmentDetail", accomplishmentsDetail).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
  }

  submitCarrerProfileDetail(){
    let carrerProfiles = this.carrerProfileForm.controls['CarrerProfile'].value;
    this.http.post("user/CarrerProfileDetail", carrerProfiles).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
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
    let formValue = {};
    let users = this.manageUserForm.value;

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
      let file = <File>selectedfile[0];
      this.fileDetail.push({
        name: "profile", 
        file: file
      });
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

  public submitManageUserForm() {
    let formData = new FormData();
    let userInfo = this.manageUserForm.value;
    let i = 0;
    while(i < this.fileDetail.length) {
      formData.append(this.fileDetail[i].name, this.fileDetail[i].file);
      i++;
    }

    formData.append("userInfo", JSON.stringify(userInfo));
    this.http.post(`user/UploadProfileDetailFile/${this.userDetail.UserId}`, formData).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        Toast(response.ResponseBody);
      }      
    })
  }
}

class Files {
  LocalImgPath: string = "";
  UserId: number = 0;
  FileId: number = -1;
  FileName: string = "";
  FileExtension: string = "";
  FilePath: string = "";
  FileUid: number = 0;
  ProfileUid: string = "";
  DocumentId: number = 0;
  FileType: string = "";
  FileSize: number = 0;
}

class Skills {
  Language: string = '';
  Version: string = '';
  LastUsed: Date = null;
  ExperienceYear: number = null;
  ExperienceMonth: number = null;
}