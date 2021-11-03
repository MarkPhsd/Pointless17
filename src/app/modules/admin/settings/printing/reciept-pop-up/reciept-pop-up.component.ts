import { Component, ElementRef, OnInit, Renderer2, ViewChild, AfterViewInit, Input, RendererStyleFlags2 } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, IProduct, ISetting } from 'src/app/_interfaces';
import { PrintingService } from 'src/app/_services/system/printing.service';
import * as  printJS from "print-js";
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SafeHtmlPipe } from 'src/app/_pipes/safe-html.pipe';
import { Observable, Subscription } from 'rxjs';
import { HTMLEditPrintingComponent } from '../htmledit-printing/htmledit-printing.component';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrdersService } from 'src/app/_services';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { Dialog } from 'electron';

@Component({
  selector: 'app-reciept-pop-up',
  templateUrl: './reciept-pop-up.component.html',
  styleUrls: ['./reciept-pop-up.component.scss']
})
export class RecieptPopUpComponent implements OnInit, AfterViewInit {

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

  intSubscriptions() {
    this._order       = this.orderService.currentOrder$.subscribe(data => {
      this.order      = data;
      this.orders     = [];
      try {
        this.orders.push(data)
        if (data.posPayments) {
          this.payments   = data.posPayments
        }
        if (data.posOrderItems) {
          this.items      = data.posOrderItems
        }
      } catch (error) {

      }

      console.log('order', this.orders)
    })
  }

  constructor(
      private electronService       : ElectronService,
      private orderService          : OrdersService,
      private serviceTypeService    : ServiceTypeService,
      private settingService        : SettingsService,
      private siteService           : SitesService,
      private printingService       : PrintingService,
      private btPrinterService      : BtPrintingService,
      private dialogRef: MatDialogRef<RecieptPopUpComponent>,
      private printingAndroidService: PrintingAndroidService,
  ) {
  }

  async ngOnInit() {
    this.applyStyles();
    this.intSubscriptions();
    this.getOrderType();
    this.getDefaultPrinter()
  }

  async getDefaultPrinter() {
    // const site       = this.siteService.getAssignedSite();
    // const item       = await this.settingService.getDefaultReceiptPrinter(site)
    const printerName   =    localStorage.getItem('defaultElectronReceiptPrinter')
    if (!printerName) {
      this.printingService.getDefaultElectronReceiptPrinter().subscribe(data => {
        this.printerName = printerName;
        return
      })
    }
    this.printerName = printerName;
  }

  async getOrderType(){
    const site                  = this.siteService.getAssignedSite();
    if (this.order) {
      this.orderTypes = await  this.serviceTypeService.getType(site,this.order.serviceTypeID)
    }
  }

  getPlatForm() {
    return Capacitor.getPlatform();
  }

  async ngAfterViewInit() {
    this.initDefaultLayouts()
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

  async  initDefaultLayouts() {
    try {
      const site                  = this.siteService.getAssignedSite();
      await this.printingService.initDefaultLayouts();
      await this.applyStyles();
      const receipt$              = this.settingService.getSettingByName(site, 'Receipt Default')
      const receiptPromise        = await receipt$.pipe().toPromise()
      this.refreshReceipt(receiptPromise.id);
    } catch (error) {
      console.log(error)
    }
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

  async refreshReceipt(id: any) {
    try {
      this.receiptLayoutSetting   = null;
      const site                  = this.siteService.getAssignedSite();
      const receipt$              = this.settingService.getSetting(site, id)
      receipt$.subscribe(data => {
        this.initSubComponent( data, this.receiptStyles )
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
      // const prtContent  = document.getElementById('printsection');
      // this.printingService.getPrintHTML(prtContent);
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
