import { Injectable, Output } from '@angular/core';
import * as _ from "lodash";
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IClientTable, IPurchaseOrderItem, ISetting, ISite, IUser } from 'src/app/_interfaces';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import  html2canvas from 'html2canvas';
import  domtoimage from 'dom-to-image';
import { jsPDF } from "jspdf";
import { RenderingService } from './rendering.service';
import { LabelaryService, zplLabel } from '../labelary/labelary.service';
import { RecieptPopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { BehaviorSubject,  Observable, switchMap, of, catchError, forkJoin,  concatMap } from 'rxjs';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';
import { UserAuthorizationService } from './user-authorization.service';
import { MenuService, OrdersService } from 'src/app/_services';
import { POSOrderItemService } from '../transactions/posorder-item-service.service';
import { HttpClient } from '@angular/common/http';
import { UISettingsService } from './settings/uisettings.service';
import { PrintingAndroidService} from  './printing-android.service';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { PrintTemplatePopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/print-template-pop-up/print-template-pop-up.component';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ClientTableService } from '../people/client-table.service';
import { UUID } from 'angular2-uuid';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'

export interface printOptions {
  silent: boolean;
  printBackground: boolean;
  deviceName: string;
}

@Injectable({
  providedIn: 'root'
})

export class PrintingService {

  public _printOrder        = new BehaviorSubject<IPrintOrders>(null);
  public printOrder$         = this._printOrder.asObservable();

  labelPrinter     : string;
  labelContentList = []  as string[]
  interval;
  menuItem: IMenuItem;
  zplSetting            : ISetting;
  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;
  item                  : IInventoryAssignment;
  order                 : IPOSOrder
  isElectronServiceInitiated = false
  obs$ : Observable<any>[];
  private _printReady       = new BehaviorSubject<any>(null);
  public printReady$        = this._printReady.asObservable();
  //applies to order filter for POS
  public _prepStatus        = new BehaviorSubject<number>(null);
  public prepStatus$         = this._prepStatus.asObservable();
  //applies to order filter for POS
  public printerLocation    : number;
  private _printerLocation    = new BehaviorSubject<number>(null);
  public printerLocation$      = this._printerLocation.asObservable();
  private _printingFinalizer      = new BehaviorSubject<boolean>(null);
  public  printingFinalizer$      = this._printingFinalizer.asObservable();
  public _printView         = new BehaviorSubject<number>(null);
  public printView$         = this._printView.asObservable();
  public __printView        : number;

  printOrder: IPOSOrder ;

  currentGroupID = 0
  // posName: string  = this.orderMethodsService.devicename;
  image: string;
  get printView() {
    return this.__printView;
  }

  updatePrepStatus(value: number) {
    this._prepStatus.next(value);
  }

  updateOrderPrinterLocation(value: number) {
    this.printerLocation = value;
    this._printerLocation.next(value)
  }

  updatePrintingFinalizer(value) {
    this._printingFinalizer.next(value)
  }
  updatePrintView(value: number) {
    this._printView.next(value);
    this.__printView = value;
  }

  constructor(  private electronService   : ElectronService,
                private dialog            : MatDialog,
                private orderService      : OrdersService,
                private clientService     : ClientTableService,
                private labelaryService   : LabelaryService,
                private inventoryService   : InventoryAssignmentService,
                private router            : Router,
                private userAuthService   : UserAuthorizationService,
                // private orderMethodsService: OrderMethodsService,
                private orderItemService  : POSOrderItemService,
                private platFormService   : PlatformService,
                private menuItemService   : MenuService,
                private http              : HttpClient,
                private posOrderItemService : POSOrderItemService,

                private printingAndroidService   : PrintingAndroidService,
                private renderingService  : RenderingService,
                private settingService    : SettingsService,
                private siteService       : SitesService,
                private uiSettingsService : UISettingsService,
                ) {
  }

  getPrintReady(): Observable<boolean> {
    return this.printReady$
  }

  updatePrintReady(data) {
    this._printReady.next(data)
  }

  printReceipt(orderID: number, groupID: number)  {
    if (!groupID) { groupID = 0 }
    const site = this.siteService.getAssignedSite()
    return this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
      switchMap(data => {
        this.currentGroupID = groupID;
        this.printOrder = data;
        this.previewReceipt();
        return of(data);
    }))
  }

  printJoinedLabels( ) {
    let contents = ''
    this.labelContentList.forEach(data => {
      if (data) {
        contents =`${data} ${contents}`
      }
    })
    if (!this.labelPrinter) { return }
    if (!contents) { return }
    this.printLabelElectron(contents, this.labelPrinter)
    this.labelContentList = []
  }

  //prints posItem
  printLabels(order: IPOSOrder, newLabels: boolean, joinLabels?: boolean): Observable<any> {
    if (!order || !order.posOrderItems) {  return of(null)  }
    let timer  =  +localStorage.getItem('testVariable' )
    if (!timer || timer != 0) { timer = +50000 }

    let printCount = 0;
    const printLabelList  = [];
    this.obs$ = []

    if (order && order.posOrderItems) {
        const items = order.posOrderItems
      if (items.length > 0) {
        items.forEach( item => {
          let result = this._printLabelSub({item: item,
                                            newLabels: newLabels,
                                            printLabelList: printLabelList,
                                            printCount: printCount,
                                            order: order,
                                            joinLabels: joinLabels})
          printCount= result?.printCount;
        })
      }
      if (printCount == 0) {return of(null)};
      return forkJoin(this.obs$)
    }
    return of(null)
  }

  _printLabelSub( labelProcess: any ) {
      // {newLabels: boolean, printLabelList:any[], printCount: number, order: IPOSOrder}
    let  newLabels      = labelProcess?.newLabels;
    let  printCount     = labelProcess?.printCount;
    let  order          = labelProcess?.order;
    let  printLabelList = labelProcess?.printLabelList;
    let  item           = labelProcess?.item
    let  joinLabels     = labelProcess?.joinLabels;

    if (!item.printed && newLabels) {
      this.obs$.push( this.printItemLabel(item, null, order, joinLabels) )
      printLabelList.push(item)
      printCount += 1
    }

    if (!newLabels) {
      this.obs$.push( this.printItemLabel(item, null, order, joinLabels) )
      printLabelList.push(item)
      printCount += 1
    }

    let result = {newLabels: newLabels, printCount: printCount, printLabelList: printLabelList, order: order}
    return result;
  }


  async initDefaultLayouts() {
    const site = this.siteService.getAssignedSite();
    try {
      this.receiptLayoutSetting = await this.settingService.setDefaultReceiptLayout(site)
      this.receiptStyles        = await this.settingService.setDefaultReceiptStyles(site)
    } catch (error) {
      console.log(error)
    }
  }

  initDefaultLayoutsOBS() {
    const site = this.siteService.getAssignedSite();
    return this.settingService.setDefaultReceiptLayoutOBS(site).pipe(switchMap(data => {

      return this.settingService.setDefaultReceiptStylesOBS(site)
    }))
  }

  async initDefaultLabel() {
    const site        = this.siteService.getAssignedSite();
    this.zplSetting   = await this.settingService.setDefaultZPLText(site);
  }

  async refreshInventoryLabel(zplText: string, data: any): Promise<string> {

    const site        =  this.siteService.getAssignedSite();
    if (!zplText) {return}

    let zpl = {} as  zplLabel;
    zpl.height = '2' // this.zplSetting.option2;
    zpl.width  = '3' // this.zplSetting.option3;

    if (!zpl) { return }

    //interpolate the zpl text
    zplText =  this.renderingService.interpolateText(data, zplText)
    zpl.text   = zplText

    if (zpl) {
      const labelImage$  =  this.labelaryService.postZPL(site, zpl)
      const img = await labelImage$.pipe().toPromise()
      return  `data:image/jpeg;base64,${img}`
    }
  }

  refreshInventoryLabelOBS(zplText: string, data: any): Observable<any> {

    const site        =  this.siteService.getAssignedSite();
    if (!zplText) {return}

    let zpl = {} as  zplLabel;
    zpl.height = '2' // this.zplSetting.option2;
    zpl.width  = '3' // this.zplSetting.option3;

    if (!zpl) { return }

    //interpolate the zpl text
    zplText =  this.renderingService.interpolateText(data, zplText)
    zpl.text   = zplText
    // console.log('zpl', zpl.text)
    if (zpl) {
      let result = zpl as unknown as any;
      if (result?.text?.typeError) {
        console.log('possible error message', result?.text?.typeError)
        this.siteService.notify(`Label Format error ${result?.text?.typeError}`, 'Close', 5000, 'red' )
      }
      // console.log('zpl', zpl, );
      console.log('zpl error', result?.text?.typeError)
      return  this.labelaryService.postZPL(site, zpl).pipe(
          switchMap(data => {
            // console.log('image data', data)
            return  of(`data:image/jpeg;base64,${data}`)
        })
      )
    }
    return of(null)
  }

  refreshInventoryLabelObs(zplText: string, data: any): Observable<string> {
    const site        =  this.siteService.getAssignedSite();
    if (!zplText) {return}

    let zpl = {} as  zplLabel;
    zpl.height = '5' // this.zplSetting.option2;
    zpl.width  = '4' // this.zplSetting.option3;

    if (!zpl) { return }

    //interpolate the zpl text
    zplText =  this.renderingService.interpolateText(data, zplText)
    zpl.text   = zplText

    if (zpl) {
      const labelImage$  =  this.labelaryService.postZPL(site, zpl)
      return labelImage$.pipe(switchMap(data => {
        return  of(`data:image/jpeg;base64,${data}`)
      }))
    }

    return of(null)
  }

  refreshProductLabel(zplText: string, data: IInventoryAssignment): Observable<string> {
    const site        =  this.siteService.getAssignedSite();
    if (!zplText) {return}

    let zpl = {} as  zplLabel;
    zpl.height = '2' // this.zplSetting.option2;
    zpl.width  = '3' // this.zplSetting.option3;

    if (!zpl) { return }

    //interpolate the zpl text
    zplText =  this.renderingService.interpolateText(data, zplText)
    zpl.text   = zplText

    if (zpl) {
      const labelImage$  =  this.labelaryService.postZPL(site, zpl)
      const img$ =  labelImage$.pipe(switchMap(data => {
        this.image =  `data:image/jpeg;base64,${data}`
        return of(data)
      }))
    }
  }

  applyStylesObservable(site: ISite): Observable<ISetting> {
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    return receiptStyle$
  }

  applyStyle(receiptStyles: ISetting): ISetting {
    if (receiptStyles && receiptStyles.text) {
      const style             = document.createElement('style');
      style.innerHTML         = receiptStyles.text;
      document.head.appendChild(style);
      return receiptStyles
    }
    return null
  }

  async applyBalanceSheetStyles(): Promise<ISetting> {
    const value =   await  this.appyBalanceSheetStyle();
    const style             = document.createElement('style');
    style.innerHTML         = value;
    document.head.appendChild(style);
    return  this.receiptStyles
  }

  //convert instances to appyBalanceSheetStyleObservable
  async  appyBalanceSheetStyle(): Promise<string> {
    const style = document.createElement('style');
    const oberservable$ = this.http.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'});
    const value = await oberservable$.pipe().toPromise()
    style.innerHTML = value;
    document.head.appendChild(style);
    return value
  }

  appyBalanceSheetStyleObservable(): Observable<string> {
    const style = document.createElement('style');
    const oberservable$ = this.http.get('assets/htmlTemplates/balancesheetStyles.txt', {responseType: 'text'});
    return oberservable$.pipe(
      switchMap(data => {
        style.innerHTML = data;
        document.head.appendChild(style);
        return of(data)
    }))
  }

  async  appyStylesCached(site: ISite): Promise<ISetting> {
    const receiptStyle$ = this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
    const receiptStyle  = await receiptStyle$.pipe().toPromise()
    return this.setHTMLReceiptStyle(receiptStyle)
  }

  appyStylesCachedObservable(site: ISite): Observable<ISetting> {
    const receiptStyle$ = this.settingService.getSettingByNameCachedNoRoles(site, 'ReceiptStyles')
    return  receiptStyle$.pipe(
      switchMap( data => {
          return of(this.setHTMLReceiptStyle(data))
        }
      )
    )
  }

  getStylesCached(site){
    return this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
  }

  setHTMLReceiptStyle(receiptStyle) {
    if (receiptStyle) {
      const style = document.createElement('style');
      style.innerHTML = receiptStyle.text;
      document.head.appendChild(style);
      return receiptStyle
    }
    return null;
  }

  getDomToImage(node: any) {
      domtoimage.toPng(node)
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
  }

  listPrinters(): any {
    try {
      let printWindow = new this.electronService.remote.BrowserWindow({ show:false })
      printWindow.loadURL('http://localhost')
      const printers = printWindow.webContents.getPrinters()
      printWindow.close();
      return printers;
    } catch (error) {
      return ['Error Getting Printers']
    }
  }

   // const node = document.getElementById('printsection');
  public convertToPDF(node: any, fileName? : string)  {
    let pdfName = 'invoice.pdf'
    if (fileName) {  pdfName = `${fileName}.pdf`  }


    try {
      const options = { background: 'white', height: 845, width: 595 };
      domtoimage.toPng(node, options).then(data => {
        //Initialize JSPDF
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.addImage(data, 'PNG', 0, 0, 250, 250);//change values to your preference
        doc.save(fileName);
      }, error => {
        this.siteService.notify(error.toString(), 'PNG Error error', 3000)
      })
    } catch (error) {
      this.siteService.notify(error.toString(),  'PNG Error error', 3000)
    }
  }

  convertToPNG(node: any)
  {
    try {
      const options = { background: 'white', height: 845, width: 300 };
      return  domtoimage.toPng(node, options)
    } catch (error) {
      this.siteService.notify(error.toString(),  'PNG Error error', 3000)
    }
  }

  getLastPrinterName(printerType): string {
    return  localStorage.getItem(printerType)
  }

  setLastPrinterName(printerType: string, printerName: string) {
    localStorage.setItem(printerType, printerName)
  }

  getLastLabelPrinter(): string {
    return this.getLastPrinterName('LastLabelPrinter')
  }

  setLastLabelPrinterName(printerName: string) {
    this.setLastPrinterName('LastLabelPrinter', printerName)
  }

  getLastLabelUsed(): number {
    return parseInt( localStorage.getItem('lastLabelUsed') )
  }

  setLastLabelUsed(id: number): boolean {
    localStorage.setItem('lastLabelUsed', id.toString())
    return true;
  }

  getdefaultOptions(printerName: string) {
    return {
      silent: true,
      printBackground: false,
      deviceName: printerName
    }
  }

  printElectronForLabels(contents: string, printerName: string, options: printOptions) : any {
    if (!contents) { return }
    let printWindow = new this.electronService.remote.BrowserWindow({show: false, width: 350, height: 600 })
    if (options.silent) { printWindow.hide(); }
    console.log('printElectronForLabels contents', contents)
    return  printWindow.loadURL(contents)
      .then( e => {
        if (options.silent) { printWindow.hide(); }
        if (!options) {  options = this.getdefaultOptions(printerName)  }
        printWindow.webContents.print(
          options,
          (success, failureReason) => {
            try {
              printWindow.close();
              printWindow = null;
            } catch (error) {
              console.log('error close window', error)
            }
          }
        )

        }).catch( err => {
          this.siteService.notify(`Error occured: ${err}. options: ${options}`,  'Close', 5000, 'red' )
          printWindow.close();
          printWindow = null;
          return null;
      }
    )

  }

  printLabelElectron(printString: string, printerName: string) {
    const uuid = UUID.UUID().slice(0,5);

    if (!printString || printString == undefined || printString == 'undefined') { return };
    console.log('printLabelElectron', printerName)
    const file = `file:///c://pointless//labels//print${uuid}.txt`
    let fileName = `c:\\pointless\\labels\\print${uuid}.txt`;
    try {
       this.saveContentsToFile(fileName, printString);
    } catch (error) {
      this.siteService.notify(`File could not be written.
                                Please make sure you have a writable folder ${fileName}`, 'Close', 3000, 'red')
    }

    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    } as printOptions

    try {
      this.printElectronForLabels( file, printerName, options )
    } catch (error) {
      return false
    }
  }

  printElectron(contents: string, printerName: string, options: printOptions) : boolean {
    if (!this.platFormService.isAppElectron) { return }
    let printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })
    if (options.silent) { printWindow.hide(); }
       printWindow.loadURL(contents)
      .then( e => {
        if (options.silent) { printWindow.hide(); }
        if (!options) {  options = this.getdefaultOptions(printerName)  }

        printWindow.webContents.print(
          options,
          (success, failureReason) => {
            console.log('Print Window : printing ', success, failureReason);
            printWindow.close();
            printWindow = null;
            return true
          }
        )

        }).catch( err => {
          console.log('Print window Load URL error:', err, options)
          this.siteService.notify(`Error occured: ${err}. options: ${options}`,  'Close', 5000, 'red' )
          printWindow.close();
          printWindow = null;
          return false
      }
    )
    return false;
  }

  removeAllStyles() {
    const styleSheets = document.querySelectorAll('link[rel="stylesheet"], style');
    styleSheets.forEach(sheet => {
      sheet.parentNode.removeChild(sheet);
    });
  }

  reloadStylesheets() {
    this.removeAllStyles()
    const stylesheets = [
      { id: 'global-styles', href: 'src/styles.scss' },
      { id: 'material-theme', href: './node_modules/@angular/material/prebuilt-themes/indigo-pink.css' }
    ];

    stylesheets.forEach(sheet => {
      const existingLinkElement = document.getElementById(sheet.id) as HTMLLinkElement;
      if (existingLinkElement) {
        const newLinkElement = document.createElement('link');
        newLinkElement.id = sheet.id;
        newLinkElement.rel = 'stylesheet';
        newLinkElement.href = sheet.href.split('?')[0] + '?reload=' + new Date().getTime();

        // Remove the old link element
        existingLinkElement.parentNode.removeChild(existingLinkElement);

        // Add the new link element
        document.head.appendChild(newLinkElement);
      }
    });
  }

   async printElectronAsync(contents: string, printerName: string, options: printOptions) : Promise<boolean> {
    if (!this.platFormService.isAppElectron) { return }
    let printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })
    if (options.silent) { printWindow.hide(); }
    let result = true;
    await printWindow.loadURL(contents)
      .then( e => {
        if (options.silent) { printWindow.hide(); }
        if (!options) {  options = this.getdefaultOptions(printerName)  }
        printWindow.webContents.print(
          options,
          (success, failureReason) => {
            // console.log('Print Window : printing ', success, failureReason);
            printWindow.close();
            printWindow = null;
            result = false
          }
        )
        }).catch( err => {
          console.log('Print window Load URL error:',printerName , err, options)
          // console.trace('Trace of Printing Error')
          this.siteService.notify(`Error occured: Check your printer. options: printer: ${printerName} - Error: ${JSON.stringify(options)}`,  'Close', 25000, 'red' )
          printWindow.close();
          printWindow = null;
          result = false
      }
    )
    return result;
  }

  async printElectronIPCAsync(contents: string, printerName: string, options: printOptions) : Promise<boolean> {
    if (!this.platFormService.isAppElectron) { return }
    this.electronService.ipcRenderer.send('print', { contents, printerName, options });
  }


  printDocuments(printOrderList: IPrintOrders[]): Observable<any> {

    if (this.platFormService.isAppElectron) {
      return this.printElectronTemplateOrder(printOrderList)
    }

    try {

    } catch (error) {
      this.siteService.notify('error printElectronTemplateOrder :' + error.toString(), 'close', 5000, 'red')
    }

    return of(null)
  }

  printElectronTemplateOrder(printOrderList:IPrintOrders[]): Observable<any> {
    try {
      const site = this.siteService.getAssignedSite()
      const styles$ = this.appyStylesCachedObservable(site)
      return styles$.pipe(switchMap(data => {
        return this.dialog.open(PrintTemplatePopUpComponent,
          { width:        '450px',
            minWidth:     '450px',
            height:       '600px',
            minHeight:    '600px',
            data : printOrderList
          },
          ).afterClosed()
      }))
    } catch (error) {
      this.siteService.notify('error printElectronTemplateOrder :' + error.toString(), 'close', 5000, 'red')
    }
    return of(null)
  }


  getPrintContent(htmlContent: any, styles: any) {
    const htmlHeader = `<!DOCTYPE html <html><head> ${styles}</head> <body>`
    const htmlFooter = '</body> </html>'
    const html = `${htmlHeader}  ${htmlContent} ${htmlFooter}`
    const file = `$data:text/html;charset=UTF-8, ${encodeURIComponent(html)}`
    return file
  }

  savePDF(nativeElement: any, _this) {
    if (!nativeElement) { return }

    {
      try {
        html2canvas(nativeElement).then(canvas => {
          var pdf = new jsPDF('p', 'pt', [canvas.width +15 , canvas.height + 25]);

          console.log('canvas', canvas)
          if (canvas) {
            _this.canvas.nativeElement.src = canvas.toDataURL();
            const content = canvas.toDataURL('image/png');
            // let imageData = this.getBase64Image(this.canvas.nativeElement);
            pdf.addImage(content, "JPG", 10, 10, canvas.width -15,   canvas.height -25);
            pdf.save('pointlessOutput.pdf');
          }

        });
      } catch (error) {
        console.log(error)
      }
    }
  }


  printElectronReceipt(printerName: string, document) {
    const prtContent  = document.getElementById('printsection');
    const html = this.getPrintHTML(prtContent)
    const contents = `data:text/html;charset=utf-8,  ${encodeURIComponent(html) }`
    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    } as printOptions

    this.printElectron( contents, printerName, options)
  }

  async printTestLabelElectron(contents: string, printerName: string) {
    const fileName = `c:\\pointless\\print.txt`;
    // this.snack.open(`File could not be written. Please make sure you have a writable folder ${fileName}`, 'Error')
    const file = `file:///c://pointless//print.txt`
    const options = {
      silent: false,
      printBackground: false,
      deviceName: printerName
    }  as printOptions

    try {
      await  this.printElectron( contents, printerName, options )
      return true;
    } catch (error) {
      return false
    }

    return false
  }

  getPOSItem(site, id: number, history: boolean): Observable<IPurchaseOrderItem> {
    let posItem$: Observable<IPurchaseOrderItem>
    posItem$ = this.posOrderItemService.getPurchaseOrderItem(site, id)
    if (history) {
      posItem$ = this.posOrderItemService.getPurchaseOrderItemHistory(site, id)
    }
    return posItem$
  }

  printBuyLabel(item: IInventoryAssignment, menuItem: IMenuItem, order: IPOSOrder ) {
    const site = this.siteService.getAssignedSite()

    const product$ = this.menuItemService.getProduct(site, menuItem.id)
    return product$.pipe(switchMap(data => {
        if (data.packager) {
          return this.getContact(site, data.packager)
        }
        return of(null);
      }
    )).pipe(switchMap(data => {
      if (data) {
        menuItem.lab = data;
      }
      let labelPrint = {inventoryItem: item, menuItem: menuItem}
      return this.printLabel(labelPrint,  order.history, false)
    }))
  }

  //prints an item label from a POS Order
  printItemLabel(item: any, menuItem$: Observable<IMenuItem>, order: IPOSOrder, joinLabels: boolean ) {
    const site = this.siteService.getAssignedSite()
    if (!menuItem$) {   menuItem$ = this.menuItemService.getMenuItemByID(site, item.productID)  }
    const posItem$ = this.getPOSItem(site, item.id, order.history)

    return posItem$.pipe(
      concatMap(data => {
        if (data && data.inventoryAssignmentID) {
          return this.inventoryService.getInventoryAssignment(site, data.inventoryAssignmentID)
        }
        return of(null)
      })
    ).pipe(
      concatMap(inv => {
        if (inv) {
          item.inventory = inv;
        }
        return menuItem$
      }
    )).pipe(concatMap(menuItem => {
      item.menuItem = menuItem;
      return this.menuItemService.getProduct(site, item.menuItem.id)
    })).pipe(concatMap(data => {
        if (data.packager) {
          return this.getContact(site, data.packager)
        }
        return of(null);
      }
    )).pipe(concatMap(data => {
      if (data) {   item.lab = data; }
      return this.printLabel(item,  order.history, joinLabels, order)
    }))
  }

  //Prints a label on it's own
  printLabel(item: any, history: boolean, joinLabels: boolean, order?: IPOSOrder) {

    if (!item || !item.orderID) {return of(null)}

    const site = this.siteService.getAssignedSite();
    const orderID = item.orderID;
    let printer = {} as any;
    let menuItem$ = this.getLabelMenuItem(site, item)

    const printer$ = this.getLabelprinterFromDevice()

    const result$ =  printer$.pipe(
      concatMap(data => {
        printer = {text: data?.labelPrinter}
        if (!data ) {
          this.siteService.notify('No Printer assigned to label', 'Alert', 2000)
          return of(null)
        }
        return menuItem$
      })).pipe(
        concatMap(data => {
          if ( !data || !data.itemType) {   return of(null)   }
          this.menuItem = data;
          if ( data.itemType && ( ( data.itemType.labelTypeID != 0 ) && printer.text ) ) {
            return  this.settingService.getSetting(site, data.itemType.labelTypeID)
          } else {
            if (history) {
              this.siteService.notify('History Item printing.', 'Close',  10000)
              return of(null)
            }
            return this.orderItemService.setItemAsPrinted(site, item )
          }
      })).pipe(
        concatMap( data => {

          if (!data) {
            console.log('No item type data', data);
            this.siteService.notify('No Label Type Identified.', 'Close', 10000)
            return of(null)
          }

          try {
            let field = 'productName';
            if (data[field]) {
              this.siteService.notify('Item type Error.', 'Close', 10000)
              return of(null)
            }
          } catch (error) {
            console.log('error occured')
            return of(null)
          }

          //get the menu item from earlier.
          item.menuItem = this.menuItem;
          const labID = this.menuItem?.labID;
          const producerID = this.menuItem?.producerID;

          let lab$ : Observable<any>;
          let producer$ : Observable<any>;

          lab$ = of(null)
          producer$ = of(null);

          if (labID) {  this.getContact(site, labID)   }
          if (producerID) {  producer$  = this.getContact(site, producerID)  }

          return forkJoin([lab$, producer$, of(data)])

      })).pipe(
        concatMap( results => {

          if (!results) {
            // this.siteService.notify('Lab or producer not found.', 'Close', 10000)
            return of(null)
          }
          const data = results[2];

          if (!data) { return of(null) }

          try {
            const lab = results[0]
            const producer = results[1];
            if (lab) {  item.lab = lab;  }
            if (producer) {  item.producer = producer; }

            if (this.menuItem) {
              if (this.menuItem?.itemType?.type === 'cannabis') {
                if (!lab) { this.siteService.notify('Item has no lab assigned.', 'Alert', 2000)  }
                if (!producer) {  this.siteService.notify('Item has no producer assigned.', 'Alert', 2000)  }
              }
            }
          } catch (error) {
            console.log('error printing label', error )
          }

          if (item.inventoryItem) {    item = item.inventoryItem;  }
          const content = this.renderingService.interpolateText(item, data.text);

          if (!printer.text) { printer.text = this.labelPrinter; }
          if (printer.text) {
            const printerName = printer?.text

            if (!joinLabels) {
              this.labelContentList = []
              this.printLabelElectron(content, printerName) ;
            }

            if (joinLabels) {
              this.labelContentList.push(content)
            }
          }

          if (!item.printed || (data && !data.printed)) {
            return this.orderItemService.setItemAsPrinted(site, item )
          }
          return of(null);
      })).pipe(
        concatMap( data => {
          if (!joinLabels) {
            return this.orderService.getOrder(site, orderID.toString() , history);
          }
          return of(order)
      }))
    return result$
  }

  getLabelPrinter() {
    return
  }

  getLabelMenuItem(site : ISite, item: any): Observable<IMenuItem> {
    let  menuItem$  : Observable<IMenuItem>
    if (!item.menuItem) {
      menuItem$ = this.menuItemService.getMenuItemByID(site, item.productID);
    } else {
      menuItem$ = of(item.menuItem)
    }
    return menuItem$
  }

  getLabelprinterFromDevice() {
    return this.settingService.getDeviceSettings(localStorage.getItem('devicename')).pipe(
      concatMap(data => {
        const item = JSON.parse(data.text) as ITerminalSettings;
        this.uiSettingsService.updatePOSDevice(item)
        this.labelPrinter = item?.labelPrinter;
        return of(item)
      })
    )
  }

  getContact(site: ISite, contactID: number): Observable<IClientTable> {
    if (!contactID || contactID == null) {return of(null)};
    const client$ = this.clientService.getClient(site, contactID).pipe(
    switchMap(data =>
      { return of(data)  }
      ),
    catchError(data => {
        return of(null)
    }))
    return client$
  }

  stopTime() {
    clearInterval(this.interval);
  }

  getDefaultReceiptPrinter()
  {
    console.log('')
  }

  async saveContentsToFile(filePath: string, contents: string) {
    try {
      const fileWriting = this.electronService.remote.require('./datacap/transactions.js');
      let response      : any;
      response           =  await fileWriting.writeToFile(filePath, contents)
    } catch (error) {
      this.siteService.notify(`File could not be written. ${error}`, 'Close', 3000, 'red')
    }
  }

  saveCreditCardSale(data: string, code: string) {
    const uuid = UUID.UUID().slice(0,5);
    const file = `file:///c://pointless//payments//${code}.txt`
    const fileName = `c:\\pointless\\payments\\print${code}.txt`;
    try {
      this.saveContentsToFile(fileName, data);
    } catch (error) {
      this.siteService.notify(`File could not be written.
                                Please make sure you have a writable folder ${fileName}`, 'Close', 3000, 'red')
    }
  }

  getPrintHTML(prtContent) {
    const content      = `${prtContent.innerHTML}`
    let styles  = ''
    if (this.receiptStyles) {
      const styles =  this.receiptStyles.text;
    }
    const htmlHeader = `<!DOCTYPE html <html>
                        <head>
                        <style>${styles}</style>
                        <title>Print</title>
                        </head> <body>`
    const htmlFooter = '</body> </html>'
    const html = `${htmlHeader}  ${content} ${htmlFooter}`
    return html
  }

  async saveReceiptHTML(prtContent: any) {
    const site = this.siteService.getAssignedSite();
    let styles  = ''
    if (this.receiptStyles) { const styles =  this.receiptStyles.text; }
    let setting = {} as ISetting;
    setting.name = 'receiptStyles';
    setting.text = this.getTestData(prtContent);
    const observerable$ = await this.settingService.setText(site, setting)
  }

  getTestData(prtContent: any) {
    return prtContent.innerHTML;
  }

  setElectronLabelPrinter(setting: ISetting) : Observable<ISetting> {
    return this.setSetting(setting)
  }

  setElectronReceiptPrinter(setting: ISetting) : Observable<ISetting> {
    return this.setSetting(setting)
  }

  setSetting(setting: ISetting) : Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    if (setting.id) {
      return this.settingService.putSetting(site, setting.id, setting)
    }
    if (!setting.id) {
      return this.settingService.postSetting(site, setting)
    }
  }

  ///
  getElectronLabelPrinter(): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByNameCachedNoRoles(site,'electronLabelPrinter')
  }

  getElectronLabelPrinterCached(): Observable<ISetting> {
    return this.getSettingCached('electronLabelPrinter')
  }

  /////
  getElectronReceiptPrinterCached(): Observable<ISetting> {
    return this.getSettingCached('defaultElectronReceiptPrinterName')
  }

  getElectronReceiptPrinter(): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const name = 'defaultElectronReceiptPrinterName'
    const item$ = this.settingService.getSettingByNameCachedNoRoles(site, name)
    const printer$ = item$.pipe(
      switchMap(
        data => {
          if (!data) {
            const item = {} as ISetting;
            item.name = name;
            console.log('save setting from get electorn receipt printer')
            const result$ =  this.settingService.saveSetting(site, item)
            return result$
          }
          return of(data)
        }
      ),
      catchError((e) => {
          const item = {} as ISetting;
          item.name = name;
          const result$ =  this.settingService.saveSetting(site, item)
          return result$
        }
      )
    )
    return printer$;
  }

  getSetting(settingName: string) {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByNameCachedNoRoles(site, settingName)
  }

  getSettingCached(settingName: string): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByNameCached(site, settingName)
  }

  printDropValues(){
    this.updatePrintView(4);
    this.previewReceipt()
  }

  previewReceipt(autoPrint?: boolean, order?: IPOSOrder, printerName?: string ) {

    if (this.uiSettingsService.posDeviceInfo) {
      if (this.platFormService.androidApp) {
        const device = this.uiSettingsService.posDeviceInfo;
        this.printSub(device?.receiptPrinter, autoPrint);
        return of(null)
      }
    }

    this.printSub(printerName, autoPrint, order);
    return of(null);

  };

  printSub(printerName: string, autoPrint?: boolean, order?: IPOSOrder) {
    const dialogRef = this.dialog.open(RecieptPopUpComponent,
      { width: '425px',
        height: '90vh',
        data: {autoPrint: autoPrint, printerName: printerName, order: order}
      },
    )
    dialogRef.afterClosed().subscribe( result => {
      if (this.router.url == 'pos-payment' ) {
        if (!this.platFormService.isApp()) {
          const user = this.userAuthService.currentUser()
          if (user && user.roles == 'user') {
            if (this.order.balanceRemaining == 0) {

            }
          }
        }
      }
    });
  }

  printAuto(printerName: string, autoPrint?: boolean) {
    const dialogRef = this.dialog.open(RecieptPopUpComponent,
      { width: '425px',
        height: '90vh',
        data: {autoPrint: autoPrint, printerName: printerName}
      },
    )
    return dialogRef.afterClosed()
  }
}

// async applyStyles(site: ISite): Promise<ISetting> {
//   const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
//   const receiptStyle = await receiptStyle$.pipe().toPromise()
//   return this.setHTMLReceiptStyle(receiptStyle)
// }
