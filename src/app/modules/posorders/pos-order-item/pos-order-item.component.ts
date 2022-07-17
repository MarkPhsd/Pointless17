import { AfterViewInit, Component, ElementRef,  HostListener,
         Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, switchMap } from 'rxjs';
import { IPurchaseOrderItem } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { MenuItemModalComponent } from '../../menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { PosOrderItemEditComponent } from './pos-order-item-edit/pos-order-item-edit.component';

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
export class PosOrderItemComponent implements OnInit, AfterViewInit,OnDestroy {

  interface = {}
  payload: payload;
  // @HostBinding('@pageAnimations') //messes with refreshing.
  @Output() outputDelete   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSelectedItem : EventEmitter<any> = new EventEmitter();
  @Input() uiConfig : TransactionUISettings
    // @ViewChild('panel') element: ElementRef
  @Input() index          = 0;
  @Input() orderItem      : PosOrderItem;
  @Input() order          : IPOSOrder;
  @Input() menuItem       : IMenuItem;
  @Input() mainImage      : string;
  @Input() placeHolderImage = 'productPlaceHolder.jpg';
  @Input() quantity       : number;
  @Input() unitPrice      : number;
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
  @Input() prepScreen: string;

  customcard               ='custom-card'
  orderPromptGroup        : IPromptGroup;
  menuItem$               : Observable<IMenuItem>;
  isNotInSidePanel        : boolean
  sidePanelWidth          : number
  sidePanelPercentAdjust  : number

  @Input() printLocation : number;
  @Input() prepStatus    : boolean;

  animationState          : string;
  color                   : ThemePalette = 'primary';
  mode                    : ProgressSpinnerMode = 'determinate';
  value                   = 50;
  bucketName:             string;
  awsBucketURL:           string;
  itemName   :            string;
  imagePath   :           string;

  smallDevice           : boolean;

  showEdit              : boolean;
  showView              : boolean;
  promptOption          : boolean;

  bottomSheetOpen       : boolean ;
  _bottomSheetOpen      : Subscription;

  assignedPOSItem       : PosOrderItem;
  _assignedPOSItem      : Subscription;

  // transactionUISettings$ = this.uiSettingService.getSetting('UITransactionSetting');
  productnameClass       = 'product-name'

  isModifier: boolean;
  isItemKitItem: boolean;

