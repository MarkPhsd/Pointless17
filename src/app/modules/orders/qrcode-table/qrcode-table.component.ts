import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '@stripe/stripe-js';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { IRequestResponse } from 'src/app/_services/system/request-message.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'qr-order',
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

  _uISettings       : Subscription;
   order             : IPOSOrder;
  uiHomePageSetting$: Observable<UIHomePageSettings>;
  order$            : Observable<IPOSOrder>;
  action$           : Observable<IPOSOrder>;
  panelHeight       : string;
  message$          : Observable<IRequestResponse>;
  sendingMessage    : boolean;

  constructor(
      private uiSettingsService: UISettingsService,
      private settingsService: SettingsService,
      private siteService    : SitesService,
      private route          : ActivatedRoute,
      private orderService   : OrdersService,
      private orderMethodsService: OrderMethodsService,
      public userAuth       : UserAuthorizationService,
      private authenticationService: AuthenticationService,
      private requestMessageMethods: RequestMessageMethodsService,
      private router         : Router,
  ) { }

  ngOnInit(): void {
    this.getUser();
    this.uiHomePageSetting$ = this.settingsService.getUIHomePageSettings();
    this.order$ = this.navigateToOrder();
    this.action$ = null;
  }

  ngOnDestroy() { 
    this.action$ = null;
  }

  navigateToLogin(){ 
    localStorage.removeItem('user')
    this.authenticationService.logout()
    this.setLoginActions()
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
      this.action$ =  this.goPay();
    }

  }

  getOrder(): Observable<IPOSOrder> { 
    let item$: Observable<IPOSOrder>;
    const id = this.route.snapshot.paramMap.get('id');
    const orderCode = this.route.snapshot.paramMap.get('orderCode');
    const site = this.siteService.getAssignedSite();
    if (id) { 
      item$ = this.orderService.getQRCodeOrder(site, id);
    }
    if (orderCode) { 
      item$ = this.orderService.getQROrder(site, orderCode);
    }
    return item$;
  }

  navigateToOrder() { 
    const site = this.siteService.getAssignedSite();
    const item$ = this.getOrder()
    return item$.pipe(
      switchMap(data => { 
        this.order = data;
        this.orderService.setActiveOrder(site, data)
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
          this.orderService.setActiveOrder(site, data)
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
