import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  isLoaded: boolean  = false;

  constructor(
    private nav: iNavigation,
    private http: AjaxService) { }

  ngOnInit(): void {
    this.isLoaded = true;
  }
}