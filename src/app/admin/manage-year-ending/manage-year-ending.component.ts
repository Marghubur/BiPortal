import { Component, OnInit } from '@angular/core';
import { Attendance, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-manage-year-ending',
  templateUrl: './manage-year-ending.component.html',
  styleUrls: ['./manage-year-ending.component.scss']
})
export class ManageYearEndingComponent implements OnInit {
  configPage: number =1;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
  }

  finalizeModal() {
    $('#yearEndFinalizeModal').modal('show');
  }

  savePendingLeave() {
    this.configPage = this.configPage + 1;
    this.activeYearEndPage(this.configPage);
  }

  activeYearEndPage(pagenumber: number) {
    if (pagenumber > 0 && pagenumber <= 4) {
      this.configPage = pagenumber;
      let elem = document.querySelectorAll('div[name="tab-index"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].classList.remove('active-index');
        elem[i].classList.remove('submitted-index');
      };
      document.querySelector(`div[index='${pagenumber}']`).classList.add('active-index');
      if (pagenumber > 1) {
        for (let i = 0; i < this.configPage-1; i++) {
          elem[i].classList.add('submitted-index');
        }
      }
    }
  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
        this.nav.navigate(Attendance, null);
      break;
      case "timesheet-tab":
        this.nav.navigate(Timesheet, null);
      break;
      case "leave-tab":
      break;
    }
  }

}
