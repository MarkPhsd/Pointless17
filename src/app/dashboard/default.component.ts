import { Component, HostBinding, OnInit, AfterViewInit,
         Renderer2, OnDestroy, HostListener,
         ChangeDetectorRef,
         ElementRef,
         ViewChild,
         TemplateRef} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { catchError, concatMap, delay, filter, Observable, of, repeatWhen, Subscription,switchMap, throwError } from 'rxjs';
import { ToolBarUIService } from '../_services/system/tool-bar-ui.service';
import { Capacitor } from '@capacitor/core';
import { AppInitService } from '../_services/system/app-init.service';
import { AuthenticationService, IDepartmentList } from '../_services';
import { IPOSOrder, IUser } from '../_interfaces';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from '../_services/system/settings/uisettings.service';
import { isDevMode } from '@angular/core';
import { SitesService } from '../_services/reporting/sites.service';
import { SplashScreenStateService } from 'src/app/_services/system/splash-screen-state.service';
import { PlatformService } from '../_services/system/platform.service';
import { UserAuthorizationService } from '../_services/system/user-authorization.service';
import { UserSwitchingService } from '../_services/system/user-switching.service';
import { ITerminalSettings, SettingsService } from '../_services/system/settings.service';
import { UserIdleService } from 'angular-user-idle';
import { PaymentsMethodsProcessService } from '../_services/transactions/payments-methods-process.service';
import { OrderMethodsService } from '../_services/transactions/order-methods.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { PrintQueService } from '../_services/transactions/print-que.service';
import { IItemType, ItemTypeService } from '../_services/menu/item-type.service';
import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../app-material.module';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';
import { DepartmentMenuComponent } from '../modules/menu/department-menu/department-menu.component';
import { ThreeCXFabComponent } from '../shared/widgets/three-cxfab/three-cxfab.component';
import { MenuSearchBarComponent } from '../shared/components/menu-search-bar/menu-search-bar.component';
import { UserBarComponent } from '../shared/components/user-bar/user-bar.component';
import { MenuMinimalComponent } from '../shared/widgets/menus/menu-minimal/menu-minimal.component';
import { MenuTinyComponent } from '../shared/widgets/menus/menu-tiny/menu-tiny.component';
import { OrderBarComponent } from '../shared/components/order-bar/order-bar.component';
import { SiteFooterComponent } from '../shared/components/site-footer/site-footer.component';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

// import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';
@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
            AppMaterialModule,
            FormsModule,
            ReactiveFormsModule,
            DepartmentMenuComponent,
            ThreeCXFabComponent,
            MenuSearchBarComponent,
            UserBarComponent,
            MenuMinimalComponent,
            MenuTinyComponent,
            OrderBarComponent,
            SiteFooterComponent,
            HeaderComponent,
            FooterComponent,
            SharedPipesModule],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  // animations: [ fader ],
})

export class DefaultComponent implements OnInit, OnDestroy, AfterViewInit {

  // @ViewChild('menuOrOrderBar')
  @ViewChild('appMenuSearchBar')   appMenuSearchBar: TemplateRef<any>;
  @ViewChild('appOrderBar')        appOrderBar: TemplateRef<any>;
  @ViewChild('menuBarView')        menuBarView: TemplateRef<any>;
  @ViewChild('userBarView')         userBarView: TemplateRef<any>;
  @ViewChild('appSiteFooter')       appSiteFooter: TemplateRef<any>;
  @ViewChild("footer") footer: ElementRef;
  ipAddress$ : Observable<any>;
  itemTypeList$: Observable<IItemType[]>;
  printOrders$ : Observable<IPOSOrder[]>;
  departmentID     =0
  posDevice: ITerminalSettings;
  menuButtonsInitialized: boolean;
  get platForm() {  return Capacitor.getPlatform(); }
  toggleControl     = new UntypedFormControl(false);
  isSafari        : any;
  posts           : any;
  pages = new      Array(10);
  itemChange$:     Observable<number>;
  next$:           Observable<number>;
  prev$:           Observable<number>;
  routeTrigger$:   Observable<object>;
  toolbarTiny:     boolean;
  rightSideBarToggle:    boolean;
  sidebarMode    = 'side'
  id             : any;
  smallDevice    : boolean;
  menuManager    : boolean;

