import { Component, Inject } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { from, mergeMap, Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { store, StoresService } from 'src/app/_services/system/stores.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { IProduct } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { AgGridModule } from 'ag-grid-angular';

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
  selector: 'stores-manager',
  standalone:true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,AgGridModule],
  templateUrl: './stores-manager.component.html',
  styleUrls: ['./stores-manager.component.scss']
})
export class StoresManagerComponent {

  list: any[];
  CONCURRENCY_LIMIT = 10; // Number of concurrent requests
  menuItem: IMenuItem;
  gridApi:            GridApi;
  // gridColumnApi:      GridAlignColumnsDirective;
  searchGridOptions:  any;
  action$ : Observable<any>;
  //AgGrid
  // @ViewChild('agGrid') agGrid: AgGridAngular;
  displayedGridData: any[] = [];  // To store the real-time grid data

  gridStyle             ='width: 100%; height: 75vh;'
  gridOptions:           any
  columnDefs             = [];
  defaultColDef;
  frameworkComponents:   any;
  rowDataClicked1        = {};
  rowDataClicked2        = {};
  public rowData:        any[];
  public info:           string;

  paginationSize          = 100
  currentRow              = 1;
  currentPage             = 1
  pageNumber              = 1
  pageSize                = 100
  numberOfPages           = 1
  rowCount                = 100
  rowSelection;
  loading_initTypes      : boolean;
  selected               : any;
  stores              : store[];
  stores$ : Observable<store[]>;
  activeStores: boolean;
  product: IProduct;
  binaryValue: any;
  diaglog: boolean;

  constructor(  private siteService: SitesService,
                private storeService: StoresService,
                private menuService: MenuService,
                private dialogRef   : MatDialogRef<StoresManagerComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
    ) {


      console.log(data)
      if (data) {
        if (data.list) {
          this.list = data.list;
          this.activeStores = false;
          this.menuItem = null
          console.log('selected items', this.list)
          return;
        }
      }
      if (data) {
        if (data?.activeOnly) {
          this.activeStores = true
          this.menuItem = data?.menuItem
          this.diaglog = true
          this.gridStyle             ='width: 100%; height: 500px;'
        }
      }
  }

  ngOnInit()  {
    this.refreshData();
    this.initGridResults();
  }

  refreshData() {

    console.log('this.activestores,', this.activeStores, this.menuItem)
    if (this.activeStores || this.list) {
      if (this.menuItem || this.list) {
        let binaryValue : any  // Convert to bigint
        if (this.menuItem && this.menuItem?.storeBinaryValue) {
          binaryValue = BigInt(this.menuItem.storeBinaryValue);
        }

        this.stores$ = this.storeService.getActiveStores().pipe(
          switchMap(data => {
            const list = this.populateAssignedStores(binaryValue, data);
            console.log('active stores', list, binaryValue)
            return of(list);
          })
        );

        return;
      }
    }
    this.stores$ = this.storeService.getStores();
  }

  populateAssignedStores(binaryValue: bigint, list: store[]): store[] {
    list.forEach((store: store, index: number) => {

      if (!binaryValue) {

      } else {
        // Assign binaryValue based on store index or ID
        store.binaryValue = BigInt(1) << BigInt(index); // Using index
        // OR
        // store.binaryValue = BigInt(1) << BigInt(store.id - 1); // Using store.id
        // Ensure store.assign is correctly set based on the incoming binaryValue
        const storeBinaryValue = store.binaryValue;
        store.assign = (binaryValue & storeBinaryValue) !== BigInt(0);

        console.log(`Assigned binaryValue for ${store.name}: ${store.binaryValue.toString()}`);
      }

      // For grid display compatibility
      // store.displayBinaryValue = storeBinaryValue.toString();
    });

    // console.log('list assigned', list, binaryValue.toString());
    return list;
  }


