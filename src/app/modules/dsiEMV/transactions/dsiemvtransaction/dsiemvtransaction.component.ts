import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPOSOrder, IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { CmdResponse, RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { switchMap, } from 'rxjs';
@Component({
  selector: 'app-dsiemvtransaction',
  templateUrl: './dsiemvtransaction.component.html',
  styleUrls: ['./dsiemvtransaction.component.scss']
})
export class DSIEMVTransactionComponent implements OnInit {

  payment   : any;
  amount    : number;
  message   : string;
  resultMessage: string;
  processing: boolean;
  type      : string;
  action    : number ;
  transactiondata: any;
  voidPayment: IPOSPayment;
  manualPrompt: boolean;
  //action = 0 or 1 = sale
  //action = 2 = void
  //action = 3 = refund
  //action = 4 = preauth
  //action = 5 = forceauth
  //action = 6 = EBT
  //action = 7 = WIC
  //void =6
  //refund = 5;
  //preauth = 3
  //preauth capture = 7
  //force = 4;

  order: IPOSOrder;

  constructor(
    private paymentsMethodsProcess: PaymentsMethodsProcessService,
    private dsiProcess            : DSIProcessService,
    private orderService          : OrdersService,
    private orderMethodService    : OrderMethodsService,
    private pOSPaymentService     : POSPaymentService,
    private siteService           : SitesService,
    private dialogRef             : MatDialogRef<DSIEMVTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {

    if (data)  {
      this.payment = data?.data;
      this.amount  = data?.amount;
      this.action  = data?.action
      this.transactiondata = data;
      this.manualPrompt = data?.manualPrompt
      if (data?.action == 2) {
        this.payment = data.voidPayment;
        this.voidPayment = data.voidPayment
      }
    }
  }

  ngOnInit(): void {

    this.orderService.currentOrder$.subscribe(data  => {
      this.order = data;
    })

    const i = 0;
     this.message  = 'Press Process to use Card'
     this.processing = false;
     this.displayAction(this.action)

     if (this.action == 0 || this.action == 1) {
       this.process();
       return
     }

  }

  displayAction(action: number) {
      if (this.action == 0 || this.action == 1) {this.type = 'Sale' }
      if (this.action == 2 ) {this.type = 'Void' }
      if (this.action == 3 ) {this.type = 'Refund' }
      if (this.action == 4 ) {this.type = 'Pre Auth' }
      if (this.action == 6 ) {this.type = 'Force Auth' }
      if (this.action == 7 ) {this.type = 'WIC' }
      //action = 2 = void
      //action = 3 = refund
      //action = 4 = preauth
      //action = 5 = forceauth
      //action = 6 = EBT
      //action = 7 = WIC
  }

  async process() {
    this.processing = true;
    this.message  = 'Please check the device for input if required.'
    this.resultMessage = '';
    setTimeout(()=>{
      this.processTransation();
    },50);
  }

  processTransation() {

    if (this.action == 0 || this.action == 1) {
      this.processSaleCard();
      return
    }

    if (this.action == 2) {
      this.processVoidCard();
      return
    }
    // if (this.action == 3) {
    //   this.processRefundCard();
    //   return
    // }
    // if (this.action == 4) {
    //   this.procesPreAuthCard();
    //   return
    // }
    // if (this.action == 5) {
    //   this.procesPreAuthCard();
    //   return
    // }
    // if (this.action == 6) {
    //   this.procesPreAuthCard();
    //   return
    // }
    // if (this.action == 7) {
    //   this.procesPreAuthCard();
    //   return
    // }
  }
  processTestResponse(){
    //testDevice
  }

  async processSaleCard() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async processVoidCard() {
    const amount = this.amount
    const payment = this.voidPayment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvVoid(payment);
    this.processVoidResults(response)
  }

  async processRefundCard() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async procesPreAuthCard() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async procesForceAuthCard() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async procesWIC() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async procesEBT() {
    const amount = this.amount
    const payment = this.payment
    if (!this.order) { return }
    const response  = await this.dsiProcess.emvSale(amount, payment.id,  this.manualPrompt, false );
    this.processResults(response)
  }

  async processVoidResults(response: any) {

    console.log('RStream', response.RStream.CmdResponse)
    const cmdResponse = response?.RStream?.CmdResponse
    const result =  this.readResult(cmdResponse);
    if (!result) {
      this.processing = false;
      return;
    }

    if (!response) {
      this.message = 'Processing failed, reason uknown.'
      this.processing = false;
      return;
    }

    if (response) {

      const item = {} as OperationWithAction;

      item.action  = this.action;
      item.payment = this.voidPayment;

      try {
        item.payment.amountPaid      = +response.TranResponse?.Amount?.Purchase;
      } catch (error) {
      }
      try {
        item.payment.tipAmount       = +response?.TranResponse?.Amount?.Gratuity;
      } catch (error) {
      }
      try {
        item.payment.captureStatus   = response?.TranResponse?.CaptureStatus;
      } catch (error) {
      }
      try {
        item.payment.entryMethod     = response?.TranResponse?.EntryMethod;
      } catch (error) {
      }
      try {
        item.payment.applicationLabel= response?.TranResponse?.ApplicationLabel;
      } catch (error) {
      }
      try {
        item.payment.captureStatus   = response?.TranResponse?.CaptureStatus;
      } catch (error) {
      }
      try {
        item.payment.amountReceived  = +response?.TranResponse?.Amount?.Purchase;
      } catch (error) {
      }
      try {
        item.payment.processData     = response?.TranResponse?.ProcessData;
      } catch (error) {
      }
      try {
        item.payment.trancode        = response?.TranResponse?.TranCode
      } catch (error) {
      }

      const site = this.siteService.getAssignedSite()
      const response$ = this.pOSPaymentService.voidPayment(site, item)

      response$.pipe(
        switchMap(response => {
          const id = item.payment.orderID.toString()
          const item$ = this.orderService.getOrder(site, id, false)
          return item$
        }
      )).subscribe( order => {
        this.orderService.updateOrderSubscription(order)
        this.orderMethodService.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
        this.message = 'Payment voided. Press cancel to continue. Order is re-opened if closed.'
      })

      // // const cmdResponse =  await this.paymentsMethodsProcess.processCreditCardResponse(response, this.payment, this.order)
      // this.readResult(cmdResponse);
    }
  }

  async processResults(response:RStream) {
    if (!response) {
      this.message = 'Processing failed, reason uknown.'
      this.processing = false;
    }
    if (response) {
      const cmdResponse =  await this.paymentsMethodsProcess.processCreditCardResponse(response, this.payment, this.order)
      this.readResult(cmdResponse);
    }
  }

  readResult(cmdResponse: CmdResponse): boolean {
    console.log('cmdResponse', cmdResponse)
    if (!cmdResponse) {
      this.message = 'Processing failed, no command response.'
      return false;
    }
    if (!cmdResponse.TextResponse) {
      this.message = 'Processing failed, no text ressponse.'
      return false;
    }
    if (!cmdResponse.CmdStatus) {
      this.message = 'Processing failed, no cmdStatus.'
      return false;
    }

    this.message        = cmdResponse?.TextResponse;
    this.resultMessage  = cmdResponse?.CmdStatus;

    this.processing     = false;

    //"AP*", "Approved", "Approved, Partial AP"
    if (cmdResponse.TextResponse.toLowerCase() === 'Approved'.toLowerCase() || cmdResponse.TextResponse.toLowerCase() === 'AP*'.toLowerCase()
       ||cmdResponse.TextResponse.toLowerCase() === 'Approved, Partial AP'.toLowerCase()
    ) {
      this.cancel();
      return true;
    }

    return false;
  }

  cancel() {
    this.dialogRef.close();
  }

}
