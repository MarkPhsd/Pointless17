import { Component, OnInit } from '@angular/core';
import { DisplayMenuResults, RewardsAvailable, RewardsAvailableService } from 'src/app/_services/menu/rewards-available.service';
import {forkJoin, Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenuService, OrdersService } from 'src/app/_services';
import { D } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-rewards-availible',
  templateUrl: './rewards-availible.component.html',
  styleUrls: ['./rewards-availible.component.scss']
})
export class RewardsAvailibleComponent implements OnInit {
  obs$ : Observable<any>[];
  action$ : Observable<any>;
  orderID: number;

  rewards: any;
  list: any;

  constructor(
      private orderService: OrdersService,
      private rewardsAvailible: RewardsAvailableService,
      private menuService        : MenuService,
      private siteService: SitesService,) { }

  ngOnInit(): void {
      const i =0;
      const site = this.siteService.getAssignedSite()
      const _order = this.orderService.currentOrder$.subscribe(data => {
      if (!data) {
        this.action$ = null;
        return
      }
      let orderID = 0
      let clientID = 0
      if ( data.orderID) { orderID = data.orderID }
      if ( data.clientID) { clientID = data.clientID }

      this.action$ = this.rewardsAvailible.getClientAvailableItems(site, clientID, orderID).pipe(
        switchMap(rewards => {
          this.obs$ = []
          const list = rewards.results;
          list.forEach(item => {
            this.obs$.push(this.menuService.getMenuItemByID(site, item.productID))
          });
          // this.list = list;

          this.rewards = rewards;
          return  forkJoin(this.obs$);
        })
      );
    })

  }

}
