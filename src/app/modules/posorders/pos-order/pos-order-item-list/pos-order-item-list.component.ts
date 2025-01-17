import { Component, Output, OnInit,
  ViewChild ,ElementRef, EventEmitter,
  OnDestroy, QueryList, ViewChildren, Input, HostListener, TemplateRef } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService, OrdersService, POSOrdersPaged} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormGroup } from '@angular/forms';
import {  concatMap, switchMap } from 'rxjs/operators';
import { Observable, of, Subject ,Subscription } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { IPOSOrder,  PosOrderItem } from 'src/app/_interfaces';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CommonModule, DatePipe } from '@angular/common';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { IonicModule } from '@ionic/angular';
import { AgGridModule } from 'ag-grid-angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

function multilineRenderer(params): any {
  // console.log(params.data)
  const productName = params.data?.productName || ''; // Fallback to empty string if undefined
  const barcode = params.data?.serialCode || ''; // Fallback to empty string if undefined
  return `${productName}  ${barcode}`;
}

@Component({
  selector: 'pos-order-item-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    IonicModule,AgGridModule,
  ],
  templateUrl: './pos-order-item-list.component.html',
  styleUrls: ['./pos-order-item-list.component.scss']
})
export class PosOrderItemListComponent  implements OnInit,OnDestroy {

  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  // @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  toggleListGrid = true // displays list of payments or grid
  //search with debounce: also requires AfterViewInit()
  // @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @Input() userAuths       :   IUserAuth_Properties;
  _order: Subscription;
  order: IPOSOrder;

  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  // get gridAPI(): GridApi {  return this.gridApi;  }
  private gridApi      : GridApi;

  action$: Observable<any>;
  //AgGrid
  params               : any;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  urlPath              : string;
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 10000
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             = true;
  islastpage              = true;
  value             : any;
  // //This is for the filter Section//
  //search form filters
  searchForm       : UntypedFormGroup;
  inputForm        : UntypedFormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions

  isAuthorized   : boolean;

  posOrders      : IPOSOrder[];
  posOrder       : IPOSOrder;
  id             : number;

  grid           = 'grid-flow'
  _orderBar      : Subscription;
  orderBar       : boolean;

  _menuBar       : Subscription;
  menuBar        : boolean;

  _searchBar     : Subscription;
  searchBar      : boolean;

  itemsPerPage      = 1000
  smallDevice : boolean;
  //list height
  openingProduct: boolean;

  message = ''
  @Input() height = "84vh"
  purchaseOrderEnabled: boolean;
  showCost : boolean;
  showRetail: boolean;
  @Input() filteredList : PosOrderItem[]
  fullPOSOrderItemList  : PosOrderItem[]
  initSubscriptions() {
    let clientID: number;
    if (this.userAuthorization.user && this.userAuthorization.user.roles === 'user') {
      clientID = this.userAuthorization.user.id;
    }
    this.currentOrderSusbcriber();
  }

  currentOrderSusbcriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe(
      data => {
        if (data) {
          this.order = data;
          if (this.order &&  this.order.serviceType &&
            (this.order.serviceType.toLowerCase() == 'purchase order' || this.order.serviceType.toLowerCase() === 'conversion')) {
              this.purchaseOrderEnabled = true;
          }
          this.refreshSearch()
          if (data.posOrderItems) {
            this.fullPOSOrderItemList = data.posOrderItems;
            // billOnHoldRemaining
            data.posOrderItems = this.calcSubitemValues(data.posOrderItems)
            data.posOrderItems.filter(item => {
              return item.idRef != item.id || item.idRef == null || item.idRef == 0
            })
            return of(data.posOrderItems)
          }
        }
        return of([])
    })

  }

  calcSubitemValues(posOrderItems) {
    posOrderItems.forEach(mainItem => {
      if (!mainItem.idRef) {  // If it's a main item (idRef is null)
        // Find subitems belonging to this main item
        const subItems = posOrderItems.filter(item => item.idRef === mainItem.id);

        // Sum the quantities of subitems
        const subItemsTotalQuantity = subItems.reduce((sum, subItem) => sum + subItem.quantity, 0);

        // Calculate and set billOnHoldRemaining
        mainItem.billOnHoldRemaining = mainItem.quantity - subItemsTotalQuantity;
      }
    });
    return posOrderItems
  }

  ngOnChanges() {
    if (this.filteredList) {
      this.refreshSearch()
    }
  }

  constructor(  private _snackBar               : MatSnackBar,
                private agGridService           : AgGridService,
                private siteService             : SitesService,
                private agGridFormatingService  : AgGridFormatingService,
                private userAuthorization       : UserAuthorizationService,
               private orderService            : OrdersService,
                private posOrderItemMethodsService: PosOrderItemMethodsService,
                private posOrderItemService    : POSOrderItemService,
                private productEditButtonService: ProductEditButtonService,
                private inventoryAssignmentService: InventoryAssignmentService,
                private orderMethodsService: OrderMethodsService,
              )
  {
  }

  ngOnInit() {
    this.initSubscriptions();
    this.initAgGrid(this.pageSize);
    this.rowSelection       = 'single'
    this.initAuthorization();
    this.initClasses();
  };

  ngOnDestroy(): void {
    if (this._order) {
      this._order.unsubscribe()
    }
    if (this._menuBar) {
      this._menuBar.unsubscribe()
    }
    if (this._orderBar) { this._orderBar.unsubscribe()}
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
  }

  initClasses()  {
    const platForm      = this.platForm;
    if (!this.height) { this.height = "84vh" }
    let height = this.height
    this.gridDimensions = `width: 100%; height: ${height}`
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions = `width: 100%; height: ${height}` }
    if (platForm === 'electron')  { this.gridDimensions = `width: 100%; height: ${height}` }
    if (this.smallDevice) {
      this.gridDimensions = 'width: 100%; height: 84vh;'
    }
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
    this.initClasses();
  }

  //ag-grid standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
  initAgGrid(pageSize: number) {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent,
      'multilineRenderer': multilineRenderer,
    };
    this.defaultColDef = {
      flex: 2,
    };

    let reconcilePass = false
    if (this.order.service && this.order?.service?.filterType == 2) {
      if (this.order.service.name != 'purchase order') {
        reconcilePass = true;
      }
    }

    let  columnDefs =  [];

    let rowItem = {
        headerName: "Row",
        valueGetter: "node.rowIndex + 1"
    }

    columnDefs.push(rowItem);

    let column = {
          headerName: 'ID',     field: 'id',
          sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
          hide: true,
    }
    columnDefs.push(column);

    // let nameCol = {headerName: 'Name',   field: 'productName',
    //           sortable: true,
    //           width   : 205,
    //           minWidth: 205,
    //           flex    : 2,
    //           cellRenderer: 'showMultiline',
    //           wrapText: true,
    //           cellStyle: {'white-space': 'normal', 'line-height': '1em'},
    //           autoHeight: true,
    // }
    // columnDefs.push(nameCol);

    let barcode = {
      headerName: 'Product',
      field: 'productName&serialCode',
      sortable: true,
      width: 205,
      minWidth: 205,
      flex: 2,
      wrapText: true,
      valueGetter: multilineRenderer,
      cellStyle: { 'white-space': 'normal', 'line-height': '1em' },
      autoHeight: true,
    };
    columnDefs.push(barcode);

    let fixEditQuantity: boolean
    fixEditQuantity = true
    if (this.order?.orderFeatures?.billOnHold == 1) {
      fixEditQuantity = false
    }
    let nextColumn =  {headerName: 'Quantity',     field: 'quantity',
          sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
          editable: fixEditQuantity,
          singleClickEdit: true
    }
    columnDefs.push(nextColumn);


    if (this.purchaseOrderEnabled &&  !reconcilePass) {

      nextColumn =  {headerName: 'InStock',     field: 'currentProductCount',
        sortable: true,
        width   : 100,
        minWidth: 100,
        maxWidth: 100,
        flex    : 2,
        editable: false,
        singleClickEdit: false}
      columnDefs.push(nextColumn);

      nextColumn =  {headerName: 'Sold',     field: 'salesCount',
        sortable: true,
        width   : 100,
        minWidth: 100,
        maxWidth: 100,
        flex    : 2,
        editable: false,
        singleClickEdit: false
      }
      columnDefs.push(nextColumn);

    }

    nextColumn =  {headerName: 'UOM',     field: 'unitName',
          sortable: true,
          width   : 100,
          minWidth: 100,
          maxWidth: 100,
          flex    : 2,
          editable: false,
          singleClickEdit: true
    }
    if (this.order.customerName != 'Inventory Monitor') {
       columnDefs.push(nextColumn);
    }

    const receivedColumn =  {headerName: 'Received',     field: 'qtyReceived',
      sortable: true,
      width   : 100,
      minWidth: 100,
      maxWidth: 100,
      flex    : 2,
      editable: false,
      singleClickEdit: true
    }
    if (this.order?.orderFeatures?.billOnHold == 1) {
      columnDefs.push(receivedColumn);
    }

    let currencyColumn = {headerName: 'Price',     field: 'unitPrice', sortable: true,
                    cellRenderer: this.agGridService.currencyCellRendererUSD,
                    width   : 100,
                    minWidth: 100,
                    maxWidth: 150,
                    flex    : 1,
                    editable: true,
                    singleClickEdit: true
    }
    if (this.order.customerName != 'Inventory Monitor') {
      if (!reconcilePass) {
        if (!this.purchaseOrderEnabled || this.showRetail) {
          columnDefs.push(currencyColumn);
        }
      }
    }

    currencyColumn = {headerName: 'Cost',     field: 'wholeSale', sortable: true,
        cellRenderer: this.agGridService.currencyCellRendererUSD,
        width   : 100,
        minWidth: 100,
        maxWidth: 150,
        flex    : 1,
        editable: true,
        singleClickEdit: true
    }
    if (this.order.customerName != 'Inventory Monitor') {
      if (!reconcilePass) {
        if ((this.purchaseOrderEnabled || this.showCost) || reconcilePass) {
          columnDefs.push(currencyColumn);
        }
      }
    }

    let wholeSaleCostTotal = {headerName: 'Cost Total',    field: 'wholeSaleCost', sortable: true,
        cellRenderer: this.agGridService.currencyCellRendererUSD,
        width   : 100,
        minWidth: 100,
        maxWidth: 100,
        flex    : 1,
        editable: true,
        singleClickEdit: true
    }

    if (this.order.customerName != 'Inventory Monitor') {
      if (!reconcilePass) {
        if ((this.purchaseOrderEnabled || this.showCost) || reconcilePass) {
          columnDefs.push(wholeSaleCostTotal);
        }
      }
    }

    let currencyTotalColumn = {headerName: 'Total',    field: 'total', sortable: true,
                cellRenderer: this.agGridService.currencyCellRendererUSD,
                width   : 100,
                minWidth: 100,
                maxWidth: 100,
                flex: 2,
    }
    if (this.order?.customerName != 'Inventory Monitor') {
        if (!reconcilePass) {
          if (!this.purchaseOrderEnabled || this.showRetail) {
            columnDefs.push(currencyTotalColumn);
          }
        }
    }

    let editButtonColumn = {headerName: 'Edit',  field: 'productID',
      cellRenderer: "btnCellRenderer",
      cellRendererParams: {
        onClick: this.editProductFromGrid.bind(this),
        label: 'edit',
        getLabelFunction: this.getLabel.bind(this),
        btnClass: 'btn btn-primary btn-sm'
      },
      minWidth: 125,
      maxWidth: 125,
      flex: 2,
    }
    if (this.purchaseOrderEnabled || this.showRetail) {
      columnDefs.push(editButtonColumn);
    }

    let receiveBillITem = {headerName: 'Receive Amt',  field: 'id',
      cellRenderer: "btnCellRenderer",
      cellRendererParams: {
        onClick: this.receiveQtyBillOnHold.bind(this),
        label: 'receive',
        getLabelFunction: this.getReceive.bind(this),
        btnClass: 'btn btn-primary btn-sm'
      },
      minWidth: 125,
      maxWidth: 125,
      flex: 2,
    }
    if (this.purchaseOrderEnabled && ( this.order?.orderFeatures?.billOnHold && this.order?.orderFeatures?.billOnHold != 0 ) ) {
      columnDefs.push(receiveBillITem);
    }

    let itemDelete =  { headerName: 'Delete', field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.deleteItem.bind(this),
          label: 'Delete',
          getLabelFunction: this.getLabel.bind(this),
          btnClass: 'btn btn-primary btn-sm'
      },
        minWidth: 100,
        width: 100,
        flex: 2,
    }

    if (this.order?.customerName != 'Inventory Monitor') {
      columnDefs.push(itemDelete);
    }

    if (this.order?.customerName != 'Inventory Monitor') {
      if (!reconcilePass) {
        if (!this.purchaseOrderEnabled || this.showRetail) {
          columnDefs.push(currencyTotalColumn);
        }
      }
    }

    if (reconcilePass) {
      nextColumn =  {headerName: 'Prior',     field: 'traceProductCount',
        sortable: true,
        width   : 100,
        minWidth: 100,
        maxWidth: 100,
        flex    : 2,
        editable: false,
        singleClickEdit: false
      }
      columnDefs.push(nextColumn);

      if (this.order?.customerName != 'Inventory Monitor') {
        if (this.purchaseOrderEnabled || reconcilePass) {
          nextColumn =  {headerName: 'Balance',     field: 'traceProductCalc',
            sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            flex    : 2,
            editable: false,
            singleClickEdit: false
          }
          columnDefs.push(nextColumn);
        }
      }

    }


    nextColumn =  {headerName: 'Scanned',     field: 'traceOrderDate',
                    sortable: true,
                    width   : 100,
                    minWidth: 100,
                    maxWidth: 100,
                    flex    : 2,
                    editable: false,
                    singleClickEdit: false
                  }

    if (this.order?.customerName != 'Inventory Monitor') {
      if (reconcilePass) {
        columnDefs.push(nextColumn);
      }
    }

    if (this.order?.customerName === 'Inventory Monitor') {
      nextColumn =  {headerName: 'Sales',     field: 'salesCount',
                  sortable: true,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
                  editable: false,
                  singleClickEdit: false }
      columnDefs.push(nextColumn);

      nextColumn =  {headerName: 'Expected',     field: 'expectedInventoryCount',
                  sortable: true,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
                  editable: false,
                  singleClickEdit: false}
      columnDefs.push(nextColumn);

      nextColumn =  {headerName: 'InStock',     field: 'currentProductCount',
                  sortable: true,
                  width   : 100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex    : 2,
                  editable: false,
                  singleClickEdit: false}
      columnDefs.push(nextColumn);

      nextColumn =  {headerName: 'Diff',     field: 'monitorDescrepency',
            sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            flex    : 2,
            editable: false,
            singleClickEdit: false}
      columnDefs.push(nextColumn);

      nextColumn =  {headerName: 'InvID',     field: 'inventoryAssignmentID',
            sortable: true,
            width   : 100,
            minWidth: 100,
            maxWidth: 100,
            flex    : 2,
            editable: false,
            singleClickEdit: false}
      columnDefs.push(nextColumn);
    }

    this.columnDefs = columnDefs;
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
    // this.gridOptions.api.setColumnDefs(this.columnDefs); // Optional to force update

  }

  deleteItem(e) {
    const orderItem = e.rowData;
    const index = this.getSelectedIndex()
    this.orderMethodsService.removeItemFromList(index, orderItem)
  }

  getSelectedIndex() {
    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedIndex = 0
    selectedRows.forEach(function (selectedRow, index) {
      selectedIndex  = index
    } )
    return selectedIndex;
  }

  autoSizeAll(skipHeader) {
    var allColumnIds = [];
    this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });
    this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }

  receiveQtyBillOnHold(e) {
    // console.log(e, e.rowData?.id)
    if (!e) { return }
    if (e.rowData.id)  {
      const site = this.siteService.getAssignedSite()
      const item$ = this.posOrderItemService.getPOSOrderItembyHistory(site, e.rowData.id, this.order.history)
      this.action$ =  item$.pipe(concatMap(data => {
        // 'get the list of these items'
        const filteredItems = this.fullPOSOrderItemList.filter(item => (item.id !== data.id && item.idRef == data.id) );
        const editor$ = this.productEditButtonService.openOrderItemEditor(data, 'billOnHold', filteredItems)
        return editor$
      }))
    }
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  editProductFromGrid(e) {
    // console.log(e, e.rowData?.productID)
    if (!e) { return }
    if (e.rowData.productID)  {
      this.editItemWithId(e.rowData.productID);
    }
  }

  editItemWithId(id:number) {
    if(!id) { return }
    this.productEditButtonService.openProductDialogObs(id).subscribe(
        data => {
          this.openingProduct = false
          return of(data)
      }
    )
  }

  editINV(e) {
    if (!e) { return }
    if (e.rowData.productID)  {

      // console.log('row data ', e.rowData, e.rowData.inventoryAssignmentID)
      if (e.rowData.inventoryAssignmentID != 0){
        this.inventoryAssignmentService.openInventoryItem(e.rowData.inventoryAssignmentID)
        return;
      }

      const site = this.siteService.getAssignedSite()
      if (e.rowData.history) {
        this.action$ = this.posOrderItemService.getPOSOrderItembyHistory(site, e.rowData.id, e.rowData.history).pipe(switchMap(data => {
          // console.log('data', data, data.inventoryAssignmentID)
          if (data.inventoryAssignmentID && data.inventoryAssignmentID != 0) {
            // console.log('open 2')
            this.inventoryAssignmentService.openInventoryItem(data.inventoryAssignmentID)
          }
          return of(data)
       }))
       return;
      }
      this.action$ =  this.posOrderItemService.getPOSOrderItem(site, e.rowData.id).pipe(switchMap(data => {
        // console.log('data', data, data.inventoryAssignmentID)
        if (data.inventoryAssignmentID && data.inventoryAssignmentID != 0) {
          // console.log('open 3')
          this.inventoryAssignmentService.openInventoryItem(data.inventoryAssignmentID)
        }
         return of(data)
      }))

    }
  }

  refreshSearchAny(event) {
    this.refreshSearch();
  }

  refreshSearch() {
    if (this.params) {
      this.params.startRow     = 1;
      this.params.endRow       = 1000;
    }
    this.onGridReady(this.params)
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
  getRowData(params, startRow: number, endRow: number):  Observable<PosOrderItem[]>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const site                = this.siteService.getAssignedSite()
    return of(this.order.posOrderItems)
  }

  //ag-grid standard method
  onGridReady(params: any) {

    if (!this.order || !this.order.posOrderItems) { return  }

    if (!params) { return };
    this.params = params;
    params.startRow = 1;
    params.endRow = 1000;

    let list = this.order.posOrderItems;
    if (this.filteredList) {
      list = this.filteredList
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
        params.successCallback(list)
      }
    }

    params.api.setDatasource(datasource);
    this.autoSizeAll(true)
    this.gridApi = params.api
    if (!this.gridApi) { return }

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
    }
  }

  setReconcilevalue(item) {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.posOrderItemService.changeItemQuantityReconcile(site, item).pipe(switchMap(data => {
      this.orderMethodsService.updateOrderSubscription(data)
      return of(data)
    }))
    return;
  }

  cellValueChanged(event) {
    const colName = event?.column?.colId

    const item = event.data as PosOrderItem

    if (item.inventoryAssignmentID && item.inventoryAssignmentID != 0) {
      this.siteService.notify('Item values must be changed from inventory window: id:' + item.inventoryAssignmentID, 'Close', 10000, 'green')
      return;
    }

    if (colName === 'unitPrice') {
      item.unitPrice = event.value;
    }
    if (colName === 'quantity') {
      item.quantity = event.value;

      if (this.order.service && this.order?.service?.filterType == 2) {
        this.setReconcilevalue(item)
        return;
      }
    }

    if (colName === 'wholeSale') {
      item.wholeSale = event.value
    }
    if (colName === 'wholeSaleCost') {

      item.wholeSaleCost = event.value
    }

    if (colName === 'total') {
      if (item.quantity == 0) {
        this.siteService.notify('Item quantity can not be zero when changing cost total.', 'close', 4000, 'yellow');
        return
      }
      item.wholeSale = event.value / item.quantity
    }

    this.action$ = this.updateValues(item, colName)
  }

  updateValues(item: PosOrderItem, colName: string) {
    const site = this.siteService.getAssignedSite();
    return this.saveSub(item, colName)
  }

  saveSub(item: PosOrderItem, editField: string): Observable<IPOSOrder> {
    const order$ = this.posOrderItemMethodsService.saveSub(item, editField).pipe(
      switchMap(data => {
        this.orderMethodsService.updateOrder(data)
        return of(data)
      }
    ))
    return order$
  }

  itemSelected(event) {
    // console.log(event)
  }

  assignItem(index: number){
    if (this.order != undefined) {
      const item =  this.order.posOrderItems[index]
      const result = this.orderMethodsService.updateLastItemSelected(item);
    }
  }

  onSelectionChanged(event) {

    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []
    let selectedIndex = 0;

    selectedRows.forEach(function (selectedRow, index) {
      selectedIndex = index;
      if (index >= maxToShow) { return; }
      if (index > 0) {  selectedRowsString += ', ';  }
        selected.push(selectedRow.id)
        selectedRowsString += selectedRow.name;
    });

    this.orderMethodsService.updateLastItemSelected(selectedRows[0]);

    if (selectedRows.length > maxToShow) {
      let othersCount = selectedRows.length - maxToShow;
      selectedRowsString +=
      ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    this.selected = selected
    if (selected && selectedRows && selectedRows[0]) {
      const item = selectedRows[0];
      this.id = item.id;
      const history = item.history
    }
  }

  deleteSelected() {
    if (this.userAuths.deleteInventory && this.selected) {
      const site = this.siteService.getAssignedSite()
      this.action$ = this.posOrderItemService.deletePOSOrderItems(site, this.order.id, this.selected).pipe(switchMap(data => {
        if (data.resultErrorDescription) {
          this.siteService.notify('Not authorized:' + data?.resultErrorDescription, 'close', 6000)
        } else {
          this.orderMethodsService.setActiveOrder(data.order);
        }
        return of(data)
      }))
      return;
    }
    this.siteService.notify('Not authorized', 'close', 3000, 'red')
  }

  getItem(id: number, history: boolean) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, id.toString(), history).subscribe(data => {
         this.posOrder = data;
        }
      )
    }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData) {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }
  getReceive(rowData) {
    if(rowData && rowData.hasIndicator)
      return 'receive';
      else return '';
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}


