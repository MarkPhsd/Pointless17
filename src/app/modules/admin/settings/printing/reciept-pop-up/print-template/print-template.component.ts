import { Component, ElementRef, OnInit,  ViewChild, Input,AfterViewInit, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,  IPOSPayment,  ISetting, PosPayment } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';

@Component({
  selector: 'app-print-template',
  templateUrl: './print-template.component.html',
  styleUrls: ['./print-template.component.scss']
})

export class PrintTemplateComponent implements OnInit, OnDestroy {

  @ViewChild('printSection')  printSection: TemplateRef<any>;
  @ViewChild('printTemplate') printTemplate: TemplateRef<any>;
  @ViewChild('balanceSheet')  balanceSheetTemplate: TemplateRef<any>;
  @Input() index            : number;
  @Input() autoPrint        : boolean;
  @Input() hideExit         = false;
  @Output() outPutExit      = new EventEmitter();
  @ViewChild('printsection') printsection: ElementRef;
  @Input() printerName      : string;
  @Input() options          : printOptions;
  @Input() order            : IPOSOrder;
  @Input() templateID       : number;

  @Output() outPutPrinted    = new EventEmitter();

  isElectronApp         : boolean;
  electronSetting       : ISetting;
  _printView            : Subscription;
  printView             = 1;

  receiptLayoutSetting    : ISetting;
  receiptStyles           : ISetting;

  imageToShow       : any;
  headerText        : string;
  itemsText         : string;
  footerText        : string;
  paymentsText      : string;
  paymentsCreditText: string;
  paymentsWICEBTText: string;
  subFooterText     : string;
  // receiptID         : number;

  refreshView$      : Observable<any>;

  items             : any[];
  orders            : any;
  payments          : any[];
  orderTypes        : any;
  platForm          = '';

  printOptions      : printOptions;
  result            : any;
  isElectronServiceInitiated = false;

  btPrinters        : any=[];
  btPrinters$       : any;
  btPrinter         : string;
  imageConversion   : any;

  _order            : Subscription;
  subscriptionInitialized: boolean;
  electronReceiptSetting: ISetting;
  _printReady       : Subscription;
  printReady        : boolean
  orderCheck        = 0;

  autoPrinted          = false;
  printAction$         : Observable<any>;
  layout$              : Observable<any>;
  content$             : Observable<any>;
  tempPayments         : PosPayment[];
  _printOrder          : Subscription;

  printOrder$: Observable<any>;
  printOrder: IPrintOrders;

  intSubscriptions() {

    this._printOrder = this.orderService.printOrder$.subscribe(
      data => {
        if (data) {
          this.order         = data.order;
          this.templateID    = data.location.templateID;
          this.printerName   = data.location.printer;
          this.printOrder    = data;
          // console.log(data)
          if (this.templateID) {
            return this.initStyles()
          }
          return of(null)
        }
      }
    )

    this._printReady = this.printingService.printReady$.subscribe(status => {
      if (this.index == null) { return };
      if (this.options) {
        // {autoPrint: true, printerName: printerName}
      }

      if (status) {
        if (this.autoPrinted) { return }
        if (status.index == this.index) {
            if (status.ready) {
              this.outPutPrinted.emit()
              this.autoPrinted = true;
            }
          }
        }
    })
  }

  constructor(
    public orderService           : OrdersService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private platFormService       : PlatformService,
    private printingService       : PrintingService,
    )
  {}

  ngOnInit() {
    this.layout$ = this.initStyles()
    this.intSubscriptions();
    const i = 0;
  }

  ngOnDestroy(): void {
    this.printingService.updatePrintView(1);
    if(this._order) { this._order.unsubscribe() }
  }

  initPrintView() {
    this.printView = this.printingService.printView;
    if (!this.printingService.printView) {
      this.printingService.updatePrintView(1);
      this.printView = 1;
    }
  }

