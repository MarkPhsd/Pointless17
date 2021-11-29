import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSOrder, IPurchaseOrderItem } from 'src/app/_interfaces';
import { IMenuItem, ProductPrice } from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';

export interface Item {
  order: IPOSOrder;
  menuItem: IMenuItem;
  posItem: IPurchaseOrderItem;
}

@Component({
  selector: 'app-price-options',
  templateUrl: './price-options.component.html',
  styleUrls: ['./price-options.component.scss']
})
export class PriceOptionsComponent  {

  //prices
  //  const  newItem = {order: order, item: item, posItem: posItem}
  newItem: any;
  prices: ProductPrice[];
  menuItem: IMenuItem;

  constructor(
    private sitesService             : SitesService,
    private posOrderItemService      : POSOrderItemServiceService,
    private orderService             : OrdersService,
    private dialogRef                : MatDialogRef<PriceOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
      console.log(data)
      const item = data as Item

      if (item) {
        if (item.menuItem && item.menuItem.priceCategories && item.menuItem.priceCategories.productPrices) {
          this.prices = item.menuItem.priceCategories.productPrices;
        }
      }

      // this.menuItem = item.menuItem;
    }


  addItemPrice(item: any) {

  }

  cancel() {
    this.removeItem();
    this.dialogRef.close();
  }

  removeItem(){
    // this.posOrderItemService.removeItem(posItem)
  }

}
