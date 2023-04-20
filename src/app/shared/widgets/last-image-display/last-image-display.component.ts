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
      // console.log('aws bucket data', JSON.stringify(data))
      this.url = data;
      // console.log('bucket', this.url)
      return of(data)
    }))

    const lastItem$ = this.orderService.lastItemAdded$;

    if (!this.platFormservice.isApp()) {
      console.log('init Subscriptions ') 
      this.initSubscriptionOrder(awsUrl$)
      return
    }
    
    this.lastImage$ =  lastItem$.pipe(switchMap(data => {
       this.lastItem = data;
       return awsUrl$
    })).pipe(switchMap(data => {
        //1A40103000220ED000160009
        this.imageSource = null
        if (!data) { return of(null) }
        if (!this.lastItem) { return of(null)}
        this.url = data;
        if (data && this.lastItem.urlImageMain && this.url) {
          this.imageSource = `${this.url}${this.lastItem.urlImageMain}`
          // console.log('last Item Added Exists', this.imageSource)
        }
        return of(data)
      }
    ))
  
  }

  //if this is the display then show the item absed on the update of the order
  initSubscriptionOrder(awsUrl$: Observable<string>) { 
    if (this.platFormservice.isApp()) { 
      return
    }

    // console.log('subscribe order last image')
    const order$ = this.orderService.currentOrder$

    this.menuItem$ =  order$.pipe(switchMap(data => {
      this.order = data;
      this.orderItems = data.posOrderItems;
      return awsUrl$
   })).pipe(switchMap(data => {

       this.imageSource = null
       if (!data) { return of(null) }
       if (!this.lastItem) { return of(null)}
       this.url = data;

      const lastItem =  this.orderItems[this.orderItems.length];
      
      //  console.log('subscribe order last image', lastItem)
      if (!lastItem) { return of(null)}
      const site = this.sitesService.getAssignedSite()
      return  this.menuService.getMenuItemByID(site, lastItem.productID)
     }
   )).pipe(switchMap(data => { 
    if (data && data.urlImageMain && this.url) {
      this.imageSource = `${this.url}${data.urlImageMain}`
    }
    return of(data)
   }))

  }


  isViewDisplay() {
    if (this.imageSource && this.orderService.lastItemAddedExists) {
      return this.viewDisplay
    }
    return null;
  }
}
