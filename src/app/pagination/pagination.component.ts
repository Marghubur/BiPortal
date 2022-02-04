import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Filter } from 'src/providers/userService';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  pageCount: number = 0;
  lastPage: number = 0;
  startPage: number = 0;
  _pagination: Filter = new Filter();

  @Input() set pagination(value: Filter) {
    this._pagination = value;
  }

  @Output() onPageChange: EventEmitter<Filter> = new EventEmitter();

  public pages: number [] = [];
  activePage: number;

  constructor() { }

  ngOnInit(): void {
    this.pageCount = 0;
    if(this._pagination != null) {
      this.getPageCount();
      this.pages = this.getArrayOfPage(this.pageCount, this._pagination.PageIndex);
      this.activePage = this._pagination.PageIndex;
    } else {
      this.pages = this.getArrayOfPage(1, 1);
      this.activePage = 1;
    }
  }

  private  getPageCount() {
    this.pageCount = 0;

    if (this._pagination.TotalRecords > 0 && this._pagination.PageSize > 0) {
      this.activePage = this._pagination.PageIndex;
      const pageCount = this._pagination.TotalRecords / this._pagination.PageSize;
      const roundedPageCount = Math.floor(pageCount);
      this.pageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
      this.calculatePagination(this.activePage);
    }
  }

  calculatePagination(currentPageIndex: number) {
    this._pagination.StartIndex = (currentPageIndex - 1) * 10 + 1;
    this._pagination.EndIndex = this._pagination.PageSize * currentPageIndex;
    if(this._pagination.EndIndex > this._pagination.TotalRecords) {
      this._pagination.EndIndex = this._pagination.TotalRecords;
    }
  }

  private getArrayOfPage(pageCount: number, pageIndex: number): number [] {
    const pageArray = [];
    if (pageCount > 0) {
        for(let i = 1 ; i <= pageCount; i++) {
          if(i >= pageIndex) {
            pageArray.push(i);
            this.lastPage = i;
            if(pageArray.length >= this._pagination.ShowPageNo)
              break;
          }
        }
        this.startPage = pageIndex;
    }

    return pageArray;
  }

  onClickPage(pageNumber: number): void {
      if (pageNumber >= 1 && pageNumber <= this.lastPage) {
          this.activePage = pageNumber;
          this._pagination.PageIndex = this.activePage;
          this.calculatePagination(this.activePage);
          this.onPageChange.emit(this._pagination);
      } else if(pageNumber > this.pages.length && pageNumber <= this.pageCount) {
        this.pages = this.getArrayOfPage(this.pageCount, pageNumber);
        if(this.pages.length > 0) {
          this.activePage = pageNumber;
          this.pagination.PageIndex = this.activePage;
          this.calculatePagination(this.activePage);
          this.onPageChange.emit(this.pagination);
        }
      }
  }

  onPreviousPage(pageNumber: number): void {
    if (pageNumber >= this.startPage) {
        this.activePage = pageNumber;
        this._pagination.PageIndex = this.activePage;
        this.calculatePagination(this.activePage);
        this.onPageChange.emit(this._pagination);
    } else if(pageNumber > 0) {
      this.activePage = pageNumber;
      if(pageNumber - this._pagination.ShowPageNo > 0) {
        pageNumber = pageNumber - this._pagination.ShowPageNo;
      } else {
        pageNumber = 1;
      }
      this.pages = this.getArrayOfPage(this.pageCount, pageNumber);
      if(this.pages.length > 0) {
        this._pagination.PageIndex = this.activePage;
        this.calculatePagination(this.activePage);
        this.onPageChange.emit(this._pagination);
      }
    }
}
}
