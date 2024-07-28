import { Component,  Input,  OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, AuthenticationService, MenuService,  } from 'src/app/_services';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'price-schedule-menu-items',
  templateUrl: './price-schedule-menu-items.component.html',
  styleUrls: ['./price-schedule-menu-items.component.scss']
})
export class PriceScheduleMenuItemsComponent implements OnInit, OnChanges {
  
  @Input() menuCategoryID : number;
  id: number;
  addItem$: Observable<any>;
  menus$: Observable<any>;
  menuItem$ : Observable<any>;
  sort : number
  menuItems: IMenuItem[];
  order: IPOSOrder;
  _order =  this.orderMethodService.currentOrder$.subscribe(data => {
    this.order = data;
  })
  infiniteItemClass = 'grid-item';
  ordersListClass   = 'grid-flow scroller'
  bucketName: string;
  userAuths    = {} as IUserAuth_Properties;
  userAuths$   = this.authService.userAuths$.pipe(
    switchMap(data =>
      { this.userAuths = data;
        return of(data)
      }
    )
  )

   bucket$    = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
    this.bucketName = data as unknown as string;
    return of(data)
  }));

  isStaff= this.userAuthorizationService.isStaff;

  constructor(
    public route: ActivatedRoute,
    private siteService: SitesService,
    private awsBucketService : AWSBucketService,
    public  authService: AuthenticationService,
    private priceScheduleService: PriceScheduleService,
    private orderMethodService: OrderMethodsService,
    private menuItemService: MenuService,
    private userAuthorizationService: UserAuthorizationService,
  ) {
    this.id = +this.route.snapshot.paramMap.get('id');
   }

  ngOnInit(): void {
    const i = 0;
    this.refreshMenu()
  }

  refreshMenu() { 
    console.log(this.id, this.menuCategoryID)
    if(this.menuCategoryID !=0 && this.menuCategoryID != undefined) { 
      this.id = this.menuCategoryID
    }
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
    // console.log('id', this.id)
    this.refreshMenu()
  }

  menuItemAction(item: any) {
    const site = this.siteService.getAssignedSite();
    // if (this.order) {
      if (!this.order) { this.order = {} as IPOSOrder}
      this.addItem$ = this.menuItemService.getMenuItemByID(site, item?.itemID).pipe( switchMap(data => {

          return  this.orderMethodService.menuItemActionObs(this.order, data, true,
                        this.orderMethodService.assignPOSItems);


      }))
    // }
    }

}
