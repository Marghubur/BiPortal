import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { Toast, UserDetail } from 'src/providers/common-service/common.service';
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
  manageUserForm: FormGroup = null;
  userModal: UserDetail = null;
  employees: Array<UserDetail> = [];
  grandTotalAmount: number = 0;
  packageAmount: number = 0;
  isDeveloperSelected: boolean = false;
  cgstAmount: number = 0;
  sgstAmount: number = 0;
  igstAmount: number = 0;
  months: Array<any> = null;
  isLoading: boolean = false;
  clients: Array<any> = [];
  allocatedClients: Array<any> = [];
  isAllocated: boolean = false;
  isUpdate: boolean = false;
  employeeUid: number = 0;
  isInsertingNewClient: boolean = true;
  assignedActiveClientUid: number = 0;
  idReady: boolean = false;
  currentClientId: number = 0;
  isCreated: boolean = false;
  isEdited: boolean = false;
  User: string;
  userDetail: UserDetail = new UserDetail();
  UserId: number = null;
  uploading: boolean = true;
  isLargeFile: Boolean= false;
  section: any = {
    isResumeHeadlineEdit: false,
    isKeySkillEdit: false,
    isEmploymentEdit: false,
    isEducationEdit: false,
    isItSkillEdit: false,
    isProjectsEdit: false,
    isProfileSummaryEdit: false,
    isCarrerProfileEdit: false,
    isPersonalDetailEdit: false
  };

  employmentForm: FormGroup = null;
  userDeatilForm: FormGroup = null;
  keySkillForm: FormGroup = null;
  educationForm: FormGroup = null;
  itSkillForm: FormGroup = null;
  projectForm: FormGroup = null;
  profileSummaryForm: FormGroup = null;
  carrerProfileForm: FormGroup = null;
  personalDetailsForm: FormGroup = null;

  @Output() authentication = new EventEmitter();

  get f() {
    let data = this.manageUserForm.controls;
    return data;
  }

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
      isPersonalDetailEdit: false
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
      this.idReady = true;
    });
  }

  daysInMonth(monthNumber: number) {
    var now = new Date();
    return new Date(now.getFullYear(), monthNumber, 0).getDate();
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.manageUserForm.controls["Dob"].setValue(date);
  }

  bindForm() {
    this.manageUserForm = this.fb.group({
      FirstName: new FormControl(this.userModal.FirstName, [Validators.required]),
      LastName: new FormControl(this.userModal.LastName),
      Mobile: new FormControl(this.userModal.Mobile),
      Email: new FormControl(this.userModal.EmailId),
      State: new FormControl(this.userModal.State),
      City: new FormControl(this.userModal.City),
      Address: new FormControl(this.userModal.Address),
      Dob: new FormControl(this.userModal.Dob),
      UserId: new FormControl(this.userModal.UserId),
    });
  }

  initForm() {
    this.buildUserDetailForm()
    this.buildEducationForm(new EducationDetail());
    this.buildEmploymentForm();
    this.buildItSkillForm();
    this.buildKeySkillForm();
    this.buildProjectForm();
    this.buildCarrerProfile();
    this.buildProfileSummaryForm();
    this.buildPersonalDetailForm();
  }

  buildUserDetailForm() {
    this.userDeatilForm = this.fb.group({
      FirstName: new FormControl(UserPersonalDetail, Validators.required),
      LastName: new FormControl(UserPersonalDetail, Validators.required),
      Mobile: new FormControl(UserPersonalDetail, Validators.required),
      Email: new FormControl(UserPersonalDetail, Validators.required)
    })
  }

  buildKeySkillForm() {
    this.keySkillForm = this.fb.group({
      KeySkill: new FormControl('', Validators.required)
    })
  }

  buildEmploymentForm() {
    this.employmentForm = this.fb.group({
      Designation: new FormControl('', Validators.required),
      YourOrganization: new FormControl('', Validators.required),
      CurrentCompany: new FormControl(''),
      WorkingYear: new FormControl('', Validators.required),
      WorkingMonth: new FormControl('', Validators.required),
      WorkedYear: new FormControl('', Validators.required),
      CurrentSalary: new FormControl('', Validators.required),
      CurrentSalaryLakh: new FormControl('', Validators.required),
      Experties: new FormControl('', Validators.required),
      JobProfile: new FormControl('', Validators.required),
      NoticePeriod: new FormControl('', Validators.required),
      CurrentSalaryThousand: new FormControl(null)
    });
  }

  buildItSkillForm() {
    this.itSkillForm = this.fb.group({
      ITSkill: new FormControl('', Validators.required),
      Version: new FormControl(''),
      LastUsed: new FormControl(''),
      ExperienceYear: new FormControl(''),
      ExperienceMonth: new FormControl('')
    });
  }

  buildEducationForm(educationDetail: EducationDetail) {
    this.educationForm = this.fb.group({
      Education: new FormControl('', Validators.required),
      Course: new FormControl('', Validators.required),
      Specialization: new FormControl('', Validators.required),
      University: new FormControl('', Validators.required),
      CourseType: new FormControl('', Validators.required),
      PassingYear: new FormControl('', Validators.required),
      GradingSystem: new FormControl('', Validators.required)
    });
  }

  buildProjectForm() {
    this.projectForm = this.fb.group({
      ProjectTitle: new FormControl('', Validators.required),
      ProjectTag: new FormControl(''),
      ProjectWorkingYear: new FormControl(''),
      ProjectWorkingMonth: new FormControl(''),
      ProjectWorkedYear: new FormControl(''),
      ProjectStatus: new FormControl(''),
      ClientName: new FormControl('', Validators.required),
      ProjectDetail: new FormControl('', Validators.required)
    })
  }

  buildCarrerProfile() {
    this.carrerProfileForm = this.fb.group({
      CurrentIndustry: new FormControl('', Validators.required),
      Department: new FormControl('', Validators.required),
      RoleCategory: new FormControl('', Validators.required),
      JobRole: new FormControl('', Validators.required),
      DesiredJob: new FormControl('', Validators.required),
      EmploymentType: new FormControl('', Validators.required),
      PreferredShift: new FormControl(''),
      PreferredWorkLocation: new FormControl(''),
      ExpectedSalary: new FormControl('', Validators.required),
      ExpectedSalaryLakh: new FormControl(''),
      ExpectedSalaryThousand: new FormControl('')
    })
  }

  buildProfileSummaryForm() {
    this.profileSummaryForm = this.fb.group({
      ProfileSummary: new FormControl('')
    })
  }

  buildPersonalDetailForm() {
    this.personalDetailsForm = this.fb.group({
      DOB: new FormControl('', Validators.required),
      Gender: new FormControl('', Validators.required),
      Address: new FormControl(''),
      HomeTown: new FormControl(''),
      PinCode: new FormControl(''),
      MaritalStatus: new FormControl('', Validators.required),
      Category: new FormControl('', Validators.required),
      DifferentlyAbled: new FormControl(''),
      PermitUSA: new FormControl(''),
      PermitOtherCountry: new FormControl(''),
      Language: new FormControl('', Validators.required),
      LanguageReadWrite: new FormControl ('', Validators.required),
      ProficiencyLanguage: new FormControl(''),
      LanguageSpeak: new FormControl('')
    });
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

    // if (this.userModal.Pincode === null)
    //   this.userModal.Pincode = 0;
    // if (this.userModal.ExprienceInYear === null)
    //   this.userModal.ExprienceInYear = 0;
    // if (this.userModal.AllocatedClientId === null)
    //   this.userModal.AllocatedClientId = 0;
    // if (this.userModal.ActualPackage === null)
    //   this.userModal.ActualPackage = 0;
    // if (this.userModal.FinalPackage === null)
    //   this.userModal.FinalPackage = 0;
    // if (this.userModal.TakeHomeByCandidate === null)
    //   this.userModal.TakeHomeByCandidate = 0;
    if (errroCounter == 0) {
      this.http.post("user/UpdateUser", this.userModal)
      .then((response: ResponseModel) => {
        if (response.ResponseBody !== null && response.ResponseBody !== "expired") {
          Toast(response.ResponseBody);
        } else {
          if (response.ResponseBody !== "expired") {
            Toast("Your session got expired. Log in again.");
          }
        }

        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
        Toast("Registration fail. Please contact admin.")
      });
    } else {
      this.isLoading = false;
      Toast("Please correct all the mandaroty field marded red");
    }
  }

  fireBrowserFile() {
    this.submitted = true;
    $("#uploadocument").click();
  }

  fireresumeBrowserFile() {
    this.submitted = true;
    $("#uploadresume").click();
  }

  GetDocumentFile(fileInput: any) {
    // this.FileDocuments = [];
    // this.fileDetail = fileInput.target.files[0];
    // if (selectedFiles.length > 0) {
    //   let index = 0;
    //   let file = null;
    //   this.btnDisable = false;
    //   this.fileAvailable = true;
       this.uploading = false;
    //   while (index < selectedFiles.length) {
    //     file = <File>selectedFiles[index];
    //     let item: Files = new Files();
    //     item.FileName = file.name;
    //     item.FileType = file.type;
    //     item.FileSize = (Number(file.size)/1024);
    //     item.Mobile = this.currentUser.Mobile;
    //     item.Email = this.currentUser.Email;
    //     item.FileExtension = file.type;
    //     item.DocumentId = 0;
    //     item.FilePath = this.getRelativePath(this.routeParam);
    //     item.ParentFolder = '';
    //     item.UserId = this.currentUser.UserId;
    //     item.UserTypeId = this.currentUser.UserTypeId;
    //     this.FileDocumentList.push(item);
    //     this.FilesCollection.push(file);
    //     index++;
    //   }

    //   for(let i=0; i<selectedFiles.length; i++) {
    //     let filesize = Number(this.FilesCollection[i].size)
    //     this.totalFileSize += (filesize/1024);
    //   }

    //   if (this.totalFileSize > 2048) {
    //     this.isLargeFile = true;
    //   }
    // } else {
    //   Toast("No file selected");
    // }
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

  cleanFileHandler() {
    // this.btnDisable = true;
    // this.fileAvailable = false;
    // this.uploading = true;
    // $("#uploadocument").val("");
    // this.FilesCollection = [];
    // this.isLargeFile = false;
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
}

class KeySkillDetail {
  KeySkill: string = '';
}

class EmploymentDetail {
  Designation: string = '';
  YourOrganization: string = '';
  CurrentCompany: string = '';
  WorkingYear: number = 0;
  WorkingMonth: number = 0;
  WorkedYear: number = 0;
  CurrentSalary: string= ''
  CurrentSalaryLakh: number = 0;
}
class EducationDetail {

}
