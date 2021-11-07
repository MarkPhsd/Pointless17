import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostBinding, Input,
  OnInit, Output, OnDestroy, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { AWSBucketService, MenuService, OrdersService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem,   }  from 'src/app/_interfaces/transactions/posorder';
import { Observable, Subscription } from 'rxjs';
import { delay,  repeatWhen, switchMap,  } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import {  trigger, animate, transition,  keyframes } from '@angular/animations';
import * as kf from '../../../_animations/list-animations';
import { fadeAnimation } from 'src/app/_animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PosOrderItemsComponent } from './pos-order-items/pos-order-items.component';
import { RecieptPopUpComponent } from '../../admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { EMPTY,timer } from 'rxjs';

import { IMenuItem, ItemType } from 'src/app/_interfaces/menu/menu-products';

@Component({
selector: 'app-pos-order',
templateUrl: './pos-order.component.html',
styleUrls: ['./pos-order.component.scss'],
  animations: [
    trigger('cardAnimator', [
    transition('* => wobble', animate(1000, keyframes(kf.wobble))),
    transition('* => swing', animate(1000, keyframes(kf.swing))),
    transition('* => jello', animate(1000, keyframes(kf.jello))),
    transition('* => zoomOutRight', animate(1000, keyframes(kf.zoomOutRight))),
    transition('* => slideOutLeft', animate(1000, keyframes(kf.slideOutLeft))),
    transition('* => rotateOutUpRight', animate(1000, keyframes(kf.rotateOutUpRight))),
    transition('* => flipOutY', animate(1000, keyframes(kf.flipOutY))),
  ]),
  fadeAnimation
  ]
})

export class PosOrderComponent implements OnInit ,OnDestroy {

  CDK_DRAG_CONFIG = {}
  // @ViewChild('orderItems') orderItems: ElementRef;
  @Output() toggleOpenOrderBarForMe: EventEmitter<any> = new EventEmitter();
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  openOrderBar:                      boolean;
  @ViewChild('container') container : ElementRef;
  @Input() OrderID : string;
  @Input() mainPanel: boolean;

  state   = 'nothing';
  id: any = '';
  order$: Observable<IPOSOrder>;

  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  bucketName:             string;
  awsBucketURL:           string;
  currentPage: any;
  @Input() itemsPerPage  = 8

  _openBar      : Subscription;
  openBar       : boolean;

  isAuthorized  : boolean;
  itemsPrinted  : boolean;
  paymentsMade  : boolean;

  _order        :   Subscription;
  order         :   IPOSOrder;
  posOrderItem  :   PosOrderItem;
  gramCountProgress: any;
  canRemoveClient = false;

  orderlayout     = 'order-layout';
  orderItemsPanel = 'item-list';
  infobuttonpanel = 'info-button-panel';
  gridspan3       = 'grid-span-3'
  gridRight       = 'grid-order-header';

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
      this.canRemoveClient = true
      if (this.order && this.order.posOrderItems && this.order.posOrderItems.length > 0) {
        this.canRemoveClient = false
        // console.log('canRemoveClient', this.canRemoveClient)
      }
      if (this.order && this.order.posPayments && this.order.posPayments.length > 0)  {
        this.canRemoveClient = false
        // console.log('canRemoveClient', this.canRemoveClient)
      }
      // console.log('canRemoveClient result', this.canRemoveClient)

