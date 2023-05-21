import { Component, ViewChild, ChangeDetectorRef, OnInit, Input,
         AfterViewInit,ElementRef, HostListener, OnDestroy } from '@angular/core';
import { ClientSearchModel, ClientSearchResults, Item,  IUserProfile, }  from 'src/app/_interfaces';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService, OrdersService,AWSBucketService } from 'src/app/_services';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter, tap } from 'rxjs/operators';
import { Capacitor, Plugins } from '@capacitor/core';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.scss']
})

export class ProfileListComponent implements OnInit, AfterViewInit, OnDestroy {

    //for list selecting.
    @Input() hideAdd         : boolean;
    @Input() hideEditSelected: boolean;
    @Input() editOff         : boolean;
    @Input() notifier:          Subject<boolean>
    gridlist = "grid-list"
    @ViewChild('input', {static: true}) input: ElementRef;

    dataSource:                 any;
    item:                       Item; //for routing
    id:                         string;
    searchForm              :   UntypedFormGroup;
    searchPhrase            :   Subject<any> = new Subject();
    get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
    private readonly onDestroy = new Subject<void>();

    // //search with debounce
    searchItems$              : Subject<ClientSearchModel[]> = new Subject();
    _searchItems$ = this.searchPhrase.pipe(
      debounceTime(250),
        distinctUntilChanged(),
        switchMap(searchPhrase =>
           this.refreshSearch()
      )
    )

    get platForm() {  return Capacitor.getPlatform(); }
    get PaginationPageSize(): number {return this.pageSize;  }
    get gridAPI(): GridApi {  return this.gridApi;  }
    action$ : Observable<any>;
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

    paginationSize =  50
    pageNumber =      1
    rowCount =        50
    searchPaging:                 boolean;

    search:                       string;
    length:                       number;
    pageSizeOptions:              any;

    product:                      IUserProfile;
    currentCountOfPendingOrders:  any;

    expandedElement:              IUserProfile | null;
    columnsToDisplay = ['firstName', 'lastName', 'phone', 'edit', 'checkIn', 'cancelCheckIn', 'openOrder', 'id'];

    selected        : any[];
    selectedRows    : any;
    agtheme         = 'ag-theme-material';
    gridDimensions
    urlPath:        string;
    value : any;

    _searchModel  : Subscription;
    searchModel   : ClientSearchModel;
    smallDevice: boolean;

    buttoncheckInName = 'Check In'
    buttonName        = 'Edit' //if edit off then it's 'Assign'
      //Do this next!!
    initSubscriptions() {
      this._searchModel = this.contactService.searchModel$.subscribe( data => {
        this.searchModel  = data
        if (!data) {
          this.initSearchModel();
        }
      })
    }

    constructor(private contactService: ContactsService,
                private cd: ChangeDetectorRef,
                private route: ActivatedRoute,
                private router: Router,
                private fb: UntypedFormBuilder,
                private orderService: OrdersService,
                private _snackBar: MatSnackBar,
                private siteService: SitesService,
                private agGridFormatingService: AgGridFormatingService,
                private awsService: AWSBucketService,
              ) {

      this.initForm();
      this.initAgGrid(this.pageSize);

    }

    async ngOnInit() {
      this.urlPath        = await this.awsService.awsBucketURL();
      const site          = this.siteService.getAssignedSite()

      this.buttonName        = 'Edit'
      this.buttoncheckInName = 'Check In'
      this.initClasses()
      this.initSubscriptions();

      if (this.params && this.gridApi && this.searchModel) {
        this.refreshSearch()
      }

      if (this.itemName && this.searchModel && this.searchForm) {
        this.itemName.setValue(this.searchModel.name)
      }
    };

    ngOnDestroy(): void {
      //Called once, before the instance is destroyed.
      //Add 'implements OnDestroy' to the class.
      if (this._searchModel){this._searchModel.unsubscribe()}
    }
        // sort(users, 'name', '-age', 'id')
    @HostListener("window:resize", [])
    updateScreenSize() {
      this.smallDevice = false
      if (window.innerWidth < 768) {
        this.smallDevice = true
      }
      this.initClasses()
    }

    initClasses()  {
      const platForm      = this.platForm;
      this.gridDimensions =  'width: 100%; height: 76vh;'
      this.agtheme  = 'ag-theme-material';
      if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 76vh;' }
      if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 76vh;' }

      if (this.smallDevice) {
        this.gridDimensions =  'width: 100%; height: 70vh;'
      }
    }

