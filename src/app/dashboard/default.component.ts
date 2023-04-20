import { Component, HostBinding, OnInit, AfterViewInit,
         Renderer2, OnDestroy, HostListener,
         ChangeDetectorRef,
         ElementRef,
         ViewChild,
         TemplateRef} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Observable, of, Subscription,switchMap } from 'rxjs';
import { fader } from 'src/app/_animations/route-animations';
import { ToolBarUIService } from '../_services/system/tool-bar-ui.service';
import { Capacitor } from '@capacitor/core';
import { AppInitService } from '../_services/system/app-init.service';
import { AuthenticationService, IDepartmentList } from '../_services';
import { IUser } from '../_interfaces';
import { UIHomePageSettings, UISettingsService } from '../_services/system/settings/uisettings.service';
import { isDevMode } from '@angular/core';
import { SitesService } from '../_services/reporting/sites.service';
import { SplashScreenStateService } from 'src/app/_services/system/splash-screen-state.service';
import { PlatformService } from '../_services/system/platform.service';
import { UserAuthorizationService } from '../_services/system/user-authorization.service';
// import { ReportDateHelpersService } from '../_services/reporting/report-date-helpers.service';
import { UserSwitchingService } from '../_services/system/user-switching.service';
import { ITerminalSettings, SettingsService } from '../_services/system/settings.service';
import { ElectronService } from 'ngx-electron';
import { BalanceSheetService } from '../_services/transactions/balance-sheet.service';
import { BalanceSheetMethodsService } from '../_services/transactions/balance-sheet-methods.service';
import { UserIdleService } from 'angular-user-idle';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  animations: [ fader ],
})

export class DefaultComponent implements OnInit, OnDestroy, AfterViewInit {

  // @ViewChild('menuOrOrderBar')
  @ViewChild('appMenuSearchBar')   appMenuSearchBar: TemplateRef<any>;
  @ViewChild('appOrderBar')        appOrderBar: TemplateRef<any>;
  @ViewChild('menuBarView')        menuBarView: TemplateRef<any>;

  @ViewChild('appSiteFooter')  appSiteFooter: TemplateRef<any>;
  @ViewChild("footer") footer: ElementRef;
  departmentID     =0
  get platForm() {  return Capacitor.getPlatform(); }
  toggleControl     = new FormControl(false);
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

  _searchSideBar    : Subscription;
  searchSideBar     : boolean;
  searchBarWidth    : number;

  _barSize        : Subscription;
  barSize         : boolean;
  smallMenu        = false;

  _swapMenuWithOrder : Subscription;
  swapMenuWithOrder  : boolean;

  _orderBar       : Subscription;
  orderBar        : boolean;

  _department : Subscription;
  department  : IDepartmentList;

  matorderBar = 'mat-orderBar-wide';
  barType     = 'mat-drawer-toolbar';
  apiUrl      : any;

  _user       : Subscription;
  user        : IUser;

  style       = "width:195px"
  _ping       : Subscription;
  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  homePageSetting$: Observable<UIHomePageSettings>;

  devMode     : boolean;
  chatURL     : string;
  phoneDevice : boolean;
  pointlessPOSDemo: boolean;
  hideAppHeader: boolean;
  posDevice$ : Observable<ITerminalSettings>

