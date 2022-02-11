import { Component,  Output, OnInit, AfterViewInit,
  ViewChild ,ElementRef, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import {  IUnitTypePaged,  UnitType } from 'src/app/_interfaces/menu/price-categories';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { SearchModel } from 'src/app/_services/system/paging.service';

@Component({
  selector: 'unit-types',
  templateUrl: './unit-type-list.component.html',
  styleUrls: ['./unit-type-list.component.scss']
})
export class UnitTypeListComponent implements OnInit, AfterViewInit {

  // implements OnInit
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  searchPhrase:         Subject<any> = new Subject();
  get searchItemValue() { return this.searchForm.get("searchItems") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  unitTypeID: number;
  unitType  : UnitType;

  unitTypes$              : Subject<UnitType[]> = new Subject();
  _unitTypes$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
      switchMap(searchPhrase =>
      this.refreshSearch()
    )
  )

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
  isFirstpage             : boolean;
  isLastpage              : boolean;

    //search form filters
  public searchForm: FormGroup;
  inputForm        : FormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';


  constructor(  private _snackBar   : MatSnackBar,
    private router                  : Router,
    private agGridService           : AgGridService,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService  : AgGridFormatingService,
    private unitTypesService        : UnitTypesService,
  )
  {  }

  async ngOnInit() {
    const site          = this.siteService.getAssignedSite()
    this.searchForm     = this.fb.group( { searchItems: ''});
    this.rowSelection   = 'multiple'
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
          onClick: this.editItemFromGrid.bind(this),
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


  //clears all filters
  listAll(){
    const control = this.searchItemValue
    control.setValue('')
    this.refreshSearch()
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): SearchModel {
    let searchModel        = {} as SearchModel;
    let search                    = ''
    if (this.searchItemValue.value)
    {search = this.searchItemValue.value  }
    searchModel.loadChildren = false;
    searchModel.name         = search
    searchModel.pageSize     = this.pageSize
    searchModel.pageNumber   = this.currentPage
    return searchModel
  }

  getNumberOfPages() {

  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<SearchModel> {
    this.currentPage          = 1
    const site                = this.siteService.getAssignedSite()
    const UnitTypeSearchModel = this.initSearchModel();
    this.params.startRow      = 1;
    this.params.endRow        = this.pageSize;
    this.onGridReady(this.params)
    return this._unitTypes$
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
  getRowData(params, startRow: number, endRow: number):  Observable<IUnitTypePaged>  {
    this.currentPage            = this.setCurrentPage(startRow, endRow)
    const unitTypeSearchModel   = this.initSearchModel();
    const site                  = this.siteService.getAssignedSite()
    return this.unitTypesService.getList(site, unitTypeSearchModel)
  }

  //ag-grid standard method
  getRowDataItems(id: number) {
    const site                 = this.siteService.getAssignedSite()
    const item$                = this.unitTypesService.get(site, id)
    // return this.priceCategory$
    item$.subscribe(data => this.unitType = data)
  }

  //ag-grid standard method
  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
    }

    if (params == undefined) {
      console.log('params is not defined')
      return
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)

      try {
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
      } catch (error) {
        console.log('error', error)
      }
      }
    }

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

  editItemFromGrid(e) {
    console.log(e)
    this.unitTypeID = e.rowData.id
    const site = this.siteService.getAssignedSite();
    const price$ = this.unitTypesService.get(site, this.unitTypeID)
    price$.subscribe( data => {
      this.productEditButtonService.openUnitTypeEditor(data)
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

  deleteSelected() {
    this.delete();
  }

  async delete() {

    if (this.selected)  {
      const answer = window.confirm('Please confirm, this will remove settings that may be important.');
      if (answer) {
        await this.selected.forEach(data =>
            {
              console.log(data)
              this.deleteItem(parseInt( data))
            }
          )
        }
        this.refreshSearch()
    }
  }

  async deleteItem(id: number) {
    const site = this.siteService.getAssignedSite();
    await this.unitTypesService.delete(site, id).pipe().toPromise();
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}