  get currentView() {
    if (this.printingService.__printView == 1) {
      return this.printTemplate
    }
  }

  //Step 1
  initStyles() {
    let styles
    const site = this.siteService.getAssignedSite();
    return this.printingService.appyStylesCachedObservable(site).pipe(switchMap(data => {
      this.receiptStyles = data ;
      styles = data
      this.applyStyle(this.receiptStyles)
      return this.settingService.getSetting(site, this.templateID)
    })).pipe(
      switchMap(data => {
        if (!data) { return of(null) }
        this.initSubComponent(data)
        this.printingService.__printView = 1;
        this.receiptStyles = styles
        return of(data)
    }))

  }

  applyStylesObservable(): Observable<ISetting> {
    const site  = this.siteService.getAssignedSite();
    return this.printingService.appyStylesCachedObservable(site).pipe(
        switchMap( data => {
          this.receiptStyles  =  data
          this.printingService.applyStyle(data)
          return of(data)
        }
      )
    )
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

  applyStyle(receiptStyles) {
    return this.printingService.applyStyle(receiptStyles)
  }

  formattedCompleted(event) {
    this.printElectron()
  }

  getReceiptHTML(styles: string) {
    const prtContent     = document.getElementById('printsection');
    if (!prtContent) { return  }
    const content        = `${prtContent.innerHTML}`
    if (!content) { return }
    this.printHtmlWindow(content, this.receiptStyles.text)
  }

  printHtmlWindow(contentHTML, style) {
    const  title   = 'Receipt';
    const loadView = ({ title }) => {
      return (`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${style}</style>
            <title>${title}</title>
            <meta charset="UTF-8">
          </head>
          <body>
            <div id="view">${contentHTML}</div>
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
    if (!this.printerName) { return }
    if (this.platFormService.isAppElectron) {
      const result = this.printElectron()
      return
    }
  }

  printHTML(html) {
    if (!html) {
      console.log('no html', this.index)
    }
    if (!this.receiptStyles) {
      console.log('no receipt styles', this.index)
    }

    if (this.receiptStyles) {
      const file = this.printHtmlWindow(html, this.receiptStyles.text)
      this.printElectronHTML(file)
      this.outPutPrinted.emit('true')
    }
  }

  printElectron() {
    if (this.receiptStyles) {
      const file = this.getReceiptHTML(this.receiptStyles.text)
      this.printElectronHTML(file)
      this.outPutPrinted.emit('true')
    }
  }

  printElectronHTML(contents) {
    const options  = {
      silent: true,
      printBackground: false,
      deviceName: this.printerName
    } as printOptions;

    if (!contents) {
      console.log('no contents in print electron')
      return;
    }
    if (!options) {
      console.log('no options in print electron')
      return;
    }
    if (!this.printerName) {
      console.log('no printerName in print electron')
      return;
    }
    console.log('All good to print')
    if (contents && this.printerName, options) {
        this.printingService.printElectron( contents, this.printerName, options)
    }
  }

  exit() {
    this.outPutExit.emit('true')
  }

}


  // getElectronPrinterAssignent(id: number) {
  //   if (this.platFormService.isAppElectron) {
  //     template$ = this.getElectronReceiptPrinterAssignentOBS(id);
  //     receipt$.subscribe(data =>{})
  //   }
  // }

  // getElectronReceiptPrinterAssignentOBS(id: number) {
  //   if (this.platFormService.isAppElectron) {
  //      const site = this.siteService.getAssignedSite()
  //      this.settingService.getSetting(site, id).pipe(
  //         switchMap(data => {
  //           this.electronSetting        = data;
  //           // this.electronReceiptPrinter = data.text;
  //           // this.electronReceipt        = data.value ;
  //           // this.electronReceiptID      = +data.option1?
  //           if (this.printOptions) {
  //             this.printOptions.deviceName = data.text
  //           }
  //           return of(data)
  //         }
  //       )
  //     )
  //   }
  //   return of(null)
  // }