      this.checkIfPaymentsMade()
      this.checkIfItemsPrinted()
    })
  }

  initBarSubscription() {
    this._openBar = this.toolbarUIService.orderBar$.subscribe(data => {
      this.openBar = data
    })
  }

  constructor(
              private orderService: OrdersService,
              private awsBucket: AWSBucketService,
              private printingService: PrintingService,
              private _snackBar: MatSnackBar,
              private router: Router,
              public  route: ActivatedRoute,
              private siteService: SitesService,
              private toolbarUIService: ToolBarUIService,
              private bottomSheet     : MatBottomSheet,
              private dialog          : MatDialog,
              private menuItemService : MenuService,
              private orderItemService: POSOrderItemServiceService,
              private renderingService: RenderingService,
              private settingService  : SettingsService,
              // private printingService : Printing
              private el: ElementRef) {

      const outPut = this.route.snapshot.paramMap.get('mainPanel');
      if (outPut) {
        this.mainPanel = true
      }
      this.refreshOrder();
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false

    this.gridRight       = 'grid-order-header ';
    this.orderlayout     = 'order-layout-empty';

    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.infobuttonpanel = 'flex-item'
      this.gridspan3       = ''
      this.gridRight       = 'grid-order-header';
    }

    if (this.mainPanel && !this.smallDevice) {
      this.orderlayout     = 'order-layout reverse'
      this.gridRight       = 'order-layout-buttons'// 'grid-order-header reverse'
      this.infobuttonpanel = 'grid-order-header'
    }

    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
      this.infobuttonpanel ='flex-grid'
      this.gridspan3       = ''
      this.gridRight       = 'grid-header-order-total'
    }

  }

  async ngOnInit() {
    this.updateItemsPerPage();
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.sidePanelWidth = this.el.nativeElement.offsetWidth;
    this.initSubscriptions();
    this.initBarSubscription();
    if (this.sidePanelWidth < 210) {
      this.isNotInSidePanel = false
      this.sidePanelPercentAdjust = 80
    } else {
      this.isNotInSidePanel = true
      this.sidePanelPercentAdjust = 60
    }
    this.isAuthorized = true
  }

  openClient() {
    if (this.order && this.order.clients_POSOrders) {
      this.router.navigate(["/profileEditor/", {id: this.order.clientID}]);
    }
  }

  //check order status:
  refreshOrder() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      const order$ = this.orderService.getOrder(site, this.order.id.toString() )
      // const source = timer(5000, 3000);
      order$.subscribe( data => {
          this.orderService.updateOrderSubscription(data)
      })
    }
  }

  checkIfItemsPrinted() {
    this.itemsPrinted = false
    if (this.order && this.order.posOrderItems) {
      if (this.order.posOrderItems.length > 0) {
        const items = this.order.posOrderItems
        items.forEach( data => {
          if (data.printed) {
            this.itemsPrinted = true
            return true
          }
        })
      }
    }
  }

  checkIfPaymentsMade() {
    this.paymentsMade = false
    if (this.order && this.order.posPayments) {
      if (this.order.posPayments.length > 0) {
        this.paymentsMade = true
        return true
      }
    }
  }

  logAnimation(event) {
    console.log(event)
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

  async assignCurrentOrder() {
     if (this.currentPOSOrderExists()) {
      const order$ = this.orderService.getCurrentPOSOrder(this.siteService.getAssignedSite(),this.orderService.posName)
    } else {
      if (!this.order) {
        this.order$ = null
        return
      }
      const order$ = this.orderService.getOrder(this.siteService.getAssignedSite(),  this.order.id.toString())
    }
    this.refreshObservable(this.order$)
  }

  refreshObservable(order$: Observable<IPOSOrder>) {
    order$.pipe(
      repeatWhen(x => x.pipe(delay(3500)))).subscribe(data => {
      this.orderService.updateOrderSubscription(data)
    })
  }

  currentPOSOrderExists() {
    if ( this.orderService.posName != '' && this.orderService.posName != undefined  && this.orderService.posName != null ) {
      return true
    }
  }

  public toggleOpenOrderBar() {
    this.router.navigate(["/currentorder/",{mainPanel:true}]);
    this.openOrderBar = false
    this.toolbarUIService.updateOrderBar(this.openOrderBar)
    this.toolbarUIService.resetOrderBar(true)
  }

  async voidOrder() {
    const site = this.siteService.getAssignedSite();
    const order = await this.orderService.voidOrder(site, this.order.id).pipe().toPromise();
    if (order === 'Order Voided') {
      this.notifyEvent('Order Voided', 'Success')
      this.orderService.updateOrderSubscription(null)
      this.router.navigateByUrl('pos-orders')
    }
  }

  async deleteOrder() {
    const result = window.confirm('Are you sure?')
    if (result) {
      const site = this.siteService.getAssignedSite();
      const order = await this.orderService.deleteOrder(site, this.order.id).pipe().toPromise();
      console.log('order')
      if (order === 'Order deleted.') {
        this.notifyEvent('Order Deleted', 'Success')
        this.orderService.updateOrderSubscription(null)
        this.router.navigateByUrl('pos-orders')
      } else {
        this.notifyEvent('Order not deleted. Please check if you have items to void or payments to void',
                          'Failed')
      }
    }
  }

  ngOnDestroy() {
    if (this.id) {
      clearInterval(this.id);
    }
    if(this._order) { this._order.unsubscribe()
    }
    this.orderService.updateBottomSheetOpen(false)
  }

  suspendOrder() {
    if (this.order) {

     if (this.order.clientID == 0) {
       this.notifyEvent('Assign this order a customer for reference', 'Alert')
       return
     }

      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = true;
      this.orderService.putOrder(site, this.order).subscribe( data => {
        this.notifyEvent('This order has been suspended', 'Success')
        this.router.navigateByUrl('/pos-orders')
      })

    }
  }

  removeSuspension() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = false;
      this.orderService.putOrder(site, this.order).subscribe( data => {
        this.notifyEvent('This suspension is reomved', 'Success')
        // this.router.navigateByUrl('/pos-orders')
      })
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  async assignCustomer(event) {
    if (event) {
      await this.assignClientID(event.id)
    }
  }

  async assignClientID(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = id
      const order = await this.orderService.putOrder(site, this.order).pipe().toPromise()
      this.orderService.updateOrderSubscription(order)
    }
  }

  async  removeClient() {
    if (this.order) {
      await this.assignClientID(0);
    }
  }

  makePayment() {
    if (this.smallDevice) {
      this.openOrderBar = false
      this.toolbarUIService.updateOrderBar(this.openOrderBar)
      this.toolbarUIService.resetOrderBar(false)
    }
    this.router.navigateByUrl('/pos-payment')
  }

  //loop the items
  //print labels
  //update the items that have the label printed
  ///update the inventory
  //update the subscription order Info
  printLabels() {

    //get the order
    if (this.order) {
      if (this.order.posOrderItems) {
        const items = this.order.posOrderItems
        let loop = 1
        if (items.length > 0) {
          items.forEach( item => {
            if (!item.printed) {
               this.printLabel(item)
            }
          })

        }
      }
    }
  }

    //get item
  //print maybe
  //update inventory
  printLabel(item: PosOrderItem) {

    const site = this.siteService.getAssignedSite();
    let printerName = ''
    this.menuItemService.getMenuItemByID(site, item.productID).pipe(
      switchMap(data => {
        if ( !data  || data == "No Records" || !data.itemType) {
          console.log('no data')
          return
        }

        if ( data.itemType && ( (data.itemType.prepTicketID != 0 || data.itemType.labelTypeID != 0 ) && data.itemType.printerLocation ) ) {
          printerName = data.itemType.printerName
          const itemType = data.itemType

          const printerLocations = itemType.printerLocation
          console.log('printerLocation', printerLocations)
          console.log('data.itemType.labelTypeID', data.itemType.labelTypeID)
          printerName = printerLocations.printer;

          if (printerName && printerName != '') {
            if (data.itemType.labelTypeID !=0 ) {
              return   this.settingService.getSetting(site, data.itemType.labelTypeID)
            }
            return EMPTY
          }

        } else {
          return this.orderItemService.setItemAsPrinted(site, item )
        }

    })).pipe(
      switchMap( data => {
        // //get the PrintString Format
        console.log('getting Text From label setting',  data)
        if (printerName) {
          const content = this.renderingService.interpolateText(item, data.text)
          const result  = this.printingService.printLabelElectron(content, printerName)
        }

        if (!item.printed) {
          return this.orderItemService.setItemAsPrinted(site, item )
        }

        return EMPTY
    })).subscribe( data => {
      this.refreshOrder();
      // do something aboutt the inventory notification or don't
      console.log('item printed')
    })
  }

  // //get item
  // //print maybe
  // //update inventory
  // printLabel(item: PosOrderItem) {

  //   const site = this.siteService.getAssignedSite();
  //   let printerName = ''

  //   this.menuItemService.getMenuItemByID(site, item.productID).pipe(
  //     switchMap(menuItem => {
  //       let printerName = ''
  //       console.log('item Info', menuItem)
  //       //if not found?
  //       if ( !menuItem  || menuItem == 'No Records' ) {
  //         console.log('no item type')
  //         return EMPTY
  //       }

  //       const data = menuItem as IMenuItem
  //       let  itemType     = data.itemType
  //       console.log(itemType)
  //       //if item type not assigned.
  //       if (!itemType) {
  //         console.log('no item type -setting as printed')
  //         return this.orderItemService.setItemAsPrinted(site, item )
  //       }

  //       //if the item is not a label, and doesn't have a prep ticket ID then just set it as printed/
  //       if (itemType.labelTypeID == 0 && itemType.prepTicketID == 0  ) {
  //         console.log('no labeltype or prepticket -setting as printed')
  //         return this.orderItemService.setItemAsPrinted(site, item )
  //       }

  //       console.log('itemType.printerLocation', itemType.printerLocation)
  //       const printerLocations = itemType.printerLocation

  //       if (!printerLocations) {
  //         console.log('no printerLocations-setting as printed')
  //         return this.orderItemService.setItemAsPrinted(site, item )
  //       };

  //       if (printerLocations) { printerName = printerLocations.printer };

  //       if (!printerName) {
  //         console.log('no printerName-setting as printed')
  //         return this.orderItemService.setItemAsPrinted(site, item )
  //       }

  //       if (!item.printed) {
  //         console.log('printerName', printerName)
  //         data.itemType.printerName = printerName
  //         return this.settingService.getSetting(site, data.itemType.labelTypeID)
  //       }

  //       return EMPTY

  //     })).pipe(
  //       switchMap( data => {

  //         console.log(`print data ${data.itemType.printerName}`, data)
  //         if (data && printerName) {
  //           const content = this.renderingService.interpolateText(item, data.text)
  //           const result  = this.printingService.printLabelElectron(content, printerName)
  //           if (!item.printed && result) {
  //             return this.orderItemService.setItemAsPrinted(site, item )
  //           }
  //         }

  //         return EMPTY

  //     })).pipe(
  //       switchMap( data => {
  //         if (data === 'success' ) {
  //           return EMPTY
  //         }
  //       })
  //     ).subscribe( data => {

  //     })

  // }

  returnMenuItem(item: IMenuItem): Observable<IMenuItem> {

    return
  }

  // printTestLabelElectron(){
  //   const content = this.renderingService.interpolateText(this.item, this.zplSetting.text)
  //   this.printingService.printTestLabelElectron(content, this.printerName)
  // }


  rePrintLabels() {

  }

  printReceipt() {
    this.openReceiptView();
  }

  showItems() {
    this.toolbarUIService.updateOrderBar(false)
    if (this.order) {
      this.orderService.updateBottomSheetOpen(true)
      this.bottomSheet.open(PosOrderItemsComponent)
    }
  }

  openReceiptView() {
    this.printingService.previewReceipt()
  }
}
