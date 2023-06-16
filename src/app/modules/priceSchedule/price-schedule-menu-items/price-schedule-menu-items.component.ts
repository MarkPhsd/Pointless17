import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from '@stripe/stripe-js';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { DiscountInfo } from 'src/app/_interfaces/menu/price-schedule';
import { MenuService, OrdersService } from 'src/app/_services';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'price-schedule-menu-items',
  templateUrl: './price-schedule-menu-items.component.html',
  styleUrls: ['./price-schedule-menu-items.component.scss']
})
export class PriceScheduleMenuItemsComponent implements OnInit,OnChanges {
  id: number;
  addItem$: Observable<any>;
  menus$: Observable<any>;
  menuItem$ : Observable<any>;
  sort : number
  menuItems: DiscountInfo[];
  order: IPOSOrder;
  _order =  this.orderMethodService.currentOrder$.subscribe(data => {
    this.order = data;
  })

  constructor(
    public route: ActivatedRoute,
    private siteService: SitesService,
    private priceScheduleService: PriceScheduleService,
    private orderMethodService: OrderMethodsService,
    private orderService   : OrdersService,
    private menuItemService: MenuService,
    private userAuth: UserAuthorizationService,
  ) {
    this.id = +this.route.snapshot.paramMap.get('id');
   }

  ngOnInit(): void {
    const i = 0;
    console.log('ngOnInit id', this.id)
    if (this.id) {
      const site   = this.siteService.getAssignedSite();
      this.menus$  = this.priceScheduleService.getScheduleMenuItems(site, +this.id).pipe(switchMap(data => {
        data.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        this.menuItems = data;
        this.sort = 1
        return of(data)
      }))
    }
  }

  toggleSort() {
    if (this.sort == 1) {
      console.log('this.sort', this.sort)
      this.sort = 2;
      this.menuItems.sort((a, b) => (a.name > b.name) ? 1 : -1)
      return;
    }

    if (this.sort == 2) {
      console.log('this.sort', this.sort)
      this.sort = 1;
      this.menuItems.sort((a, b) => (a.sort > b.sort ? 1 : -1));
      return;
    }

  }

  ngOnChanges() {
    console.log('id', this.id)

  }
  menuItemAction(item: any) {
    const site = this.siteService.getAssignedSite();
    if (this.order) {
      this.addItem$ = this.menuItemService.getMenuItemByID(site, item?.itemID).pipe(switchMap(data => {
        if (this.order) {
          this.orderMethodService.menuItemAction( this.order, data, true)
        }
        return of(null)
      }))
    }
    }

}
