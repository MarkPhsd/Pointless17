import { Component, ElementRef, OnInit,  ViewChild, Input } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder,  ISetting } from 'src/app/_interfaces';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { Observable, Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Capacitor,  } from '@capacitor/core';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'app-reciept-pop-up',
  templateUrl: './reciept-pop-up.component.html',
  styleUrls: ['./reciept-pop-up.component.scss']
})
export class RecieptPopUpComponent implements OnInit {

  @ViewChild('printsection') printsection: ElementRef;
  @Input() printerName      : string;
  receiptLayoutSetting      : ISetting;
  receiptStyles             : ISetting;
  zplText                   : string;

  imageToShow       : any;
  headerText        : string;
  itemsText         : string;
  footerText        : string;
  paymentsText      : string;
  subFooterText     : string;

  receiptList$      : Observable<ISetting[]>;
  labelList$        : Observable<ISetting[]>;
  prepReceiptList$  : Observable<ISetting[]>;
  receiptID         : number;

  items             : any[];
  orders            : any;
  payments          : any[];
  orderTypes        : any;
  platForm          = '';

  result            : any;
  isElectronServiceInitiated = false;

  btPrinters        : any=[];
  btPrinters$       : any;
  btPrinter         : string;
  imageConversion   : any;

  order             : IPOSOrder;
  _order            : Subscription;
  subscriptionInitialized: boolean;

  electronReceiptSetting: ISetting;

  intSubscriptions() {
    console.log('RecieptPopUpComponent inituSubscriptions')
    this._order       = this.orderService.currentOrder$.subscribe(data => {
      this.order      = data;
      this.orders     = [];
      this.orders.push(data)
      if (data.posPayments) {
        this.payments   = data.posPayments
      }
      if (data.posOrderItems) {
        this.items      = data.posOrderItems
      }
      console.log('order', this.orders)
    })
  }

  constructor(
      private electronService       : ElectronService,
      private orderService          : OrdersService,
      private settingService        : SettingsService,
      private siteService           : SitesService,
      private printingService       : PrintingService,
      private btPrinterService      : BtPrintingService,
      private dialogRef: MatDialogRef<RecieptPopUpComponent>,
      private printingAndroidService: PrintingAndroidService,
  ) {
  }

  async ngOnInit() {
    this.intSubscriptions();
    await this.applyStyles();
    this.getDefaultPrinter();
  }

  async getDefaultPrinter() {
    //!! get the Printer name And the Receipt Type.
    //then REfresh the receipt with the styles and the printer selected.

    //get the DefaultElectornReceiptCached This will reduce API Calls.
    //The DeaultRecieptCached doesn't get the receipt styles
    //it gets the pointer to the receipt styles.

    //call the styles
    //once those are set the receipt will load
    console.log('getting Info')

    const item = await this.printingService.getDefaultElectronReceiptPrinter().toPromise()
    this.electronReceiptSetting = item;
    localStorage.setItem('electronReceiptPrinter', item.text)
    localStorage.setItem('electronReceipt', item.value)
    localStorage.setItem('electronReceiptID', item.option1)

    this.receiptID   =  +item.option1;
    this.printerName =  item.text;
    let receiptID        =  +item.option1;
    this.refreshReceipt(receiptID);
  }

  async refreshReceipt(id: any) {
    try {
       const site                  = this.siteService.getAssignedSite();
      const receipt$              = this.settingService.getSetting(site, id)
      receipt$.subscribe(receipt => {
        this.initSubComponent( receipt, this.receiptStyles )
      })
    } catch (error) {
      console.log(error)
    }
  }

  initSubComponent(receiptPromise: ISetting, receiptStylePromise: ISetting) {
    try {
      if (receiptPromise && receiptStylePromise) {
        this.receiptLayoutSetting = receiptPromise
        this.headerText           =  this.receiptLayoutSetting.option6
        this.footerText           =  this.receiptLayoutSetting.option5
        this.itemsText            =  this.receiptLayoutSetting.text
        this.paymentsText         =  this.receiptLayoutSetting.option7
        this.subFooterText        =  this.receiptLayoutSetting.option8
      }
    } catch (error) {
      console.log(error)
    }
  }

  getPlatForm() {
    return Capacitor.getPlatform();
  }

 async printerAssignment(){
    const platForm              =  this.getPlatForm()
    this.platForm               = platForm
    if (this.electronService.remote != null) { this.platForm = 'electron' }
    if (this.isElectronServiceInitiated) {  }
    if (platForm === 'android') {
      this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
      this.platForm     = 'android'
      this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    }
    if (platForm === 'web') { }
  }


  getPrintContent(htmlContent: any) {
    let styles  = ''
    if (this.receiptStyles) { const styles =  this.receiptStyles.text; }
    const htmlHeader = `<!DOCTYPE html <html><head>
    <style>${styles}</style>
    <title>print</title>
    </head> <body>`
    const htmlFooter = '</body></html>'
    const html = `${htmlHeader}  ${htmlContent} ${htmlFooter}`
    return html
  }

  async applyStyles() {
    const site                = this.siteService.getAssignedSite();
    this.receiptStyles        = await this.printingService.applyStyles(site)
    if (this.receiptStyles) {
      const style             = document.createElement('style');
      style.innerHTML         = this.receiptStyles.text;
      document.head.appendChild(style);
    }
  }

  getReceiptContents() {
    const prtContent     = document.getElementById('printsection');
    const content        = `${prtContent.innerHTML}`
    const loadView       = ({title}) => {
      return (`
        <!DOCTYPE html>
        <html>
          <head>
            <style>${this.receiptStyles.text}</style>
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
      title: "Account"
    }));
    return file
  }

  async print() {
    const platForm    =  this.getPlatForm()

    if (this.electronService.remote != null) {
      if (!this.printerName) {
        window.alert('No default printer has been assigned.')
        return
      }
      this.printElectron()
      return
    }

    if (this.isElectronServiceInitiated) {  }

    if (platForm === 'android') {
      this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
      this.platForm     = 'android'
      this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    }

    if (platForm === 'web') {
       this.convertToPDF();
     }
  }

  convertToPDF() {
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  async printElectron() {
    const contents = this.getReceiptContents()
    const options = {
      silent: true,
      printBackground: false,
      deviceName: this.printerName
    }
    this.printingService.printElectron( contents, this.printerName, options, true)
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
    this.printingAndroidService.printTestAndroidReceipt( this.btPrinter)
  }

  exit() {
    this.dialogRef.close();
  }
}
