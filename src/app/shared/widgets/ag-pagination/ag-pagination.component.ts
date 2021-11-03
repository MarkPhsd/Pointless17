import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import { Component, OnInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import { PagerService } from 'src/app/_services/system/agpager.service';

export interface paginationInfo {
  currentPage: number;
  totalPages : number;
  startPage  : number;
  endPage    : number;
  pages      : any[];
  noOfPages  : number;
}

@Component({
  selector: 'app-ag-pagination',
  templateUrl: './ag-pagination.component.html',
  styleUrls: ['./ag-pagination.component.scss'],
  providers: [PagerService]
})
export class AgPaginationComponent implements OnInit {

  @Input()   pageSize = 0;
  @Input()   gridApi: GridApi;
  @Input()   noOfPages = 0;
  @Input()   currentPage = 0
  @Output()  outputPageToGoto: EventEmitter<any> = new EventEmitter();
  @Output()  outputAPIToGoto : EventEmitter<any> = new EventEmitter();
  paginationPages = {totalPages: 0, startPage: 0, noOfPages: 0 } as  paginationInfo

  get PaginationPages() {
    return this.paginationPages;
  }

  // getPager(totalPages: number, currentPage: number = 0) {
  constructor(private pagerService: PagerService) { }

  ngOnInit(): void {
    console.log('')
  }


  ngOnChanges(changes: SimpleChange) {
    for (const propName in changes) {
      if (propName === 'noOfPages') {
        console.log('changes', changes)
        // this.paginationPages = this.totalPages ? this.pagerService.getPager(this.totalPages, 1) : {};
        const pages = []
        this.paginationPages = { totalPages: this.noOfPages, startPage: 0, noOfPages: this.noOfPages, currentPage: this.currentPage, endPage: this.noOfPages, pages: pages }
      }
    }
  }

  // get currentPage(): number {
  //   return this.gridApi ? this.gridApi.paginationGetCurrentPage() : 0;
  // }

  get totalPages(): number {
    return this.noOfPages;
  }

  goToPage(index: number) {
    // this.gridApi.paginationGoToPage(index);
    this.paginationPages = this.pagerService.getPager(this.noOfPages, index  );
    // console.log('goToPage', index)
    this.outputPageToGoto.emit(this.paginationPages.currentPage )
    this.outputAPIToGoto.emit(this.gridApi)
  }

  goToNext() {
    // this.gridApi.paginationGoToNextPage();

    if (this.currentPage == this.noOfPages  || this.currentPage  +1 > this.noOfPages ) {
      console.log('no page add', this.currentPage )
      this.paginationPages = this.pagerService.getPager(this.noOfPages, this.currentPage);
    } else {
      console.log('page add', this.currentPage + 1)
      this.paginationPages = this.pagerService.getPager(this.noOfPages, this.currentPage +1);
    }

    this.outputPageToGoto.emit( this.paginationPages.currentPage )
    this.outputAPIToGoto.emit(this.gridApi)
    // this.currentPage = this.paginationPages.currentPage;

  }

  goToPrevious() {
    // this.gridApi.paginationGoToPreviousPage();
    // if (this.currentPage ==1 ) { return}
    // this.paginationPages = this.pagerService.getPager(this.noOfPages, this.currentPage -1);


    if (this.currentPage == 1 || this.currentPage < 1 ) {

      this.paginationPages = this.pagerService.getPager(this.noOfPages, this.currentPage );
    } else {
      this.paginationPages = this.pagerService.getPager(this.noOfPages, this.currentPage -1 );
    }

    this.outputPageToGoto.emit( this.paginationPages.currentPage)
    this.outputAPIToGoto.emit(this.gridApi)

  }

}
