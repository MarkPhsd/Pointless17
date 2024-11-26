import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { numberFormat } from 'highcharts';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { IRequestResponse } from 'src/app/_services/system/request-message.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PaymentBalanceComponent } from '../../posorders/payment-balance/payment-balance.component';
import { PosOrderItemsComponent } from '../../posorders/pos-order/pos-order-items/pos-order-items.component';
import { PayAPIComponent } from '../../payment-processing/pay-api/pay-api.component';
import { ValueFieldsComponent } from '../../admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  QRCodeModule,PaymentBalanceComponent,PosOrderItemsComponent,
  PayAPIComponent,ValueFieldsComponent,
  SharedPipesModule],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.scss']
})

export class QrPaymentComponent {
  mainPanel: boolean;
  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  phoneDevice : boolean =  true;
  orderItemsHeightStyle: string;
  goingToPay: boolean;
  setToPay: boolean;
  _uISettings       : Subscription;
   order             : IPOSOrder;
  uiHomePageSetting$: Observable<UIHomePageSettings>;
  order$            : Observable<IPOSOrder>;
  action$           : Observable<IPOSOrder>;
  panelHeight       : string;
  message$          : Observable<IRequestResponse>;
  sendingMessage    : boolean;
  processing: boolean;
  user: IUser;
  uiTransactions: TransactionUISettings

  paymentForm: FormGroup;

  orderCurrent$ = this.orderMethodsService.currentOrder$.pipe(switchMap(data => {
    this.order = data;
    return of(data)
  }))

  user$ = this.authenticationService.user$.pipe(switchMap(data => {

    if (this.user && data) {
      if (this.user.id != data.id) {
        console.log('user refresh1', this.user)
        this.user = data;
        this.refresh()
      }
    }
    if (!this.user && data) {
      console.log('user refresh2', this.user)
      this.user = data;
      this.refresh()
    }
    // this.user = data;
    // this.refresh()
    return of(data)
  }));

  initTransactionUISettings() {
    this.uISettingsService.transactionUISettings$.subscribe( data => {
        this.uiTransactions = data
      }
    )
  }

  constructor(
      private uiSettingsService: UISettingsService,
      private settingsService: SettingsService,
      private siteService    : SitesService,
      private orderService   : OrdersService,
      private orderMethodsService: OrderMethodsService,
      public userAuth       : UserAuthorizationService,
      private authenticationService: AuthenticationService,
      private uISettingsService: UISettingsService,
      private requestMessageMethods: RequestMessageMethodsService,
      private route          : ActivatedRoute,
      private router         : Router,
      private fb: FormBuilder,
  ) { }

  ngOnInit(): void {

    // this.id = this.route.snapshot.paramMap.get('id');
    localStorage.removeItem('loginAction');

    if (!this.checkUserLoggedIn()) {
      return
    }
    this.refresh()
  }

  refresh() {
    this.uiHomePageSetting$ = this.settingsService.getUIHomePageSettings();
    this.initTransactionUISettings()
    this.order$ = this.getOrder().pipe(switchMap(data => {
      this.order = data;
      return of(data)
    }))
    this.paymentForm = this.fb.group({
      tipAmount: []
    })
  }

  checkUserLoggedIn() {
    const  user = this.authenticationService._user.value
    if (!user || !user?.id) {
      const orderCode =this.route.snapshot.paramMap.get('orderCode'); ;
      this.authenticationService.openLoginDialog(`/qr-payment;orderCode=${orderCode}`)
      return false;
    }
    this.user = user;
    return true
  }

  ngOnDestroy() {
    this.action$ = null;
  }

  navigateToLogin(){
    localStorage.removeItem('user')
    this.uiHomePageSetting$.subscribe(data => {
      this.authenticationService.logout(data?.pinPadDefaultOnApp)
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
    // this.orderItemsHeightStyle = ''
    // return ;
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

    if (!this.userAuth.user || this.userAuth.user.username.toLowerCase() === 'temp') {
      this.setLoginActions()
      const ref = this.authenticationService.openLoginDialog()
      return;
    }

    if (this.userAuth.user) {
      this.setToPay = true;
      // this.action$ =  this.goPay();
    }

  }

  getOrder(): Observable<IPOSOrder> {

    try {
      this.processing = true;
      const id = this.route.snapshot.paramMap.get('id');
      const orderCode = this.route.snapshot.paramMap.get('orderCode');
      const site = this.siteService.getAssignedSite();
      const setToPay =  this.route.snapshot.paramMap.get('setToPay');

      if (setToPay) {
        this.setToPay = true;
      }

      const user = this.getUser()

      if (!id && !orderCode) {
        this.processing = false;
        return of(null)
      }

      this.action$ = null;

      let order$ : Observable<IPOSOrder>
      if (orderCode) {
        order$ =this.orderService.getQROrderAnon(site, orderCode);
      }

      if (!order$) {
        this.processing = false;
        return of(null)
      }
      return order$.pipe(switchMap(data => {
        this.processing = false;

        this.orderMethodsService.updateOrder(data)
        if (setToPay) {

        }
        return of(data)
      }));

      // return this.navigateToOrder();
    } catch {
      this.processing = false;
      return of(null)
    }
  }

  creditPaymentAmount() {
    // this.payment.surcharge = +(this.order.balanceRemaining * 0.03).toFixed(2)
    // this.order.balanceRemaining =
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
     const item$ = this.getOrder()
     return item$.pipe(
        switchMap(data => {
          this.order = data;
          this.orderMethodsService.setActiveOrder( data)
          this.goingToPay = false
          this.router.navigate(['pos-payment'])
          return of(data)
        })
     )
  }

  getUser() {
    let user = this.userAuth.currentUser();
    if (!user) {
      user = {} as IUser;
      user.username = 'Temp'
      user.password = 'Temp';
      user.roles    = 'user';
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user;
  }
}
