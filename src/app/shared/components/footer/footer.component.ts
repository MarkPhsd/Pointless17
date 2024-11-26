import { Component, OnInit,  ViewChild, TemplateRef, HostListener, OnDestroy } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, IDeviceInfo, OrdersService } from 'src/app/_services';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrderFilterPanelComponent } from 'src/app/modules/orders/order-filter-panel/order-filter-panel.component';
import { PosOrderItemsComponent } from 'src/app/modules/posorders/pos-order/pos-order-items/pos-order-items.component';
import { CartButtonComponent } from '../../widgets/cart-button/cart-button.component';
import { DSIEMVAndroidPayBtnComponent } from 'src/app/modules/posorders/pos-payment/dsiemvandroid-pay-btn/dsiemvandroid-pay-btn.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { DsiEMVCardPayBtnComponent } from 'src/app/modules/posorders/pos-payment/dsi-emvcard-pay-btn/dsi-emvcard-pay-btn.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
            CartButtonComponent,DSIEMVAndroidPayBtnComponent,
            DsiEMVCardPayBtnComponent,
          ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  get platForm() {  return Capacitor.getPlatform(); }
  deviceName = localStorage.getItem('devicename')
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
  androidApp        = this.platFormService.androidApp;
  _uiConfig      : Subscription;
  uiConfig       = {} as TransactionUISettings;

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

    try {
      this._uiConfig = this.uiSettingsService.transactionUISettings$.subscribe(data => {
        if (data) {    this.uiConfig = data; }
      })
    } catch (error) {
    }
  }

  constructor(
    public  toolbarUIService  : ToolBarUIService,
    public  orderMethodsService: OrderMethodsService,
    private  navigationService: NavigationService,
    public  printingService    : PrintingService,
    private bottomSheet       : MatBottomSheet,
    private uiSettingsService: UISettingsService,
    private platFormService: PlatformService,
    public router:           Router,

    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.updateScreenSize()
    const i = 0
    this.currentOrderSusbcriber();
    this.initUserSubscriber()
    this.deviceInfo = this.authenticationService.deviceInfo;
  }

  get refreshCreditCardButton() {
    const href = this.router.url;
    if (href.startsWith('/pos-items')) {
      if (this.androidApp) {
        if (this.deviceInfo.phoneDevice) {
          return true
        }
      }
    }
    return false
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
      this.toolbarUIService.updateOrderBar(false,this.authenticationService.deviceInfo)
    }
    if (this.phoneDevice) {
      this.toolbarUIService.updateOrderBar(false,this.authenticationService.deviceInfo)
      this.toolbarUIService.updateSearchBarSideBar(false)
    }
  }

  toggleOpenOrderBar() {
    if (!this.phoneDevice) {
      this.navigationService.toggleOpenOrderBar(this.isStaff)
      return;
    }

    if (this.phoneDevice && this.platFormService.androidApp) {
      this.router.navigate([ 'pos-items' , {mainPanel:true}]);
      this.toolbarUIService.updateOrderBar(false, this.authenticationService.deviceInfo)
      this.toolbarUIService.resetOrderBar(true)
      return
    }
    if (this.order) {
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
    this.navigationService.makePayment(false, this.smallDevice, this.isStaff, this.order?.completionDate, path)
  }


  filterBottomSheet() {
    this.bottomSheet.open(OrderFilterPanelComponent);
  }

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  get cashDiscount() {
    const ui = this.uiConfig;

    if (ui?.dcapSurchargeOption == 3) {
      return this.roundToPrecision( this.order?.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 2) {
      return this.roundToPrecision( this.order?.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 1 ) {
      return this.roundToPrecision( this.order?.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (!ui?.dcapSurchargeOption && ui.dcapDualPriceValue ) {
      return this.roundToPrecision( this.order?.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }

    return  this.order?.creditBalanceRemaining
  }


}
