import { Component, HostBinding, OnInit, AfterViewInit,
         Renderer2, OnDestroy, HostListener,
         ChangeDetectorRef,
         ElementRef,
         ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Observable, of, Subscription,switchMap } from 'rxjs';
import { fader } from 'src/app/_animations/route-animations';
import { ToolBarUIService } from '../_services/system/tool-bar-ui.service';
import { Capacitor } from '@capacitor/core';
import { AppInitService } from '../_services/system/app-init.service';
import { AuthenticationService, IDepartmentList, ThemesService } from '../_services';
import { IUser } from '../_interfaces';
import { UIHomePageSettings, UISettingsService } from '../_services/system/settings/uisettings.service';
import { isDevMode } from '@angular/core';
import { SitesService } from '../_services/reporting/sites.service';
import { SplashScreenStateService } from 'src/app/_services/system/splash-screen-state.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  animations: [ fader ],
})

export class DefaultComponent implements OnInit, OnDestroy, AfterViewInit {

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
  orderBarOpen:    boolean;
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

  _searchSideBar    : Subscription;
  searchSideBar     : boolean;
  searchBarWidth    : number;

  _barSize        : Subscription;
  barSize         : boolean;
  smallMenu        = false;

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

  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  homePageSetting$: Observable<UIHomePageSettings>;

  devMode     : boolean;
  chatURL     : string;
  phoneDevice : boolean;
  pointlessPOSDemo: boolean;

  homePageSubscriber(){
    try {
      this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
        this.matorderBar = 'mat-orderBar-wide'
        if (data) {
          this.uiSettings = data;

          if (this.phoneDevice)  {
            this.matorderBar = 'mat-orderBar'
            return
          }

          this.matorderBar = 'mat-orderBar-wide'

          // if (!data.wideOrderBar) {
          //   if (this.smallDevice)  {
          //     this.matorderBar = 'mat-orderBar'
          //   }
          //   if (!this.smallDevice) { this.matorderBar = 'mat-orderBar-wide'  }
          // }

          // if (data.wideOrderBar) {
          //   if (!this.smallDevice) { this.matorderBar = 'mat-orderBar-wide'  }
          // }
        }
      })
    } catch (error) {
      console.log('HomePage Subscriber', error)
    }
  }

  userSubscriber() {
    try {
      this._user =     this.authorizationService.user$.subscribe(data => {
        this.user = data
      })
    } catch (error) {
      console.log('userSubscriber', error)
    }
  }

  orderBarSubscriber() {
    try {
      this.toolBarUIService.orderBar$.subscribe(data => {
        this.orderBarOpen = data
      })
    } catch (error) {
      console.log('orderBarSubscriber', error)
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
        this.barType =  "mat-drawer-searchbar"
      })
    } catch (error) {
      console.log('toolbarSideBarSubscriber', error)
    }
  }

  searchSideBarSubscriber() {
    this._searchSideBar = this.toolBarUIService.searchSideBar$.subscribe( data => {
      this.searchSideBar = data
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
    this.matorderBar = 'mat-orderBar-wide'
    this.style = ""
    this.homePageSubscriber();
    this.userSubscriber();
    this.orderBarSubscriber();
    this.toolbarSideBarSubscriber();
    this.departmentMenuSubscriber();
    this.searchSideBarSubscriber();
    this.searchBarWidthSubscriber();
    this.barSizeSubscriber();
    this.leftSideBarToggleSubscriber();
  }

  constructor(
               private toolBarUIService: ToolBarUIService,
               private _renderer       : Renderer2,
               private cd              : ChangeDetectorRef,
               private appInitService          : AppInitService,
               private authorizationService    : AuthenticationService,
               public toolbarUIService         : ToolBarUIService,
               private uiSettingsService       : UISettingsService,
               private router                  : Router,
               private siteService             : SitesService,
               private splashLoader            : SplashScreenStateService,
              //  private themesService           : ThemesService,
               ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    if (this.platForm == 'web') {
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
    if (this.uiSettings && this.uiSettings.threecxChatLink) {
      this.chatURL = this.uiSettings.threecxChatLink
      if (site.url === 'https://ccsposdemo.ddns.net/api' || site.url === 'https://ccsposdemo.ddns.net:4444/api' ||
          site.url ==='https://ccsposdemo.ddns.net:4445/api' || site.url ==='https://ccsposdemo.ddns.net:4446/api' ||
          site.url === 'https://localhost:44309/api') {
        this.chatURL = 'https://pointlesspos.ca.3cx.us:6001/LiveChat702266'
      }

    }
    // if this.nav

  }

  getHelp() {
    this.router.navigateByUrl(this.chatURL)
  }
  subscribeAddress() {
    //menu-manager
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log(event.url);
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
      this.orderBarOpen = true;
    },50);
    setTimeout(()=>{
      this.orderBarOpen = false;
    },50);
  };

  orderBarToggler(event){
    this.toolBarUIService.updateOrderBar(event)
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.orderBarOpen = false;
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
    } else {
      this.sidebarMode = 'side'
      this.smallDevice = true;
    }

   if (window.innerWidth <=600) {
    this.phoneDevice = true
   } else {
    this.phoneDevice = false
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
}
