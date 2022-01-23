import { Component,   Input, Output, OnInit,
  EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemBasicB, IProductSearchResultsPaged } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ClientSearchModel, IProduct, IUserProfile } from 'src/app/_interfaces';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
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
export class ProductlistviewComponent  implements OnInit  {

//for list selecting.
@Input() hideAdd         : boolean;
@Input() hideEditSelected: boolean;
@Input() editOff         : boolean;
buttonName: string; //if edit off then it's 'Assign'
gridlist = "grid-list"

//needed for search component
searchForm:    FormGroup;
get itemName() {
  if (this.searchForm) {
    return this.searchForm.get("itemName") as FormControl;
  }
}

get platForm()         {  return Capacitor.getPlatform(); }
get PaginationPageSize(): number {return this.pageSize;  }
get gridAPI(): GridApi {  return this.gridApi;  }

//AgGrid
params               : any;
private gridApi      : GridApi;
private gridColumnApi: GridAlignColumnsDirective;
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

//search form filters
inputForm        : FormGroup;
categoryID       : number;
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
              private fb                     : FormBuilder,
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
    this.initClasses()

    const clientSearchModel       = {} as ClientSearchModel;
    clientSearchModel.pageNumber  = 1
    clientSearchModel.pageSize    = 1000;

    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()
    this.categories$    = this.menuService.getListOfCategories(site)
    this.departments$   = this.menuService.getListOfDepartments(site)
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

  setBrandID(event) {
    if (event && event.id) {
      this.brandID = event.id
      this.refreshSearch();
    }
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions =  'width: 100%; height: 90%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
      productTypeSearch : [this.productTypeSearch],
      brandID           : [this.brandID],
      categoryID        : [this.categoryID],
      departmentID      : [this.departmentID],
      viewAll           : [1],
    });
  }

  refreshSearchPhrase(event) {
    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.refreshSearch();
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
                  // flex: 2,
                  },
      { headerName: 'Image',
                  field: 'imageName',
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

    if (control) {
      control.setValue('')
    }
    this.categoryID        = 0;
    this.productTypeSearch = 0;
    this.brandID           = 0
    this.initForm()
    this.refreshSearch()
  }


  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(): ProductSearchModel {
    let searchModel        = {} as ProductSearchModel;

    if (this.itemName) {
      if (this.itemName.value)          { searchModel.name        = this.itemName.value  }
    }

    if (this.categoryID )               { searchModel.categoryID  = this.categoryID.toString(); }
    if (this.productTypeSearch)         { searchModel.itemTypeID  = this.productTypeSearch.toString(); }
    if (this.brandID)                   { searchModel.brandID     = this.brandID.toString(); }
    if (this.departmentID)              { searchModel.departmentID= this.departmentID.toString()}
    searchModel.viewAll    = this.viewAll;
    searchModel.active     = this.active;
    searchModel.barcode    = searchModel.name
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    return searchModel;
  }

  refreshCategoryChange(event) {
    this.categoryID = event;
    this.refreshSearch();
  }

  refreshDepartmentChange(event) {
    this.departmentID = event;
    this.refreshSearch();
  }

  refreshProductTypeChange(event) {
    this.productTypeSearch = event;
    this.refreshSearch();
  }

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch();
  }

  refreshSearch() {
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    this.onGridReady(this.params)
  }

  refreshGrid() {
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
      this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)

      items$.subscribe(data =>
        {
            const resp         =  data.paging
            // console.log('data', data)
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
    this.getItemHistory(this.id)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.menuService.getProduct(site, this.id).subscribe(data => {
         this.product = data;
        }
      )
    }
  }

  async getItemHistory(id: any) {
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
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (!e) {return}
    if (e.rowData.id)  {
      if (this.buttonName === 'Edit') {
        this.editItemWithId(e.rowData.id);
       } else {
          this.assignItem(e)
      }
    }
  }

  editItemWithId(id:any) {
    if(!id) {
      return
    }
    this.productEditButtonService.openProductDialog(id);
  }

  editProduct(e){
    this.editItemWithId(e.id)
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

