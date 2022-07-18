import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { Attendance, Timesheet } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.scss']
})
export class LeaveComponent implements OnInit {
  cachedData: any = null;
  active = 2;

  constructor(private nav: iNavigation) { }

  ngOnInit(): void {


  }

  activateMe(elemId: string) {
    switch(elemId) {
      case "attendance-tab":
        this.nav.navigate(Attendance, this.cachedData);
      break;
      case "timesheet-tab":
        this.nav.navigate(Timesheet, this.cachedData);
      break;
      case "leave-tab":
      break;
    }
  }
}
