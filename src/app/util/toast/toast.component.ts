import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  className: string = "";
  errorMessage: string = "";
  constructor() { }

  ngOnInit(): void {
  }

  Toast() {
    this.className = "success-toast";
  }

  ErrorToast(msg: string) {
    this.className = "success-toast";
    this.errorMessage = msg;
  }

  closeToast() {
    let $Toast = document.getElementById("toast");
    $Toast.classList.add("d-none");
  }
}
