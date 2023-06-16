import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-qrorder',
  templateUrl: './qrorder.component.html',
  styleUrls: ['./qrorder.component.scss']
})
export class QROrderComponent implements OnInit {

  message       : string;
  id            : string;
  _order        : Subscription;
  order         : IPOSOrder;
  order$        : Observable<IPOSOrder>;

  currentOrderSusbcriber() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
      if (!data) { return }
    })
  }

  constructor(public  route: ActivatedRoute,
              private siteService: SitesService,
              private clientService: ClientTableService,
              private auth: AuthenticationService,
              public orderMethodsService: OrderMethodsService,
              private userSwitchingService: UserSwitchingService,
              private orderService: OrdersService){
    this.id = this.route.snapshot.paramMap.get('id');
   }

  ngOnInit(): void
  {
    if (this.id) {
      if (this.order) {
        //skip scanning and go to order.
      }
      this.initQROrder()
    };
    this.message = 'Could not start new order, please contact staff.'
  }

  initQROrder() {
    this.message = "...starting your order."
    const site = this.siteService.getAssignedSite()
    const client$ = this.initTempUser();
    this.order$ = client$.pipe(
      switchMap(data => {
        return this.orderService.newOrderFromQR(site, this.id)
      })
    ).pipe(
      switchMap(data => {
        //navigate to the menu screen
        //hide the sidebar
        //show the search bar
        return of(data)
      })
    )
  }

  initTempUser() {
    const site = this.siteService.getAssignedSite()
    const newClient$ = this.clientService.newTempClient(site)
    if (this.auth.userValue) {
      return of(this.auth.userValue)
    }
    const client$ = newClient$.pipe(
      switchMap(data => {
        const iUser = {} as IUser;
        iUser.firstName = data.firstName;
        iUser.lastName  = data.lastName;
        iUser.password  = data.apiPassword;
        iUser.username  = data.apiUserName;
        iUser.roles     = data.roles;
        iUser.id        = data.id;
        this.userSwitchingService.user  = iUser;
        this.userSwitchingService.setUserInfo(iUser, iUser.password)
        this.auth.setUserSubject(iUser);
        return of(this.auth.userValue)
      })
    )
    return client$
  }

}
