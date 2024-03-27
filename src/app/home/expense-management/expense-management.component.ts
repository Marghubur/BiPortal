import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.scss']
})
export class ExpenseManagementComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