  advertisingOutlet : string;
  messageOutlet     : string;

  drawer          : any;
  @HostBinding('class') className = '';
  @HostListener('unloaded')

  _leftSideBarToggle: Subscription;
  leftSideBarToggle = false;

  _mainMenuBar    : Subscription;
  mainMenuBar     : boolean;

  _rightSideBarToggle: Subscription;

  _searchSideBar      : Subscription;
  searchSideBar       : boolean;
  searchBarWidth      : number;

  _barSize            : Subscription;
  barSize             : boolean;
  smallMenu           = false;

  _swapMenuWithOrder : Subscription;
  swapMenuWithOrder  : boolean;

  _orderBar       : Subscription;
  orderBar        : boolean;
  _department     : Subscription;
  department      : IDepartmentList;

  matorderBar = 'mat-orderBar-wide';
  barType     = 'mat-drawer-toolbar';
  overFlow    = 'overflow-y:auto'
  apiUrl      : any;

  user$: Observable<IUser>;
  _user       : Subscription;
  user        : IUser;
  scrollStyle = this.platformService.scrollStyleWide;
  private styleTag: HTMLStyleElement;
  private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  _sendOrderFromOrderService: Subscription;
  style       = "width:195px"
  _ping       : Subscription;
  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  homePageSetting$: Observable<UIHomePageSettings>;
  uiTransactions$: Observable<any>;
  uiTransactions : TransactionUISettings
  printAction$   : Observable<any>;
  devMode     : boolean;
  chatURL     : string;
  phoneDevice : boolean;
  pointlessPOSDemo: boolean;
  hideAppHeader: boolean;
  posDevice$ : Observable<ITerminalSettings>

  action$ : Observable<any>;
  _sendAndLogOut: Subscription;
  _sendOrderOnExit: Subscription;
  viewPrep: boolean;
  matDrawerContentClass = 'mat-drawer-content'
  matDrawerContaienr = 'mat-drawer-container'
  viewType$ = this.orderMethodsSevice.viewOrderType$.pipe(switchMap(data => {
    this.viewPrep = false
    if (data && data === 3) {
      this.viewPrep = true
    }
    return of(data)
  }))

  initLoginStatus() {
    this.userSwitchingService.clearloginStatus$.pipe(switchMap(data => {
      //don't send orders here that's done in the sendorder subscriber method
      return of(data)
    })).subscribe(data => {
      // console.log('order sent on exit')
    })
    return of(null)
  }

  sendOrderOnExitAndClearOrder(order: IPOSOrder) {
    return this.paymentMethodsService.sendOrderOnExit(order).pipe(switchMap(data => {
      if (this.uiTransactions?.prepOrderOnExit) {
        this.orderMethodsSevice.clearOrder();
      }
      return of(data)
    }), catchError(data => {
      this.siteService.notify(`Error sending order ${data.toString()}`, 'Close', 6000, 'red' )
      return of(null)
    }))
  }

  get appHeaderClass() {
    if (this.hideAppHeader || this.viewPrep) {
      return 'app-header-hidden'
    }
    return ""
  }

  get leftSideBar() {
    if (this.swapMenuWithOrder) {
      if (this.toolBarUIService.orderBar) {
        return this.appOrderBar
      }

      if (this.user &&  this.user.roles && this.user?.roles.toLowerCase() === 'user') {
        return this.userBarView
      }
      return this.menuBarView
    }
    return this.appMenuSearchBar
  }

  get rightSideBar() {
    if (this.swapMenuWithOrder) {
      return this.appMenuSearchBar
    }
    return this.appOrderBar
  }

  get menuOrOrderBar() {
    if (this.swapMenuWithOrder) {
      return
    }
    if (this.user &&  this.user.roles && this.user?.roles.toLowerCase() === 'user') {
      return this.userBarView;
    }
    return this.menuBarView;
  }

  get getMatDrawerContentClass() {
    if (this.platFormService.isApp() ) { return  'mat-drawer-content'}
    if (this.userAuthorizationService?.isStaff) { return  'mat-drawer-content'}

    return  'mat-drawer-content-user'
  }

