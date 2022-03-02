import { Component, OnInit, Output, EventEmitter,
        HostBinding, Renderer2, HostListener, OnDestroy, OnChanges } from '@angular/core';
import { FormBuilder,FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CompanyService,AuthenticationService, OrdersService, MessageService, AWSBucketService, } from 'src/app/_services';
import { ICompany, IPOSOrder, ISite, IUser, IUserProfile,  }  from 'src/app/_interfaces';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Observable, of, Subject, Subscription,   } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SiteSelectorComponent } from '../../widgets/site-selector/site-selector.component';
import { Location} from '@angular/common';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ScaleInfo, ScaleService, ScaleSetup } from 'src/app/_services/system/scale-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PollingService } from 'src/app/_services/system/polling.service';
import { Router } from '@angular/router';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { Pipe, PipeTransform } from '@angular/core';

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
  @Output() outPutToggleSearchBar:    EventEmitter<any> = new EventEmitter();
  openOrderBar:                      boolean;
  @HostBinding('class') className = '';

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
  searchForm      : FormGroup;

  scannerEnabled  : boolean;
  private toolBar :  boolean;

  showPOSFunctions    =   false;
  showTableLayout     =   false;
  scaleName           :   any;
  scaleValue          :   any;
  smallDevice         : boolean;
  isUserStaff         = false;
  isAdmin             = false;
  isUser              = false;
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

  message: string;

  //themes
  matToolbarColor = 'primary';

  siteName: string;
  bucket = '';

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })

    this._scaleInfo = this.scaleService.scaleInfo$.subscribe( data => {
      this.scaleInfo = data
    })

    this._openOrderBar = this.toolbarUIService.orderBar$.subscribe( data => {
      this.openOrderBar = data;
    })

    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getUserInfo()
    })

  }

  constructor(private authenticationService:  AuthenticationService,
              private pollingService        : PollingService,
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
              private router              : Router,
              private awsBucketService     : AWSBucketService,
              private fb                  : FormBuilder ) {
  }

  ngOnChanges() {
    this.getUserInfo();
  }

  async  ngOnInit() {

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
  }


  //if there is a current order for this user, then we can assign it here.
  initUserOrder(){
    if (this.user && (!this.order || (!this.order.id || this.order.id == 0)) ) {
      const userProfile = {} as IUserProfile;
      userProfile.id = this.user.id;
      userProfile.roles = this.user.roles;
      this.userSwitchingService.assignCurrentOrder(userProfile)
    }
  }


  ngOnDestroy(): void {

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

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
  }

  getUserInfo() {
    this.initUserInfo();
    let user: IUser;

    if (this.user) { user = this.user  }
    if (!this.user) {
       user = JSON.parse(localStorage.getItem('user')) as IUser;
    }

    if (!user) {  return null }

    this.isAdmin      = false;
    this.userName     = user.username
    this.userRoles    = user.roles.toLowerCase();
    this.employeeName = user.username;

    if (user.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true
    }

    this.isUser = false;
    if (user.roles === 'user') {
      this.isUser = true;
    }
    if (user.roles == 'admin' || user.roles == 'manager' || user.roles == 'employee') {
      this.isUserStaff      = true
      this.showPOSFunctions = true;
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
  }

  toggleSideBar() {
    this.outPutToggleSideBar.emit(!this.openOrderBar)
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
    // // const image = 'https://naturesherbs.s3-us-west-1.amazonaws.com/splash-woman-on-rock-1.jpg'
    // console.log('asssign background', image)
    // const styles = { 'background-image': `url(${image})`  };

    // this.backgroundImage = styles
    // const i = 1
  }

}