  panel  ='string'
  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
  }

  initSubscriptions() {

    this._bottomSheetOpen = this.orderService.bottomSheetOpen$.subscribe(data => {
      this.bottomSheetOpen = data
      if (data) {
        this.mainPanel = data;
        this.isNotInSidePanel = data;
        this.updateCardStyle(data)
      }
    })

    //disabled  class style when added button for item functions
    this._assignedPOSItem = this.orderMethodsService.assignedPOSItem$.subscribe( data => {
      this.assignedPOSItem = data;
      // this.productnameClass = 'product-name'
      if (data) {
        if (data.id == this.orderItem.id) {
          // this.productnameClass = 'product-name-alt'
        }
        if (data.id != this.orderItem.id) {
          // this.productnameClass = 'product-name'
        }
      }
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._bottomSheetOpen) { this._bottomSheetOpen.unsubscribe()}
    if (this._assignedPOSItem) { this._assignedPOSItem.unsubscribe()}

  }

  constructor(  private orderService: OrdersService,
                private orderMethodsService: OrderMethodsService,
                private awsBucket          : AWSBucketService,
                private _snackBar          : MatSnackBar,
                private sanitizer          : DomSanitizer,
                public  el:            ElementRef,
                private router:       Router,
                public  route:         ActivatedRoute,
                private truncateTextPipe   : TruncateTextPipe,
                private siteService        : SitesService,
                private dialog             : MatDialog,
                private menuService        : MenuService,
                private posOrderItemService: POSOrderItemServiceService,
                private promptGroupservice : PromptGroupService,
                private printingService    : PrintingService,
                public  userAuthService    : UserAuthorizationService,
              )
  {
  }

  async ngOnInit() {

    this.initSubscriptions();
    const site = this.siteService.getAssignedSite();
    this.bucketName   =  await this.awsBucket.awsBucket();
    this.awsBucketURL =  await this.awsBucket.awsBucketURL();

    if (this.orderItem) {
      this.menuItem$  = this.menuService.getMenuItemByID(site, this.orderItem.productID)
    }

    if (this.menuItem) {
      this.itemName   =  this.getItemName(this.menuItem.name)
      this.imagePath  =  this.getItemSrc(this.menuItem)
    }
    if (this.orderItem && this.orderItem.id != this.orderItem.idRef )  {

    }
    const item = this.orderItem;
    this.showEdit = !item.printed && (this.quantity && !item.voidReason) &&  item.promptGroupID != 0 && item.id != item.idRef
    this.showView = this.mainPanel && ( (  item.promptGroupID === 0) || ( item.promptGroupID != 0 && item.id != item.idRef ) )
    this.promptOption = (item.promptGroupID != undefined && item.promptGroupID != 0)

    this.updateCardStyle(this.mainPanel)
  }

  ngAfterViewInit() {
    this.resizeCheck();
  }

  assignItem() {
    if (this.orderItem && this.assignedPOSItem) {
      if (this.orderItem.id && this.assignedPOSItem.id) {
        if (this.orderItem.id == this.assignedPOSItem.id) {
          // console.log('this is the same item so clear')
          this.orderMethodsService.updateAssignedItem(null)
          return
        }
      }
    }
    this.orderMethodsService.updateAssignedItem(this.orderItem)
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

  openModifierNote() {
    this.editProperties('modifierNote', 'Special Instructions')
  }

  editQuantity() {
    this.editProperties('quantity' , 'Change Quantity')
  }

  editPrice() {
    this.editProperties('price' , 'Change Price')
  }

  selectItem() {
    if (this.productnameClass != 'product-name-alt') {
      this.productnameClass == 'product-name-alt'
    }
    if (this.productnameClass != 'product-name') {
      this.productnameClass == 'product-name-alt'
    }
    // this.orderMethodsService.updateAssignedItem(this.orderItem)
  }

  editProperties(editField: string, instructions: string) {
    let dialogRef: any;
    if (!this.orderItem) {return}

    const site = this.siteService.getAssignedSite();

    this.menuService.getMenuItemByID(site, this.orderItem.productID).subscribe(data => {
        this.menuItem = data;
        if (!this.menuItem.itemType) {
          this.notifyEvent('Item type not defined', 'Alert')
          return;
        }

        let requireWholeNumber = false;
        if (editField == 'quantity') {
          requireWholeNumber = this.menuItem.itemType.requireWholeNumber
        }
        console.log('requireWholeNumber', this.menuItem.itemType.requireWholeNumber)

        const item = {orderItem: this.orderItem,
                      editField: editField,
                      menuItem: this.menuItem,
                      requireWholeNumber: requireWholeNumber,
                      instructions: instructions}

        //a little formating
        let height  = '600px';
        let width   = '455px'
        if (editField == 'quantity') {
          height  = '600px';
          width   = '455px'
        }

        dialogRef = this.dialog.open(PosOrderItemEditComponent,
        { width     : width,
          minWidth  : '300px',
          height    : height,
          minHeight : height,
          data      : item
        },
        )

        dialogRef.afterClosed().subscribe(result => {
        // this.refreshData();
        // update order
        });
    })
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
    // console.log(payload)
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
        }, err => {
          this.notifyEvent('An error occured, ' + err, 'Failed')
        }
        )
      }
    }
  }

  updateCardStyle(option: boolean)  {

    // console.log('option', option, this.orderItem.id, this.orderItem.idRef)
    if (this.orderItem && this.orderItem.id != this.orderItem.idRef) {
      this.customcard       = 'custom-card-modifier';
      this.productnameClass = 'productname-modifier'
      this.isModifier       = true;
      return
    }

    this.customcard ='custom-card';

    if (!option) {
      this.customcard ='custom-card-side';
    }
  }

  openDialog() {
    const item = this.orderItem
    const data = { id: item.productID }
    const dialogRef = this.dialog.open(MenuItemModalComponent,
      { width: '90vw',
        height: '70vh',
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

  getItemSrc(item:IMenuItem) {
    if (!item.urlImageMain) {
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
    } else {
      return this.awsBucket.getImageURLPath(this.bucketName, item.urlImageMain)
    }
  }

  getImageUrl(imageName: string): any {
    let imageUrl: string
    let ary: any[]
    if ( imageName ) {
      ary = this.awsBucket.convertToArrayWithUrl( imageName, this.awsBucketURL)
      imageUrl = ary[0]
    }
    return imageUrl
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'bottom'
    });
  }

  printLabel(item) {
    this.printingService.printLabel(item)
  }

  swipeOutItem(){
    // console.log(this.index, this.orderItem)
    if (this.disableActions) {return}
    this.cancelItem(this.index,  this.orderItem)
  }

  async editPrompt() {
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
