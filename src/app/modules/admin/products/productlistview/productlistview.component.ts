import { Component,   Input, Output, OnInit,
  EventEmitter,
  HostListener,
  OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, ContactsService, MenuService, OrdersService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemBasicB, IProductSearchResultsPaged } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { Observable, of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';

import { ClientSearchModel, IProduct, IReconcilePayload, IUserProfile } from 'src/app/_interfaces';

import { Capacitor,  } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { EditSelectedItemsComponent } from '../productedit/edit-selected-items/edit-selected-items.component';
import { MatDialog } from '@angular/material/dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { A } from '@angular/cdk/keycodes';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

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

function sortData(data, sortModel) {
  console.log(data, sortModel)
  let comparator;
  const resultOfSort = data.slice();
  resultOfSort.sort(function (a, b) {
    for (let k = 0; k < sortModel.length; k++) {
      const sortColModel = sortModel[k];
      const valueA = a[sortColModel.colId];
      const valueB = b[sortColModel.colId];

      if (valueA == valueB) {
        continue;
      }
      const sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
      if (valueA > valueB) {
        return sortDirection;
      } else {
        return sortDirection * -1;
      }
    }
    return 0;
  });
  return resultOfSort;
}

@Component({
  selector: 'app-productlistview',
  templateUrl: './productlistview.component.html',
  styleUrls: ['./productlistview.component.scss'],
  // animations:  [ fadeInAnimation ],
})
export class ProductlistviewComponent  implements OnInit, OnDestroy  {

sortList  =['name', 'type',  'department' , 'category', 'subcategory', 'count', 'retail'];
pagingForm: FormGroup;
advanced: boolean;

requiresWorkList  = [{name: 'Yes', value: true}, {name: 'All', value: false}]
requiresWorkList$: Observable<any>;
//for list selecting.
@Input() hideAdd         : boolean;
@Input() hideEditSelected: boolean;
@Input() editOff         : boolean;
buttonName: string;
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
copy$: Observable<any>;

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
pageSize                = 50
currentRow              = 1;
currentPage             = 1
numberOfPages           = 1
startRow                = 0;
endRow                  = 0;
recordCount             = 0;
isfirstpage             : boolean;
islastpage              : boolean;
homePage$: Observable<UIHomePageSettings>;
uiHome: UIHomePageSettings;
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
requiresWork    : boolean;
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

urlPath$: Observable<string>;
@Output() outputPromptItem = new EventEmitter();
_promptSubGroup : Subscription;
promptSubGroup  : PromptSubGroups;
webWorkRequired: boolean;

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
              private dialog                 : MatDialog,
              private orderService           : OrdersService,
              private uiSettings: UISettingsService,
              private orderMethodsService: OrderMethodsService,
            )
  {  }

   ngOnInit() {

    this.homePage$ = this.initHomePageSettings().pipe(switchMap(data => {
      this.updateScreenSize();
      const clientSearchModel       = {} as ClientSearchModel;
      clientSearchModel.pageNumber  = 1
      clientSearchModel.pageSize    = 1000;
      this.urlPath$  =  this.awsService.awsBucketURLOBS().pipe(
        switchMap(data => {
          this.urlPath = data;
          return of(data)
        }
      ))

      const site                = this.siteService.getAssignedSite()
      this.refreshSubCategories();
      this.refreshDepartments();
      this.refreshCategories();
      this.productTypes$        = this.itemTypeService.getBasicTypes(site)
      const brandResults$       = this.contactsService.getBrands(site, clientSearchModel)

      brandResults$.subscribe(data => {
        this.brands = data.results
      })

      this.initForm();
      this.formSubscriber();

      this.buttonName = 'Edit'

      if (this.editOff) {
        this.buttonName = 'Assign'
        this.initSubscriptions();
        this.gridlist = "grid-list-nopanel"
      }

      this.initAgGrid(this.pageSize);
      this.requiresWorkList$ = of(this.requiresWorkList);

      this.initPaging();
      return of(data)
    }))

  };

  initHomePageSettings() {
    return  this.uiSettings.UIHomePageSettings.pipe(switchMap( data => {
      this.uiHome  = data as UIHomePageSettings;
      return of(data)
    }));
  }

  initPaging() {
    this.pagingForm = this.fb.group({
      pageSize  : [],
      pageNumber: [],
      sort      : []
    })
    this.pagingForm.patchValue(this.initSearchModel());
    this.pagingForm.valueChanges.subscribe(data => {
      this.currentPage = this.pagingForm.controls['pageNumber'].value;
      this.pageSize = this.pagingForm.controls['pageSize'].value;
      this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize , this.columnDefs, false);
      this.refreshGrid()
    })
  }


  refreshGroupingDataOnly() {
    const site             = this.siteService.getAssignedSite()
    this.categories$       = this.menuService.getListOfCategoriesAll(site);
    this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(switchMap(data => {
      this.subCategoriesList = data;
      return of(data)
    }))
  }



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

  setSortData(event) {
    if (event) {
      console.log(event)
      this.searchForm.patchValue({
        sortBy1: event?.sort1,
        sortBy1Asc : event?.sort1Asc,
        sortBy2 :event?.sort2,
        sortBy2Asc : event?.sort2Asc,
        sortBy3 : event?.sort3,
        sortBy3Asc : event?.sort3Asc
      })
      this.initSearchModel()
      this.refreshSearch(1);
    }
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
      bayName           : [],
      minQuantityFilter : [],
      webWorkRequired   : [false],
      sort1: [],

      sortBy1: [],
      sortBy1Asc : [],
      sortBy2 : [],
      sortBy2Asc : [],
      sortBy3 : [],
      sortBy3Asc : [],
    });
  }

  formSubscriber() {
    this.searchForm.controls['minQuantityFilter'].valueChanges.subscribe(value => {
      this.minQuantityFilterValue = value;
      // console.log(value)
      this.refreshSearch(1)
    });
    this.searchForm.controls['bayName'].valueChanges.subscribe(value => {
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

  deleteItem(e) {
    if (e.rowData.id)  {
      const site = this.siteService.getAssignedSite()
      const warn = window.confirm('Hey are you sure you want to delete this item?');
      if (!warn) { return }
      this.copy$ =  this.menuService.deleteProduct(site, e.rowData.id).pipe(switchMap(data => {
        this.refreshGrid()
        return of(data)
      }))
    }
  }

  copyFromGrid(e) {
    if (e.rowData.id)  {
      this.copyItem(e.rowData);
    }
  }

  copyItem(item: IProduct) {
    this.product = item;
    const site = this.siteService.getAssignedSite()
    this.copy$ = this.menuService.getProduct(site, this.product.id).pipe(switchMap(data => {
      data.name = this.product?.name + ' Copy '
      data.wholesale = 0;
      data.caseWholeSale = 0;
      data.productCount = 0;
      data.barcode = '';
      return this.menuService.postProduct(site, data)
    })).pipe(switchMap(data => {
        this.refreshGrid();
        this.editItemWithId(data.id);
        return of (data)
      }
    ))
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
      sortable: false,
    };

    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs, false);
    this.getCustomColoumnDefs()

  }

  getColumnDefs() {
    return [

      {headerName: 'Edit',  field: 'id',
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

      {headerName: 'Name',     field: 'name',
                  // sortable: true,
            width   : 175,
            minWidth: 175,
            maxWidth: 275,
            editable: true,
            singleClickEdit: true,
            flex    : 1,
            cellRenderer: 'showMultiline',
            wrapText: true,
            cellStyle: {'white-space': 'normal', 'line-height': '1em'},
            autoHeight: true,
      },

      {headerName: 'Barcode',  field: 'barcode',
                  // sortable: true,
            width: 75,
            minWidth: 125,
            maxWidth: 150,
            editable: true,
            singleClickEdit: true,
            cellRenderer: 'showMultiline',
            wrapText: true,
            cellStyle: {'white-space': 'normal', 'line-height': '1em'},
            autoHeight: true,
      },

      {headerName: 'Count',    field: 'productCount',
                  // sortable: true,
            width: 90,
            minWidth: 90,
            maxWidth: 90,
            editable: true,
            singleClickEdit: true,
            comparator: myComparator,
            // flex: 2,
      },

      {headerName: 'Department', field: 'department',
            // sortable: true,
            width: 140,
            minWidth: 140,
            maxWidth: 200,
            comparator: myComparator,
          // flex: 2,
      },

      {headerName: 'Category', field: 'category',
          // sortable: true,
          width: 140,
          minWidth: 140,
          maxWidth: 200,
          comparator: myComparator,
        // flex: 2,
      },

      {headerName: 'Sub Cat', field: 'subCategory',
          // sortable: true,
          width: 140,
          minWidth: 140,
          comparator: myComparator,
          maxWidth: 200,
        // flex: 2,
      },
      {headerName: 'Type', field: 'type',
          // sortable: true,
          width: 100,
          minWidth: 100,
          maxWidth: 125,
          comparator: myComparator,
          // flex: 2,
      },

      {headerName: 'Retail',   field: 'retail',
          cellRenderer: this.agGridService.currencyCellRendererUSD,
          width: 100,
          minWidth: 100,
          maxWidth: 125,
          editable: true,
          comparator: myComparator,
          singleClickEdit: true,
      },

      { headerName: 'Image',
          field: 'imageName',
          width: 75,
          minWidth: 75,
          maxWidth: 75,
          sortable: false,
          autoHeight: true,
          comparator: myComparator,
          cellRenderer: AgGridImageFormatterComponent
      },

      {headerName: 'Bay',   field: 'bayName',
          width: 100,
          minWidth: 100,
          maxWidth: 125,
          editable: true,
          comparator: myComparator,
          singleClickEdit: true,
      },

      {   headerName: 'Copy', field: "id",
          cellRenderer: "btnCellRenderer",
          cellRendererParams: {
            onClick: this.copyFromGrid.bind(this),
            label: 'copy',
            getLabelFunction: this.getLabelCopy.bind(this),
            btnClass: 'btn btn-primary btn-sm'
          },
          minWidth: 85,
          width: 85
      },

      {
        headerName: "Active",
          width:    100,
          minWidth: 100,
          maxWidth: 100,
          flex: 1,
          field: "active",
          comparator: myComparator,
          cellRenderer: function(params) {
              var input = document.createElement('input');
              input.type="checkbox";
              input.checked = params.value;
              input.disabled = false;
              input.addEventListener('click', function (event) {  });
              return input;
          }
      },

      {      headerName: 'Delete', field: "id",
             cellRenderer: "btnCellRenderer",
              cellRendererParams: {
              onClick: this.deleteItem.bind(this),
              label: 'delete',
              getLabelFunction: this.getLabelCopy.bind(this),
              btnClass: 'btn btn-primary btn-sm'
            },
            minWidth: 65,
            width: 65
      },
    ]
  }

  getCustomColoumnDefs() {
    this.columnDefs =  []

    const header=  {headerName: 'Edit',  field: 'id',
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
     }
     this.columnDefs.push(header)

      const itemName = {headerName: 'Name',     field: 'name',
                 // sortable: true,
           width   : 175,
           minWidth: 175,
           maxWidth: 275,
           editable: true,
           singleClickEdit: true,
           flex    : 1,
           cellRenderer: 'showMultiline',
           wrapText: true,
           cellStyle: {'white-space': 'normal', 'line-height': '1em'},
           autoHeight: true,
     }
     this.columnDefs.push(itemName)


     if (this.uiHome.gloabalSecondLanguage) {
       const language = {headerName: 'Language',     field: 'prodsecondLanguage',
               // sortable: true,
         width   : 175,
         minWidth: 175,
         maxWidth: 275,
         editable: true,
         singleClickEdit: true,
         flex    : 1,
         cellRenderer: 'showMultiline',
         wrapText: true,
         cellStyle: {'white-space': 'normal', 'line-height': '1em'},
         autoHeight: true,
       }
       this.columnDefs.push(language)
     }

     const barcode = {headerName: 'Barcode',  field: 'barcode',
                 // sortable: true,
           width: 75,
           minWidth: 125,
           maxWidth: 150,
           editable: true,
           singleClickEdit: true,
           cellRenderer: 'showMultiline',
           wrapText: true,
           cellStyle: {'white-space': 'normal', 'line-height': '1em'},
           autoHeight: true,
     }
     this.columnDefs.push(barcode)


     const Count = {headerName: 'Count',    field: 'productCount',
                 // sortable: true,
           width: 90,
           minWidth: 90,
           maxWidth: 90,
           editable: true,
           singleClickEdit: true,
           comparator: myComparator,
           // flex: 2,
     }
     this.columnDefs.push(Count)


     const Department = {headerName: 'Department', field: 'department',
           // sortable: true,
           width: 140,
           minWidth: 140,
           maxWidth: 200,
           comparator: myComparator,
         // flex: 2,
     }
     this.columnDefs.push(Department)


     const Category  = {headerName: 'Category', field: 'category',
         // sortable: true,
         width: 140,
         minWidth: 140,
         maxWidth: 200,
         comparator: myComparator,
       // flex: 2,
     }
     this.columnDefs.push(Category)


    const subCategory =  {headerName: 'Sub Cat', field: 'subCategory',
         // sortable: true,
         width: 140,
         minWidth: 140,
         comparator: myComparator,
         maxWidth: 200,
       // flex: 2,
     }
     this.columnDefs.push(subCategory)

     const type =  {headerName: 'Type', field: 'type',
         // sortable: true,
         width: 100,
         minWidth: 100,
         maxWidth: 125,
         comparator: myComparator,
         // flex: 2,
     }
     this.columnDefs.push(type)


     const retail =    {headerName: 'Retail',   field: 'retail',
         cellRenderer: this.agGridService.currencyCellRendererUSD,
         width: 100,
         minWidth: 100,
         maxWidth: 125,
         editable: true,
         comparator: myComparator,
         singleClickEdit: true,
     }
     this.columnDefs.push(retail)

     const imageName =  { headerName: 'Image',
         field: 'imageName',
         width: 75,
         minWidth: 75,
         maxWidth: 75,
         sortable: false,
         autoHeight: true,
         comparator: myComparator,
         cellRenderer: AgGridImageFormatterComponent
     }
     this.columnDefs.push(imageName)

     const bayName =   {headerName: 'Bay',   field: 'bayName',
         width: 100,
         minWidth: 100,
         maxWidth: 125,
         editable: true,
         comparator: myComparator,
         singleClickEdit: true,
     }
     this.columnDefs.push(bayName)

     const idField = {   headerName: 'Copy', field: "id",
         cellRenderer: "btnCellRenderer",
         cellRendererParams: {
           onClick: this.copyFromGrid.bind(this),
           label: 'copy',
           getLabelFunction: this.getLabelCopy.bind(this),
           btnClass: 'btn btn-primary btn-sm'
         },
         minWidth: 85,
         width: 85
     }
     this.columnDefs.push(idField)

     const active =  {
       headerName: "Active",
         width:    100,
         minWidth: 100,
         maxWidth: 100,
         flex: 1,
         field: "active",
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
     this.columnDefs.push(active)

     const idDelete = {      headerName: 'Delete', field: "id",
            cellRenderer: "btnCellRenderer",
             cellRendererParams: {
             onClick: this.deleteItem.bind(this),
             label: 'delete',
             getLabelFunction: this.getLabelCopy.bind(this),
             btnClass: 'btn btn-primary btn-sm'
           },
           minWidth: 65,
           width: 65
     }
     this.columnDefs.push(idDelete)

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
    }
  }

  updateValues(id: number, itemValue: any, fieldName: string) {
    const site = this.siteService.getAssignedSite();
    return this.menuService.saveProductField(site, id, itemValue, fieldName)
  }

  cellValueChanged(event) {
    const colName = event?.column?.colId.toString() as string;
    const item = event.data as IProduct

    this.action$ = this.updateValues(event.data?.id , event.value, colName).pipe(switchMap(data => {
      if (data) {
        if (data.errorMessage) {
          this.siteService.notify(data.errorMessage, 'Close', 10000, 'red')
        }
      }
      return of(data)
    }))
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

    const searchForm = this.searchForm.value;

    console.log('search', this.searchForm.value, searchForm.value)

    searchModel.viewAll    = this.viewAll;
    searchModel.active     = this.active;
    searchModel.barcode    = searchModel.name
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    searchModel.hideSubCategoryItems = false;

    // searchModel = searchForm.sort
    searchModel.sortBy1    =  searchForm?.sortBy1
    searchModel.sortBy1Asc =  searchForm?.sortBy1Asc
    searchModel.sortBy2    =  searchForm?.sortBy2
    searchModel.sortBy2Asc =  searchForm?.sortBy2Asc
    searchModel.sortBy3Asc =  searchForm?.sortBy3
    searchModel.sortBy3    =  searchForm?.sortBy3Asc

    searchModel.webWorkRequired = this.webWorkRequired
    searchModel.bayName    = searchForm?.bayName;

    if (this.searchForm.controls['minQuantityFilter'].value) {
      searchModel.minQuantityFilter = this.minQuantityFilterValue;
    }
    if (this.pagingForm) {
      const sort = this.pagingForm.controls['sort'].value;
      if (sort) {
        searchModel.sort = sort;
      }
    }
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
    this.refreshSearch(1)
  }

  refreshRequiredWork(event: any) {
    console.log(event, event.value)
    if (!event || !event.value) {
      this.webWorkRequired = false;
      this.refreshSearch(1)
      return;
    }
    this.webWorkRequired = event.value;
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
    const model = this.initSearchModel();
    console.log('refreshSearch', model)
    this.onGridReady(this.params)
  }

  refreshGrid() {
    this.refreshDepartments();
    this.refreshCategories();
    this.refreshSubCategories();
    this.onGridReady(this.params)
  }

  refreshOnlyData() {
    this.refreshGroupingDataOnly()
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
    if (params == undefined) { return }

    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
      params.api.sizeColumnsToFit();
      params.api.resetRowHeights();
    }

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

    params.api.sizeColumnsToFit();
    params.api.resetRowHeights();
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
    // console.log('selected Items', this.selected)
    let id = 0;
    if (this.product) { id = this.product.id}
    if (this.selected){ id = this.selected[0]};
    if (id) {
      this.editItemWithId( this.id);
      return;
    }
  }

  getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  publishReconciliation() {
    let item = {} as IReconcilePayload;

    const value = this.searchForm.value ;
    item.categoryID =  this.categoryID

    //we have to get the id because departmentiD is an object in the form
    item.departmentID = this.departmentID;
    item.itemTypeID = value?.productTypeSearch?.id;
    item.bayName = value?.bayName;
    return;
    this.action$ = this.orderMethodsService.publishReconciliation('Reconcile', item).pipe(switchMap(data => {
      this.siteService.notify('Inventory Monitoring enabled', 'close', 5000, 'green');
      return of(data)
    }))
  }

  inventoryMonitor() {
    let item = {} as IReconcilePayload;

    const value = this.searchForm.value ;
    item.categoryID =  this.categoryID
    //we have to get the id because departmentiD is an object in the form
    item.departmentID = this.departmentID;
    item.itemTypeID = this.productTypeID
    item.bayName = value?.bayName;

    this.action$ = this.orderMethodsService.publishReconciliation('Inventory Monitor', item).pipe(switchMap(data => {
      this.siteService.notify('Inventory Monitoring enabled', 'close', 5000, 'green');
      return of(data)
    }))
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator) {
      return this.buttonName
    } else return this.buttonName
  }

  onBtnClick1(e) {
    // console.log('on button click1')
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    // console.log('on button click2')
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (!e) {
      // console.log('edit product from grid no data')
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
    this.productEditButtonService.openProductDialogObs(id).subscribe(
      data => {
      this.openingProduct = false
      return of(data)
    })

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
    // console.log(this.selected)
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

