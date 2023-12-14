import { T } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, UntypedFormGroup } from '@angular/forms';
import { GridApi } from 'ag-grid-community';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { IProduct, UnitType } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { PartBuilderComponentService } from 'src/app/_services/partbuilder/part-builder-component.service';
import { PartBuilderMainMethodsService } from 'src/app/_services/partbuilder/part-builder-main-methods.service';
import { PB_Components, PB_Main, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';

@Component({
  selector: 'part-builder-component-edit',
  templateUrl: './part-builder-component-edit.component.html',
  styleUrls: ['./part-builder-component-edit.component.scss']
})
export class PartBuilderComponentEditComponent implements OnInit {

  @Input()  pb_Main: PB_Main;
  @Input()  inputForm: FormGroup;
  action$  : Observable<any>;
  @Output() outPutRefresh  : EventEmitter<any> = new EventEmitter<any>();
  @Output() saveUpdate  : EventEmitter<any> = new EventEmitter<any>();
  unitSearchForm   : UntypedFormGroup;
  productSearchForm: UntypedFormGroup;
  _PB_Main      : Subscription;
  productName   : string;
  searchForm    : FormGroup;
  componentForm : FormGroup;
  pb_Component  : PB_Components;
  pb_Components$: Observable<PB_Components>;
  indexValue    : number = 1;
  menuItem      : IMenuItem;
  menuItem$     : Observable<IMenuItem>;
  product$      : Observable<any>;

  site = this.siteService.getAssignedSite()
  id: number;

  menuItemSelected:           IMenuItem;
  gridApi:            GridApi;
  // gridColumnApi:      GridAlignColumnsDirective;
  searchGridOptions:  any;

   // @ViewChild('agGrid') agGrid: AgGridAngular;
   gridOptions:           any
   columnDefs             = [];
   defaultColDef;
   frameworkComponents:   any;
   rowDataClicked1        = {};
   rowDataClicked2        = {};
   public rowData:        any[];
   public info:           string;

   paginationSize          = 50
   currentRow              = 1;
   currentPage             = 1
   pageNumber              = 1
   pageSize                = 50
   numberOfPages           = 1
   rowCount                = 50
   rowSelection;
   loading_initTypes      : boolean;
   selected               : any;


  initSubscription() {
    this._PB_Main = this.partBuilderMainMethodsService.PB_Main$.subscribe(data => {
      this.pb_Main = data;
      // console.log('data updated', data)
    })
  }

  constructor(private siteService: SitesService,
              private fb: FormBuilder,
              private productEditButtonService: ProductEditButtonService,
              private partBuilderMainService: PartBuilderMainService,
              private agGridService          : AgGridService,
              private partBuilderComponentService: PartBuilderComponentService,
              private partBuilderMainMethodsService: PartBuilderMainMethodsService,
              private partBuilderComponent: PartBuilderComponentService,
              private menuService: MenuService,
              private agGridFormatingService: AgGridFormatingService,
              ) {
  }
  ngOnInit(): void {
    this.initSubscription()
    this.initSearchForm();
    this.initGridResults()
  }

  addItem() {
    let item = {} as PB_Main;
    if (!this.pb_Main) {
      this.pb_Main = item
    } else {
      item = this.pb_Main
    }

    if (!item.pB_Components) {
      item.pB_Components = [] as PB_Components[]
    }

    let comp = {} as PB_Components;
    comp.id = this.index;
    comp.cost = 0
    comp.price = 0;
    comp.quantity = 1;
    item.pB_Components.push(comp)
    this.pb_Main = item;
    this.refreshData(item)
    this.enableEdit(comp);
  }

  initGridResults() {
    this.initAGGridFeatures()
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  editFromGrid(e) {
    if (e.rowData.id)  {
      this.enableEdit(e.rowData);
    }
  }

  deleteItem(e) {
    if (e.rowData.id)  {
      this.delete(e.rowData);
    }
  }

  openItem(e) {
    if (e.rowData.id)  {
      this.editItem(e.rowData);
    }
  }

  getLabelDelete() {
    return 'delete'
  }
  getLabelOpen() {
    return 'open'
  }

  initAGGridFeatures() {
    this.columnDefs =  [
      { field: "id",
        cellRenderer: "btnCellRenderer",
        cellRendererParams: {
          onClick: this.editFromGrid.bind(this),
          label: 'edit',
          getLabelFunction: 'edit',
          btnClass: 'btn btn-primary btn-sm'
        },
        minWidth: 65,
        width: 65
      },

      { field: "id",
          cellRenderer: "btnCellRenderer",
          cellRendererParams: {
            onClick: this.editFromGrid.bind(this),
            label: 'delete',
            getLabelFunction: this.getLabelDelete.bind(this),
            btnClass: 'btn btn-primary btn-sm'
          },
          minWidth: 65,
          width: 65
      },

      { field: "id",
          cellRenderer: "btnCellRenderer",
          cellRendererParams: {
            onClick: this.openItem.bind(this),
            label: 'open',
            getLabelFunction: this.getLabelOpen.bind(this),
            btnClass: 'btn btn-primary btn-sm'
          },
          minWidth: 65,
          width: 65
      },

      {headerName: 'Name',     field: 'name', sortable: true, minWidth: 150},
      {headerName: 'Unit',     field: 'item.unitName',  sortable: true, },
      {headerName: 'Quantity', field: 'quantity', sortable: true,
                    editable: true,
                    singleClickEdit: true,},
      {headerName: 'Cost',     field: 'cost', sortable: true,
                    cellRenderer: this.agGridService.currencyCellRendererUSD,
                    editable: true,
                    singleClickEdit: true, },
      {headerName: 'Price',    field: 'price', sortable: true,
                    cellRenderer: this.agGridService.currencyCellRendererUSD,
                    editable: true,
                    singleClickEdit: true,},
      {headerName: 'Current Count',    field: 'product.productCount', sortable: true},
    ]

    this.rowSelection = 'multiple';
    // this.initGridOptions()
    this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize, this.columnDefs, false);


  }

  cellValueChanged(event) {
    console.log('event', event?.value)
    const colName = event?.column?.colId.toString() as string;
    const item = event.data as PB_Components
    console.log('item', item)
    // return;
    item.product = null;
    this.edit(item)
  }

  onCellClicked(event) {

    const colName = event?.column?.colId.toString() as string;
  }


    //mutli select method for selection change.
    onSelectionChanged(event) {

      let selectedRows       = this.gridApi.getSelectedRows();
      let selectedRowsString = '';
      let maxToShow          = this.pageSize;
      let selected           = []

      if (selectedRows.length == 0) { return }
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
      console.log( this.id )
      this.getItem(this.id)

    }

  initGridOptions()  {
    this.gridOptions = {
      pagination: true,
      paginationPageSize: 50,
      cacheBlockSize: 25,
      maxBlocksInCache: 800,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
      rowSelection: 'multiple',
    }
  }

  refreshData(item) {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.partBuilderMainService.getItem(site, item.id).pipe(switchMap( data => {
      this.partBuilderMainMethodsService.updatePBMain(item)
      this.initSubscription()
      this.initSearchForm()
      return of(data)
      }
    ))
  }

  private getMenuItemSelected(id) {
    const site = this.siteService.getAssignedSite()
    if (!id) { return }
    this.action$ = this.menuService.getMenuItemByID(site, id).pipe(switchMap(data => {
        this.menuItemSelected = data;
        return of(data)
      })
    )
  }

  get index() {
    return this.getRandomInt(1, 2000000)
  }

  getRandomInt(min, max) : number{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateView() {
    const item$ = this.partBuilderMainService.getItem(this.site, this.pb_Main.id).pipe(switchMap(data => {
      this.partBuilderMainMethodsService.updatePBMain(data)
      return of(data)
    }))
    return item$
  }

  enableEdit(item: PB_Components) {
    this.pb_Component = item;
    this.initComponentForm(item)
    this.getMenuItemSelected(item?.productID)
  }

  onGridReady(params) {
    if (params) {
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
    }
    if (!params)  { console.log('no params')}
  }

  initComponentForm(item: PB_Components) {
    this.componentForm = this.fb.group({
      id: [],
      name: [],
      productID: [],
      unitTypeID:[],
      unitName: [],
      quantity:[],
      cost:[],
      price:[],
      product: []
    })

    this.componentForm.patchValue(item);
    this.initUnitSearchForm(item)
    this.initProductSearchForm(item)

  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      productName: []
    })
  }

  edit(item: PB_Components) {
    console.log(item)
    this.action$ =  this.partBuilderComponent.saveItemValues(this.site, item).pipe(switchMap(data => {
      if (data && data.errorMessage ) {
        this.siteService.notify(`Error ${data.errorMessage}`, 'Close', 10000, 'red' )
        return of(null)
      }
      if (!data || data.toString().toLowerCase() === 'not found') {
        this.siteService.notify(' Item not found or updated', 'close', 2000, 'red')
      }
      return this.updateView()
    }))
  }

  editItem(item) {
    if (!item) { return }
    this.product$ = this.productEditButtonService.openProductDialogObs(item.productID).pipe(switchMap(data => {
      const dialog = data
      dialog.afterClosed().subscribe(result => {
        this.outPutRefresh.emit(true)
      })
      return of(data)
    }))
  }

  delete(item) {
    if (this.pb_Main.pB_Components) {
      this.pb_Main.pB_Components = this.pb_Main.pB_Components.filter(data => {return data.id != item.id})
      this.action$ = this.partBuilderComponent.deleteComponent(this.site, item.id).pipe(switchMap(data => {
        if (!data || data.toString().toLowerCase() === 'not found') {
          this.siteService.notify(' Item not found or deleted', 'close', 2000, 'red')
        }
        return of(data)
      }))
    }
  }

  assignProduct(event) {
    if (this.pb_Component) {

      //then we want to ensure we get tthe actual product.
      const site = this.siteService.getAssignedSite()
      this.action$ = this.menuService.getMenuItemByID(site, event.id).pipe(switchMap(data => {
        this.pb_Component.product = event
        this.pb_Component.productID = event.id;
        this.pb_Component.price = event.retail;
        this.pb_Component.cost = event.wholeSale;
        this.pb_Component.name = event?.name

        this.menuItemSelected = data;
        this.componentForm.patchValue(this.pb_Component);
        return of(data)
      }))
    }
  }

  assignItem(event) {
    if (this.pb_Component) {
      this.pb_Component.unitType = event
      this.pb_Component.unitTypeID = event.id;
      this.pb_Component.unitName = event?.name
      this.componentForm.patchValue(this.pb_Component);
    }
  }

  getItem(event) {
    const item = event
    if (item && item.id) {
      this.menuService.getMenuItemByID(this.site, item.id).subscribe(data => {
          this.menuItem = data
          this.pb_Component.price = data.retail;
          this.pb_Component.cost = data.wholesale;
          this.pb_Component.productID = data.id;
          this.pb_Component.unitTypeID = data.unitTypeID;
          this.pb_Component.name = data.name;
          this.pb_Component.quantity = +this.componentForm.controls['quantity'].value;
          this.pb_Component.product = this.menuItem;
          this.componentForm.patchValue(this.pb_Component);
          this.setThisPBComponent(this.pb_Component)
          this.initSearchForm();
        }
      )
    }
  }

  setThisPBComponent(component: PB_Components) {
    const item = this.pb_Main.pB_Components.filter(data => {return data.id == component.id})
    const result = this.pb_Main.pB_Components.find(data => {
      if (data.id == component.id) {
        this.pb_Main.pB_Components = this.replaceObject(component, this.pb_Main.pB_Components);
      }
    })

    this.partBuilderMainMethodsService.updatePBMain(this.pb_Main)
  }

  replaceObject(newObj: any, list: any[]): any[] {
    return list.map((obj) => obj.id === newObj.id ? newObj : obj);
  }

  initUnitSearchForm(item: PB_Components) {
    if (!item) {
      this.clearUnit()
      return
    }
    this.componentForm.patchValue({ unitTypeID: item.unitTypeID})
    this.unitSearchForm = this.fb.group({
      searchField: [item?.unitType?.name]
    })
  }

  initProductSearchForm(item: PB_Components) {
    if (!item) {
      this.clearUnit()
      return
    }
    this.componentForm.patchValue({ productID: item.productID})
    this.productSearchForm = this.fb.group({
      searchField: [item?.name]
    })
  }

  clearUnit() {
    this.componentForm.patchValue({ unitTypeID: 0})
    this.unitSearchForm = this.fb.group({
      searchField: []
    })
  }

  clearProduct() {
    this.componentForm.patchValue({ productID: 0})
    this.productSearchForm = this.fb.group({
      searchField: []
    })
  }
  saveEdit() {
    if (this.componentForm) {
      this.pb_Component = this.componentForm.value
      this.setThisPBComponent(this.pb_Component);
      this.componentForm = null
      this.saveUpdate.emit(true)
    }
  }

}
