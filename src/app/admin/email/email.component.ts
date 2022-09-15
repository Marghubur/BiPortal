import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { Files } from '../documents/documents.component';
declare var $: any;

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  emailForm: FormGroup;
  isSubmitted: boolean = false;
  isLoading: boolean = false;
  isMinimize: boolean = false;
  toEmail: Array<string> = [];
  ccEmail: Array<string> = [];
  bccEmail: Array<string> = [];
  totalFileSize: number = 0;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  isLargeFile: boolean = false;
  FileDocuments: Array<any> = [];
  isUploading: boolean = false;
  currentUser: any = null;

  constructor(private fb:FormBuilder,
              private http:AjaxService,
              private nav:iNavigation) { }

  ngOnInit(): void {
    let data = this.nav.getValue();
    if (data) {
      this.currentUser = data;
    }
    this.initForm();
  }

  initForm() {
    this.emailForm = this.fb.group({
      To: new FormControl('', [Validators.required]),
      CC: new FormControl(''),
      BCC: new FormControl(''),
      Subject: new FormControl('', [Validators.required])
    })
  }

  get f() {
    return this.emailForm.controls;
  }

  sendEmailRequest() {
    this.isSubmitted = true;
    this.isLoading = true;
    if (this.emailForm.invalid) {
      this.isLoading = false;
      return;
    }

    let formData = new FormData();
    let value = {
      To: this.toEmail,
      Subject: this.emailForm.get('Subject').value,
      Body: (<HTMLInputElement>document.getElementById('emailbody')).innerHTML,
      CC: this.ccEmail,
      BCC: this.bccEmail
    };
    if (this.toEmail != null) {
      if (this.FileDocumentList.length > 0) {
        let index = 0;
        while (index < this.FileDocumentList.length) {
          formData.append(this.FileDocumentList[index].FileName, this.FilesCollection[index]);
          index++;
        }
      }
      formData.append("fileDetail", JSON.stringify(this.FileDocumentList));
      formData.append("mailDetail", JSON.stringify(value));
      this.http.post("Email/SendEmailRequest", value).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          $('#composeMailModal').modal('hide');
          Toast("Email send successfully");
          this.isLoading = false;
        }
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      this.isLoading = false;
    }
  }

  composeMailPopUp() {
    let elem = document.getElementById('composeMailModal');
    let modalClass = elem.querySelector('.modal-dialog').classList;
    document.querySelector('div[data-name="Cc-address"]').classList.add('d-none');
    document.querySelector('div[ data-name="Bcc-address"]').classList.add('d-none');
    document.querySelector('div[data-name="Add-Cc-btn"]').classList.remove('d-none');
    document.querySelector('div[data-name="Add-Bcc-btn"]').classList.remove('d-none');
    if (modalClass.contains('modal-fullscreen'))
      this.compressMailbox()
    this.initForm();
    $('#composeMailModal').modal('show');
  }

  minimizeMailBox() {
    if (this.isMinimize == false)
      this.smallMailBox();
    else
      this.normalMailBox();
    this.isMinimize = !this.isMinimize;
  }

  smallMailBox() {
    $('#composeMailModal').closest('.modal').find('.modal-body').slideUp();
    $('#composeMailModal').closest('.modal').find('.modal-footer').slideUp();
    $('#composeMailModal').closest('.modal').animate({'left':0,'bottom':0});
    $('.modal-dialog-centered')[0].classList.remove('align-items-center', 'modal-dialog-margin');
    $('.modal-dialog-centered')[0].classList.add('align-items-end', 'm-0');
  }

  normalMailBox() {
    $('#composeMailModal').closest('.modal').find('.modal-body').slideDown();
    $('#composeMailModal').closest('.modal').find('.modal-footer').slideDown();
    $('#composeMailModal').closest('.modal').animate({'left':0,'bottom':'50%'});
    $('.modal-dialog-centered')[0].classList.remove('align-items-end', 'm-0');
    $('.modal-dialog-centered')[0].classList.add('align-items-center', 'modal-dialog-margin');
  }

  maximizeMailbox() {
    if (this.isMinimize == true)
      this.normalMailBox();
    let elem = document.getElementById('composeMailModal');
    let modalClass = elem.querySelector('.modal-dialog').classList;
    if (modalClass.contains('modal-lg')) {
      elem.querySelector('.modal-dialog').classList.remove('modal-lg');
      elem.querySelector('.modal-dialog').classList.add('modal-fullscreen', 'p-4');
      elem.querySelector('.fa-window-maximize').classList.add('fa-compress');
      elem.querySelector('.fa-window-maximize').classList.remove('fa-window-maximize');
      elem.querySelector('.small-message-box').classList.add('large-message-box');
      elem.querySelector('.large-message-box').classList.remove('small-message-box');
      elem.querySelector('.fa-minus').classList.add('d-none');
    } else {
      elem.querySelector('.fa-minus').classList.remove('d-none');
      this.compressMailbox();
    }
  }

  compressMailbox() {
    let elem = document.getElementById('composeMailModal');
    elem.querySelector('.modal-dialog').classList.remove('modal-fullscreen', 'p-4');
    elem.querySelector('.modal-dialog').classList.add('modal-lg');
    elem.querySelector('.fa-compress').classList.add('fa-window-maximize');
    elem.querySelector('.fa-compress').classList.remove('fa-compress');
    elem.querySelector('.large-message-box').classList.add('small-message-box');
    elem.querySelector('.small-message-box').classList.remove('large-message-box');
  }

  emailAddress() {
    document.querySelector('label[for="to-email-address"]').classList.remove('d-none');
    document.querySelector('div[data-name="Cc-Bcc-address"]').classList.remove('d-none');
    if (!document.querySelector('div[data-name="Bcc-address"]').classList.contains('d-none') || !document.querySelector('div[data-name="Cc-address"]').classList.contains('d-none'))
        document.querySelector('div[data-name="Cc-Bcc-address"]').classList.add('d-none');
  }

  // removeToLabel() {
  //   document.querySelector('label[for="to-email-address"]').classList.add('d-none');
  //   document.querySelector('div[data-name="Cc-Bcc-address"]').classList.add('d-none');
  // }

  otherAddress(e: any, address: string) {
    e.target.closest('div').classList.add('d-none');
    if (address == 'Cc-address') {
      document.querySelector('div[data-name="Cc-address"]').classList.remove('d-none');
      if (!document.querySelector('div[data-name="Bcc-address"]').classList.contains('d-none'))
        document.querySelector('div[data-name="Add-Bcc-btn"]').classList.add('d-none');
    }
    else if (address == 'Bcc-address') {
      document.querySelector('div[data-name="Bcc-address"]').classList.remove('d-none');
      if (!document.querySelector('div[data-name="Cc-address"]').classList.contains('d-none'))
        document.querySelector('div[data-name="Add-Cc-btn"]').classList.add('d-none');
    }

  }

  addEmailChip(e: any, name: string) {
    let value = (e.target.value).replace(' ', '');
    let validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (value && value.match(validRegex)) {
      switch (name) {
        case 'to-emails':
          this.toEmail.push(value);
          break;
        case 'cc-emails':
          this.ccEmail.push(value);
          break;
        case 'bcc-emails':
          this.bccEmail.push(value);
          break;
      }
      e.target.value = '';
    } else {
      ErrorToast("Please enter a valid email.");
    }
  }

  removeToEmail(i: number, name: string) {
    if (name != null && i >= 0) {
      switch (name) {
        case 'to-emails':
          this.toEmail.splice(i, 1);
          break;
        case 'cc-emails':
          this.ccEmail.splice(i, 1);
          break;
        case 'bcc-emails':
          this.bccEmail.splice(i, 1);
          break;
      }
    }
  }

  fireBrowserFile() {
    $('#fileAttachment').click();
  }

  uploadProfilePicture(fileinput: any) {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    let selectedFile = fileinput.target.files;
    if (selectedFile.length > 0) {
      let index = 0;
      let file = null;
      this.isUploading = false;
      while (index < selectedFile.length) {
        file = <File>selectedFile[index];
        let item: Files = new Files();
        item.FileName = file.name;
        item.FileType = file.type;
        item.FileSize = (Number(file.size)/1024);
        item.Email = this.currentUser.Email;
        item.FileExtension = file.type;
        item.DocumentId = 0;
        item.FilePath = '';
        item.ParentFolder = '';
        item.UserId = this.currentUser.UserId;
        item.UserTypeId = this.currentUser.UserTypeId;
        this.FileDocumentList.push(item);
        this.FilesCollection.push(file);
        index++;
      }

      this.totalFileSize = 0;
      for(let i=0; i<selectedFile.length; i++) {
        let filesize = Number(this.FilesCollection[i].size)
        this.totalFileSize += (filesize/1024);
      }

      if (this.totalFileSize > 5120) {
        this.isLargeFile = true;
      }
    }
  }

  getSelectedText(e: any) {
    let value = e.view.getSelection().toString();
    if (value && value.length > 0) {
      let text = document.getElementById('emailbody').innerHTML;
      let boldText = "<b>" + value + "</b>";
      document.getElementById('emailbody').innerHTML = text.replace(value, boldText);
    }
  }
}
