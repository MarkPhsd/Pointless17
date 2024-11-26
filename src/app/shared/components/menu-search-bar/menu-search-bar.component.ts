import { Component,  Output, OnInit,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter,OnDestroy, HostListener, TemplateRef, } from '@angular/core';
import { Router } from '@angular/router';
import { AWSBucketService, AuthenticationService, ContactsService, MenuService, OrdersService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProductSearchResults } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { ClientSearchModel, ClientSearchResults, IPOSOrder, IProduct, IUserProfile } from 'src/app/_interfaces';
import { Capacitor, Plugins,  } from '@capacitor/core';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { isDevMode } from '@angular/core';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ProductFilterComponent } from '../../widgets/product-filter/product-filter.component';
import { SearchDebounceInputComponent } from '../../widgets/search-debounce-input/search-debounce-input.component';
import { PriceScheduleMenuListComponent } from 'src/app/modules/priceSchedule/price-schedule-menu-list/price-schedule-menu-list.component';
import { MatToggleSelectorComponent } from '../../widgets/mat-toggle-selector/mat-toggle-selector.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
const { Keyboard } = Plugins;

@Component({
  selector:    'app-menu-search-bar',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ProductFilterComponent,SearchDebounceInputComponent,PriceScheduleMenuListComponent,
    MatToggleSelectorComponent
  ],
  templateUrl: `./menu-search-bar.component.html`,
  styleUrls: ['./menu-search-bar.component.scss'],
})
export class MenuSearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
@ViewChild('departmentMenuTrigger') departmentMenuTrigger: MatMenuTrigger;

toggleDimensions = 'toggle-group-tall'
isOpen = false;
hideMenu: boolean;
get platForm() {  return Capacitor.getPlatform(); }

//    this.uiHomePage.staffMenuEnabled
  //  this.uiHomePage.menuen
@ViewChild('input', {static: true}) input: ElementRef;
@Output() itemSelect  = new EventEmitter();
@ViewChild('displayMenu') displayMenu: TemplateRef<any>;
@ViewChild('displaySubMenu') displaySubMenu: TemplateRef<any>;

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
categories: IMenuItem[]
departments$     : Observable<IMenuItem[]>;
productTypes$    : Observable<any[]>;

multifilter      = false;
tinyMode         = false;
//search form filters
searchForm       : UntypedFormGroup;
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
uiHomePage          : UIHomePageSettings;
accordionStep       : number;
isStaff = this.userAuthorizationService.isCurrentUserStaff()
isUser  = this.userAuthorizationService.isUser;

initSubscriptions() {
  this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
    this.order = data
  })
  this._uiHomePage = this.uiSettingsService.homePageSetting$.subscribe(data => {
    this.uiHomePage = data;
    if (data) {
      if (!data.sideToolbarDefaultBrand) { this.multifilter = false }
      this.isDisplayMenuOn;
    }
  })

}