  initDeviceSubscriber() {
    if (this.platFormService.isApp()) {
      const device = localStorage.getItem('devicename')
      if (!device) { return }
      this.uiSettingsService.homePageSetting$.pipe(switchMap(data => {
        this.uiSettings = data;
        return this.posDevice$
      })).pipe(switchMap(data => {
        if (!data) {
          this.stopWatching()
          return of(null)
        }
        if (!data.ignoreTimer) {
          this.uiSettings.timeOut = false
          this.stopWatching()
        }
        return of(data)
      }))
    }
  }
  homePageSubscriber(){
    try {
      this.matorderBar = 'mat-orderBar-wide'
      this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
        if (data) {
          this.uiSettings = data;
          this.initIdle();
          if (this.phoneDevice)  {
            this.matorderBar = 'mat-orderBar'
            return
          }
          this.matorderBar = 'mat-orderBar-wide'
        }
      })
    } catch (error) {

    }
  }

  swapMenuWithOrderSubscriber() {
    this._swapMenuWithOrder = this.userSwitchingService.swapMenuWithOrder$.subscribe(data =>  {
      this.swapMenuWithOrder = false;
      if (data) {
        this.swapMenuWithOrder = data
      }
      // console.log(this.swapMenuWithOrder)
    })
  }

  userSubscriber() {
    try {
      this._user =     this.authorizationService.user$.subscribe(data => {
        this.user = data
        // this.swapMenuWithOrder = this.user?.userPreferences?.swapMenuOrderPlacement
        // this.swapMenuWithOrder = false;
        // this.themeService.setDarkLight(this.user?.userPreferences?.darkMode)
      })
    } catch (error) {
      console.log('userSubscriber', error)
    }
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
        // console.log('barttype', this.barType)
        // return this.barType
      })
    } catch (error) {
      console.log('toolbarSideBarSubscriber', error)
    }
  }

  searchSideBarSubscriber() {
    this._searchSideBar = this.toolBarUIService.searchSideBar$.subscribe( data => {
      // console.log('data', data)
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
          this.style   = `width:${this.style}`
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
    if ( !this.platFormService.isApp() ) {
      if (this.userAuthorizationService.isStaff) {
        return this.appSiteFooter
      }
    }
    return null;
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

  initSubscriptions() {
    try {
      this.initDeviceSubscriber();
    } catch (error) {
      console.log('device subscriber', error)
    }
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
      this.homePageSubscriber();
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
               public toolBarUIService: ToolBarUIService,
               private _renderer       : Renderer2,
               private cd              : ChangeDetectorRef,
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
               private balanceSheetService     : BalanceSheetService,
               private balanceSheetMethodService: BalanceSheetMethodsService,
               private settingService          : SettingsService,
               private userIdle               : UserIdleService,
               ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    if (!this.platFormService.isApp()) {
      this.sidebarMode   =  'side'
    }
    this.devMode = isDevMode()
  }

  ngOnInit() {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.renderTheme();
    this.initSettings();
    const site = this.siteService.getAssignedSite();
    this.splashLoader.stop()
    this.initDevice()

  }

  initDevice() {
    const site = this.siteService.getAssignedSite();
    const devicename = localStorage.getItem('devicename');
    this.posDevice$ = this.settingService.getPOSDeviceBYName(site, devicename).pipe(switchMap(data => {
      if (!data) { return of(null)}
      const device = JSON.parse(data.text) as ITerminalSettings;
      this.settingService.updateTerminalSetting(device)
      if (device.enableScale && this.platFormService.isAppElectron) {
        this.balanceSheetMethodService.startScaleService()
      }
      return of(device)
    }))
  }

  getHelp() {
    this.router.navigateByUrl(this.chatURL)
  }

  subscribeAddress() {
    //menu-manager
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // console.log(event.url);
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
            return of(ui)
          }
          return of(null)
    }))
  }

  get leftSideBar() {
    if (this.swapMenuWithOrder) {
      // console.log('this order bar',this.toolBarUIService.orderBar, this.orderBar)
      if (this.toolBarUIService.orderBar) {
        return this.appOrderBar
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
    return this.menuBarView;
  }

  initUI() {
    const bar = this.getBoolean(localStorage.getItem('barSize'))
    this.toolbarUIService.updateBarSize(bar)
    this.refreshToolBarType();
    this.initSubscriptions();
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
    this.cd.detectChanges();
    setTimeout(()=>{
      this.rightSideBarToggle = true;
    },50);
    setTimeout(()=>{
      this.rightSideBarToggle = false;
    },50);
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
    if (window.innerHeight >= 750) {
      this.toolbarTiny = true
    } else {
      this.toolbarTiny = false
    }
      if (window.innerWidth > 811) {
        this.sidebarMode = 'side'
        this.smallDevice = false;
        this.siteService.smallDevice = false
      } else {
        this.sidebarMode = 'side'
        this.smallDevice = true;
        this.siteService.smallDevice = true
      }

    if (window.innerWidth <=600) {
      this.phoneDevice = true
      this.siteService.phoneDevice = true
    } else {
      this.phoneDevice = false
      this.siteService.phoneDevice = false
    }
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
    if (!this.uiSettings) {
      this.uiSettings = {} as UIHomePageSettings
      this.uiSettings.timeOut = true;
      this.uiSettings.timeOutValue = 100
    }

    if (this.posDevice$)
    if (this.uiSettings && !this.uiSettings.timeOut) { return }
    if ( !this.uiSettings.timeOutValue || this.uiSettings.timeOutValue == undefined) {  this.uiSettings.timeOutValue = 0 }
    let timeout = this.uiSettings.timeOutValue;
    if (timeout == 0) { timeout = 100};

    this.userIdle.startWatching();

    const config = {timeout: timeout, idle: 10, ping: 300}

    this.userIdle.setConfigValues(config);

    // // Start watching when user idle is starting.
    // this.userIdle.onTimerStart().subscribe(count => {
    //   console.log('timer started', count)
    // });

    // this.userIdle.onTimeout().subscribe(count => {
    //   console.log('onTimeout event called')
    //   if (this.platFormService.isApp()){
    //     if (this.uiSettings && this.uiSettings.timeOut) {
    //       this.userSwitchingService.clearLoggedInUser();
    //       this.userIdle.stopTimer();
    //       return;
    //     }
    //   }
    // })

    // this.userIdle.onIdleStatusChanged().subscribe(count => {
    //   console.log('onIdleStatusChanged event called',count);
    //   this.userIdle.resetTimer();
    // })

   // Start watching when user idle is starting.
   this.userIdle.onTimerStart().subscribe(count => console.log(count));

   // Start watch when time is up.
   this.userIdle.onTimeout().subscribe(() =>
      {
          console.log('Time is up!')
        console.log('onTimeout event called')
        if (this.platFormService.isApp()){
          if (this.uiSettings && this.uiSettings.timeOut) {
            this.userSwitchingService.clearLoggedInUser();
            this.userIdle.stopTimer();
            return;
          }
        }
      }
   );

  }

  stop() {
    this.userIdle.stopTimer();
  }

  stopWatching() {
    this.userIdle.stopWatching();
  }

  startWatching() {
    this.userIdle.startWatching();
  }

  restart() {
    this.userIdle.resetTimer();
  }
}
