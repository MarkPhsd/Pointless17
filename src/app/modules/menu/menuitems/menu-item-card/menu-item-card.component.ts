import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, OrdersService } from 'src/app/_services';
import { ActivatedRoute,  } from '@angular/router';
import * as _  from "lodash";
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

// https://stackoverflow.com/questions/54687522/best-practice-in-angular-material-to-reuse-component-in-dialog
export interface DialogData {
  id: string;
}

@Component({
  selector: 'app-menu-item-card',
  templateUrl: './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss'],
  providers: [ TruncateTextPipe ]
})
export class MenuItemCardComponent implements OnInit, OnDestroy {

  @Input() id        : number;
  @Input() retail    : number;
  @Input() name      : string;
  @Input() imageUrl  : string;
  @Input() menuItem  : IMenuItem;
  @Input() bucketName: string;
  placeHolderImage   : String = "../assets/images/placeholderimage.png"
  _order             : Subscription;
  order              : IPOSOrder;

  isApp     = false;
  isProduct : boolean;
  isCategory: boolean;
  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
    private awsBucket: AWSBucketService,
    public  route: ActivatedRoute,
    private orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private orderMethodService: OrderMethodsService,
    private platFormService   : PlatformService,
    )
  {
    this.isApp    = this.platFormService.isApp()
  }

  async ngOnInit() {
    this.initSubscriptions();
    if (!this.menuItem) {return }
    this.isProduct = this.getIsNonProduct(this.menuItem)
    this.imageUrl  = this.getItemSrc(this.menuItem)
  };

  get isDiscountItem() {
    const menuItem = this.menuItem;
    if (menuItem && menuItem.itemType && menuItem.itemType.type == 'discounts') {
      return true
    }
    return false;
  }

  getIsNonProduct(menuItem: IMenuItem): boolean {
    if (!menuItem) { return false}
    if (menuItem) {
      if (!menuItem.itemType)   {
        // this.orderMethodService.notifyEvent('This item has no type, please contact administrator.', 'Error')
        return false
      }
      if (menuItem.itemType.useType  === 'adjustment') { return false}
      if (menuItem.itemType.type     === 'adjustment') { return false}
      if (menuItem.itemType.type     === 'discounts') { return false}
      if (menuItem.itemType.type     === 'grouping') {
        this.isCategory = true;
        return false
      }
    }
    return true
  }

  ngOnDestroy(): void {
    if (this._order)  this._order.unsubscribe();
  }

  initSubscriptions() {
    try {
      this._order = this.orderService.currentOrder$.subscribe( data => {
        this.order = data
      })
    } catch (error) {
    }
  }

  getItem(item) {
    if (!item) {return ''}
    item = item.substr(0, 20);
    return item;
  }

  getItemSrc(item:IMenuItem) {
    if (!item.urlImageMain) {
      if (this.isApp) {
        //do text only.
        return
      }
      return;
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
    } else {
      return this.awsBucket.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
    }
  }

  menuItemAction(add: boolean) {
   this.orderMethodService.menuItemAction(this.order,this.menuItem, add)
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
