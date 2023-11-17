import { Component, Input, OnChanges, OnInit,EventEmitter, Output } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { ProductPrice } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'menu-item-extended-prices',
  templateUrl: './menu-item-extended-prices.component.html',
  styleUrls: ['./menu-item-extended-prices.component.scss']
})
export class MenuItemExtendedPricesComponent implements OnInit,OnChanges {

  @Input() quantity : number;
  @Input() menuItem: IMenuItem;
  @Input() isUserStaff: boolean;
  @Output() outPutAddItem = new EventEmitter<any>();
  @Output() outPutSelectPrice = new EventEmitter<any>();

  prices$ : Observable<ProductPrice[]>;
  constructor() { }
  price: ProductPrice;

  ngOnInit(): void {
    if (this.menuPricesEnabled) {
      this.prices$ = of(this.menuItem.priceCategories.productPrices).pipe(switchMap(data => {
        // this.price = data[0];
        return of(data)
      }))
    }
    
  }

  ngOnChanges() {
    // console.log(this.quantity)
    // if (this.menuPricesEnabled) {
    //   this.prices$ = of(this.menuItem.priceCategories.productPrices).pipe(switchMap(data => {
    //     // this.price = data[0];
    //     return of(data)
    //   }))
    // }
  }

  get menuPricesEnabled() {
    const menuItem = this.menuItem;
    if (menuItem?.priceCategories &&
        menuItem?.priceCategories?.productPrices &&
        menuItem?.priceCategories?.productPrices.length>0) {
      return true;
    }
  }

  selectPrice(event) {
    this.outPutSelectPrice.emit(this.price)
  }

  addItemToOrder() {
    this.outPutAddItem.emit(this.price)
  }
}
