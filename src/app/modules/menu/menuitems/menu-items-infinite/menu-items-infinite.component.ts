import {Component,  HostListener, OnInit,Renderer2,OnDestroy,
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
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ISite } from 'src/app/_interfaces';
@Component({
  selector: 'menu-items-infinite',
  templateUrl: './menu-items-infinite.component.html',
  styleUrls: ['./menu-items-infinite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
  }
)

export class MenuItemsInfiniteComponent implements OnInit, OnDestroy {
  @ViewChild('menuItemsDiv') menuItemsDiv: ElementRef;
  menuDivHeight: number;

  nextPage$: Observable<IMenuItem[] | IMenuItemsResultsPaged>
  action$ : Observable<any>;
  @Input() updateSearchOnModelChange: boolean;
  @ViewChild('debugView') debugView: TemplateRef<any>;
  @ViewChild('departmentFilterView') departmentFilterView: TemplateRef<any>;
  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  @ViewChild('searchSelector') searchSelector: TemplateRef<any>;
  @ViewChild('gridFlowOptionView') gridFlowOptionView: TemplateRef<any>;
  @ViewChild('categoryFilter') categoryFilter: TemplateRef<any>;
  @ViewChild('departmentFilter') departmentFilter: TemplateRef<any>;

  searchForm: UntypedFormGroup;
  scrollContainer:   any;
  isNearBottom   :   any;
  webMode        :  boolean;
  smallDevice: boolean;
  array            = [];
  sum              = 15;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;
  direction        = "";
  value             : any;
  currentPage       = 1 //paging component
  pageSize          = 25;
  itemsPerPage      = 35
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
  departments: any[];
  categories$: Observable<IMenuItem[]>;
  departments$: Observable<any>;

  uiHomePage  : UIHomePageSettings;
  _uiHomePage: Subscription
  enableFilter: boolean;

  @Input() departmentID :   string;
  @Input() categoryID:      string;
  @Input() subCategoryID :  string;
  @Input() brandID       :  string;
  @Input() typeID        :  string;
  @Input() productName   :  string;
  @Input() hideSubCategoryItems: boolean;

  categorySearchModel    : ProductSearchModel;

  _productSearchModel    : Subscription;
  productSearchModel     : ProductSearchModel;
  bucketName        :   string;
  scrollingInfo     :   string;
  endofItems        :   boolean;
  loading           :   boolean = false;
  totalRecords      :   number;
  someValue         : any;
  searchDescription : string //for description of results
  infiniteStyle = 'overflow-y:auto;max-height(80vh)'
  grid              = "grid"
  _orderBar         : Subscription;
  orderBar          : boolean;
  platForm          = Capacitor.getPlatform();
  isApp             = false;
  bucket$: Observable<string>;

  uiHomePage$  : Observable<any>;
  style$       : Observable<any>;
  userAuths    = {} as IUserAuth_Properties;

  subCategories$: Observable<any[]>;
  categoriesList
  subCategoriesList: any[];

  scrollStyle = this.platformService.scrollStyleWide;
  private styleTag: HTMLStyleElement;
  private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  userAuths$   = this.authService.userAuths$.pipe(
    switchMap(data =>
      { this.userAuths = data;
        return of(data)
      }
    )
  )

  user$ = this.authService.user$.pipe(switchMap(data => {
    this.setScrollBarColor(data?.userPreferences?.headerColor)
    return of(data)
  }))

  ordersListClass   = 'grid-flow scroller '
  infiniteClassList = 'grid-flow scroller '
  infiniteItemClass = 'grid-item';
  isStaff= this.userAuthorizationService.isStaff;

  setScrollBarColor(color: string) {
    if (!color) {    color = '#6475ac' }
    const css = this.authService.getAppToolBarStyle(color, 35)
    this.styleTag = this.renderer.createElement('style');
    this.styleTag.type = 'text/css';
    this.styleTag.textContent = css;
    this.renderer.appendChild(document.head, this.styleTag);
  }

  initSubscriptions() {
    this.initToolbarSubscription();
  }

  initToolbarSubscription() {
    this.toolbarUIService.orderBar$.subscribe(data => {
      this.orderBar = data
      if (this.orderBar) {this.grid = "grid-smaller"  }
      if (!this.orderBar) { this.grid = "grid" }
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (this.menuDivHeight < 100) {this.menuDivHeight = 400}
    if (this.menuDivHeight > 600) {this.menuDivHeight = 400}
    this.menuDivHeight = 400
    this.infiniteStyle = `overflow-y:auto;max-height(${this.menuDivHeight-25}px)`
    this.getItemHeight()
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
      this.infiniteStyle = `overflow-y:auto;max-height(${this.menuDivHeight-25}px)`
    }
  }


  getItemHeight() {
    if (!this.menuItemsDiv) {
      return
    }
    const divTop = this.menuItemsDiv.nativeElement.getBoundingClientRect().top;
    const viewportBottom = window.innerHeight;
    const remainingHeight = viewportBottom - divTop;

    // must use max height becuase of of how height spacing works with the grid
    this.menuItemsDiv.nativeElement.style.maxHeight  = `${(remainingHeight - 75).toFixed(0)}px`;
    // this.menuItemsDiv.nativeElement.style.padding  = `${5}px`;
  }

  get departmentsFilter(){
    if (this.smallDevice) {
      return null
    }
    if (this.uiHomePage && this.uiHomePage.suppressMenuItems && this.uiHomePage.storeNavigation) {
      if (this.departments && this.departments.length) {
        return this.departmentFilterView;
      }
    }
    return undefined;
  }

  get categoryFilterView(){
    if (this.uiHomePage && this.uiHomePage.suppressMenuItems && this.uiHomePage.storeNavigation) {
      if (this.categories && this.categories.length) {
        return this.categoryFilter;
      }
    }
    return undefined;
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
              private platformService: PlatformService,
              private cd: ChangeDetectorRef,
              private renderer: Renderer2
      )
  {
    this.isApp = this.platFormService.isApp();
    this.initStyles();
  }

  initStyles() {
    this.mobileView;
    if (!this.isApp) { return };
    this.ordersListClass = 'grid-flow scroller ';
  }

  toggleListView() {
    if (this.infiniteClassList === 'grid-flow scroller') {
      this.infiniteClassList = 'grid-flow-single';
      this.ordersListClass = 'grid-flow-single ';
    } else {
      this.infiniteClassList  = 'grid-flow scroller';
      this.ordersListClass = 'grid-flow scroller ';
    }
  }

  saveMobileView() {
    const item = {ordersListClass: this.ordersListClass,
      infiniteClassList: this.infiniteClassList
    }
    localStorage.setItem('MobileMenuItemLayout', JSON.stringify(item));
  }

  get mobileView() {
    const item = localStorage.getItem('MobileMenuItemLayout')
    if (!item) {return null}
    const view = JSON.parse(item);
    this.infiniteClassList = view?.infiniteClassList;
    this.ordersListClass = view?.ordersListClass;
  }

  ngOnDestroy(): void {
    if (this._orderBar) { this._orderBar.unsubscribe(); }
    // if (this._productSearchModel) {this._productSearchModel.unsubscribe();};

    // console.log('ngOnDestroy current page', this.productSearchModel.currentPage)
    // console.log('ngOnDestroy this.currentPage', this.currentPage)

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
    // console.log('ngOnInit')
    this.value      = 1;
    this.currentPage = 0;

    const homePage$ = this.uiSettingService.homePageSetting$;

    this.bucket$    = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
      this.bucketName = data
      return of(data)
    }));

    const search$ = this.menuService.searchModel$

    this.productSearchModel = this.menuService._searchModel.value;

    // console.log('ngOninit', this.productSearchModel)
    if (this.productSearchModel) {
      this.productSearchModel.pageNumber = 1;

      // console.log('init current page', this.productSearchModel.currentPage)
      // console.log('this.currentPage', this.currentPage)
    }

    this.uiHomePage$ =  this.uiSettingService.UIHomePageSettings.pipe(switchMap(data => {
      if (!data) { return this.uiSettingService.UIHomePageSettings   }
      return of(data)
    })).pipe(switchMap(data => {
        this.uiHomePage = data;
        if (data.accordionMenuSideBar || data.staffAccordionMenuSideBar) {
          this.updateSearchOnModelChange = true;
        }
        let doNotInitsearch = false
        if (this.productSearchModel) { doNotInitsearch = true;}

        this.initSearchFeatures(doNotInitsearch);
        this.initComponent();

        if (this.uiHomePage) {
          if ( this.uiHomePage.storeNavigation) {
            if (!this.departmentID) {
              if (this.productSearchModel.departmentID) {
                this.departmentID = this.productSearchModel.departmentID.toString()
              }
            }
            this.initDepartmentViews();
          }
        }
        return of(data)
    }))
    ,catchError(data => {

      this.initComponent()
      return of(data)
    });

  }

  initSearchFeatures(doNotInitSearchModel?: boolean) {
    this.setTitle();
    this.initSubscriptions();
    this.initSearchForm();
    if (!doNotInitSearchModel) {
      this.initSearchProcess();
    }
    this.updateUILayout();
  }

  setTitle() {
    if (this.productSearchModel) {
      this.titleService.setTitle('Items Search Results')
    }
  }

  initComponent() {
    let subCategoryID = +this.route.snapshot.paramMap.get('subCategoryID');
    if (subCategoryID !=0) {
      this.currentPage = 1;
      const model = this.initViewFromParameters();
      this.initSearchFromModel();
      this.updateSearchResults();
      return;
    }

    let categoryID = +this.route.snapshot.paramMap.get('categoryID')
    if (categoryID !=0) {
      this.currentPage = 1;
      const model = this.initViewFromParameters();
      this.initSearchFromModel();
      this.updateSearchResults();
      return;
    }

    if (this.productSearchModel.departmentID == 0 && +this.departmentID != 0)  {
      this.productSearchModel.departmentID = +this.departmentID
    }

    if (this.productSearchModel) {
      let departmentID = +this.productSearchModel.departmentID
      if (departmentID != 0) {
        this.currentPage = 1;
        const model = this.initViewFromParameters();
        this.initSearchFromModel();
        this.initCategoryViews(true)
        this.updateSearchResults();
        return;
      }
    }

    let departmentID = +this.route.snapshot.paramMap.get('departmentID');
    if (departmentID != 0 ) {
      this.currentPage = 1;
      if (this.uiHomePage && !this.uiHomePage.storeNavigation) {
        const model = this.initViewFromParameters();
      }
      this.initSearchFromModel();
      this.initCategoryViews(true)
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
      this.menuService.updateSearchModel(model)
    }
    return model
  }

  get isSearchSelectorOn() {
    if (this.uiHomePage && this.uiHomePage.disableSearchFieldInMenu && this.isApp) {
      return null
    }
    if (this.smallDevice || !this.uiHomePage.disableSearchFieldInMenu) {
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

  applyProductSearchModel(itemName: string) : ProductSearchModel {
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

    if (this.uiHomePage && this.uiHomePage.storeNavigation) {
      return;
    } else {
      this.departmentID  = this.route.snapshot.paramMap.get('departmentID');
      this.subCategoryID = this.route.snapshot.paramMap.get('subCategoryID');
      this.categoryID    = this.route.snapshot.paramMap.get('categoryID');
      this.brandID       = this.route.snapshot.paramMap.get('brandID');
      this.typeID        = this.route.snapshot.paramMap.get('typeID');
      this.productName   = this.route.snapshot.paramMap.get('productName');
    }

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
    this.currentPage = 1;
    this.updateSearchResults();
  }

  setDepartmentID(id) {
    if (!id) { return}
    if (this.productSearchModel) {
      this.productSearchModel.departmentID = id;
      this.productSearchModel.categoryID = null;
    }
    this.productSearchModel.pageNumber = 1;
    this.departmentID = id.toString();
    this.categoryID = '';

    this.initCategoryViews(true) ;
    this.initSubcategoryies()
    this.productSearchModel = this.getListSearchModel(this.productSearchModel);
    this.currentPage = 1;
    this.updateSearchResults();
  }

  initSubcategoryies() {
    this.subCategoriesList = null;
    this.productSearchModel.subCategoryID  = 0
  }

  setSubcategoryID(id) {
    if (id) {
      this.productSearchModel.subCategoryID = id;
    }
    this.productSearchModel.pageNumber = 1;
    this.productSearchModel = this.getListSearchModel(this.productSearchModel);
    this.currentPage = 1;
    this.updateSearchResults();
  }

  setCategoryID(id) {
    if (!id) { return}
    if (this.productSearchModel) {
      // this.productSearchModel.departmentID = id;
      this.productSearchModel.categoryID = id;
    }
    this.productSearchModel.pageNumber = 1;
    this.categoryID = id.toString();

    // this.initCategoryViews(true) ;
    this.productSearchModel.subCategoryID = null;
    this.productSearchModel = this.getListSearchModel(this.productSearchModel);
    this.currentPage = 1;
    this.updateSearchResults();
    this.refreshSubCategories(id)
  }

  initSearchFromModel() {
    this._productSearchModel = this.menuService.searchModel$.subscribe( model => {
        this.productSearchModel = model;
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

        if (!this.departmentID) {
          if (this.uiHomePage && this.uiHomePage.storeNavigation) {
          }
        }

        if (!this.updateSearchOnModelChange) { this.updateSearchOnModelChange = true}
        if (this.updateSearchOnModelChange) {
          model.hideSubCategoryItems = false;
          this.productSearchModel = model;

          // console.log('Product Search Model',this.productSearchModel  )
          return model;
          this.updateSearchResults();
        }

        this.searchDescription = `Results from ${ model.name}  ${categoryResults} ${departmentName}  ${itemTypeName}`
        return
      }
    )
  }

  updateSearchResults() {
    this.menuItems = [];
    this.nextPage();
  }

  getNextMenuItem() {
    let menuItem = {} as IMenuItem
    menuItem.id = -1;
    menuItem.name = 'Load More'
    return menuItem;
  }

  initDepartmentViews() {
    if (this.uiHomePage && this.uiHomePage.storeNavigation) {
      let  webMode = true
      if (this.isStaff) {  webMode = false  }

      const site  = this.siteService.getAssignedSite();
      const model = {} as ProductSearchModel;
      model.itemTypeID == 6
      model.pageSize   = 25
      model.pageNumber = 1
      model.active = true;
      model.webMode = webMode;
      model.hideSubCategoryItems = true;

      const departments$ = this.menuService.getGetDepartmentList(site).pipe(switchMap(data => {
        this.departments = data;
        if (this.isApp || this.isStaff) {
          this.departments = data.filter(item => { return item.active })
        }
        if (!this.isApp) {
          this.departments = data.filter(item => { return item.active && item.webProduct })
        }

        // console.log('initializing categories', this.productSearchModel.departmentID, this.departmentID)
        this.initCategoryViews(true)
        return of(data)
      }))

      this.departments$ = departments$;
    }
  }

  //used to filter top categories for grocery story style results
  initCategoryViews(firstView?: boolean) {
    if (this.uiHomePage.storeNavigation) {
      const site = this.siteService.getAssignedSite();
      let  webMode = true
      if (this.isStaff) { webMode = false }

      if (this.departments) {
        if (this.productSearchModel.departmentID) {
          this.departmentID = this.productSearchModel.departmentID.toString()
        }
        if (!this.productSearchModel.departmentID) {
          if (this.departments[0]) {
            this.departmentID = this.departments[0].id;
          }
        }
      }

      if (!this.departmentID || Number.isNaN(this.departmentID) ) {
        return
      }

      this.categories$ = this.menuService.getCategoryListNoChildrenByDepartmentPaging(site, +this.departmentID, webMode).pipe(
        switchMap(data => {
          this.categories = this.removeDuplicates(data)
          if (firstView && this.categories.length > 0) {
            if (this.categories[0] && this.categories[0].id) {
              this.categoryID = this.categories[0].id.toString()
              this.refreshSubCategories( +this.categoryID )
            }
          }
          return of(data)
      }))

    }
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
    this.categorySearchModel = catModel
  }

  setSubCategoryHeaders() {
    //do this when there is a sub category id in the model
  }

  changeDetect() {
    this.loading      = false
    this.cd.detectChanges()
    this.updateItemsPerPage()
  }

  setModel(model: ProductSearchModel, pageNumber: number) {
    let search = {} as ProductSearchModel;
    search.active = model.active
    search.barcode = model.barcode
    search.categoryID = model.categoryID
    search.departmentID = model.departmentID

    search.name = model.name;
    search.pageCount = model.pageCount;
    search.pageSize = model.pageSize;
    search.pageNumber = pageNumber;

    search.listTypeID = model.listTypeID;
    search.listPublisherID = model.listPublisherID;
    search.listBrandID = model.listBrandID;
    search.listDepartmentID = model.listDepartmentID;
    search.listCategoryID = model.listCategoryID;
    search.listSubCategoryID = model.listSubCategoryID;
    search.listSpecies = model.listSpecies;
    search.listSize = model.listSize;
    search.listColor = model.listColor;
    search.minQuantityFilter = model.minQuantityFilter;
    search.gf = model.gf;

    // console.log('search', pageNumber, search)
    return search;
  }

  addToListOBS(pageSize: number, pageNumber: number) :Observable<IMenuItem[] | IMenuItemsResultsPaged>  {

    if (!pageNumber || pageNumber == null) {pageNumber = 1 }
    if (!pageSize   || pageSize   == null) {pageSize   = 50}

    let model   = this.productSearchModel;
    if (!model) { model = {} as ProductSearchModel };

    const value = this.route.snapshot.paramMap.get('value');
    if (model && !value)  { model = this.getListSearchModel(model) }

    const site  = this.siteService.getAssignedSite();
    let displayCategories$ : Observable<IMenuItemsResultsPaged | IMenuItem[]>;
    if (this.uiHomePage && this.uiHomePage.storeNavigation) {
      let catModel = this.categorySearchModel;
      if (catModel){
        catModel.pageNumber = 1;
        catModel.pageSize   = 50;
        model.active        = true;
        displayCategories$  =  this.getProcess(site, catModel);
      }
    }

    if (pageNumber) {
      model.pageNumber = pageNumber;
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
    currentItems.push(...itemsIn);

    if (this.uiHomePage.storeNavigation) {
      if (this.departmentID && itemsIn) {
        const categories = itemsIn.filter(item => {
          if ( item.prodModifierType == 4 ) {
            return   item
          }
        }) as IMenuItem[]
      }

      if (!this.departmentID && this.categoryID && itemsIn) {

        const categories = itemsIn.filter(item => {
          if (item.prodModifierType == 4 ) {
            return   item
          }
        }) as IMenuItem[]
      }

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
  }

  refreshSubCategories(categoryID: number) {
    const site             = this.siteService.getAssignedSite()
    this.subCategoriesList = null;
    if (categoryID == 0  || categoryID == undefined) {
      return
    }
    this.categoryID = categoryID.toString();
    this.subCategories$    = this.menuService.getListOfSubCategories(site).pipe(
      switchMap(data => {
        this.subCategoriesList = data;
        this.subCategoriesList = data.filter(data => {return data.categoryID == categoryID});
        return of(data)
      })
    )
  }

  initFilterOption() {
    if (this.authService.deviceInfo) {
      const device = this.authService.deviceInfo
      if (this.uiHomePage) {
        if ((this.uiHomePage.staffAccordionMenuSideBar || this.uiHomePage.accordionMenuSideBar ||
          this.uiHomePage.departmentFilter || this.uiHomePage.itemTypeFilter || this.uiHomePage.categoryFilter  )) {
            this.enableFilter = true
            return;
          }
      }

      if (this.uiHomePage && this.uiHomePage.disableSearchFeaturesInItemsList) {
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
    this.toggleSearchMenu()
  }

  toggleSearchMenu() {
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
                this.menuItems.splice(this.menuItems.length -1 , 1)
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

            this.menuItems = this.removeDuplicates( this.menuItems )
            this.value     = ((this.menuItems.length   / this.totalRecords ) * 100).toFixed(0)

            if ( !this.endOfRecords) {
              const lastItem = this.getNextMenuItem();
              this.loading = false;
              this.menuItems.push(lastItem)
            }

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
    this.menuItems.splice(this.menuItems.length, 1)
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
    this.addToListOBS(this.pageSize, this.currentPage ).subscribe()
  }

  scrollDown() {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  getItemSrc(item:IMenuItem) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
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

  trackByFN(_, item: IMenuItem): IMenuItem {
    return item;
  }

}

