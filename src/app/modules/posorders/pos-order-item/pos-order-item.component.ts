import { AfterViewInit,OnChanges, Component, ElementRef,  HostListener,
         Input, OnInit, Output, EventEmitter, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPurchaseOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { AWSBucketService, AuthenticationService, MenuService, OrdersService } from 'src/app/_services';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { MenuItemModalComponent } from '../../menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { PosOrderItemEditComponent } from './pos-order-item-edit/pos-order-item-edit.component';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PosOrderItemMethodsService } from 'src/app/_services/transactions/pos-order-item-methods.service';
export interface payload{
  index : number;
  item  : PosOrderItem;
}
@Component({
  selector: 'pos-order-item',
  templateUrl: './pos-order-item.component.html',
  styleUrls: ['./pos-order-item.component.scss'],
  providers: [ TruncateTextPipe ],
})
export class PosOrderItemComponent implements OnInit,OnChanges, AfterViewInit,OnDestroy {

  productNameClass='product-name'
  inputForm: UntypedFormGroup;
  itemEdit: boolean;
  interface = {}
  payload: payload;

  @ViewChild('imageDisplay') imageDisplay: TemplateRef<any>;
  @ViewChild('getWeightView') getWeightView : TemplateRef<any>;

  @Output() outputDelete   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSelectedItem : EventEmitter<any> = new EventEmitter();
  @Input() ui : TransactionUISettings;
  ui$: Observable<TransactionUISettings>;

  @Input() conditionalIndex    : number;
  @Input() purchaseOrderEnabled : boolean;
  @Input() index          = 0;
  @Input() orderItem      : PosOrderItem;
  @Input() order          : IPOSOrder;
  @Input() menuItem       : IMenuItem;
  @Input() mainImage      : string;
  @Input() placeHolderImage = 'productPlaceHolder.jpg';
  @Input() quantity       : number;
  @Input() unitPrice      : number;
  @Input() wholeSale      : number;
  @Input() subTotal       : number;
  @Input() total          : number;
  @Input() printed        : string;
  @Input() onlineShortDescription: string;
  @Input() id             : number;
  @Input() productID      : number;
  @Input() productName    : string;
  @Input() thc            =  50;
  @Input() cbd            =  50;
  @Input() hideAddAnotherOne: number;
  @Input() mainPanel      : boolean;
  @Input() wideBar        = false;
  @Input() disableActions = false;
  @Input() prepScreen     : boolean;
  @Input() enableExitLabel : boolean;
  @Input() displayHistoryInfo: boolean;
  @Input() enableItemReOrder  : boolean = false;
  textNameLength : number = 30;

  @Input() cardWidth: string;
  
  packages: string;
  morebutton               = 'more-button';
  customcard               = 'custom-card'
  orderPromptGroup        : IPromptGroup;
  menuItem$               : Observable<IMenuItem>;
  printLabel$             : Observable<any>;
  isNotInSidePanel        : boolean
  sidePanelWidth          : number
  sidePanelPercentAdjust  : number

  @Input() printLocation : number;
  @Input() prepStatus    : boolean;

  flexGroup                = 'ps-flex-group-start-no-margin'
  animationState          : string;
  color                   : ThemePalette = 'primary';
  mode                    : ProgressSpinnerMode = 'determinate';
  value                   = 50;
  bucketName:             string;
  awsBucketURL:           string;
  itemName   :            string;
  imagePath   :           string;

  @Input() smallDevice           : boolean;

  showEdit              : boolean;
  showView              : boolean;
  promptOption          : boolean;
  @Input() userAuths    : IUserAuth_Properties;

  bottomSheetOpen       : boolean ;
  _bottomSheetOpen      : Subscription;

  assignedPOSItems      : PosOrderItem[];
  _assignedPOSItems      : Subscription;

  basicItem$: Observable<any>;
  gridItems             = 'grid-items'
  // transactionUISettings$ = this.uiSettingService.getSetting('UITransactionSetting');
  productnameClass       = 'product-name'
  isModifier            : boolean;
  isItemKitItem         : boolean;
  imageBaseCCS          = 'image'
  action$: Observable<any>;

  panel  ='string'
  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
  }

  get itemHasDiscount() {
    const item = this.orderItem
    if (item.itemOrderCashDiscount != 0 || item.itemPercentageDiscountValue != 0 || item.itemPercentageDiscountValue != 0 ||
        item.itemOrderPercentageDiscount ) {
          return true;
    }
    return false;
  }

  //&&
  // (!this.orderItem.rewardAvailibleID || this.orderItem.rewardCounterDiscountID ==0)
  get showQuantityEdit() {
    if ((!this.showEdit  && (this.ui.displayQuantity) &&
       !this.orderItem.serialCode && !this.orderItem.printed ) &&
       this.orderItem.rewardGroupApplied == 0) {
      return true;
    }
    return false;
  }

  get showWeight() {
    if (this.order && this.order.balanceRemaining != 0 &&
                      this.orderItem.isWeightedItem &&
                      !this.prepScreen) {
      // console.log('showWeight (2)',this.userAuthService?.isStaff , this.mainPanel , this.orderItem?.printLocation)
      if (this.userAuthService?.isStaff &&  this.mainPanel ) {
        return this.getWeightView
      }
    }
    return null
  }

  getWeight() {
    const item = this.posOrderItemService.scaleInfo;
    if (item) {
      if (item.scaleStatus) {
        // console.log(item.scaleStatus)
      }
    if (+item.value>0) {
      this.orderItem.quantity = +item.value;
      this.orderItem.quantityView = item.value;
      this.action$ = this.saveSub(this.orderItem, 'quantity')
     }
    }
  }


  getEstPackages(orderItem: PosOrderItem ) {
    if  (orderItem.unitMultiplier == 0) { return ''}
    const value =  this.posOrderItemMethodsService.calcPackageNumber(orderItem.quantity, orderItem.unitMultiplier)
    if (value != 0 && value != 1) {
      return  `${value} of `
    }
    return ''
  }

  get allowedVoidClosedItem() {
    if (this.orderItem) {
      if (!this.orderItem.completionDate) {
        return true;
      }
      if (this.userAuths?.disableVoidClosedItem) {
        return false
      }
    }
  }

  getUnitDescription(item: PosOrderItem ): string {

    return ''
    if (!item) { return ''}
    if (item.baseUnitType) {
      // console.log('item.baseUnitType', item?.baseUnitType)
      return item?.unitName }
    if (item.unitName) {
      // console.log('item.unitName', item?.unitName)
      return item?.unitName}
    return ''
    // if (item) {
    //   item?.baseUnitType == '' ? ''  : orderItem?.unitName
    // }

  }

  saveSub(item: PosOrderItem, editField: string): Observable<IPOSOrder> {
    const order$ = this.posOrderItemMethodsService.saveSub(item, 'quantity').pipe(
      switchMap(data => {
        if (!data) {
          return of(null)
        }
        this.orderMethodsService.updateOrder(data)
        return of(data)
      }
    ))
    return order$
  }

  initSubscriptions() {
    this.initAssignedItemSubscriber();
    this.initBottomSheetSubscriber();
  }

  initBottomSheetSubscriber() {
    this._bottomSheetOpen = this.orderMethodsService.bottomSheetOpen$.subscribe(data => {
      this.bottomSheetOpen = data
      this.morebutton = 'more-button'
      if (data) {
        this.mainPanel = data;
        if (this.mainPanel) {
          this.textNameLength = 50;
        }
        this.morebutton = 'more-button-main'
        this.isNotInSidePanel = data;
        this.updateCardStyle(data)
      }
    })
  }

  initAssignedItemSubscriber() {
    //disabled  class style when added button for item functions
    this._assignedPOSItems = this.orderMethodsService.assignedPOSItems$.subscribe( data => {
  
        this.assignedPOSItems = data;
        if ( this.orderMethodsService.isItemAssigned( this.orderItem.id ) ) {
          this.productnameClass = 'product-name-alt'
          return
        } else {
          this.productnameClass = 'product-name'
          return
        }
      }
    )
  }
  initTransactionUISettings() {
    this.ui$ = this.uISettingsService.transactionUISettings$.pipe(switchMap(data => {
        this.ui = data
        return of(data)
      }
    ));
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.assignedPOSItems = null;
    this.orderMethodsService.clearAssignedItems();
    if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
    if (this._assignedPOSItems) { this._assignedPOSItems.unsubscribe()}


  }

  constructor(
                private orderMethodsService: OrderMethodsService,
                private awsBucket          : AWSBucketService,
                private _snackBar          : MatSnackBar,
                private sanitizer          : DomSanitizer,
                public  el:                 ElementRef,
                private router:             Router,
                public  route:              ActivatedRoute,
                private truncateTextPipe   : TruncateTextPipe,
                private siteService        : SitesService,
                private dialog             : MatDialog,
                private menuService        : MenuService,
                public posOrderItemService: POSOrderItemService,
                private posOrderItemMethodsService: PosOrderItemMethodsService,
                private promptGroupservice : PromptGroupService,
                private printingService    : PrintingService,
                public  userAuthService    : UserAuthorizationService,
                private fb                 : UntypedFormBuilder,
                public authenticationService: AuthenticationService,
                public platFormService : PlatformService,
                private orderService: OrdersService,
                private uISettingsService: UISettingsService,
                private requestMessageMethodsService: RequestMessageMethodsService,
              )
  {

  }

  async ngOnInit() {
    this.initSubscriptions();
    this.initTransactionUISettings()
    const site = this.siteService.getAssignedSite();
    this.bucketName   =  await this.awsBucket.awsBucket();
    this.awsBucketURL =  await this.awsBucket.awsBucketURL();
  
    if (this.menuItem) {
      this.itemName   =  this.getItemName(this.menuItem?.name)
      this.imagePath  =  this.getImageUrl(this.menuItem?.urlImageMain)
    }

    if (!this.menuItem) {
      if (this.order?.service?.filterType != 0 ) { return of(null) }
      this.basicItem$ = this.menuService.getItemBasicImage(site, this.orderItem?.productID).pipe(
        switchMap( data => {
          this.imagePath  =  this.getImageUrl(data?.image)
          return of(data)
        })
      )
    }

    const item = this.orderItem;
    this.showEdit = !item.printed && (this.quantity && !item.voidReason) &&  item.promptGroupID != 0 && item.id != item.idRef
    this.showView = this.mainPanel && ( (  item.promptGroupID === 0) || ( item.promptGroupID != 0 && item.id != item.idRef ) )
    this.promptOption = (item.promptGroupID != undefined && item.promptGroupID != 0)
    if (this.mainPanel) {
      this.morebutton = 'more-button-main';
    }
    if (!this.mainPanel) {
      this.morebutton = 'more-button';
    }

    this.updateCardStyle(this.mainPanel)
    this.refreshSidePanel()
    this.packages = this.getEstPackages(this.orderItem).toString()
  }

  get cashDiscount() {
    // console.log(this.ui?.dcapDualPriceValue, this.subTotal , this.subTotal * (1 + +this.ui?.dcapDualPriceValue))
    if (this.ui && this.ui.dcapDualPriceValue && this.ui?.dcapDualPriceValue != 0) {
      return  this.subTotal * (1 + +this.ui?.dcapDualPriceValue)
    }
    return null
  }

  //item.urlImageMain
  //getImageURLPath
  getImageUrl(imageUrl) {
    if (!imageUrl) {
      const image = this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
      return image
    } else {
      const imageName =  imageUrl.split(",")
      const image = this.awsBucket.getImageURLPath(this.bucketName, imageName[0])
      return image
    }
  }

  ngOnChanges() {
    this.packages = this.getEstPackages(this.orderItem).toString()
  }


  requestPriceChange(item) {
    if (this.order && this.userAuthService.user) {
      const item$ = this.requestMessageMethodsService.requestPriceChange(item, this.order, this.userAuthService.user)
      this.action$ =  item$.pipe(switchMap(data => {
        this.siteService.notify("Request Sent", 'close', 2000, 'green')
        return of(data)
      }))
    }
  }

  requestTotalPriceChange(item) {
    if (!this.order || !this.userAuthService.user) { return }
      const item$ =   this.requestMessageMethodsService.requestPriceChange(item, this.order, this.userAuthService.user)
      this.action$ = item$.pipe(switchMap(data => {
        this.siteService.notify("Request Sent", 'close', 2000, 'green')
        return of(data)
      }))

  }

  requestRefundItem(item) {
    if (!this.order || !this.userAuthService.user) { return }
    const item$ =   this.requestMessageMethodsService.requestRefund(item, this.order, this.userAuthService.user)
    this.action$ = item$.pipe(switchMap(data => {
      this.siteService.notify("Request Sent", 'close', 2000, 'green')
      return of(data)
    }))
  }

  requestVoidItem(item) {
    if (!this.order || !this.userAuthService.user) { return }
    const item$ =   this.requestMessageMethodsService.requestVoidItem(item, this.order, this.userAuthService.user)
    this.action$ = item$.pipe(switchMap(data => {
      this.siteService.notify("Request Sent", 'close', 2000, 'green')
      return of(data)
    }))
  }

  initEdit() {
    if (this.purchaseOrderEnabled && !this.itemEdit) {
      this.itemEdit = true;
      try {
        this.inputForm = this.fb.group( this.orderItem )
        this.inputForm.patchValue(this.orderItem)
        this.inputForm.valueChanges.subscribe(item => {
          this.action$ = this.updateValues(item)
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  displayPrintLabel(item) {
    const labelID =  item?.itemType?.labelTypeID
    if (labelID && labelID != 0) {
      return true
    }
  }

  destroyEdit() {
    if ( this.orderMethodsService.isItemAssigned( this.orderItem.id ) ) { return }
    this.itemEdit = false;
    this.inputForm = null;
  }

  updateValues(item: PosOrderItem) {
    const site = this.siteService.getAssignedSite();
    return this.posOrderItemService.changeItemValues(site, item ).pipe(
      switchMap(data => {
        if (data) {
          this.orderMethodsService.updateOrderSubscription(data)
          return of(data)
        }
        return of(null)
      })
    )
 }

  get isDisplayMenuItemOn() {
    if (this.mainPanel) {
      return this.imageDisplay
    }
    return null;
  }

  ngAfterViewInit() {
    this.resizeCheck();
  }

  assignItem() {
    const result = this.orderMethodsService.updateAssignedItems(this.orderItem);
    if (result) {
      this.initEdit()
    }
    if (!result) {
      this.destroyEdit()
    }
  }

  preventUnAssigned() {
    this.orderMethodsService.updateAssignedItems(this.orderItem)
  }

  @HostListener('window:resize', ['$event.target']) onResize()
  {
    this.resizeCheck();
  }

  private resizeCheck(): void {
    this.sidePanelWidth = this.el.nativeElement.offsetWidth;
    if (this.sidePanelWidth == 0) {
      this.sidePanelWidth = this.el.nativeElement.scrollWdith;
    }
    this.refreshSidePanel();
  }

  refundItem(item) {
    let refundAuthorized = false
    if (this.authenticationService.userAuths && this.authenticationService.userAuths.refundItem) {
      refundAuthorized = true
    }
    if (refundAuthorized) {
      this.changeQuantity(-item.quantity)
    } {
      const request =  {request: 'checkAuth' , action:'refundItem'}
      this.authorizeEdit(item, request);
    }
  }

  openModifierNote() {
    this.editProperties('modifierNote', 'Special Instructions')
  }

  editQuantity() {
    this.editProperties('quantity' , 'Change Quantity')
  }

  editPrice() {
    this.editProperties('price' , 'Change Price')
  }

  editSubTotal() {
    this.editProperties('subTotal' , 'Change Sub Total Price')
  }

  editCost() {
    this.editProperties('wholeSale' , 'Change Cost')
  }

  editWholeSaleCost() {
    this.editProperties('wholeSaleCost' , 'Change Total Cost')
  }

  selectItem() {
    if (this.productnameClass != 'product-name-alt') {
      this.productnameClass == 'product-name-alt'
    }
    if (this.productnameClass != 'product-name') {
      this.productnameClass == 'product-name-alt'
    }
  }

  selectAssignedItem(isAssigned: boolean) {
    if (isAssigned) {
      this.productnameClass == 'product-name-alt'
    }
    if (!isAssigned) {
      this.productnameClass == 'product-name-alt'
    }
    // console.log(this.productnameClass )
  }

  editProperties(editField: string, instructions: string) {

    if (!this.orderItem) {return}
    const site = this.siteService.getAssignedSite();

    this.menuService.getMenuItemByID(site, this.orderItem.productID).subscribe(data => {
        this.menuItem = data;

        if (!this.menuItem.itemType) {
          this.notifyEvent('Item type not defined', 'Alert')
          return;
        }

        let width = '455px'
        if (this.smallDevice) { 
          width = ' 100vw'
        }

        let requireWholeNumber = false;
        if (editField == 'quantity') {   requireWholeNumber = this.menuItem.itemType.requireWholeNumber }
        const item = {orderItem: this.orderItem,
                      editField: editField,
                      menuItem: this.menuItem,
                      requireWholeNumber: requireWholeNumber,
                      instructions: instructions}
        let height  = '600px';
       
        if (editField == 'quantity') {
          height  = '600px';
        }

        if (editField == 'modifierNote') {
          height  = '100vh !important';
          width   = '100vw !important'
        }

        if (editField == 'price' || editField == 'subTotal') {
          if (!this.authenticationService.userAuths.changeItemPrice) {
            const request =  {request: 'checkAuth' , action: editField}
            this.authorizeEdit(item, request);
            return;
          }
        }

        this.editDialog(item, width, height)

    })
  }

  checkAuthDialog(item,  request) {
    return  this.orderMethodsService.checkAuthDialog(item,  request)
  }

  authorizeEdit(item, request) {
    let dialogRef = this.checkAuthDialog(item, request)
    dialogRef.afterClosed().subscribe(result => {
      // console.log('recieving determined result is: ', result)
      if (result) {
        this.editDialog(item,'100vw !important','600px')
      } else {
        this.siteService.notify('Not authorized', 'close', 1000, 'red')
      }
    });
  }

  editDialog(item, width, height) {
    let dialogRef: any;

    // if (!this.platFormService.isApp()){
    //   height =  '500px';
    // }
    // console.log(width, height)

    // this.notifyEvent('width', width)
    dialogRef = this.dialog.open(PosOrderItemEditComponent,
      { width     : width,
        maxWidth  : width,
        minWidth  : width,
        height    : height,
        minHeight : height,
        data      : item
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      this.authenticationService.overRideUser(null)
    });

  }

  editSerial() {
    if (this.orderItem) {
      const site = this.siteService.getAssignedSite();
      const item$ = this.posOrderItemService.getPOSOrderItem(site, this.orderItem.id)
      item$.subscribe(
        {
          next: data => {
          this.orderMethodsService.promptSerial(this.menuItem, data.id, true, data.serialCode)
            },
          error: err => {
            console.log('error', err)
          }
        }
      )
    }
  }

  refreshSidePanel() {
    this.gridItems = 'grid-items';
    this.morebutton = 'more-button'

    this.updateFlexGroup();

    if (this.mainPanel) {
      this.gridItems ='grid-items-main-panel'
      this.morebutton = 'more-button-main'
    }

    if (this.mainPanel) {
      // productNameClass
      this.productNameClass = 'product-name  product-name-narrow'
      return;
    } else {
      this.productnameClass = 'product-name product-name-narrow'
    }
    if (this.sidePanelWidth == undefined) { return }
      if (this.sidePanelWidth < 200 || this.mainPanel ) {
        this.isNotInSidePanel = false
        this.sidePanelPercentAdjust = 80
      } else {
        this.isNotInSidePanel = true
        this.sidePanelPercentAdjust = 80
        this.updateCardStyle(true)
      }

      if (this.onlineShortDescription) {
      this.onlineShortDescription =  this.truncateTextPipe.transform(this.onlineShortDescription.replace(/<[^>]+>/g, ''), 200)
    }

  }

  listItem() {
    if (this.menuItem) {
      this.router.navigate(["/menuitem/", {id: this.productID}]);
      return
    } else {
      if (this.productID){
        this.router.navigate(["/menuitem/", {id: this.productID}]);
        return
      }
    }
    if (this.orderItem) {
      this.router.navigate(["/menuitem/", {id: this.orderItem.productID}]);
    }
  }

  cancelItem(index: number, orderItem: PosOrderItem) {
    let payload = {} as payload
    payload.index = index;
    payload.item  = orderItem;
    this.outputDelete.emit(payload)
  }

  async addItemToOrder() {
    if (!this.menuItem) {
      this.notifyEvent(`Feature not yet implemented.`, 'alert')
      return
    }
    this.notifyEvent(`item ${this.menuItem.name}`, 'alert')

    if (this.menuItem) {
      const quantity  =  Number(1)
      this.orderMethodsService.addItemToOrder(this.order, this.menuItem, quantity)
    }
  }

  updateItemQuantity( quantity: number) {
    if (!this.printed){
      if (this.orderItem) {
        const site = this.siteService.getAssignedSite()
        if (!this.orderItem ) {
          this.notifyEvent(`Order Item not found so not changed.` , 'Thank You')
           return
        }

        if (!this.menuItem) {
          this.notifyEvent(`Menu Item not found so not changed.` , 'Thank You')
           return
        }

        let item$ = this.posOrderItemService.changeItemQuantity(site, this.orderItem)
        item$.subscribe(data => {
          if (!data.resultMessage) {
            this.notifyEvent(`The quantity has not been changed. Is the item n inventory item? If so another item must be added on the order.` , 'Thank You')
          }
         }
        )
      }
    }
  }

  removeDiscount() {
    if (this.orderItem) {
      const site = this.siteService.getAssignedSite();
      let item$ = this.posOrderItemService.removeItemDiscount(site, this.orderItem, this.menuItem);
      item$.pipe(
        switchMap(data => {
          this.orderMethodsService.updateOrderSubscription(data);
          return of(data)
      })).pipe(switchMap(data => {
        return this._refreshOrder() //site, this.orderItem.id, false)
      }))
      this.action$ = item$;
    }
  }

  _refreshOrder() {
    const site = this.siteService.getAssignedSite()
    return this.orderService.getOrder(site, this.order.id.toString(), this.order.history).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
  }

  updateFlexGroup() {
    if (this.mainPanel) {
      this.flexGroup = 'ps-flex-group-start-no-margin'
    } else {
      this.flexGroup = 'ps-flex-group-start-no-margin-side'
    }
  }

  updateCardStyle(option: boolean)  {

    this.updateFlexGroup();
    // this.customcard ='custom-card';

    if (this.orderItem && this.orderItem.idRef && this.orderItem.id != this.orderItem.idRef && !this.order.history) {
      this.customcard       = 'custom-card-modifier';

      if (this.prepScreen) {
        this.customcard       = 'custom-card-modifier-prep';
      }

      this.productnameClass = 'productname-modifier'
      this.isModifier       = true;

      this.imageBaseCCS = 'image'
      if (this.isModifier) {
        this.imageBaseCCS = 'image-modifier'
      }
      return
    }

    if (!option) {
      this.customcard ='custom-card-side';
    }

    if (this.prepScreen) {
      this.customcard = 'custom-card-prep';
      if (this.orderItem.idRef != this.orderItem.id) {
        this.customcard = 'custom-card-prep custom-card-modifier-prep';
      }
    }
  }

  openDialog() {
    const item = this.orderItem
    const data = { id: item.productID }
    const dialogRef = this.dialog.open(MenuItemModalComponent,
      { width: '90vw',
        height: '90vh',
        data :  data ,
      },
    )
  }

  increaseByOne(){
    this.changeQuantity(1);
  }

  decreaseByOne() {
    this.changeQuantity(-1)
  }

  changeQuantity(changeValue: number) {
    this.quantity = this.quantity + changeValue;
  }

  sanitize(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getItemName(itemName) {
    return this.truncateTextPipe.transform(itemName.replace(/<[^>]+>/g, ''), 20)
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'bottom'
    });
  }


  buyAgain(menuItem: any) {
    // if (menuItem && menuItem.active && menuItem.webEnabled) {
      this.listItemByID(menuItem.id);
      // this.navigateToItem()
    // } else {
    //   this.siteService.notify('Item not avalible for purchase right now.', 'Close', 5000, 'red')
    // }
  }

  listItemByID(id:number) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  printLabel(item: PosOrderItem) {
    this.printLabel$ = this.printingService.printItemLabel(item, this.menuItem$,
                                                            this.order, false).pipe(switchMap(data => {
                                                              this.orderMethodsService.updateOrder(data)
                                                              return of(data)
                                                           }))
  }

  swipeOutItem(){
    if (this.order.completionDate && (this.userAuths && this.userAuths.disableVoidClosedItem)) {
      this.siteService.notify('Item can not be voided or refunded. You must void the order from Adjustment in Cart View', 'close', 10000, 'red')
      return
    }
    if (this.disableActions) {return}
    this.cancelItem(this.index,  this.orderItem)
  }

  editPrompt() {
    const site = this.siteService.getAssignedSite();
    let item : IPurchaseOrderItem;
    if (this.orderItem) {
      const item$ =  this.posOrderItemService.getPurchaseOrderItem(site, this.orderItem.id)
      item$.pipe(
        switchMap(poitem => {
          item = poitem;
          return this.promptGroupservice.getPrompt(site, item.promptGroupID)
        })).subscribe( prompt =>{
          this.orderMethodsService.openPromptWalkThroughWithItem(prompt, item)
      })
    }
  }
}
