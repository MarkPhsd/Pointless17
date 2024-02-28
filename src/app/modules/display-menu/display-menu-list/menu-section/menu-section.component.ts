import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, Input, OnInit,  Renderer2,  TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap,  Observable, of,  switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IDisplayMenu, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService } from 'src/app/_services';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-menu-section',
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.scss']
})
export class MenuSectionComponent implements OnInit {
  //Grid Display
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;
  @Input() listItemID: any;
  @Input() text: any;
  @Input() ccs: any;

  bucket$: Observable<any>;
  @Input() menu: IDisplayMenu;
  @ViewChild('category') category : TemplateRef<any>;
  @ViewChild('loading') loading : TemplateRef<any>;
  categoryMenu: IPriceSchedule;
  id        : number;
  addMenuItem$ : Observable<any>;
  action$   : Observable<any>;
  obs$      : Observable<any>;
  item      : IMenuItem;
  bucket    : string;
  @Input() order: IPOSOrder;



  containerStyle      = ``
  containerBackground = 'cemement.png';
  backgroundURL       = `url(backgroundURL.png)`;
  backGroundStyle: string;

  order$ = this.orderMethodService.currentOrder$.pipe(
    switchMap(data => {
    if (data && data.id) {
      this.order = data
      return of(data)
    }
    this.order = null;
    return of(data)
  }));

  loadStyles() {
    const styles = this.menu.css;
    if (!this.menu?.css) {return }
    const style = document.createElement('style');
    style.innerHTML = styles;
    document.head.appendChild(style);
  }

  getBucket() {
    return this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

  _getItemSrc(item, categoryItem: IPriceSchedule) {
    if (item?.menuItem?.urlImageMain) {
      return this.getItemSrc(item?.menuItem.urlImageMain)
    }
    if (item?.image != '' && categoryItem?.showImage) {
      return this.getItemSrc(categoryItem.image)
    }
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray);
  }

  getPlaceHolder() {
    return this.awsBucket.getPlaceHolderImage();
  }

  constructor(
    private siteService       : SitesService,
    public route              : ActivatedRoute,
    private awsBucket         : AWSBucketService,
    private priceScheduleService: PriceScheduleService,
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document,
    private orderMethodService  : OrderMethodsService,) {
      this.id = +this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.listItemID && this.listItemID != 0) { this.id = this.listItemID  }
    if (this.ccs) { this.addStyles(this.ccs) }
    this.bucket$ = this.getBucket()
    if (this.id) {
      const site   = this.siteService.getAssignedSite();
      this.obs$ = this.priceScheduleService.getPriceScheduleFull(site, this.id).pipe(switchMap(data =>{
        this.categoryMenu = data;
        this.categoryMenu.itemDiscounts.sort((a, b) => a.sort - b.sort);
        console.log('Items', this.categoryMenu.itemDiscounts)
        return of(data)
      }))
      return;
    }

  }

  addStyles(styles): void {
    const style = this.renderer.createElement('style');
    const text = this.renderer.createText(styles); // Example CSS

    this.renderer.appendChild(style, text);
    // Append the style element directly to this component's native element
    this.renderer.appendChild(this.el.nativeElement, style);

    // this.renderer.appendChild(style, text);
    // this.renderer.appendChild(this.document.head, style);
  }

  get categoryView() {
    if (this.categoryMenu) {
      return this.category;
    }
    return this.loading;
  }

  menuItemActionObs(menuItem : IMenuItem) {
    const site = this.siteService.getAssignedSite();
    let order$ = of(this.order)
    // if (!this.order || this.order == null) {  this.order = {} as IPOSOrder  }
    // console.log('order', this.order)
    this.addMenuItem$ = this.orderMethodService.menuItemActionObs( this.order, menuItem, true,
                                                      this.orderMethodService.assignPOSItems).pipe(concatMap(data => {
      return of(data)
    }))
  }

}
