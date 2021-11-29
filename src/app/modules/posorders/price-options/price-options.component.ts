import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSOrder, IPurchaseOrderItem } from 'src/app/_interfaces';
import { IMenuItem, ProductPrice } from 'src/app/_interfaces/menu/menu-products';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';

export interface Item {
  order: IPOSOrder;
  item: IMenuItem;
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
  newItem : Item;

  prices  : ProductPrice[];
  menuItem: IMenuItem;

  constructor(
    private sitesService             : SitesService,
    private posOrderItemService      : POSOrderItemServiceService,
    private orderService             : OrdersService,
    private orderMethodService       : OrderMethodsService,
    private dialogRef                : MatDialogRef<PriceOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {

      const item = data as Item
      this.newItem = data;

      console.log('data from MenuItem', this.newItem);
      if (this.newItem && this.newItem.item && this.newItem.item.priceCategories) {
      }

      if (this.newItem.item) {
        const menuItem = this.newItem.item;
        if ( menuItem &&  menuItem.priceCategories &&  menuItem.priceCategories.productPrices) {
          this.prices =  menuItem.priceCategories.productPrices;
        }
      }

    }


  async addItemPrice(price: ProductPrice) {
    await this.orderMethodService.addPriceToItem(this.newItem.order, this.newItem.item, price, this.newItem.posItem.quantity, this.newItem.posItem.id)
    this.dialogRef.close(true);
  }

  cancel() {
    this.removeItem();
    this.dialogRef.close(false);
  }

  removeItem(){
    // this.posOrderItemService.removeItem(posItem)
  }

}
