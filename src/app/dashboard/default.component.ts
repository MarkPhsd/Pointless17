import { Component, HostBinding, OnInit, AfterViewInit,
         Renderer2, OnDestroy, HostListener,
         ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { fader } from 'src/app/_animations/route-animations';
import { ToolBarUIService } from '../_services/system/tool-bar-ui.service';
import { Capacitor } from '@capacitor/core';
import { AppInitService } from '../_services/system/app-init.service';
import { AuthenticationService, IDepartmentList } from '../_services';
import { IUser } from '../_interfaces';
import { UIHomePageSettings, UISettingsService } from '../_services/system/settings/uisettings.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  animations: [ fader ],
})

export class DefaultComponent implements OnInit, OnDestroy, AfterViewInit {

  pages = new      Array(10);
  itemChange$:     Observable<number>;
  next$:           Observable<number>;
  prev$:           Observable<number>;
  routeTrigger$:   Observable<object>;
  toolbarTiny:     boolean;
  orderBarOpen:    boolean;
  sidebarMode   =  'side'
  id:              any;
  smallDevice    : boolean;

  advertisingOutlet : string;
  messageOutlet     : string;

  drawer: any;
  @HostBinding('class') className = '';
  @HostListener('unloaded')

  get platForm() {  return Capacitor.getPlatform(); }
  toggleControl     = new FormControl(false);
  isSafari        : any;
  posts           : any;

  searchbarSidebar: Subscription;
  toolbarSideBar  : Subscription;
  sideBarOpen     : boolean;
  searchBarOpen   : boolean;

  _orderBar       : Subscription;
  orderBar        : boolean;

  searchBarWidthSubscription: Subscription;
  searchBarWidth  : number;

  _department: Subscription;
  department : IDepartmentList;

  matorderBar     = 'mat-orderBar-wide'
  barType         = "mat-drawer-toolbar"
  apiUrl: any;

  _user: Subscription;
  user : IUser;

  style = "width:195px"

  _barSize: Subscription;
  barSize : boolean;
  smallMenu = false;

  _uiSettings: Subscription;
  uiSettings : UIHomePageSettings;

  initSubscriptions() {
    this.matorderBar = 'mat-orderBar-wide'
    this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
      this.uiSettings = data;
      if (data) {
        if (data.wideOrderBar) {
          if (this.smallDevice)  { this.matorderBar = 'mat-orderBar'  }
          if (!this.smallDevice) { this.matorderBar = 'mat-orderBar-wide'  }
         }
      }
    })

    this.style = ""
    this._user =     this.authorizationService.user$.subscribe(data => {
      this.user = data
    })
    this.toolBarUIService.orderBar$.subscribe(data => {
      this.orderBarOpen = data
    })
    this.toolbarSideBar = this.toolBarUIService.toolbarSideBar$.subscribe( data => {
      this.sideBarOpen = data
      this.barType =  "mat-drawer-searchbar"
    })
    this.searchbarSidebar = this.toolBarUIService.searchSideBar$.subscribe( data => {
      this.searchBarOpen = data
      this.barType = "mat-drawer-toolbar"
      this.style = ""
    })

    this._department  = this.toolBarUIService.departmentMenu$.subscribe( data => {
      if (!data) {
        this.department = null
        return
      }
      this.department = data;
    })

    this.searchBarWidthSubscription = this.toolBarUIService._searchBarWidth$.subscribe(data => {
      if (data) {
        if (data == 55 || this.smallMenu) {
          this.barType =  "mat-drawer-searchbar-tiny"
        }
      }
      if (!data && data != 0 || this.smallMenu) {
        this.barType =  "mat-drawer-searchbar-tiny"
        this.style = `width:${this.style}`
        this.searchBarWidth = data
      }
    })
    this._barSize = this.toolbarUIService.barSize$.subscribe( data => {
      if (data) {
        this.barType =  "mat-drawer-searchbar-tiny"
        this.style = `width:${this.style}`
        return
      }
      this.barType = "mat-drawer-toolbar"
      this.style = ""
      this.smallMenu = data;
    })

  }

  constructor(
               private toolBarUIService: ToolBarUIService,
               private _renderer       : Renderer2,
               private router          : Router,
               private cd              : ChangeDetectorRef,
               private appInitService          : AppInitService,
               private authorizationService    : AuthenticationService,
               private toolbarUIService        : ToolBarUIService,
               private uiSettingsService       : UISettingsService
               ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()
    if (this.platForm == 'web') {
      this.sidebarMode   =  'side'
    }
  }

 async  ngOnInit() {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.renderTheme();
    this.uiSettings =  await this.uiSettingsService.subscribeToCachedHomePageSetting('UIHomePageSettings')
    this.initSubscriptions();
    this.refreshToolBarType();
    const bar = this.getBoolean(localStorage.getItem('barSize'))
    this.toolbarUIService.updateBarSize(bar)
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
    if (this.id) {
      clearInterval(this.id);
    }
    this.toolbarTiny = true
    if (this.toolbarSideBar) {
      this.toolbarSideBar.unsubscribe();
      this.toolbarSideBar = null;
    }
    if (this.searchbarSidebar) {
      this.searchbarSidebar.unsubscribe();
      this.searchBarOpen = null;
    }
    if (this._user) {
      this._user.unsubscribe();
    }

    if (this._barSize) {
      this._barSize.unsubscribe();
    }

    if(this._uiSettings) { this._uiSettings.unsubscribe()};
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
    if (window.innerWidth > 599) {
      this.sidebarMode = 'side'
      this.smallDevice = false;
    } else {
      this.sidebarMode = 'side'
      this.smallDevice = true;
    }
  }

  renderTheme() {
    const theme = localStorage.getItem('angularTheme')
    this._renderer.removeClass(document.body, 'dark-theme');
    this._renderer.removeClass(document.body, 'light-theme');
    this._renderer.addClass(document.body, theme);
  }

  public searchBarToggler() {
    this.searchBarOpen   = !this.searchBarOpen;
    if (this.sideBarOpen)    {
      this.sideBarOpen = true
    }
    else {
      if (!this.sideBarOpen) {
        this.sideBarOpen = true
      }
    }
    this.toolBarUIService.updateSearchBarSideBar(this.searchBarOpen)
  }

  public sideBarToggler() {
    this.sideBarOpen   = !this.sideBarOpen;
    if (this.sideBarOpen && !this.searchBarOpen) {
    }
    this.toolBarUIService.updateToolBarSideBar(this.sideBarOpen)
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
