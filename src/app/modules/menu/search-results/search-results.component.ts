import { Component,  Inject,  Input, Output, OnInit, Optional,OnDestroy ,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { AWSBucketService, MenuService, MessageService, OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { IMenuItemsResultsPaged,  } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy,AfterViewInit {

  //paging elements
  items = [];
  pageOfItems: Array<any>;
  lengthOfArray: number

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;
  columnsToDisplay = ['name'];
  public searchForm: FormGroup;


  search: string;
  // @Input() menuItems$: Observable<IMenuItem[]>;
  showSearch$: Observable<any>;

    //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  searchPhrase:         Subject<any> = new Subject();
  get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  //search with debounce
  @Input() menuItems$              : Subject<IMenuItemsResultsPaged> = new Subject();
  menuItems: IMenuItem[];
  _menuItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  //AgGrid
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 25
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             = 0;
  islastpage              = 0;

  constructor(orderService: OrdersService ,
              private awsBucket: AWSBucketService,
              private router: Router,
              public route: ActivatedRoute,
              private menuService: MenuService,
              private fb: FormBuilder,
              private messageService: MessageService,
              private siteService: SitesService,
      ) {
      try {
        this.search = this.route.snapshot.paramMap.get('search');

      } catch (error) {
        console.log('error searching', error)
      }
  }

  ngOnInit(): void {
    // send message to subscribers via observable subject
    this.messageService.sendMessage('hide');
    if (!this.search) { this.search = ''}
    this.searchForm = this.fb.group( {
      searchProducts: ''
    });
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(500),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
        this.refreshSearch();
      })
    )
    .subscribe();
  }


  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.fillArray(this.lengthOfArray)
  }

  fillArray(lengthOfArray:any) {
    this.items = Array(lengthOfArray).fill(0).map((x, i) => ({ id: (i + 1), name: `Item ${i + 1}`}));
  }

  onChangePage(pageOfItems: Array<any>) {
    // update current page of items
    this.pageOfItems = pageOfItems;
  }

  getImageUrl(url: string){ }

  ngOnDestroy() {
    this.messageService.sendMessage('show');
    if (this.menuService.menuItems$) {
      this.menuService.menuItems$.subscribe().unsubscribe()
    }
    this.onDestroy.next();
  }

  //search method for debounce on form field
  displayFn(search) {
    this.selectItem(search)
    return search;
  }

  //search method for debounce on form field
  selectItem(search){
  if (search) {
    this.currentPage = 1
    this.searchPhrase.next(search)
    }
  }

   //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<IMenuItemsResultsPaged> {
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initProductSearchModel();
    this._menuItems$         = this.getRowData(productSearchModel);
    return this._menuItems$
  }

   //ag-grid standard method
  getRowData(productSearchModel: ProductSearchModel):  Observable<IMenuItemsResultsPaged>  {
    const site = this.siteService.getAssignedSite()
    const results$ = this.menuService.getMenuItemsBySearchPaged(site, productSearchModel);
    console.log('refreshSearch')
    results$.subscribe( data => {
       this.menuItems  = data.results;
      },err => {
        console.log('error', err)
      }
    )
    return results$
  }

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    return this.currentPage
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initProductSearchModel(): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;
    let search                    = ''
    if (this.searchProductsValue.value)
    {
      search = this.searchProductsValue.value
      console.log(search)
    }
    // if (this.categoryID )       { productSearchModel.categoryID  = this.categoryID.toString(); }
    // if (this.productTypeSearch) { productSearchModel.type        = this.productTypeSearch; }
    // if (this.brandID)           { productSearchModel.brandID     = this.brandID.toString(); }

    productSearchModel.name       = search
    productSearchModel.barcode    = search
    productSearchModel.pageSize   = this.pageSize
    productSearchModel.pageNumber = this.currentPage
    return productSearchModel
  }

}
