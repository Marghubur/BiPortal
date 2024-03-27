import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employeefinance',
  templateUrl: './employeefinance.component.html',
  styleUrls: ['./employeefinance.component.scss']
})
export class EmployeefinanceComponent implements OnInit {

  ngOnInit(): void {
    document.body.scroll({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling animation
    });
  }
  
}
