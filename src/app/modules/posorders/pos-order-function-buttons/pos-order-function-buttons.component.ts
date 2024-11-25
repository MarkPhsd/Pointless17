import { Component, OnInit, Output, Input,EventEmitter, HostListener, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable,  Subscription, of, switchMap } from 'rxjs';
import { IPOSOrder, IServiceType,  IUserProfile, ServiceTypeFeatures } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ITerminalSettings} from 'src/app/_services/system/settings.service';
import { AuthenticationService } from 'src/app/_services';
import { Capacitor } from '@capacitor/core';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { RequestMessageService } from 'src/app/_services/system/request-message.service';
import { PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MessageMenuSenderComponent } from '../../admin/message-editor-list/message-menu-sender/message-menu-sender.component';
@Component({
  selector: 'pos-order-function-buttons',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MessageMenuSenderComponent,
  ],
  templateUrl: './pos-order-function-buttons.component.html',
  styleUrls: ['./pos-order-function-buttons.component.scss']
})

export class PosOrderFunctionButtonsComponent implements OnInit, OnDestroy {
  get platForm() {  return Capacitor.getPlatform(); }
  @Input()    quicKMenusExist : boolean;
  menuToggle: boolean;
  serviceTypeOrder : string[]

  posDevice$: Observable<ITerminalSettings>;
  posDevice : ITerminalSettings;
  _posDevice: Subscription;
  uiTransactionSetting$: Observable<TransactionUISettings>;
  uiTransactionSetting : TransactionUISettings;
  _transactionUI: Subscription;
  // @ViewChild('payButton')     payButton: TemplateRef<any>;
  @ViewChild('payOption')     payOption: TemplateRef<any>;
  @ViewChild('exitButton')    exitButton: TemplateRef<any>;
  @ViewChild('refundOrderButton')  refundOrderButton: TemplateRef<any>;
  @ViewChild('listViewItemView')  listViewItemView: TemplateRef<any>;
  @ViewChild('inventoryManifestView')  inventoryManifestView: TemplateRef<any>;
  @ViewChild('ssmsOptionView')  ssmsOptionView: TemplateRef<any>;
  @ViewChild('textOptionView')  textOptionView: TemplateRef<any>;
  @ViewChild('emailOptionView')  emailOptionView: TemplateRef<any>;
  @ViewChild('listItemsView')  listItemsView: TemplateRef<any>;
  @ViewChild('adjustmentOptionsView')  adjustmentOptionsView: TemplateRef<any>;
  @ViewChild('balanceSheetMenuView')  balanceSheetMenuView: TemplateRef<any>;
  @ViewChild('groupNameMenu') groupNameMenu: TemplateRef<any>;

  @ViewChild('communicationsView')  communicationsView: TemplateRef<any>;
  @ViewChild('reFireOrder')  reFireOrder: TemplateRef<any>;
  @ViewChild('cancelButton') cancelButton: TemplateRef<any>;
  @Input() devicename: string;

  spacer1: any;
  spacer2: any;
  spacer3: any;
  spacer4: any;
  spacer5: any;
  spacer6: any;
  spacer7: any;
  spacer10: any;
  spacer11: any;
  spacer12: any;
  windowSize: string;
  windowWidth: number;

  isApp = false;
  @Output() outPutchangeTransactionType = new EventEmitter();
  @Output() outPutSendToPrep    = new EventEmitter();
  @Output() outPutClearOrder    = new EventEmitter();
  @Output() outPutPrint         = new EventEmitter();
  @Output() outPutPrintLabel    = new EventEmitter();
  @Output() outPutRePrintLabel  = new EventEmitter();
  @Output() outPutPrintReceipt  = new EventEmitter();
  @Output() outPutMakePayment   = new EventEmitter();
  @Output() outPutDeleteOrder   = new EventEmitter();
  @Output() outPutVoidOrder     = new EventEmitter();
  @Output() outPutShowItems     = new EventEmitter();
  @Output() outPutSuspendOrder  = new EventEmitter();
  @Output() outPutRemoveSuspension  = new EventEmitter();
  @Output() outPutToggleQuickMenu  = new EventEmitter();

