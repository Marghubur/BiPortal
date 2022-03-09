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
  fileDetail: Array<any> = [];

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

  ngOnInit(): void {
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
    this.manageUserForm = this.fb.group({
      FirstName: new FormControl("", [Validators.required]),
      LastName: new FormControl("", [Validators.required]),
      Mobile: new FormControl("0000000000"),
      Email: new FormControl("xxxxx@xxx.com"),
      State: new FormControl(""),
      City: new FormControl(""),
      Address: new FormControl(""),
      Dob: new FormControl(new Date()),
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
     this.fileDetail = fileInput.target.files[0];
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
    var input = document.getElementsByTagName('input');
    var txtarea = document.getElementsByTagName("textarea");
    var select = document.getElementsByTagName("select");
    let i =0;
    while(i < input.length) {
      input[i].classList.remove('custom-form-control');
      input[i].removeAttribute("readonly");
      i++;
    }
    while(i < txtarea.length) {
      txtarea[i].classList.remove('custom-form-control');
      txtarea[i].removeAttribute("readonly");
      i++;
    }
    while(i < select.length) {
      select[i].classList.remove('custom-form-control');
      select[i].removeAttribute("disabled");
      i++;
    }
    this.isEdited = true;
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

// export class EmployeeDetail {
//   EmployeeUid: number = 0;
//   FirstName: string = null;
//   LastName: string = null;
//   Mobile: string = null;
//   Email: string = null;
//   BranchName: string = null;
//   SecondaryMobile: string = null;
//   FatherName: string = null;
//   MotherName: string = null;
//   SpouseName: string = null;
//   State: string = null;
//   City: string = null;
//   Pincode: number = null;
//   Address: string = null;
//   PANNo: string = null;
//   AadharNo: string = null;
//   AccountNumber: string = null;
//   BankName: string = null;
//   IFSCCode: string = null;
//   Domain: string = null;
//   Specification: string = null;
//   ExprienceInYear: number = null;
//   LastCompanyName: string = null;
//   IsPermanent: boolean = false;
//   AllocatedClientId: number = null;
//   AllocatedClientName: string = null;
//   ActualPackage: number = null;
//   FinalPackage: number = null;
//   TakeHomeByCandidate: number = null;
// }
