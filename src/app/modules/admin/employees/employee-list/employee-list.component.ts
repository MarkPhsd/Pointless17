import { Component,   OnInit,
  ViewChild ,ElementRef, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { AgGridFormatingService, rowItem } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { employee,} from 'src/app/_interfaces';
import { Capacitor,  } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, IBalanceSheet} from 'src/app/_services/transactions/balance-sheet.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { EmployeeSearchModel, EmployeeSearchResults, EmployeeService } from 'src/app/_services/people/employee-service.service';
import { EmployeeEditComponent } from '../employee-edit/employee-edit.component';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit , OnDestroy, AfterViewInit{

  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  dateRange        : UntypedFormGroup;

  // //search with debounce
  searchItems$              : Subject<BalanceSheetSearchModel> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  get platForm()         {  return Capacitor.getPlatform(); }
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
  value             : any;
  // //This is for the filter Section//
  //search form filters
  searchForm:        UntypedFormGroup;
  inputForm        : UntypedFormGroup;
  jobTypeID     : number;
  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions  = "width: 100%; height: 100%;"
  urlPath:        string;

  id              : number;
  balanceSheet      : IBalanceSheet;

  employee        :   employee
  employees$      :   Observable<employee[]>;

  _searchModel    :   Subscription;
  searchModel     :   EmployeeSearchModel;
  isAuthorized    :   boolean;
  isStaff         :   boolean;
  smallDevice       = false;
  urlPath$: Observable<string>;
  buttonName      = 'Edit';
  metrcButtonName = 'METRC'

  constructor(  private _snackBar               : MatSnackBar,
                private employeeService         : EmployeeService,
                private fb                      : UntypedFormBuilder,
                private productEditButtonService: ProductEditButtonService,
                private siteService             : SitesService,
                private agGridFormatingService  : AgGridFormatingService,
                private awsService              : AWSBucketService,
                private userAuthorization       : UserAuthorizationService,
                private router                  : Router,
                private _bottomSheet            : MatBottomSheet,
              )
  {
    this.initSubscriptions();
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  ngOnDestroy(): void {
    if (this._searchModel) {this._searchModel.unsubscribe()}
  }

   ngOnInit() {
    this.initClasses()

    this.urlPath$  =  this.awsService.awsBucketURLOBS().pipe(
      switchMap(data => {
        this.urlPath = data;
        return of(data)
      }
    ))

    this.rowSelection       = 'multiple'
    this.isAuthorized =  this.userAuthorization.isManagement// //('admin, manager')
    this.isStaff =  this.userAuthorization.isStaff // ('admin, manager, employee')
    this.updateItemsPerPage(); //run last in this process!
  };

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 100%;'
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    this.dateRange = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.gridDimensions = 'width: 100%; height: 85%;'
    }
  }

  ngAfterViewInit() {
    if (this.input) {
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
  }

  initSubscriptions() {
    try {
      this._searchModel = this.employeeService.searchModel$.subscribe( data => {
          this.searchModel            = data
          console.log('data', data)
          if (!this.searchModel) {
            const searchModel       = {} as EmployeeSearchModel;
            this.currentPage        = 1
            searchModel.terminated  = 1
            searchModel.pageNumber  = 1
            searchModel.pageSize    = 25;
            this.searchModel        = searchModel
          }
          this.refreshSearch_sub()
        }
      )

    } catch (error) {

    }
  }

  //ag-grid
  //standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
  initAgGrid(pageSize: number) {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
    };

    let item  =   {
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                        onClick: this.editItemWithId.bind(this),
                        label:  this.buttonName,
                        getLabelFunction: this.getLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 125,
                      maxWidth: 125,
                      width   : 100,
                      flex: 2,
                      headerName: '',
                      sortable: false,
      } as rowItem
      this.columnDefs.push(item);

      const site = this.siteService.getAssignedSite();

      if (site.metrcURL ) {
        let item  =   {
          field: 'id',
          cellRenderer: "btnCellRenderer",
                        cellRendererParams: {
                            onClick: this.applyMetrcKey.bind(this),
                            label: this.metrcButtonName,
                            getLabelFunction: this.getCheckInLabel.bind(this),
                            btnClass: 'btn btn-primary btn-sm'
                          },
                          minWidth: 125,
                          maxWidth: 125,
                          width   : 100,
                          flex: 2,
                          headerName: '',
                          sortable: false,
          } as rowItem

          this.columnDefs.push(item);
      }


      item =   {headerName: 'Last Name',     field: 'lastName', sortable: true,
        width   : 100,
        minWidth: 200,
        maxWidth: 200,
        flex    : 2,
      } as any
      this.columnDefs.push(item);

      item =   {headerName: 'First Name',     field: 'firstName', sortable: true,
        width   : 100,
        minWidth: 200,
        maxWidth: 200,
        flex    : 2,
      } as any
      this.columnDefs.push(item);

      item =   {headerName: 'Termination',     field: 'terminationDate', sortable: true,
          width   : 100,
          minWidth: 200,
          maxWidth: 200,
          flex    : 2,
      } as any
      this.columnDefs.push(item);

    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  listAll(){
    const control = this.itemName
    control.setValue('')
    this.refreshSearch()
  }

  autoSizeAll(skipHeader) {
    try {
      var allColumnIds = [];
      this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
      this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    } catch (error) {
      console.log(error)
    }
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): EmployeeSearchModel {
    let searchModel        = {} as EmployeeSearchModel;
    if (this.searchModel) {
      searchModel = this.searchModel
    }
    searchModel.jobTypeID  = 0
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    // searchModel.terminated = 1
    if (this.jobTypeID && this.jobTypeID !=0 ) {
      searchModel.jobTypeID  = this.jobTypeID;
    }
    return searchModel
  }

  refreshSearchAny(event) {
    this.employeeService.searchModel$.subscribe(data => {
      this.searchModel = data;
      return this.refreshSearch_sub()
    })
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<EmployeeSearchModel> {
    // this.currentPage         = 1
    const searchModel        = this.initSearchModel();
    return this.refreshSearch_sub()
  }

  refreshSearch_sub(): Observable<EmployeeSearchModel> {
    if (this.params){
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
    }
    this.onGridReady(this.params)
    return this._searchItems$
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

  //this is called from OnGridReady
  // it instantes the currentpage
  getRowData(params, startRow: number, endRow: number):  Observable<EmployeeSearchResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.employeeService.getEmployeeBySearch(site, searchModel)
  }

  //ag-grid standard method
  onGridReady(params: any) {
    if (!params) { return }
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
      this.autoSizeAll(false)
    }

    this.onFirstDataRendered(this.params)
    if (params == undefined) { return }
    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      console.log('params', params.startRow, params.endRow)
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            const resp         =  data.paging
            if (resp) {
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
              if (this.numberOfPages !=0 && this.numberOfPages) {
                this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
              }
            }
            if (data.results) {
              params.successCallback(data.results)
              this.rowData = data.results
            }
          }
      );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    this.autoSizeAll(true)
  }

   onFirstDataRendered (params) {
    try {
      params.api.sizeColumnsToFit()
      window.setTimeout(() => {
        const colIds = params.columnApi.getAllColumns().map(c => c.colId)
        params.columnApi.autoSizeColumns(colIds)
      }, 50)
     } catch (error) {
      console.log(error)
    }
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

  //mutli select method for selection change.
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
    });
    if (selectedRows.length > maxToShow) {
    let othersCount = selectedRows.length - maxToShow;
    selectedRowsString +=
      ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }
    if (selected) {
      this.selected = selected
      this.id = selectedRows[0].id;
      this.getItem(this.id)
    }
  }

  getItem(id: number) {
    this.employeeService.updateCurrentEditEmployee(null);
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.employeeService.getEmployee(site, this.id).subscribe(data => {
         this.employee = data;
         this.employeeService.updateCurrentEditEmployee(data)
        }
      )
    }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return this.buttonName
      else return this.buttonName
  }

  getCheckInLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return this.metrcButtonName
      else return this.metrcButtonName
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editItemWithId(item:any) {
    if(!item) {
      console.log(item)
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    this.router.navigate(['/employee-edit', {id:item.rowData.id}]);
  }

  applyMetrcKey(item:any){
    if(!item) {
      console.log(item)
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    this.employeeService.getEmployee(site, id).subscribe(data => {
       this.employeeService.updateCurrentEditEmployee(data)
       this.productEditButtonService.openEmployeeMetrcKeyEntryComponent(data)
    })
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

  filterBottomSheet() {
    this._bottomSheet.open(EmployeeEditComponent);
  }
}

