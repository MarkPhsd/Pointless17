import { Component, ElementRef, OnInit,  ViewChild, Input,AfterViewInit, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,  IPOSPayment,  ISetting, PosPayment } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
@Component({
  selector: 'app-receipt-view',
  templateUrl: './receipt-view.component.html',
  styleUrls: ['./receipt-view.component.scss']
})
export class ReceiptViewComponent implements OnInit , AfterViewInit,OnDestroy{

  @ViewChild('receipt')      receiptTemplate: TemplateRef<any>;
  @ViewChild('balanceSheet') balanceSheetTemplate: TemplateRef<any>;

  @Input() autoPrint : boolean;
  @Input() hideExit = false;
  @Output() outPutExit      = new EventEmitter();
  @ViewChild('printsection') printsection: ElementRef;
  @Input() printerName      : string;
  @Input() options           : printOptions;

  _printView: Subscription;
  printView               = 1;

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

  intSubscriptions() {
    if (this.printView == 1 ) {
      this.order$ = this.orderService.currentOrder$.pipe(
        switchMap(data => {
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
          console.log(payment)
          if (payment) {
            // this.tempPayments.filter((data) => {
            //   return data.id == payment.id;
            // });
            this.payments = [];
            this.payments.push(payment)
          } else {
            this.payments = this.tempPayments;
          }

          return of(payment)
        })
      )
    }



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
    public orderService          : OrdersService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private platFormService       : PlatformService,
    private printingService       : PrintingService,
    private printingAndroidService: PrintingAndroidService,
    private btPrinterService      : BtPrintingService,
    private orderMethodService    : OrderMethodsService,
    )
  {}

  async ngOnInit() {
    this.initPrintView() //done

    await this.getAndroidPrinterAssignment()
    this.getElectronPrinterAssignent()

    this.intSubscriptions();
    this.refreshViewObservable()
  }

  ngOnDestroy(): void {
    this.printingService.updatePrintView(1);
    if(this._order) { this._order.unsubscribe() }
  }

  ngAfterViewInit() {
    this.layout$ = this.initDefaultLayoutsObservable()
  }

  initPrintView() {
    this.printView = this.printingService.printView;
    if (!this.printingService.printView) {
      this.printingService.updatePrintView(1);
      this.printView = 1;
    }
  }