  @Output() outPutToggleSuspension = new EventEmitter();
  @Output() outPutEmailOrder    = new EventEmitter();
  @Output() outPutEmailNotifyOrder = new EventEmitter();
  @Output() outPutTextNotify       = new EventEmitter();
  @Output() outPutRemoveDiscount = new EventEmitter();
  @Output() outPutRefundItem         = new EventEmitter();
  @Output() outPutRefundOrder         = new EventEmitter();
  @Output() outPutPurchaseOrder         = new EventEmitter();
  @Output() outPutListView         = new EventEmitter();

  @Input() user        : IUserProfile;
  @Input() itemsPrinted: boolean;
  @Input() paymentsMade: boolean;
  @Input() isStaff     : boolean;
  @Input() smallDevice: boolean;
  @Input() isUser      : boolean;
  @Input() isAuthorized: boolean;
  @Input() openBar     : boolean;
  @Input() mainPanel   : boolean;
  @Input() order       : IPOSOrder;
  @Input() emailOption : boolean;
  @Input() ssmsOption : boolean;
  @Input() refundItemEnabled: boolean;
  @Input() purchasOrderEnabled: boolean;
  @Input() prepOrderOnClose: boolean;
  listView: Boolean;
  @Input() userAuths       :   IUserAuth_Properties;
  _userAuths      : Subscription;
  assignedItems   : Subscription;
  _order: Subscription;
  refundItems     : boolean;
  action$ : Observable<any>;
  locations$ = this.locationsService.getLocationsCached();

  serviceType  : IServiceType;
  serviceType$ : Observable<IServiceType>;

  transactionUISettingsSubscriber() {
    this._transactionUI = this.uiSettingsService.transactionUISettings$.subscribe( data => {
      if (data) {
        this.uiTransactionSetting = data;
      }
    });

    this._order = this.orderMethodsService.currentOrder$.subscribe( order => {
      this.order = order
      if (this.order?.serviceType != order?.serviceType) {
        this.setServiceTypeGroups()
      }
    })

  }

  posDeviceSubscriber() {
    this._posDevice = this.uiSettingsService.posDevice$.subscribe( data => {
      if (data) {
        this.posDevice = data;
      }
    });
  }

