import { Component, OnInit, OnDestroy } from '@angular/core';
import { DisplayMenuResults, RewardsAvailable, RewardsAvailableService } from 'src/app/_services/menu/rewards-available.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenuService, OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPOSOrder } from 'src/app/_interfaces';
import { animate, style, transition, trigger } from '@angular/animations';

export interface RewardItem {
  id: number;
  name: string;
  value: number
}
@Component({
  selector: 'app-rewards-availible',
  templateUrl: './rewards-availible.component.html',
  styleUrls: ['./rewards-availible.component.scss'],
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-in', style({ opacity: 1, color: 'green' })),
      ]),
      transition(':leave', [
        animate(
          '250ms 1s ease-out',
          style({
            opacity: 0,
            color: 'red',
            'text-decoration': 'line-through',
          })
        ),
      ]),
    ]),
  ],
})
export class RewardsAvailibleComponent implements OnInit, OnDestroy {

  obs$ : Observable<any>[];
  action$ : Observable<any>;
  reward$ : Observable<any>;
  orderID: number;
  rewards: any;
  list: any;
  order: IPOSOrder;
  _order: Subscription;
  groupID = 0;
  rewardID = 0;

  results = [] as  RewardItem[];
  constructor(
      private orderService: OrdersService,
      private orderMethodsService: OrderMethodsService,
      private rewardsAvailible: RewardsAvailableService,
      private menuService        : MenuService,
      private siteService: SitesService,) { }

  ngOnInit(): void {
      const i =0;
      this._order = this.orderService.currentOrder$.subscribe(data => {
          this.order = data;
          if (!data) {
            console.log('reset action')
            this.action$ = null;
            return
          }
          this.action$ = this.refreshRewards(this.order)
      })
  }

  ngOnDestroy() {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  refreshRewards(order: IPOSOrder) {

    let orderID = 0
    let clientID = 0
    if ( order.orderID) { orderID = order.orderID }
    if ( order.clientID) { clientID = order.clientID }
    // console.log('order', order, orderID, clientID)
    const site = this.siteService.getAssignedSite()

    return this.rewardsAvailible.getClientAvailableItems(site, clientID, orderID).pipe(
      switchMap(rewards => {
        // this.obs$ = []
        this.list = rewards.results as RewardsAvailable[];
        this.results = []
        if (!this.list) { return of('') };

        this.list.forEach(data => {
          this.results.push({id: data.id, name: data.name, value: data.value})
        })

        console.log(this.list, this.results);

        this.rewards = rewards;
        return of(this.results)
        // this.list.forEach(item => {
        //   this.obs$.push(this.menuService.getMenuItemByID(site, item.productID))
        // });
        // this.rewards = rewards;
        // return  forkJoin(this.obs$);
        // }
        }
      )
    );
  }

  menuItemAction(add: boolean, item, index) {
    // console.log(this.order.id, item.id)
    if (!this.order || !item) {
      return;
    }
    //get the index from the reward. the list made from the other observable.
    const id = this.list[index]?.id;
    if (!id) { return }
    const site = this.siteService.getAssignedSite()
    this.reward$ = this.rewardsAvailible.useReward(site, id, this.order.id).pipe(switchMap(data => {
      this.groupID = data.groupID
      this.rewardID = data.id;

      return  this.menuService.getMenuItemByID(site, data.productID)
    })).pipe(switchMap(item => {
      console.log(item)
      return this.orderMethodsService.processItemPOSObservable(this.order,  item.barcode, item, 1, null , this.rewardID,  this.groupID )
    })).pipe(switchMap(data => {
      console.log(data)
      this.groupID  = 0
      this.rewardID = 0
      this.orderMethodsService.processItemPostResultsPipe(data)
      return of(data)
    }))
  }

  trackByRewards(_, {id, name, value}: RewardItem): number {
    console.log('id', id)
    return id;
  }

  // identify(index: number, item){
  //   return item ;
  // }
}