    initForm() {
      this.searchForm   = this.fb.group( {
        itemName          : [''],
      });
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

    //ag-grid
    //standard formating for ag-grid.
    //requires addjustment of column defs, other sections can be left the same.
    initAgGrid(pageSize: number) {
      this.frameworkComponents = {
        btnCellRenderer: ButtonRendererComponent
      };

      this.defaultColDef = {
        flex: 2,
        // minWidth: 100,
      };

      this.columnDefs =  [
        {
        field: 'id',
        cellRenderer: "btnCellRenderer",
                  cellRendererParams: {
                      onClick: this.editProductFromGrid.bind(this),
                      label: this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    flex: 2,
        },
        {
          field: 'id',
          cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                        onClick: this.checkIn.bind(this),
                        label: this.buttoncheckInName,
                        getLabelFunction: this.getCheckInLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 125,
                      maxWidth: 125,
                      flex: 2,
        },
        {headerName: 'First',     field: 'firstName',         sortable: true,
                    width   : 175,
                    minWidth: 175,
                    maxWidth: 275,
                    flex    : 1,
        },
        {headerName: 'Last',  field: 'lastName',      sortable: true,
                    width   : 175,
                    minWidth: 175,
                    maxWidth: 275,
                    // flex: 1,
        },
        {headerName: 'Phone',  field: 'phone',      sortable: true,
                width   : 175,
                minWidth: 175,
                maxWidth: 275,
                // flex: 1,
        },
        {headerName: 'Account',  field: 'lastName',      sortable: true,
                width   : 175,
                minWidth: 175,
                maxWidth: 175,
                // flex: 1,
        },
        { headerName: 'Image',
                    field: 'urlImageMain',
                    width: 100,
                    minWidth: 100,
                    maxWidth: 100,
                    sortable: false,
                    autoHeight: true,
                    cellRendererFramework: AgGridImageFormatterComponent
                  }
      ]

      this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);

    }

    listAll(){
      const control = this.itemName
      control.setValue('')
      this.initSearchModel();
      this.refreshSearch()
    }

    refreshSearchPhrase(event) {
      this.refreshSearch()
    }

    //this is called from subject rxjs obversablve above constructor.
    refreshSearch(): Observable<ClientSearchModel[]> {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      // const searchModel        = this.initSearchModel();
      if (!this.searchModel) {
        this.initSearchModel();
      }
      this.searchModel.name = this.itemName.value;
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
      if (!this.params) {return}
      this.onGridReady(this.params)
      return this._searchItems$
    }

    //initialize filter each time before getting data.
    //the filter fields are stored as variables not as an object since forms
    //and other things are required per grid.
    initSearchModel(): ClientSearchModel {
      let searchModel        = {} as ClientSearchModel;
      let search             = ''
      if (this.itemName.value) { searchModel.name = this.itemName.value  }
      searchModel.pageSize   = this.pageSize
      searchModel.pageNumber = this.currentPage
      this.contactService.updateSearchModel(searchModel)
      return searchModel
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
  getRowData(params, startRow: number, endRow: number):  Observable<ClientSearchResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel  =        this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.contactService.getContactBySearchModel(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    // if (!params) { return }
    if (params == undefined) { return }

    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            const resp         = data.paging
            if (resp) {
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
            }
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            if (data.results) {
              console.log('data', data)
              let unique = [...new Set(data.results)];
              console.log('unique', unique)
              unique  =  this.refreshImages(unique)
              params.successCallback(unique)
            }
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.contactService.getContact(site, this.id).subscribe(data => {
         this.product = data;
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
    if(rowData && rowData.hasIndicator && !rowData.accountDisabled)
      return this.buttoncheckInName
      else return this.buttoncheckInName
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    console.log(e.rowData.id);
    if (e.rowData.id)  {
      if (this.buttonName === 'Check In') {
        this.postNewCheckIn(e.rowData.id);
       } else {
        this.editItem(e.rowData.id)
      }
    }
  }

  checkIn(e) {
    if(!e) {
      return
    }
    console.log('post new checkin')
    this.postNewCheckIn(e.rowData.id);
  }

  assignItem(e){

  }

  refreshImages(data) {
    // const urlPath = this.urlPath
    // if (urlPath) {
    //   data.forEach( item =>
    //     {
    //       if (item.urlImageMain) {
    //         const list = item.urlImageMain.split(',')
    //         if (list[0]) {
    //           item.imageName = `${urlPath}${list[0]}`
    //         }
    //       }
    //     }
    //   )
    // }
    return data;
  }

  ///before ag-grid
  gotoAddClient(){
    const site = this.siteService.getAssignedSite();
    const user = {} as IUserProfile;
    const client$ = this.contactService.addClient(site,user)
    client$.subscribe( data => {
      this.editItem(data.id)
    })
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
    });

    if (selectedRows.length > maxToShow) {
    let othersCount = selectedRows.length - maxToShow;
    selectedRowsString +=
      ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
    this.selected = selected
    this.id = selectedRows[0].id;
    this.getItem(parseInt(this.id))
    // this.getItemHistory(this.id)
  }

  editItem(clientID:number) {
    this.router.navigate(["/profileEditor/", {id:clientID, miles:clientID }]);
  }

  postNewCheckIn(clientID:number) {
    const site = this.siteService.getAssignedSite()
    const payload = this.orderService.getPayLoadDefaults(null)
    payload.order.clientID = clientID;
    const postOrder$ = this.orderService.postOrderWithPayload(site, payload)
    this.action$ = postOrder$
  }

  async getCountOfPendingOrdersByClient(clientId: number): Promise<any> {

    let count = 0 ;
    const order$ =  this.orderService.getCountOfPendingOrdersByClient(this.siteService.getAssignedSite(), clientId)

    order$.subscribe(
      data => {
        count = data
        return count
    })

    this.currentCountOfPendingOrders = count

  }

  deleteCheckInsOfClient(clientID:number) {

    const numberRemoved = this.orderService.deleteCheckInsOfClient(this.siteService.getAssignedSite(), clientID)

    if (numberRemoved > 0 )  {
      this.notifyEvent("Pending Orders Removed", numberRemoved, 2000 )
    } else
    {
      this.notifyEvent("Pending Orders Not Removed", "", 2000 )
    }

  }

  displayFn(search) {
    console.log(search)
    this.selectItem(search)
    this.item = search
    this.search = search
    return search;
  }

  selectItem(search){
    if (search) {
      this.searchPhrase.next(search)
    }
  }

  notifyEvent(message: string, action: string , duration: number) {
    this._snackBar.open(message, action, {
      duration: duration,
      verticalPosition: 'top'
    });
  }
}
