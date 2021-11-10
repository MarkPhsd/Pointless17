import { Component, HostBinding, OnInit,AfterViewInit,
         Renderer2, OnDestroy, HostListener, OnChanges,
         ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { fader } from 'src/app/_animations/route-animations';
import { ToolBarUIService } from '../_services/system/tool-bar-ui.service';
import { ChangeDetectionStrategy } from '@angular/compiler/src/compiler_facade_interface';
import { Capacitor, Plugins, KeyboardInfo } from '@capacitor/core';
import { AppInitService } from '../_services/system/app-init.service';
import { AuthenticationService } from '../_services';
import { IUser } from '../_interfaces';

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

  barType         = "mat-drawer-toolbar"
  apiUrl: any;

  _user: Subscription;
  user : IUser;

  initSubscriptions() {
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
    })
  }

  constructor(
               private toolBarUIService: ToolBarUIService,
               private _renderer       : Renderer2,
               private cd              : ChangeDetectorRef,
               private appInitService  : AppInitService,
               private authorizationService: AuthenticationService,

               ) {
    this.apiUrl   = this.appInitService.apiBaseUrl()

    if (this.platForm == 'web') {
      this.sidebarMode   =  'side'
    }
  }

  ngOnInit(): void {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.renderTheme();
    this.initSubscriptions();
    this.refreshToolBarType();
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
    } else {
      this.sidebarMode = 'side'
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
      // this.barType = "mat-drawer-toolbar"
      // this.barType =  "mat-drawer-searchbar"
    }
    this.toolBarUIService.updateToolBarSideBar(this.sideBarOpen)
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation']
  }

}
