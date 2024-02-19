import { Component,  Inject,  Input, Output,OnChanges, OnInit, Optional, ViewChild ,ElementRef,
  AfterViewInit, EventEmitter } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { IItemBasicB, IProductSearchResults, IProductSearchResultsPaged, MenuService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
function myComparator(value1, value2) {
  if (value1 === null && value2 === null) {
    return 0;
  }
  if (value1 === null) {
    return -1;
  }
  if (value2 === null) {
    return 1;
  }
  return value1 - value2;
}
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
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  action$: Observable<any>;
  categories: IMenuItem[];
  subCategories: IMenuItem[];
  subCategories$ : Observable<IMenuItem[]>;
  subCategoriesList: IMenuItem[];
  categoriesList: IMenuItem[];
  departmentsList: IMenuItem[];
  categories$      : Observable<IMenuItem[]>;
  departments$     : Observable<IMenuItem[]>;
  productTypes$    : Observable<IItemBasicB[]>;
  categoryID: number;
  subCategoryID: number;
  
  searchItems$              : Subject<IProductSearchResults[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

  @Input()  searchForm: UntypedFormGroup;
  @Input()  inputForm : UntypedFormGroup;
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

  get itemDiscountsControl() : UntypedFormArray {
    return this.inputForm.get('discountItems') as UntypedFormArray;
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
    private fb                      : UntypedFormBuilder,
    private agGridService           : AgGridFormatingService,
    private fbPriceScheduleService  : FbPriceScheduleService,
    private priceScheduleDataService: PriceScheduleDataService,
  )
  {
    this.searchForm = this.fb.group( {
        itemName: '',
        categoryID: [],
        subCategoryID: [],
    });
    this.initGridOptions();
  }

  ngOnInit() {
    this.rowSelection   = 'multiple'
    this.initSubscriptions();
    this.refreshGroupingDataOnly()
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
      alwaysShowHorizontalScroll: true,
    }
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return  `Add`;
      else return   `Add`;
  }

  initColumnDefs() {

    this.columnDefs =   [
       {headerName: 'Name', field: 'name', sortable: true,
        width: 300, minWidth: 300,
        cellRenderer: 'showMultiline',
        wrapText: true,
        cellStyle: {'white-space': 'normal', 'line-height': '1em'},
        autoHeight: true,
       },
       {
         field: "id",
         cellRenderer: "btnCellRenderer",
         cellRendererParams: {
           onClick: this.selectItemFromGrid.bind(this),
           label: `Select`,
           getLabelFunction: this.getLabel.bind(this),
           btnClass: 'btn btn-primary btn-sm'
         },
         minWidth: 65,
         width: 65
       },
     ]
     this.columnDefs.push(this.getValueField('department', 'Department', null, false,))
     this.columnDefs.push(this.getValueField('category', 'Category', null, false,))
     this.columnDefs.push(this.getValueField('subCategory', 'SubCategory', null, false,))
     return    this.columnDefs ;
   }

   getValueField(name: string, header? : string, width?: number, disabled?: boolean, hide?: boolean) {
     if (!header) {
       header = name
     }
     if (!width) {
       width = 125
     }
     let edit = true;
     if (disabled) {
       edit = false
     }
     let visible = true;
     if (hide) {
       visible = false
     }
     return   {headerName: header.toUpperCase(),    field: name,
         sortable: true,
         width: 76,
         minWidth:width,
         hide: !visible,
         editable: edit,
         singleClickEdit: edit,
         comparator: myComparator,
     }
   }

   getSubCategory() { 
    if (this.subCategoryID) { 
      return this.subCategoryID
    }
    return null;
  }
  //the category in this component comes from input
  getCategoryID(): number  {

    if (this.categoryID) { 
      return this.categoryID;
    }
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
    const subCategoryID = this.getSubCategory()
    const brandID  = this.getBrandID();
    // console.log('initSearchModel')
    return this.agGridService.initProductSearchModel(
        categoryID,
        this.input.nativeElement.value,
        this.pageSize,
        this.currentPage,
        this.getSelectedItemTypeID(),
        brandID, 
        subCategoryID,
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

  removeItemFB(inputForm: UntypedFormGroup, item: DiscountInfo, index: number) {
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
      let item =  this.assigItem(e.rowData);
      if (item) { 
        this.applyChanges(item);
      }
      this.lastSelectedItem = e.rowData;
    }
  }

  assigItem(item, index?: number) {
    this.lastSelectedItem = null
    if (!item)                 { return }
    if (item.id == undefined)  { return }
    const itemID = parseInt( item.id );
    if (!this.itemDiscounts) {
      this.itemDiscounts = [] as DiscountInfo[]
    }
    if (this.itemDiscounts) {
      const array = this.itemDiscounts
      const index = array.findIndex( data =>  data.itemID === itemID)
      if (index == -1){
        const newItem    =  {} as DiscountInfo;
        newItem.itemID   =  itemID;
        newItem.name     =  item.name;
        newItem.quantity =  1;
        if (index) { 
          newItem.sort     = index
        }
        this.itemDiscounts.push(newItem);
        this.lastSelectedItem = newItem
        return newItem
      } else {
      }
    }
  }

  applyChanges(item: DiscountInfo) {
    this.priceScheduleTracking.itemDiscounts = this.itemDiscounts;
    this.fbPriceScheduleService.addDiscountItems(this.inputForm, this.itemDiscounts)
    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    this.lastSelectedItem  = item
  }

  assignAllForSearchResults() {
    const model = this.initSearchModel();
    model.currentPage  = 1;
    model.pageSize = 50;
    this.itemDiscounts = [] as DiscountInfo[]
    const site               = this.siteService.getAssignedSite()
    this.action$ =  this.menuService.getProductsBySearchForLists(site, model).pipe(switchMap(data => { 
      if (!data || data.errorMessage) { 
        return of(data)
      }
      if (data && data.results) {
        let i = 0
        data.results.forEach(menuItem=>{ 
          i += i
          let item =  this.assigItem(menuItem, i)
          this.applyChanges(item);
        })
      }
      return of(data)
    }))
  }

  //requiredCategories
  isCategoryEnabled(sub) {
    const index = this.itemDiscounts.findIndex( data => data.itemID == sub.id )
    if (index == -1){ return false }
    if (index != -1){ return true  }
  }

  refreshGroupingDataOnly() {
    const site             = this.siteService.getAssignedSite()
    this.categories$       = this.menuService.getListOfCategoriesAll(site);
    this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(switchMap(data => { 
 
      this.subCategoriesList = data;
      return of(data)
    }))
  }

  refreshSubCategories() {
    console.log('refreshing subcategories')
    const site          = this.siteService.getAssignedSite()
    this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(
      switchMap(data => {
        this.subCategoriesList  = data;
        if (this.categoryID != 0  && !this.categoryID) {
          this.subCategoriesList = data.filter(data => {return data.categoryID == this.categoryID});
          if (!this.subCategoriesList) { 
            this.subCategoriesList = data;
          }
        }
        return of(this.subCategoriesList)
      })
    )
  }

  refreshCategories() {
    const site          = this.siteService.getAssignedSite()
    this.categories$    = this.menuService.getListOfCategoriesAll(site).pipe(
      switchMap(data => {
        this.categoriesList = data;
        return of(data)
      })
    )
  }

  refreshSubCategoryChange(event) {
    this.subCategoryID = event;
    this.refreshSearch(this.searchForm.controls['itemName'].value);
  }

  refreshCategoryChange(event) {
    this.categoryID = event;
    this.refreshSearch(this.searchForm.controls['itemName'].value);

    if (this.categoryID && this.categoryID != 0) { 
      this.refreshSubCategories();
    } else { 
      const site          = this.siteService.getAssignedSite()
      this.subCategories$ = this.menuService.getListOfSubCategoriesAll(site)
    }
  }


}