  get getMatDrawerContainerClass() {

    if (this.platFormService.isApp() ) { return  'mat-drawer-container mat-app-background'}
    if (this.userAuthorizationService?.isStaff) { return  'mat-drawer-container mat-app-background'}

    if (this.smallDevice) {
      return  'mat-drawer-container mat-app-background'
    }
    return  'mat-drawer-container-user mat-app-background'

  }

  processLogOut() {
    // console.trace('processLogOut')
    this.userIdle.resetTimer();
    this.orderMethodsSevice.clearOrderSubscription()
    this.userSwitchingService.clearLoggedInUser();
    if (this.uiSettings?.pinPadDefaultOnApp && this.platFormService.isApp()) {
      this.userSwitchingService.openPIN({request: 'switchUser'})
    }
  }

  subscribSendOrder() {
    this._sendOrderOnExit = this.paymentMethodsProcessService.sendOrderOnExit$.pipe(switchMap(

      send => {
        if (!send) { return of('false')}
        // console.log('subscribSendOrder', send)
        if (!send?.order || send?.order == null) {
          // console.log('send on order exit dont do anything')
          return of('false')  ;
        }
        return this.paymentMethodsService.sendOrderOnExit(send?.order)

      }
    )).subscribe(data => {
      // console.log('send prep')
    })

    this._sendAndLogOut  = this.paymentMethodsService.sendOrderAndLogOut$.pipe(switchMap(
        send => {
          if (!send || send == null || send == undefined) {
            return of('false')  ;
          }
          const noOrder = (!send.order || send.order == undefined)
          const justLogOut = (noOrder && send.logOut)
          const browserLogout = (!this.platFormService.isApp() && send.logOut)
          if (justLogOut || browserLogout) { return of(true)  }

          if (this.platFormService.isApp()) {
            if (send && send.order) {
              if (!this.user) {  return of(true)  }
              const send$ = this.sendOrderOnExitAndClearOrder(send.order).pipe(switchMap(data => {
                this.orderMethodsSevice.updateOrder(null)
                if (data) {
                  this.processLogOut()
                }
                if (send && send.logOut) {
                    return  of(true)
                  }
                  return of(false)
                }
              ))
              return  send$
            }
          }
          return of(false)
        }
        // switchMap(
      )).subscribe(data => {
        if (data && data != null  && data != 'false') {
          this.processLogOut()
          this.paymentMethodsService.sendOrderAndLogOut(null, null)
        }
        //clear send
        // return of(false)
      }
    )
  }

  initUITransactionSettings() {
    let ui: TransactionUISettings
    const site = this.siteService.getAssignedSite();

    if (!this.authService._user.value) {return}
    return this.settingService.getUITransactionSetting().pipe(
      concatMap( data => {
          this.uiTransactions = data
          ui = this.uiTransactions;
          this.uiSettingsService._transactionUISettings.next(this.uiTransactions)
          return of(data);
      })
       ).pipe(concatMap(data => {
          if (!data) {
            return of(ui)
          }
          return this.initMenuButtonList( data );
          return of(ui)
      })).pipe(concatMap(data => {
          return of(ui)
      }
    ))
  }

  initMenuButtonList(ui:TransactionUISettings) {
    const site = this.siteService.getAssignedSite()
    if (!this.authorizationService._user.value) { return of(null)}

    if (this.menuButtonsInitialized) {
      if (this.mbMenuGroupService._menuButtonList.value) {
        return of(null)
      }
    }

    if (ui?.multiButtonOrderHeader && ui?.multiButtonOrderHeader != 0) {
      return this.mbMenuGroupService.getGroupByID(site, ui?.multiButtonOrderHeader).pipe(concatMap(
        data => {
          this.menuButtonsInitialized = true
          this.mbMenuGroupService.setOrderHeaderMenuButtonList(data)
          return of(data)
      }))
    }
    return of(null)
  }


  initDevice() {

    const devicename = localStorage.getItem('devicename');

    if (!devicename) { return ;}

    this.posDevice$ = this.getDeviceInfo(devicename)

  }

