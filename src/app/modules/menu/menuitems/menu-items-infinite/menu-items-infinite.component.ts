import {Component,  HostListener, OnInit, AfterViewInit,OnDestroy,
        ViewChild, ElementRef, QueryList, ViewChildren, Input, TemplateRef, ChangeDetectorRef, ChangeDetectionStrategy}  from '@angular/core';
import {IMenuItem} from 'src/app/_interfaces/menu/menu-products';
import {AWSBucketService, AuthenticationService, IMenuItemsResultsPaged, IProductSearchResults, MenuService} from 'src/app/_services';
import {ActivatedRoute, Router} from '@angular/router';
import { catchError, Observable, of, Subscription, switchMap} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { Capacitor} from '@capacitor/core';
import { Title } from '@angular/platform-browser';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
@Component({
  selector: 'menu-items-infinite',
  templateUrl: './menu-items-infinite.component.html',
  styleUrls: ['./menu-items-infinite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
  }
)

export class MenuItemsInfiniteComponent implements OnInit, AfterViewInit, OnDestroy {

  action$ : Observable<any>;
  @Input() updateSearchOnModelChange: boolean;

  @ViewChild('debugView') debugView: TemplateRef<any>;
  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  smallDevice: boolean;
  @ViewChild('searchSelector') searchSelector: TemplateRef<any>;
  @ViewChild('gridFlowOptionView') gridFlowOptionView: TemplateRef<any>;
  @ViewChild('categoryFilter') categoryFilter: TemplateRef<any>;

  searchForm: UntypedFormGroup;
  scrollContainer:   any;
  isNearBottom   :   any;
  webMode        :  boolean;

  array            = [];
  sum              = 15;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;
  direction        = "";
  modalOpen        = false;
  endOfRecords     = false;
  pagingInfo        : any;
  items             = [];
  pageOfItems:      Array<any>;
  lengthOfArray:    number

  statusmessage     = '';
  section           = 1;

  menuItems$:       Observable<IMenuItem[]>
  menuItems:        IMenuItem[];
  categories      : IMenuItem[];
  value             : any;
  currentPage       = 1 //paging component
  pageSize          = 25;
  itemsPerPage      = 35
  uiHomePage  : UIHomePageSettings;
  _uiHomePage: Subscription

  enableFilter: boolean;

  //grid-flow scroller

  @Input() departmentID :   string;
  @Input() categoryID:      string;
  @Input() subCategoryID :  string;
  @Input() brandID       :  string;
  @Input() typeID        :  string;
  @Input() productName   :  string;
  @Input() hideSubCategoryItems: boolean;

  categorySearchModel    : ProductSearchModel


  _productSearchModel    : Subscription;
  productSearchModel     : ProductSearchModel;
  bucketName        :   string;
  scrollingInfo     :   string;
  endofItems        :   boolean;
  loading           :   boolean = false;
  totalRecords      :   number;
  someValue         : any;
  searchDescription : string //for description of results

  grid              = "grid"
  _orderBar         : Subscription;
  orderBar          : boolean;
  platForm          = this.getPlatForm()
  isApp             = false;
  bucket$: Observable<string>;
  uiHomePage$  : Observable<any>;
  style$       : Observable<any>;
  userAuths    = {} as IUserAuth_Properties;
  userAuths$   = this.authService.userAuths$.pipe(
    switchMap(data =>
      { this.userAuths = data;
        return of(data)
      }
    )
  )

  ordersListClass   = 'grid-flow scroller'
  infiniteClassList = 'grid-flow scroller'
  infiniteItemClass = 'grid-item';
  isStaff= this.userAuthorizationService.isStaff;
  getPlatForm() { return Capacitor.getPlatform(); }

  initSubscriptions() {
    this.initToolbarSubscription();
    this.initHomePageSubscription();
  }

  initToolbarSubscription() {
    this.toolbarUIService.orderBar$.subscribe(data => {
      this.orderBar = data
      if (this.orderBar) {
        this.grid = "grid-smaller"
      }
      if (!this.orderBar) { this.grid = "grid" }
    })
  }

  initHomePageSubscription() {
    this._uiHomePage = this.uiSettingService.homePageSetting$.subscribe(data => {
      this.uiHomePage = data;
    })
  }

  constructor(private menuService        : MenuService,
              private awsBucketService : AWSBucketService,
              private router           : Router,
              public  route            : ActivatedRoute,
              public siteService      : SitesService,
              private titleService     : Title,
              private platFormService  : PlatformService,
              private uiSettingService: UISettingsService,
              private toolbarUIService: ToolBarUIService,
              public  authService: AuthenticationService,
              private userAuthorizationService: UserAuthorizationService,
              private fb: UntypedFormBuilder,
              private cd: ChangeDetectorRef,
      )
  {
    this.isApp = this.platFormService.isApp()
    this.initStyles();
  }

  initStyles() {
    this.mobileView;
    if (!this.isApp) { return }
    this.ordersListClass = 'grid-flow scroller';
  }

  get categoryFilterView(){
    if (this.uiHomePage && this.uiHomePage.suppressMenuItems) {
      if (this.categories && this.categories.length) {
        return this.categoryFilter
      }
    }
    return undefined
  }

  setCategoryFilter() {
  }

  toggleListView() {
    if (this.infiniteClassList === 'grid-flow scroller') {
      this.infiniteClassList = 'grid-flow-single'
      this.ordersListClass = 'grid-flow-single'
    } else {
      this.infiniteClassList  = 'grid-flow scroller'
      this.ordersListClass = 'grid-flow scroller'
    }
  }

  saveMobileView() {
    const item = {ordersListClass: this.ordersListClass,
      infiniteClassList: this.infiniteClassList
    }
    localStorage.setItem('MobileMenuItemLayout', JSON.stringify(item))
  }

  get mobileView() {
    const item = localStorage.getItem('MobileMenuItemLayout')
    if (!item) {return null}
    const view = JSON.parse(item);
    this.infiniteClassList = view?.infiniteClassList;
    this.ordersListClass = view?.ordersListClass;
  }

  ngOnInit()  {
    //this is called on page refresh, or sending the person the link to this page.
    //this should be called.
    //the parameters can all be used, however they shouldn't/
    //categories shouldn' display departments
    //don't change the local variables based on the search model
    //change the model based on the variables.
    //for the most part : the model will be updated
    //then the page will refresh
    //the way to make sure we don't show undeseriable items.
    //is if the model is updated, and adjusted based on variables.
    //so if the deparment is assigned in the search, then we can accept .
    //when a new model is provided, it can come in with the current model search
    //so it's important that when a model is submitted, extraneous values are not accepted.
    //but if we move from a department search, to show categories, perhaps we have to clear out the depaertment
    //before we move foward.
    //but if we move back, and have a category assigned but no department, we can't be
    //sure if we should accept the model, or the parameter from the page.
    console.log('ngOnInit')
    this.value      = 1;
    const homePage$ = this.uiSettingService.homePageSetting$;
    this.bucket$    = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
      this.bucketName = data
      return of(data)
    }));

    this.uiHomePage$ = homePage$.pipe(switchMap(data => {
      if (!data) {
        return this.uiSettingService.UIHomePageSettings
      }
      return of(data)
    })) .pipe(switchMap(data => {
      if (!data) {
        return this.uiSettingService.UIHomePageSettings
      }
      return of(data)
    })).pipe(switchMap(data => {
        this.uiHomePage = data;
        if (data.accordionMenuSideBar || data.staffAccordionMenuSideBar) {
          this.updateSearchOnModelChange = true;
        }
        if (this.uiHomePage) {
          this.initComponent()
        }
        return of(data)
    }))
    ,catchError(data => {
      this.initComponent()
      return of(data)
    });
  }

  initComponent() {
    this.initSubscriptions();
    this.initSearchForm();
    this.initSearchProcess();
    this.setTitle();
    this.updateUILayout()

    let subCategoryID = +this.route.snapshot.paramMap.get('subCategoryID');
    if (subCategoryID !=0) {
      console.log('init sub category parameters')
      this.currentPage = 1;
      const model = this.initViewFromParameters();
      this.initSearchFromModel();
      this.updateSearchResults();
      return;
    }

    let categoryID = +this.route.snapshot.paramMap.get('categoryID')
    if (categoryID !=0) {
      console.log('init category parameters')
      this.currentPage = 1;
      const model = this.initViewFromParameters();
      this.initSearchFromModel();
      this.updateSearchResults();
      return;
    }

    let departmentID = +this.route.snapshot.paramMap.get('departmentID')
    if (departmentID !=0) {
      console.log('init department parameters')
      this.currentPage = 1;
      const model = this.initViewFromParameters();
      this.initSearchFromModel();
      this.updateSearchResults();
      return;
    }

    this.initSearchFromModel();
    this.currentPage = 1;
    this.menuItems = [] as IMenuItem[]
    this.nextPage();

    this.initFilterOption();
  }

  initViewFromParameters() {
    let model = this.menuService.initSearchModel()
    model.subCategoryID      = +this.route.snapshot.paramMap.get('subCategoryID');
    model.departmentID       = +this.route.snapshot.paramMap.get('departmentID');
    model.categoryID         = +this.route.snapshot.paramMap.get('categoryID');
    model.brandID            = +this.route.snapshot.paramMap.get('brandID');
    model.subCategoryID      = +this.route.snapshot.paramMap.get('subCategoryID');
    model.itemTypeID         = +this.route.snapshot.paramMap.get('typeID');

    if (model.departmentID != 0 || model.categoryID != 0 ||  model.subCategoryID != 0) {
      console.log('initViewFromParameters', model)
      this.menuService.updateSearchModel(model)
    }

    return model
  }

  get isSearchSelectorOn() {
    if (this.uiHomePage && this.uiHomePage.disableSearchFeaturesInItemsList) {
      return null
    }
    if (!this.isApp || this.smallDevice || this.uiHomePage.storeNavigation) {
      return this.searchSelector
    }
    return null;
  }

  get isgridFlowOptionOn() {
    if (this.smallDevice && !this.isApp) {
      return this.gridFlowOptionView
    }
    return null;
  }

  @HostListener("window:resize", [])
  updateUILayout() {
    this.smallDevice = false
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
    }
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      itemName: ''
    })
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(itemName) {
    try {
      this.applyProductSearchModel(itemName);
      this.menuItems = [];
      this.nextPage();
    } catch (error) {
      console.log('error', error)
    }
  }

  ngAfterViewInit() {
    this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
    console.log('after view initialized')
  }

  ngOnDestroy(): void {
    if (this._orderBar) { this._orderBar.unsubscribe(); }
    if (this._productSearchModel) {this._productSearchModel.unsubscribe();}
  }

  setTitle() {
    if (this.productSearchModel) {
      this.titleService.setTitle('Items Search Results')
    }
  }

  initSearchProcess() {
    try {
        if (!this.productSearchModel) {
          this.productSearchModel = this.menuService.initSearchModel()
          if (this.router.url === '/filter') {
            this.initModelParameters(this.productSearchModel)
          }
          if (this.updateSearchOnModelChange) {
          }
        }
    } catch (error) {
      console.log('initSearchProcess Error', error)
    }
  }

  initModelParameters(model: ProductSearchModel): ProductSearchModel {

    model.subCategoryID      = +this.route.snapshot.paramMap.get('subCategoryID');
    model.departmentID       = +this.route.snapshot.paramMap.get('departmentID');
    model.categoryID         = +this.route.snapshot.paramMap.get('categoryID');
    model.brandID            = +this.route.snapshot.paramMap.get('brandID');
    model.subCategoryID      = +this.route.snapshot.paramMap.get('subCategoryID');
    model.itemTypeID         = +this.route.snapshot.paramMap.get('typeID');

    this.departmentID  = this.route.snapshot.paramMap.get('departmentID');
    this.subCategoryID = this.route.snapshot.paramMap.get('subCategoryID');
    this.categoryID    = this.route.snapshot.paramMap.get('categoryID');
    this.brandID       = this.route.snapshot.paramMap.get('brandID');
    this.typeID        = this.route.snapshot.paramMap.get('typeID');
    this.productName   = this.route.snapshot.paramMap.get('productName');

    this.hideSubCategoryItems = false;

    if (this.route.snapshot.paramMap.get('hideSubCategoryItems')) {
      this.hideSubCategoryItems = this.route.snapshot.paramMap.get('hideSubCategoryItems') as unknown as boolean;
        model.hideSubCategoryItems = this.hideSubCategoryItems
    }
    if (this.uiHomePage && this.uiHomePage.storeNavigation) {
      this.hideSubCategoryItems = true;
      model.hideSubCategoryItems = true
    }
    return model;

  }

  refreshFromSelection(event) {

    this.productSearchModel = this.getListSearchModel(this.productSearchModel);
    console.log('refreshFromSelection', this.productSearchModel)
    console.log(this.productSearchModel)
    this.currentPage = 1;
    this.updateSearchResults()
  }

  initSearchFromModel() {
    this._productSearchModel = this.menuService.searchModel$.subscribe( model => {
        this.productSearchModel = model;
        this.initSearchProcess();
        if (!model) {  model = this.menuService.initSearchModel() }

        this.productName  = model.name;
        model.web         = this.webMode
        model.webMode     = this.webMode;

        if (!model.pageNumber) { model.pageNumber = 1}
        this.currentPage = model.pageNumber
        let  categoryResults = ''

        if (model.categoryName && model.categoryName != undefined ) {
          categoryResults = model.categoryName;
        }

        let  departmentName = ''
        if (model.departmentName && model.departmentName != undefined ) {
          departmentName = 'departments ' + model.departmentName;
        }

        let  itemTypeName = ''
        if (model.itemTypeName && model.itemTypeName != undefined) {
          itemTypeName = 'types ' + model.itemTypeName;
        }

        model.webMode = this.menuService.isWebModeMenu
        model.active  = true;

        this.productSearchModel = model;

        if (this.updateSearchOnModelChange) {
          model.hideSubCategoryItems = false;
          this.productSearchModel = model;
          this.updateSearchResults();
        }

        this.searchDescription = `Results from ${ model.name}  ${categoryResults} ${departmentName}  ${itemTypeName}`
        return
      }
    )
  }

  updateSearchResults() {
    console.log('updateSearchResults')
    this.menuItems = [];
    this.nextPage();
  }

  getNextMenuItem() {
    let menuItem = {} as IMenuItem
    menuItem.id = -1;
    menuItem.name = 'Load More'
    return menuItem;
  }


  getListSearchModel(model : ProductSearchModel) {
    this.departmentID  = this.route.snapshot.paramMap.get('departmentID');
    this.categoryID    = this.route.snapshot.paramMap.get('categoryID');
    this.subCategoryID = this.route.snapshot.paramMap.get('subCategoryID');
    this.brandID       = this.route.snapshot.paramMap.get('brandID')
    this.typeID       = this.route.snapshot.paramMap.get('typeID')
    return this.updateModel(model)

  }

  updateModel(model: ProductSearchModel) {
    if (this.updateSearchOnModelChange) {   model.hideSubCategoryItems = false; }

    if (this.uiHomePage && this.uiHomePage.suppressMenuItems) {
      if (this.route.snapshot.paramMap.get('hideSubCategoryItems')) {
        model.hideSubCategoryItems = this.route.snapshot.paramMap.get('hideSubCategoryItems') as unknown as boolean;
      }
    }
    if (this.typeID) {
      if (this.typeID) { model.itemTypeID     = +this.typeID     }
    }

    if (this.brandID) {
      if (this.brandID) { model.brandID       = +this.brandID     }
    }

    if ( (!this.categoryID && this.categoryID != "0") ||
         (!this.departmentID && this.departmentID != "0") ||
         (!this.subCategoryID && this.subCategoryID != "0") ||
         (!this.brandID && this.brandID != "0") )   {
    }
    model.itemTypeID = 0


    return model;
  }

  setCategoryHeaders(model: ProductSearchModel) {
    let catModel  = JSON.parse(JSON.stringify(model))
    catModel.categoryID = 0
    catModel.categoryName = ''
    catModel.category = ''
    catModel.itemTypeID = 4;
    console.log('Cat search', catModel)
    this.categorySearchModel = catModel
  }

  setSubCategoryHeaders() {
    //do this when there is a sub category id in the model
  }


  changeDetect() {
    this.loading      = false
    this.cd.detectChanges()
  }

  addToListOBS(pageSize: number, pageNumber: number) :Observable<IMenuItem[] | IMenuItemsResultsPaged>  {

    let model   = this.productSearchModel;

    if (!model) { model = {} as ProductSearchModel };
    const value = this.route.snapshot.paramMap.get('value');
    if (!pageNumber || pageNumber == null) {pageNumber = 1 }
    if (!pageSize   || pageSize   == null) {pageSize   = 50}

    if (model && !value)  { model = this.getListSearchModel(model) }

    const site        = this.siteService.getAssignedSite();

    let displayCategories$ : Observable<IMenuItemsResultsPaged | IMenuItem[]>;
    if (this.uiHomePage.storeNavigation) {
      let catModel      = this.categorySearchModel;
      if (catModel){
        catModel.pageNumber = 1;
        catModel.pageSize = 50;
        model.active      = true;
        displayCategories$ =  this.getProcess(site, catModel)
      }
    }

    model.pageNumber  = pageNumber
    model.pageSize    = pageSize
    model.active      = true;

    if (this.uiHomePage.storeNavigation) {
      // model.departmentID = 0;

    }
    this.productSearchModel = model;

    const process$    = this.getProcess(site, model)
    this.loading      = true

    return process$.pipe(
      switchMap(data => {
        if (this.pagingInfo && this.pagingInfo.pageCount == 1) {
          if (displayCategories$) {
            return displayCategories$
          }
        }

        if (pageNumber == 1) {
          return  this.addToListOBS(this.pageSize, 2)
        }
        if (displayCategories$) {
          return displayCategories$
        }
        return of(data)
    })).pipe(switchMap(data => {
      this.changeDetect()
      return of(data)
    }))

  };


  splitItemsIntType(itemsIn: IMenuItem[], currentItems: IMenuItem[]){
    currentItems.push(...itemsIn)
    if (!this.categories) { this.categories = []}

    if (this.uiHomePage.storeNavigation) {
      if (this.departmentID && itemsIn) {
        const categories = itemsIn.filter(item => {
          if (item.prodModifierType == 6 || item.prodModifierType == 5 || item.prodModifierType == 4 ) {
            return   item
          }
        }) as IMenuItem[]
        this.categories.push(...categories)
      }

      if (!this.departmentID && this.categoryID && itemsIn) {
        const categories = itemsIn.filter(item => {
          if ( item.prodModifierType == 6 || item.prodModifierType == 5 || item.prodModifierType == 4 ) {
            return   item
          }
        }) as IMenuItem[]

      }


      this.categories = this.removeDuplicates(this.categories)
      currentItems =  currentItems.filter( item => {
        if (item.prodModifierType != 6 && item.prodModifierType != 5 && item.prodModifierType != 4 ) {
          return   item
        }
      })

    }
    return currentItems;
  }

  removeDuplicates(array: IMenuItem[]) {
    const uniqueArray = array.filter((obj, index, self) =>
      index === self.findIndex((o) => o.id === obj.id && o.name === obj.name)
    );

    return uniqueArray;
    console.log(uniqueArray);
  }

  initFilterOption() {
    if (this.authService.deviceInfo) {
      const device = this.authService.deviceInfo

      if ((this.uiHomePage.staffAccordionMenuSideBar || this.uiHomePage.accordionMenuSideBar ||
        this.uiHomePage.departmentFilter || this.uiHomePage.itemTypeFilter || this.uiHomePage.categoryFilter  )) {
          this.enableFilter = true
          return;
        }

      if (this.uiHomePage && this.uiHomePage.disableSearchFeaturesInItemsList)
         {
        this.enableFilter = false
        return false
      }
      if (!device.phoneDevice && !this.isApp) {
        const url =  this.router.url
        if (url.substring(0, 'menuitems-infinite'.length + 1 ) === '/menuitems-infinite'){
          this.enableFilter = true
        }
      }
    }
  }

  gotoFilter() {
    // this.router.navigate(['filter'])
  //  this.toolbarUIService.showSearchSideBar()
    this.toggleSearchMenu()
  }

  toggleSearchMenu() {
    // this.smallDeviceLimiter();
    this.toolbarUIService.switchSearchBarSideBar()
  }


  getProcess(site: ISite, model: ProductSearchModel) {

    const results$    = this.menuService.getMenuItemsBySearchPaged(site, model);
     return results$.pipe(
        switchMap(data => {
          this.currentPage += 1;

          if (!data || data.results && data.results.length == 0 || data == null || (!data || !data.results)) {
            this.value = 100;
            this.loading = false;
            this.endOfRecords = true
            this.totalRecords = data?.paging?.totalRecordCount;
            return of(null)
          }

          this.itemsPerPage = this.itemsPerPage + data.results.length;

          if (this.menuItems) {
            try {
              if (this.menuItems[this.menuItems.length -1 ].name.toLowerCase() === 'load more') {
                this.menuItems.splice(this.menuItems.length-1,1)
              };
            } catch (error) {
            }

            this.menuItems = this.splitItemsIntType(data.results, this.menuItems);

            if (this.uiHomePage.suppressItemsInStoreNavigation) {
              if (this.categories && this.categories.length>0) {
                this.menuItems  = [];
                this.endOfRecords = true;
                this.loading = false;
                this.value = 100;
                return of(null)
              }
            }

            this.totalRecords = data.paging.totalRecordCount;

            let catLength = 0
            if (this.categories && this.categories.length) {   catLength = this.categories.length }

            if ( this.menuItems.length + catLength == this.totalRecords ) {
              this.endOfRecords = true;
              this.loading = false;
              this.value = 100;
            }

            if ( this.value != 100 && this.value !=0 ) {
              const lastItem = this.getNextMenuItem();
              this.loading = false;
              this.menuItems.push(lastItem)
            }

            this.menuItems = this.removeDuplicates( this.menuItems )
            this.value     = ((this.menuItems.length   / this.totalRecords ) * 100).toFixed(0)
            this.loading   = false

            return of(this.menuItems)
          }

          this.pagingInfo = data.paging

        if (data) {
          this.menuItems = this.splitItemsIntType(data.results, this.menuItems)
          this.loading      = false
          this.value = 100;
        }

        return of(data);
      }
    )).pipe(switchMap(data => {
      return of(data)
    }))

  }

  moveNext(event) {
    this.menuItems.splice(this.menuItems.length,1)
    this.onScrollDown();
  }

  onScrollDown() {
    this.scrollingInfo = 'scroll down'
    this.nextPage();
  }

  onScrollUp() {
    this.scrollingInfo = 'scroll up'
  }


  nextPage() {
    // this.action$ =
    this.addToListOBS(this.pageSize, this.currentPage).subscribe(data => {

    })
  }

  scrollDown() {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  listItem(id: string) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  getItemSrc(item:IMenuItem) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
  }

 onItemElementsChanged(): void {
    // if (this.isNearBottom()) {
    //   this.scrollToBottom();
    // }
  }

  scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: 2000,// this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  isUserNearBottom(): boolean {
    const threshold = 150;
    const position = window.scrollY + window.innerHeight; // <- Measure position differently
    const height = document.body.scrollHeight; // <- Measure height differently
    return position > height - threshold;
  }

  @HostListener('window:scroll', ['$event']) // <- Add scroll listener to window
  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
  }

  applyProductSearchModel(itemName: string) : ProductSearchModel {
    // console.log('product search text', this.productSearchModel,  this.menuService.searchModel)

    if (!this.productSearchModel) {
      if (this.menuService.searchModel) {
        this.productSearchModel  = this.menuService.searchModel
      } else {
        this.productSearchModel = this.menuService.initSearchModel()
      }
    }

    let productSearchModel            = this.productSearchModel
		productSearchModel.type           = null;
		productSearchModel.categoryID     = null;
		productSearchModel.departmentID   = null;
		productSearchModel.name           = null;
		productSearchModel.barcode        = null;
		productSearchModel.departmentName = null;
		if (itemName) {
		  productSearchModel.name         =  itemName;
		  productSearchModel.useNameInAllFields = true
		}
		productSearchModel.barcode    = productSearchModel.name
		productSearchModel.pageSize   = 50
		productSearchModel.pageNumber = 1
		this.menuService.updateSearchModel(productSearchModel)
		return productSearchModel
  }

  get  isDebugMode() {
    if (this.siteService.debugMode) {
      return this.debugView
    }
    return true;
  }


  trackByFN(_, item: IMenuItem): IMenuItem {
    return item;
  }
}

