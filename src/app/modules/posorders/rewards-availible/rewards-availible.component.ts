import { Component, OnInit, OnDestroy } from '@angular/core';
import { RewardsAvailable, RewardsAvailableService } from 'src/app/_services/menu/rewards-available.service';
import { BehaviorSubject, forkJoin, Observable, of, Subscription, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenuService, OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { animate, style, transition, trigger } from '@angular/animations';

export interface RewardItem {
  id: number;
  name: string;
  value: number;
  productID: number;
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

  redeem$ : Observable<any>;
  obs$ : Observable<any>[];
  action$ : Observable<any>;
  reward$ : Observable<any>;

  rewards: any;
  list: any;
  order: IPOSOrder;
  _order: Subscription;
  groupID = 0;
  rewardID = 0;

  private _rewardsAvailable       = new BehaviorSubject<RewardsAvailable[]>(null);
  public rewardsAvailable$        = this._rewardsAvailable.asObservable();

  results = [] as  RewardItem[];
  constructor(
      private orderService: OrdersService,
      private orderMethodsService: OrderMethodsService,
      private rewardsAvailibleService: RewardsAvailableService,
      private menuService        : MenuService,
      private siteService: SitesService,) { }

  ngOnInit(): void {
    const i =0;
    this._order = this.orderMethodsService.currentOrder$.subscribe(data => {
        this.order = data;
        this.list = null;
        if (!data) {
          this.action$ = null;
          return
        }
        this.action$ = this.refreshRewards(this.order)
    })
    this.rewardsAvailable$.subscribe(data => {
        // this.redeem$ = this.redeemRewards(data)
        // console.log('data', data)
      }
    )
  }

  ngOnDestroy() {
    if (this._order) {
      this._order.unsubscribe()
    }
    if ( this._rewardsAvailable) {
      this._rewardsAvailable.unsubscribe()
    }
  }

  redeemRewards(data: RewardsAvailable[]) {
    const site = this.siteService.getAssignedSite()
    this.obs$ = []
    if (data) {
      data.forEach(item => {
        const item$ = this.processReward(site, item, this.order.id)
        this.obs$.push(item$)
      })
    }
    return forkJoin(this.obs$)
  }

  refreshRewards(order: IPOSOrder) {
    let orderID = 0
    let clientID = 0
    if ( order.orderID) { orderID = order.orderID }
    if ( order.clientID) { clientID = order.clientID }

    const site = this.siteService.getAssignedSite()


    return this.rewardsAvailibleService.getClientAvailableItems(site, clientID, orderID).pipe(
      switchMap(rewards => {
          if (!rewards || !rewards.results) { return of(null)}
          this.list = rewards.results as RewardsAvailable[];
          this.results = []
          if (!this.list) { return of('') };
          this.list.forEach(data => {
            this.results.push({id: data.id, name: data.name, value: data.value, productID: data.productID})
          })
          this._rewardsAvailable.next(this.list)
          this.rewards = rewards;
          return of(this.results)
        }
      )
    );

  }

  menuItemAction(add: boolean, item, index) {
    if (!this.order ) {
      // console.log('No Order')
      return; }
    const site   = this.siteService.getAssignedSite()
    this.reward$ = this.processReward(site, item, this.order.id)
  }

  processReward(site: ISite, item: RewardsAvailable, orderID: number) {

    this.groupID  = item.groupID
    this.rewardID = item.id;

    return  this.menuService.getMenuItemByID(site, item.productID).pipe( switchMap(item => {
        if (!item) {  return of(item)   }
        let passAlongItem;
        if (item.itemType?.name.toLowerCase() === 'Discount % One Item'.toLowerCase() ||
            item.itemType?.name.toLowerCase() === 'Free Item Off'.toLowerCase() ||
            item.itemType?.name.toLowerCase() === 'Cash Discount on Item'.toLowerCase()) {
          if (!this.orderMethodsService?.assignedPOSItem) {
            passAlongItem = this.order.posOrderItems[this.order?.posOrderItems.length-1];
            this.orderMethodsService.addAssignedItem(passAlongItem)
          }

          if  (!passAlongItem)  {
            passAlongItem = this.order.posOrderItems[this.order.posOrderItems.length-1];
            return of(null)
          }
        }

        return this.orderMethodsService.processItemPOSObservable( this.order, null, item, 1, null ,
                                                                  this.rewardID, this.groupID, passAlongItem,
                                                                  this.orderMethodsService.assignPOSItems)

      })).pipe( switchMap(item => {

          if (!item) {  return of(item)   }

          this.orderMethodsService.processItemPostResultsPipe(item);

          return this.rewardsAvailibleService.useReward(site, this.rewardID, this.order.id);

      })).pipe( switchMap( data=> {
        return this.refreshRewards(this.order)
      })
    )
  }

  trackByRewards(_, {id, name, value}: RewardItem): number {
    return id;
  }

}
