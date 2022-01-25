import { Component, Input, OnInit } from '@angular/core';
import { IMenuItem,  } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { ITVMenuPriceTiers, TVMenuPriceTierItem } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { NewItem } from 'src/app/_services/transactions/posorder-item-service.service';
import { PriceTiers,PriceTierPrice, } from 'src/app/_interfaces/menu/price-categories';

@Component({
  selector: 'tier-price-line',
  templateUrl: './tier-price-line.component.html',
  styleUrls: ['./tier-price-line.component.scss']
})
export class TierPriceLineComponent {
  @Input() priceTiers: PriceTiers;
  priceTierPrice     : PriceTierPrice;
  @Input() tier : ITVMenuPriceTiers;
  @Input() menuPopup: boolean;
  @Input() menuItem: IMenuItem

  initSubscriptions() {
    this.menuService.currentMeuItem$.subscribe(data => {
      this.menuItem = data;
    })
  }

  constructor(
    private menuService        : MenuService,
    private siteService:         SitesService,
    private orderMethodsService: OrderMethodsService,

  ) {
    if (this.tier) {
      this.initPrices(this.tier);
    }
   }

  initPrices(tier: any) {

  }

  addItem(item: PriceTierPrice) {
    const newItem = {} as NewItem;
    newItem.menuItem
    newItem.menuItem
    if (newItem.menuItem) {
      newItem.menuItem.priceTierID  = this.priceTiers.id
      // this.priceTiers.priceTierPrices
      newItem.weight = +item.flatQuantity;
    }
    const site = this.siteService.getAssignedSite();
    this.orderMethodsService.addItemToOrderWithBarcodePromise(site, newItem)
  }
}
