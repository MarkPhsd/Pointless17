import { Component, ElementRef, EventEmitter, Input,
         OnInit, Output, OnDestroy,  ViewChild, HostListener, Renderer2 } from '@angular/core';
import { AuthenticationService, AWSBucketService, OrdersService, TextMessagingService } from 'src/app/_services';
import { IPOSOrder, PosOrderItem,   }  from 'src/app/_interfaces/transactions/posorder';
import { Observable, of, Subscription } from 'rxjs';
import { delay,  repeatWhen, switchMap  } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import {  trigger, animate, transition,  keyframes } from '@angular/animations';
import * as kf from '../../../_animations/list-animations';
import { fadeAnimation } from 'src/app/_animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PosOrderItemsComponent } from './pos-order-items/pos-order-items.component';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ResizedEvent } from 'angular-resize-event';
import { POSOrderItemServiceService } from 'src/app/_services/transactions/posorder-item-service.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { NewOrderTypeComponent } from '../components/new-order-type/new-order-type.component';

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
  deviceWidthPercentage ='100%'
  orderItemsHeightStyle ='150px'
  windowHeight: number;
  CDK_DRAG_CONFIG = {}
  // @ViewChild('orderItems') orderItems: ElementRef;
  @Output() toggleOpenOrderBarForMe: EventEmitter<any> = new EventEmitter();
  // @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  openOrderBar                      : boolean;
  // @ViewChild('container') container : ElementRef;
  @Input() OrderID : string;
  @Input() mainPanel: boolean;
  // totalOrderHeight$: Observable<any>;
  // remainingHeight$:  Observable<any>;
  // state   = 'nothing';
  id: any = '';
  order$: Observable<IPOSOrder>;

  isNotInSidePanel: boolean
  sidePanelWidth: number
  sidePanelPercentAdjust: number
  smallDevice : boolean;
  phoneDevice = false;
  bucketName:             string;
  awsBucketURL:           string;
  currentPage: any;
  @Input() itemsPerPage  = 8

  _openBar      : Subscription;
  openBar       : boolean;

  isAuthorized  : boolean;
  isUser        : boolean;
  isStaff       : boolean;

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
  user          : any;
  _user: Subscription;

  _uiSettings: Subscription;
  uiSettings : UIHomePageSettings;
  wideBar    =  true;
  enableLimitsView : boolean;
  _uiTransactionSettings: Subscription;
  uiTransactionSettings : TransactionUISettings;

  emailOption : boolean;
  ssmsOption   : boolean;

  private _items : Subscription
  assignedItems:  PosOrderItem[];
  bottomSheet$: Observable<any>;

  refundItemsAvalible;
  uiTransactionSetting$: Observable<TransactionUISettings>;
  uiTransactionSetting : TransactionUISettings;

  initAssignedItemsSubscriber() {
    this._items = this.orderMethodService.assignedPOSItems$.subscribe(data => {
      this.assignedItems = data;
      if (data && data.length>0) {
        this.refundItemsAvalible = true;
      }
      this.refundItemsAvalible = false;
    })
  }
  // item$ = this.orderMethodService.assignedPOSItems$;

  transactionUISettingsSubscriber() {
    this.uiSettingsService.transactionUISettings$.subscribe( data => {
      this.enableLimitsView  = false;
      if (data) {
        this.uiTransactionSettings = data;
        this.enableLimitsView = data.enableLimitsView
      }
    });
  }

  gettransactionUISettingsSubscriber() {
    this.uiTransactionSetting$ = this.settingService.getUITransactionSetting().pipe(
      switchMap( data => {
        this.uiSettingsService.updateUITransactionSubscription(data);
        return of(data)
      })
    )
  }

  homePageSettingSubscriber() {
    this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
      this.uiSettings = data;
      if (data) {
        if (data.outGoingCustomerSupportEmail) {
          this.emailOption = true
        }
        if (data.twilioEnabled) {
          this.ssmsOption = true
        }
        if (data.wideOrderBar) {
          this.wideBar = true;
        }
      }
    })
  }

  currentOrderSusbcriber() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
      this.canRemoveClient = true
      if (this.order && this.order.posOrderItems && this.order.posOrderItems.length > 0) {
        this.canRemoveClient = false
      }
      if (this.order && this.order.posPayments && this.order.posPayments.length > 0)  {
        this.canRemoveClient = false
      }
      if (!data) { return }
      this.checkIfPaymentsMade()
      this.checkIfItemsPrinted()
    })
  }


  onResizedorderHeightPanel(event: ResizedEvent) {

    this.uiSettingsService.updateorderHeaderHeight(event.newRect.height, this.windowHeight) //this.orderHeightPanel.nativeElement.offsetHeight)
    this.resizePanel()

  }

  onResizedorderLimitsPanel(event: ResizedEvent) {
    this.uiSettingsService.updateLimitOrderHeight(event.newRect.height, this.windowHeight) //(this.orderLimitsPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  onResizedorderSpecialsPanel(event: ResizedEvent) {
    this.uiSettingsService.updatespecialOrderHeight(event.newRect.height, this.windowHeight) //(this.orderSpecialsPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  onResizedorderCustomerPanel(event: ResizedEvent) {
    // console.log('onResizedorderCustomerPanel',  event.newRect.height )
    this.uiSettingsService.updatecustomerOrderHeight(event.newRect.height,this.windowHeight) //(this.orderCustomerPanel.nativeElement.offsetHeight)
    this.resizePanel()
  }

  resizePanel() {
    this.uiSettingsService.remainingHeight$.subscribe(data => {
      if (this.mainPanel) {
        this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `calc(100vh -${ - 100}px)`
        }
        return;
      }
      if (data) {
        const value = +data.toFixed(0)
        this.orderItemsHeightStyle = `${value - 70}px`
        if (this.smallDevice) {
          this.orderItemsHeightStyle = `${value - 105}px`
        }
      }
    })
  }

  userSubscriber() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }

  initSubscriptions() {
    this.transactionUISettingsSubscriber();
    this.homePageSettingSubscriber();
    this.currentOrderSusbcriber();
    this.userSubscriber();
    this.initBarSubscription();
    this.resizePanel();
    this.initAssignedItemsSubscriber()
  }

  initBarSubscription() {
    this._openBar = this.toolbarUIService.orderBar$.subscribe(data => {
      this.openBar = data
    })
  }

  constructor(
              private renderer          : Renderer2,
              private navigationService : NavigationService,
              private orderService      : OrdersService,
              private awsBucket         : AWSBucketService,
              private printingService   : PrintingService,
              private _snackBar         : MatSnackBar,
              private router            : Router,
              public  route             : ActivatedRoute,
              private siteService       : SitesService,
              private toolbarUIService  : ToolBarUIService,
              private bottomSheet       : MatBottomSheet,
              private orderMethodService: OrderMethodsService,
              public userAuthorization : UserAuthorizationService,
              private authenticationService: AuthenticationService,
              public  uiSettingsService  : UISettingsService,
              private settingService    : SettingsService,
              private _bottomSheet     : MatBottomSheet,
              private posOrderItemService: POSOrderItemServiceService,
              private productEditButtonService: ProductEditButtonService,
              private el                : ElementRef) {

    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    // console.log('order Total Main Panel Check', outPut)
    if (outPut) {
      this.mainPanel = true
    }
    this.refreshOrder();
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    this.phoneDevice = false
    this.deviceWidthPercentage = '100%'
    this.gridRight       = 'grid-order-header ';
    this.orderlayout     = 'order-layout-empty';
    this.resizePanel();

    this.windowHeight = window.innerHeight;

    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.infobuttonpanel = 'grid-order-header'
      this.gridspan3       = ''
      this.gridRight       = 'grid-order-header';
    }

    if (window.innerWidth < 599) {
      this.phoneDevice = true
      this.deviceWidthPercentage = '65%'
    }

    if (this.mainPanel && !this.smallDevice) {
      this.orderlayout     = 'order-layout reverse'
      this.gridRight       = 'order-layout-buttons'// 'grid-order-header reverse'
    }

    if (!this.mainPanel) {
      this.orderItemsPanel = 'item-list-side-panel'
      this.infobuttonpanel ='grid-buttons'
      this.gridspan3       = ''
      this.gridRight       = 'grid-header-order-total'
    }

  }

  async ngOnInit() {
    this.initAuthorization();
    // console.log('get transaction u settings')
    this.gettransactionUISettingsSubscriber();
    this.updateItemsPerPage();
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.sidePanelWidth = this.el.nativeElement.offsetWidth;
    this.initSubscriptions();

    if (this.sidePanelWidth < 210) {
      this.isNotInSidePanel = false
      this.sidePanelPercentAdjust = 80
    } else {
      this.isNotInSidePanel = true
      this.sidePanelPercentAdjust = 60
    }

    this.toolbarUIService.hidetoolBars();



  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

    }
  }

  openClient() {
    if (this.order && this.order.clients_POSOrders) {
      this.router.navigate(["/profileEditor/", {id: this.order.clientID}]);
    }
  }

  //check order status:
  refreshOrder() {
    if (this.order) {
      this.orderMethodService.refreshOrder(this.order.id)
    }
  }

  changeTransactionType(event) {
    this.orderService.toggleChangeOrderType = true;
    const bottomSheet = this._bottomSheet.open(NewOrderTypeComponent)
    this.bottomSheet$ = bottomSheet.afterDismissed()
    this.bottomSheet$.subscribe(data => {
      this.orderService.toggleChangeOrderType = false;
    })
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

  applyDiscount(event) {

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

  sendToPrep() {
    if (this.order) {
      const site = this.siteService.getAssignedSite()
      this.orderMethodService.prepPrintUnPrintedItems(this.order.id)
    }
  }

  logAnimation(event) {
    // console.log(event)
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
      const order$ = this.orderService.getOrder(this.siteService.getAssignedSite(),  this.order.id.toString(), this.order.history)
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

  clearOrder(event) {
    this.orderMethodService.clearOrder()
  }

  voidOrder() {
     this.productEditButtonService.openVoidOrderDialog(this.order)
  }

  refundItem(event) {
    if (this.assignedItems) {
      // console.log(this.assignedItems)
      // console.log('what is happening.')
      this.productEditButtonService.openRefundItemDialog(this.assignedItems)
    }
  }

  refundOrder(event) {
    this.productEditButtonService.openRefundOrderDialog(this.order)
  }

  async deleteOrder(event) {
    this.orderMethodService.deleteOrder(this.order.id, false)
  }

  ngOnDestroy() {
    if (this.id) { clearInterval(this.id); }
    if(this._order) { this._order.unsubscribe() }
    this.orderService.updateBottomSheetOpen(false)
    if (this._user) { this._user.unsubscribe()}
    if (this._uiSettings) { this._uiSettings.unsubscribe()}
    if (this._uiTransactionSettings) { this._uiTransactionSettings.unsubscribe()}
    this.uiTransactionSetting$  = null;

    if (this.bottomSheet$) {
      this.bottomSheet$ = null;
    }
  }

  suspendOrder() {
    if (this.order) {

     if (this.order.clientID == 0) {
       this.notifyEvent('Assign this order a customer for reference', 'Alert')
       return
     }

      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = true;
      this.order.orderLocked = null;
      const suspend$ =  this.orderService.putOrder(site, this.order)

      suspend$.subscribe(data =>{
        this.clearOrder(null)
        this.notifyEvent('This order has been suspended', 'Success')
        this.router.navigateByUrl('/pos-orders')
      })

    };
  }

  removeDiscount(event) {

    const result = window.confirm('Are you sure you want to remove the discounts?');
    if (result) { return };
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      let item$ = this.posOrderItemService.removeOrderDiscount(site, this.order.id);
      item$.subscribe(data => {
        this.orderService.updateOrderSubscription(data);
      })
    };

  }

  removeSuspension() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.suspendedOrder = false;
      this.orderService.putOrder(site, this.order).subscribe( data => {
        this.notifyEvent('This suspension is removed', 'Success')
        // this.router.navigateByUrl('/pos-orders')
      })
    };
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

  toggleOpenOrderBar() {
    this.openOrderBar= false
    this.navigationService.toggleOpenOrderBar(this.isStaff)
  }

  makePayment() {
    if (this.smallDevice) {
      this.openOrderBar = false
    }
    let path = ''
    if (this.order) {
      if (this.order.tableName && this.order.tableName.length>0) {
        path = 'pos-payment'
      }
    }
    this.navigationService.makePayment(this.openOrderBar, this.smallDevice,
                                      this.isStaff, this.order.completionDate, path )
  }

  //loop the items
  //print labels
  //update the items that have the label printed
  ///update the inventory
  //update the subscription order Info
  async printLabels() {

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
  async  printLabel(item: PosOrderItem) {


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

  textNotify() {
    // this.outPutTextNotify.emit(true)
    this.orderMethodService.sendSSMSOrderISReady(this.order)
  }

  emailNotifyOrder(event) {
    this.orderMethodService.emailOrder(this.order).subscribe(data => {
      if (data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email Sent', 'Success')
       }
      if (!data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email not sent. Check email settings', 'Failed')
      }
    })
  }

  emailOrder(event) {
    this.orderMethodService.emailOrder(this.order).subscribe(data => {
      if (data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email Sent', 'Success')
       }
      if (!data.isSuccessStatusCode) {
        this.orderMethodService.notifyEvent('Email not sent. Check email settings', 'Failed')
      }
    })
  }

}
