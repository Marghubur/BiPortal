import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  closeToast() {
    let $Toast = document.getElementById("toast");
    $Toast.classList.add("d-none");
  }
}
