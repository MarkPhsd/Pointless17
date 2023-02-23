import { Component, Input, OnInit, OnDestroy, Output,EventEmitter} from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router,  } from '@angular/router';
import * as _  from "lodash";
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { Observable, Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuItem } from 'electron';


// https://stackoverflow.com/questions/54687522/best-practice-in-angular-material-to-reuse-component-in-dialog
export interface DialogData {
  id: string;
}

@Component({
  selector: 'app-menu-item-card',
  templateUrl:  './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss'],
  providers: [ TruncateTextPipe ]
})
export class MenuItemCardComponent implements OnInit, OnDestroy {

  @Output() outPutLoadMore = new EventEmitter()
  @Input() id        : number;
  @Input() retail    : number;
  @Input() name      : string;
  @Input() imageUrl  : string;
  @Input() menuItem  : IMenuItem;
  @Input() bucketName: string;
  placeHolderImage   : String = "assets/images/placeholderimage.png"
  _order             : Subscription;
  order              : IPOSOrder;

  action$          : Observable<any>;

  isApp     = false;
  isProduct : boolean;

  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
    private awsBucket: AWSBucketService,
    public  route: ActivatedRoute,
    private orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private orderMethodService: OrderMethodsService,
    private platFormService   : PlatformService,
    private menuService: MenuService,
    private router: Router,
    )
  {
    this.isApp    = this.platFormService.isApp()
  }

 ngOnInit() {
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
        return false
      }

      if (menuItem.itemType.useType && menuItem.itemType.useType.toLowerCase()  === 'adjustment') { return false}
      if (menuItem.itemType.type && menuItem.itemType.type.toLowerCase()     === 'adjustment') { return false}
      if (menuItem.itemType.type && menuItem.itemType.type.toLowerCase()     === 'discounts') { return false}
      if (menuItem.itemType.type && menuItem.itemType.type.toLowerCase()     === 'grouping') {
        return false;
      }
    }
    return true
  }

  get isCategory(): boolean {
    const menuItem = this.menuItem;
    if (menuItem) {
        if (menuItem.itemType && menuItem.itemType.type)   {
          if (menuItem?.itemType?.type.toLowerCase()  === 'grouping') {
            return true;
        }
      }
    }
    return false;
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
    if (this.menuItem?.name.toLowerCase() === 'load more') {
      this.outPutLoadMore.emit('true')
      return ;
    }
    // console.log('add', add)
   this.orderMethodService.menuItemAction(this.order,this.menuItem, add)
  }

  menuItemActionObs(add : boolean) {

    if (this.menuItem?.name.toLowerCase() === 'load more') {
      this.outPutLoadMore.emit('true')
      return ;
    }

    if (this.isCategory) {
      this.listItems(this.menuItem.id,this.menuItem.itemType.id);
      add = false;
      return;
    }

    // console.log(add)
    this.action$ = this.orderMethodService.menuItemActionObs(this.order,this.menuItem, add,
                                            this.orderMethodService.assignPOSItems)

  }

  listItems(id: number, typeID: number) {
    console.log('init search Model')
    // this.initProductSearchModel(id, typeID)
    if (this.menuItem?.itemType?.id == 4) {
      this.router.navigate(["/menuitems-infinite/", {categoryID: id }]);
    }
    if (this.menuItem?.itemType?.id == 5) {
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:id}]);
    }
    if (this.menuItem?.itemType?.id == 6) {
      this.router.navigate(["/menuitems-infinite/", {departmentID:id}]);
    }
  }

  initProductSearchModel(id: number, itemTypeID: number): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;

    if (itemTypeID== 6) {
     { productSearchModel.departmentID  = id.toString(); }
    }

    if (itemTypeID == 4) {
      { productSearchModel.categoryID  = id.toString(); }
    }

    productSearchModel.pageSize   = 25
    productSearchModel.pageNumber = 1
    this.menuService.updateMeunuItemData(productSearchModel)
    return productSearchModel;

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
