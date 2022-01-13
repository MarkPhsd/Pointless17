import { AfterViewInit, Component, ElementRef,  HostListener, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
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
export class PosOrderItemComponent implements OnInit, AfterViewInit {

  interface = {}
  payload: payload;
  // @HostBinding('@pageAnimations') //messes with refreshing.
  @Output() outputDelete   :  EventEmitter<any> = new EventEmitter();
  @Output() outputSelectedItem : EventEmitter<any> = new EventEmitter();
  @Input() uiConfig : TransactionUISettings
    // @ViewChild('panel') element: ElementRef
  @Input() index  = 0;
  @Input() orderItem: PosOrderItem;
  @Input() order: IPOSOrder;
  @Input() menuItem: IMenuItem;
  @Input() mainImage: string;
  @Input() placeHolderImage = 'productPlaceHolder.jpg';
  @Input() quantity: number;
  @Input() unitPrice: number;
  @Input() subTotal: number;
  @Input() total: number;
  @Input() printed: string;
  @Input() onlineShortDescription: string;
  @Input() id: number;
  @Input() productID: number;
  @Input() productName: string;
  @Input() thc =  50;
  @Input() cbd =  50;
  @Input() hideAddAnotherOne: number;
  @Input() mainPanel: boolean;

  orderPromptGroup: IPromptGroup;
  menuItem$: Observable<IMenuItem>;
  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number

  animationState        : string;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  bucketName:             string;
  awsBucketURL:           string;
  itemName   :            string;
  imagePath   :            string;

  smallDevice : boolean;
  customcard  = '';
  showEdit    : boolean;
  showView    : boolean;
  promptOption : boolean;

  bottomSheetOpen  : boolean ;
  _bottomSheetOpen : Subscription;

  assignedPOSItem: PosOrderItem;
  _assignedPOSItem: Subscription;

  transactionUISettings$  = this.uiSettingService.getSetting('UITransactionSetting');
  productnameClass = 'product-name'


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
      }
    })

    this._assignedPOSItem = this.orderMethodsService.assignedPOSItem$.subscribe( data => {
      this.assignedPOSItem = data;
      this.productnameClass = 'product-name'
      if (data) {
        if (data.id == this.orderItem.id) {
          this.productnameClass = 'product-name-alt'
        }
        if (data.id != this.orderItem.id) {
          this.productnameClass = 'product-name'
        }
      }
    })

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
                private uiSettingService   : UISettingsService,
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
      this.customcard = 'margin-left: 15px;'
    }
    const item = this.orderItem;
    this.showEdit = !item.printed && (this.quantity && !item.voidReason) &&  item.promptGroupID != 0 && item.id != item.idRef
    this.showView = this.mainPanel && ( (  item.promptGroupID === 0) || ( item.promptGroupID != 0 && item.id != item.idRef ) )
    this.promptOption = (item.promptGroupID != undefined && item.promptGroupID != 0)
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

    const item = {orderItem: this.orderItem,
                  editField: editField,
                  menuItem: this.menuItem,
                  instructions: instructions}

    //a little formating
    let height  = '400px';
    if (editField == 'quantity') {
      height = '275px'
    }

    dialogRef = this.dialog.open(PosOrderItemEditComponent,
      { width     : '300px',
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

  }

  editSerial() {
    if (this.orderItem) {
      const site = this.siteService.getAssignedSite();
      const item$ = this.posOrderItemService.getPOSOrderItem(site, this.orderItem.id)
      item$.subscribe( data => {
          this.orderMethodsService.promptSerial(this.menuItem, data.id, true, data.serialCode)
        }, err => {
          console.log('error', err)
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
    console.log('add Item to Order')
    if (this.menuItem) {
      const quantity  =  Number(1)
      this.orderMethodsService.addItemToOrder(this.order, this.menuItem, quantity)
    }
  }

  updateItemQuantity( quantity:number) {
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

  swipeOutItem(){
    this.cancelItem(this.index,  this.orderItem)
  }

  async editPrompt() {
    const site = this.siteService.getAssignedSite();
    if (this.orderItem) {
      const item   = await this.posOrderItemService.getPurchaseOrderItem(site, this.orderItem.id).pipe().toPromise()
      const prompt = await this.promptGroupservice.getPrompt(site, item.promptGroupID).pipe().toPromise();
      this.orderMethodsService.openPromptWalkThroughWithItem(prompt, item)
    }
  }

}

// this.http.get("https://swapi.co/api/people/")
// .pipe(
//   mergeMap(persons => {
//     const home = persons.results.map(person => this.http.get(person.homeworld))
//     return forkJoin(...home);
//   })
// )
// .subscribe(home => {
//   console.log('home', home)
// })

// applyChoices() {
//   if (this.orderPromptGroup) {
//     const site = this.siteService.getAssignedSite();
//     this.posOrderItemService.postPromptItems(site, this.orderPromptGroup).pipe(
//           switchMap( data  => {
//             return  this.orderService.getOrder(site, data.orderID.toString())
//           }
//         )
//       ).subscribe(data => {
//         this.orderService.updateOrderSubscription(data)
//     })
//   }
// }

      // this.posOrderItemService.getPurchaseOrderItem(site, this.orderItem.id)
    //   .pipe(
    //     switchMap( item  => {
    //       const prompt = this.promptGroupservice.getPrompt(site, item.id).pipe(
    //           switchMap( prompt => {
    //             return forkJoin(...prompt)
    //         })
    //       )
    //     }
    //   )
    // ).subscribe(data => {
    //   this.orderMethod.openPromptWalkThroughWithItem(data, item)
    //   console.log(data)
    // })
