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
  isPaginationUpdated: boolean = false;
  _pagination: Filter = new Filter();
  public pages: number [] = [];
  activePage: number;

  @Input()
  set pagination(value: Filter) {
    this._pagination = value;
    this.updatePagination();
  }

  @Output() onPageChange: EventEmitter<Filter> = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
  }

  private updatePagination() {
    this.pageCount = 0;
    if(this._pagination != null) {
      this.getPageCount();
      this.pages = this.getArrayOfPage(this.pageCount, this._pagination.PageIndex);
      this.activePage = this._pagination.ActivePageNumber;
    } else {
      this.pages = this.getArrayOfPage(1, 1);
      this.activePage = 1;
    }
    this.isPaginationUpdated = true;
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

  private calculatePagination(currentPageIndex: number) {
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
        pageArray.push(i);
        this.lastPage = i;
      }
      this.startPage = pageIndex;
    }

    return pageArray;
  }

  onNextPage(pageNumber: number): void {
    this.isPaginationUpdated = false;
    this._pagination.ActivePageNumber = pageNumber;
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

    this.pages = this.getArrayOfPage(this.pageCount, pageNumber);
    this.isPaginationUpdated = true;
  }

  onPreviousPage(pageNumber: number): void {
    this.isPaginationUpdated = false;
    this._pagination.ActivePageNumber = pageNumber;
    if (pageNumber >= this.startPage) {
        this.activePage = pageNumber;
        this._pagination.PageIndex = this.activePage;
        this.calculatePagination(this.activePage);
        this.onPageChange.emit(this._pagination);
    } else if(pageNumber > 0) {
      this.activePage = pageNumber;
      if(pageNumber - this._pagination.ActivePageNumber > 0) {
        pageNumber = pageNumber - this._pagination.ActivePageNumber;
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

    this.isPaginationUpdated = true;
  }
}
