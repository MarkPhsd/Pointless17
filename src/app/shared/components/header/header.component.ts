import { Component, OnInit, Output, EventEmitter,
        HostBinding, Renderer2, HostListener, OnDestroy, OnChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder,FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService,AuthenticationService, OrdersService, MessageService, } from 'src/app/_services';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { ICompany, IPOSOrder, ISite, IUser, IUserProfile,  }  from 'src/app/_interfaces';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Observable, of, Subject, Subscription,switchMap   } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SiteSelectorComponent } from '../../widgets/site-selector/site-selector.component';
import { Location} from '@angular/common';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ScaleInfo, ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PollingService } from 'src/app/_services/system/polling.service';
import { Router } from '@angular/router';
import { IFloorPlan } from 'pointless-room-layout/src/app/app.component';
import { FloorPlanService } from 'src/app/_services/floor-plan.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';


interface IIsOnline {
  result: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('floorPlanTemplate') floorPlanTemplate: TemplateRef<any>;
  @Output() outPutToggleSideBar:      EventEmitter<any> = new EventEmitter();
  @Output() outPutToggleSearchBar:    EventEmitter<any> = new EventEmitter();
  openOrderBar:                      boolean;
  @HostBinding('class')      className = '';
  mattoolbar                 ='mat-toolbar'

  gridlayout        = 'grid-flow grid-margin'
  gridlayoutNoStaff = 'grid-flow grid-margin-nostaff'
  isApp                      : boolean;
  company                    = {} as ICompany;
  compName:                  string;
  userName:                  string;
  userRoles:                 string;
  employeeName  :            string;
  source:                    MatSlideToggle
  orderBarSource:            MatSlideToggle
  checked:                   boolean;
  timerID:                   any;
  //Theme Control
  toggleTheme              : string;
  id:                        any;
  company$:                  Observable<ICompany>;
  subscription              :   Subscription;
  messages:       any[] = [];
  showSearchForm: boolean;
  showContainer:  boolean;
  sideBarOnInit:  boolean ;
  isAPIOnline$:   Observable<any>;
  site:           ISite;
  sitePickerWidth = 50;
  searchForm          : FormGroup;

  phoneDevice         : boolean;
  smallDevice         :   boolean;
  scannerEnabled      : boolean;
  private toolBar     :  boolean;

  showPOSFunctions    =   false;
  scaleName           :   any;
  scaleValue          :   any;

  isUserStaff         =   false;
  isManager           :     boolean;
  isAdmin             =   false;
  isUser              =   false;
  _order              :   Subscription;
  order               :   IPOSOrder;

  _orderBar           : Subscription;
  orderBar            : boolean;

  _order$             : Observable<IPOSOrder>;
  order$              : Subject<Observable<IPOSOrder>> = new Subject();

  scaleInfo           : ScaleInfo;
  _scaleInfo          : Subscription;
  scaleSetup          : ScaleSetup;
  displayWeight       : string;

  _openOrderBar       : Subscription;

  user                : IUser;
  _user               : Subscription;

  searchSideBar       : any;
  _searchSideBar      : Subscription;

  _mainMenuSideBar:   Subscription;

  message: string;
  menuBar    = 'menu'
  searchBar  = 'search';
  flexsections = 'flex-sections'
  matToolbarColor = 'primary';

  siteName        : string;
  bucket          = '';
  homePageSetings : UIHomePageSettings;
  floorPlans$     : Observable<IFloorPlan[]>;
  posDevice$      : Observable<ITerminalSettings>;
  terminalSetting : any;