constructor(
    private menuService:            MenuService,
    private fb:                     UntypedFormBuilder,
    private siteService:            SitesService,
    private itemTypeService:        ItemTypeService,
    private contactsService:        ContactsService,
    private awsService     :        AWSBucketService,
    private router         :        Router,
    private orderService        :  OrdersService,
    public orderMethodsService: OrderMethodsService,
    private toolBarUIService    : ToolBarUIService,
    public  platFormService     : PlatformService,
    public  uiSettingsService   : UISettingsService,
    private toolbarUIService    : ToolBarUIService,
    private authService         : AuthenticationService,
    private userAuthorizationService: UserAuthorizationService,
  )
  {

    this.initForm();
    if (this.platForm.toLowerCase() === 'android') {  this.keyboardDisplayOn = true }
    this.isApp = this.platFormService.isApp();
  }

  ngOnInit() {
    const site          = this.siteService.getAssignedSite()
    const clientSearchModel          = {} as ClientSearchModel;
    clientSearchModel.pageNumber     = 1
    clientSearchModel.pageSize       = 25;
    this.clientSearchModel           = clientSearchModel;
    this.clientSearchResults$        = this.contactsService.getLiveBrands(site, clientSearchModel)
    // this.urlPath        = await this.awsService.awsBucketURL();


    this.isDevMode      = isDevMode()
    this.initSubscriptions();
    this.setStep(0)
  };

  setStep(value: number) {
    this.accordionStep = value;
  }

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

    // this.toggleCatHeight = 'toggle-buttons-height-medium'
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

    this.resetAll()
  }

  ngAfterViewInit() {
    if (this.platForm.toLowerCase() === 'android') {
      setTimeout(()=> {
        if (this.input && this.input.nativeElement) {
          this.input.nativeElement.focus();
          Keyboard.hide();
        }
      }, 200 )
    }
  }

  get isDisplayMenuOn() {

    if (!this.uiHomePage) { return };

    if ((this.isStaff && this.uiHomePage.staffMenuEnabled) ||
        (this.isUser && this.uiHomePage.menuEnabled)) {

      this.toggleCatHeight         = 'toggle-buttons-height-medium'
      this.toggleDepartmentHeight  = 'toggle-buttons-height-medium'
      this.toggleTypeHeight        = 'toggle-buttons-height-medium'

      return this.displayMenu
    }

    return null;

  }

  get isDisplaySubMenuOn() {
    if (!this.uiHomePage) { return };
    if ((this.isStaff && this.uiHomePage.staffscheduleSubMenu) ||
        (this.isUser && this.uiHomePage.scheduleSubMenu)) {
          this.toggleCatHeight         = 'toggle-buttons-height-medium'
          this.toggleDepartmentHeight  = 'toggle-buttons-height-medium'
          this.toggleTypeHeight        = 'toggle-buttons-height-medium'
      return this.displaySubMenu
    }
    return null;
  }

  refreshSearchPhrase(event) {
    this.itemName = event;
    this.initBasicSearch();
    this.initProductSearchModel()
    this.refreshSearch();
  }

  initBasicSearch() {
    this.category = null;
    this.department = null;
    this.productTypeSearch = null;
    this.brand = null;
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
    if (this.input && this.input.nativeElement) {
      this.input.nativeElement.value = '';
      this.input.nativeElement.focus();
    }
    //set the toggle buttons as well:
    this.categoryID        = 0;
    this.brandID           = 0;
    this.typeID            = 0;
    this.productTypeSearch = null;
    this.departmentID      = 0;
    this.productTypeID     = null;
    this.typeID            = null;
    this.brandID           = null;
    this.name              = null;
    this.brand             = null;
    this.department        = null;
    this.departments$      = null;

  }

  resetAll() {
    this.clearAll()

    this.categories$ = null;
    this.departments$ = null;

    const site           = this.siteService.getAssignedSite()

    this.categories$    = this.menuService.getListOfCategoriesV2(site, false).pipe(switchMap(data => {
      let result = data.filter(data => { return data.active} )
        return of(result)
      })
    )

    this.departments$   = this.menuService.getListOfDepartmentsV2(site, false).pipe(switchMap(data => {
        let result = data.filter(data => { return data.active} )
        return of(result)
      })
    )

    this.productTypes$  = this.itemTypeService.getBasicTypesByUseType(site, 'product')
      if (this.platForm.toLowerCase() === 'android') {
        Keyboard.hide();
      }
    }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  assignCategory(id: number) {
    let productSearchModel              = {} as ProductSearchModel;
    productSearchModel.categoryID       = id;
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  assignItemTypeID(id: number) {
    let productSearchModel                = {} as ProductSearchModel;
    productSearchModel.itemTypeID         = id;
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  assignDepartmentID(id: number) {
    let productSearchModel                = {} as ProductSearchModel;
    productSearchModel.departmentID       = id;
    this.applyProductSearchModel(productSearchModel);
    this.refreshSearch();
  }

  initProductSearchModel() {
    let productSearchModel   = {} as ProductSearchModel;
    productSearchModel       = this.applyProductSearchModel(productSearchModel)
    return productSearchModel
  }

  applyProductSearchModel(model: ProductSearchModel) : ProductSearchModel {

    model.type         = null;
    model.categoryID   = null;
    model.departmentID = null;
    model.name         = null;
    model.barcode      = null;
    model.departmentName = null;
    if (this.itemName) {
      model.name               =  this.itemName;
      model.useNameInAllFields = true
    }

    if (this.category )               {
      // console.log('this category', this.category)
      model.categoryID       = this.category.id.toString();
      model.categoryName     = this.category.name.toString();
    }

    if (this.department )               {
      model.departmentID       = this.department.id.toString();
      model.departmentName     = this.department.name.toString();
    }

    if (this.productTypeSearch)         {
      model.itemTypeID       = this.productTypeSearch.id.toString();
      model.type             = this.productTypeSearch.id.toString();
      model.itemTypeName     = this.productTypeSearch.name.toString();
    }

    if (this.brand)                   {
      model.brandID          = this.brand.id.toString();
      model.brandName        = this.brand.company.toString();
    }

    model.barcode    = model.name
    model.pageSize   = this.pageSize
    model.pageNumber = this.currentPage
    // console.log('menu bar', model.categoryID, model.categoryName);
    this.menuService.updateSearchModel(model)
    return model

  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<IProductSearchResults[]> {
    try {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.initProductSearchModel();
      searchModel.hideSubCategoryItems = true
      this.startRow            = 1;
      this.endRow              = this.pageSize;
      this.listItems(searchModel)
      return this._searchItems$
    } catch (error) {
      console.log('error', error)
    }
  }

  refreshCategorySearch(item: any) {
    this.clearAll()
    this.clearDeparment()
    this.category = item
    this.refreshSearch()
  }

  refreshBrandSearch(item: any) {
    this.clearAll()
    this.brand = item
    this.clearDeparment();
    this.toolBarUIService.updateDepartmentMenu(null)
    this.refreshSearch()
  }

  refreshTypeSearch(item: any) {
    this.clearAll();
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

    let item = {}
    item = {  value: this.searchIncrementer};
    if (model.categoryID && model.categoryID != 0) {
      item = {categoryID: model.categoryID, value: this.searchIncrementer}
    }
    if (model.subCategoryID && model.subCategoryID != 0) {
      item = {subCategoryID: model.subCategoryID, value: this.searchIncrementer}
    }

    // console.log('listItems', this.router.url)
    this.router.navigate(
      [
        "/menuitems-infinite", item
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

  gotoFilter() {
    this.router.navigate(['filter'])
    // this.toolbarUIService.hideToolbarSearchBar()
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo)
  }


}
