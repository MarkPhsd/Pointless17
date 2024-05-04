import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable, of, startWith, switchMap } from 'rxjs';
import { IPOSOrder, IPurchaseOrderItem, ProductPrice } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
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
  price   : ProductPrice;
  action$ : Observable<any>;

  constructor(
    private orderMethodService       : OrderMethodsService,
    private posOrderItemService: POSOrderItemService,
    private dialogRef                : MatDialogRef<PriceOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {

      const item = data as Item
      this.newItem = data;

      if (this.newItem && this.newItem.item && this.newItem.item.priceCategories) {
      }

      if (this.newItem.item) {
        const menuItem = this.newItem.item;
        if ( menuItem &&  menuItem.priceCategories &&  menuItem.priceCategories.productPrices) {
          this.prices =  menuItem.priceCategories.productPrices;
        }
      }
  }

  addItemPrice(price: ProductPrice) {
    const item$ = this.orderMethodService.addPriceToItem(this.newItem.order, this.newItem.item,
                                                          price, this.newItem.posItem.quantity,
                                                          this.newItem.posItem.id)

    this.action$ = item$.pipe(
      switchMap( data => {
        this.dialogRef.close({posItem: data.posItem, result: true});
        return of(null)
    }))

  }

  cancel() {
    this.removeItem();
    this.dialogRef.close({posItem: {id: 0}, result: false});
  }

  removeItem(){

  }

}