  email() {
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.email) {
      this.email$ =  this.orderMethodService.emailOrder(this.order).pipe(
          switchMap(data => {
            if (data === 'Success') {
              this.orderMethodService.notifyEvent('Email Sent', 'Success')
              this.exit();
              return;
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

      this.exit();
      return
    }

    this.orderMethodService.emailOrderByEntry(this.order)
    this.exit();

  }

  get currentView() {
    if (this.printingService.printView == 2) {
      return this.balanceSheetTemplate
    }
    if (this.printingService.printView == 1) {
      return this.receiptTemplate
    }
  }

  refreshViewObservable(){
    const receipt$  =  this.getDefaultPrinterOb();

    if (!this.isElectronApp) { return of(null)};

    this.refreshView$ = receipt$.pipe(
      switchMap(data => {
        if (!data) { return };
        this.electronReceiptSetting = data;
        this.receiptID   =  +data.option1;
        this.printerName =  data.text;

        if (this.printingService.printView  == 2) {
          return this.initBalanceSheetDefaultLayoutsObservable()
        }

        return of(this.applyStylesObservable());

      })).pipe(
        switchMap( data => {
          if (this.receiptID && data ) {
            this.initDefaultLayoutsObservable()
          }
          return this.getDeviceInfo()
        })
      ).pipe(
        switchMap( data => {
          // console.log('getting terminal settings', data)
          if (data && data.text) {
            const item  = JSON.parse(data.text) as ITerminalSettings
            // console.log('getting terminal settings', item)
            if (item) {
              if (this.platFormService.isAppElectron) {
                if (item.receiptPrinter) {
                  this.printerName = item.receiptPrinter
                }
              }
            }
          }
          return of(data)

        })
    )
    return of(null)
  }

  getDeviceInfo(): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const device = localStorage.getItem('devicename');
    return  this.settingService.getSettingByNameCached(site, device)
  }

  initDefaultLayoutsObservable() {
    try {
      const site = this.siteService.getAssignedSite();
      this.printingService.initDefaultLayouts();

      if (this.receiptStyles)  {
        this.receiptStyles  = this.applyStyle(this.receiptStyles)
        return of(this.receiptStyles)
      };

      //could be altered for alternate type
      this.receiptName =  'defaultElectronReceiptPrinterName'

      const receipt$ = this.settingService.getSettingByNameCachedNoRoles(site, this.receiptName)
      return receipt$.pipe(
        switchMap(data => {
          this.receiptID = data.id
          return this.settingService.getSetting(site, +data.option1)
      })).pipe(
        switchMap(data => {
        this.initSubComponent(data)
        return of(data)
      }))

    } catch (error) {
      console.log(error)
    }

    return of(null)
  }

  // async  initDefaultLayouts() {
  //   try {
  //     const site = this.siteService.getAssignedSite();
  //     await this.printingService.initDefaultLayouts();
  //     if (!this.receiptStyles) { this.receiptStyles  = await this.applyStyles(); }
  //     if (this.receiptStyles)  { this.receiptStyles  = this.applyStyle(this.receiptStyles) };

  //     //could be altered for alternate type
  //     this.receiptName =  'defaultElectronReceiptPrinterName'

  //     const receipt$ = this.settingService.getSettingByNameNoRoles(site, this.receiptName)
  //     receipt$.pipe(
  //       switchMap(data => {
  //         this.receiptID = data.id
  //         return this.settingService.getSetting(site, +data.option1)
  //     })).subscribe(data => {
  //       this.initSubComponent(data)
  //     })

  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  async  initBalanceSheetDefaultLayouts() {
    try {
      // 'apply balance sheet style'
      const site = this.siteService.getAssignedSite();
      const setting = {} as ISetting;
      setting.text  = await  this.printingService.appyBalanceSheetStyle()
      this.receiptStyles =  setting;
      this.applyStyle( this.receiptStyles)
    } catch (error) {
      console.log(error)
    }
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

  // async applyStyles(): Promise<ISetting> {
  //   const site  = this.siteService.getAssignedSite();
  //   this.receiptStyles  = await  this.printingService.appyStylesCached(site)
  //   this.applyStyle(this.receiptStyles)
  //   return  this.receiptStyles
  // }

  applyStylesObservable(): Observable<ISetting> {
    const site  = this.siteService.getAssignedSite();
    return this.printingService.appyStylesCachedObservable(site).pipe(
        switchMap( data => {
          this.receiptStyles  =  data
          this.applyStyle(this.receiptStyles)
          return of(data)
        }
      )
    )
  }

  applyStyle(receiptStyles) {
    if (receiptStyles && receiptStyles.text) {
      const style             = document.createElement('style');
      style.innerHTML         =  receiptStyles.text;
      document.head.appendChild(style);
      return this.receiptStyles
    }
  }

  async applyBalanceSheetStyles(): Promise<ISetting> {
      const value = await  this.printingService.appyBalanceSheetStyle();
      const style             = document.createElement('style');
      style.innerHTML         = value;
      document.head.appendChild(style);
      return  this.receiptStyles
  }

  getDefaultPrinterOb(): Observable<any> {
    return this.printingService.getElectronReceiptPrinterCached()
  }

  setDefaultPrinter(item: ISetting) {
    if (!item) { return}
    this.electronReceiptSetting = item;
    this.receiptID   =  +item.option1;
    this.printerName =  item.text;
    return this.receiptID;
  }

  getPrinterName()  {

  }

  initSubComponent(receiptPromise: ISetting): boolean {
    if (receiptPromise ) {
      this.receiptLayoutSetting =  receiptPromise
      this.headerText           =  this.receiptLayoutSetting.option6
      this.footerText           =  this.receiptLayoutSetting.option5
      this.itemsText            =  this.receiptLayoutSetting.text
      this.paymentsText         =  this.receiptLayoutSetting.option7
      this.paymentsCreditText   = this.receiptLayoutSetting.option10;
      this.paymentsWICEBTText    = this.receiptLayoutSetting.option11;
      this.subFooterText        =  this.receiptLayoutSetting.option8
      return true
    }
  }

  getReceiptContents(styles: string) {
    const prtContent     = document.getElementById('printsection');
    if (!prtContent) { return  }
    const content        = `${prtContent.innerHTML}`
    if (!content) { return }

    const  title = 'Receipt';
    const loadView       = ({ title }) => {
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
      if (this.platFormService.webMode) { this.convertToPDF();}
      return
    }
    if (this.platFormService.isAppElectron) {
      const result = this.printElectron()
      return
    }
    if (this.platFormService.androidApp) {this.printAndroid();}
    if (this.platFormService.webMode) { this.convertToPDF();}
  }

  convertToPDF() {
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  async printElectron() {
    const styles   = this.receiptStyles.text;
    const contents = this.getReceiptContents(styles)
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

  savePDF() {
    this.printingService.savePDF(this.printsection.nativeElement, this)
  }

  async printAndroid() {
    //create fake date for order. - get order info from postman to use.
    //passorder info to new method PrintAndroidReceipt.'
    //save selected printer to local storage
    //set saved printer name /bt id to selection on load.
    // const order = this.fakeData.getPOSOrderContents()
    // this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
    // this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    this.printingAndroidService.printTestAndroidReceipt( this.btPrinter)
  }

  exit() {
    this.outPutExit.emit('true')
  }

  getElectronPrinterAssignent() {
    if (this.platFormService.isAppElectron) {
      const receipt$ = this.getElectronReceiptPrinterAssignentOBS();
      receipt$.subscribe(data =>{})
      const label$ = this.getLabelPrinterOBS()
      label$.subscribe(data =>{})
    }
  }

  getElectronReceiptPrinterAssignentOBS() {
    if (this.platFormService.isAppElectron) {
       this.printingService.getElectronReceiptPrinter().pipe(
          switchMap(data => {
          this.electronSetting        = data;
          this.electronReceiptPrinter = data.text;
          this.electronReceipt        = data.value ;
          this.electronReceiptID      = +data.option1
          if (this.printOptions) {
            this.printOptions.deviceName = data.text
          }
          return of(data)
        })
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

  async  getAndroidPrinterAssignment() {
    if (this.platFormService.androidApp) {
      this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
      this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    }
  }

}