  getDeviceInfo(devicename) {
      const site = this.siteService.getAssignedSite();
    return this.settingService.getPOSDeviceBYName(site, devicename).pipe(switchMap(data => {
      if (!data) { return of(null)}
      const device = JSON.parse(data.text) as ITerminalSettings;
      this.settingService.updateTerminalSetting(device)
      this.initPrintServer(device)

      this.zoom(device)

      if (device.enableScale) {  }
      this.posDevice = device;
      return of(device)
    }))
  }

  zoom(posDevice: ITerminalSettings)  {
    if (posDevice && posDevice?.electronZoom && posDevice?.electronZoom != '0') {
       this.setZoom(+posDevice.electronZoom)
    }
  }

  async setZoom(zoomValue) {
    if (!this.platFormService.isAppElectron) return;
    await  (window as any).electron.setZoom(1);
    try {
      await (window as any).electron.setZoom(zoomValue);
    } catch (error) {
      console.error('Failed to set zoom level:', error);
      this.siteService.notify(`Failed to set zoom level: ${error}`, 'Close', 3000, 'red');
    }
  }

  homePageSubscriber() {
    try {
      this.matorderBar = 'mat-orderBar-wide';
      this._uiSettings = this.uiSettingsService.homePageSetting$.pipe(
        switchMap(data => {
          if (data) {
            this.uiSettings = data;
            if (this.phoneDevice) {
              this.matorderBar = 'mat-orderBar-wide';
              return of(null); // Return an observable here
            }
            this.matorderBar = 'mat-orderBar-wide';
          }

          const devicename = localStorage.getItem('devicename');
          if (devicename) {
            return this.getDeviceInfo(devicename);
          }
          return of(null); // Return of(null) if no other observable is returned
        })
      ).subscribe(data => {
        if (!data) { return; }
        if (data && data?.ignoreTimer) {
          this.initIdle();
        }
      });
    } catch (error) {
      console.log('home page subscriber error', error);
    }
  }


  // if (!data) {
  //   this.stopWatching()
  //   return of(null)
  // }
  // if (!data.ignoreTimer) {
  //   this.uiSettings.timeOut = false
  //   this.stopWatching()
  // }

  initPrintServer(device:ITerminalSettings) {
    if (!this.platFormService.isAppElectron) {return }
    if (!device.printServer) { return}
    if (device.printServerTime || device.printServerTime != 0) {
      const site = this.siteService.getAssignedSite();
      const time = 1000 * 60 * +device?.printServerTime
      const orders$  = this.printQueService.getQue().pipe(concatMap(data => {
          return of(data)
        }
      ))

      this.printOrders$  = orders$.pipe(
        repeatWhen(notifications =>
          notifications.pipe(
            delay(time)),
        ),
        catchError((err: any) => {
          return throwError(err);
        })
      )
    }
  }


  swapMenuWithOrderSubscriber() {
    this._swapMenuWithOrder = this.userSwitchingService.swapMenuWithOrder$.subscribe(data =>  {
      this.swapMenuWithOrder = false;
      if (data) {
        this.swapMenuWithOrder = data
      }
    })
  }

  userSubscriber() {
    this.user$ =   this.authorizationService.user$.pipe(
      switchMap(data => {
      this.setScrollBarColor(data?.userPreferences?.headerColor)
      this.user = data;
      return of(data)
    }))
  }

  orderBarSubscriber() {
    try {
      this.toolBarUIService.orderBar$.subscribe(data => {
        if (this.swapMenuWithOrder) {
          this.orderBar = data;
          return
        }
        this.rightSideBarToggle = data
      })
    } catch (error) {
    }
  }

  departmentMenuSubscriber() {
    try {
      this._department  = this.toolBarUIService.departmentMenu$.subscribe( data => {
        if (!data) {
          this.department = null
          this.departmentID  = 0;
          return
        }
        this.department = data;
        this.departmentID = data.id
      })
    } catch (error) {
      console.log('departmentMenuSubscriber', error)
    }
  }

  toolbarSideBarSubscriber() {
    try {
      this._mainMenuBar = this.toolBarUIService.mainMenuSideBar$.subscribe( data => {
        this.mainMenuBar = data
        // console.log('app', this.platFormService.isApp())
        this.barType =  "mat-drawer-searchbar"
        if (!this.platFormService.isApp()) {
          this.barType =  "mat-drawer-searchbar-web"
        }
      })
    } catch (error) {
      console.log('toolbarSideBarSubscriber', error)
    }
  }

