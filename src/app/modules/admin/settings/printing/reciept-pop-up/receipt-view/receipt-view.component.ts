import { Component, ElementRef, OnInit,  ViewChild, Input,Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,   ISetting, PosPayment } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { catchError, Observable, of, Subscription, switchMap } from 'rxjs';

import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-receipt-view',
  templateUrl: './receipt-view.component.html',
  styleUrls: ['./receipt-view.component.scss']
})
export class ReceiptViewComponent implements OnInit , OnDestroy{

  @ViewChild('printsection')        printsection: ElementRef;
  @ViewChild('receiptTemplate' ,{static: false})      receiptTemplate: TemplateRef<any>;
  @ViewChild('balanceSheetTemplate',{static: false})  balanceSheetTemplate: TemplateRef<any>;
  @ViewChild('balanceSheetValues',{static: false})    balanceSheetValues: TemplateRef<any>;
  @ViewChild('cashDropView',{static: false})          cashDropView:   TemplateRef<any>;

  @Input() autoPrint : boolean;
  @Input() hideExit = false;
  @Output() outPutExit      = new EventEmitter();

  @Input() printerName      : string;
  @Input() options           : printOptions;

  _printView: Subscription;
  // printView               = 1;

  receiptLayoutSetting      : ISetting;
  receiptStyles             : ISetting;
  zplText                   : string;

  imageToShow       : any;
  headerText        : string;
  itemsText         : string;
  footerText        : string;
  paymentsText      : string;
  paymentsCreditText: string;
  paymentsWICEBTText: string;
  subFooterText     : string;
  receiptName       : 'defaultElectronReceiptPrinterName';

  receiptList$      : Observable<ISetting[]>;
  labelList$        : Observable<ISetting[]>;
  prepReceiptList$  : Observable<ISetting[]>;
  receiptID         : number;

  refreshView$      : Observable<any>;

  items             : any[];
  orders            : any;
  payments          : any[];
  orderTypes        : any;
  platForm          = '';

  printOptions    : printOptions;
  result            : any;
  isElectronServiceInitiated = false;

  btPrinters        : any=[];
  btPrinters$       : any;
  btPrinter         : string;
  imageConversion   : any;

  @Input() order    : IPOSOrder;

  _order            : Subscription;
  subscriptionInitialized: boolean;
  electronReceiptSetting: ISetting;
  _printReady       : Subscription;
  printReady        : boolean

  orderCheck        = 0;

  isElectronApp         : boolean;
  electronSetting       : ISetting;
  electronReceiptPrinter: string;
  electronReceipt       : string;
  electronReceiptID     : number;

  electronLabelPrinter: string;
  electronLabelPrinterSetting: ISetting;
  electrongLabelID     : number;
  electronLabel        : string;

  autoPrinted       = false;
  email$: Observable<any>;
  printAction$: Observable<any>;
  layout$: Observable<any>;
  order$ : Observable<any>;

  tempPayments: PosPayment[];

  printView: number;
  groupID = 0

  intSubscriptions() {

    this.groupID = this.printingService.currentGroupID
    this.printingService.printView$.subscribe(data => {
        if (!data) { this.printingService._printView.next(1); }
        this.printView = data;
        if (!this.printView) {this.printView = 1; }
        if (this.printView == 1) { this.setOrderPrintView()}
        if (this.printView == 2) { }// this.setOrderPrintView()
        this.refreshView$ =  this.refreshViewObservable()
      }
    )

    this._printReady = this.printingService.printReady$.subscribe(status => {
      if (status) {
          if ((this.options && this.options.silent) || this.autoPrint) {
            this.print();
            this.autoPrinted = true;
          }
        }
      }
    )
  }

  constructor(
    public orderService           : OrdersService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private platFormService       : PlatformService,
    public  printingService       : PrintingService,
    private orderMethodService    : OrderMethodsService,
    private router: Router
    )
  {}

