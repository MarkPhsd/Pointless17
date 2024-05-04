import { Component, Output, OnInit,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { IPriceTierPaged, PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { PriceTierMethodsService } from 'src/app/_services/menu/price-tier-methods.service';

@Component({
  selector: 'price-tiers-list',
  templateUrl: './price-tiers.component.html',
  styleUrls: ['./price-tiers.component.scss']
})

export class PriceTiersComponent implements OnInit, AfterViewInit {
  // implements OnInit
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  searchPhrase:         Subject<any> = new Subject();
  get searchProductsValue() { return this.searchForm.get("searchItems") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  priceCategoryid: number;
  productPriceID : number;
  //search with debounce
  priceTiers$              : Subject<PriceTiers[]> = new Subject();
  _priceTiers$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  priceTier: PriceTiers;

  get PaginationPageSize(): number {
    return this.pageSize;
  }

  get gridAPI(): GridApi {
    return this.gridApi;
  }

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
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isFirstpage             :boolean;
  isLastpage              :boolean;

    //search form filters
  public searchForm: UntypedFormGroup;
  inputForm        : UntypedFormGroup;
  // categoryID       : number;
  // productTypeSearch: number;
  // productTypeID    : number;
  // typeID           : number;
  // brandID          : number;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';

  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : UntypedFormBuilder,
    private siteService             : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService  : AgGridFormatingService,
    private priceTierService        : PriceTierService,
    private priceTierMethods        : PriceTierMethodsService,
  )
  {  }

  async ngOnInit() {
    const site          = this.siteService.getAssignedSite()
    this.searchForm     = this.fb.group( { searchItems: ''});
    this.rowSelection   = 'single'
    this.initAgGrid(this.pageSize);
  };

  //ag-grid
  //this setups up the search form for debouncing.
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

     //ag-grid
    //standard formating for ag-grid.
    //requires addjustment of column defs, other sections can be left the same.
    initAgGrid(pageSize: number) {

      this.frameworkComponents = {
        btnCellRenderer: ButtonRendererComponent
      };

      this.defaultColDef = {
        flex: 1,
        minWidth: 100,
      };

      this.columnDefs =  [
        {
          field: "id",
          cellRenderer: "btnCellRenderer",
          cellRendererParams: {
            onClick: this.editPriceTier.bind(this),
            label: 'Edit',
            getLabelFunction: this.getLabel.bind(this),
            btnClass: 'btn btn-primary btn-sm'
          },
          width: 75
        },
        {headerName: 'Name',  field: 'name',   sortable: true,    width: 90}
      ]
      this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
    }

    //ag-grid - search section
    //clears all filters
    listAll(){
      const control = this.searchProductsValue
      control.setValue('')
      this.refreshSearch()
    }

    //initialize filter each time before getting data.
    //the filter fields are stored as variables not as an object since forms
    //and other things are required per grid.
    initSearchModel(): SearchModel {
      let searchModel        = {} as SearchModel;
      let search                    = ''
      if (this.searchProductsValue.value)
      {search = this.searchProductsValue.value  }
      searchModel.loadChildren = false;
      searchModel.name         = search
      searchModel.pageSize     = this.pageSize
      searchModel.pageNumber   = this.currentPage
      return searchModel
    }

    getNumberOfPages() {
    }

    //this is called from subject rxjs obversablve above constructor.
    refreshSearch(): Observable<IPriceTierPaged> {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.initSearchModel();
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
      this.onGridReady(this.params)
      return this._priceTiers$
    }

    //this is called selecting a category
    refreshPrices() {
      const site               = this.siteService.getAssignedSite()
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
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

    //ag-grid standard method
    getRowData(params, startRow: number, endRow: number):  Observable<IPriceTierPaged>  {
      this.currentPage           = this.setCurrentPage(startRow, endRow)
      const searchModel          = this.initSearchModel();
      const site                 = this.siteService.getAssignedSite()
      return this.priceTierService.searchPriceTiers(site, searchModel)
    }

    //ag-grid standard method
    getRowDataItems(id: number) {
      const site                      = this.siteService.getAssignedSite()
      const priceTier$ = this.priceTierService.getPriceTier(site, id)
      // return this.priceCategory$
      priceTier$.subscribe(data => this.priceTier = data)
    }

    //ag-grid standard method
    onGridReady(params: any) {
      if (params)  {
        this.params  = params
        this.gridApi = params.api;
        // this.gridColumnApi = params.columnApi;
      }

      if (params == undefined) {
        // console.log('params is not defined')
        return
      }

      let datasource =  {
        getRows: (params: IGetRowsParams) => {
        const items$ =  this.getRowData(params, params.startRow, params.endRow)
        items$.subscribe(data =>
          {
              console.log('response', data)
              const resp           = data.paging
              if (resp) {
                this.isFirstpage   = resp.isFirstPage
                this.isLastpage    = resp.isFirstPage
                this.currentPage   = resp.currentPage
                this.numberOfPages = resp.pageCount
                this.recordCount   = resp.recordCount
              }
              params.successCallback(data.results)
            }
          );
        }
      };

      if (!datasource)   { return }
      if (!this.gridApi) { return }
      this.gridApi.setDatasource(datasource);
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
    onSelectionChanged(event) {

      let selectedRows       = this.gridApi.getSelectedRows();
      let selectedRowsString = '';
      let maxToShow          = this.pageSize;
      let selected           = []

      selectedRows.forEach(function (selectedRow, index) {
        if (index >= maxToShow) { return; }
          if (index > 0) {  selectedRowsString += ', ';  }
            selected.push(selectedRow.id)
            selectedRowsString += selectedRow.name;
          }
      );

      if (selectedRows.length > maxToShow) {
        let othersCount = selectedRows.length - maxToShow;
        selectedRowsString +=
        ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
      }

      this.selected = selected
    }

    onSelectionItemChanged(event) {

    }

    onDeselectAll() { }

    onExportToCsv() {
      this.gridApi.exportDataAsCsv();
    }

    getLabel(rowData)
    {
      if(rowData && rowData.hasIndicator)
        return 'Edit';
        else return 'Edit';
    }

    editPriceTier(e) {
      const id = e.rowData.id
      this.priceTierMethods.openPriceTier(id)
    }

    addNewTierGroup() {
      this.priceTierMethods.addNewTierGroup().subscribe(data => {
        this.listAll();
      })
    }

    addPriceTier() {
      //add then edit.
      const site = this.siteService.getAssignedSite();
      const price = {} as PriceTiers
      const price$ = this.priceTierService.savePriceTier(site, price)
      price$.subscribe( data => {
        this.productEditButtonService.openPriceTierEditor(data)
      })
    }

    childAddItem() {
      // this.productEditButtonService.addItem(this.productTypeID)
      this.productEditButtonService.openNewItemSelector()
    }


    editSelectedItems() {
      if (!this.selected) {
        this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
        return
      }
      this.productEditButtonService.editTypes(this.selected)
    }

    onSortByNameAndPrice(sort: string) { }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
      });
    }

}