  searchSideBarSubscriber() {
    this._searchSideBar = this.toolBarUIService.searchSideBar$.subscribe( data => {
      if (!this.swapMenuWithOrder) {
        this.searchSideBar = data
        return;
      }
      if (this.swapMenuWithOrder) {
        if (data) {
          this.toolbarUIService.updateOrderBar(data)
        }
        this.rightSideBarToggle = data;
        return;
      }
    })
  }

  rightSideBarToggleSubscriber() {
    this._rightSideBarToggle = this.toolBarUIService.rightSideBarToggle$.subscribe( data => {
      if (this.swapMenuWithOrder) {
        this.rightSideBarToggle = false;
        if (data) {
          this.rightSideBarToggle = data;
        }
        return;
      }
    })
  }

  searchBarWidthSubscriber() {
    try {
      this._searchSideBar = this.toolBarUIService._searchBarWidth$.subscribe(data => {
        this.searchBarWidth = data
        if (data) {
          if (data == 55 || this.smallMenu) {
            this.barType =  "mat-drawer-searchbar-tiny"
          }
        }

        if (!data && data != 0 || this.smallMenu) {
          this.barType =  "mat-drawer-searchbar-tiny"
          if (this.style){
            this.style   = `width:${this.style}`
          }
        }

      })
    } catch (error) {
      console.log('searchBarWidthSubscriber', error)
    }
  }

  leftSideBarToggleSubscriber() {
    this._leftSideBarToggle = this.toolbarUIService.leftSideBarToggle$.subscribe(data => {
      this.leftSideBarToggle = data;
    })
  }

  get appSiteFooterOn() {
    if (this.platFormService.isApp() ) { return }
    if (this.userAuthorizationService?.isStaff) { return }
    if (this.smallDevice) { return }
    return this.appSiteFooter
  }

