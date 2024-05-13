import { Component, OnInit, Output, EventEmitter,QueryList,
        HostBinding, Renderer2, HostListener, OnDestroy, OnChanges, TemplateRef, ViewChild, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder,UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { CompanyService,AuthenticationService, OrdersService, MessageService, } from 'src/app/_services';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { ICompany, IPOSOrder, ISite, IUser, IUserProfile,  }  from 'src/app/_interfaces';
import { MatLegacySlideToggle as MatSlideToggle } from '@angular/material/legacy-slide-toggle';
import { catchError, Observable, of, Subject, Subscription,switchMap   } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SiteSelectorComponent } from '../../widgets/site-selector/site-selector.component';
import { Location} from '@angular/common';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ScaleInfo, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PollingService } from 'src/app/_services/system/polling.service';
import { Router } from '@angular/router';
// import { IFloorPlan } from 'pointless-room-layout/src/app/app.component';
import { FloorPlanService, IFloorPlan } from 'src/app/_services/floor-plan.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { CoachMarksService,CoachMarksClass } from '../../widgets/coach-marks/coach-marks.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { NavigationHistoryService } from 'src/app/_services/system/navigation-history.service';

interface IIsOnline {
  result: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy, OnChanges,AfterViewInit {
  @ViewChild('clockInOut')           clockInOut: TemplateRef<any>;
  @ViewChild('userActions')          userActions: TemplateRef<any>;
  @ViewChild('searchMenuView')       searchMenuView: TemplateRef<any>;
  @ViewChild('floorPlanTemplate')    floorPlanTemplate: TemplateRef<any>;
  @ViewChild('menuButtonContainer')  menuButtonContainer: TemplateRef<any>;
  @ViewChild('coachingTableLayout', {read: ElementRef}) coachingTableLayout: ElementRef;
  @ViewChild('coachingLogin', {read: ElementRef}) coachingLogin: ElementRef;
  @ViewChild('coachingPosTerminalIcon', {read: ElementRef}) coachingPosTerminalIcon: ElementRef;
  @ViewChild('coachingIDScanner', {read: ElementRef}) coachingIDScanner: ElementRef;

  // @ViewChildren('coachingPosTerminalIcon', {read: ElementRef}) coaching: QueryList<ElementRef>;
  action$: Observable<any>;

  @Output() outPutToggleSideBar:      EventEmitter<any> = new EventEmitter();
  @Output() outPutToggleSearchBar:    EventEmitter<any> = new EventEmitter();
  openOrderBar:                      boolean;
  @HostBinding('class')      className = '';
  mattoolbar                 ='mat-toolbar'

  gridlayout        = 'grid-flow grid-margin'
  gridlayoutNoStaff = 'grid-flow grid-margin-nostaff'

  company                    = {} as ICompany;
  compName:                  string;

  source:                    MatSlideToggle
  orderBarSource:            MatSlideToggle
  checked:                   boolean;
  timerID:                   any;

  toggleTheme              : string;
  id:                        any;
  company$:                  Observable<ICompany>;


  _messages              :   Subscription;
  messages:       any[] = [];
  showSearchForm: boolean;
  showContainer:  boolean;
  sideBarOnInit:  boolean ;
  isAPIOnline$:   Observable<any>;
  site:           ISite;
  sitePickerWidth = 50;
  searchForm          : UntypedFormGroup;

  phoneDevice         :  boolean;
  smallDevice         :  boolean;
  scannerEnabled      :  boolean;
  private toolBar     :  boolean;

  showPOSFunctions    =   false;
  scaleName           :   any;
  scaleValue          :   any;

  isUserStaff         =   false;
  isManager           :   boolean;
  isAdmin             =   false;
  isUser              =   false;

  _transactionUI      :   Subscription;

  userSave$                 : Observable<any>;
  userInitCheck$: Observable<any>;
  user                : IUser;
  _user               : Subscription;
  signOut: boolean;

  userName:                  string;
  userRoles:                 string;
  employeeName  :            string;
  homePageSetings       : UIHomePageSettings;
  uiTransactionSetting  : TransactionUISettings;
  uiTransactionSetting$ : Observable<TransactionUISettings>;
  uiHomePageSetting$    : Observable<UIHomePageSettings>;
  initUITransactions    : boolean;
  _orderBar           : Subscription;
  orderBar            : boolean;

  _order              : Subscription;
  order               : IPOSOrder;
  _order$             : Observable<IPOSOrder>;
  order$              : Subject<Observable<IPOSOrder>> = new Subject();

  scaleInfo           : ScaleInfo;
  _scaleInfo          : Subscription;
  scaleSetup          : ScaleSetup;
  displayWeight       : string;

  _openOrderBar       : Subscription;
  searchSideBar       : any;
  _searchSideBar      : Subscription;

  _mainMenuSideBar:   Subscription;
  userSwitching = true;
  public widthOfWindow: number;
  message: string;
  menuBar    = 'menu'
  searchBar  = 'search';
  flexsections = 'flex-sections'
  matToolbarColor = 'primary';

  siteName        : string;
  bucket          = '';
  floorPlans$     : Observable<IFloorPlan[]>;
  posDevice$      : Observable<ITerminalSettings>;
  terminalSetting : any;
  posDevice: ITerminalSettings;
  mailCount  = 0;
  headerBackColor: string;
  userChecked: boolean;
  _site: Subscription;

  initSiteSubscriber() {
    this._site = this.siteService.site$.subscribe( data => {
      this.site = data
    })
  }

  initOrderSubscriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  initOrderBarSubscriber() {
    this._openOrderBar = this.toolbarUIService.orderBar$.subscribe( data => {
      this.openOrderBar = data;
    })
  }

  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      if (this.user && (data && data.id)) {
        if (this.user.id == data.id) {    this.userChecked = true; }
      }
      this.user = data
      this.setInterFace(data)
      this.setHeaderBackColor(this.user?.userPreferences?.headerColor)
      if (!this.initUITransactions) {
        this.initUITransactions = true;
        this.getTransactionUI()
      }
    })
  }

  getTransactionUI() {
    this.uiSettings.getSetting('UITransactionSetting').subscribe(data => {
      if (data) {
        const config = JSON.parse(data.text)
        this.uiSettings.updateUISubscription(config)
      }
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
      if (data) {   this.menuBar = 'menu_open' }
      if (!data) {   this.menuBar = 'menu'  }
    })
  }

  getUITransactionsSettings() {
    this._transactionUI = this.uiSettings.transactionUISettings$.subscribe( data => {
      if (data) { this.uiTransactionSetting = data; }
    });
  }

  setHeaderBackColor(color) {
    this.headerBackColor = ''
    if (color) {  this.headerBackColor = `background-color:${color};` }
    if (color) {
      this.matToolbarColor = ''
    } else {
      this.matToolbarColor = 'primary'
    }
  }

  initSubscriptions() {
    this.initOrderSubscriber()
    this.initOrderBarSubscriber();
    this.initUserSubscriber();
    this.initToobarServiceUI() ;
    this.initMainToolbarUI();
    this.initSiteSubscriber();
    this.getUITransactionsSettings();
  }

  constructor(private authenticationService : AuthenticationService,
              private userAuthService         :UserAuthorizationService,
              private userSwitchingService  : UserSwitchingService,
              private dialog:                 MatDialog,
              public  platformService       : PlatformService,
              private companyService:         CompanyService,
              private _renderer:              Renderer2,
              public  orderService:           OrdersService,
              public  orderMethodsService: OrderMethodsService,
              private messageService:         MessageService,
              public  breakpointObserver:     BreakpointObserver,
              private siteService:            SitesService,
              public  toolbarUIService:       ToolBarUIService,
              private location:               Location,
              private navigationService     : NavigationService,
              private router                : Router,
              private floorPlanSevice       : FloorPlanService,
              public  uiSettings             : UISettingsService,
              public  coachMarksService      : CoachMarksService,
              private paymentMethodsService: PaymentsMethodsProcessService,
              private clientService         : ClientTableService,
              private settingsService: SettingsService,
              private navHistoryService      : NavigationHistoryService,
              private fb                    : UntypedFormBuilder ) {
  }

  ngOnChanges() {

    this.userChecked = false;
    const user = this.getUserInfo();
  }

  ngAfterViewInit() {
  }

  ngOnInit() {

    this.userChecked = false
    this.site =  this.siteService.getAssignedSite();
    this.getDeviceInfo();
    this.getUITransactionsSettings();
    this.initUIService();
    this.initSearchObservable();
    this.messageService.sendMessage('show');
    this.platformService.getPlatForm();
    this.initSubscriptions();

    this.getUserInfo();
    this.refreshScannerOption()
    this.searchForm = this.fb.group( {  searchProducts: '' });
    this.renderTheme();
    this.refreshTheme()
    this.initCompany();
    this.mediaWatcher()
    this.initSite();
    this.updateScreenSize();
    this.initUserOrder();

    this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(this.site);
  }

  get isApp() {
    return this.platformService.isApp()
  }

  get showSearchMenuView() {
    if (this.smallDevice || this.phoneDevice) {
      return null
    }
    if (this.homePageSetings && this.homePageSetings?.hideSearchBar) {return null}
    return this.searchMenuView;
  }

  getDeviceInfo() {
    const devicename = localStorage.getItem('devicename')
    if (!devicename) { return of(null)}
    this.posDevice$ = this.uiSettings.getPOSDeviceSettings(devicename).pipe(
      switchMap(data => {
        if (data && data.text) {
          try {
            const posDevice = JSON.parse(data?.text) as ITerminalSettings;
            this.uiSettings.updatePOSDevice(posDevice)
            this.terminalSetting = data;
            this.posDevice = posDevice;
            this.zoom(posDevice)
            return of(posDevice)

          } catch (error) {
            this.siteService.notify(`Error setting device info, for device: ${devicename}` + JSON.stringify(error), 'Close', 10000, 'yellow')
          }
        }
        return of(null)
      }
    ))
  }

  zoom(posDevice: ITerminalSettings)  {
    if (posDevice && posDevice?.electronZoom && posDevice?.electronZoom != '0') {
      this.uiSettings.electronZoom(posDevice.electronZoom)
    }
  }

  get isClockInOutOn() {
    if (this.isUserStaff)  {
      return this.clockInOut
    }
    return null;
  }

  initUIService() {
    this.uiHomePageSetting$ =  this.settingsService.getUIHomePageSettings().pipe(
      switchMap( data => {
        if (data) {
          this.homePageSetings  = data // JSON.parse(data.text) as UIHomePageSettings;
          this.uiSettings.updateHomePageSetting(this.homePageSetings)
          return of(this.homePageSetings)
        }
        return of(null)
      }
    ))

    this.uiSettings.homePageSetting$.subscribe(data => {
        if (data) {
          this.homePageSetings = data
        }
      }
    )
  }

  ngOnDestroy() {
    this.userChecked = false
    if (this._searchSideBar) { this._searchSideBar.unsubscribe()}
    if (this._openOrderBar) {  this._openOrderBar.unsubscribe(); }
    if (this._scaleInfo) {this._scaleInfo.unsubscribe(); }
    if (this._order) { this._order.unsubscribe(); }
    if (this._user) {this._user.unsubscribe();}
    if ( this._mainMenuSideBar) { this._mainMenuSideBar.unsubscribe()}
    if (this._site) {this._site.unsubscribe()}
    this.setInterFace(null)
  }

  refreshUserBar(user: IUser) {
    if (!user) {
      this.flexsections = 'flex-sections-nouser'
      return
    }
    if (user && user?.roles === 'user') {
      this.flexsections = 'flex-sections-user'
      return
    }
    if (user) {
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
    if (this.platformService.isApp()) {
      this.scannerEnabled = true;
    }
  }

  emailMailCount(event) {
    this.mailCount = event
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

  // goBack() {
  //   this.smallDeviceLimiter
  //   const hasHistory = this.router.navigated;
  //   console.log('this.router', this.router.navigated)
  //   if (hasHistory) {
  //     this.location.back();
  //   }
  // }

  goBack() {
    const lastRoute = this.navHistoryService.getLastRoute();
    // Logic to determine if lastRoute is within the DefaultComponent's children
    // This is application-specific and depends on your routing structure

    console.log('lastRoute', lastRoute)
    if (lastRoute === 'login') {
      this.router.navigateByUrl('app-main-menu')
      return;
    }

    const isWithinDefaultComponent = lastRoute.startsWith('/default'); // Example condition

    const hasHistory = this.router.navigated;
    if (hasHistory) {
      this.location.back();
    }

    // if (isWithinDefaultComponent) {
    //   this.location.back();
    // } else {
    //   // Handle the case where you don't want to navigate back
    //   // Maybe navigate to a specific route within your app
    //   console.log('Not navigating back because the last route is outside of the desired context.');
    // }
  }

  smallDeviceLimiter() {
    if (this.smallDevice) { this.toolbarUIService.updateOrderBar(false) }
  }

  get isfloorPlan() {
    if (this.isUserStaff || this.isAdmin) {
      return this.floorPlanTemplate
    }
    return null;
  }

  get userInfoScreen() {
    if (this.phoneDevice || this.smallDevice)  {return  null}
    if (this.signOut) {
      return this.userActions
    }
    return this.userActions
  }

  get userActionsPhoneDevice() {
    if (this.phoneDevice || this.smallDevice) {
      return this.userActions
    }
    return null
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.widthOfWindow = window.innerWidth;
    this.updateDeviceInfo();

    if (this.platformService.androidApp) {
      this.mattoolbar = 'mat-toolbar-android'
    }

    if (this.platformService.androidApp && !this.user) {
      this.mattoolbar = 'mat-toolbar-android-no-user'
    }

    if ( this.widthOfWindow >= 1025 ) {
      this.userSwitching = true;
    } else {
      this.userSwitching = false;
    }

    this.widthOfWindow = window.innerWidth;
    this.showSearchForm = true

    if (window.innerWidth >= 1200) {
      this.sitePickerWidth = 33
    } else if (window.innerWidth >= 992) {
      this.sitePickerWidth = 33
    }

    if (811 >= window.innerWidth ) {
      this.showSearchForm = false
      this.sitePickerWidth = 75
    }
    this.refreshUserBar(this.user)
  }

  updateDeviceInfo() {
    this.smallDevice = false
    this.phoneDevice = false;
    if (811 >= window.innerWidth ) {
      this.smallDevice = true
    }
    if (500 >= window.innerWidth ) {
      this.smallDevice = false;
      this.phoneDevice = true
    }
    this.authenticationService.updateDeviceInfo({phoneDevice: this.phoneDevice, smallDevice: this.smallDevice})
  }

  get userLoginOptionView() {
    if (this.phoneDevice || this.smallDevice) {
      return this.userActions
    }
    return this.menuButtonContainer
  }

  getUserSubscriber(user:IUser) {
    if (!user) { return of(null)}
    const site = this.siteService.getAssignedSite()
    return this.clientService.getClient(site, user.id, true).pipe(switchMap(data => {
      const user = JSON.parse(localStorage.getItem('user')) as IUser
      if (user) {
        this.user = user;
        console.log('user exists')
        return of(user)
      }

      if (!data) {
        console.log('no user')
        this.user = null;
        this.authenticationService.updateUser(null)
      }
      return of(data)
    }),catchError(data =>{

      const user = JSON.parse(localStorage.getItem('user')) as IUser
      if (user) {
        this.user = user;
        console.log('user exists')
        return of (user)
      }
      this.authenticationService.updateUser(null)
      this.logout()
      return of(null)
    }))
  }

  getUserInfo() {
    //this verifies both the user as well as a refresh as well as a
    //api switch. If a user switches from one api to another
    //it will verify this user is also correctly logged into to other api
    // and it will update the id of that user if they have the same user/pass
    this.signOut = true;
    this.initUserInfo();
    let user: IUser;
    if (this.user) { user = this.user  }

    if (!user) {  user = JSON.parse(localStorage.getItem('user')) as IUser;  }
    if (!user || !user.id) {
      this.signOut = true;
      this.userChecked = false;
    }
    this.setUserInfo(this.user)

    // console.log('get User info', this.user)
    this.setUserInitCheck(this.user)

    if (this.userChecked) {
      this.signOut = false;
      return
    }

    return user
  }

  setUserInitCheck(user) {
    this.userInitCheck$ = this.getUserSubscriber(user).pipe(switchMap(data => {
      //or is guest if is guest then override this.
      if (!data) {
        return of(null)
      }
      if (!this.user) {
        return of(null)
      }
      if ( data.id == user.id) {
      } else {
        this.userSwitchingService.clearLoggedInUser()
      }
      return of(data)

    }));
  }

  setUserInfo(data) {
    this.setInterFace(data)
    if (!this.user || !this.user.password) { return}
  }

  setInterFace(data) {
    this.signOut = false;
    this.userChecked = true

    if (this.user) {
      this.user.id = data?.id
      this.user.roles = data?.roles;
    }

    this.refreshUserBar(this.user)
    this.setUIFeaturesForUser(data);
  }

  initUserInfo() {
    this.userName         = '';
    this.userRoles        = '';
    this.showPOSFunctions = false;
    this.isAdmin          = false;
    this.isUserStaff      = false;
    this.employeeName     = '';
  }

  setUIFeaturesForUser(user) {
    // console.log('setui features ', user)
    this.isAdmin          = false;
    this.isManager        = false;
    this.showPOSFunctions = false;
    this.isUserStaff = false;

    if (!user) {  return null }
    this.userName     = user.username;

    if (!user.roles) { return  }

    this.userRoles    = user?.roles.toLowerCase();
    if (user.firstName) {
      this.employeeName = `${user?.lastName}, ${user?.firstName.substring(1,1)}`
    }

    this.isUser = false;
    if (user?.roles === 'user') {
      this.isUser = true;
    }

    if (user?.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true;
      this.isUserStaff      = true;
    }

    if (user?.roles === 'employee') {
      this.isUserStaff      = true;
      this.showPOSFunctions = true;
    }

    if (user?.roles === 'manager') {
      this.isManager        = true;
      this.showPOSFunctions = true;
      this.isUserStaff      = true;
    }

    if (this.isUserStaff) {
      this.gridlayout = this.gridlayout;
    }

    if (!this.isUserStaff) {
      this.gridlayout = this.gridlayoutNoStaff;
    }
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
    this._messages = this.messageService.getMessage().subscribe(data => {
      if (data) {
        this.messages.push(data);
      } else {
        this.messages = [];
      }
    });
  }

  deviceInfo() {
    if (!this.terminalSetting) { return }
    const dialog = this.uiSettings.openEditPOSDevice(this.terminalSetting)
    dialog.afterClosed().subscribe(data => {
      this.getDeviceInfo()
    })
  }

  openPreferences() {
    if (this.user) {
      const dialog = this.uiSettings.openUserPreferences()
    }
  }

  goHome() {
    if (this.phoneDevice) {
      //hide the side bar
      this.toolbarUIService.updateToolBarSideBar(false)
    }
    this.smallDeviceLimiter();
    this.navigationService.navHome();
  }

  navPOSOrders() {
    this.smallDeviceLimiter();
    this.orderMethodsService.refreshAllOrders()
    this.navigationService.navPOSOrders()
  }

  navTableService() {
    this.smallDeviceLimiter();
    this.navigationService.navTableService()
  }

  toggleCoaching() {
    if (this.user && this.user.userPreferences ) {
      if (this.user.userPreferences.enableCoachMarks) {
        this.user.userPreferences.enableCoachMarks = false;
      } else {
        this.user.userPreferences.enableCoachMarks = true;
      }
      this.userSave$ = this.userAuthService.setUserObs(this.user)
    }
  }

  toggleSideBar() {
    if (this.userSwitchingService.swapMenuWithOrderBoolean) {
      if (this.openOrderBar) {
        this.toolbarUIService.updateOrderBar(false)
        this.toolbarUIService.updateToolBarSideBar(true)
        return;
      }
      this.toolbarUIService.updateleftSideBarToggle(false)
      this.openOrderBar     = false
      this.toolbarUIService.switchToolBarSideBar()
      return;
    }
    if (this.searchSideBar) {
      this.searchSideBar = !this.searchSideBar;
    }
    this.openOrderBar     = !this.openOrderBar
    this.toolbarUIService.switchToolBarSideBar()
  }

  toggleOpenOrderBar() {
    if (this.router.url.substring(0, 28 ) === '/currentorder;mainPanel=true') {
      this.openOrderBar = false
      this.toolbarUIService.updateOrderBar(this.openOrderBar)
      return;
    }
    this.openOrderBar = !this.openOrderBar
    this.toolbarUIService.updateOrderBar(this.openOrderBar)
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
    if (this.uiTransactionSetting?.prepOrderOnExit) {
      //switch order to current order
      const order = this.orderMethodsService.currentOrder
      if (!order) {
        this.postLogout()
        return
      }
      this.action$ = this.paymentMethodsService.sendOrderOnExit(order).pipe(switchMap(data => {
        // console.log('logout send data sendOrderOnExit', data)
        if (data) {

        }
        this.postLogout()
        return of(data)
      }))
      return;
    }
    this.postLogout()
  }

  postLogout() {
    console.log('postlogout')
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

  setLastOrder() {
    if (!this.orderMethodsService.lastOrder) { return }
    this.orderMethodsService.setActiveOrder( this.orderMethodsService.lastOrder)
    this.orderMethodsService.updateOrder(this.orderMethodsService.lastOrder)
  }

  switchUser() {
    const order = this.orderMethodsService.currentOrder;
    console.log('logout switch user')
    this.paymentMethodsService.sendOrderAndLogOut( order , true )
    this.setInterFace(null)
  }

  assingBackGround(image: string) {
    if (!image) { return }
  }

  get logoViewEnabled() {
    const user = this.user
    if (!user) { return true }

    if (user && user.roles && (user.roles == 'user' || user.roles == 'guest'))  {
      return true;
    }
  }


  initPopover() {
    if (this.user?.userPreferences && this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      if (this.isUserStaff && this.coachingPosTerminalIcon) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingPosTerminalIcon.nativeElement, "Cash Register: The cash register shows all of your orders, or other users orders if you enable filters."));
      }
      if (this.isUserStaff && this.coachingIDScanner) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingIDScanner.nativeElement, "ID Scanning: If you are using an android tablet, you will have an icon to scan drivers licenses."));
      }
      if (this.isfloorPlan && this.coachingTableLayout) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingTableLayout.nativeElement, "Restaurant: If you see the The Knife and Fork, it is an icon to use the Restaurant or Dinining Table Layout. "));
      }
      if (this.isUserStaff && this.coachingLogin) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingLogin.nativeElement, "Switch User: The running user is an icon to login or switch user accounts."));
      }
      this.coachMarksService.showCurrentPopover();
    }
  }

}

// @ViewChild('coachingTableLayout', {read: ElementRef}) button1View: ElementRef;
// @ViewChild('coachingLogin', {read: ElementRef}) button2View: ElementRef;
// @ViewChildren('coaching', {read: ElementRef}) textView: QueryList<ElementRef>;
