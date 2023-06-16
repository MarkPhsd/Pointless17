import { Component, OnInit,Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscountInfo, IPriceSchedule,
 } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'scheduled-menu-items',
  templateUrl: './scheduled-menu-items.component.html',
  styleUrls: ['./scheduled-menu-items.component.scss']
})
export class ScheduledMenuItemsComponent implements OnInit {

  @Input() schedule: IPriceSchedule
  schedulMenuItems$: Observable<DiscountInfo[]>;
  observableEnabled = false;
  scheduleItems: any;
  @Input() showAllFlag  = false;
  iconName = 'expand'
  awsBucket: string;
  isApp    : boolean;

  itemslistcontainer = 'items-list-container'
  itemCount = 100; //default count for list.

  constructor(
    private menuService         : MenuService,
    private awsBucketService    : AWSBucketService,
    private orderMethodsService : OrderMethodsService,
    private platFormService     : PlatformService,
    private orderService        : OrdersService,
    private siteService         : SitesService,) {

    const site = siteService.getAssignedSite();

    if (this.schedule) {
      this.initList(this.schedule);
      this.menuService.getMenuItemsBySchedule(site, this.schedule.id).subscribe(
        data => this.scheduleItems
      )
    }
    this.isApp = this.platFormService.isApp();
    if (this.isApp) {
      this.itemslistcontainer = 'items-list-container-app'
      this.itemCount = 10
    }
  }

  async ngOnInit()  {
     this.initList(this.schedule);
     this.awsBucket = await this.awsBucketService.awsBucketURL()
  }

  toggleShowMore() {
    this.showAllFlag = !this.showAllFlag;

    if (this.showAllFlag)   {this.iconName = 'minimize'}
    if (!this.showAllFlag)  {this.iconName = 'expand'}

  }

  async menuItemAction(menuItem) {
    const order =  this.orderMethodsService.currentOrder
    console.log('order', order)
    if (this.isApp) {
      this.orderMethodsService.menuItemAction(order, menuItem, true )
    }
    if (!this.isApp) {
      this.orderMethodsService.menuItemAction(order, menuItem, false )
    }

  }

  initList(schedule: IPriceSchedule) {
    if (schedule) {
      const site = this.siteService.getAssignedSite();
      this.schedulMenuItems$ = this.menuService.getMenuItemsBySchedule(site, schedule.id)
      this.observableEnabled = true
    }
  }



}