  ngOnInit() {
    this.isElectronApp = this.platFormService.isAppElectron
    this.initPrintView() //done
    this.intSubscriptions();
  }

  ngOnDestroy(): void {
    this.printingService.updatePrintView(1);
    if(this._order) { this._order.unsubscribe() }
    this.printingService.currentGroupID = 0;
    this.orderService.printOrder = null;
  }

  refreshViewObservable(){
    const defaultReceipt$ =  this.getDefaultReceipt()
    const receipt$        =  this.getDefaultPrinterOb();
    const styles$         =  this.getStylesForPrintOut()
    const deviceInfo$     =  this.getDeviceInfo()

    return receipt$.pipe(
      switchMap(data => { return defaultReceipt$ })
          ,catchError(e => {
                    // console.log('e 1', e)
            this.siteService.notify('Error defaultReceipt receipt view' + e, 'Alert', 2000)
            return of(null)
          })).pipe(
      switchMap(data => { return styles$ })
          ,catchError(e => {
            // console.log('e 2', e)
            this.siteService.notify('Error  stylesreceipt view' + e, 'Alert', 2000)
            return of(null)
          })).pipe(
      switchMap(data => { return deviceInfo$}
          ),catchError(e => {
            // console.log('e 3', e)
            this.siteService.notify('Error deviceInfo receipt view' + e, 'Alert', 2000)
            return of(null)
          })).pipe(
      switchMap(data => {
        return of(data)
        }),catchError(e => {
            // console.log('e4' , e)
            this.siteService.notify('Error receipt view' + e, 'Alert', 2000)
            return of(null)
      }))

  }

  printViewCompleted(event) {
    console.log('print View Completed Fired')
    if (this.autoPrint) {
      this.print();
      this.exit()
    }
  }

  getDefaultPrinterOb(): Observable<any> {
    return this.printingService.getElectronReceiptPrinterCached().pipe(
      switchMap(data => {
        if (!data) { return };
        this.electronReceiptSetting = data;
        this.receiptID   =  +data.option1;
        this.printerName =  data.text;
        return of(data)
      })
    )
  }

  getStylesForPrintOut() {
    let ob$ : Observable<any>
    if (this.printingService.printView  == 2 || this.printingService.printView  == 3 || this.printingService.printView  == 4) {
      ob$ = this.initBalanceSheetDefaultLayoutsObservable()
    }
    if (this.printingService.printView  == 1 || !this.printingService.printView) {
      ob$ = this.applyStylesObservable()
    }
    return ob$
  }

  //Step 1
  getDefaultReceipt() {
    const site        = this.siteService.getAssignedSite();
    this.receiptName  =  'defaultElectronReceiptPrinterName'
    const defaultReceipt$ = this.settingService.getSettingByNameCachedNoRoles(site, this.receiptName)
    return defaultReceipt$.pipe(
      switchMap(data => {
        this.receiptID = data.id
        return this.settingService.getSetting(site, +data.option1)
    })).pipe(
      switchMap(data => {
      this.initSubComponent(data)
      return of(data)
    }))
  }

  applyStyle(receiptStyles: ISetting) {
    return this.printingService.applyStyle(receiptStyles)
  }

  openLink() {
    this.router.navigate(['/qr-receipt/',  {orderCode: this.order.orderCode}])
    this.exit();
  }

  initPrintView() {
    // // this.printView = this.printingService.printView;
    // if (!this.printingService.printView) {
    //   this.printingService.updatePrintView(1);
    // }
  }

