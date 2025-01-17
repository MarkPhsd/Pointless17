import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit,OnDestroy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';

import { ActivatedRoute } from '@angular/router';
import { Subscription,Observable, of } from 'rxjs';
import { IPOSOrder,  ProductPrice } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatToggleSelectorComponent } from 'src/app/shared/widgets/mat-toggle-selector/mat-toggle-selector.component';

@Component({
  selector: 'app-menu-price-selection',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MatToggleSelectorComponent
  ],
  templateUrl: './menu-price-selection.component.html',
  styleUrls: ['./menu-price-selection.component.scss']
})
export class MenuPriceSelectionComponent  implements OnInit, OnDestroy {

  private _order    : Subscription
  private order     : IPOSOrder;
  public  menuItem  : IMenuItem;
  private id        : string;

  list$                   : Observable<ProductPrice[]>;
  list                    : ProductPrice[];
  productPrice            : ProductPrice;

  constructor(
          public  route: ActivatedRoute,
          private siteService: SitesService,
          private orderService: OrdersService,
          private orderMethodsService: OrderMethodsService,
          @Inject(MAT_DIALOG_DATA) public data: any,
          )
  {
    if (data) {
      const site = this.siteService.getAssignedSite();
      this.menuItem = data
      if (data && data.priceCategories && data.priceCategories.productPrices) {
        this.list  = this.menuItem.priceCategories.productPrices;
        this.list$ = of(this.list)
      }
    }
  }

  ngOnInit() {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    if (this._order) { this._order.unsubscribe()}
  }

  async selectItem(item) {
    //item is productPrice
    if (item) {
      const site = this.siteService.getAssignedSite();
    }
  }

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe(data=> {
      this.order = data;
    })
  }

  async updateSubscription() {
    //update the order service.
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      const orderID = this.order.id
      const order = await this.orderService.getOrder(site, orderID.toString(), false).pipe().toPromise();
      this.orderMethodsService.updateOrderSubscription(order)
    }
  }

  notifyEvent(message: string, title: string) {
    this.siteService.notify(message,title, 2000)
  }
}
