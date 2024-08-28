
import {  Component, ElementRef,AfterViewInit,
   OnInit, EventEmitter,Output,
  ViewChild,
  Input,
  TemplateRef
  } from '@angular/core';
import { AWSBucketService, AuthenticationService, IProductSearchResults, MenuService} from 'src/app/_services';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent,of } from 'rxjs';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
const  { Keyboard } = Plugins;

// https://codeburst.io/how-to-create-horizontal-scrolling-containers-d8069651e9c6
//we are only using one section now.
// https://dev.to/angular/ain-t-nobody-needs-hostlistener-fg4


// Multi Column Grid - cdk To change 'isHandSet
// https://stackoverflow.com/questions/53477373/cdk-virtualscroll-with-mat-grid-list

//nice design based on cards.
//https://zoaibkhan.com/blog/create-a-responsive-card-grid-in-angular-using-flex-layout-part-1/

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class CategoriesComponent implements OnInit, AfterViewInit{
  // @HostBinding('@pageAnimations')
  amount: any;
  @ViewChild('editItemView') editItemView :  TemplateRef<any>;

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  @Input() disableImages: boolean;

  textLength       = 26;
  @Input()         panelHeightValue = 300;
  panelHeightStyle= ''
  currentPage      : number;
  startRow         : number;
  endRow           : number;
  loading          : boolean;
  endOfRecords     : boolean;
  searchForm       : UntypedFormGroup;
  searchPhrase     :         Subject<any> = new Subject();
  get itemName()   { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  placeHolderImage   : String = "assets/images/placeholderimage.png"
  bucket$:    Observable<any>;

  searchModel: ProductSearchModel
  searchItems$     : Subject<IProductSearchResults> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  productSearchResults : IProductSearchResults
  categories$:    Observable<IMenuItem[]>;
  categories:     IMenuItem[];
  isDown          = false;
  startX:         any;
  scrollLeft:     any;
  href:           string;
  slider:         HTMLElement;
  section:        number;
  bucket:         string;
  private destroy$ = new Subject<void>();
  singlePage:     boolean;
  public style    = {};
  platForm        =  this.getPlatForm()
  appName         = ''
  isApp           = false;

  value           : any;
  itemsPerPage    : number;
  totalRecords    : number;
  pagingInfo      : IPagedList;
  scrollingInfo   : any;
  endofItems      : boolean;
  toggleSearch    : boolean;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;
  @Input()  itemTypeID    = 4;
  scrollContainer  :   any;
  isNearBottom     :   any;
  action$: Observable<any>;
  classcontainer   : string;
  orderslist       : string
  @Input() uiHomePage:  UIHomePageSettings;
  uiHomePage$: Observable<UIHomePageSettings>;
  isStaff = this.userAuth.isStaff

  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
                private menuService:     MenuService,
                private awsBucket:       AWSBucketService,
                private router                   : Router,
                private authSevice               : AuthenticationService,
                private siteService              : SitesService,
                private platFormService          : PlatformService,
                private productEditButtonService : ProductEditButtonService,
                public  authenticationService    : AuthenticationService ,
                private toolbarUIService         : ToolBarUIService,
                public  uiSettings                : UISettingsService,
                private userAuth                : UserAuthorizationService,
   )
  {
    this.isApp = this.platFormService.isApp();
    this.section = 1
    this.href = this.router.url;
  }

  ngOnInit() {
    this.getBucket()
    this.init();
    this.setPanelSyle();
    if (this.authSevice && this.authSevice.deviceInfo && 
          this.authSevice.deviceInfo?.phoneDevice) {
      this.textLength = 24
    }
    this.uiSettings.posDevice$.subscribe(data => {
      if (data) {
        this.disableImages = data?.disableImages;
      }
    })
  }

  getPlaceHolder() {
    return this.placeHolderImage // this.placeHolderImage
  }

  init() {
    const site              = this.siteService.getAssignedSite()
    const searchModel       = {} as ProductSearchModel;
    searchModel.itemTypeID  = this.itemTypeID;
    searchModel.pageSize    = 45;
    searchModel.currentPage = 1;
    searchModel.pageSize    = 1;
    searchModel.webMode     = this.menuService.isWebModeMenu;
    this.searchModel        = searchModel;
    this.addToList(searchModel.pageNumber, searchModel.pageSize)
    this.initClass();;
  }

  setPanelSyle() {
    if ( this.singlePage ) {
      this.panelHeightStyle =  `calc(100vh - 225px)`
    }
    if ( !this.singlePage ) {
      this.panelHeightStyle =  `calc(25vh - 95px)`
      if (this.panelHeightValue !=0) {
        this.panelHeightStyle =  `calc(${this.panelHeightValue}vh - 95px)`
      }
    }
  }

  initClass() {
    if (this.href.substring(0, 11 ) === '/categories') {
      this.singlePage = true
      this.classcontainer = 'parent-container-single-page'
      this.orderslist = 'orders-list-single-page'
      return;
    }

    this.singlePage = false
    this.classcontainer = 'parent-container'
    this.orderslist     = 'orders-list'
  }

  ngAfterViewInit() {
    this.initSearchOption();
  }

  initSearchOption() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(250),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          if (this.input && this.input.nativeElement && this.input.nativeElement.value) {
            const search  = this.input.nativeElement.value
            this.input.nativeElement.focus();
            this.refreshSearch();
          }
        })
      )
      .subscribe();
    }

    if (this.platForm == 'android') {
      setTimeout(()=> {
        if (this.input && this.input.nativeElement) {
          this.input.nativeElement.focus();
          Keyboard.hide();
        }
      }, 200 )
    }
  }

  clearAll(){
    this.initSearchModel();
    this.input.nativeElement.value = ''
    this.input.nativeElement.focus();
    if (this.platForm == 'android') {
      Keyboard.hide();
    }
  }

  getBucket() {
    this.bucket$ = this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

  refreshMouseMove(pageX: any) {
    if (this.slider) {
      const x = pageX - this.slider.offsetLeft;
      const walk = (x -  this.startX) * 3; //scroll-fast
      this.slider.scrollLeft =  this.scrollLeft - walk;
    }
  }

  showAll() {
    const type = {typeID: this.itemTypeID};
    this.router.navigate(["/categories/", type]);
  }

  _listItems(event) {
    this.listItems(event)
  }

  listItems(id:number) {
    this.initProductSearchModel(id)
    this.searchModel = this.menuService.initSearchModel()

    if (this.itemTypeID == 4) {
      this.searchModel.categoryID = id;
    }

    if (this.itemTypeID == 5) {
      this.searchModel.subCategoryID = id;
    }

    if (this.itemTypeID == 6) {
      this.searchModel.departmentID = id;
    }

    if (this.uiHomePage && this.uiHomePage.storeNavigation ) {
      this.router.navigate(["/menuitems-infinite/"]);
      return;
    }

    if (this.itemTypeID == 4) {
      this.router.navigate(["/menuitems-infinite/", {categoryID:id, hideSubCategoryItems: false}]);
      return;
    }

    if (this.itemTypeID == 5) {
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:id, hideSubCategoryItems: false}]);
      return;
    }

    if (this.itemTypeID == 6) {
      this.router.navigate(["/menuitems-infinite/", {departmentID:id, hideSubCategoryItems: false}]);
      return;
    }

  }

  // _getItemSrc(event) {
  //   this._getItemSrc(event?.value)
  // }

  getItemSrc(nameArray: string) {
    // console.log('getItemSrc', nameArray)
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  initProductSearchModel(id: number): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;

    if (this.itemTypeID == 6) {
        productSearchModel.hideSubCategoryItems = true;
      { productSearchModel.departmentID  = id }
    }

    if (this.itemTypeID == 4) {
       productSearchModel.hideSubCategoryItems = false;
      { productSearchModel.categoryID  = id }
    }
 
    productSearchModel.pageSize   = 45
    productSearchModel.pageNumber = 1
    this.menuService.updateSearchModel(productSearchModel)
    return productSearchModel;
  }

  initSearchModel():      ProductSearchModel {
    let searchModel       = {} as ProductSearchModel;
    searchModel           = this.applyBrandSearchModel(searchModel)
    return searchModel
  }

  _nextPage(event) {
    this.nextPage()
  }

  async nextPage() {
    this.searchModel.currentPage   = this.searchModel.currentPage + 1;
    await this.addToList(this.searchModel.pageSize, this.searchModel.pageNumber )
  }

  onScrollDown() {
    this.scrollingInfo = 'scroll down'
    this.nextPage();
  }

  onScrollUp() {
    // console.log('scrolled up!!');
  }

  async addToList(pageSize: number, pageNumber: number)  {
    const model                    = this.searchModel
    if (!model.currentPage)        { model.currentPage = 1}
    model.pageNumber               = model.currentPage
    model.pageSize                 = pageSize
    const site                     = this.siteService.getAssignedSite();
    const results$                 = this.menuService.getMenuItemsBySearchPaged(site, model);
    this.loading                   = true

    results$.subscribe(data => {

      this.loading = false;
      if (!data || ( data?.results && data?.results.length == 0 ) || data.results == null) {
        this.value        = 100;
        this.loading      = false
        this.endOfRecords = true
        return
      }

      if (!this.categories)  { this.categories = [] as IMenuItem[] }
      this.itemsPerPage = this.itemsPerPage + data.results.length;

      if (this.categories) {

        if (this.categories[this.categories.length-1]?.id == -1) {
          this.categories.splice(this.categories.length-1, 1)
        }

        if (data.results) {
          data.results.forEach( item => {
            this.categories.push(item)
          })
        }

        this.totalRecords = data.paging.totalRecordCount;
        if ( this.categories.length == this.totalRecords ) {
          this.endOfRecords = true;
          this.loading = false;
          this.value = 100;
        }

        if (!this.endOfRecords) {
          this.categories.push(this.loadMore)
        }

        this.value = ((this.categories.length /  data.paging.totalRecordCount ) * 100).toFixed(0)
        this.loading      = false
        return
      }

        this.pagingInfo = data.paging
        if (data) {
          this.categories   = data.results
          this.loading      = false
          this.value        = 100;
        }
      }
    )

  };

  get loadMore() {
    let item = { } as  IMenuItem;
    item.name = 'Load More';
    item.id = -1;
    return item
  }

    //this is called from subject rxjs obversablve above constructor.
  async refreshSearch() {
    this.currentPage             = 1
    const site                   = this.siteService.getAssignedSite()
    const searchModel            = this.initSearchModel();
    this.startRow                = 1;
    this.endRow                  = 45
    this.searchModel = searchModel
    this.productSearchResults    = {} as IProductSearchResults
    this.searchModel.pageSize    = 45
    this.searchModel.pageNumber  = 1
    this.searchModel.currentPage = 1
    this.searchModel.itemTypeID  = this.itemTypeID;
    await this.addToList(this.searchModel.pageSize, this.searchModel.pageNumber )
    return this._searchItems$
  }

  applyBrandSearchModel(searchModel: ProductSearchModel) : ProductSearchModel {
    if (this.itemName.value) {
      searchModel.categoryName  = this.input.nativeElement.value
    }
    searchModel.pageSize        = 45
    searchModel.pageNumber      = 1
    return searchModel;
  }

  _editItem(event) {
    this.editItem(event?.value)
  }

  editItem(menuItem) {
    // console.log('edit item', menuItem?.name)
    if (!menuItem) { return }
    this.action$ = this.productEditButtonService.openProductDialogObs(menuItem.id);
  }

  get enableEditItem() {
    if (this.authenticationService.isAdmin) {
        return this.editItemView
    }
    return null;
  }

  gotoFilter() {

    this.router.navigate(['filter'])
    this.toolbarUIService.hideToolbarSearchBar()
  }

}