  userAuthSubscriber() {
    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      if (data) {
        this.userAuths = data;
        // this.
      }
    })
  }
  constructor(private platFormService: PlatformService,
              public  userAuthorizationService: UserAuthorizationService,
              private authenticationService: AuthenticationService,
              public  orderMethodsService: OrderMethodsService,
              private router: Router,
              private siteService: SitesService,
              private locationsService: PrinterLocationsService,
              private requestMessageService: RequestMessageService,
              private paymentsMethodsProcessService: PaymentsMethodsProcessService,
              private uiSettingsService: UISettingsService,
              private balanceSheetMethods: BalanceSheetMethodsService ) { }

  ngOnInit() {
    this.isApp = this.platFormService.isApp();
    // this.initSubscriptions();
    this.refreshWindowInfo();
    this.transactionUISettingsSubscriber();
    this.posDeviceSubscriber();
    this.userAuthSubscriber()

    this.setServiceTypeGroups()

  }

  setServiceTypeGroups() {
    if (!this.order) {return [] }
    if (!this.order.service) {return [] }

    const serviceType = this.order.service;
    if (!serviceType.json) { return [] }
    const props = JSON.parse(serviceType.json) as ServiceTypeFeatures;

    if (!props) {  return []}

    if (!props.metaTags) {  return []}

    this.serviceTypeOrder = this.siteService.convertToArray(props.metaTags);
    return  props.metaTags
  }


  get isPaymentsMade() {
    if (this.order && this.order.posPayments) {
      const items = this.order.posPayments
      if (items && items.length>0) {
        return true
      }
    }
    return false
  }



  get creditCardPaymentsMade() {
    if (this.order && this.order.posPayments) {
      const items =  this.order.posPayments.filter(data => {
          return data.paymentMethod?.isCreditCard
      })
      if (items && items.length>0) {
        return true
      }
    }
    return false
  }

  toggleListView() {
    this.listView = !this.listView;
    this.outPutListView.emit(this.listView)
  }

  toggleQuickMenu() {
    this.menuToggle = !this.menuToggle
    this.outPutToggleQuickMenu.emit(this.menuToggle)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._userAuths) {
      this._userAuths.unsubscribe()
    }
    if (this.assignedItems) {
      this.assignedItems.unsubscribe()
    }
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  @HostListener("window:resize", [])
  refreshWindowInfo() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
     this.order.balanceRemaining
     this.windowSize = 'Normal'

    //  this.spacer1 = this.payButton;
    //  this.spacer1 = null;
     this.spacer2 = null;
     this.spacer3 = null;
     this.spacer4 = null;
     this.spacer5 = null;
     this.spacer6 = null;
     this.spacer7 = null;
     this.spacer10 = null;
     this.spacer11 = null;
     this.spacer12 = null;
     this.windowWidth = window.innerWidth

     if (window.innerWidth < 1024) {
      this.spacer5          = null;
      this.spacer11         = null;
      this.windowSize = 'Less Than 1024'
     }

     if (window.innerWidth >= 954 && window.innerWidth < 1024) {
      this.spacer11 = null;
      this.spacer11 = null
      this.spacer12 = null
      this.windowSize = 'Mid'
     }

     if (window.innerWidth >= 1024 && window.innerWidth <= 1565) {
      // this.spacer1 = this.exitButton
      this.spacer2 = null;//this.payButton;
      this.spacer3 = null;//this.payButton;
      this.spacer4 = null;// this.payButton;
      this.spacer5 = null;// this.exitButton
      this.spacer6 = null;//this.payButton;
      this.spacer7 = null;
      // this.spacer8 = this.payButton;
      // this.spacer9 = this.payButton;
      this.spacer10 = null;//this.payButton
      this.spacer11 = null;// this.payButton;
      // this.spacer12 = this.payButton;

      this.windowSize = 'medium'
     }

     if (window.innerWidth >= 1366 && window.innerWidth < 1564) {
      this.spacer12 = null;
      this.spacer7 =  null;
      this.spacer11 = null;
      this.windowSize = 'large'
     }

     if ( window.innerWidth > 1259 ) {
      this.spacer5  = this.exitButton
      this.spacer7  = null;
      this.spacer3  = null;
      this.spacer4  = null;
      this.spacer11 = null;
      // this.spacer12 = this.payButton;
     }

     if (  window.innerWidth > 1564) {
      this.spacer5  = this.exitButton
      this.spacer7  = null;
      this.spacer3  = null;
      this.spacer4  = null;
      this.spacer11 = null;;
      this.spacer12 = null
      this.windowSize = 'largest'
     }

     if (  window.innerWidth > 1871) {
      this.spacer5  = this.exitButton
      this.spacer7  = null;
      this.spacer3  = null;
      this.spacer4  = null;
      this.spacer11 = null;
      this.spacer12 = null;
      this.windowSize = 'xlargest'
     }

     if (  window.innerWidth > 2179) {
      this.spacer5  = this.exitButton
      this.spacer7  = null;
      this.spacer3  = null;
      this.spacer4  = null;
      this.spacer6  = null;
      this.spacer11 = null;
      this.spacer12 = null;
      this.windowSize = 'xxlargest'
     }

     if (  window.innerWidth > 2483) {
      this.spacer5  = this.exitButton
      this.spacer7  = null;
      this.spacer3  = null;
      this.spacer4  = null;
      this.spacer6  = null;
      this.spacer11 = null;
      this.spacer12 = null;
      this.windowSize = 'largest'
     }
   }

   payOrder(){
    this.outPutMakePayment.emit(true)
   }

   get isrefundOrderButton() {
    if (this.order?.service?.filterType != 0 ) { return null }
    if ((this.userAuthorizationService.isManagement || !this.isUser )&& !this.smallDevice) {
     return this.refundOrderButton
    }
    return null;
  }

  get islistViewItemView() {
    if (this.userAuthorizationService.isManagement && !this.smallDevice) {
     return this.listViewItemView
    }
    return null;
  }

   get islistItemsView() {
    if (!this.smallDevice) { return null}
    return this.listItemsView
   }

   get isbalanceSheetMenuView() {
     if (this.order?.service?.filterType != 0 ) { return null }
     if (this.isStaff && this.isApp) {
      return this.balanceSheetMenuView
     }
     return null;
   }

   get adjustmentOptions() {
    if (this.order?.service?.filterType == 2) { return null }
    return this.adjustmentOptionsView
   }

   get isManifestView() {
    if ( this.purchasOrderEnabled && this.userAuthorizationService.isManagement  && !this.smallDevice &&
        (this.order?.service?.filterType != 2)) {
      return this.inventoryManifestView
    }
    return null
  }

  get isGroupNameMenu() {
    return this.groupNameMenu
    if (this.order?.service?.filterType != 0 ) { return null }
    if (this.isStaff) {
    }
    return null;
  }

  get isemailOptionView() {
    if (this.order?.service?.filterType == 2 ) { return null }
    // if (this.order?.service?.filterType != 0 ) { return null }
    if (this.emailOption  && !this.isUser) {
      return this.emailOptionView
    }
    return null;
  }
  get isSSMOptionView() {
    if (this.order?.service?.filterType == 2 ) { return null }
    if (this.ssmsOption && !this.isUser) {
      return this.ssmsOptionView
    }
    return null;
  }

  get communications() {
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.email) {
      return this.communicationsView
    }
    return null;
  }

  get istextOptionView() {
    if (this.ssmsOption && !this.isUser) {
      return this.textOptionView
    }
    return null;
  }

   get payOptionView() {
    if (this.order?.service?.filterType != 0 ) { return null }
    if (this.smallDevice) {
      return this.payOption;
    }
    return null;
  }

  changeTransactionType() {
    this.outPutchangeTransactionType.emit(true)
  }

  makeManifest() {
    this.outPutPurchaseOrder.emit(true)
  }
  refundItem() {
    this.outPutRefundItem.emit(true)
  }
  refundOrder() {
    this.outPutRefundOrder.emit(true)
  }

  emailOrder() {
    this.outPutEmailOrder.emit(true)
  }
  showItems() {
    this.outPutShowItems.emit(true)
  }
  sendToPrep(){
    this.outPutSendToPrep.emit(true)
    this.outPutClearOrder.emit(true)
  }
  rePrintLabels(){
    this.outPutRePrintLabel.emit(true)
  }
  printLabels() {
    this.outPutPrintLabel.emit(true)
  }
  printReceipt() {
    this.outPutPrintReceipt.emit(true)
  }
  makePayment() {
    this.outPutMakePayment.emit(true)
  }
  voidOrder() {
    this.outPutVoidOrder.emit(true)
  }
  suspendOrder() {
    this.outPutSuspendOrder.emit(true)
  }
  removeSuspension() {
    this.outPutRemoveSuspension.emit(true)
  }
  toggleSuspension() {
    this.outPutToggleSuspension.emit(true)
  }
  deleteOrder() {
    this.outPutDeleteOrder.emit(true)
  }
  clearOrder() {
    this.outPutClearOrder.emit(true)
  }

  removeDiscounts() {
    this.outPutRemoveDiscount.emit(true)
  }

  textNotify() {
    this.outPutTextNotify.emit(true)
  }

  emailNotifyOrder() {
    this.outPutEmailNotifyOrder.emit(true)
  }

  drawerDropAction(value: number) {
    const dropValues = {cashdrop: value}
    this.router.navigate(['/balance-sheet-edit', dropValues])
  }

  openBalanceSheetAction() {
    this.router.navigate(['/balance-sheet-edit'])
  }

  get orderHasDiscounts() {
    return true;
  }

  async openCashDrawer(value: number) {
    await this.balanceSheetMethods.openDrawerOne()
  }

  sendMessage(item, order) {
    this.action$ = this.orderMethodsService.sendOrderForMessageService(item, order)
  }

  reSendOrder() {
    let extiOnFire : boolean
    if (this.posDevice) {
      if (this.posDevice.exitOrderOnFire) {
        extiOnFire = this.posDevice.exitOrderOnFire
      }
    }
    this.action$ = this.paymentsMethodsProcessService.sendToPrep(this.order, false, this.uiTransactionSetting).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  get cashDiscount() {
    const ui = this.uiTransactionSetting;

    if (ui?.dcapSurchargeOption == 3) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 2) {
      return this.roundToPrecision( this.order.subTotal * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (ui?.dcapSurchargeOption == 1 ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }
    if (!ui?.dcapSurchargeOption && ui.dcapDualPriceValue ) {
      return this.roundToPrecision( this.order.balanceRemaining * (1 + +ui.dcapDualPriceValue) , 5)
    }

  }

  setGroupName(name) {
    this.orderMethodsService.groupName = name;
  }

}
