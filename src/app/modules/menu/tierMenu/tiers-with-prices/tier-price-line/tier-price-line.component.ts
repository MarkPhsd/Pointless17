import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IMenuItem,  } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { ITVMenuPriceTiers } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { NewItem } from 'src/app/_services/transactions/posorder-item-service.service';
import { PriceTiers,PriceTierPrice, } from 'src/app/_interfaces/menu/price-categories';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tier-price-line',
  templateUrl: './tier-price-line.component.html',
  styleUrls: ['./tier-price-line.component.scss']
})
export class TierPriceLineComponent  implements OnDestroy{

  @Output() outputNewItem = new EventEmitter();
  @Input() priceTiers: PriceTiers;
  priceTierPrice     : PriceTierPrice;
  @Input() tier : ITVMenuPriceTiers;
  @Input() menuPopup: boolean;
  @Input() menuItem: IMenuItem
  _menuService: Subscription;

  initSubscriptions() {
    this._menuService =  this.menuService.currentMeuItem$.subscribe(data => {
      if (data) {
        this.menuItem = data;
      }
    })
  }

  constructor(
    private menuService        : MenuService,
    private _snackBar          : MatSnackBar,
    private siteService:         SitesService,
    private userAuthorization : UserAuthorizationService,
    private orderMethodsService: OrderMethodsService,

  ) {
    this.initSubscriptions();
  }
  
  ngOnDestroy(): void {
      if(this._menuService) { this._menuService.unsubscribe()}
  }

  validateUser() {
    const valid =   this.userAuthorization.validateUser();
    if (!valid) {
      this.notifyEvent('Please login or register to place orders.', 'Alert')
    }
    return valid
  }

  addItem(item: PriceTierPrice) {

    const valid = this.validateUser();

    if (!valid) { return }

    const newItem = {} as NewItem;

    if (this.menuItem) {
      newItem.menuItem = this.menuItem
      if (newItem.menuItem) {
        newItem.menuItem.priceTierID  = this.priceTiers.id
        newItem.weight = +item.flatQuantity;
        newItem.quantity = 1
        this.outputNewItem.emit(newItem)
        return
      }
    }



    if (this.menuItem) {
      this.notifyEvent('Item not added', 'error')
    }

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }



}
