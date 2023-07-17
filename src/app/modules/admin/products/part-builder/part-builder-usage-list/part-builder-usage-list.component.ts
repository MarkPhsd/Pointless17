import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { IUserProfile, IProduct, ClientSearchModel } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IItemBasicB, MenuService, ContactsService, AWSBucketService, IProductSearchResultsPaged } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ButtonRendererComponent } from '../../../report-designer/widgets/button-renderer/button-renderer.component';
import { EditSelectedItemsComponent } from '../../productedit/edit-selected-items/edit-selected-items.component';

@Component({
  selector: 'app-part-builder-usage-list',
  templateUrl: './part-builder-usage-list.component.html',
  styleUrls: ['./part-builder-usage-list.component.scss']
})
export class PartBuilderUsageListComponent implements OnInit {
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
copy$: Observable<any>;
productID = 0;
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
errorMessage: string;
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
minQuantityFilterValue: any;
productTypeID    : number;
departmentID     : number;
typeID           : number;
brandID          : number;
active           : boolean;
viewAll           = 1;
graphVisible    : boolean;
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

buttonName: string;
editOff: boolean;
gridlist: string;


constructor(  private _snackBar              : MatSnackBar,
              private menuService            : MenuService,
              private itemTypeService        : ItemTypeService,
              private contactsService        :  ContactsService,
              private fb                     : UntypedFormBuilder,
              private siteService            : SitesService,
              private productEditButtonService: ProductEditButtonService,
              private agGridFormatingService : AgGridFormatingService,
              private awsService             : AWSBucketService,
              private dialog: MatDialog,
            )
  {


    this.initAgGrid(this.pageSize);
  }

  async ngOnInit() {
    this.updateScreenSize();

    const clientSearchModel       = {} as ClientSearchModel;
    clientSearchModel.pageNumber  = 1
    clientSearchModel.pageSize    = 1000;

    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()

    // this.refreshSubCategories()
    this.refreshDepartments()
    this.refreshCategories()
    this.productTypes$       = this.itemTypeService.getBasicTypes(site)
    const brandResults$       = this.contactsService.getBrands(site, clientSearchModel)

    brandResults$.subscribe(data => {
      this.brands = data.results
    })

    if (this.editOff) {
      this.buttonName = 'Assign'
      this.gridlist = "grid-list-nopanel"
    }
    if (!this.editOff) {
      this.buttonName = 'Edit'
    }
    this.initForm();
    this.formSubscriber();
  };

  // refreshSubCategories() {
  //   const site          = this.siteService.getAssignedSite()
  //   this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(
  //     switchMap(data => {
  //       if (this.categoryID != 0  && this.categoryID != undefined) {
  //         this.categoriesList = data.filter(data => {return data.categoryID == this.categoryID});
  //         return of(data)
  //       }
  //       this.subCategoriesList = data;
  //       return of(data)
  //     })
  //   )
  // }

  refreshCategories() {
    const site          = this.siteService.getAssignedSite()
    this.categories$    = this.menuService.getRecipeCategories(site).pipe(
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
    this.setGridDimensions()
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  setGridDimensions()  {
    if (this.graphVisible) {
      this.gridDimensions =  'width: 100%; height: calc( 95vh - 450px );'
      return
    }

    this.gridDimensions =  'width: 100%; height: calc( 95vh - 150px );'
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
      minQuantityFilter : [],
    });
  }

  formSubscriber() {
    this.searchForm.controls['minQuantityFilter'].valueChanges.subscribe(value => {
      this.minQuantityFilterValue = value;
      // console.log(value)
      this.refreshSearch(1)
    });

    this.searchForm.valueChanges.subscribe(data => {
      // console.log(data)
    })
  }

  refreshSearchPhrase(event) {
    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.refreshSearch(1);
  }

  getLabelCopy() {
    return 'copy'
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

      {headerName: '',
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                    onClick: this.editProductFromGrid.bind(this),
                      label: this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 155,
                    width: 155,
                    maxWidth: 255,
                    flex: 2,
      },
      {headerName: 'Name',     field: 'name',         sortable: true,
                  width   : 175,
                  minWidth: 175,
                  maxWidth: 275,
                  editable: false,
                  singleClickEdit: true,
                  flex    : 1,
      },
      {headerName: 'Count',    field: 'productCount', sortable: true,
                  width: 90,
                  minWidth: 90,
                  maxWidth: 90,
                  editable: false,
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
    if (this.searchForm.controls['minQuantityFilter'].value) {
      searchModel.minQuantityFilter = this.minQuantityFilterValue;
    }
    console.log('searchmodel', searchModel)
    return searchModel;
  }

  refreshSubCategoryChange(event) {
    this.subCategoryID = event;
    this.refreshSearch(1);
  }

  refreshCategoryChange(event) {
    this.categoryID = event;
    this.refreshSearch(1);
    // this.refreshSubCategories();
  }

  refreshDepartmentChange(event) {
    this.departmentID = event;
    this.refreshSearch(1);
    this.refreshCategories();
    // this.refreshSubCategories()
  }

  refreshProductTypeChange(event) {
    this.productTypeSearch = event;
    this.refreshSearch(1);
  }

  refreshActiveChange(event) {
    this.viewAll = event;
    this.refreshSearch(1)
  }

  refreshMinQuantityFilter(event) {
    // console.log('event', event)
    this.minQuantityFilterValue = event;
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
    // this.refreshSubCategories()
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
    if (this.categoryID) {
      return this.menuService.getRecipeUsageListFiltered(site, productSearchModel)
    }
    return this.menuService.getRecipeUsageList(site, productSearchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
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
            this.errorMessage  = data.errorMessage
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

    console.log('event')
    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []


    console.log(this.productID, selectedRows[0].id)
    if (selectedRows[0].id) {
      this.productID = selectedRows[0].id;
    }
    console.log(this.productID)



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