  barSizeSubscriber() {
    try {
      this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
        if (data) {
          this.barType = "mat-drawer-searchbar-tiny"
          this.smallMenu = data;
          return;
        }
        this.barType   = "mat-drawer-toolbar"
        this.smallMenu = false;
      })
    } catch (error) {
      console.log('searchBarWidthSubscriber', error)
    }
  }

  setItemTypeList() {
    const site = this.siteService.getAssignedSite()
    this.itemTypeList$ = this.itemTypeService.getTypeList(site)
    //
  }

  initSubscriptions() {
    this.setItemTypeList();

    this.homePageSubscriber();
    // this.initDevice();

    this.matorderBar = 'mat-orderBar-wide'
    this.style = ""
    try {
      this.rightSideBarToggleSubscriber()
    } catch (error) {
    }

    try {
      this.leftSideBarToggleSubscriber();
    } catch (error) {
    }

    try {
      this.swapMenuWithOrderSubscriber();
    } catch (error) {
    }



    try {
      this.userSubscriber();
    } catch (error) {
    }
    try {
      this.orderBarSubscriber();
    } catch (error) {
    }
    try {
      this.toolbarSideBarSubscriber();
    } catch (error) {
    }
    try {
      this.departmentMenuSubscriber();
    } catch (error) {
    }
    try {
      this.searchSideBarSubscriber();
    } catch (error) {
    }
    try {
      this.searchBarWidthSubscriber();
    } catch (error) {
    }
    try {
      this.barSizeSubscriber();
    } catch (error) {
    }

  }

  constructor(
               private platformService: PlatformService,
               public  toolBarUIService: ToolBarUIService,
               private _renderer       : Renderer2,
               private cd              : ChangeDetectorRef,
               private mbMenuGroupService: MBMenuButtonsService,
               private itemTypeService : ItemTypeService,
               private appInitService          : AppInitService,
               private authorizationService    : AuthenticationService,
               public  toolbarUIService        : ToolBarUIService,
               private uiSettingsService       : UISettingsService,
               private router                  : Router,
               private siteService             : SitesService,
               private splashLoader            : SplashScreenStateService,
               private platFormService         : PlatformService,
               private userAuthorizationService: UserAuthorizationService,
               private userSwitchingService    : UserSwitchingService,
               private settingService          : SettingsService,
               private userIdle                : UserIdleService,
               private orderMethodsSevice      : OrderMethodsService,
               private paymentMethodsService   : PaymentsMethodsProcessService,
               private paymentMethodsProcessService: PaymentsMethodsProcessService,
               private dialog                  : MatDialog,
               private printQueService         : PrintQueService,
               private authService             : AuthenticationService,
               private renderer                 : Renderer2,
    ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    if (!this.platFormService.isApp() && this.smallDevice) {
      this.sidebarMode   =  'side'
    }
    this.devMode = isDevMode()
  }

  ngOnInit() {
    // console.log('init Default Component')
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.renderTheme();
    this.initSettings();
    const site = this.siteService.getAssignedSite();
    this.uiTransactions$ = this.initUITransactionSettings();
    this.splashLoader.stop();
    this.userIdle.resetTimer();
    this.initLoginStatus();
    this.subscribeAddress();
    this.subscribSendOrder()


  }

  getHelp() {
    this.router.navigateByUrl(this.chatURL)
  }

  subscribeAddress() {
    //menu-manager
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {

      this.overFlow = 'overflow-y: auto'
      if (event.url === '/pos-orders'){
        this.overFlow = 'overflow-y: hidden'
        return ;
      }
      if (event.url === '/menuitems-infinite'){
        this.overFlow = 'overflow-y: hidden'
        return ;
      }
      if (event.url === '/menu-manager'){
        this.menuManager = true;
      }
    });
  }

  initSettings() {
    this.homePageSetting$ = this.uiSettingsService.getSetting('UIHomePageSettings').pipe(
        switchMap(  data => {
          const ui = {} as UIHomePageSettings
          if (data && data.text) {
            const ui = JSON.parse(data.text)
            this.uiSettingsService.updateHomePageSetting(ui);
            this.initUI();
            this.uiSettings = ui;

            if (!this.platFormService.isApp) {
              this.ipAddress$ = this.siteService.getIpAddress(ui?.ipInfoToken)
            }
            return of(ui)
          }
          return of(null)
    }))
  }

  initUI() {
    try {
      const bar = this.getBoolean(localStorage.getItem('barSize'))
      this.toolbarUIService.updateBarSize(bar)
      this.refreshToolBarType();
      this.initSubscriptions();

    } catch (error) {
      console.log('inputUI error', error)
    }
  }

  getBoolean(value){
    switch(value){
         case true:
         case "true":
         case 1:
         case "1":
         case "on":
         case "yes":
             return true;
         default:
             return false;
     }
     return false;
 }

  ngAfterViewInit() {
    this.setZoom(1)

    this.cd.detectChanges();
    setTimeout(()=>{
      this.rightSideBarToggle = true;
    },50);
    setTimeout(()=>{
      this.rightSideBarToggle = false;
    },50);

    setTimeout(() => {
      this.zoom(this.posDevice)
    }, 2000);
  };

  orderBarToggler(event){
    this.toolBarUIService.updateOrderBar(event)
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.rightSideBarToggle = false;
    if (this.id) { clearInterval(this.id);   }
    this.toolbarTiny = true
    if (this._department)    { this._department.unsubscribe()}
    if (this._mainMenuBar)   { this._mainMenuBar.unsubscribe()}
    if (this._leftSideBarToggle) {this._leftSideBarToggle.unsubscribe()}
    if (this._user)          { this._user.unsubscribe();  }
    if (this._searchSideBar) { this._searchSideBar.unsubscribe();    }
    if (this._orderBar)      { this._orderBar.unsubscribe();   }
    if (this._barSize)       { this._barSize.unsubscribe();  }
    if(this._uiSettings)     { this._uiSettings.unsubscribe() }
    if (this._sendOrderFromOrderService) { this._sendOrderFromOrderService.unsubscribe()}
    if (this._sendAndLogOut) { this._sendAndLogOut.unsubscribe()}
    if (this._sendOrderOnExit) { this._sendOrderOnExit.unsubscribe()}
    this.userIdle.stopTimer()
  }

  @HostListener("window:resize", [])
  updateDays() {
    // lg (for laptops and desktops - screens equal to or greater than 1200px wide)
    // md (for small laptops - screens equal to or greater than 992px wide)
    // sm (for tablets - screens equal to or greater than 768px wide)
    // xs (for phones - screens less than 768px wide)
    this.refreshToolBarType()
  }

  refreshToolBarType() {
    this.sidebarMode = 'side'
    if (window.innerHeight >= 750) {
      // console.log('toolbar tiny true')
      this.toolbarTiny = true
    } else {
      // console.log('toolbar tiny false')
      this.toolbarTiny = false
    }
    if (window.innerWidth > 811) {
      this.smallDevice = false;
      this.siteService.smallDevice = false
    } else {
      this.smallDevice = true;
      this.siteService.smallDevice = true
    }

    if (window.innerWidth <=600) {
      this.sidebarMode = 'over'
      this.phoneDevice = true
      this.siteService.phoneDevice = true
    } else {
      this.phoneDevice = false
      this.siteService.phoneDevice = false
    }
    // this.autthen
  }

  renderTheme() {
    const theme = localStorage.getItem('angularTheme')
    this._renderer.removeClass(document.body, 'dark-theme');
    this._renderer.removeClass(document.body, 'light-theme');
    this._renderer.addClass(document.body, theme);
  }

  public searchBarToggler() {
    this.toolBarUIService.switchSearchBarSideBar()
  }

  public menuBarToggler() {
    this.toolBarUIService.switchToolBarSideBar()
  }

  prepareRoute(outlet: RouterOutlet) {
    this.department = null;
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation']
  }

  prepareAdvertisingRoute(outletAdvertising: RouterOutlet) {
    return outletAdvertising && outletAdvertising.activatedRouteData && outletAdvertising.activatedRouteData['animation']
  }

  prepareMessageRoute(outletMessage: RouterOutlet) {
    return outletMessage && outletMessage.activatedRouteData && outletMessage.activatedRouteData['animation']
  }

  initIdle() {
    ////Idle Work
    // console.log('initIdle')

    if (!this.platFormService.isApp())  { return }
    if (this.uiSettings && !this.uiSettings.timeOut) { return }

    if (!this.uiSettings) {
      this.uiSettings = {} as UIHomePageSettings
      this.uiSettings.timeOut = true;
      this.uiSettings.timeOutValue = 100
    };

    if ( !this.uiSettings.timeOutValue || this.uiSettings.timeOutValue == undefined) {  this.uiSettings.timeOutValue = 180 }
    let timeout = this.uiSettings.timeOutValue;
    if (timeout <= 0) { timeout = 180};

    this.userIdle.stopWatching();
    const config = {timeout: 4, idle: this.uiSettings.timeOutValue, ping: 300, idleSensitivity: 5}
    this.userIdle.setConfigValues(config);
    this.userIdle.startWatching();

    //check if someone did anything
    this.userIdle.onIdleStatusChanged().subscribe(data => {
      if (data) {
        this.userIdle.resetTimer();
      }
    })

    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
      // console.log('timer started', count)
    });

    // Start watch when time is up.
    this.userIdle.onTimeout().subscribe(() => {
        this.siteService.notify('Time out will occur in a few seconds.', 'Close', 4, 'yellow')
        if (this.platFormService.isApp()){
          // console.log('sign out')
          //
          this.dialog.closeAll()
          this.signOutUser()
          return;
        }
      }
    );

    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
        if (count) {
          // console.log( count)
          if (this.posDevice) {
            if (this.posDevice?.ignoreTimer) {
              return;
            }
          }

          if (count >= 4) {
            this.userIdle.resetTimer();
            this.signOutUser();
          }
        }
      }
    );
  }

  signOutUser() {
    this.userSwitchingService.clearLoggedInUser();
    this.userIdle.stopTimer();
  }

  stop()          {  this.userIdle.stopTimer();     }

  stopWatching()  {  this.userIdle.stopWatching();  }

  startWatching() {  this.userIdle.startWatching(); }

  restart()       {  this.userIdle.resetTimer();    }

  setScrollBarColor(color: string) {
    // console.log('default', color)
    if (!color) {    color = '#6475ac' }
    const css = this.authService.getAppToolBarStyle(color, 25)
    this.styleTag = this.renderer.createElement('style');
    this.styleTag.type = 'text/css';
    this.styleTag.textContent = css;
    this.renderer.appendChild(document.head, this.styleTag);
  }


}
