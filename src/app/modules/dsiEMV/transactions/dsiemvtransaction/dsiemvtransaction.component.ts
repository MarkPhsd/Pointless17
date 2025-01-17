import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IPOSOrder, IPOSPayment, OperationWithAction } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { RStream } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';

import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { switchMap, Observable, of, pipe} from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { DcapMethodsService } from 'src/app/modules/payment-processing/services/dcap-methods.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-dsiemvtransaction',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './dsiemvtransaction.component.html',
  styleUrls: ['./dsiemvtransaction.component.scss']
})
export class DSIEMVTransactionComponent implements OnInit {

  processingResults: boolean;
  response: any;

  action$: Observable<any>
  payment   : any;
  amount    : number;
  message   : string;
  resultMessage: string;
  processing: boolean;
  type      : string;
  action    : number ;
  transactiondata: any;
  voidPayment : IPOSPayment;
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
  uiSetting$: Observable<TransactionUISettings>;
  uiSettings: TransactionUISettings;
  constructor(
    private paymentsMethodsProcess: PaymentsMethodsProcessService,
    private orderService          : OrdersService,
    private orderMethodService    : OrderMethodsService,
    private pOSPaymentService     : POSPaymentService,
    private siteService           : SitesService,
    public userAuthorization      : UserAuthorizationService,
    private uISettingsService:    UISettingsService,
    private dcapMethodsService: DcapMethodsService,
    private dialogRef             : MatDialogRef<DSIEMVTransactionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  )
  {
    if (data)  {
      this.payment = data?.data;
      this.amount  = data?.amount;
      this.action  = data?.action
      this.transactiondata = data;
      this.manualPrompt = data?.manualPrompt;

      if (data?.action == 2) {
        this.payment = data.voidPayment;
        this.voidPayment = data.voidPayment
      }

      console.log('data', data);
    }
  }

  ngOnInit(): void {

    this.orderMethodService.currentOrder$.subscribe(data  => {
      this.order = data;
      const i = 0;
      this.message  = 'Press process to complete transaction.'
      this.processing = false;
      this.displayAction(this.action)

      if (this.amount < 0) {
        if (this.isAuthorized) {
          this.action = 3;
          this.type = 'EMVReturn'
          this.processing = false;
        }
      }

      if (this.action == 0 || this.action == 1) {
        this.processing = false;
        this.action = 1
        this.type = 'EMVSale'
        // this.message  = 'Please check the device for input if required.'
        // setTimeout(()=>{
        //   this.process();
        // },100);
      }
    })

    this.uiSettings = this.uISettingsService._transactionUISettings.value;

  }

  get isAuthorized() {
    if (this.amount>0) {return true}
    if (this.amount<0) {
      return this.userAuthorization.isManagement
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

  process() {
    this.processing = true;
    this.message  = 'Please check the device for input if required.'
    this.resultMessage = '';
    this.processTransation();
  }

  processManual() {
    this.manualPrompt = true;
    this.process()
  }

  async dsiResetDevice() {

  }

  async testProcess() {

  }

  testSaveTransaction() {
    this.processResults(this.response)
  }

  processTransation() {
    if (this.order) {
      if (this.order.balanceRemaining < 0) {
        this.action == 3
        this.amount = Math.abs(+this.order.balanceRemaining);
        this.processRefundCard();
        return
      }
    }

    if (this.action == 0 || this.action == 1 || this.type.toLowerCase() === 'sale') {
      this.processSaleCard();
      return
    }

    if (this.action == 2 || this.type.toLowerCase() === 'void') {
      this.processVoidCard();
      return
    }

    if (this.action == 3 ||
        this.type.toLowerCase() === 'return' ||
        this.type.toLowerCase() === 'emvreturn' ||
        this.type.toLowerCase() === 'refund') {
        this.processRefundCard();
      return
    }


  }
  processTestResponse(){
    //testDevice
  }

  async processSaleCard() {

  };

  async processVoidCard() {

  };

  async processRefundCard() {

  };

  async procesPreAuthCard() {

  };

  async procesForceAuthCard() {

  };

  async procesWIC() {

  };

  async procesEBT() {

  };

  processVoidResults(response: RStream) {
    try {
      console.log('processVoidResults RStream', response.CmdResponse)
      const cmdResponse = response?.CmdResponse;
      const result =  this.dcapMethodsService.readResult(cmdResponse);
      if (!result.success) {
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
          item.payment.textResponse     = response?.CmdResponse?.TextResponse;
        } catch (error) {

        }
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
          item.payment.tranCode        = response?.TranResponse?.TranCode
          item.payment.tranType        = response?.TranResponse?.TranCode
        } catch (error) {
        }

        const site = this.siteService.getAssignedSite()
        const response$ = this.pOSPaymentService.voidPayment(site, item)

        this.action$ = response$.pipe(
          switchMap(response => {
            const id = item.payment.orderID.toString()
            return this.orderService.getOrder(site, id, false)
          }
        )).pipe(switchMap( order => {
            this.orderMethodService.updateOrderSubscription(order)
            this.orderMethodService.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
            this.message = 'Payment voided. Press cancel to continue. Order is re-opened if closed.'
            this.cancel();
          return of(order)
        }))

      }

    } catch (error) {
      console.log('Process Void Error', error)
    }
  }

