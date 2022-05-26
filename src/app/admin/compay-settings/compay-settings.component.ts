import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-compay-settings',
  templateUrl: './compay-settings.component.html',
  styleUrls: ['./compay-settings.component.scss']
})
export class CompaySettingsComponent implements OnInit {
  ActivatedPage: number = 1;
  constructor() { }

  ngOnInit(): void {
    this.ActivatedPage = 1;
  }

  activePage(page: number) {
    switch (page) {
      case 2:
        this.ActivatedPage = 2;
        break;
      case 3:
        this.ActivatedPage = 3;
        break;
      default:
        this.ActivatedPage = 1;
        break;
    }
    var stepCount = document.querySelectorAll(".progress-step");
    var stepinfo = document.querySelectorAll(".step-info");
    for (let i=0; i <stepCount.length; i++) {
      stepCount[i].classList.remove('active');
      stepinfo[i].classList.remove('step-info-active');
    }
    stepCount[page-1].classList.add('active');
    stepCount[page-1].classList.add('step-info-active');
  }

}
