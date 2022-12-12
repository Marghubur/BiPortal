import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-annexure',
  templateUrl: './annexure.component.html',
  styleUrls: ['./annexure.component.scss']
})
export class AnnexureComponent implements OnInit {
  isPageLoading: boolean = false;
  active = 1;

  constructor() { }

  ngOnInit(): void {
  }

}
