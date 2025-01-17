
import { AfterViewInit,OnChanges, Component, ElementRef,  HostListener,
         Input, OnInit, Output, EventEmitter, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { LegacyProgressSpinnerMode as ProgressSpinnerMode } from '@angular/material/legacy-progress-spinner';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of, Subscription, switchMap } from 'rxjs';
import { IProduct, IPurchaseOrderItem } from 'src/app/_interfaces';
import { IMenuItem, ItemType } from 'src/app/_interfaces/menu/menu-products';
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
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ValueFieldsComponent } from '../../admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { IonicModule } from '@ionic/angular';
export interface payload{
  index : number;
  item  : PosOrderItem;
}
@Component({
  selector: 'pos-order-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  ValueFieldsComponent,IonicModule,
  SharedPipesModule],
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
  @ViewChild('buyAgain') buyAgain: TemplateRef<any>;

  @Output() outputDelete   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSelectedItem : EventEmitter<any> = new EventEmitter();
  @Input() ui : TransactionUISettings;
  ui$: Observable<TransactionUISettings>;

  @Input() conditionalIndex    : number;
  @Input() purchaseOrderEnabled : boolean;
  @Input() index          = 0;
  @Input() orderItem      : PosOrderItem;
  // @Input() order          : IPOSOrder;
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
  @Input() deliveryPrep   : boolean;
  @Input() prepScreen     : boolean = false;
  @Input() enableExitLabel : boolean;
  @Input() displayHistoryInfo: boolean;
  @Input() enableItemReOrder  : boolean = false;
  @Input() isStaff: boolean;
  @Input() orderServiceType: string;

  textNameLength : number = 30;

  @Input() cardWidth: string;

  packages: string;
  morebutton               = 'more-button';
  customcard               = 'custom-card'
  orderPromptGroup        : IPromptGroup;
  menuItem$               : Observable<IMenuItem>;
  reOrderMenuItem$        : Observable<IMenuItem>;
  reOrderMenuItem: IMenuItem;
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

  bottomSheetOpen       : boolean = false;
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


  itemTypeFontColor = ' '
  panel  ='string'
  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
  }

  get printLocationEnabled() {
    if ( (
      (this.orderItem.idRef == 0 || this.orderItem?.id == this.orderItem.idRef) &&
      this.orderItem?.printLocation && this.orderItem?.printLocation!= 0)) {
        return true
      }
      return false
  }

  get _unitprice() {
    if (this.orderItem?.completionDate) {
      if (this.cashDiscount !=0) {
        return (this.unitPrice * (1 + this.ui?.dcapDualPriceValue)).toFixed(2)
      }
    }
    return this.unitPrice
  }

  get itemHasDiscount() {
    const item = this.orderItem
    if (item.itemOrderCashDiscount != 0 || item.itemPercentageDiscountValue != 0 ||
         item.itemPercentageDiscountValue != 0 ||
        item.itemOrderPercentageDiscount ) {
          return true;
    }
    return false;
  }

  getReOrderMenuItem() {

    if (this.enableItemReOrder) {

    } else {
      const order = this.orderMethodsService.currentOrder;
      if (!order) {
        if (!this.userAuths?.enablebuyAgain) {
          if (!this.authenticationService.isUser) { return }
        }
      }
    }
  }


  get itemPrintable() {
    if (this.menuItem.itemType.labelRequired) {

    }
    return false;
  }


  get enableItemDiscount() {
    if (this.userAuths && this.userAuths?.enableItemDiscount) {
      return true
    }
    return false
  }

  //&&
  // (!this.orderItem.rewardAvailibleID || this.orderItem.rewardCounterDiscountID ==0)
  get showQuantityEdit() {
    if ((!this.showEdit  && (this.ui?.displayQuantity) &&
       !this.orderItem.serialCode && !this.orderItem?.printed ) &&
       this.orderItem.rewardGroupApplied == 0) {
      return true;
    }
    return false;
  }

  get showWeight() {
    const order = this.orderMethodsService.currentOrder
    if (order &&  order.balanceRemaining != 0 &&
                      this.orderItem?.isWeightedItem &&
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

  get canReOrder() {
    if (this.enableItemReOrder) {
      return true
    }
    if (this.orderItem.completionDate) {
      return true
    }
    if (!this.prepScreen && this.disableActions) {
      return true
    }
  }

  get buyAgainViewUser() {
    if (this.canReOrder && !this.userAuthService.isStaff) {
      this.getReOrderMenuItem()
      return this.buyAgain
    }
    return null;
  }

  get buyAgainViewStaff() {
    if (this.canReOrder && this.userAuthService.isStaff) {
      this.getReOrderMenuItem()
      return this.buyAgain
    }
    return null;
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
                private itemTypeService    : ItemTypeService,
                public  posOrderItemService: POSOrderItemService,
                private posOrderItemMethodsService: PosOrderItemMethodsService,
                private promptGroupservice : PromptGroupService,
                private printingService    : PrintingService,
                public  userAuthService    : UserAuthorizationService,
                private fb                 : UntypedFormBuilder,
                public  authenticationService: AuthenticationService,
                public  platFormService : PlatformService,
                private orderService: OrdersService,
                private uISettingsService: UISettingsService,
                private productButtonService: ProductEditButtonService,
                private requestMessageMethodsService: RequestMessageMethodsService,
              )
  {

  }

  async ngOnInit() {
    // console.log('prepScreen ', this.orderItem?.prodModifierType, this.prepScreen)
    this.initSubscriptions();
    this.initTransactionUISettings()
    const site = this.siteService.getAssignedSite();
    this.bucketName   =  await this.awsBucket.awsBucket();
    this.awsBucketURL =  await this.awsBucket.awsBucketURL();

    if (this.menuItem) {
      this.itemName   =  this.getItemName(this.menuItem?.name)
      this.imagePath  =  this.getImageUrl(this.menuItem?.urlImageMain)
    }

    this.refreshItemType();

    if (!this.menuItem) {
      const order = this.orderMethodsService.currentOrder;
      if (order?.service?.filterType != 0 ) { return of(null) }
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
    this.packages = this.getEstPackages(this.orderItem).toString();

    this.getReOrderMenuItem()

    this.updateItemsPerPage()
  }

  refreshItemType() {
  if (this.prepScreen) {

      if ( this.orderItem.prodModifierType) {
        const item =  this.itemTypeService.getItemTypeFromList( this.orderItem.prodModifierType) as unknown as ItemType
        if (!this.orderItem.menuItem) { this.orderItem.menuItem = {} as IMenuItem}
        if (!this.menuItem) { this.menuItem = { } as IMenuItem}
        this.menuItem.itemType = item
        this.orderItem.menuItem.itemType = item;
        if ( item?.itemRowColor) {
          this.itemTypeFontColor = `color: ${item?.itemRowColor}`
        }
      }
    }
  }

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  get cashDiscount() {
    // console.log(this.ui?.dcapDualPriceValue, this.subTotal , this.subTotal * (1 + +this.ui?.dcapDualPriceValue))
    if (this.ui && this.ui.dcapDualPriceValue && this.ui?.dcapDualPriceValue != 0) {
      return this.roundToPrecision(this.total * (1 + +this.ui?.dcapDualPriceValue),5)
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
    const order = this.orderMethodsService.order
    if (order && this.userAuthService.user) {
      const item$ = this.requestMessageMethodsService.requestPriceChange(item, order, this.userAuthService.user)
      this.action$ =  item$.pipe(switchMap(data => {
        this.siteService.notify("Request Sent", 'close', 2000, 'green')
        return of(data)
      }))
    }
  }

  requestTotalPriceChange(item) {
    const order = this.orderMethodsService.order
    if (!order || !this.userAuthService.user) { return }
      const item$ =   this.requestMessageMethodsService.requestPriceChange(item, order, this.userAuthService.user)
      this.action$ = item$.pipe(switchMap(data => {
        this.siteService.notify("Request Sent", 'close', 2000, 'green')
        return of(data)
      }))

  }

  requestRefundItem(item) {
    const order = this.orderMethodsService.order
    if (!order || !this.userAuthService.user) { return }
    const item$ =   this.requestMessageMethodsService.requestRefund(item, order, this.userAuthService.user)
    this.action$ = item$.pipe(switchMap(data => {
      this.siteService.notify("Request Sent", 'close', 2000, 'green')
      return of(data)
    }))
  }

  requestVoidItem(item) {
    const order = this.orderMethodsService.order
    if (!order || !this.userAuthService.user) { return }
    const item$ =   this.requestMessageMethodsService.requestVoidItem(item, order, this.userAuthService.user)
    this.action$ = item$.pipe(switchMap(data => {
      this.siteService.notify("Request Sent", 'close', 2000, 'green')
      return of(data)
    }))
  }

  initEdit() {
    console.log('initEdit', this.purchaseOrderEnabled, this.itemEdit)

    // this.itemEdit = !this.itemEdit;

    if ((this.purchaseOrderEnabled && !this.itemEdit) || !this.isStaff) {
      console.log('pre init form')
      this.itemEdit = true;
      try {
        this.inputForm = this.fb.group( this.orderItem )
        // this.inputForm = this.fb.group({
        //   quantity:[],
        //   unitPrice: [],
        //   wholeSale: [],
        //   modifierNote: [],
        //   serialCode: [],
        // } )


        this.inputForm.patchValue(this.orderItem)
        console.log('inputForm', this.inputForm.value)
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
    if (!this.isStaff) {return}
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
    console.log('result', result)
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
    if (this.authenticationService?.userAuths && this.authenticationService?.userAuths?.refundItem) {
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

  editItemDiscount() {
    this.editProperties('itemPerDiscount' , 'Item % Discount')
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

        if (this.smallDevice ) {
          width = '100vw !important'
        }

        let requireWholeNumber = false;
        if (editField == 'quantity') {   requireWholeNumber = this.menuItem.itemType.requireWholeNumber }
        if (editField == 'itemPerDiscount') {   requireWholeNumber = true; }

        const item = {orderItem: this.orderItem,
                      editField: editField,
                      menuItem: this.menuItem,
                      requireWholeNumber: requireWholeNumber,
                      instructions: instructions}

        // console.log(item, editField, requireWholeNumber)
        let height  = '600px';

        if (editField == 'quantity') {
          height  = '600px';
        }

        if (editField == 'modifierNote') {
          height  = '100vh !important';
          width   = '100vw !important'
        }

        if (editField == 'itemPerDiscount' || editField == 'price' || editField == 'subTotal') {
          if (!this.authenticationService?.userAuths?.changeItemPrice) {
            const request =  {request: 'checkAuth' , action: editField}
            this.authorizeEdit(item, request,  width, height);
            return;
          }
        }

        this.editDialog(item, width, height)

    })
  }

  checkAuthDialog(item,  request) {
    return  this.orderMethodsService.checkAuthDialog(item,  request)
  }

  authorizeEdit(item, request, width?: string, height?: string) {
    let dialogRef = this.checkAuthDialog(item, request)
    dialogRef.afterClosed().subscribe(result => {

      let sWidth = width;
      let sHeight = height;
      if (!sWidth) {
        sWidth = width
        sHeight = height;
      } else {
        sWidth ='100vw !important'
        sHeight = '600px';
      }
      if (result) {
        this.editDialog(item, sWidth, sHeight)
      } else {
        this.siteService.notify('Not authorized', 'close', 1000, 'red')
      }
    });
  }

  editDialog(item, width, height) {
    let dialogRef: any;

    if (this.smallDevice) {
      width = '100vw !important'
    }

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
    console.log('cancel item')
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
      const order = this.orderMethodsService.currentOrder;
      this.orderMethodsService.addItemToOrder(order, this.menuItem, quantity)
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
      this.action$ = this.posOrderItemService.removeItemDiscount(site, this.orderItem, this.menuItem).pipe(
        switchMap(data => {
          return this._refreshOrder() //
      }))
    }
  }

  _refreshOrder() {
    const site = this.siteService.getAssignedSite()
    const order = this.orderMethodsService.currentOrder;
    return this.orderService.getOrder(site, order.id.toString(), order.history).pipe(switchMap(data => {
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

  get cardStyle() {
    if (this.orderItem) {
      if (this.orderItem.color) {
        return `background-color:${this.orderItem.color}`
      }
    }
    return ''
  }

  updateCardStyle(option: boolean)  {

    this.updateFlexGroup();
    // this.customcard ='custom-card';

    const order = this.orderMethodsService.currentOrder;
    if (this.orderItem && this.orderItem?.idRef && this.orderItem?.id != this.orderItem?.idRef && !order?.history) {
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


  buyAgainClick(menuItem: any) {
    // this.listItemByID(menuItem.id);
    if (!this.orderItem.productID) { return }
    const site = this.siteService.getAssignedSite()
    this.action$ = this.menuService.getMenuProduct(site,  this.orderItem.productID)
    .pipe(switchMap(data => {
      return of(data)
    })).pipe(switchMap(data => {

      let       pass = true
      if (!data.active) {
        this.notifyEvent('Sorry! Item is not avalible at this time.', 'close')
        pass = false
      }
      if (data.webEnabled) {
        if (this.userAuthService.isUser) {
          this.notifyEvent('Sorry! Item is not avalible at this time.', 'close')
          pass = false
        }
      }
      // console.log('data', data)
      if (!pass) { return of('')}
      return this.orderMethodsService.menuItemActionObs(this.orderMethodsService.currentOrder, data, true,
                                                        this.orderMethodsService.assignPOSItems);
    }));

  }
  listItemByID(id:number) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  printLabel(item: PosOrderItem) {
    const order = this.orderMethodsService.currentOrder;
    this.printLabel$ = this.printingService.printItemLabel(item, this.menuItem$,
                                                              order, false).pipe(switchMap(data => {
                                                              this.orderMethodsService.updateOrder(data)
                                                              return of(data)
                                                           }))
  }

  editCatalogItem() {
    this.orderItem.menuItem;
    const site = this.siteService.getAssignedSite()
    let id = 0;
    if (this.orderItem?.menuItem?.id) {
      id = this.orderItem?.menuItem?.id;
    }
    if (this.menuItem?.id) {
      id = this.menuItem?.id
    }
    if (this.orderItem.productID) {
      id = this.orderItem?.productID
    }
    console.log('id', id)
    if (id == 0) { return }
    const product$  =   this.menuService.getProduct(site, id)
    const item$ = this.itemTypeService.getItemType(site, this.orderItem.menuItem?.itemType?.id);

    this.productButtonService._openProductEditorOBS( product$, item$ ).subscribe(data =>{})
  }

  swipeOutItem(){
    const order = this.orderMethodsService.currentOrder;
    if (order.completionDate && (this.userAuths && this.userAuths?.disableVoidClosedItem)) {
      this.siteService.notify('Item can not be voided or refunded. You must void the order from Adjustment in Cart View', 'close', 10000, 'red')
      return
    }
    console.log('cancel item', this.disableActions)
    const currentUrl = this.router.url.split('?')[0].split('/').pop();
    // console.log('currentUrl', currentUrl)
    if (currentUrl == 'qr-receipt') {
      this.cancelItem(this.index,  this.orderItem)
      return;
    }
    if (currentUrl == 'qr-table') {
      this.cancelItem(this.index,  this.orderItem)
      return;
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
