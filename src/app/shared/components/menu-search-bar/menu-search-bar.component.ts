import { Component,  Output, OnInit,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter,OnDestroy, HostListener, } from '@angular/core';
import { Router } from '@angular/router';
import { AWSBucketService, ContactsService, MenuService, OrdersService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProductSearchResults } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { ClientSearchModel, ClientSearchResults, IPOSOrder, IProduct, IUserProfile } from 'src/app/_interfaces';
import { Capacitor, Plugins,  } from '@capacitor/core';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { isDevMode } from '@angular/core';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
const { Keyboard } = Plugins;

@Component({
  selector:    'app-menu-search-bar',
  templateUrl: `./menu-search-bar.component.html`,
  styleUrls: ['./menu-search-bar.component.scss'],
})
export class MenuSearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
@ViewChild('departmentMenuTrigger') departmentMenuTrigger: MatMenuTrigger;

isOpen = false;

get platForm() {  return Capacitor.getPlatform(); }

@ViewChild('input', {static: true}) input: ElementRef;
@Output() itemSelect  = new EventEmitter();

searchPhrase:         Subject<any> = new Subject();
itemName: string //() { return this.searchForm.get("itemName") as FormControl;}
private readonly onDestroy = new Subject<void>();

// //search with debounce
searchItems$              : Subject<IProductSearchResults[]> = new Subject();
_searchItems$ = this.searchPhrase.pipe(
  debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
      this.refreshSearch()
  )
)

//This is for the filter Section//
brands$          : Observable<IUserProfile[]>;
categories$      : Observable<IMenuItem[]>;
departments$     : Observable<IMenuItem[]>;
productTypes$    : Observable<any[]>;

multifilter      = false;
tinyMode         = false;
//search form filters
searchForm       : FormGroup;
categoryID       : number;
productTypeSearch: any;
productTypeID    : number;
typeID           : number;
brandID          : number;
name             : any;
isDevMode        = false
type             : any;
category         : any;
brand            : any;
department       : any;
departmentID     : number;
tinyDepartmentFilter= false//for dispaly of icon with text or just icon.
toggleCatHeight         = 'toggle-buttons-height-size-tall'
toggleDepartmentHeight  = 'toggle-buttons-height-medium'
toggleTypeHeight        = 'toggle-buttons-height-short'
showIcon                = false;

urlPath          : string;
id               : number;
product          : IProduct

rowData:                any[];
pageSize                = 20
currentRow              = 1;
currentPage             = 1
numberOfPages           = 1
startRow                = 0;
endRow                  = 0;
recordCount             = 0;
isfirstpage             = 0;
islastpage              = 0;

selected            : any;
filter              : any;
searchIncrementer   = 1
hideSearch          = true;

keyboardOption      = false;
keyboardDisplayOn   = false;
toggleButton        = 'toggle-buttons-wide';

_order              :   Subscription;
order               :   IPOSOrder;
clientSearchModel   = {} as ClientSearchModel;

endOfRecords        = false;
loading             = false;
appName             = ''
isApp               = false;
value               : any;
clientSearchResults$: Observable<ClientSearchResults>;
itemsPerPage        : number;
totalRecords        : number;
pagingInfo          : IPagedList;

itemNameInput       : string;
smallDevice         : boolean;

isDepartmentOpen    = false;

_uiHomePage         : Subscription;
uiHomePage          : any;

initSubscriptions() {

  this._order = this.orderService.currentOrder$.subscribe( data => {
    this.order = data
  })

  this._uiHomePage = this.uiSettingsService.homePageSetting$.subscribe(data => {
    this.uiHomePage = data;
    if (data) {
      if (!data.sideToolbarDefaultBrand) { this.multifilter = false }
    }
  })

}

