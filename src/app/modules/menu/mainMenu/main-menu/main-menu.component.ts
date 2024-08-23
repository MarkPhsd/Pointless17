import { Component, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable,  of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService } from 'src/app/_services';
import { PollingService } from 'src/app/_services/system/polling.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit  {

  searchForm: UntypedFormGroup;
  panelHeightValue = 100;
  panelHeightSize : string;
  smallDevice =false;
  panels = 0;
  departmentViewOn: boolean;
  orderAction$ : Observable<IPOSOrder>;
  @ViewChild('brandView')      brandView: TemplateRef<any>;
  @ViewChild('categoryView')   categoryView: TemplateRef<any>;
  @ViewChild('departmentView') departmentView: TemplateRef<any>;
  @ViewChild('tierMenuView')   tierMenuView: TemplateRef<any>;
  @ViewChild('searchSelector') searchSelector: TemplateRef<any>;
  @ViewChild('viewOverlay')    viewOverlay: TemplateRef<any>;
  @ViewChild('displayMenu')    displayMenu: TemplateRef<any>;
  @ViewChild('resaleMenu')     resaleMenu: TemplateRef<any>;
  @ViewChild('catalogScheduleMenuView')  catalogScheduleMenuView: TemplateRef<any>;

  disableImages: boolean;
  homePage$: Observable<UIHomePageSettings>;
  homePageSetings: UIHomePageSettings;
  smoke   = "./assets/video/smoke.mp4"
  isStaff = false;
  isUser  = false;

  site    : ISite;
  _site   : Subscription;
  _poll   : Subscription;
  connectedToApi: boolean;

  initPollSubscriptions() {
    this._poll = this.pollingService.poll$.subscribe( data => {
      this.connectedToApi = data;
    })
  }

  initSiteSubscriber() {
    this.initPollSubscriptions();
    this._site = this.siteService.site$.subscribe( data => {
      if (!data) { return }
      if (!this.site) { this.site = data }
      if (this.site.id != data.id) {
        this.reloadComponent();
      }
    })
  }

  constructor(
    private pollingService: PollingService,
    private uiSettings: UISettingsService,
    private userAuthorizationService: UserAuthorizationService,
    private siteService: SitesService,
    private router: Router,
    private menuService: MenuService,
    private orderMethodsService: OrderMethodsService,
    private fb: UntypedFormBuilder,
    private platFormService: PlatformService,
  ) {
  }

  setPanelHeight(item: UIHomePageSettings) {
    let value = 0

    let height = (100 / value).toFixed(0);
    this.panelHeightSize   = `calc(${height}vh - 65px)`

    if (!this.userAuthorizationService.isStaff) {
      if(item.categoriesEnabled  ) {value = value + 1}
      if(item.departmentsEnabled  ) {value = value + 1}
      if(item.brandsEnabled ) {value = value + 1}
    }

    if (this.userAuthorizationService.isStaff) {
      if ( item.staffBrandsEnabled)      { value = value + 1 }
      if ( item.staffCategoriesEnabled)  {value = value + 1}
      if ( item.staffDepartmentsEnabled) {value = value + 1}
    }

    this.panels = value;
    if (value == undefined) {
      value = 1;
    }

    if (value > 1) {value = 2;}

    if (value != 0) {
      height = (100 / value).toFixed(0);
      this.panelHeightValue  =  +height;
      this.panelHeightSize   = `calc(${height}vh - 65px)`
    }

    if (this.platFormService.isAppElectron) {
      setTimeout(this.refreshView, 25)
    }
  }

  refreshView() {
    this.isCategoryViewOn
  }

  ngOnInit(): void {
    this.updateItemsPerPage();
    this.initSearchForm();
    this.initSiteSubscriber();

    this.isStaff = false;
    this.isUser = this.userAuthorizationService.isUser;
    this.isStaff = this.userAuthorizationService.isCurrentUserStaff()
    this.homePage$ = this.initHomePageSettings()

    if (this.userAuthorizationService.user) {
      this.orderAction$ = this.orderMethodsService.getLoginActions()
    }
    this.updateItemsPerPage();
  }

  initHomePageSettings() {
    return this.uiSettings.UIHomePageSettings.pipe(
      switchMap(data => {
        // If data is not provided, set default settings
        if (!data) {
          this.homePageSetings = {
            departmentsEnabled: true,
            categoriesEnabled: true,
            brandsEnabled: true,
            tierMenuEnabled: true,
          } as UIHomePageSettings;
        } else {
          this.homePageSetings = data;
        }
        // Set panel height based on current settings
        this.setPanelHeight(this.homePageSetings);
        // Continue the chain with the posDevice$ observable
        const devicename = localStorage.getItem('devicename')
        if (!devicename) { return of(null)  }
        const user = localStorage.getItem('user')
        if (!user) { return of(null) }
        return this.uiSettings.posDevice$;
      }),
      switchMap(deviceData => {
        // Update disableImages based on device data if available
        // console.log('initHomePageSettings', deviceData?.name, deviceData?.disableImages)
        const user = localStorage.getItem('user')
        const devicename = localStorage.getItem('devicename')
        
        // console.log('userdevice', user, devicename)
        if (!user || !devicename) { 
          return  of(this.homePageSetings)
        }

        if (deviceData) {
          this.disableImages = deviceData?.disableImages;
        } else {
          const item = localStorage.getItem('devicename')
          if (!item) {  return of(this.homePageSetings); }
          if (item) {
            return this.uiSettings.getPOSDevice(item).pipe(switchMap(data => {
              if (data) {
                this.disableImages = deviceData?.disableImages;
              }
              return of(this.homePageSetings);
            }))
          }
        }

        // Wrap homePageSetings in an observable to continue the observable chain
        return of(this.homePageSetings);
    }))
  }

  posDevice() {
    const device = localStorage.getItem('devicename')
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      itemName: ''
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
    }
  }

  reloadComponent() {
    // console.log('reload')
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  navResale() {
    this.router.navigate(['/buy-sell'])
  }

  get catalogScheduleMenu() {
    if ((this.isStaff && this.homePageSetings.staffcatalogScheduleMenuEnabled) ||
          (!this.isStaff && this.homePageSetings.catalogScheduleMenuEnabled)) {
        return this.catalogScheduleMenuView;
    }
    return null;
  }

  get isDisplayMenuOn() {
    if ((this.isStaff && this.homePageSetings.staffMenuEnabled) ||
        (!this.isStaff &&   this.homePageSetings.menuEnabled)) {
      return this.displayMenu
    }
    return null;
  }

  get isResaleMenuOn() {
     if ((this.isStaff && this.homePageSetings.resaleMenu) ||
         (!this.isStaff &&   this.homePageSetings.resaleMenu)){
      return this.resaleMenu
    }
    return null;
  }

  get isBrandListViewOn() {
    if ((this.isStaff && this.homePageSetings.staffBrandsEnabled) ||
         (!this.isStaff &&   this.homePageSetings.brandsEnabled)){
      return this.brandView
    }
    return null;
  }

  get isTierMenuViewOn() {
    if ((this.isStaff && this.homePageSetings.staffTierMenuEnabled) ||
        (!this.isStaff &&   this.homePageSetings.tierMenuEnabled)) {
      return this.tierMenuView
    }
    return null;
  }

  get isCategoryViewOn() {
    if ((this.isStaff && this.homePageSetings.staffCategoriesEnabled) ||
        (!this.isStaff &&   this.homePageSetings.categoriesEnabled)) {
      this.isOnlyCategoryView
      return this.categoryView
    }

    return null;
  }

  get isOnlyCategoryView() {
    if (this.isStaff) {
      // if (this.homePageSetings.staffCategoriesEnabled) {
      //   return false
      // }
      if (this.homePageSetings.staffcatalogScheduleMenuEnabled) {
        return false
      }
      if (this.homePageSetings.staffDepartmentsEnabled) {
        return false
      }
      if (this.homePageSetings.staffTierMenuEnabled) {
        return false
      }
    }
    if (!this.isStaff) {
      // if (this.homePageSetings.categoriesEnabled) {
      //   return false
      // }
      if (this.homePageSetings.departmentsEnabled) {
        return false
      }
      if (this.homePageSetings.catalogScheduleMenuEnabled) {
        return false
      }
      if (this.homePageSetings.tierMenuEnabled) {
        return false
      }
    }
    this.router.navigate(['/categories/', {id:4}])
    return true
  }

  get isDepartmentViewOn() {
    if ((this.isStaff && this.homePageSetings.staffDepartmentsEnabled) ||
         (!this.isStaff   &&  this.homePageSetings.departmentsEnabled)) {
          return this.departmentView
    }

    if  (!this.isStaff  &&  this.homePageSetings.departmentsEnabled) {
      return this.departmentView
    }

    return null;
  }

  get isSearchSelectorOn() {
    if (this.smallDevice) {
      return this.searchSelector
    }
    return null;
  }

  isviewOverlayOn() {
    return null;
  }

  applyProductSearchModel(itemName: string) : ProductSearchModel {
    let  productSearchModel=  {} as ProductSearchModel
		productSearchModel.type         = null;
		productSearchModel.categoryID   = null;
		productSearchModel.departmentID = null;
		productSearchModel.name         = null;
		productSearchModel.barcode      = null;
		productSearchModel.departmentName = null;
		if (itemName) {
		  productSearchModel.name               =  itemName;
		  productSearchModel.useNameInAllFields = true
		}

		productSearchModel.barcode    = productSearchModel.name
		productSearchModel.pageSize   = 50
		productSearchModel.pageNumber = 1
		this.menuService.updateSearchModel(productSearchModel)
		return productSearchModel
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(itemName) {
    try {
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.applyProductSearchModel(itemName);
      this.listItems(searchModel)
    } catch (error) {
      console.log('error', error)
    }
  }

  listItems(model: ProductSearchModel) {
    this.router.navigate(
      [
        "/menuitems-infinite", { value: 1}
      ]
    )
  }

}


