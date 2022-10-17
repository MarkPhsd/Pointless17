import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from '@stripe/stripe-js';
import { Subscription, Observable, switchMap, of } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'qr-order',
  templateUrl: './qrcode-table.component.html',
  styleUrls: ['./qrcode-table.component.scss']
})
export class QRCodeTableComponent implements OnInit {

  _uISettings      : Subscription;
  order: IPOSOrder;
  uiHomePageSetting$: Observable<UIHomePageSettings>;
  order$            : Observable<IPOSOrder>;
  panelHeight: string;

  constructor(
      private settingsService: SettingsService,
      private siteService    : SitesService,
      private route          : ActivatedRoute,
      private orderService   : OrdersService,
      private orderMethodsService: OrderMethodsService,
      private userAuth       : UserAuthorizationService,
      private router         : Router,
  ) { }

  ngOnInit(): void {
    this.getUser();
    console.log('current user', this.userAuth.currentUser())
    console.log('is user', this.userAuth.isUser)
    this.uiHomePageSetting$ = this.settingsService.getUIHomePageSettings();
    this.order$ = this.navigateToOrder();
  }

  requestService() { 
    
  }

  navigateToOrder() { 
     const id = this.route.snapshot.paramMap.get('id');
     const site = this.siteService.getAssignedSite();

     return this.orderService.getQRCodeOrder(site, id).pipe(
        switchMap(data => { 
          this.order = data;
          console.log('qr order', data)
          this.orderService.setActiveOrder(site, data)
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
