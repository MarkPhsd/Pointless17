import { Component,   Input, Output, OnInit,
  EventEmitter,
  HostListener,
  OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemBasicB, IProductSearchResultsPaged } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Observable, of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';

import { ClientSearchModel, IProduct, IUserProfile } from 'src/app/_interfaces';

import { Capacitor,  } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { EditSelectedItemsComponent } from '../productedit/edit-selected-items/edit-selected-items.component';
import { MatDialog } from '@angular/material/dialog';

//https://stackoverflow.com/questions/48931298/ag-grid-pagination-with-infinite-scrolling
// https://www.ag-grid.com/javascript-grid-cell-rendering/
// @HostBinding('@pageAnimations')
//https://plnkr.co/edit/pxUYf7xVznwz6vU7grCi?p=preview&preview

@Component({
  selector: 'app-productlistview',
  templateUrl: './productlistview.component.html',
  styleUrls: ['./productlistview.component.scss'],
  // animations:  [ fadeInAnimation ],
})
export class ProductlistviewComponent  implements OnInit, OnDestroy  {

//for list selecting.
@Input() hideAdd         : boolean;
@Input() hideEditSelected: boolean;
@Input() editOff         : boolean;
buttonName: string; //if edit off then it's 'Assign'
gridlist = "grid-list"

//needed for search component
searchForm:    UntypedFormGroup;
get itemName() {
  if (this.searchForm) {
    return this.searchForm.get("itemName") as UntypedFormControl;
  }
}

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
rowSelection         = 'multiple'
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
brands           : IUserProfile[];
categories$      : Observable<IMenuItem[]>;
departments$     : Observable<IMenuItem[]>;
productTypes$    : Observable<IItemBasicB[]>;
viewOptions$     = of(
  [
    {name: 'Active', id: 0},
    {name: 'All', id: 1},
    {name: 'Inactive', id: 2}
  ]
)

openingProduct  : boolean;
action$         : Observable<any>;
product$        : Observable<IProduct>;
//search form filters
inputForm        : UntypedFormGroup;
categoryID       : number;
subCategoryID    : number;
productTypeSearch: number;
productTypeID    : number;
departmentID     : number;
typeID           : number;
brandID          : number;
active           : boolean;
viewAll           = 1;

selected        : any[];
selectedRows    : any;
agtheme         = 'ag-theme-material';
gridDimensions
urlPath:        string;
value           : any;
id              : number;
product         : IProduct;
smallDevice: boolean;
listHeight : string;

categories: IMenuItem[];
subCategories: IMenuItem[];
subCategories$ : Observable<IMenuItem[]>;

subCategoriesList: IMenuItem[];
categoriesList: IMenuItem[];
departmentsList: IMenuItem[];


@Output() outputPromptItem = new EventEmitter();
_promptSubGroup : Subscription;
promptSubGroup  : PromptSubGroups;

initSubscriptions() {
  this._promptSubGroup = this.promptSubGroupService.promptSubGroup$.subscribe(data => {
     this.promptSubGroup = data;
  })
 }

constructor(  private _snackBar              : MatSnackBar,
              private promptSubGroupService  : PromptSubGroupsService,
              private menuService            : MenuService,
              private itemTypeService        : ItemTypeService,
              private contactsService        :  ContactsService,
              private agGridService          : AgGridService,
              private fb                     : UntypedFormBuilder,
              private siteService            : SitesService,
              private productEditButtonService: ProductEditButtonService,
              private agGridFormatingService : AgGridFormatingService,
              private awsService             : AWSBucketService,
              private dialog: MatDialog,
            )
  {
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  async ngOnInit() {
    this.updateScreenSize();

    const clientSearchModel       = {} as ClientSearchModel;
    clientSearchModel.pageNumber  = 1
    clientSearchModel.pageSize    = 1000;

    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()

    this.refreshSubCategories()
    this.refreshDepartments()
    this.refreshCategories()
    this.productTypes$  = this.itemTypeService.getBasicTypes(site)
    const brandResults$       = this.contactsService.getBrands(site, clientSearchModel)

    brandResults$.subscribe(data => {
      this.brands = data.results
    })

    if (this.editOff) {
      this.buttonName = 'Assign'
      this.initSubscriptions();
      this.gridlist = "grid-list-nopanel"
    }
    if (!this.editOff) {
      this.buttonName = 'Edit'
    }
  };

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

        if (this.departmentID == undefined)  {
          this.categoriesList = data;
          return of(data)
        }

        if (this.departmentID != 0 && this.departmentID != undefined) {
          this.categoriesList = data.filter(data => {return data.departmentID == this.departmentID});
          return of(data)
        }

        this.categoriesList = data;
        return of(data)
      })
    )
  }

  refreshDepartments() {
    const site          = this.siteService.getAssignedSite()
    this.departments$   = this.menuService.getListOfDepartmentsAll(site).pipe(
      switchMap(data => {
        this.departmentsList = data;
        return of(data)
      })
    )
  }
  setBrandID(event) {
    if (event && event.id) {
      this.brandID = event.id
      this.refreshSearch(1);
    }
  }

  ngOnDestroy(): void {
    if(this._promptSubGroup){this._promptSubGroup.unsubscribe()}
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if (window.innerWidth < 390) {
      this.smallDevice = true
      this.listHeight = '35vh';
      this.initClasses()
      return
    }

    if (window.innerWidth < 420) {
      this.smallDevice = true
      this.listHeight = '42vh';
      this.initClasses()
      return
    }
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '67vh';
      this.initClasses()
      return
    }

    if (window.innerWidth < 1200) {
      this.smallDevice = true
      this.listHeight = '67vh';
      this.initClasses()
      return
    }
    if (window.innerWidth > 1200) {
      this.smallDevice = true
      this.listHeight = '78vh';

      this.initClasses()
      return
    }
  }


  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions =  'width: 100%; height: 90%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }

    //height: 72vh; 1180
    //greater than 900 and less than  should be 73vh
    //less than 900 should be 67vh
    //393  < 42vh

  }

  listAll(){
    const control = this.itemName
    if (control) { control.setValue('') }
    this.categoryID        = 0;
    this.productTypeSearch = 0;
    this.brandID           = 0
    this.subCategoryID     = 0;
    this.initForm()
    this.refreshSearch(1);
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
      productTypeSearch : [this.productTypeSearch],
      brandID           : [this.brandID],
      categoryID        : [this.categoryID],
      departmentID      : [this.departmentID],
      subCategoryID:      [this.subCategoryID],
      viewAll           : [1],
    });
  }

  refreshSearchPhrase(event) {
    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.refreshSearch(1);
  }

  listInventoryValues() {
    const  site =  this.siteService.getAssignedSite()
    this.menuService.getInventoryValues(site).subscribe (data => {
      this.initAgGridInventoryValues(data.count);
      this.gridApi.setDatasource(data);
    })
  }

  initAgGridInventoryValues(pageSize: number) {
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
      {headerName: 'Name',     field: 'name',         sortable: true,
                  width   : 175,
                  minWidth: 175,
                  maxWidth: 275,
                  flex    : 1,
      },
      {headerName: 'Barcode',  field: 'barcode',      sortable: true,
                  width: 75,
                  minWidth: 125,
                  maxWidth: 150,
                  // flex: 1,
      },
      {headerName: 'Count',    field: 'productCount', sortable: true,
                  width: 90,
                  minWidth: 90,
                  maxWidth: 90,
                  // flex: 2,
      },
      {headerName: 'Category', field: 'category',     sortable: true,
                  width: 140,
                  minWidth: 140,
                  maxWidth: 200,
                // flex: 2,
      },
      {headerName: 'Department', field: 'department',     sortable: true,
            width: 140,
            minWidth: 140,
            maxWidth: 200,
          // flex: 2,
      },
      {
                  headerName: "Active",
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
        },
    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
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
      {headerName: 'Name',     field: 'name',         sortable: true,
                  width   : 175,
                  minWidth: 175,
                  maxWidth: 275,
                  editable: true,
                  singleClickEdit: true,
                  flex    : 1,
      },
      {headerName: 'Barcode',  field: 'barcode',      sortable: true,
                  width: 75,
                  minWidth: 125,
                  maxWidth: 150,
                  editable: true,
                  singleClickEdit: true,
                  // flex: 1,
      },
      {headerName: 'Count',    field: 'productCount', sortable: true,
                  width: 90,
                  minWidth: 90,
                  maxWidth: 90,
                  editable: true,
                  singleClickEdit: true,
                  // flex: 2,
      },
      {headerName: 'Department', field: 'department',     sortable: true,
            width: 140,
            minWidth: 140,
            maxWidth: 200,
          // flex: 2,
      },
      {headerName: 'Category', field: 'category',     sortable: true,
                  width: 140,
                  minWidth: 140,
                  maxWidth: 200,
                // flex: 2,
      },
      {headerName: 'Sub Cat', field: 'subCategory',     sortable: true,
            width: 140,
            minWidth: 140,
            maxWidth: 200,
          // flex: 2,
      },
      {headerName: 'Type', field: 'type', sortable: true,
                  width: 100,
                  minWidth: 100,
                  maxWidth: 125,
                  // flex: 2,
                  },
      {headerName: 'Retail',   field: 'retail',       sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width: 100,
                  minWidth: 100,
                  maxWidth: 125,
                  editable: true,
                  singleClickEdit: true,
                  // flex: 2,
                  },
      { headerName: 'Image',
                  field: 'imageName',
                  width: 75,
                  minWidth: 75,
                  maxWidth: 75,
                  sortable: false,
                  autoHeight: true,
                  cellRenderer: AgGridImageFormatterComponent
                  },
      {
                  headerName: "Active",
                  width:    100,
                  minWidth: 100,
                  maxWidth: 100,
                  flex: 1,
                  field: "active",
                  // editable: true,
                  //   singleClickEdit: true,
                  // cellRendererParams: {
                   //   // btnClass: 'btn btn-primary btn-sm'
                  cellRenderer: function(params) {
                      var input = document.createElement('input');
                      input.type="checkbox";
                      input.checked = params.value;
                      input.disabled = false;
                      input.addEventListener('click', function (event) {
                        // params.value = !params.value;
                        // params.node.data.fieldName = params.value;
                        // input.checked = !params.value;
                      });
                      // input.checked = !input.checked;
                      return input;
                  }
                // },

        },
    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  reverseValue(event) {
    return !event.value
  }
  onCellClicked(event) {
    // console.log('event' , event)
    const colName = event?.column?.colId.toString() as string;
    if (colName === 'active') {
      let item = event.data
      item.active = !event.value
      this.action$ = this.updateValues(event.data.id, !event.value, 'active');
      event.value = !event.value;
      this.refreshGrid()
      console.log(item)
    }
    // this.gridAPI.setRowData(item)
  }

  updateValues(id: number, itemValue: any, fieldName: string) {
    const site = this.siteService.getAssignedSite();
    return this.menuService.saveProductField(site, id, itemValue, fieldName)
  }

  cellValueChanged(event) {
    console.log('event',event?.value)
    const colName = event?.column?.colId.toString() as string;

    const item = event.data as IProduct

    // if (colName === 'retail') {
    //   item.retail = event.value;
    // }
    // if (colName === 'count') {
    //   item.productCount = event.value;
    // }
    // if (colName === 'barcode') {
    //   item.barcode = event.value;
    // }
    // if (colName === 'name') {
    //   item.name = event.value;
    // }
    // if (colName === 'active') {
    //   item.active = event.value;
    // }

    this.action$ = this.updateValues(event.data?.id , event.value, colName)
  }




  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): ProductSearchModel {
    let searchModel        = {} as ProductSearchModel;

    if (this.itemName) {
      if (this.itemName.value)          { searchModel.name        = this.itemName.value  }
    }
    if (this.subCategoryID )            { searchModel.subCategoryID  = +this.subCategoryID.toString(); }
    if (this.categoryID )               { searchModel.categoryID  = +this.categoryID.toString(); }
    if (this.productTypeSearch)         { searchModel.itemTypeID  = +this.productTypeSearch.toString(); }
    if (this.brandID)                   { searchModel.brandID     = +this.brandID.toString(); }
    if (this.departmentID)              { searchModel.departmentID= +this.departmentID.toString()}
    searchModel.viewAll    = this.viewAll;
    searchModel.active     = this.active;
    searchModel.barcode    = searchModel.name
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    searchModel.hideSubCategoryItems = false;
    // console.log('searchmodel', searchModel)
    return searchModel;
  }

  refreshSubCategoryChange(event) {
    this.subCategoryID = event;
    this.refreshSearch(1);
  }

  refreshCategoryChange(event) {
    this.categoryID = event;
    this.refreshSearch(1);
    this.refreshSubCategories();
  }

  refreshDepartmentChange(event) {
    this.departmentID = event;
    this.refreshSearch(1);
    this.refreshCategories();
    this.refreshSubCategories()
  }

  refreshProductTypeChange(event) {
    this.productTypeSearch = event;
    this.refreshSearch(1);
  }

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch(1);
  }

  refreshSearch(page: number) {
    this.initAgGrid(this.pageSize)
    const site               = this.siteService.getAssignedSite()
    if (page != 0) { this.currentPage         = page}
    const productSearchModel = this.initSearchModel();
    this.onGridReady(this.params)
  }

  refreshGrid() {
    this.refreshDepartments()
    this.refreshCategories();
    this.refreshSubCategories()
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
  getRowData(params, startRow: number, endRow: number):  Observable<IProductSearchResultsPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const productSearchModel  = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.menuService.getProductsBySearchForListsPaging(site, productSearchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)

      items$.subscribe(data =>
        {
            const resp         =  data.paging
            if (!resp)         {return}
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            let results        =  this.refreshImages(data.results)
            params.successCallback(results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  refreshImages(data) {
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

    this.getItem(this.id)

  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.product$  = this.menuService.getProduct(site, this.id).pipe(
        switchMap(data => {
          this.product = data;
          return of(data)
        })
      )
    }
  }

  editSelectedItem() {
    console.log('selected Items', this.selected)
    let id = 0;
    if (this.product) { id = this.product.id}
    if (this.selected){ id = this.selected[0]};
    if (id) {
      this.editItemWithId( this.id);
      return;
    }
    // console.log('editSelectedItem', this.product.id)
    // if (this.product) {
    //   this.id = this.product.id
    // }
  }

  getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
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

  onBtnClick1(e) {
    console.log('on button click1')
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    console.log('on button click2')
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (!e) {
      console.log('edit product from grid no data')
      return
    }
    if (e.rowData.id)  {
      if (this.buttonName === 'Edit') {
        this.editItemWithId(e.rowData.id);
       } else {
        this.assignItem(e)
      }
    }
  }

  editItemWithId(id:number) {
    if(!id) { return }
    // this.openingProduct = true
    // console.log('edit Item With Id',id)
    // this.product$ =
    this.productEditButtonService.openProductDialogObs(id).subscribe(
      // switchMap(
        data => {
        console.log('product', data)
        this.openingProduct = false
        return of(data)
      })
    // )
  }

  assignItem(e){
    if (this.promptSubGroup) {
      this.outputPromptItem.emit(e.rowData.id)
    }
  }

  getProductTypeID(event) {
    if (event) {this.productTypeID = event }
  }

  childAddItem() {
    this.productEditButtonService.openNewItemSelector()
  }

  editSelectedItems() {
    if (!this.selected) {
      this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
      return
    }
    console.log(this.selected)
    let dialogRef: any;
    const site = this.siteService.getAssignedSite();
    dialogRef = this.dialog.open(EditSelectedItemsComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '550px',
        minHeight:    '550px',
        data   : this.selected
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshGrid()
      }
    });
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

