import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employeefinance',
  templateUrl: './employeefinance.component.html',
  styleUrls: ['./employeefinance.component.scss']
})
export class EmployeefinanceComponent implements OnInit {

  ngOnInit(): void {
    document.body.scrollTop = 0;
  }
  
}
