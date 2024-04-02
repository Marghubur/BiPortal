import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-placeholder',
  templateUrl: './page-placeholder.component.html',
  styleUrls: ['./page-placeholder.component.scss']
})
export class PagePlaceholderComponent implements OnInit {
  matrixInput: PlaceholderMatrix = { 
    columns: 1,
    rows: 10
  };
  isTableStyle: boolean = true;
  rows: Array<number> = [];
  columns: Array<number> = [];

  @Input()
  set Matrix(mat: PlaceholderMatrix) {
    if(mat) {
      this.matrixInput = mat;      
    }
  }

  @Input()
  set IsCardStyle(isCard: boolean) {
    this.isTableStyle = !isCard;
  }

  buildMatrix() {
    if (this.matrixInput.columns && this.matrixInput.rows) {
      let i = 0;
      while(i < this.matrixInput.rows) {
        this.rows.push(i + 1);
        i++;
      }

      i = 0;
      while(i < this.matrixInput.columns) {
        this.columns.push(i + 1);
        i++;
      }
    }
  }

  ngOnInit(): void {
    this.buildMatrix()
  }
}

export interface PlaceholderMatrix {
  rows: number,
  columns: number
}