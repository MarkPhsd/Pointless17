import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  @ViewChild('footerMenu') footerMenu: TemplateRef<any>;
  outlet              : TemplateRef<any>;
  phoneDevice : boolean;
  smallDevice: boolean;
  
  isStaff             =   false;

  isAdmin             =   false;
  isUser              =   false;
  user                : IUser;
  userName:           string;
  userRoles:          string;
  employeeName        : string;
  showPOSFunctions    = false;
  screenWidth         : number;
  _order        :   Subscription;
  order         :   IPOSOrder;

  currentOrderSusbcriber() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }


  constructor(
    public  toolbarUIService  : ToolBarUIService,
    private orderService      : OrdersService,
    private  navigationService: NavigationService,
    public printingService        : PrintingService,
  ) { }

  ngOnInit(): void {
    this.updateScreenSize()
    const i = 0
    this.currentOrderSusbcriber();
    this.getUserInfo();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) { this._order.unsubscribe()}
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    this.outlet  = null;
    this.screenWidth = window.innerWidth;

    if ( window.innerWidth < 850 ) {
      this.smallDevice = true
      this.outlet = this.footerMenu
    };
    if ( window.innerWidth < 450 ) {
      this.phoneDevice = true
      this.outlet = this.footerMenu
    };
    
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

    if (!user.roles) { return }

    this.userRoles    = user.roles.toLowerCase();
    this.employeeName = user.username;

    if (user.roles === 'admin') {
      this.showPOSFunctions = true;
      this.isAdmin          = true
    }

    if (user.roles === 'manager' || user.roles === 'admin' || user.roles === 'employee' ) { 
      this.isStaff = true
    }  

  }

  initUserInfo() {
    this.userName         = '';
    this.userRoles        = '';
    this.showPOSFunctions = false;
    this.isAdmin          = false;
    this.isStaff      = false;
    this.employeeName     = '';
  }

  navPOSOrders() {
    this.smallDeviceLimiter();
    this.navigationService.navPOSOrders()
  }

  smallDeviceLimiter() {
    if (this.smallDevice) { 
      this.toolbarUIService.updateOrderBar(false) 
    }
    if (this.phoneDevice) { 
      this.toolbarUIService.updateOrderBar(false) 
      this.toolbarUIService.updateSearchBarSideBar(false) 
    }
  }

  toggleOpenOrderBar() {
    this.navigationService.toggleOpenOrderBar(this.isStaff)
  }

  makePayment() {
    let path =''
    if (this.order) { 
      if (this.order.tableName && this.order.tableName.length>0) { 
        path = 'pos-payment'
      }
    }
    this.navigationService.makePayment(false, this.smallDevice, this.isStaff, this.order.completionDate, path)
  }



}