constructor(
    private menuService:            MenuService,
    private fb:                     FormBuilder,
    private siteService:            SitesService,
    private itemTypeService:        ItemTypeService,
    private contactsService:        ContactsService,
    private awsService     :        AWSBucketService,
    private router         :        Router,
    private orderService        :  OrdersService,
    private toolBarUIService    : ToolBarUIService,
    public  platFormService     : PlatformService,
    public  uiSettingsService   : UISettingsService,

  )
  {
    this.initForm();
    if (this.platForm.toLowerCase() === 'android') {  this.keyboardDisplayOn = true }
    this.isApp = this.platFormService.isApp()
  }

  async ngOnInit() {
    const site          = this.siteService.getAssignedSite()
    const clientSearchModel          = {} as ClientSearchModel;
    clientSearchModel.pageNumber     = 1
    clientSearchModel.pageSize       = 25;
    this.clientSearchModel           = clientSearchModel;
    this.clientSearchResults$        = this.contactsService.getLiveBrands(site, clientSearchModel)
    this.urlPath        = await this.awsService.awsBucketURL();
    this.categories$    = this.menuService.getListOfCategories(site)
    this.departments$   = this.menuService.getListOfDepartments(site)
    this.productTypes$  = this.itemTypeService.getBasicTypesByUseType(site, 'product')
    this.isDevMode      = isDevMode()
    this.initSubscriptions();
  };

  ngOnDestroy() {
    if (this._order)      { this._order.unsubscribe(); }
    if (this._uiHomePage) { this._uiHomePage.unsubscribe()}
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.toggleCatHeight         = 'toggle-buttons-height-short'
      this.toggleDepartmentHeight  = 'toggle-buttons-height-short'
      this.toggleTypeHeight        = 'toggle-buttons-height-short'
      this.showIcon = false;
      return
    }
    this.showIcon = true;
    this.toggleCatHeight         = 'toggle-buttons-height-size-tall'
    this.toggleDepartmentHeight  = 'toggle-buttons-height-medium'
    this.toggleTypeHeight        = 'toggle-buttons-height-short'
  }

  initForm() {

    let categoryID = 0
    let brandID = 0
    let typeSearchID = 0

    if (this.category) {
      categoryID =this.category.id;
    }
    if (this.brand) {
      brandID =this.brand.id;
    }
    if (this.productTypeSearch) {
      typeSearchID =this.productTypeSearch.id;
    }

    this.searchForm   = this.fb.group( {
      itemName          : [''],
      productTypeSearch : [typeSearchID],
      brandID           : [brandID],
      categoryID        : [categoryID],
    })
  }

  ngAfterViewInit() {
    // if (this.input) {
    //   fromEvent(this.input.nativeElement,'keyup')
    //   .pipe(
    //     filter(Boolean),
    //     debounceTime(250),
    //     distinctUntilChanged(),
    //     tap((event:KeyboardEvent) => {
    //       const search  = this.input.nativeElement.value
    //       this.input.nativeElement.focus();
    //       this.refreshSearch();
    //     })
    //   )
    //   .subscribe();
    // }
    if (this.platForm.toLowerCase() === 'android') {
      setTimeout(()=> {
        if (this.input && this.input.nativeElement) {
          this.input.nativeElement.focus();
          Keyboard.hide();
        }
      }, 200 )
    }
  }

  refreshSearchPhrase(event) {
    this.itemName = event;
    this.initProductSearchModel()
    this.refreshSearch();
  }

  toggleKeyboard() {
    if (this.platForm.toLowerCase() === 'android') {
      this.keyboardOption = !this.keyboardOption
      if (this.keyboardOption) {
        Keyboard.show()
        return
      }
      if (!this.keyboardDisplayOn) {
        Keyboard.hide()
        return
      }
    }
  }

  clearAll(){
    this.initProductSearchModel();
    this.input.nativeElement.value = '';
    this.input.nativeElement.focus();
    //set the toggle buttons as well:
    this.categoryID        = 0;
    this.brandID           = 0;
    this.typeID            = 0;
    this.productTypeSearch = null;
    this.productTypeID     = null;
    this.typeID            = null;
    this.brandID           = null;
    this.name              = null;
    if (this.platForm.toLowerCase() === 'android') {
      Keyboard.hide();
    }
  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  assignCategory(id: number) {
    let productSearchModel              = {} as ProductSearchModel;
    productSearchModel.categoryID       = id.toString();
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  assignItemTypeID(id: number) {
    let productSearchModel                = {} as ProductSearchModel;
    productSearchModel.itemTypeID         = id.toString();
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  assignDepartmentID(id: number) {
    let productSearchModel                = {} as ProductSearchModel;
    productSearchModel.departmentID       = id.toString();
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  initProductSearchModel() {
    let productSearchModel   = {} as ProductSearchModel;
    productSearchModel       = this.applyProductSearchModel(productSearchModel)
    return productSearchModel
  }

  applyProductSearchModel(productSearchModel: ProductSearchModel) : ProductSearchModel {

    productSearchModel.type         = null;
    productSearchModel.categoryID   = null;
    productSearchModel.departmentID = null;
    productSearchModel.name         = null;
    productSearchModel.barcode      = null;
    productSearchModel.departmentName = null;

    if (this.itemName) {
      productSearchModel.name               =  this.itemName;
      productSearchModel.useNameInAllFields = true
    }

    if (this.category )               {
      productSearchModel.categoryID       = this.category.id.toString();
      productSearchModel.categoryName     = this.category.name.toString();
    }

    if (this.department )               {
      productSearchModel.departmentID       = this.department.id.toString();
      productSearchModel.departmentName     = this.department.name.toString();
    }

    if (this.productTypeSearch)         {
      productSearchModel.itemTypeID       = this.productTypeSearch.id.toString();
      productSearchModel.type             = this.productTypeSearch.id.toString();
      productSearchModel.itemTypeName     = this.productTypeSearch.name.toString();
    }

    if (this.brand)                   {
      productSearchModel.brandID          = this.brand.id.toString();
      productSearchModel.brandName        = this.brand.company.toString();
    }

    productSearchModel.barcode    = productSearchModel.name
    productSearchModel.pageSize   = this.pageSize
    productSearchModel.pageNumber = this.currentPage
    this.menuService.updateMeunuItemData(productSearchModel)
    return productSearchModel

  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<IProductSearchResults[]> {
    try {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.initProductSearchModel();
      this.startRow            = 1;
      this.endRow              = this.pageSize;
      this.listItems(searchModel)
      return this._searchItems$
    } catch (error) {
      console.log('error', error)
    }
  }

  refreshCategorySearch(item: any) {
    // console.log('item', item)
    this.category = item
    this.clearDeparment()
    this.refreshSearch()
  }
  refreshBrandSearch(item: any) {
    this.brand = item
    this.clearDeparment()
    this.toolBarUIService.updateDepartmentMenu(null)
    this.refreshSearch()
  }
  refreshTypeSearch(item: any) {
    this.type = item
    this.clearDeparment()
    this.refreshSearch()
  }

  clearDeparment() {
    this.department= null;
    this.toolBarUIService.updateDepartmentMenu(null)
    this.toolBarUIService.updateDepartmentMenu(null)
  }

  refreshDepartmentSearch(item: any) {

    if (!item) { return }

    if (this.smallDevice) {
      this.tinyDepartmentFilter = true;
    }
    if (window.innerWidth < 368) {
      this.toolBarUIService.updateSearchBarWidth(55)
      this.smallDevice = true
      this.tinyDepartmentFilter = true;
    }

    this.department    = item;
    this.departmentID  = item.id;
    this.toolBarUIService.updateDepartmentMenu(item)
    if (!item)  { return }
  }

  openMenu() {
    this.departmentMenuTrigger.openMenu();
  }

  closeMenu() {
    this.departmentMenuTrigger.closeMenu();
  }

  listItems(model: ProductSearchModel) {
    this.searchIncrementer = this.searchIncrementer + 1;
    this.router.navigate(
      [
        "/menuitems-infinite", { value: this.searchIncrementer}
      ]
    )
    ;
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



}
