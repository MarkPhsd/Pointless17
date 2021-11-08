import { Component, OnInit, Output, EventEmitter,
        HostBinding, Renderer2, HostListener, OnDestroy, OnChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService,AuthenticationService, OrdersService, MenuService, MessageService, UserService} from 'src/app/_services';
import { ICompany, IPOSOrder, ISite, IUser, IUserProfile }  from 'src/app/_interfaces';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { Observable, of, Subject, Subscription, throwError, timer } from 'rxjs';
import { catchError, delay, delayWhen, finalize, first, map, repeatWhen, retryWhen, tap } from 'rxjs/operators';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SiteSelectorComponent } from '../../widgets/site-selector/site-selector.component';
// https://blog.bitsrc.io/6-ways-to-unsubscribe-from-observables-in-angular-ab912819a78f
import {Location} from '@angular/common';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ScaleInfo, ScaleService } from 'src/app/_services/system/scale-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PlatformService } from 'src/app/_services/system/platform.service';

interface IIsOnline {
  result: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy, OnChanges {

  @Output() outPutToggleSideBar:      EventEmitter<any> = new EventEmitter();
  @Output() outPutToggleSearchBar:      EventEmitter<any> = new EventEmitter();
  openOrderBar:                      boolean;
  @HostBinding('class') className = '';

  apiStatus : string;
  isApp     : boolean;

  // get searchProductsValue() { return this.searchForm.get("searchProducts") as FormControl;}
  // searchForm: FormGroup;

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
  searchForm    : FormGroup;

  scannerEnabled: boolean;
  private toolBar   :  boolean;

  _order              :   Subscription;
  order               :   IPOSOrder;

  _orderBar           : Subscription;
  orderBar            : boolean;

  _order$             : Observable<IPOSOrder>;
  order$              : Subject<Observable<IPOSOrder>> = new Subject();

  showPOSFunctions    =   false;
  showTableLayout     =   false;
  scaleName           :   any;
  scaleValue          :   any;
  smallDevice : boolean;
  isUserStaff  = false;
  isAdmin      = false;
  scaleInfo           ={} as ScaleInfo;
  _scaleInfo          : Subscription;

  _openOrderBar      : Subscription;

  user               : IUser;
  _user              : Subscription;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })

    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      this.scaleInfo = data;
    })

    this._openOrderBar = this.toolbarUIService.orderBar$.subscribe( data => {
      this.openOrderBar = data;
    })

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getUserInfo()
    })



  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._openOrderBar) {
      this._openOrderBar.unsubscribe();
    }
    if (this._scaleInfo) {
      this._scaleInfo.unsubscribe();
    }
    if (this._order) {
      this._order.unsubscribe();
    }
    if (this._user) {
      this._user.unsubscribe();
    }
  }

  constructor(private authenticationService:  AuthenticationService,
              private dialog:                 MatDialog,
              private companyService:         CompanyService,
              private _renderer:              Renderer2,
              public  orderService:            OrdersService,
              private messageService:         MessageService,
              public  breakpointObserver:      BreakpointObserver,
              private siteService:            SitesService,
              private toolbarUIService:       ToolBarUIService,
              private location:               Location,
              private scaleService        : ScaleService,
              private navigationService   : NavigationService,
              private userSwitchingService: UserSwitchingService,
              public  platFormService     : PlatformService,
              private fb              :       FormBuilder ) {

    this.initSearchObservable();
    this.messageService.sendMessage('show');
    this.platFormService.getPlatForm();
    this.initSubscriptions();
  }

  ngOnChanges() {
    this.getUserInfo();
  }

  async  ngOnInit() {
    this.getUserInfo();
    this.refreshScannerOption()
    this.searchForm = this.fb.group( {
      searchProducts: ''
    });

    this.renderTheme();
    this.refreshTheme()
    this.initCompany();
    this.mediaWatcher()
    this.initSite();
    this.updateItemsPerPage();
  }

  refreshScannerOption() {
    this.scannerEnabled = false

    if (!this.platFormService.webMode) {
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
    this.location.back();
  }

  smallDeviceLimiter() {
    if (this.smallDevice) {
      this.toolbarUIService.updateOrderBar(false)
    }
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.showSearchForm = true
    this.smallDevice = false

    if (window.innerWidth >= 1200) {
      this.sitePickerWidth = 33
    } else if (window.innerWidth >= 992) {
      this.sitePickerWidth = 33
    } else if (window.innerWidth  >= 768) {
      this.sitePickerWidth = 75

    } else if (window.innerWidth < 768) {
      this.showSearchForm = false
      this.sitePickerWidth = 75
      this.smallDevice = true
    }

  }

  getUserInfo() {

    this.userName =  '';
    this.userRoles = '';
    this.showPOSFunctions = false;
    this.isAdmin          = false;
    this.isUserStaff      = false;
    this.employeeName = ''
    let user: IUser;

    if (this.user) {
      user = this.user
    } else {
      user = JSON.parse(localStorage.getItem('user')) as IUser;
    }

    if (!user) {  return null }

    this.isAdmin = false;
    this.userName =  user.username
    this.userRoles = user.roles.toLowerCase();
    this.employeeName = user.username;

    if (user.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true
    }

    if (user.roles == 'admin' || user.roles == 'manager' || user.roles == 'employee') {
      this.isUserStaff = true
      this.showPOSFunctions = true;
    }

  }

  initSite() {
    this.site = this.siteService.getAssignedSite();
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
    const site     = this.siteService.getAssignedSite();
    this.company$  = this.companyService.getCompany(site)
    .pipe(
        repeatWhen(notifications =>
          notifications.pipe(
          delay(4000)
      ),
    )),
    catchError((err: any) => {
        this.apiStatus = "--Offline--"
        return throwError(err);
      }
    )
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

  goHome() {
    this.smallDeviceLimiter();
    this.navigationService.navHome();
  }

  navPOSOrders() {
    // routerLinkActive="list-item-active" routerLink="/pos-orders"
    this.smallDeviceLimiter();
    this.navigationService.navPOSOrders()
  }

  navTableService() {
    this.smallDeviceLimiter();
  }

  toggleSideBar() {
    this.outPutToggleSideBar.emit(!this.openOrderBar)
    this.toolbarUIService.switchToolBarSideBar()
    return
  }

  toggleSearchMenu() {
    this.smallDeviceLimiter();
    this.toolbarUIService.switchSearchBarSideBar()
  }

  toggleOrderBar(event) {
    // this.openOrderBar = !this.openOrderBar
    if (this.openOrderBar){
      this.smallDeviceLimiter();
    }
    this.toolbarUIService.updateOrderBar(this.openOrderBar)
  }

  logout() {
    this.smallDeviceLimiter();
    this.authenticationService.logout();
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
    const dialogRef = this.dialog.open( SiteSelectorComponent,
      { width:     '350',
        height:    '90vh',
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      this.initSite();
      console.log('The dialog was closed');
    });
  }

  readScale() {
    this.scaleService.readScale();
  }

  switchUser() {
    this.userSwitchingService.openPIN({request: 'switchUser'})
  }

}

