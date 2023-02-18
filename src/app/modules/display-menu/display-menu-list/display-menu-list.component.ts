import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatestAll, forkJoin, Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService, OrdersService } from 'src/app/_services';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'display-menu-list',
  templateUrl: './display-menu-list.component.html',
  styleUrls: ['./display-menu-list.component.scss']
})
export class DisplayMenuListComponent implements OnInit {

  menu: IDisplayMenu;
  id: number;
  addMenuItem$ : Observable<any>;
  action$: Observable<any>;
  obs$ : Observable<any>[];
  bucket: string;
  // containerStyle = "{ 'background': 'cement.png' | asUrl,
  //                     'background-repeat': 'repeat', 'height': '500vh'}"
  order: IPOSOrder;
  _order: Subscription;
  containerStyle = ``
  containerBackground = 'cemement.png';
  backgroundURL = `url(backgroundURL.png)`;

  getContainerBackground(backgroundImage: string) {
    this.containerStyle = ''
    const image =    this.awsBucket.getImageURLPathAlt(this.bucket, backgroundImage)
    this.backgroundURL = `url(${image})`
    return this.backgroundURL;
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  getPlaceHolder() {
    return this.awsBucket.getPlaceHolderImage() // this.placeHolderImage
  }

  orderSubscriber() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      if (data && data.id) {
        this.order = data
        return
      }
      this.order = null;
    })
  }

  constructor(
      public route: ActivatedRoute,
      private priceScheduleService: PriceScheduleService,
      private siteService: SitesService,
      private orderMethodService: OrderMethodsService,
      private orderService: OrdersService,
      private awsBucket         : AWSBucketService,
      private renderer : Renderer2,
      private displayMenuService: DisplayMenuService, ) {

    this.id = +this.route.snapshot.paramMap.get('id');

  }

  loadStyles() {
    const styles = this.menu.css;
    if (!this.menu?.css) {return }
    const style = document.createElement('style');
    style.innerHTML = styles;
    document.head.appendChild(style);
  }

  ngOnInit(): void {
    this.orderSubscriber();
    if (this.menu && !this.menu.backcolorOpacity) {
      this.menu.backcolorOpacity = '0';
    }
    const i =0
    const site   = this.siteService.getAssignedSite();

    this.action$ = this.getBucket().pipe(
      switchMap(data => {
        this.bucket = data.preassignedURL;
        return  this.displayMenuService.getMenu(site, this.id)
      })).pipe(
      switchMap(data => {

        if (data && data.backgroundImage) {
          this.getContainerBackground(data.backgroundImage)
        }

        //so here we have to get all the list of the item, and
        this.obs$ = []
        if (!data || !data?.menuSections) {
          return of('no menu')
        }
        const list = JSON.parse(data?.menuSections);
        list.forEach(item => {
          this.obs$.push(this.priceScheduleService.getPriceScheduleFull(site, item.id))
        });

        this.menu = data;

        forkJoin(this.obs$)
        return  forkJoin(this.obs$)
      })
    )
  }

  menuItemActionObs(menuItem : IMenuItem) {


    const site = this.siteService.getAssignedSite();

    let order$ = of(this.order)

    if (!this.order || this.order == null) {
      order$ = this.orderService.newOrderWithPayloadMethod(site, null);
    }
    if (order$) {

    }
    this.addMenuItem$ = order$.pipe(switchMap(order => {
      if (!order) {
         this.siteService.notify('No order started', 'Alert', 1000)
         return of(null) }
         console.log('order', order.id)
         return this.orderMethodService.menuItemActionObs(order, menuItem, true,
        this.orderMethodService.assignPOSItems)
    }))
  }

  getBucket() {
    return this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

}
