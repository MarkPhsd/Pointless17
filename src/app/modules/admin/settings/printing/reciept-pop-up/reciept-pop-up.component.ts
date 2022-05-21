import { Component, ElementRef, OnInit,  ViewChild, Input,AfterViewInit, Inject } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,  ISetting } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { Observable, Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrdersService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
// import { PrintOptions } from '@ionic-native/printer/ngx';

// export interface printOptions {
//   silent: true;
//   printBackground: false;
//   deviceName: string;
// }
@Component({
  selector: 'app-reciept-pop-up',
  templateUrl: './reciept-pop-up.component.html',
  styleUrls: ['./reciept-pop-up.component.scss']
})
export class RecieptPopUpComponent implements OnInit {

  // @ViewChild('printsection') printsection: ElementRef;
  // @Input() printerName      : string;
  // receiptLayoutSetting      : ISetting;
  // receiptStyles             : ISetting;
  // zplText                   : string;
  printOptions = {} as printOptions;
  // imageToShow       : any;
  // headerText        : string;
  // itemsText         : string;
  // footerText        : string;
  // paymentsText      : string;
  // subFooterText     : string;

  // receiptList$      : Observable<ISetting[]>;
  // labelList$        : Observable<ISetting[]>;
  // prepReceiptList$  : Observable<ISetting[]>;
  // receiptID         : number;

  items             : any[];
  orders            : any;
  payments          : any[];
  // orderTypes        : any;
  // platForm          = '';

  // result            : any;
  // isElectronServiceInitiated = false;

  // btPrinters        : any=[];
  // btPrinters$       : any;
  // btPrinter         : string;
  // imageConversion   : any;

  @Input() order    : IPOSOrder;
  _order            : Subscription;
  // subscriptionInitialized: boolean;
  // electronReceiptSetting: ISetting;
  _printReady       : Subscription;
  printReady        : boolean

  // orderCheck        = 0;
  options           : printOptions;
  autoPrinted       = false;

 

  constructor(
    private orderService          : OrdersService,
    private settingService        : SettingsService,
    private siteService           : SitesService,
    private platFormService       : PlatformService,
    private printingService       : PrintingService,
    private printingAndroidService: PrintingAndroidService,
    private dialogRef: MatDialogRef<RecieptPopUpComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data)  {
      this.options = data
    }
  }

  ngOnInit() {
 
    console.log('')
  }

  // async ngAfterViewInit() {
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
  //   this.intSubscriptions();
  //   const styles     = await this.applyStyles();
  //   // console.log('styles')
  //   const receiptID  = await this.getDefaultPrinter();
  //   // console.log('default printer')
  //   if (receiptID && styles ) {
  //     const receipt$ =  this.refreshReceipt(receiptID);
  //     // console.log('refresh receipt')
  //     receipt$.subscribe( receipt => {
  //       if (this.initSubComponent( receipt, styles )) {
  //         // console.log('refresh sub')
  //       }
  //     })
  //   }
  // }

  // async applyStyles(): Promise<ISetting> {
  //   const site                = this.siteService.getAssignedSite();
  //   this.receiptStyles        = await this.printingService.appyStylesCached(site)
  //   if (this.receiptStyles) {
  //     const style             = document.createElement('style');
  //     style.innerHTML         = this.receiptStyles.text;
  //     document.head.appendChild(style);
  //     return this.receiptStyles
  //   }
  // }

  // async getDefaultPrinter(): Promise<number> {
  //   const item       = await this.printingService.getElectronReceiptPrinterCached().toPromise()
  //   if (!item) { return}
  //   this.electronReceiptSetting = item;
  //   this.receiptID   =  +item.option1;
  //   this.printerName =  item.text;
  //   return this.receiptID;
  // }

  // refreshReceipt(id: any): Observable<ISetting> {
  //     const site          = this.siteService.getAssignedSite();
  //     const receipt$      = this.settingService.getSetting(site, id)
  //     return receipt$
  // }

  // initSubComponent(receiptPromise: ISetting, receiptStylePromise: ISetting): boolean {
  //   if (receiptPromise && receiptStylePromise) {
  //     this.receiptLayoutSetting =  receiptPromise
  //     this.headerText           =  this.receiptLayoutSetting.option6
  //     this.footerText           =  this.receiptLayoutSetting.option5
  //     this.itemsText            =  this.receiptLayoutSetting.text
  //     this.paymentsText         =  this.receiptLayoutSetting.option7
  //     this.subFooterText        =  this.receiptLayoutSetting.option8
  //     return true
  //   }
  // }

  // getReceiptContents(styles: string) {
  //   const prtContent     = document.getElementById('printsection');
  //   if (!prtContent) { return  }
  //   const content        = `${prtContent.innerHTML}`
  //   if (!content) { return }

  //   const  title = 'Receipt';
  //   const loadView       = ({ title }) => {
  //     return (`
  //       <!DOCTYPE html>
  //       <html>
  //         <head>
  //           <style>${styles}</style>
  //           <title>${title}</title>
  //           <meta charset="UTF-8">
  //         </head>
  //         <body>
  //           <div id="view">${content}</div>
  //         </body>
  //       </html>
  //     `)
  //   }
  //   const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
  //     title: "Receipt"
  //   }));
  //   return file
  // }

  // async print() {
  //   if (this.platFormService.isAppElectron) {
  //     const result = this.printElectron()
  //     return
  //   }
  //   if (this.platFormService.androidApp) {this.printAndroid();}
  //   if (this.platFormService.webMode) { this.convertToPDF();}
  // }

  // convertToPDF() {
  //   this.printingService.convertToPDF( document.getElementById('printsection') )
  // }

  // async printElectron() {
  //   const styles = this.receiptStyles.text;
  //   const contents = this.getReceiptContents(styles)
  //   const options = {
  //     silent: true,
  //     printBackground: false,
  //     deviceName: this.printerName
  //   } as printOptions;

  //   if (!contents) { console.log('no contents in print electron')}
  //   if (!options) { console.log('no options in print electron')}
  //   if (!this.printerName) { console.log('no printerName in print electron')}
  //   if (contents && this.printerName, options) {
  //       this.printingService.printElectron( contents, this.printerName, options)
  //   }
  // }

  // savePDF() {
  //   this.printingService.savePDF(this.printsection.nativeElement, this)
  // }

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

  exit(event) {
    this.dialogRef.close();
  }
}


// function swichtMap(arg0: (receipt: any) => void) {
//   throw new Error('Function not implemented.');
// }
// async printerAssignment(){
//   const platForm              = this.getPlatForm()
//   this.platForm               = platForm
//   if (this.electronService.remote != null) { this.platForm = 'electron' }
//   if (this.isElectronServiceInitiated) {  }
//   if (platForm === 'android') {
//     this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
//     this.platForm     = 'android'
//     this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
//   }
//   if (platForm === 'web') { }
// }
// getPrintContent(htmlContent: any) {
//   let styles  = ''
//   if (this.receiptStyles) { const styles =  this.receiptStyles.text; }
//   const htmlHeader = `<!DOCTYPE html <html><head>
//   <style>${styles}</style>
//   <title>print</title>
//   </head> <body>`
//   const htmlFooter = '</body></html>'
//   const html = `${htmlHeader}  ${htmlContent} ${htmlFooter}`
//   return html
// }
