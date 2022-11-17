import { Component, Inject, Input, Output, OnInit, Optional,
         ViewChild ,ElementRef, AfterViewInit, EventEmitter, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription,  of } from 'rxjs';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { IPriceSchedule, IPriceSearchModel, PS_SearchResultsPaged,PriceAdjustScheduleTypes } from 'src/app/_interfaces/menu/price-schedule';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { AgGridToggleComponent } from 'src/app/_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'app-price-schedule-list',
  templateUrl: './price-schedule-list.component.html',
  styleUrls: ['./price-schedule-list.component.scss']
})
export class PriceScheduleListComponent implements OnInit, AfterViewInit {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  action$: Observable<any>;
  performingAction = false;

  searchPhrase               :  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  //search with debounce
  searchItems$              : Subject<IPriceSchedule[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

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
  isfirstpage             : boolean;
  islastpage              : boolean;

  //This is for the filter Section//
  fieldsForm      : FormGroup;
  searchForm      : FormGroup;
  inputForm       : FormGroup;
  name            : string
  allDates        : boolean;
  allEligible     : boolean;
  allOrderTypes   : boolean;
  allWeekdaysDays : boolean;
  timeFrameAlways : boolean;
  active          : boolean;
  type             = '';

  selected         : any[];
  selectedRows     : any;
  agtheme           = 'ag-theme-material';
  urlPath:         string;

  priceAdjustScheduleTypes$  :   Observable<PriceAdjustScheduleTypes[]>;
  allItems                   :   boolean;
  priceAdjustScheduleTypes   :   PriceAdjustScheduleTypes[];
  selectedAdjustScheduleTypes:   PriceAdjustScheduleTypes;

  // priceSchedule : IPriceSchedule;
  id            : number;

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initPriceScheduleService() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
    })
  }

  constructor(
          private _snackBar               : MatSnackBar,
          private priceScheduleService    : PriceScheduleService,
          private priceScheduleDataService:PriceScheduleDataService,
          private router                  : Router,
          private fb                      : FormBuilder,
          private siteService             : SitesService,
          private productEditButtonService: ProductEditButtonService,
          private awsService              : AWSBucketService,
          private fbPriceSchedule         : FbPriceScheduleService,
        )
  {
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  async ngOnInit() {
    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()
    this.rowSelection   = 'multiple'
    this.priceAdjustScheduleTypes$ = this.priceScheduleService.getPriceAdjustList(site)

    this.priceAdjustScheduleTypes$.subscribe( data =>  {
      this.priceAdjustScheduleTypes = data;
    })

    this.initPriceScheduleService()
  };

  async initForm() {
    this.fieldsForm = this.fbPriceSchedule.initSearchForm(this.fieldsForm)
    this.searchForm = this.fb.group( { itemName: '' } );
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  // //ag-grid
  ngAfterViewInit() {
    try {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(300),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          const search  = this.input.nativeElement.value
          this.refreshSearch(search);
        })
      )
      .subscribe();
    } catch (error) {
      console.log('error', error)
    }

  }

  //ag-grid
  //standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
  initAgGrid(pageSize: number) {

    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent,
      agGridToggleComponent: AgGridToggleComponent
    };

    this.defaultColDef = {
      flex: 2,
      // minWidth: 100,
    };

    this.columnDefs =  [
      {
        field: "id",
           cellRenderer: "btnCellRenderer",
              cellRendererParams: {
                onClick: this.editItemFromGrid.bind(this),
                label: 'Edit',
                getLabelFunction: this.getLabel.bind(this),
                btnClass: 'mat-raised-button'
              },
              minWidth: 115,
              maxWidth: 115,
              flex: 2,
      },

      {
        headerName: "Price Schedules",
        children: [
          {headerName: 'Name',          field: 'name',         sortable: true,
                      width   : 275,
                      minWidth: 175,
                      maxWidth: 275,
                      flex    : 1,
          },
        ]
      },
      {
        headerName: "Options",

        children: [

          {headerName: 'Type',          field: 'type',      sortable: true,
                width:    125,
                minWidth: 125,
                maxWidth: 125,
                flex: 1,
          },
          {headerName: 'Value',         field: 'value', sortable: true,
                width:    100,
                minWidth: 100,
                maxWidth: 100,
                flex: 1,
          },
          {
            headerName: "Clients",
            width:    100,
            minWidth: 100,
            maxWidth: 100,
            flex: 1,
            field: "allEligible",
            cellRenderer: function(params) {
                var input = document.createElement('input');
                input.type="checkbox";
                input.disabled = true;
                input.checked=params.value;
                input.addEventListener('click', function (event) {
                    params.value=!params.value;
                    params.node.data.fieldName = params.value;
                });
                return input;
            }
          },
          {
              headerName: "Dates",
              width:    100,
              minWidth: 100,
              maxWidth: 100,
              flex: 1,
              field: "allDates",
              cellRenderer: function(params) {
                  var input = document.createElement('input');
                  input.type="checkbox";
                  input.checked=params.value;
                  input.disabled = true;
                  input.addEventListener('click', function (event) {
                      params.value=!params.value;
                      params.node.data.fieldName = params.value;
                  });
                  return input;
              }
          },
          {
              headerName: "Weekdays",
              width:    100,
              minWidth: 100,
              maxWidth: 100,
              flex: 1,
              field: "allWeekDays",
              cellRenderer: function(params) {
                  var input = document.createElement('input');
                  input.type="checkbox";
                  input.checked=params.value;
                  input.disabled = true;
                  input.addEventListener('click', function (event) {
                      params.value=!params.value;
                      params.node.data.fieldName = params.value;
                  });
                  return input;
              }
          },
          {
            headerName: "active",
            width:    100,
            minWidth: 100,
            maxWidth: 100,
            flex: 1,
            field: "active",
            cellRenderer: function(params) {
                var input = document.createElement('input');
                input.type="checkbox";
                input.checked=params.value;
                input.disabled = true;
                input.addEventListener('click', function (event) {
                    params.value=!params.value;
                    params.node.data.fieldName = params.value;
                });
                return input;
            }
          }
        ]
      }

    ]

    this.gridOptions = {
        cacheBlockSize: 20,
        maxBlocksInCache: 50,
        rowModelType: 'infinite',
        rowSelection: 'multiple',
        pagination: true,
        paginationPageSize: pageSize,
    };
    // this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  onToggleChange(event) {
    this.refreshSearch(this.name);
  }

  listAll() {
    const control = this.itemName
    control.setValue('')
    this.name = ''
    this.allDates = false;
    this.allEligible = false;
    this.allOrderTypes = false;
    this.allWeekdaysDays = false;
    this.active = false;
    this.type   = ''
    this.timeFrameAlways;
    this.refreshSearch('')
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(searchPhrase: string): Observable<IPriceSchedule[]> {
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    const searchModel        = this.initSearchModel();

    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;
    this.onGridReady(this.params)
    return this._searchItems$
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): IPriceSearchModel {
    try {
      let searchModel        = {} as IPriceSearchModel;
      let search             = ''

      searchModel.name            = this.input.nativeElement.value
      if (this.allDates )                   { searchModel.allDates        = this.allDates; }
      if (this.allEligible)                 { searchModel.allEligible     = this.allEligible; }
      if (this.allOrderTypes)               { searchModel.allOrderTypes   = this.allOrderTypes; }
      if (this.allWeekdaysDays)             { searchModel.allWeekdaysDays = this.allWeekdaysDays }
      if (this.active)                      { searchModel.active          = this.active; }
      if (this.timeFrameAlways)             { searchModel.timeFrameAlways = this.timeFrameAlways; }
      if (this.searchForm)                  { searchModel.type            = this.type;      }

      searchModel.pageSize   = this.pageSize
      searchModel.pageNumber = this.currentPage
      return searchModel

    } catch (error) {
      console.log('error', error)
      return null
    }
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

  //ag-grid standard method.
  getDataSource(params) {
    return {
    getRows: (params: IGetRowsParams) => {
      const items$ = this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(
        {next: data =>
          {
            const resp         =  data.paging
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            params.successCallback(data.results)
            this.rowData = data.results
          }, error: err => {
            params.successCallback(null)
            this.rowData = null;
            console.log(err)
          }
        }
        );
      }
    };
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<PS_SearchResultsPaged>  {
    this.currentPage  = this.setCurrentPage(startRow, endRow)
    const searchModel = this.initSearchModel();
    const site        = this.siteService.getAssignedSite()
    return this.priceScheduleService.getListBySearch(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params        = params
      this.gridApi       = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    // if (!params) { return }
    if (params == undefined) { return }

    if (!params.startRow || !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data => {
            if (data) {
                if (data.paging){
                  const resp         = data.paging
                  this.isfirstpage   = resp.isFirstPage
                  this.islastpage    = resp.isFirstPage
                  this.currentPage   = resp.currentPage
                  this.numberOfPages = resp.pageCount
                  this.recordCount   = resp.recordCount
                }
                params.successCallback(data.results)
            }
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  refreshImages(data) {
    if (!data) { return }
    const urlPath = this.urlPath
    if (urlPath) {
      data.forEach( item =>
        {
          if (item.urlImageMain) {
            const list = item.urlImageMain.split(',')
            if (list[0]) {
              item.imageName = `${urlPath}${list[0]}`
            }
          }
        }
      )
    }
    return data;
  }

  //search method for debounce on form field
  displayFn(search) {
    if (!search) {return }
    this.selectItem(search)
    return search;
  }

  //search method for debounce on form field
  selectItem(search){
    if (search) {
      this.currentPage = 1
      console.log('search', search)
      this.searchPhrase.next(search)
    }
  }

  //mutli select method for selection change.
  onSelectionChanged(event) {
    try {
      let selectedRows       = this.gridApi.getSelectedRows();
      let selectedRowsString = '';
      let maxToShow          = this.pageSize;
      let selected           = []

      if (selectedRows) {
        selectedRows.forEach(function (selectedRow, index) {
          if (index >= maxToShow) { return; }
          if (index > 0) {  selectedRowsString += ', ';  }
            selected.push(selectedRow.id)
            selectedRowsString += selectedRow.name;
          });

        if (selectedRows.length > maxToShow) {
        let othersCount = selectedRows.length - maxToShow;
        selectedRowsString +=
          ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
        }

        this.selected = selected
        this.id = selectedRows[0].id;
        this.getItem(this.id)
      }
    } catch (error) {
      console.log('getitem', error)
    }
  }

  // : Promise<IPriceSchedule>
  async getItem(id: number) {
    try {
      if (id) {
        const site = this.siteService.getAssignedSite();
        this.priceScheduleService.getPriceSchedule(site, this.id).subscribe( data =>
          {
            this.inputForm = this.fbPriceSchedule.initForm(this.inputForm)
            this.priceScheduleDataService.updatePriceSchedule(data)
            this.fbPriceSchedule.updateDiscountInfos(this.inputForm, data);
          }
        )
      }
    } catch (error) {
      console.log('getitem', error)
    }

  }

  async editItemFromGrid(e) {
    if (!e) { return }
    const id = e.rowData.id
    this.editItem(id)
  }

  editItem(id) {
    if (id) { this.router.navigate(['/price-schedule-edit', {id : id}]) }
  }

  // navPriceScheduleGroups() {
  //   this.router.navigate(['/psmenu-group-list'])
  // }

  navPriceScheduleGroups() {
    this.router.navigate(['/admin-display-menu'])
  }

  selectAdjustScheduleTypes(item) {
    if (!item) { return }
    this.selectedAdjustScheduleTypes = item;
  }

  editSelectedItems() {
    if (!this.selected) {
      this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
      return
    }
    this.productEditButtonService.editTypes(this.selected)
  }

  addSchedule() {
    const site = this.siteService.getAssignedSite();
    const priceSchedule = {} as IPriceSchedule;
    this.performingAction = true;
    this.action$ = this.priceScheduleService.save(site, priceSchedule).pipe(
      switchMap(data => {
        this.editItem(data.id)
        this.performingAction = false;
        return of(data)
      }
    ))
  }

  deleteSelected() {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

    if (!this.selected) {
      this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
      return
     }

    const answer = window.confirm('Please confirm. This function will delete all selected items');

    if (answer) {
      const site = this.siteService.getAssignedSite();
      const items$ = this.priceScheduleService.deleteList(site, this.selected)
      items$.subscribe( data => {
        this._snackBar.open('Items Deleted', 'Success', {duration: 2000})
        this.listAll()
      })
    }
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
    return 'Edit';
    else return 'Edit';
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }
}
