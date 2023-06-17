import { Component, Input, OnInit, OnDestroy, Output,EventEmitter, ElementRef, ViewChild, TemplateRef} from '@angular/core';
import { IMenuItem, menuButtonJSON }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, AuthenticationService, MenuService, OrdersService } from 'src/app/_services';
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
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

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

  
  @ViewChild('imageButton')  imageButton :  TemplateRef<any> | undefined;
  @ViewChild('editItemView') editItemView :  TemplateRef<any>;
  @Output() outPutLoadMore = new EventEmitter()
  @Input() allowEdit : boolean;
  @Input() id        : number;
  @Input() retail    : number;
  @Input() name      : string;
  @Input() imageUrl  : string;
  @Input() menuItem  : IMenuItem;
  @Input() bucketName: string;
  @Input() class     = 'grid-item'
  placeHolderImage   : String = "assets/images/placeholderimage.png"
  _order             : Subscription;
  order              : IPOSOrder;
  action$          : Observable<any>;
  menuButtonJSON   : menuButtonJSON;
  buttonColor = ''
  isApp     = false;
  isProduct : boolean;
  matCardClass = 'mat-card-grid'

  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
    private awsBucket: AWSBucketService,
    public  route: ActivatedRoute,
    private orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private orderMethodsService: OrderMethodsService,
    private platFormService   : PlatformService,
    private menuService: MenuService,
    private authenticationService: AuthenticationService,
    private productEditButtonService: ProductEditButtonService,
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
    this.getMenuItemObject(this.menuItem)
    this.initLayout()
  };

  get isImageButtonView() { 
    if (this.menuItem.name.toLocaleLowerCase() === 'load more') { 
      return this.imageButton
    }
    return undefined
  }

  initLayout() {
    // this.matCardClass = this.class
    // if (this.class === 'row-item') {
    // }
    // if (this.class === 'grid-item') {
    //   this.matCardClass= 'mat-card-grid'
    // }
  }

  getMenuItemObject(menuItem: IMenuItem) {
    if (menuItem && menuItem.json ) {
      const item = JSON.parse(menuItem.json) as menuButtonJSON;
      this.menuButtonJSON = item
      if (this.menuButtonJSON.buttonColor) {
        this.buttonColor = `background-color:${this.menuButtonJSON.buttonColor};`
      }
    }
  }
  get isDiscountItem() {
    const menuItem = this.menuItem;
    if (menuItem && menuItem.itemType && menuItem.itemType.type == 'discounts') {
      return true
    }
    return false;
  }

  editItem() {
    if (!this.menuItem) { return }
    this.action$ = this.productEditButtonService.openProductDialogObs(this.menuItem.id);
  }

  get enableEditItem() {
    if (this.authenticationService.isAdmin || this.allowEdit) {
      if (this.menuItem.id > 0) {
        return this.editItemView
      }
    }
    return null;
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
      this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
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
      if (this.isApp) { return }
      const image = this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
      return image
    } else {
      const imageName =  item.urlImageMain.split(",")
      const image =`${this.bucketName}${imageName[0]}`
      return image
    }
  }

  menuItemAction(add: boolean) {
    if (this.menuItem?.name.toLowerCase() === 'load more') {
      this.outPutLoadMore.emit('true')
      return ;
    }
   this.orderMethodsService.menuItemAction(this.order,this.menuItem, add)
  }

  menuItemActionObs(add : boolean, plusOne?: boolean) {
    if (this.menuItem?.name.toLowerCase() === 'load more') {
      this.outPutLoadMore.emit('true')
      return ;
    }
    if (this.isCategory) {
      this.listItems(this.menuItem.id,this.menuItem.itemType.id);
      add = false;
      return;
    }
    if (this.authenticationService.isCustomer) { add = false; }

    if (plusOne) { add = true; }
    this.action$ = this.orderMethodsService.menuItemActionObs(this.order,this.menuItem, add,
                                                            this.orderMethodsService.assignPOSItems);
  }

  listItems(id: number, typeID: number) {
    if (this.menuService.searchModel) { this.menuService.searchModel = {} as ProductSearchModel}
    if (this.menuItem?.itemType?.id == 4) {
      this.router.navigate(["/menuitems-infinite/", {categoryID: id, hideSubCategoryItems: false }]);
      return;
    }
    if (this.menuItem?.itemType?.id == 5) {
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:id, hideSubCategoryItems: false}]);
      return;
    }
    if (this.menuItem?.itemType?.id == 6) {
      this.router.navigate(["/menuitems-infinite/", {departmentID:id}]);
      return;
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
    this.menuService.updateSearchModel(productSearchModel)
    return productSearchModel;
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
