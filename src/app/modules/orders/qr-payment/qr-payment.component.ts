import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-qr-payment',
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.scss']
})
export class QrPaymentComponent {
  mainPanel: boolean;
  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  phoneDevice = false;
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

  uiTransactions: TransactionUISettings

  paymentForm: FormGroup;

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
      private route          : ActivatedRoute,
      private orderService   : OrdersService,
      private orderMethodsService: OrderMethodsService,
      public userAuth       : UserAuthorizationService,
      private authenticationService: AuthenticationService,
      private uISettingsService: UISettingsService,
      private requestMessageMethods: RequestMessageMethodsService,
      private router         : Router,
      private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.getUser();
    this.uiHomePageSetting$ = this.settingsService.getUIHomePageSettings();
    this.initTransactionUISettings()
    this.order$ = this.getOrder().pipe(switchMap(data => { 

      return of(data)
    }))
    this.paymentForm = this.fb.group({
      tipAmount: []
    })
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
      if (!id && !orderCode) { 
        this.processing = false;
        return of(null)}

      this.action$ = null;

      const user = this.getUser()
      let order$ : Observable<IPOSOrder>

      console.log('user', user)
      if (user && user?.username  &&  user?.username != "Temp" && user.password) { 
        if (orderCode) {
          order$ =this.orderService.getQROrder(site, orderCode);
        }
        if (id) {
          order$ = this.orderService.getQRCodeOrder(site, id);
        }
      }
      if (!user) { 
        if (orderCode) {
          order$ =this.orderService.getQROrder(site, orderCode);
        }
        if (id) {
          order$ = this.orderService.getQRCodeOrder(site, id)
        }
      }
   
      if (!order$) { 
        this.processing = false;
        return of(null)
      }
      return order$.pipe(switchMap(data => { 
        this.processing = false;
        this.order = data;
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
