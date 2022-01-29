import { AjaxService } from "src/providers/ajax.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
declare var $: any;

@Component({
  selector: "app-dynamic-table",
  templateUrl: "./dynamic-table.component.html",
  styleUrls: ["./dynamic-table.component.scss"]
})
export class DynamicTableComponent implements OnInit {
  TableHeader: Array<ColumnMapping> = [];
  PageSize: any = 10;
  configuration: tableConfig = null;
  IsEmptyRow: boolean = false;
  filter: filterConfig = null;
  activePage: number = 1;
  totalPages: number = 1;
  pages: Array<number> = [];
  previousButton: boolean = false;
  nextButton: boolean = true;
  totalRecords: number = 0;

  @Input()
  set config(value: tableConfig) {
    if (value != null) {
      this.configuration = value;
      this.TableHeader = value.header;
      this.InitFilterConfiguration();
    } else {
      this.SampleDisplay();
    }
  }

  @Output() clicked = new EventEmitter<any>();

  SampleDisplay() {
    this.configuration = new tableConfig();
    let sHeader: Array<ColumnMapping> = [
      { ColumnName: 'No Data', DisplayName: 'No Data' }
    ];
    this.configuration.header = sHeader;
    this.configuration.data = [
      {}
    ];
    this.TableHeader = this.configuration.header;
  }

  constructor(
    private ajax: AjaxService,
  ) {
    this.IsEmptyRow = false;
    this.filter = new filterConfig();
  }

  InitFilterConfiguration() {
    this.filter.currentPage = 1;
    this.filter.maxPageIndexs = 5;
    this.filter.pageSize = this.PageSize;
    if (this.configuration.data !== null && this.configuration.data.length > 0) {
      this.totalRecords = this.configuration.totalRecords;
      let index: number = Math.floor(Number(this.totalRecords / this.PageSize));
      this.filter.totalPages = index;
      if (this.totalRecords % this.PageSize > 0) {
        this.filter.totalPages = index + 1;
        this.totalPages = this.filter.totalPages;
      }

      let i = 1;
      while (i <= this.filter.totalPages) {
        if (this.filter.currentPage <= i && i <= (this.filter.currentPage + this.filter.maxPageIndexs - 1)) {
          this.pages.push(i);
        }
        i++;
      }
    }
  }

  generateNextPattern() {
    let currentIndex = this.filter.currentPage;
    if (this.filter.totalPages > currentIndex) {
      this.activePage = currentIndex + 1;
      this.filter.currentPage = this.activePage;
      this.pages = [];
      let index = 1;
      while (index <= this.filter.maxPageIndexs) {
        if ((currentIndex + index) <= this.filter.totalPages) {
          this.pages.push(currentIndex + index)
        }
        index++;
      }
    }

    this.managePageButton();
  }

  generatePrevPattern() {
    let currentIndex = this.filter.currentPage;
    if (currentIndex > 1) {
      this.activePage = currentIndex - 1;
      this.filter.currentPage = this.activePage;
      let reversePages = [];
      this.pages = [];
      let index = 1;
      while (index <= this.filter.maxPageIndexs) {
        if ((currentIndex - index) > 0) {
          reversePages.push(currentIndex - index)
        }
        index++;
      }
      this.pages = reversePages.reverse();
    }

    this.managePageButton();
  }

  managePageButton() {
    if (this.activePage <= this.filter.maxPageIndexs) {
      this.previousButton = false;
      if (this.filter.totalPages > this.filter.maxPageIndexs)
        this.nextButton = true;
      else
        this.nextButton = false;
    } else {
      this.previousButton = true;
      if (this.activePage < this.filter.totalPages)
        this.nextButton = true;
      else
        this.nextButton = false;
    }
  }

  nextPage() {
    if (this.activePage % this.filter.maxPageIndexs === 0) {
      this.generateNextPattern();
    } else {
      if (this.activePage < this.filter.totalPages) {
        this.activePage = this.activePage + 1;
        this.filter.currentPage = this.activePage;
      }
    }
  }

  prevPage() {
    if ((this.activePage - 1) % this.filter.maxPageIndexs === 0) {
      this.generatePrevPattern();
    } else {
      if (this.activePage > 1) {
        this.activePage = this.activePage - 1;
        this.filter.currentPage = this.activePage;
      }
    }
  }

  ngOnInit() {

  }

  navToNext(index: number) {
    this.activePage = index;
    this.filter.currentPage = this.activePage;
  }

  EditCurrent(e: any, fn: Function) {
    this.clicked.emit({ item: e, fn: fn });
  }
}

export class ColumnMapping {
  ClassName?: string = null;
  ColumnName: string = null;
  DisplayName: string = null;
  IsHidden?: boolean = false;
  PageName?: string = null;
  Style?: string = null;
}

export interface iconConfig {
  iconName: string;
  fn?: Function
}

export class tableConfig {
  header: Array<ColumnMapping> = [];
  data: Array<any> = [];
  link: Array<iconConfig> = [];
  templates: Array<any> = [];
  totalRecords?: number = null;
  isEnableAction?: boolean = false;
}

export class PaginationConfig {
  url: string = null;
  type: string = 'get';
  data: any = null;
}

export class filterConfig {
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 0;
  maxPageIndexs: number = 5
  searchQuery: string = null;
  pagingDetail: PaginationConfig = null;
}