  email() {
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.email) {
        const email = this.order.clients_POSOrders.email;
        this.email$ =  this.orderMethodService.emailOrderFromEntry(this.order, email).pipe(
          switchMap(data => {
            if (data === 'Success') {
              this.orderMethodService.notifyEvent('Email Sent', 'Success')
              this.exit();
              return of (data)
            }
            if (data && data.isSuccessStatusCode || data === 'Success') {
              this.orderMethodService.notifyEvent('Email Sent', 'Success')
            }
            if (!data || !data.isSuccessStatusCode) {
              this.orderMethodService.notifyEvent('Email not sent. Check email settings', 'Failed')
            }
            return of (data)
          }
        )
      )
      return;
    }
    this.orderMethodService.emailOrderByEntry(this.order)
    this.exit();
  }

  getDeviceInfo(): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const device = localStorage.getItem('devicename');
    return  this.settingService.getSettingByNameCached(site, device).pipe(switchMap(data => {
      const item  = JSON.parse(data.text) as ITerminalSettings
      if (item) {
        if (this.platFormService.isAppElectron) {
          if (item.receiptPrinter) {
            this.printerName = item.receiptPrinter
          }
        }
      }
      return of(data)
    }))
  }

  initBalanceSheetDefaultLayoutsObservable() {
    // 'apply balance sheet style'
    const site = this.siteService.getAssignedSite();
    const setting = {} as ISetting;
    return this.printingService.appyBalanceSheetStyleObservable().pipe(
      switchMap(data => {
        setting.text  = data;
        this.receiptStyles =  setting;
        this.applyStyle( this.receiptStyles)
        return of(this.receiptStyles)
      })
    )
  }

  applyStylesObservable(): Observable<ISetting> {
    const site  = this.siteService.getAssignedSite();
    return this.printingService.appyStylesCachedObservable(site).pipe(
        switchMap( data => {
          this.receiptStyles  =  data
          this.applyStyle(data)
          return of(data)
        }
      )
    )
  }

  async applyBalanceSheetStyles(): Promise<ISetting> {
    return this.printingService.applyBalanceSheetStyles()
  }

  setDefaultPrinter(item: ISetting) {
    if (!item) { return}
    this.electronReceiptSetting = item;
    this.receiptID   =  +item.option1;
    this.printerName =  item.text;
    return this.receiptID;
  }

  getPrinterName() {
  }

  ///step 1B
  initSubComponent(receiptPromise: ISetting): boolean {
    if (receiptPromise ) {
      this.receiptLayoutSetting =  receiptPromise
      this.headerText           =  this.receiptLayoutSetting.option6
      this.footerText           =  this.receiptLayoutSetting.option5
      this.itemsText            =  this.receiptLayoutSetting.text
      this.paymentsText         =  this.receiptLayoutSetting.option7
      this.paymentsCreditText   =  this.receiptLayoutSetting.option10;
      this.paymentsWICEBTText   =  this.receiptLayoutSetting.option11;
      this.subFooterText        =  this.receiptLayoutSetting.option8
      return true
    }
  }

  get currentView() {
    if (this.printView == 4) {
      return this.cashDropView
    }
    if (this.printView == 3) {
      return this.balanceSheetValues
    }
    if (this.printView == 2) {
      return this.balanceSheetTemplate
    }
    if (this.printView == 1) {
      return this.receiptTemplate
    }
    if (!this.printView) {
      this.printView = 1;
      return this.receiptTemplate
    }
  }

  getReceiptContents(styles: string) {

    let  prtContent = document.getElementById('printsection');

    if ( prtContent == null) { return }
    if ( !prtContent )       { return }
    const content        = `${ prtContent.innerHTML }`
    if (!content)            { return }

    const  title   = 'Receipt';
    const loadView = ({ title }) => {
      return (`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${styles}</style>
            <title>${title}</title>
            <meta charset="UTF-8">
          </head>
          <body>
            <div id="view">${content}</div>
          </body>
        </html>
      `)
    }
    const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
      title: "Receipt"
    }));
    return file
  }

  print() {
    if (!this.printerName) {
      if (this.platFormService.webMode) { this.convertToPDF() }
      return
    }
    if (this.platFormService.isAppElectron) {
      const result = this.printElectron()
      return
    }
    if (this.platFormService.webMode)    {this.convertToPDF() }
  }

  printElectron() {
    let styles
    if (this.receiptStyles) {
      styles = this.receiptStyles.text;
      const contents = this.getReceiptContents(styles)
      if (!contents) { return }
      const options  = {
        silent: true,
        printBackground: false,
        deviceName: this.printerName
      } as printOptions;
      if (!contents) { console.log('no contents in print electron')}
      if (!options) { console.log('no options in print electron')}
      if (!this.printerName) { console.log('no printerName in print electron')}
      if (contents && this.printerName, options) {
          this.printingService.printElectron( contents, this.printerName, options)
      }
    }
  }

  savePDF() {
    this.printingService.savePDF(this.printsection.nativeElement, this)
  }

  convertToPDF() {
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  exit() {
    this.outPutExit.emit('true')
  }

  getLabelPrinterAssignment() {
    const label$ = this.getLabelPrinterOBS()
    label$.subscribe(data =>{})
    return label$
  }

  getElectronReceiptPrinterAssignentOBS() {
    if (this.platFormService.isAppElectron) {
      return this.printingService.getElectronReceiptPrinter().pipe(
          switchMap(data => {
            this.electronSetting        = data;
            this.electronReceiptPrinter = data.text;
            this.electronReceipt        = data.value ;
            this.electronReceiptID      = +data.option1
            if (this.printOptions) {
              this.printOptions.deviceName = data.text
            }
            return of(data);
          }
        )
      )
    }
    return of(null)
  }

  getLabelPrinterOBS() {
    return  this.printingService.getElectronLabelPrinter().pipe(
      switchMap(data => {
          this.electronLabelPrinterSetting        = data;
          this.electronLabelPrinter               = data.text;
          this.electrongLabelID                   = +data.option1
          return of(data)
        }
      )
    )
  }

  setOrderPrintView() {
    if (this.printView == 1  || !this.printView) {
      this.order$ = this.getOrder();
    }
  }

  getOrder() {
     let printOrder$  = of(this.orderService.printOrder);
     if (!this.orderService.printOrder) {
      printOrder$ = this.orderService.currentOrder$
     }

     return printOrder$.pipe(switchMap(data => {
         return of(data)
      })).pipe(switchMap(data => {
            this.order      = data;
            this.orders     = [];
            if (!data)       {return}
            this.orders.push(data)
            if (data.posPayments) {
              this.tempPayments   = data.posPayments
            }
            if (data.posOrderItems) {
              this.items      = data.posOrderItems
            }
            return  this.orderService.getSelectedPayment()
          }
        )
      ).pipe(switchMap(payment => {
          if (payment) {
            this.payments = [];
            // this.payments[0].
            this.payments.push(payment)
          } else {
            this.payments = this.tempPayments;
          }
          return of(this.order)
        }
      ),catchError(e => {

        return of(null)
      })
    )
  }
}

  // async printAndroid() {
  //   //create fake date for order. - get order info from postman to use.
  //   //passorder info to new method PrintAndroidReceipt.'
  //   //save selected printer to local storage
  //   //set saved printer name /bt id to selection on load.
  //   // const order = this.fakeData.getPOSOrderContents()
  //   // this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
  //   // this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
  //   this.printingAndroidService.printTestAndroidReceipt( this.btPrinter)
  // }

  // async  getAndroidPrinterAssignment() {
  //   if (this.platFormService.androidApp) {
  //     this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
  //     this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
  //   }
  // }


  // async applyStyles(): Promise<ISetting> {
  //   const site  = this.siteService.getAssignedSite();
  //   this.receiptStyles  = await  this.printingService.appyStylesCached(site)
  //   this.applyStyle(this.receiptStyles)
  //   return  this.receiptStyles
  // }

    // async  initBalanceSheetDefaultLayouts() {
  //   try {
  //     // 'apply balance sheet style'
  //     const site = this.siteService.getAssignedSite();
  //     const setting = {} as ISetting;
  //     setting.text  = await  this.printingService.appyBalanceSheetStyle()
  //     this.receiptStyles =  setting;
  //     this.applyStyle( this.receiptStyles)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