  _site: Subscription;
  initSiteSubscriber() {
    this._site = this.siteService.site$.subscribe( data => {
      this.site = data
    })
  }
  initOrderSubscriber() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }
  initScaleSubscriber() {
    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      this.scaleInfo = data
    })
  }
  initOrderBarSubscriber() {
    this._openOrderBar = this.toolbarUIService.orderBar$.subscribe( data => {
      this.openOrderBar = data;
    })
  }
  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getUserInfo()
    })
  }
  initToobarServiceUI() {
    this._searchSideBar = this.toolbarUIService.searchSideBar$.subscribe( data => {
      if (data) {
        this.searchBar = 'search_off'
      }
      if (!data) {
        this.searchBar = 'search'
      }
    })
  }
  initMainToolbarUI() {
    this._mainMenuSideBar = this.toolbarUIService.mainMenuSideBar$.subscribe( data => {
      if (data) {  this.searchBar = 'menu_open'
        this.menuBar = 'menu_open'
      }
      if (!data) {
        this.menuBar = 'menu'
      }
    })
  }

  initUIService() {
    this.uiSettings.getSetting('UIHomePageSettings').subscribe( data => {
        if (data) {
          this.homePageSetings  = JSON.parse(data.text) as UIHomePageSettings;
        }
      }
    )
  }

  initSubscriptions() {
    this.initOrderSubscriber()
    this.initScaleSubscriber();
    this.initOrderBarSubscriber();
    this.initUserSubscriber();
    this.initToobarServiceUI() ;
    this.initMainToolbarUI();
    this.initSiteSubscriber();
  }

  constructor(private authenticationService : AuthenticationService,
              private userSwitchingService  : UserSwitchingService,
              private pollingService        : PollingService,
              private dialog:                 MatDialog,
              private companyService:         CompanyService,
              private _renderer:              Renderer2,
              public  orderService:           OrdersService,
              private messageService:         MessageService,
              public  breakpointObserver:     BreakpointObserver,
              private siteService:            SitesService,
              public  toolbarUIService:       ToolBarUIService,
              private location:               Location,
              private scaleService          : ScaleService,
              private navigationService     : NavigationService,
              public  platFormService       : PlatformService,
              private router                : Router,

              private floorPlanSevice       : FloorPlanService,
              private uiSettings            : UISettingsService,
              private fb                    : FormBuilder ) {
  }

  ngOnChanges() {
    this.getUserInfo();
  }

  ngOnInit() {
    this.site =  this.siteService.getAssignedSite();

    this.scaleSetup = this.scaleService.getScaleSetup(); //get before subscriptions;
    this.initSearchObservable();
    this.messageService.sendMessage('show');

    this.platFormService.getPlatForm();
    this.initSubscriptions();

    this.getUserInfo();
    this.refreshScannerOption()
    this.searchForm = this.fb.group( {  searchProducts: '' });
    this.renderTheme();
    this.refreshTheme()
    this.initCompany();
    this.mediaWatcher()
    this.initSite();
    this.updateItemsPerPage();
    this.pollingService.poll();
    this.initUserOrder();
    this.updateScreenSize();
    this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(this.site);

    const devicename = localStorage.getItem('devicename')
    if (devicename) {
      this.posDevice$ = this.uiSettings.getPOSDeviceSettings().pipe(
        switchMap(data => {
          this.terminalSetting = data;
          const posDevice = JSON.parse(data.text) as ITerminalSettings;
          this.uiSettings.updatePOSDevice(posDevice)
          return of(posDevice)
        }
      ))
    }


    // gridlayout        = 'grid-flow grid-margin'
    // gridlayoutNoStaff = 'grid-flow grid-margin-nostaff'

  }

  ngOnDestroy() {
    if (this._searchSideBar) { this._searchSideBar.unsubscribe()}
    if (this._openOrderBar) {  this._openOrderBar.unsubscribe(); }
    if (this._scaleInfo) {this._scaleInfo.unsubscribe(); }
    if (this._order) { this._order.unsubscribe(); }
    if (this._user) {this._user.unsubscribe();}
    if ( this._mainMenuSideBar) { this._mainMenuSideBar.unsubscribe()}
    if (this._site) {this._site.unsubscribe()}
  }

  refreshUserBar(user: IUser) {
    if (user && user.roles === 'user') {
      this.flexsections = 'flex-sections-user'
      return
    }
    if (user) {
      this.flexsections = 'flex-sections'
      return
    }
    if (!user) {
      this.flexsections = 'flex-sections-nouser'
      this.flexsections = 'flex-sections'
      return
    }
  }

  //if there is a current order for this user, then we can assign it here.
  initUserOrder(){
    if (this.user && (!this.order || (!this.order.id || this.order.id == 0)) ) {
      const userProfile = {} as IUserProfile;
      userProfile.id = this.user?.id;
      userProfile.roles = this.user?.roles;
      this.userSwitchingService.assignCurrentOrder(userProfile)
    }
  }

  refreshScannerOption() {
    this.scannerEnabled = false
    if (this.platFormService.isApp()) {
      this.scannerEnabled = true;
      this.isApp = true
    }
  }

  refreshTheme() {
    if ( localStorage.getItem('angularTheme') === 'dark-theme') {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
      localStorage.setItem('angularTheme', 'dark-theme')
    } else {
      this._renderer.addClass(document.body, 'light-theme');
      this._renderer.removeClass(document.body, 'dark-theme');
      localStorage.setItem('angularTheme', 'light-theme')
    }
  }

  goBack() {
    this.smallDeviceLimiter
    const hasHistory = this.router.navigated;
    if (hasHistory) {
      this.location.back();
    }
  }

  smallDeviceLimiter() {
    if (this.smallDevice) { this.toolbarUIService.updateOrderBar(false) }
  }

  // get istableLayout() {
  //   if (this.isUserStaff) {
  //     this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site);
  //   }
  // }

  get isfloorPlan() {
    if (this.isUserStaff || this.isAdmin) {
      return this.floorPlanTemplate
    }
    return null;
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.showSearchForm = true
    this.smallDevice = false
    this.phoneDevice = false;
    if (window.innerWidth >= 1200) {
      this.sitePickerWidth = 33
    } else if (window.innerWidth >= 992) {
      this.sitePickerWidth = 33
    }

    if (811 >= window.innerWidth ) {
      this.showSearchForm = false
      this.sitePickerWidth = 75
      this.smallDevice = true
    }
    if (500 >= window.innerWidth) {
      this.phoneDevice = true;
    }
    this.refreshUserBar(this.user)
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if (811 >= window.innerWidth ) {
      this.smallDevice = true
    }

    if (this.platFormService.androidApp) {
      this.mattoolbar = 'mat-toolbar-android'
    }

    if (this.platFormService.androidApp && !this.user) {
      this.mattoolbar = 'mat-toolbar-android-no-user'
    }
  }

  getUserInfo() {
    this.initUserInfo();
    let user: IUser;

    if (this.user) { user = this.user  }
    if (!this.user) {
       user = JSON.parse(localStorage.getItem('user')) as IUser;
    }

    this.refreshUserBar(user)
    this.isAdmin      = false;

    this.isManager    = false
    this.showPOSFunctions = false;

    if (!user) {  return null }
    this.userName     = user.username;

    if (!user.roles) {
      return
    }

    this.userRoles    = user?.roles.toLowerCase();
    this.employeeName = `${user?.lastName}, ${user?.firstName.substring(1,1)}`

    this.isUser = false;
    if (user.roles === 'user') {
      this.isUser = true;
    }

    if (user.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true
      this.isUserStaff      = true
    }

    if (user?.roles === 'employee') {
      this.isUserStaff      = true
      this.showPOSFunctions = true;
    }

    if (user?.roles === 'manager') {
      this.isManager        = true
      this.showPOSFunctions = true;
      this.isUserStaff      = true
    }

    if (this.isUserStaff) {
      this.gridlayout = this.gridlayout
    }

    if (!this.isUserStaff) {
      this.gridlayout = this.gridlayoutNoStaff
    }
  }

  initUserInfo() {
    this.userName         = '';
    this.userRoles        = '';
    this.showPOSFunctions = false;
    this.isAdmin          = false;
    this.isUserStaff      = false;
    this.employeeName     = '';
  }

  initSite() {
    this.site = this.siteService.getAssignedSite();
    if (this.site.name) {
      if (this.site.name == undefined || this.site.name === 'undefined') {
        this.site.name = ''
        return
      }
      this.site.name = this.site.name.trim()
      this.siteName = this.site.name.trim()
    }
  }

  mediaWatcher(){
    this.breakpointObserver
    .observe(['(min-width: 60em)'])
    .subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.showContainer = true;
      } else {
        this.showContainer = false;
      }
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
     return of(result as T);
    };
  }

  initCompany() {
    const site     =   this.siteService.getAssignedSite();
    this.company$  =   this.companyService.getCompany(site)
    this.initSite();
  }

  initSearchObservable() {
    this.subscription = this.messageService.getMessage().subscribe(data => {
      if (data) {
        this.messages.push(data);
      } else {
        this.messages = [];
      }
    });
  }

  deviceInfo() {
    if (this.terminalSetting) { return }
    this.uiSettings.openEditPOSDevice(this.terminalSetting)
  }

  goHome() {
    this.smallDeviceLimiter();
    this.navigationService.navHome();
  }

  navPOSOrders() {
    this.smallDeviceLimiter();
    this.navigationService.navPOSOrders()
  }

  navTableService() {
    this.smallDeviceLimiter();
    this.navigationService.navTableService()
  }

  toggleSideBar() {
    this.openOrderBar = !this.openOrderBar
    this.toolbarUIService.switchToolBarSideBar()
  }

  toggleSearchMenu() {
    this.smallDeviceLimiter();
    this.toolbarUIService.switchSearchBarSideBar()
  }

  toggleOrderBar(event) {
    if (this.openOrderBar){ this.smallDeviceLimiter();    }
    this.toolbarUIService.updateOrderBar(this.openOrderBar)
  }

  logout() {
    this.userSwitchingService.clearLoggedInUser();
    this.smallDeviceLimiter();
  }

  renderTheme() {
    this.toggleTheme = localStorage.getItem('angularTheme')
    if (this.toggleTheme === 'dark-theme' ) {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.removeClass(document.body, 'light-theme');
    } else {
      this._renderer.addClass(document.body, 'light-theme');
      this._renderer.removeClass(document.body, 'dark-theme');
    }
  }

  siteSelector() {
    this.toolbarUIService.updateDepartmentMenu(0);
    const dialogRef = this.dialog.open( SiteSelectorComponent,
      { width:     '350',
        height:    '90vh',
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      this.initSite();
    });
  }

  readScale() {
    this.scaleService.readScale();
  }

  switchUser() {
    this.userSwitchingService.openPIN({request: 'switchUser'})
  }

  assingBackGround(image: string) {
    if (!image) { return }
  }

}

