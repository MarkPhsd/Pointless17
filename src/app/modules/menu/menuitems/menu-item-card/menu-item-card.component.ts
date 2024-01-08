import { Component, Input, OnInit, OnDestroy, Output,EventEmitter, ElementRef, ViewChild, TemplateRef} from '@angular/core';
import { IMenuItem, menuButtonJSON }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, AuthenticationService, MenuService, OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router,  } from '@angular/router';
import * as _  from "lodash";
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

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

  @ViewChild('loadMoreButton')  loadMoreButton :  TemplateRef<any> | undefined;
  @ViewChild('editItemView') editItemView :  TemplateRef<any> | undefined;
  @ViewChild('buyItemView') buyItemView :  TemplateRef<any> | undefined;
  @ViewChild('viewItemView') viewItemView: TemplateRef<any> | undefined;

  @Output() outPutLoadMore = new EventEmitter()
  @Output() outPutUpdateCategory = new EventEmitter();
  @Output() addItem = new EventEmitter();
  @Input() allowBuy  : boolean;
  @Input() allowEdit : boolean;
  @Input() id        : number;
  @Input() retail    : number;
  @Input() name      : string;
  @Input() imageUrl  : string;
  @Input() menuItem  : IMenuItem;
  @Input() bucketName: string;
  @Input() class     = 'grid-item'
  @Input() isStaff: boolean;
  @Input() uiHomePage        : UIHomePageSettings;
  @Input() categoryIDSelected: number;
  @Input() displayType      : string ='product';
  @Input() buySell: boolean;
  @Input() promptModifier: boolean;
  containerclass: string = 'container';

  @Output() outputRefresh = new EventEmitter()
  placeHolderImage   : String = "assets/images/placeholderimage.png"
  _order             : Subscription;
  order              : IPOSOrder;
  action$          : Observable<any>;
  buyItem$ : Observable <any>;
  modelSearch: Observable<any>;
  menuButtonJSON   : menuButtonJSON;
  buttonColor = ''
  isApp     = false;
  isProduct : boolean;
  matCardClass = 'mat-card-grid'
  uiSettings$: Observable<any>;
  uiSettings: TransactionUISettings;
  noImage: boolean;


  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
    private awsBucket: AWSBucketService,
    public  route: ActivatedRoute,
    private orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private orderMethodsService: OrderMethodsService,
    public  platFormService   : PlatformService,
    private menuService: MenuService,
    public  authenticationService: AuthenticationService,
    private productEditButtonService: ProductEditButtonService,
    private uiSettingsService: UISettingsService,
    private siteService : SitesService,
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
    if (!this.menuItem.urlImageMain) {
      this.noImage = true
    }
    this.getMenuItemObject(this.menuItem)
    this.initLayout();
    this.uiSettings$ = this.uiSettingsService.transactionUISettings$.pipe(data => {
      return of(data)
    })

    // this.
  };

  get isImageButtonView() {
    if (this.menuItem &&  this.menuItem?.name && this.menuItem?.name.toLowerCase() === 'load more') {
      return this.loadMoreButton
    }
    return undefined
  }

  initLayout() {
    if (this.displayType === 'header-category') {
      this.containerclass = 'header-container'
    }
  }

  getMenuItemObject(menuItem: IMenuItem) {
    if (menuItem && menuItem.json ) {
      const item = JSON.parse(menuItem.json) as menuButtonJSON;
      this.menuButtonJSON = item
      if (this.menuButtonJSON.buttonColor) {
        this.buttonColor = `background-color:${this.menuButtonJSON.buttonColor} `
      }
    }
    if (this.categoryIDSelected != 0 && this.categoryIDSelected == this.id) {
      const box = ''
      this.buttonColor = `background-color: #e1f5fe`
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

  buyItem() {
    if (!this.menuItem) {
      return
    }
    const site = this.siteService.getAssignedSite()
    const item$ = this.menuService.getMenuItemByID(site, this.menuItem.id)
    this.buyItem$ = item$.pipe(switchMap(data => {
        return   this.productEditButtonService.openBuyInventoryItemDialogObs(data,  this.orderMethodsService.order)

      }
    ))
                                                                                ;
  }

  get enableEditItem() {
    if (this.authenticationService.isAdmin || this.allowEdit) {
      if (this.menuItem.id > 0) {
        return this.editItemView
      }
    }
    return null;
  }

  get enableBuyItemView() {
    try {
      if (this.allowBuy ) {
        if (this.menuItem && this.menuItem.itemType && this.menuItem.itemType.useType
            && (this.menuItem.itemType.type.toLowerCase() != 'grouping')
            ) {
          return this.buyItemView
        }
      }
    } catch (error) {
      console.log('error', error)
    }
    return null;
  }

  get enableViewItem() {
    if (this.isApp && this.authenticationService.isAdmin || this.allowEdit && this.isApp) {
      if (this.menuItem.id > 0 && this.menuItem.itemType && this.menuItem.itemType.useType && this.menuItem.itemType.type.toLowerCase() != 'grouping') {
        return this.viewItemView
      }
    }

    const admin = this.authenticationService.isAdmin || this.allowEdit
    if (!this.isApp &&  admin ) {
      if (this.menuItem.id > 0 && this.menuItem.itemType && this.menuItem.itemType.useType && this.menuItem.itemType.type.toLowerCase() != 'grouping') {
        return this.viewItemView
      }
    }
    return null;
  }

  get enableAddItemView() {

    if (!this.isStaff) {
      if (this.menuItem.id > 0 && this.menuItem.itemType && this.menuItem.itemType.useType && this.menuItem.itemType.type.toLowerCase() != 'grouping') {
        return this.buyItemView
      }
    }

    const admin = this.authenticationService.isAdmin || this.allowEdit
    if (!this.isApp &&  admin ) {
      if (this.menuItem.id > 0 && this.menuItem.itemType && this.menuItem.itemType.useType && this.menuItem.itemType.type.toLowerCase() != 'grouping') {
        return this.viewItemView
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

  altMethod(action){

    if (this.promptModifier) {
      this.menuItemActionObs(action)
    }
    if (this.displayType === 'header-category') {
      this.menuItemActionObs(true, false, this.menuItem);
      return
    }

    if (this.isStaff &&  !this.isApp) {
      action = true;
    }

    this.menuItemActionObs(action)
  }

  menuItemActionObs(add : boolean, plusOne?: boolean, menuItem?:  IMenuItem) {
    //options for actions are:
    //load more items
    //add item
    //apply filter to display current category & department assigned.
    //apply filter to display subcategory assigned, department and category.
    //in order to accomplish some of these things, we need the header parameters.
    // console.log('add', add )

    if (this.displayType == 'header-category') {
      if (!menuItem || !menuItem?.id) { return }
      this.outPutUpdateCategory.emit(menuItem.id);
      return;
    }

    if (this.promptModifier) {
      this.addItem.emit(this.menuItem.id);
      return;
    }

    if (this.menuItem?.name.toLowerCase() === 'load more') {
      this.outPutLoadMore.emit('true')
      return ;
    }

    if (this.isCategory) {
      this.listItems(this.menuItem.id, this.menuItem.itemType.id);
      add = false;
      return;
    }

    if (plusOne) { add = true; }
    const action$ = this.orderMethodsService.menuItemActionObs(this.order,this.menuItem, add,
                                              this.orderMethodsService.assignPOSItems);
    this.action$ = action$.pipe(switchMap(data => {
      return of(data)
    }))
  }

  viewItem() {
    if (!this.menuItem || !this.menuItem.id) { return }
    this.orderMethodsService.listItem(this.menuItem.id)
  }

  listItems(id: number, typeID: number) {
    if (!this.menuService.searchModel ) {
      this.menuService.searchModel  = this.menuService.initSearchModel()
    }

    if (this.updateStoreNavigation()) { return  }

    if (this.menuItem?.itemType?.id == 4) {
      this.router.navigate(["/menuitems-infinite/", {categoryID:id, hideSubCategoryItems: false }]);
      // this.outputRefresh.emit(true)
      return;
    }

    if (this.menuItem?.itemType?.id == 5) {
      this.router.navigate(["/menuitems-infinite/", {subCategoryID:id, hideSubCategoryItems: false}]);
      // this.outputRefresh.emit(true)
      return;
    }

    if (this.menuItem?.itemType?.id == 6) {
      this.router.navigate(["/menuitems-infinite/", {departmentID:id}]);
      return;
    }
  }

  updateStoreNavigation() {

    if (!this.uiHomePage.storeNavigation) { return false }

    if (!this.menuService.searchModel ) {
      this.menuService.searchModel  = this.menuService.initSearchModel()
    }

    if (this.menuItem?.itemType?.id == 4) {
      if (this.uiHomePage.storeNavigation) {
        this.menuService.searchModel.categoryID = this.menuItem.id;
        this.menuService.updateSearchModel(this.menuService.searchModel);
        return true;
      }
    }

    if (this.menuItem?.itemType?.id == 5) {
      if (this.uiHomePage.storeNavigation) {
        this.menuService.searchModel.subCategoryID = this.menuItem.id;
        this.menuService.updateSearchModel(this.menuService.searchModel);
        return true;
      }
    }

    if (this.menuItem?.itemType?.id == 6) {
        this.menuService.searchModel.departmentID = this.menuItem.id;
        this.menuService.updateSearchModel(this.menuService.searchModel);
        return true;
    }

    return false;
  }

  initProductSearchModel(id: number, itemTypeID: number): ProductSearchModel {
    let productSearchModel        = {} as ProductSearchModel;
    if (itemTypeID== 6) {
     { productSearchModel.departmentID  = id; }
    }
    if (itemTypeID == 4) {
      { productSearchModel.categoryID = id; }
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