  processDCAPVoidResults(response: RStream) {
    try {

      const cmdResponse = response?.CmdResponse;
      const result =  this.dcapMethodsService.readResult(cmdResponse);
      if (!result.success) {
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
          item.payment.textResponse     = response?.CmdResponse?.TextResponse;
        } catch (error) {

        }
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
          item.payment.tranCode        = response?.TranResponse?.TranCode
          item.payment.tranType        = response?.TranResponse?.TranCode
        } catch (error) {
        }

        const site = this.siteService.getAssignedSite()
        const response$ = this.pOSPaymentService.voidPayment(site, item)

        this.action$ = response$.pipe(
          switchMap(response => {
            const id = item.payment.orderID.toString()
            return this.orderService.getOrder(site, id, false)
          }
        )).pipe(switchMap( order => {
            this.orderMethodService.updateOrderSubscription(order)
            this.orderMethodService.notifyEvent('Voided - this order has been re-opened if closed.', 'Result')
            this.message = 'Payment voided. Press cancel to continue. Order is re-opened if closed.'
            this.cancel();
          return of(order)
        }))

      }

    } catch (error) {
      console.log('Process Void Error', error)
    }
  }
 processResults(response: RStream) {
    this.processing = false;
    if (!response) {
      this.message = 'Processing failed, reason unknown.'
      return
    }
    const readResponse = this.dcapMethodsService.readResult(response?.CmdResponse);
    console.log('readResponse', readResponse)
    if (readResponse?.success) {
      const item$ = this.paymentsMethodsProcess.processCreditCardResponse(response,
                    this.payment,
                    this.order);
      this.action$ =  item$.pipe(
          switchMap(data => {
          if (data) {
            setTimeout(data => {
              this.cancel();
            }, 50)
            return of(data)
          }
          }
        )
      )
    }

    return of(null)
  }

  // readResult(cmdResponse: CmdResponse): boolean {

  //   console.log('readresult', cmdResponse?.TextResponse, cmdResponse)

  //   if (!cmdResponse) {
  //     this.message = 'Processing failed, no command response.'
  //     console.log('readResult', cmdResponse, this.message)
  //     return false;
  //   }
  //   if (!cmdResponse.TextResponse) {
  //     this.message = 'Processing failed, no text ressponse.'
  //     console.log('readResult', cmdResponse, this.message)
  //     return false;
  //   }
  //   if (!cmdResponse.CmdStatus) {
  //     this.message = 'Processing failed, no cmdStatus.'
  //     console.log('readResult', cmdResponse, this.message)
  //     return false;
  //   }

  //   this.message        = cmdResponse?.TextResponse;
  //   this.resultMessage  = cmdResponse?.CmdStatus;
  //   this.processing     = false;

  //   //"AP*", "Approved", "Approved, Partial AP"
  //   const response = cmdResponse?.TextResponse.toLowerCase();

  //   const len = 'Transaction rejected because the referenced original transaction is invalid'.length;
  //   if (response.substring(0, len) === 'Transaction rejected because the referenced original transaction is invalid.') {
  //     return false;
  //   }

  //   if (response === 'Approved'.toLowerCase() || response === 'AP*'.toLowerCase() ||
  //        response === 'captured'.toLowerCase() || response === 'approval'.toLowerCase()
  //      || response === 'Approved, Partial AP'.toLowerCase()

  //   ) {
  //     // this.cancel();
  //     return true;
  //   }

  //   return false;
  // }

  cancel() {
    this.dialogRef.close();
  }

}
