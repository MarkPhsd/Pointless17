import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { IRequestMessage, IRequestResponse, RequestMessageService } from 'src/app/_services/system/request-message.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { LogoComponent } from 'src/app/shared/widgets/logo/logo.component';
import { PaymentBalanceComponent } from '../../posorders/payment-balance/payment-balance.component';
import { PosOrderItemsComponent } from '../../posorders/pos-order/pos-order-items/pos-order-items.component';

@Component({
  selector: 'qr-order',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    QRCodeModule,LogoComponent,
    PaymentBalanceComponent,
    PosOrderItemsComponent,
  ],
  templateUrl: './qrcode-table.component.html',
  styleUrls: ['./qrcode-table.component.scss']
})
export class QRCodeTableComponent implements OnInit, OnDestroy {
  mainPanel: boolean;
  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  phoneDevice = false;
  orderItemsHeightStyle: string;
  goingToPay: boolean;

  // id                : string;
  // orderCode         : string;
  _uISettings       : Subscription;
   order            : IPOSOrder;
  uiHomePageSetting$: Observable<UIHomePageSettings>;
  order$            : Observable<IPOSOrder>;
  action$           : Observable<IPOSOrder>;
  panelHeight       : string;
  message$          : Observable<IRequestResponse>;
  sendingMessage    : boolean;
  processing: boolean;
  sendmessage$ : Observable<IRequestResponse>;

  constructor(
      private uiSettingsService: UISettingsService,
      private settingsService: SettingsService,
      public siteService    : SitesService,
      private route          : ActivatedRoute,
      private orderService   : OrdersService,
      private orderMethodsService: OrderMethodsService,
      public userAuth       : UserAuthorizationService,
      private authenticationService: AuthenticationService,
      private requestMessageMethods: RequestMessageMethodsService,
      private router         : Router,
      private requestMessageService : RequestMessageService,
      // private route: AC
  ) {
  }

  ngOnInit(): void {
    localStorage.removeItem('loginAction');
    this.orderMethodsService.updateOrder(null)
    this.getUser();

    this.uiHomePageSetting$ = this.settingsService.getUIHomePageSettings()

    this.order$ = this.getOrder().pipe(switchMap(data => {
      const emailSource = this.route.snapshot.paramMap.get('emailSource');
      console.log('received order', emailSource, data)
      if (emailSource) {
        if (this.order) {
          this.sendmessage$ = this.notifyMessageReceived(this.order)
        }
      }
      return of(data)
    }))


  }

  ngOnDestroy() {
    this.action$ = null;
  }

  notifyMessageReceived(order: IPOSOrder) : Observable<IRequestResponse> {
    const site = this.siteService.getAssignedSite()
    let message = {} as IRequestMessage
    message.method  = `order;id=${order?.id}`
    message.message = `User opened the order from email. ${message.method} - ${order?.customerName}`
    message.subject = `Order Opened - ${order?.customerName}`
    message.type    = 'UT'
    message.userID  = order?.employeeID;
    message.userRequested = order?.employeeName;
    message.orderID = order?.id;

    message.emailMessage = true
    return this.requestMessageService.saveMessage(site, message ).pipe(switchMap(data => {

      // this.siteService.notify('tracker called', 'alert', 3000)
      return of(data)
    }))
  }

  navigateToLogin(){
    localStorage.removeItem('user')
    this.uiHomePageSetting$.subscribe(data => {
      this.authenticationService.logout(data.pinPadDefaultOnApp)
      this.setLoginActions()
    })
  }

  setLoginActions() {
    const loginAction = {name: 'setActiveOrder', id: this.order.id}
    localStorage.setItem('loginAction', JSON.stringify(loginAction))
  }

  cancelMessage() {
    this.message$ = null;
    this.sendingMessage = false;
  }

  requestService() {
    this.sendingMessage = true
    this.message$ = this.requestMessageMethods.requestService(this.order).pipe(
      switchMap(data => {
        this.sendingMessage = false
        return of(data)
      })
    )
  }

  resizePanel() {
    this.uiSettingsService.remainingHeight$.subscribe(data => {
      if (this.mainPanel) {
        this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        }
        return;
      }
      if (data) {
        const value = +data.toFixed(0)
        this.orderItemsHeightStyle = `${value - 70}px`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `${value - 105}px`
        }
      }
    })
  }

  requestCheck() {
    this.sendingMessage = true
    this.message$ = this.requestMessageMethods.requestCheck(this.order).pipe(
      switchMap(data => {
        this.sendingMessage = false
        return of(data)
      })
    )
  }

  payOrder() {

    if (!this.userAuth.user || this.userAuth?.user?.username.toLowerCase() === 'temp') {
      this.setLoginActions()
      // /qr-receipt;orderCode=82515311298176916209
      const orderCode = this.route.snapshot.paramMap.get('orderCode');

      const ref = this.authenticationService.openLoginDialog('qr-receipt', orderCode)
      return;
    }

    if (this.userAuth.user) {
      this.action$ =  this.goPay();
    }

  }

  getOrder(): Observable<IPOSOrder> {
    try {
      this.processing = true;
      const id = this.route.snapshot.paramMap.get('id');
      const orderCode = this.route.snapshot.paramMap.get('orderCode');
      const site = this.siteService.getAssignedSite();
      this.action$ = null;

      console.log(orderCode,id)
      let order$ : Observable<IPOSOrder>;
      let pass: boolean = false

      const user = this.getUser()
      if (orderCode) {
        return this.orderService.getQROrderAnon(site, orderCode).pipe(switchMap(data => {
          console.log('qr order', data)
          this.processing = false;
          this.order = data;
          this.orderMethodsService.updateOrder(data)
          return of(data)
        }))
      }

      if (!id && !orderCode) {
        this.processing = false;
        return of(null)
      }

      if (!order$) {
        this.processing = false;
        return of(null)
      }

      return order$.pipe(switchMap(data => {
        this.processing = false;
        this.order = data;
        this.orderMethodsService.updateOrder(data)
        return of(data)
      }));
    } catch {
      this.processing = false;
      return of(null)
    }
  }

  navigateToOrder() {
    const site = this.siteService.getAssignedSite();
    const item$ = this.getOrder()
    return item$.pipe(
      switchMap(data => {
        this.order = data;
        this.orderMethodsService.setActiveOrder(data)
        return of(data)
      })
    )
  }

  goPay() {
     const site = this.siteService.getAssignedSite();
     this.goingToPay = true
     const item$ = this.getOrder();

     return item$.pipe(
        switchMap(data => {
          this.order = data;
          this.orderMethodsService.setActiveOrder( data)
          this.goingToPay = false
          this.router.navigate(['qr-payment', {orderCode: data?.orderCode, setToPay: true}])
          return of(data)
        })
     )
  }

  getUser() {
    let user = this.authenticationService._user.value
    // console.log('auth user', user)
    if (user) {
      return user
    }
    user = this.userAuth.currentUser();
    if (!user) {
      user = {} as IUser;
      user.username = 'Temp'
      user.password = 'Temp';
      user.roles    = 'user';
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }

  applySignature() {
    if (this.order.completionDate) {
      this.router.navigate(['signature'])
    }
  }

}