  initGridResults() {
    this.initAGGridFeatures()
    this.frameworkComponents = {
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  assign() {
    if (this.menuItem) {
      if (this.menuItem.itemType.name === 'category') {

      }
      if (this.menuItem.itemType.name === 'department') {

      }
    }
  }

  updateItems() {

  }

  updateItem() {

  }

  initAGGridFeatures() {
    this.columnDefs =  [
      {headerName: 'Name', field: 'name',  editable: !this.activeStores,
        singleClickEdit: true,  sortable: true, maxWidth: 150, minWidth: 150},


    ]

    let active =
    {
      headerName: "Active",
        width:    100,
        minWidth: 100,
        maxWidth: 100,
        flex: 1,
        field: "active",
        editable: !this.activeStores,
        comparator: myComparator,
        cellRenderer: function(params) {
            var input = document.createElement('input');
            input.type="checkbox";
            input.checked = params.value;
            input.disabled = false;
            input.addEventListener('click', function (event) {  });
            return input;
        }
    }
    if (!this.activeStores) {
      this.columnDefs.push(active);
    }

    let item =    {
      headerName: "Assign",
        width:    100,
        minWidth: 100,
        maxWidth: 100,
        flex: 1,
        field: "assign",
        comparator: myComparator,
        cellRenderer: function(params) {
            var input = document.createElement('input');
            input.type="checkbox";
            input.checked = params.value;
            input.disabled = false;

             // Update the "assign" value in the store data when the checkbox is clicked
            input.addEventListener('change', function (event) {
              params.data.assign = input.checked;  // Update the data in the grid
            });

            return input;
        }
    }

    if(this.activeStores || this.list) {
      this.columnDefs.push(item);
    }

    this.initGridOptions()
  }

  initGridOptions()  {
    this.gridOptions = {
      pagination: true,
      paginationPageSize: 100,
      cacheBlockSize: 25,
      maxBlocksInCache: 800,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
      rowSelection: 'multiple',
    }
  }

  close() {
    if (!this.dialogRef) { return}
    this.dialogRef.close(this.product)
  }

  cellValueChanged(event) {
    const colName = event?.column?.colId.toString() as string;
    const item = event.data as store
    this.action$ = this.updateValues(event.data?.id , event.value, colName).pipe(switchMap(data => {
      if (data) {
        if (data.errorMessage) {
          this.siteService.notify(data.errorMessage, 'Close', 10000, 'red')
        }
      }
      return of(data)
    }))
  }


  onCellClicked(event) {
    const colName = event?.column?.colId.toString().trim() as string;

    console.log('event', colName, event.data, event.value)

    if (colName === 'assign') {
      this.generateBinaryValue();
      return;
    }

    if (colName === 'active') {
      let item = event.data
      item.active = !event.value
      this.action$ = this.updateValues(event.data.id, !event.value, 'active');
      event.value = !event.value;
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;  // Assign the gridApi when the grid is ready
    this.updateDisplayedGridData();  // Call to display grid data initially
  }

  updateDisplayedGridData() {
    const rowData = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));  // Get all row data
    this.displayedGridData = rowData;  // Store row data for real-time JSON view
  }

  generateBinaryValue() {
    let binaryValue = BigInt(0);

    if (!this.gridApi) {
      console.log('no grid api');
      return binaryValue;
    }

    // Iterate over each row in the grid data
    this.gridApi.forEachNode((node) => {
      const store = node.data as store;
      console.log(`Store: ${store.name}, assign: ${store.assign}, binaryValue: ${store.binaryValue}`);

      // Check if the "Assign" checkbox is checked
      if (store.assign) {
        if (store.binaryValue == null) {
          console.error(`store.binaryValue is null or undefined for store ${store.name}`);
          return;
        }

        // Ensure storeBinaryValue is a BigInt
        const storeBinaryValue = BigInt(store.binaryValue);

        // Accumulate binaryValue using BigInt values
        binaryValue |= storeBinaryValue;

        console.log('binaryValue assign ', storeBinaryValue.toString(), binaryValue.toString());
      }
    });

    const site = this.siteService.getAssignedSite();

    if (this.list) {
      this.assignItemList(binaryValue)
      this.binaryValue = binaryValue;
      return binaryValue;  // Return the final calculated
    }
    this.action$ = this.menuService.getProduct(site, this.menuItem.id).pipe(
      switchMap(data => {
        if (data) {
          data.storeBinaryValue = binaryValue.toString(); // Convert bigint to string
          this.product = data;
          return this.menuService.setBinaryValue(site, this.menuItem.id, data);
        }
        return of(null);
      })
    );

    this.binaryValue = binaryValue;
    return binaryValue;  // Return the final calculated binaryValue
  }

  assignItemList(binaryValue) {
    const site = this.siteService.getAssignedSite();

    this.action$ = this.menuService.setStoreBinaryList(site, binaryValue, this.list).pipe(
        switchMap(data => {
          if (data) {
            this.siteService.notify('Store values updated.', 'Close', 3000, 'green')
          }
          return of(null); // Handle cases where data is null
        })
    )

  }


  updateValues(id, value : any, fieldName: string): Observable<store> {
    if (!id) { return of(null) }
    let store = { } as store;
    store.id = id

    if (fieldName === 'name') {
      if (!value) {
        this.siteService.notify('Value can not be empty', 'close', 3000)
        return of(null)
      }
      store.name = value
    }
    if (fieldName === 'active')  {
      store.active = value
    }
    return this.storeService.putStore(store);
  }

}
