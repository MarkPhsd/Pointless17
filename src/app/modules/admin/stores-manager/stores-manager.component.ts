import { Component, Inject } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { store, StoresService } from 'src/app/_services/system/stores.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { IProduct } from 'src/app/_interfaces';

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
  templateUrl: './stores-manager.component.html',
  styleUrls: ['./stores-manager.component.scss']
})
export class StoresManagerComponent {

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

  // refreshData() { 
  //   if (this.activeStores) { 
  //       if (this.menuItem) { 
  //       let binaryValue =  this.menuItem?.storeBinaryValue
  //       this.stores$ = this.storeService.getActiveStores().pipe(switchMap(data  => { 
  //         const list = this.populateAssignedStores(binaryValue, data)
  //         return of(list)
  //       }))
  //       return;
  //     }
  //   }
  //   this.stores$ = this.storeService.getStores()
  // }
  refreshData() { 
    if (this.activeStores) { 
      if (this.menuItem) { 
        let binaryValue = BigInt(this.menuItem.storeBinaryValue);  // Convert to bigint
        
        this.stores$ = this.storeService.getActiveStores().pipe(
          switchMap(data => { 
            const list = this.populateAssignedStores(binaryValue, data);
            console.log(list)
            return of(list);
          })
        );
        
        return;
      }
    }
    this.stores$ = this.storeService.getStores();
  }

  populateAssignedStores(binaryValue: bigint, list: store[]): store[] {
    try {
      // Iterate over each store in the list and assign based on the binaryValue
      list.forEach((store: store) => {
        // Ensure store.binaryValue is not null or undefined
        if (store.binaryValue == null) {
          console.error(`store.binaryValue is null or undefined for store ${store.name}`);
          store.assign = false;
          return;
        }
  
        // Convert store.binaryValue to bigint
        const storeBinaryValue = BigInt(store.binaryValue);
  
        // Check if the store's binary value is part of the passed-in binaryValue
        store.assign = (binaryValue & storeBinaryValue) !== BigInt(0);  // Use BigInt(0) for comparison
      });
  
      console.log('list assigned', list, binaryValue.toString());
      return list;
  
    } catch (error) {
      console.log(error);
    }
    return [];
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

    if(this.activeStores) { 
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

    // console.log('event',colName, event.data, event.value)

    if (colName === 'assign') { 
      this.generateBinaryValue();
      return;
    }

    if (colName === 'active') {
      let item = event.data
      item.active = !event.value
      this.action$ = this.updateValues(event.data.id, !event.value, 'active');
      event.value = !event.value;
      // this.refreshGrid()
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

  // generateBinaryValue() {
  //   let binaryValue = 0;
    
  //   if (!this.gridApi) {
  //     console.log('no grid api');
  //     return;
  //   }
    
  //   // Iterate over each row in the grid data
  //   this.gridApi.forEachNode((node) => {
  //     const store = node.data as store;
  //     console.log(store?.name, store.assign);
      
  //     // Check if the "Assign" checkbox is checked
  //     if (store.assign) {
  //       // Calculate the binary value for the selected store
  //       const storeIndex = store.id - 1; // Assuming store.id starts from 1
  //       binaryValue |= (1 << storeIndex); // Use bitwise OR to add the store's value
  //     }
  //   });
  
  //   // Update the component's binaryValue
  //   this.binaryValue = binaryValue;
  //   // this.menu

  //   const site = this.siteService.getAssignedSite()
  //   this.action$ = this.menuService.getProduct(site, this.menuItem.id).pipe(switchMap(data => {
  //     if (data) { 
  //       data.storeBinaryValue = this.binaryValue
  //       this.product = data;
  //       return this.menuService.setBinaryValue(site, this.menuItem.id, data)
  //     }
  //     return of(null)
  //   }))
  
  // }


  
  generateBinaryValue() {
    let binaryValue = BigInt(0);
  
    if (!this.gridApi) {
      console.log('no grid api');
      return;
    }
  
    // Iterate over each row in the grid data
    this.gridApi.forEachNode((node) => {
      const store = node.data as store;
  
      // Check if the "Assign" checkbox is checked
      if (store.assign) {
        // Ensure store.binaryValue is also a bigint
        const storeBinaryValue = BigInt(store.binaryValue);
        binaryValue |= storeBinaryValue;  // Use the store's binary value
      }
    });
  
    const site = this.siteService.getAssignedSite();
  
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

  updateValues(id, value : any, fieldName: string): Observable<store> {
    if (!id) { return of(null)}
  
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
