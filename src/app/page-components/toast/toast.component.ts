import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  className: string = "";
  errorMessage: string = "";
  toastElem: any = null;

  constructor() { }

  ngOnInit(): void {

  }

  Toast() {
    this.toastElem = document.getElementById("app-toast");
    this.toastElem.classList.add("success-toast");
  }

  ErrorToast(msg: string) {
    this.toastElem.classList.add("error-toast");
    this.errorMessage = msg;
  }

  closeToast() {
    let $Toast = document.getElementById("toast");
    $Toast.classList.add("d-none");
  }
}
