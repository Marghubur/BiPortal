import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, UserDetail } from 'src/providers/common-service/common.service';
import { AccessTokenExpiredOn } from 'src/providers/constants';
import { UserService } from 'src/providers/userService';
declare var $: any;


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ManageComponent implements OnInit {
  active = 1;
  model: NgbDateStruct;
  submitted: boolean = false;
  userModal: ProfessionalUser = null;
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
  isLanguageSeleted: boolean = false;
  singleSkill: Array<any> = [];
  isItskillEdit: boolean = false;
  deleteProjectDetail: any = null;
  isDeleted: boolean = false;

  editProjectModal: Project;
  currentProjectOnEdit: FormGroup;
  isEditProject: boolean = false;

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
    this.userModal = new ProfessionalUser();
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
      Toast("Invalid user. Please login again.")
    }
  }

  loadData(user: any) {
    this.http.get(`user/GetUserDetail/${this.userDetail.UserId}`).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        let detail = res.ResponseBody.professionalUser;
        this.profile = res.ResponseBody.profileDetail;
        this.userModal = detail;
        this.profileURL = `${this.http.GetImageBasePath()}${this.profile.FilePath}/${this.profile.FileName}.${this.profile.FileExtension}`;
        let educations = this.userModal.Educational_Detail.filter(x => x.Degree_Name !== null);
        this.userModal.Educational_Detail = educations;
        this.UserId = this.userModal.UserId;
      } else {
        ErrorToast("Invalid user. Please login again.");
      }

      this.initForm();
      this.buildProjectsForm();
      this.buildEmploymentForm();
      this.buildEducationForm();
      this.buildSkillsForm();
      this.buildAccomplishmentsForm();
      this.buildCarrerProfileForm();
      this.buildPersonalDetailForm();
      this.isFormReady = true;
    });
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.personalDetailForm.controls["DOB"].setValue(date);
  }


  //----------------- Personal Detail form, group and add new ------------------------

  buildPersonalDetailForm() {
    let date = new Date(this.userModal.PersonalDetail.DOB);
    this.model.year = date.getFullYear();
    this.model.month = date.getMonth() + 1;
    this.model.day = date.getDate();
    this.personalDetailForm = this.fb.group({
      DOB: new FormControl(date),
      Gender: new FormControl(this.userModal.PersonalDetail.Gender),
      Address: new FormControl(this.userModal.PersonalDetail.Address),
      HomeTown: new FormControl(this.userModal.PersonalDetail.HomeTown),
      PinCode: new FormControl(this.userModal.PersonalDetail.PinCode),
      MaritalStatus: new FormControl(this.userModal.PersonalDetail.MaritalStatus),
      Category: new FormControl(this.userModal.PersonalDetail.Category),
      DifferentlyAbled: new FormControl(this.userModal.PersonalDetail.DifferentlyAbled),
      PermitUSA: new FormControl(this.userModal.PersonalDetail.PermitUSA),
      PermitOtherCountry: new FormControl(this.userModal.PersonalDetail.PermitOtherCountry),
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
      Projects: this.fb.array(this.userModal.Projects.map((item, index) => this.projectForm(item, index)))
    });
  }

  projectForm(project: Project, index: number) {
    return this.fb.group({
      ProjectIndex: new FormControl(index),
      ProjectTitle: new FormControl(project.ProjectTitle),
      ProjectTag: new FormControl(project.ProjectTag),
      ProjectWorkingYear: new FormControl(project.ProjectWorkingYear),
      ProjectWorkingMonth: new FormControl(project.ProjectWorkedMonth),
      ProjectWorkedYear: new FormControl(project.ProjectWorkedYear),
      ProjectWorkedMonth: new FormControl(project.ProjectWorkedMonth),
      ProjectStatus: new FormControl(project.ProjectStatus),
      ClientName: new FormControl(project.ClientName),
      ProjectDetails: new FormControl(project.ProjectDetails),
      RolesResponsibility: new FormControl(project.RolesResponsibility),
      TechnalogyStack: new FormControl(project.TechnalogyStack),
      ProjectDuration: new FormControl(project.ProjectDuration)
    })
  }

  editProjectDetail(current: FormGroup) {
    this.currentProjectOnEdit = current;
    this.editProjectModal = current.value as Project;
    $("#editProjectModal").modal("show");
    this.isEditProject = true;
  }

  addOrUpdateProject() {
      this.currentProjectOnEdit.get("ProjectTitle").setValue(this.editProjectModal.ProjectTitle);
      this.currentProjectOnEdit.get("ProjectDuration").setValue(this.editProjectModal.ProjectDuration);
      this.currentProjectOnEdit.get("TechnalogyStack").setValue(this.editProjectModal.TechnalogyStack);
      this.currentProjectOnEdit.get("ClientName").setValue(this.editProjectModal.ClientName);
      this.currentProjectOnEdit.get("ProjectStatus").setValue(this.editProjectModal.ProjectStatus);
      this.currentProjectOnEdit.get("RolesResponsibility").setValue(this.editProjectModal.RolesResponsibility);
      this.currentProjectOnEdit.get("ProjectDetails").setValue(this.editProjectModal.ProjectDetails);
      this.submitProjectDetail();
    this.closeModal();
  }

  get projects() {
    return this.projectsForm.get('Projects') as FormArray;
  }

  addProject() {
    let newProject = new Project();
    let project = this.projectsForm.get('Projects') as FormArray;
    this.currentProjectOnEdit = this.projectForm(newProject, project.length + 1);
    project.push(this.currentProjectOnEdit);
    this.editProjectModal = this.currentProjectOnEdit.value as Project;
    $("#editProjectModal").modal("show");
    this.isEditProject = true;
  }

  deleteProjectPopup(e: any) {
    this.isDeleted = true;
    $("#deleteProjectMOdal").modal("show")
    this.deleteProjectDetail = e.value;
  }

  deleteProject() {
    let projectValue = this.deleteProjectDetail;
    let project = this.projectsForm.get('Projects') as FormArray;
    project.removeAt(project.value.findIndex(item => item.ProjectIndex == projectValue.ProjectIndex));
    this.userModal.Projects = project.value;
    this.updateProfile();
    this.closeModal();
  }





  //----------------- Projects END'S ------------------------





  //----------------- technical skills form, group and add new ------------------------

  buildSkillsForm() {
    this.skillsForm = this.fb.group({
      TechnicalSkills: this.fb.array(this.userModal.Skills.map(item => this.createTechnicalSkillsGroup(item)))
    })
  }

  createTechnicalSkillsGroup(skill: Skills) {
    return this.fb.group({
      Language: new FormControl(skill.Language),
      Version: new FormControl(skill.Version),
      LastUsed: new FormControl(skill.LastUsed),
      ExperienceInYear: new FormControl(skill.ExperienceInYear),
      ExperienceInMonth: new FormControl(skill.ExperienceInMonth)
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
      if(this.userModal.Accomplishments !== null) {
        this.accomplishmentsForm = this.fb.group({
          OnlineProfiles: this.fb.array(this.userModal.Accomplishments.OnlineProfile.map(item => this.buildOnlieProfiles(item))),
          WorkSamples: this.fb.array(this.userModal.Accomplishments.WorkSample.map(item => this.buildWorkSamples(item))),
          Researchs: this.fb.array(this.userModal.Accomplishments.Research.map(item => this.buildResearchs(item))),
          Presentations: this.fb.array(this.userModal.Accomplishments.Presentation.map(item => this.buildPresentations(item))),
          Patents: this.fb.array(this.userModal.Accomplishments.Patent.map(item => this.buildPatents(item))),
          Certifications: this.fb.array(this.userModal.Accomplishments.Certification.map(item => this.buildCertifications(item)))
        })
      } else {
        this.accomplishmentsForm = this.fb.group({
          OnlineProfiles: this.fb.array([this.buildOnlieProfiles('')]),
          WorkSamples: this.fb.array([this.buildWorkSamples('')]),
          Researchs: this.fb.array([this.buildResearchs('')]),
          Presentations: this.fb.array([this.buildPresentations('')]),
          Patents: this.fb.array([this.buildPatents('')]),
          Certifications: this.fb.array([this.buildCertifications('')])
        })
      }
    }


    buildOnlieProfiles(value: string) {
      return this.fb.group({
        OnlineProfileUrl: new FormControl(value)
      });
    }

    buildWorkSamples(value: string) {
      return this.fb.group({
        WorkSampleUrl: new FormControl(value)
      });
    }

    buildResearchs(value: string) {
      return this.fb.group({
        ResearchUrl: new FormControl(value)
      });
    }

    buildPresentations(value: string) {
      return this.fb.group({
        PresentationUrl: new FormControl(value)
      });
    }

    buildPatents(value: string) {
      return this.fb.group({
        PatentUrl: new FormControl(value)
      });
    }

    buildCertifications(value: string) {
      return this.fb.group({
        CertificationUrl: new FormControl(value)
      });
    }


    addOnlieProfiles() {
      this.onlieProfiles.push(this.buildOnlieProfiles(''));
    }

    addWorkSamples() {
      this.workSamples.push(this.buildWorkSamples(''));
    }

    addResearchs() {
      this.researchs.push(this.buildResearchs(''));
    }

    addPresentations() {
      this.presentations.push(this.buildPresentations(''));
    }

    addPatents() {
      this.patents.push(this.buildPatents(''));
    }

    addCertifications() {
      this.certifications.push(this.buildCertifications(''));
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

    editPresentation() {
      //this.section.isPresentationEdit = !this.section.isPresentationEdit;
      $("#presentationModal").modal("show");
    }

    addNewPresentations() {
      this.addPresentations();
      this.editPresentation();
    }

    addNewOnlieProfiles() {
      this.addOnlieProfiles();
      this.editOnlineProfile();
    }

    addNewWorkSamples() {
      this.addWorkSamples();
      this.editWorkSample();
    }

    addNewResearchs() {
      this.addResearchs();
      this.editResaerch();
    }

    addNewPatents() {
      this.addPatents();
      this.editPatent();
    }

    addNewCertifications() {
      this.addCertifications();
      this.editCertification();
    }

    editOnlineProfile() {
      $("#onlineProfileModal").modal("show");
    }

    editResaerch() {
      $("#resarchModal").modal("show");
    }

    editWorkSample() {
      $("#workSampleModal").modal("show");
    }

    editPatent() {
      $("#researchModal").modal("show");
    }

    editCertification() {
      $("#researchModal").modal("show");
    }
  //----------------- technical skills END'S ------------------------




  //----------------- Education form, group and add new ------------------------

  createEducationForm(item: EducationalDetail) {
    return this.fb.group({
      Degree_Name: new FormControl(item.Degree_Name),
      Course: new FormControl(item.Course),
      Specialization: new FormControl(item.Specialization),
      University_Name: new FormControl(item.University_Name),
      Course_Type: new FormControl(item.Course_Type),
      Passout_Year: new FormControl(new Date(item.Passout_Year).toISOString().substring(0,10)),
      Grading_System: new FormControl(item.Grading_System)
    })
  }

  buildEducationForm() {
    this.educationForm = this.fb.group({
      Educations: this.fb.array(this.userModal.Educational_Detail.map(item => {
        return this.createEducationForm(item)
      }))
    })
  }

  addEducation() {
    let educationFormData = {
      Degree_Name: '',
      Course: '',
      Specialization: '',
      University_Name: '',
      Course_Type: '',
      Passout_Year: null,
      Grading_System: ''
    };
    this.education.push(this.createEducationForm(educationFormData));
  }

  get education(): FormArray{
    return this.educationForm.get("Educations") as FormArray
  }

  //----------------- Education END'S ------------------------



  //----------------- Employment form, group and add new ------------------------

  buildEmploymentForm() {
    if(this.userModal.Employments.length == 0) {
      this.userModal.Employments = [new Employment()];
    }

    this.employmentForm = this.fb.group({
      Employments: this.fb.array(this.userModal.Employments.map(item => this.createEmployment(item)))
    })
  }

  createEmployment(record: Employment) {
    return this.fb.group({
      Organization: new FormControl(record.Organization),
      Designation: new FormControl(record.Designation),
      EmploymentStatus: new FormControl(record.EmploymentStatus),
      Years: new FormControl(record.Years),
      Months: new FormControl(record.Months),
      CurrentSalary: new FormControl(record.CurrentSalary),
      CurrencyType: new FormControl(record.CurrencyType),
      Experties: new FormControl(record.Experties),
      JobProfile: new FormControl(record.JobProfile)
    })
  }

  get employment(): FormArray {
    return this.employmentForm.get("Employments") as FormArray
  }

  addEmployment() {
    let newEmployment = new Employment();
    this.employment.push(this.createEmployment(newEmployment))
  }

  //----------------- Employment END'S ------------------------




  //----------------- Carreer Profile form, group and add new ------------------------

  createCarrerProfileForm(carrer: Company) {
    return this.fb.group({
      Industry: new FormControl(carrer.Industry),
      Department: new FormControl(carrer.Department),
      RoleCategory: new FormControl(carrer.RoleCategory),
      Role: new FormControl(carrer.Role),
      DesiredTypePermanent: new FormControl(carrer.DesiredTypePermanent),
      DesiredEmploymentType: new FormControl(carrer.DesiredEmploymentType),
      PreferredShift: new FormControl(carrer.PreferredShift),
      PreferredWorkLocation: new FormControl(carrer.PreferredWorkLocation),
      ExpectedSalary: new FormControl(carrer.ExpectedSalary),
      CurrencyType: new FormControl(carrer.CurrencyType)
    })
  }

  buildCarrerProfileForm() {
    this.carrerProfileForm = this.fb.group({
      CarrerProfile: this.fb.array(this.userModal.Companies.map(item => this.createCarrerProfileForm(item)))
    })
  }

  addCarrerProfile() {
    let newCarrer = new Company();
    this.carrer.push(this.createCarrerProfileForm(newCarrer));
  }

  get carrer(): FormArray {
    return this.carrerProfileForm.get("CarrerProfile") as FormArray;
  }

  //----------------- Carreer Profile END'S ------------------------


  initForm() {
    let fullName = this.userModal.Name.split(" ");
    if(fullName.length > 0) {
      this.userModal.FirstName = fullName[0];
      this.userModal.LastName = fullName.splice(1, 1).join(" ");
    }

    this.manageUserForm = this.fb .group({
      UserId: new FormControl(this.userModal.UserId),
      FirstName: new FormControl(this.userModal.FirstName),
      LastName: new FormControl (this.userModal.LastName),
      Email: new FormControl(this.userModal.Email),
      Mobile: new FormControl(this.userModal.Mobile_Number),
      ResumeHeadline: new FormControl(this.userModal.ResumeHeadline),
      ProfileImgPath: new FormControl(''),
      ResumePath: new FormControl(''),
      FileId: new FormControl(this.userModal.FileId)
    })
  }

  submitPersonalDetails() {
    let userDetails = this.personalDetailForm.value;
    let languages = this.personalDetailForm.controls['Languages'].value;
    this.userModal.PersonalDetail = userDetails;
    this.updateProfile();
  }

  submitEmploymentDetail() {
    let employment = this.employmentForm.get("Employments").value;
    if(employment.length > 0) {
      this.userModal.Employments = employment;
    }
    this.updateProfile();
  }

  submitEducationDetail() {
    let educations = this.educationForm.controls['Educations'].value;
    this.userModal.Educational_Detail = educations;
    this.updateProfile();
  }

  submitSkillDetail() {
    let skills = this.skillsForm.controls['TechnicalSkills'].value;
    this.userModal.Skills = skills;
    this.updateProfile();
  }

  submitProjectDetail() {
    let projects = this.projectsForm.controls['Projects'].value;
    this.userModal.Projects = projects;
    this.updateProfile();
  }

  submitAccomplishmentDetail() {
    let onlineProfiles = this.accomplishmentsForm.controls['OnlineProfiles'].value;
    let certifications = this.accomplishmentsForm.controls['Certifications'].value;
    let patents = this.accomplishmentsForm.controls['Patents'].value;
    let presentations = this.accomplishmentsForm.controls['Presentations'].value;
    let researches = this.accomplishmentsForm.controls['Researchs'].value;
    let workSamples = this.accomplishmentsForm.controls['WorkSamples'].value;
    this.userModal.Accomplishments = {
      OnlineProfile: onlineProfiles.map(item => item.OnlineProfileUrl),
      Certification: certifications.map(item => item.CertificationUrl),
      Patent: patents.map(item => item.PatentUrl),
      Presentation: presentations.map(item => item.PresentationUrl),
      Research: researches.map(item => item.ResearchUrl),
      WorkSample: workSamples.map(item => item.WorkSampleUrl),
      //ProfileSummary: []
    }

    this.updateProfile();
    this.closeModal();
  }

  submitCarrerProfileDetail(){
    let carrerProfiles = this.carrerProfileForm.controls['CarrerProfile'].value;
    this.userModal.Companies = carrerProfiles;
    this.updateProfile();
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

  updateProfile() {
    this.http.post("user/UpdateUserProfile", this.userModal).then((response:ResponseModel) => {
      if (response.ResponseBody)
        Toast("Employment Form submitted successfully")
    })
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
    this.section.isEmploymentEdit = true;
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

  editProfile() {
    this.section.isProfileEdit = !this.section.isProfileEdit;
  }

  editDetail(e: any) {
    $("#itSkillModal").modal('show');
    let singleSkill = e.value;
  }

  closeModal() {
    $("#itSkillModal").modal('hide');
    $("#editProjectModal").modal('hide');
    $("#onlineProfileModal").modal('hide');
    $("#workSampleModal").modal("hide");
    $("#resarchModal").modal("hide");
    $("#presentationModal").modal("hide");
    $("#researchModal").modal("hide");
    $("#certificationModal").modal("hide");
    $("#deleteProjectMOdal").modal("hide")
  }

  cleanFileHandler() {
    // this.btnDisable = true;
    // this.fileAvailable = false;
    this.uploading = false;
    $("#uploadocument").val("");
    this.isLargeFile = false;
    // this.FilesCollection = [];
  }

  addNewItskill() {
    this.addItskill();
    $("#itSkillModal").modal('show');
  }

  reset() {
    this.manageUserForm.reset();
  }

  public submitManageUserForm() {
    let formData = new FormData();

    let userInfo = this.manageUserForm.value;

    this.userModal.FirstName = userInfo.FirstName;
    this.userModal.LastName = userInfo.LastName;
    this.userModal.ResumeHeadline = userInfo.ResumeHeadline;
    this.userModal.FileId = userInfo.FileId;

    let i = 0;
    while(i < this.fileDetail.length) {
      formData.append(this.fileDetail[i].name, this.fileDetail[i].file);
      i++;
    }

    formData.append("userInfo", JSON.stringify(this.userModal));
    this.http.post(`user/UploadProfileDetailFile/${this.userDetail.UserId}`, formData).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        Toast(response.ResponseBody);
      }
    })
  }

  selectLanguage(e: any) {
    this.singleSkill = e.value;
    this.isLanguageSeleted = true;
  }
}

class ProfessionalUser {
  UserId: number = 0;
  FileId: number = -1;
  Name: string = '';
  FirstName: string = '';
  LastName: string = '';
  ResumeHeadline: string = '';
  Email: string= '';
  Gender: string = '';
  Skills: Skills[] = [];
  Companies: Company[] = [];
  Job_Title: string = '';
  OtherDetail: OtherDetail = null;
  ExpectedCTC: number = null;
  Mobile_Number: string = null;
  Notice_Period: number = 0;
  Salary_Package: number = 0;
  Activity_Status: ActivityStatus = null;
  Alternate_Number: number = null;
  Current_Location: string = '';
  Educational_Detail: EducationalDetail[] = [];
  Date_Of_Application: Date = null;
  Preferred_Location: string[] = [];
  Total_Experience_In_Months: number = 0;
  Key_Skills: string = '';
  Projects: Project[] = [];
  Accomplishments: Accomplishment = null;
  PersonalDetail: PersonalDetail = null;
  Employments: Array<Employment> = [];
}

class Employment {
  Organization: string = null;
  Designation: string = null;
  EmploymentStatus: string = null;
  Years: number = 0;
  Months: number = 0;
  CurrentSalary: number = 0;
  CurrencyType: string = null;
  Experties: string = null;
  JobProfile: string = null;
}

class Company {
  Role: string = '';
  Industry: string = '';
  Company_Name: string = '';
  Functional_Area: string = '';
  Department: string = '';
  DesiredTypePermanent: string = '';
  DesiredEmploymentType: string = '';
  PreferredShift: string = '';
  PreferredWorkLocation: string = '';
  ExpectedSalary: string = '';
  RoleCategory: string = '';
  Designation: string = '';
  CurrencyType: string = ''
}

class OtherDetail {
  Sumary: string = '';
  Feedback: string = '';
  Pin_Code: number = 0;
  Resume_Headline: string= '';
  Latest_Star_Rating: number = 0;
  Work_Permit_For_USA: string = '';
  Source_Of_Application: string = ''
}

class ActivityStatus {
  Viewed: string = '';
  Emailed: string = '';
  Comment_1: string = '';
  Comment_2: string = '';
  Comment_3: string = '';
  Comment_4: string = '';
  Comment_5: string = '';
  Viewed_By: string = '';
  Emailed_By: string = '';
  Comment_1_By: string = '';
  Comment_2_By: string = '';
  Comment_3_By: string = '';
  Comment_4_By: string = '';
  Comment_5_By: string = '';
  Time_Of_Email: string = '';
  Calling_Status: string = '';
  Time_Comment_1_posted: string = '';
  Time_Comment_2_posted: string = '';
  Time_Comment_3_posted: string = '';
  Time_Comment_4_posted: string = '';
  Time_Comment_5_posted: string = '';
  Calling_Status_updated_by: string = '';
  Time_of_Calling_activity_update: string = '';
}

class EducationalDetail {
  Degree_Name: string = '';
  Passout_Year: Date = null;
  Specialization: string = '';
  University_Name: string = '';
  Course_Type: string = '';
  Grading_System: string = '';
  Course: string = '';
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

class Skills {
  Language: string = '';
  Version: number = 0;
  LastUsed: Date = null;
  ExperienceInYear: number = 0;
  ExperienceInMonth: number = 0;
}

class Project {
  ProjectTitle: string = '';
  ProjectTag: string = '';
  ProjectWorkingYear: number = 0;
  ProjectWorkingMonth: number = 0;
  ProjectWorkedYear: number = 0;
  ProjectWorkedMonth: number = 0;
  ProjectStatus: string = '';
  ClientName: string = '';
  ProjectDetails: string = '';
  RolesResponsibility: string = '';
  TechnalogyStack: string = '';
  ProjectDuration: string = '';
  ProjectIndex: number = 0;
}

class Accomplishment {
  //ProfileSummary: Array<string> = [];
  OnlineProfile: Array<string> = [];
  WorkSample: Array<string> = [];
  Research: Array<string> = [];
  Presentation: Array<string> = [];
  Patent: Array<string> = [];
  Certification: Array<string> = [];
}

class PersonalDetail {
  DOB: Date = new Date();
  Gender: string = '';
  Address: string = '';
  HomeTown: string = '';
  PinCode: number = 0;
  MaritalStatus: string = '';
  Category: string = '';
  DifferentlyAbled: string = '';
  PermitUSA: string = '';
  PermitOtherCountry: string = '';
  LanguageDetails: LanguageDetail[] = [];
}

class LanguageDetail {
  Language: string = '';
  LanguageRead: boolean = null;
  LanguageWrite: boolean = null;
  ProficiencyLanguage: string = '';
  LanguageSpeak: boolean = null;
}
