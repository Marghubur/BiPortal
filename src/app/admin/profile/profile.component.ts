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
  isEditWorkSample: boolean = false;
  editItSkillModal: Skills;
  currentItSkillOnEdit: FormGroup;
  deleteSkillDetail: any = null;
  isDeletedSkill: boolean = false;
  editProjectModal: Project;
  currentProjectOnEdit: FormGroup;
  isEditProject: boolean = false;
  isEditOnlineProfile: boolean = false;
  isEditCertification: boolean = false;
  isDeletedProfile: boolean = false;
  isDeletedCertification: boolean = false;
  isDeletedCWorkSample: boolean = false;
  isEditResearch: boolean = false;
  deletResearchValue: any = null;
  isDeletedResearch: boolean = false;
  isEditPresentation: boolean = false;
  isDeletedPresentation: boolean = false;
  isEditPatent: boolean = false;
  isDeletedPatent: boolean = false;
  isEditItSkill: boolean = false;
  siteURL: string = null;
  siteURLForm: FormGroup;
  isSiteURLUpdate: boolean = false;


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
    if (this.editProjectModal.ProjectTitle =='' && this.editProjectModal.ProjectDetails == '')
      return ErrorToast("Plesae enter project title and project description")
    this.isLoading = true;
    this.currentProjectOnEdit.get("ProjectTitle").setValue(this.editProjectModal.ProjectTitle);
    this.currentProjectOnEdit.get("ProjectDuration").setValue(this.editProjectModal.ProjectDuration);
    this.currentProjectOnEdit.get("TechnalogyStack").setValue(this.editProjectModal.TechnalogyStack);
    this.currentProjectOnEdit.get("ClientName").setValue(this.editProjectModal.ClientName);
    this.currentProjectOnEdit.get("ProjectStatus").setValue(this.editProjectModal.ProjectStatus);
    this.currentProjectOnEdit.get("RolesResponsibility").setValue(this.editProjectModal.RolesResponsibility);
    this.currentProjectOnEdit.get("ProjectDetails").setValue(this.editProjectModal.ProjectDetails);
    this.submitProjectDetail();
    this.isLoading = false;
    $("#editProjectModal").modal('hide');
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
    this.isLoading = true;
    let projectValue = this.deleteProjectDetail;
    let project = this.projectsForm.get('Projects') as FormArray;
    project.removeAt(project.value.findIndex(item => item.ProjectIndex == projectValue.ProjectIndex));
    this.userModal.Projects = project.value;
    this.updateProfile();
    this.isLoading = false;
    $("#deleteProjectMOdal").modal("hide")
  }

  closeProjectModal() {
    let value = this.editProjectModal;
    let project = this.projectsForm.get('Projects') as FormArray;
    project.removeAt(project.value.findIndex(item => item.ProjectIndex == value.ProjectIndex));
    this.userModal.Skills = project.value;
    $("#editProjectModal").modal("hide");
  }
  //----------------- Projects END'S ------------------------


  //----------------- technical skills form, group and add new ------------------------

  buildSkillsForm() {
    this.skillsForm = this.fb.group({
      TechnicalSkills: this.fb.array(this.userModal.Skills.map((item, index) => this.createTechnicalSkillsGroup(item, index)))
    })
  }

  createTechnicalSkillsGroup(skill: Skills, index: number) {
    return this.fb.group({
      SkillIndex: new FormControl(index),
      Language: new FormControl(skill.Language),
      Version: new FormControl(skill.Version),
      LastUsed: new FormControl(skill.LastUsed),
      ExperienceInYear: new FormControl(skill.ExperienceInYear),
      ExperienceInMonth: new FormControl(skill.ExperienceInMonth)
    })
  }

  get skills(): FormArray {
    return this.skillsForm.get("TechnicalSkills") as FormArray;
  }

  editItSkillDetail(current: FormGroup) {
    this.currentItSkillOnEdit = current;
    this.editItSkillModal = current.value as Skills;
    $("#itSkillModal").modal('show');
    this.isEditItSkill = true;
  }

  addOrUpdateItSkill() {
    if (this.editItSkillModal.Language == '')
      return ErrorToast("Please enter language");
    this.isLoading = true;
    this.currentItSkillOnEdit.get("Language").setValue(this.editItSkillModal.Language);
    this.currentItSkillOnEdit.get("Version").setValue(this.editItSkillModal.Version);
    this.currentItSkillOnEdit.get("ExperienceInMonth").setValue(this.editItSkillModal.ExperienceInMonth);
    this.currentItSkillOnEdit.get("ExperienceInYear").setValue(this.editItSkillModal.ExperienceInYear);
    this.currentItSkillOnEdit.get("LastUsed").setValue(this.editItSkillModal.LastUsed);
    this.currentItSkillOnEdit.get("Version").setValue(this.editItSkillModal.Version);
    this.submitSkillDetail();
    this.isLoading = false;
    $("#itSkillModal").modal('hide');
  }

  addItskill() {
    let newSkill = new Skills();
    let skill = this.skillsForm.get("TechnicalSkills") as FormArray;
    this.currentItSkillOnEdit = this.createTechnicalSkillsGroup(newSkill, skill.length + 1);
    skill.push(this.currentItSkillOnEdit);
    this.editItSkillModal = this.currentItSkillOnEdit.value as Skills;
    $("#itSkillModal").modal("show");
    this.isEditItSkill = true;
  }

  deleteSkillPopup(e: any) {
    this.isDeletedSkill = true;
    $("#deleteSkillModal").modal("show")
    this.deleteSkillDetail = e.value;
  }

  deleteItSkill() {
    this.isLoading = true;
    let skillValue = this.deleteSkillDetail;
    let skill = this.skillsForm.get("TechnicalSkills") as FormArray;
    skill.removeAt(skill.value.findIndex(item => item.SkillIndex == skillValue.SkillIndex));
    this.userModal.Skills = skill.value;
    this.updateProfile();
    this.isLoading = false;
    this.closeModal();
  }

  closeSkillModal() {
    let value = this.editItSkillModal;
    let skill = this.skillsForm.get("TechnicalSkills") as FormArray;
    skill.removeAt(skill.value.findIndex(item => item.SkillIndex == value.SkillIndex));
    this.userModal.Skills = skill.value;
    $("#itSkillModal").modal("hide");
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
          Certifications: this.fb.array(this.userModal.Accomplishments.Certification.map((item, index) => this.buildCertifications(item)))
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
        OnlineProfile: new FormControl(value)
      });
    }

    buildWorkSamples(value: string) {
      return this.fb.group({
        WorkSample: new FormControl(value)
      });
    }

    buildResearchs(value: string) {
      return this.fb.group({
        Research: new FormControl(value)
      });
    }

    buildPresentations(value: string) {
      return this.fb.group({
        Presentation: new FormControl(value)
      });
    }

    buildPatents(value: string) {
      return this.fb.group({
        Patent: new FormControl(value)
      });
    }

    buildCertifications(value: string) {
      return this.fb.group({
        Certification: new FormControl(value)
      });
    }

    addOnlieProfiles() {
      this.siteURL = "";
      this.isSiteURLUpdate = false;
      $("#onlineProfileModal").modal("show");
      this.isEditOnlineProfile = true;
    }

    submitOnlineProfile() {
      if (this.siteURL != '') {
        this.isLoading = true;
        let onlineProfile = this.accomplishmentsForm.get("OnlineProfiles") as FormArray;
        this.siteURLForm = this.buildOnlieProfiles(this.siteURL);
        onlineProfile.push(this.siteURLForm);
        this.submitAccomplishmentDetail();
        this.isLoading = false;
      } else {
        return ErrorToast("Please enter online profile")
      }
    }

    updateOnlineProfile() {
      this.isLoading = true;
      this.siteURLForm.get("OnlineProfile").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
    }

    editOnlineProfile(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.OnlineProfile;
      $("#onlineProfileModal").modal("show");
      this.isEditOnlineProfile = true;
    }


    deleteOnlineProfilePopup(e: any) {
      this.isDeletedProfile = true;
      $("#deleteOnlineProfileModal").modal("show")
      this.siteURL = e.value.OnlineProfile;
    }

    deleteOnlineProfile() {
      this.isLoading = true;
      let profile = this.accomplishmentsForm.get("OnlineProfiles") as FormArray;
      profile.removeAt(profile.value.findIndex(item => item.OnlineProfile == this.siteURL));
      this.userModal.Accomplishments.OnlineProfile = profile.value.map(item => item.OnlineProfile);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    addCertifications() {
      this.siteURL = '';
      this.isSiteURLUpdate = false;
      $("#certificationModal").modal("show");
      this.isEditCertification = true;
    }

    editCertification(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.Certification;
      $("#certificationModal").modal("show");
      this.isEditCertification = true;
    }

    submitCertification() {
      if (this.siteURL == '')
      return ErrorToast("Please enter certification")
      this.isLoading = true;
      let certification = this.accomplishmentsForm.get("Certifications") as FormArray;
      this.siteURLForm = this.buildCertifications(this.siteURL);
      certification.push(this.siteURLForm);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
    }

    updateCertification() {
      this.isLoading = true;
      this.siteURLForm.get("Certification").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
    }

    deleteCertificationPopup(e: any) {
      this.isDeletedCertification = true;
      $("#deleteCertificationModal").modal("show")
      this.siteURL = e.value.Certification;
    }

    deleteCertification() {
      this.isLoading = true;
      let certification = this.accomplishmentsForm.get("Certifications") as FormArray;
      certification.removeAt(certification.value.findIndex(item => item.Certification == this.siteURL));
      this.userModal.Accomplishments.Certification = certification.value.map(item => item.Certification);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    addWorkSamples() {
      this.siteURL = '';
      this.isSiteURLUpdate = false;
      $("#workSampleModal").modal("show");
      this.isEditWorkSample = true;
    }

    editWorkSample(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.WorkSample;
      $("#workSampleModal").modal("show");
      this.isEditWorkSample = true;
    }

    deleteWorkSamplePopup(e: any) {
      this.isDeletedCWorkSample = true;
      $("#deleteWorkSampleModal").modal("show")
      this.siteURL = e.value.WorkSample;
    }

    deleteWorkSample() {
      this.isLoading = true;
      let workSample = this.accomplishmentsForm.get("WorkSamples") as FormArray;
      workSample.removeAt(workSample.value.findIndex(item => item.WorkSample == this.siteURL));
      this.userModal.Accomplishments.WorkSample = workSample.value.map(item => item.WorkSample);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    submitWorkSample() {
      this.isLoading = true;
      let workSample = this.accomplishmentsForm.get("WorkSamples") as FormArray;
      this.siteURLForm = this.buildWorkSamples(this.siteURL);
      workSample.push(this.siteURLForm);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
    }

    updateWorkSample() {
      this.isLoading = true;
      this.siteURLForm.get("WorkSample").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
    }

    addResearchs() {
      this.siteURL = '';
      this.isSiteURLUpdate = false;
      $("#researchModal").modal("show");
      this.isEditResearch = true;
    }

    editResaerch(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.Research;
      $("#researchModal").modal("show");
      this.isEditResearch = true;
    }

    deleteResearchPopup(e: any) {
      this.isDeletedResearch = true;
      $("#deleteResearchModal").modal("show")
      this.siteURL = e.value.Research;
    }

    deleteResearch() {
      this.isLoading = true;
      let research = this.accomplishmentsForm.get("Researchs") as FormArray;
      research.removeAt(research.value.findIndex(item => item.Research == this.siteURL));
      this.userModal.Accomplishments.Research = research.value.map(item => item.Research);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    submitResearch() {
      if (this.siteURL == '')
        return ErrorToast("Please enter research/ journal")
      this.isLoading = true;
      let research = this.accomplishmentsForm.get("Researchs") as FormArray;
      this.siteURLForm = this.buildResearchs(this.siteURL);
      research.push(this.siteURLForm);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
    }

    updateResearch() {
      this.isLoading = true;
      this.siteURLForm.get("Research").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
    }

    addPresentations() {
      this.siteURL = '';
      this.isSiteURLUpdate = false;
      $("#presentationModal").modal("show");
      this.isEditPresentation = true;
    }

    editPresentation(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.Presentation;
      $("#presentationModal").modal("show");
      this.isEditPresentation = true;
    }

    deletePresentationPopup(e: any) {
      this.isDeletedPresentation = true;
      $("#deletePresentationModal").modal("show")
      this.siteURL = e.value.Presentation;
    }

    deletePresentation() {
      this.isLoading = true;
      let presentation = this.accomplishmentsForm.get("Presentations") as FormArray;
      presentation.removeAt(presentation.value.findIndex(item => item.Presentation == this.siteURL));
      this.userModal.Accomplishments.Presentation = presentation.value.map(item => item.Presentation);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    submitPresentation() {
      if (this.siteURL == '')
        return ErrorToast("Please enter presentation")
        this.isLoading = true;
      let presentation = this.accomplishmentsForm.get("Presentations") as FormArray;
      this.siteURLForm = this.buildPresentations(this.siteURL);
      presentation.push(this.siteURLForm);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
    }

    updatePresentation() {
      this.isLoading = true;
      this.siteURLForm.get("Presentation").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
    }

    addPatents() {
      this.siteURL = '';
      this.isSiteURLUpdate = false;
      $("#patentModal").modal("show");
      this.isEditPatent = true;
    }

    editPatent(current: FormGroup) {
      this.isSiteURLUpdate = true;
      this.siteURLForm = current;
      this.siteURL = current.value.Patent;
      $("#patentModal").modal("show");
      this.isEditPatent = true;
    }

    deletePatentPopup(e: any) {
      this.isDeletedPatent = true;
      $("#deletePatentModal").modal("show")
      this.siteURL = e.value.Patent;
    }

    deletePatent() {
      this.isLoading = true;
      let patent = this.accomplishmentsForm.get("Patents") as FormArray;
      patent.removeAt(patent.value.findIndex(item => item.Patent == this.siteURL));
      this.userModal.Accomplishments.Patent = patent.value.map(item => item.Patent);
      this.updateProfile();
      this.isLoading = false;
      this.closeModal();
    }

    submitPatent() {
      if (this.siteURL == '')
        return ErrorToast("Please enter patent")
      this.isLoading = true;
      let patent = this.accomplishmentsForm.get("Patents") as FormArray;
      this.siteURLForm = this.buildPatents(this.siteURL);
      patent.push(this.siteURLForm);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
    }

    updatePatent() {
      this.isLoading = true;
      this.siteURLForm.get("Patent").setValue(this.siteURL);
      this.submitAccomplishmentDetail();
      this.isLoading = false;
      this.isSiteURLUpdate = false;
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
  //----------------- Accomplishment skills END'S ------------------------


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
    this.isLoading = true;
    let userDetails = this.personalDetailForm.value;
    let languages = this.personalDetailForm.controls['Languages'].value;
    this.userModal.PersonalDetail = userDetails;
    this.updateProfile();
    this.isLoading = false;
  }

  submitEmploymentDetail() {
    this.isLoading = true;
    let employment = this.employmentForm.get("Employments").value;
    if(employment.length > 0) {
      this.userModal.Employments = employment;
    }
    this.updateProfile();
    this.isLoading = false;
  }

  submitEducationDetail() {
    this.isLoading = true;
    let educations = this.educationForm.controls['Educations'].value;
    this.userModal.Educational_Detail = educations;
    this.updateProfile();
    this.isLoading = false;
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
      OnlineProfile: onlineProfiles.map(item => item.OnlineProfile),
      Certification: certifications.map(item => item.Certification),
      Patent: patents.map(item => item.Patent),
      Presentation: presentations.map(item => item.Presentation),
      Research: researches.map(item => item.Research),
      WorkSample: workSamples.map(item => item.WorkSample),
    }

    this.updateProfile();
    this.closeModal();
  }

  submitCarrerProfileDetail(){
    this.isLoading = true;
    let carrerProfiles = this.carrerProfileForm.controls['CarrerProfile'].value;
    this.userModal.Companies = carrerProfiles;
    this.updateProfile();
    this.isLoading = false;
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

  closeModal() {
    $("#itSkillModal").modal('hide');
    $("#editProjectModal").modal('hide');
    $("#onlineProfileModal").modal('hide');
    $("#workSampleModal").modal("hide");
    $("#resarchModal").modal("hide");
    $("#presentationModal").modal("hide");
    $("#researchModal").modal("hide");
    $("#certificationModal").modal("hide");
    $("#deleteProjectMOdal").modal("hide");
    $("#deleteOnlineProfileModal").modal("hide");
    $("#deleteCertificationModal").modal("hide");
    $("#deleteWorkSampleModal").modal("hide");
    $("#deletePresentationModal").modal("hide");
    $("#deleteResearchModal").modal("hide");
    $("#patentModal").modal("hide");
    $("#deletePatentModal").modal("hide");
    $("#deleteSkillModal").modal("hide");
  }

  cleanFileHandler() {
    this.uploading = false;
    $("#uploadocument").val("");
    this.isLargeFile = false;
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
  SkillIndex: number = 0;
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
