import { Component,  Inject,  Input, Output,OnChanges, OnInit, Optional, ViewChild ,ElementRef,
  AfterViewInit, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { IProductSearchResults, IProductSearchResultsPaged, MenuService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';

@Component({
  selector: 'app-reward-type-panel',
  templateUrl: './reward-type-results-selector.component.html',
  styleUrls: ['./reward-type-results-selector.component.scss']
})
export class RewardTypeResultsSelectorComponent implements OnInit, OnChanges,AfterViewInit {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchItems$              : Subject<IProductSearchResults[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

  @Input()  searchForm: FormGroup;
  @Input()  inputForm : FormGroup;
  @Input()  item      : IPriceSchedule;
  lastSelectedItem    : DiscountInfo;
  itemDiscounts       : DiscountInfo[] = [];

  selectedRows              : any;
  selected                  : any;
  items                     : IProductSearchResults[];
  @Input() selectedCategory : any;
  @Input() selectedItemType : any;
  @Input() selectedBrand    : any;
  site: ISite;

  accordionStep = 0;
  //AgGrid
  params                  : any;
  private gridApi         : GridApi;
  // private gridColumnApi   : GridAlignColumnsDirective;
  gridOptions             : any
  columnDefs              = [];
  defaultColDef           ;
  frameworkComponents     : any;
  rowSelection            : any;
  rowDataClicked1         = {};
  rowDataClicked2         = {};
  rowData:                any[];
  pageSize                = 20
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  rowCount                = 20
  startRow                = 0;
  endRow                  = 0;
  //AgGrid
  agtheme = 'ag-theme-material';

  get itemDiscountsControl() : FormArray {
    return this.inputForm.get('discountItems') as FormArray;
  }

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
      this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
        this.priceScheduleTracking = data
        this.itemDiscounts         = data.itemDiscounts;
      }
    )
  }

  constructor(
    private menuService             : MenuService,
    private siteService             : SitesService,
    private fb                      : FormBuilder,
    private agGridService           : AgGridFormatingService,
    private fbPriceScheduleService  : FbPriceScheduleService,
    private priceScheduleDataService: PriceScheduleDataService,
  )
  {
    this.searchForm = this.fb.group( { itemName: ''});
    this.initGridOptions();
  }

  ngOnInit() {
    this.rowSelection   = 'multiple'
    this.initSubscriptions();
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
          filter(Boolean),
          debounceTime(500),
          distinctUntilChanged(),
          tap((event:KeyboardEvent) => {
            const search  = this.input.nativeElement.value
            this.refreshSearch(search);
          }
        )
      )
    .subscribe();
  }

  ngOnChanges() {
    this.currentPage        = 1;
    this.navItemsByCategory()
    this.refreshSearch('');
  }

  initGridOptions()  {
    this.frameworkComponents  = this.agGridService.initFrameworkComponents();
    this.defaultColDef        = this.agGridService.initDefaultColumnDef();
    this.rowSelection         = 'multiple';
    this.columnDefs           = this.initColumnDefs();
    this.gridOptions = {
      pagination: true,
      paginationPageSize: this.pageSize,
      cacheBlockSize: 20,
      maxBlocksInCache: 50,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 0,
      columnDefs: this.columnDefs,
      rowSelection: 'multiple',
    }
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return  `Add`;
      else return   `Add`;
  }

  initColumnDefs() {
    return  [
      {headerName: 'Name', field: 'name', sortable: true, width: 300, minWidth: 300},
      {
        field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.selectItemFromGrid.bind(this),
          label: `<span><i class="material-icons">edit</i></span> Select`,
          getLabelFunction: this.getLabel.bind(this),
          btnClass: 'btn btn-primary btn-sm'
        },
        minWidth: 65,
        width: 65
      },
    ]
  }

  //the category in this component comes from input
  getCategoryID(): number  {
    if (!this.selectedCategory) { return }
    if (this.selectedCategory) {
      if (this.selectedCategory.categoryID != null){
        return this.selectedCategory.categoryID;
      }
      if (this.selectedCategory.itemID != null){
        return this.selectedCategory.itemID;
      }
    }
    return 0
  }

  getSelectedItemTypeID() {
    if (!this.selectedItemType) {
      return
    }
    if (this.selectedItemType) {
      if (this.selectedItemType.itemTypeID != null){
        return this.selectedItemType.itemTypeID;
      }
    }
    return 0
  }

  onSearchGridReady(params) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
    if (!this.searchItems$) {
      this.navItemsByCategory()
    }
  }

  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    return this.currentPage
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IProductSearchResultsPaged>  {
    this.currentPage         = this.setCurrentPage(startRow, endRow)
    const productSearchModel = this.initSearchModel();
    const site               = this.siteService.getAssignedSite()
    return this.menuService.getProductsBySearchForLists(site, productSearchModel)
  }

  //ag-grid standard method
  onGridReady(params: any) {
    if (params)  {
      this.params        = params
      this.gridApi       = params.api;
      // this.gridColumnApi = params.columnApi;
    }

    if (params == undefined) {
      console.log('params is not defined')
      return
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
        const items$ =  this.getRowData(params, params.startRow, params.endRow)
        items$.subscribe(data =>
          {
            this.rowData = data.results
            params.successCallback(data.results)
          }
        );
       }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  //ag-grid standard method.
  getDataSource(params) {
    return {
      getRows: (params: IGetRowsParams) => {
        const items$ = this.getRowData(params, params.startRow, params.endRow)
        items$.subscribe(data =>
          {
            params.successCallback(data.results)
            this.rowData = data.results
          }, err => {
            console.log(err)
          }
        );
      }
    };
  }

  listItemsInCategory(){
    this.navItemsByCategory()
  }

  navItemsByCategory(): Observable<IProductSearchResults[]> {
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    return this.getData(site, productSearchModel)
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(searchPhrase: string): Observable<IProductSearchResults[]> {
    if (!this.params) { return }
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;
    this.onGridReady(this.params)
    return this._searchItems$
  }

  getData(site, productSearchModel): Observable<IProductSearchResults[]> {
     const menu$  = this.menuService.getProductsBySearchForLists(site, productSearchModel)
    menu$.subscribe( data => {
      this.rowData = data.results
      if (this.params) { this.getDataSource(this.params); }
      this.searchItems$.next(data.results)
    })
    return  this.searchItems$
  }

  // selectedBrand
  getBrandID(): number  {
    if (!this.selectedBrand) { return 0 }
    if (this.selectedBrand) {
      if (this.selectedBrand.id != null){
        return this.selectedBrand.id;
      }
    }
    return 0
  }

  initSearchModel(): ProductSearchModel {
    const categoryID = this.getCategoryID();
    const brandID  = this.getBrandID();

    return this.agGridService.initProductSearchModel(
        categoryID,
        this.input.nativeElement.value,
        this.pageSize,
        this.currentPage,
        this.getSelectedItemTypeID(),
        brandID
    );
  }

  //for multiselect display of selections.
  onSelectionChanged(event) {
    let selectedRows = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow = 5;
    let selected = []
    selectedRows.forEach(function (selectedRow, index) {
      if (index >= maxToShow) {  return;   }
      if (index > 0) {  selectedRowsString += ', ';}
      selectedRowsString += selectedRow.name;
    });

    selectedRows.forEach(data=>{
      selected.push(data.id)
    })

    if (selectedRows.length > maxToShow) {
      let othersCount = selectedRows.length - maxToShow;
      selectedRowsString +=
        ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    this.selected = selected
  }

  removeItemFB(inputForm: FormGroup, item: DiscountInfo, index: number) {
    if (!inputForm || !item) {return}
    this.item.requiredItems = this.itemDiscounts;
    let i = 0
    if ( index != -1 ) {
      this.fbPriceScheduleService.deleteDiscountItem(index, this.inputForm)
      this.lastSelectedItem = null
      return
    }
  }

  selectItem(item) {
    if (item) {
      console.log(item)
    }
  }

  selectItemFromGrid(e) {
    if (e.rowData.id)  {
      this.enableItem(e.rowData);
      this.lastSelectedItem = e.rowData;
    }
  }

  enableItem(item) {

    this.lastSelectedItem = null
    if (!item)                 { return }
    if (item.id == undefined)  { return }

    const itemID = parseInt( item.id );

    if (this.itemDiscounts) {
      const array = this.itemDiscounts
      const index = array.findIndex( data =>  data.itemID === itemID)

      console.table(array)
      console.log('index', index)
      if (index == -1){
        const newItem    =  {} as DiscountInfo;
        newItem.itemID   =  itemID;
        newItem.name     =  item.name;
        newItem.quantity =  1;
        this.itemDiscounts.push(newItem)
        this.applyChanges(newItem);
        this.lastSelectedItem = newItem
      } else {

        // this.itemDiscounts = this.itemDiscounts.splice(index, 1)
        // this.applyChanges(null);
        // this.lastSelectedItem = null
      }

    }
  }

  applyChanges(item: DiscountInfo) {
    this.priceScheduleTracking.itemDiscounts = this.itemDiscounts;
    console.log('')
    this.fbPriceScheduleService.addDiscountItems(this.inputForm, this.itemDiscounts)
    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    this.lastSelectedItem  = item
  }

  //requiredCategories
  isCategoryEnabled(sub) {
    const index = this.itemDiscounts.findIndex( data => data.itemID == sub.id )
    if (index == -1){ return false }
    if (index != -1){ return true  }
  }

}
