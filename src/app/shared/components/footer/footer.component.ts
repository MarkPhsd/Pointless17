import { Component, OnInit,  ViewChild, TemplateRef, HostListener, OnDestroy } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, IDeviceInfo, OrdersService } from 'src/app/_services';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrderFilterPanelComponent } from 'src/app/modules/orders/order-filter-panel/order-filter-panel.component';
import { PosOrderItemsComponent } from 'src/app/modules/posorders/pos-order/pos-order-items/pos-order-items.component';

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
  headerBackColor: string;
  matToolbarColor : string =  'primary'
  isStaff             =   false;
  isAdmin             =   false;
  isUser              =   false;
  user                : IUser;
  userName:           string;
  userRoles:          string;
  employeeName        : string;
  showPOSFunctions    = false;
  screenWidth       : number;
  _order            :   Subscription;
  order             :   IPOSOrder;
  _user             : Subscription;
  deviceInfo        : IDeviceInfo;
  userChecked       : boolean;

  currentOrderSusbcriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      if (this.user && (data && data.id)) {
        if (this.user.id == data.id) {    this.userChecked = true; }
      }
      this.user = data
      this.getUserInfo()
      this.setHeaderBackColor(this.user?.userPreferences?.headerColor)
    })
  }

  constructor(
    public  toolbarUIService  : ToolBarUIService,
    public orderMethodsService: OrderMethodsService,
    private  navigationService: NavigationService,
    public printingService    : PrintingService,
    private bottomSheet       : MatBottomSheet,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.updateScreenSize()
    const i = 0
    this.currentOrderSusbcriber();
    this.initUserSubscriber()
    this.deviceInfo = this.authenticationService.deviceInfo;
  }

  ngOnDestroy(): void {
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

    this.authenticationService.updateDeviceInfo({phoneDevice: this.phoneDevice, smallDevice: this.smallDevice})
    this.deviceInfo = this.authenticationService.deviceInfo;
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

  setHeaderBackColor(color) {
    this.headerBackColor = ''
    if (color) {  this.headerBackColor = `background-color:${color};` }
    if (color) {
      this.matToolbarColor = ''
    } else {
      this.matToolbarColor = 'primary'
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
    if (!this.phoneDevice) {
      this.navigationService.toggleOpenOrderBar(this.isStaff)
    }
    if (this.order) {
      // this.orderMethodsService.updateBottomSheetOpen(true)
      this.bottomSheet.open(PosOrderItemsComponent)
    }
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


  filterBottomSheet() {
    this.bottomSheet.open(OrderFilterPanelComponent);
  }

}
