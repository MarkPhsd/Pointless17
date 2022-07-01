import { Component, OnInit, Output, Input,EventEmitter, HostListener } from '@angular/core';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'pos-order-function-buttons',
  templateUrl: './pos-order-function-buttons.component.html',
  styleUrls: ['./pos-order-function-buttons.component.scss']
})

export class PosOrderFunctionButtonsComponent implements OnInit {

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
  smallDevice    : boolean;
  constructor(private platFormService: PlatformService, ) { }

  ngOnInit() {
    this.isApp = this.platFormService.isApp()
  }

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
     this.order.balanceRemaining
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

  textNotify() {
    this.outPutTextNotify.emit(true)
  }
  emailNotifyOrder() {
    this.outPutEmailNotifyOrder.emit(true)
  }

}
