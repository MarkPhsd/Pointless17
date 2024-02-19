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
  selector: 'app-type-results-selector',
  templateUrl: './type-results-selector.component.html',
  styleUrls: ['./type-results-selector.component.scss']
})
export class TypeResultsSelectorComponent implements OnInit, OnChanges,AfterViewInit {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

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
  // export interface RequiredOption {
  id:                 number;
  priceScheduleID:    number;
  requiredItemTypes:  DiscountInfo[] = []; //what is a main type? This is itemType
  requiredBrands:     DiscountInfo[] = [];
  requiredCategories: DiscountInfo[] = [];
  requiredItems:      DiscountInfo[] = [];
  accordionStep = 0;
  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 20
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  rowCount                = 20
  startRow                = 0;
  endRow                  = 0;
  //AgGrid
  agtheme = 'ag-theme-material';

  selectedRows              : any;
  selected                  : any;
  items                     : IProductSearchResults[];
  @Input() selectedBrand    : any;
  @Input() selectedCategory : any;
  @Input() selectedItemType : any;
  site: ISite;

  get requiredItemsControl() : UntypedFormArray {
    return this.inputForm.get('requiredItems') as UntypedFormArray;
  }
  get requiredCategoriesControl() : UntypedFormArray {
    return this.inputForm.get('requiredCategories') as UntypedFormArray;
  }

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
      this.requiredItemTypes     = data.requiredItemTypes;
      this.requiredBrands        = data.requiredBrands;
      this.requiredCategories    = data.requiredCategories;
      this.requiredItems         = data.requiredItems;
    })
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
            this.refreshSearch('');
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
    this.gridOptions          = this.agGridService.initGridOptions(this.pageSize, this.columnDefs);
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
    // this.columnDefs.push(this.getValueField('department', 'Department', null, false,))
    this.columnDefs.push(this.getValueField('category', 'Category', null, false,))
    this.columnDefs.push(this.getValueField('subCategory', 'Sub Category', null, false,))
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
    this.currentPage = this.setCurrentPage(startRow, endRow)
    const productSearchModel = this.initSearchModel( );
    // console.log('productSearchModel', productSearchModel)
    const site = this.siteService.getAssignedSite()
    return this.menuService.getProductsBySearchForLists(site, productSearchModel)
  }

  //ag-grid standard method
  onGridReady(params: any) {
    // console.log('on grid ready')
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
    }

    if (params == undefined) {
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
    // console.log('getDataSource')
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
    const site = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    return this.getData(site, productSearchModel)
  }

  refreshSearch(searchPhrase: string): Observable<IProductSearchResults[]> {
    // console.log('refreshSearch')
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
    // console.log('productSearch get data')
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
    let selected = [];

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

  selectItem(item) {
    if (item) {
      // console.log(item)
    }
  }

  selectItemFromGrid(e) {
    if (e.rowData.id)  {
      this.enableItem(e.rowData);
      // this.lastSelectedItem = e.rowData;
    }
  }


  enableItem(item) {

    this.lastSelectedItem = null
    if (!item)                 { return }
    if (item.id == undefined)  { return }
    const itemID = parseInt( item.id );

    if (this.requiredItemsControl) {
      this.requiredItems = this.requiredItemsControl.value;
      // console.log('presss',  this.requiredItems)

      if (item.prodModifierType != 5 && item.prodModifierType != 4) {
        if (!this.requiredItems) {
          this.requiredItems = []
        }
        const array = this.requiredItems;
        const index = array.findIndex( data =>  data.itemID === itemID)
        this.pushRequiredItems(index, itemID, item, this.requiredItems )
        return;
      }

      if (item.prodModifierType == 5 || item.prodModifierType == 4 ) {
        if (!this.requiredCategories) {
          this.requiredCategories = []
        }
        const array = this.requiredCategories;
        const index = array.findIndex( data =>  data.itemID === itemID)
        this.pushCategory(index, itemID, item, this.requiredCategories )
      }
    }
  }

  pushRequiredItems(index, itemID, item,  requiredItems) {
    // console.log('requiredITems', requiredItems)
    try {
      if (index == -1){
        const newItem    =  {} as DiscountInfo;
        newItem.itemID   =  parseInt( itemID );
        newItem.name     =  item.name;
        newItem.quantity =  1;
        requiredItems.push(newItem)
        this.applyChanges(newItem);
        this.lastSelectedItem = newItem
      } else {
        this.requiredItems = requiredItems.splice(index, 1)
        this.applyChanges(null);
        this.lastSelectedItem = null
      }
    } catch (error) {
      console.log(error)
    }


  }

  pushCategory(index, itemID, item,  requiredItems) {

    if (!this.requiredCategories) {
      this.requiredCategories = []
    }

    if (!this.requiredCategories) {
      this.requiredCategories = []
    }
    const array = this.requiredCategories
    index = array.findIndex( data =>   data.itemID === parseInt( itemID ))

    if (index == -1){
      const newItem    =  {} as DiscountInfo;
      newItem.itemID   =  itemID;
      newItem.name     =  item.name;
      newItem.quantity =  1;
      this.requiredCategories.push(newItem);
      this.applyCategoryChanges(newItem);
      this.lastSelectedItem = newItem
    } else {
      this.requiredItems = this.requiredCategories.splice(index, 1)
      this.applyCategoryChanges(null);
      this.lastSelectedItem = null
    }
  }

  applyChanges(item: DiscountInfo) {
    if (!this.requiredItems) { this.requiredItems = []}
    this.priceScheduleTracking.requiredItems = this.requiredItems;
    this.requiredItemsControl.patchValue(this.requiredItems)
    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    this.lastSelectedItem  = item
  }

  applyCategoryChanges(item: DiscountInfo) {
    if (!this.requiredCategories) { this.requiredCategories = []}
    this.priceScheduleTracking.requiredCategories = this.requiredCategories;
    this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    this.lastSelectedItem  = item
  }

  removeItemFB(inputForm: UntypedFormGroup, item: DiscountInfo, index: number) {
    if (!inputForm || !item) {return}
    this.item.requiredItems = this.requiredItems;
    let i = 0
    if ( index != -1 ) {
      this.fbPriceScheduleService.deleteItem(index, this.inputForm)
      this.lastSelectedItem = null
      this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
      return
    }
    this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
  }

  patchValues() {
    this.inputForm.patchValue({requiredItems: this.requiredItems})
    this.inputForm.patchValue({requiredCategories: this.requiredCategories})
  }

  //requiredCategories
  isCategoryEnabled(sub) {
    const index = this.requiredItems.findIndex( data => data.itemID == sub.id )
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
    const site          = this.siteService.getAssignedSite()
    this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(
      switchMap(data => {
        if (this.categoryID != 0  && this.categoryID != undefined) {
          this.categoriesList = data.filter(data => {return data.categoryID == this.categoryID});
          return of(data)
        }
        this.subCategoriesList = data;
        return of(data)
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
    this.refreshSubCategories();
  }

  syncSelection() {

  }

}
