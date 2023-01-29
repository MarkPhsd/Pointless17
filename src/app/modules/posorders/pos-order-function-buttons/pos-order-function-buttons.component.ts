import { Component, OnInit, Output, Input,EventEmitter, HostListener, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ThumbnailsPosition } from '@ngx-gallery/core';
import { TouchBarOtherItemsProxy } from 'electron';
import { Subscription } from 'rxjs';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-function-buttons',
  templateUrl: './pos-order-function-buttons.component.html',
  styleUrls: ['./pos-order-function-buttons.component.scss']
})

export class PosOrderFunctionButtonsComponent implements OnInit, OnDestroy {

  @ViewChild('payButton')     payButton: TemplateRef<any>;
  @ViewChild('exitButton')    exitButton: TemplateRef<any>;
  @ViewChild('refundOrderButton')  refundOrderButton: TemplateRef<any>;
  @ViewChild('cancelButton') cancelButton: TemplateRef<any>;


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
  @Input() isUser      : boolean;
  @Input() isAuthorized: boolean;
  @Input() openBar     : boolean;
  @Input() mainPanel   : boolean;
  @Input() order       : IPOSOrder;
  @Input() emailOption : boolean;
  @Input() ssmsOption : boolean;
  @Input() refundItemEnabled: boolean;
  @Input() purchasOrderEnabled: boolean;

  listView: Boolean;

  assignedItems   : Subscription;
  refundItems     : boolean;
  smallDevice     : boolean;

  constructor(private platFormService: PlatformService,
              public userAuthorizationService: UserAuthorizationService,
              private orderMethodsService: OrderMethodsService ) { }

  ngOnInit() {
    this.isApp = this.platFormService.isApp();
    // this.initSubscriptions();
    this.refreshWindowInfo();
  }

  toggleListView() {
    this.listView = !this.listView;
    this.outPutListView.emit(this.listView)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.assignedItems) {
      this.assignedItems.unsubscribe()
    }
  }

  @HostListener("window:resize", [])
  refreshWindowInfo() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
     this.order.balanceRemaining

     this.spacer1 = null;
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
      this.spacer5 = this.exitButton;
      // this.spacer11 = this.clearDiscounts
      this.spacer11 = this.payButton
      // this.spacer4 = this.vipButton
     }
     
     if (window.innerWidth >= 954 && window.innerWidth < 1024) { 
      this.spacer11 = null;
      this.spacer11 = this.payButton
      this.spacer12 = null
     }

     if (window.innerWidth >= 1024 && window.innerWidth <= 1565) { 
      // this.spacer1 = this.exitButton
      this.spacer5 = this.exitButton
      this.spacer1 = this.cancelButton
      this.spacer11 = this.payButton
      this.spacer12 = null

      this.windowSize = 'medium'
     }
     if (window.innerWidth >= 1366 && window.innerWidth < 1564) {
      // this.spacer5 = this.exitButton
      this.spacer12 = null;
      this.spacer7 = this.payButton;
      this.spacer11 = null;
      // this.spacer11 = this.vipButton
      this.windowSize = 'large'
      // this.spacer3 = this.payButton
     }
     if (  window.innerWidth > 1564) {
      this.spacer5 = this.exitButton
      this.spacer11 = null;
      this.spacer12 = null
      this.spacer4 = this.payButton;
      // this.spacer7 = this.payButton;// this.payButton;
      // this.spacer4 = this.vipButton
      this.windowSize = 'large'
      // this.spacer3 = this.payButton
     }
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

  get orderHasDiscounts() {
    return true;
  }

}
