import { Component, OnInit, Output, Input,EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-function-buttons',
  templateUrl: './pos-order-function-buttons.component.html',
  styleUrls: ['./pos-order-function-buttons.component.scss']
})

export class PosOrderFunctionButtonsComponent implements OnInit, OnDestroy {

  isApp = false;
  @Output() outPutSendToPrep    = new EventEmitter();
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
  @Output() outPutClearOrder    = new EventEmitter();
  @Output() outPutToggleSuspension = new EventEmitter();
  @Output() outPutEmailOrder    = new EventEmitter();
  @Output() outPutEmailNotifyOrder = new EventEmitter();
  @Output() outPutTextNotify       = new EventEmitter();
  @Output() outPutRemoveDiscount = new EventEmitter();
  @Output() outPutRefundItem         = new EventEmitter();
  @Output() outPutRefundOrder         = new EventEmitter();

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

  assignedItems   : Subscription;
  refundItems     : boolean;
  smallDevice     : boolean;

  constructor(private platFormService: PlatformService,
              private orderMethodsService: OrderMethodsService ) { }

  ngOnInit() {
    this.isApp = this.platFormService.isApp();
    // this.initSubscriptions();
  }

  // initSubscriptions() {
  //   this.assignedItems = this.orderMethodsService.assignedPOSItems$.subscribe(data => {
  //     this.refundItems = false;
  //     if (data && data.length> 0) {
  //       this.refundItems = true;
  //     }
  //   })
  // }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.assignedItems) {
      this.assignedItems.unsubscribe()
    }
  }

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
     this.order.balanceRemaining
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
