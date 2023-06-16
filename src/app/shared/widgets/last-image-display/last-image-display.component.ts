import { Component,  OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'last-image-display',
  templateUrl: './last-image-display.component.html',
  styleUrls: ['./last-image-display.component.scss']
})
export class LastImageDisplayComponent implements OnInit {

  @ViewChild('viewDisplay') viewDisplay: TemplateRef<any>;
  lastImage$: Observable<string>;
  lastItem: IMenuItem;
  imageSource: string;
  url        : string;
  orderItems : PosOrderItem[];
  awsUrl$: Observable<string>
  order: IPOSOrder;

  menuItem$: Observable<IMenuItem>
  order$: Observable<IPOSOrder>;

  constructor(
    private menuService:    MenuService,
    private awsBucketService: AWSBucketService,
    private platFormservice: PlatformService,
    private sitesService: SitesService,
    private orderService: OrdersService,
    private orderMethodsService: OrderMethodsService) { }

  ngOnInit(): void {
    this.initSubscriptions()
  }

  initSubscriptions() {

    const awsUrl$ = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
      this.url = data;
      return of(data)
    }))

    const lastItem$ = this.orderMethodsService.lastItemAdded$;

    if (!this.platFormservice.isApp()) {
      this.initSubscriptionOrder(awsUrl$)
      return
    }

    this.lastImage$ =  lastItem$.pipe(switchMap(data => {
       this.lastItem = data;
       return awsUrl$
    })).pipe(switchMap(data => {

        this.imageSource = null
        if (!data) { return of(null) }
        if (!this.lastItem) { return of(null)}
        this.url = data;
        if (data && this.lastItem.urlImageMain && this.url) {
          this.imageSource = `${this.url}${this.lastItem.urlImageMain}`
        }
        return of(data)
      }
    ))

  }

  //if this is the display then show the item absed on the update of the order
  initSubscriptionOrder(awsUrl$: Observable<string>) {
    if (this.platFormservice.isApp()) {return}
    const order$ = this.orderMethodsService.currentOrder$
    this.menuItem$ =  order$.pipe(switchMap(data => {
      if (!data) { return of(null)}
      this.order = data;
      this.orderItems = null;
      if (data.posOrderItems) {
        this.orderItems = data.posOrderItems;
      }
      return awsUrl$
   })).pipe(switchMap(data => {
      if (!data) { return of(null)}
      this.imageSource = null
      if (!data) { return of(null) }
      if (!this.lastItem) { return of(null)}
      this.url = data;
      const lastItem =  this.orderItems[this.orderItems.length];
      if (!lastItem) { return of(null)}
      const site = this.sitesService.getAssignedSite()
      return  this.menuService.getMenuItemByID(site, lastItem.productID)
     }
   )).pipe(switchMap(data => {
    if (!data) { return of(null)}
    if (data && data.urlImageMain && this.url) {
      this.imageSource = `${this.url}${data.urlImageMain}`
    }
    return of(data)
   }))

  }


  isViewDisplay() {
    if (this.imageSource && this.orderMethodsService.lastItemAddedExists) {
      return this.viewDisplay
    }
    return null;
  }
}
