import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
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

  constructor(private fb:FormBuilder,
              private http:AjaxService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.emailForm = this.fb.group({
      To: new FormControl('', [Validators.required]),
      CC: new FormControl(''),
      BCC: new FormControl(''),
      Subject: new FormControl('', [Validators.required]),
      Body: new FormControl('')
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

    let to = (this.emailForm.get('To').value).split(',');
    let cc = (this.emailForm.get('CC').value).split(',');
    let bcc = (this.emailForm.get('BCC').value).split(',');
    let value = {
      To: to,
      Subject: this.emailForm.get('Subject').value,
      Body: this.emailForm.get('Body').value,
      CC: cc,
      BCC: bcc
    };
    this.http.post("Email/SendEmailRequest", value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        $('#composeMailModal').modal('hide');
        Toast("Email send successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
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
  }

  normalMailBox() {
    $('#composeMailModal').closest('.modal').find('.modal-body').slideDown();
    $('#composeMailModal').closest('.modal').find('.modal-footer').slideDown();
    $('#composeMailModal').closest('.modal').animate({'left':0,'bottom':'50%'});
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
    } else {
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

}
