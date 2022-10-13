import { Component, ElementRef, OnInit,  ViewChild, Input,AfterViewInit, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,  ISetting } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { Observable, Subscription, switchMap } from 'rxjs';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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

  intSubscriptions() {
    if (this.printView == 1 ) {
      this._order       = this.orderService.currentOrder$.subscribe(data => {
        this.order      = data;
        this.orders     = [];
        if (!data)       {return}
        this.orders.push(data)
        if (data.posPayments) {
          this.payments   = data.posPayments
        }
        if (data.posOrderItems) {
          this.items      = data.posOrderItems
        }
      })
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
    this.initPrintView()
    this.getPrinterAssignment();
    this.intSubscriptions();
    await this.refreshView()
  }


  ngOnDestroy(): void {
    this.printingService.updatePrintView(1);
    if(this._order) { this._order.unsubscribe() }
  }

  ngAfterViewInit() {
    this.initDefaultLayouts()
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
      this.orderMethodService.emailOrder(this.order).subscribe(data => {
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
      })
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

  async refreshView(){
    const receiptID  = await this.getDefaultPrinter();
    if (this.printingService.printView  == 2) {
      this.initBalanceSheetDefaultLayouts()
      return;
    }

    const styles  = await this.applyStyles();
    if (receiptID && styles ) {
      this.initDefaultLayouts()
    }
  }

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

  async  initDefaultLayouts() {
    try {
      const site = this.siteService.getAssignedSite();
      await this.printingService.initDefaultLayouts();
      if (!this.receiptStyles) { this.receiptStyles  = await this.applyStyles(); }
      if (this.receiptStyles)  { this.receiptStyles  = this.applyStyle(this.receiptStyles) };

      //could be altered for alternate type
      this.receiptName =  'defaultElectronReceiptPrinterName'

      const receipt$ = this.settingService.getSettingByNameNoRoles(site, this.receiptName)
      receipt$.pipe(
        switchMap(data => {
          this.receiptID = data.id
          console.log('receipt layoutid', data.option1)
          return this.settingService.getSetting(site, +data.option1)
      })).subscribe(data => {
        this.initSubComponent(data)
      })

    } catch (error) {
      console.log(error)
    }
  }

  async applyStyles(): Promise<ISetting> {
    const site  = this.siteService.getAssignedSite();
    this.receiptStyles  = await  this.printingService.appyStylesCached(site)
    this.applyStyle(this.receiptStyles)
    return  this.receiptStyles
  }

  applyStyle(receiptStyles) {
    if (receiptStyles && receiptStyles.text) {
      const style             = document.createElement('style');
      style.innerHTML         =  receiptStyles.text;
      document.head.appendChild(style);
      return this.receiptStyles
    }
  }

  // refreshViewOB() {
  //   const site  = this.siteService.getAssignedSite();
  //   const style$ =  this.printingService.getStylesCached(site);
  //   style$.pipe(
  //     switchMap( style => {
  //       return this.printingService.setHTMLReceiptStyle(style)
  //     })).subscribe()
  // }

  async applyBalanceSheetStyles(): Promise<ISetting> {
      const value = await  this.printingService.appyBalanceSheetStyle();
      const style             = document.createElement('style');
      style.innerHTML         = value;
      document.head.appendChild(style);
      return  this.receiptStyles
  }

  async getDefaultPrinter(): Promise<number> {
    const item       = await this.printingService.getElectronReceiptPrinterCached().toPromise()
    if (!item) { return}
    this.electronReceiptSetting = item;
    this.receiptID   =  +item.option1;
    this.printerName =  item.text;
    return this.receiptID;
  }

  getDefaultPrinterOb(): Observable<any> {
    return this.printingService.getElectronReceiptPrinterCached()
  }

  setDefaultPrinter(electronPrinter: ISetting) {
    if (!electronPrinter) { return}
    this.electronReceiptSetting = electronPrinter;
    this.receiptID   =  +electronPrinter.option1;
    this.printerName =  electronPrinter.text;
    return this.receiptID;
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
      console.log('init sub component', this.itemsText)
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

  async getPrinterAssignment(){
    this.getElectronPrinterAssignent()
    await this.getAndroidPrinterAssignment()
  }

  exit() {
    this.outPutExit.emit('true')
    // this.dialogRef.close();
  }

  getElectronPrinterAssignent() {
    if (this.platFormService.isAppElectron) {
      this.printingService.getElectronReceiptPrinter().subscribe( data => {
        this.electronSetting        = data;
        this.electronReceiptPrinter = data.text;
        this.electronReceipt        = data.value ;
        this.electronReceiptID      = +data.option1
        if (this.printOptions) {
          this.printOptions.deviceName = data.text
        }
      })

      this.printingService.getElectronLabelPrinter().subscribe( data => {
          this.electronLabelPrinterSetting        = data;
          this.electronLabelPrinter               = data.text;
          this.electrongLabelID                   = +data.option1
      })
    }
  }

    async  getAndroidPrinterAssignment() {
      if (this.platFormService.androidApp) {
        this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
        this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
      }
    }


}

