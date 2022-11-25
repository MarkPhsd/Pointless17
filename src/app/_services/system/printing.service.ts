import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import  html2canvas from 'html2canvas';
import  domtoimage from 'dom-to-image';
import { jsPDF } from "jspdf";
import { RenderingService } from './rendering.service';
import { LabelaryService, zplLabel } from '../labelary/labelary.service';
import { RecieptPopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, EMPTY, Observable, switchMap, of, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';
import { UserAuthorizationService } from './user-authorization.service';
import { MenuService, OrdersService } from 'src/app/_services';
import { POSOrderItemServiceService } from '../transactions/posorder-item-service.service';
import { OrderMethodsService } from '../transactions/order-methods.service';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { UISettingsService } from './settings/uisettings.service';
import { PrintingAndroidService} from  './printing-android.service';

export interface printOptions {
  silent: true;
  printBackground: false;
  deviceName: string;
}

@Injectable({
  providedIn: 'root'
})

export class PrintingService {

  zplSetting            : ISetting;
  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;
  item                  : IInventoryAssignment;
  order                 : IPOSOrder
  isElectronServiceInitiated = false

  private _printReady       = new BehaviorSubject<boolean>(null);
  public printReady$        = this._printReady.asObservable();

  private _printView          = new BehaviorSubject<number>(null);
  public printView$           = this._printView.asObservable();
  private __printView         : number;

  get printView() {
    return this.__printView;
  }

  updatePrintView(value: number) {
    this._printView.next(value);
    this.__printView = value;
  }

  constructor(  private electronService   : ElectronService,
                private snack             : MatSnackBar,
                private settingService    : SettingsService,
                private siteService       : SitesService,
                private renderingService  : RenderingService,
                private labelaryService   : LabelaryService,
                private orderService      : OrdersService,
                private router            : Router,
                private userAuthService   : UserAuthorizationService,
                private orderItemService  : POSOrderItemServiceService,
                private platFormService   : PlatformService,
                private menuItemService   : MenuService,
                private orderMethodsService: OrderMethodsService,
                private http              : HttpClient,
                private uiSettingsService : UISettingsService,
                private printingAndroidService   : PrintingAndroidService,
                private dialog            : MatDialog,) {
  }

  getPrintReady(): Observable<boolean> {
    return this.printReady$
  }

  updatePrintReady(status: boolean) {
    this._printReady.next(status)
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

  async initDefaultLabel() {
    const site = this.siteService.getAssignedSite();
    this.zplSetting           = await this.settingService.setDefaultZPLText(site);
  }

  async refreshInventoryLabel(zplText: string, data: IInventoryAssignment): Promise<string> {

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

  async refreshProductLabel(zplText: string, data: IInventoryAssignment): Promise<string> {

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


  async applyStyles(site: ISite): Promise<ISetting> {
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    const receiptStyle = await receiptStyle$.pipe().toPromise()
    return this.setHTMLReceiptStyle(receiptStyle)
  }

  applyStylesObservable(site: ISite): Observable<ISetting> {
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    return receiptStyle$
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
    const receiptStyle$ = this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
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
  public convertToPDF(node: any)
  {
    try {
      const options = { background: 'white', height: 845, width: 595 };
      domtoimage.toPng(node, options).then(
      data =>
      {
        //Initialize JSPDF
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.addImage(data, 'PNG', 0, 0, 250, 250);//change values to your preference
        doc.save('invoice.pdf');
      }, error =>
      {
        this.snack.open(error, 'PNG Error error')
      }
      )
    } catch (error) {
      this.snack.open(error, 'PNG Error error')
    }
  }

  async convertToPNG(node: any)
  {
    try {
      const options = { background: 'white', height: 845, width: 300 };
      return  domtoimage.toPng(node, options)
    } catch (error) {
      this.snack.open(error, 'PNG Error error')
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

  async printElectron(contents: string, printerName: string, options: printOptions) : Promise<boolean> {

    let printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })
    printWindow.loadURL(contents)
      .then( e => {

        if (options.silent) {
          printWindow.hide();
        }

        if (!options) {
          options = {
            silent: true,
            printBackground: false,
            deviceName: printerName
          }
        }

        printWindow.webContents.print(
          options,
          (error, data) => {
            if (error) {
              if (error == true)  {
                printWindow.close();
                printWindow = null;
                return false
              }
            }
            if (data) {
              printWindow.close();
              printWindow = null;
              return true
            }
          }
        )

        }).catch( err => {
          printWindow.close();
          printWindow = null;
          return false
        }
    )
    return false;

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
           _this.canvas.nativeElement.src = canvas.toDataURL();
           const content = canvas.toDataURL('image/png');
           // let imageData = this.getBase64Image(this.canvas.nativeElement);
           pdf.addImage(content, "JPG", 10, 10, canvas.width -15,   canvas.height -25);
           pdf.save('pointlessOutput.pdf');
         });
       } catch (error) {
         console.log(error)
       }
     }
  }

  getDefaultReceiptPrinter()
  {
    console.log('')
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

  printTestLabelElectron(printString: string, printerName: string): boolean {
    const fileName = `c:\\pointless\\print.txt`;
    try {
      // window.fs.writeFileSync(fileName, printString);
    } catch (error) {
      this.snack.open(`File could not be written. Please make sure you have a writable folder ${fileName}`, 'Error')
      return false
    }
    const file = `file:///c://pointless//print.txt`
    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    }  as printOptions

    try {
      this.printElectron( printString, printerName, options)
      return true;
    } catch (error) {
      return false
    }

    return false
  }

  async printLabel(item: PosOrderItem) {

    if (!item) {return}
    const site = this.siteService.getAssignedSite();

      //get cached label printer name
      const printer$ =  this.getElectronLabelPrinterCached()
      // const printerName = printer.text
      let printer = {} as any;

      const menuItem$ = this.menuItemService.getMenuItemByID(site, item.productID)
      printer$.pipe(data => {
          printer = data;
          if (!printer || !printer.text) {
            return of(null)
          }
          return  menuItem$
        }).pipe(
          switchMap(data => {
            if ( !data || !data.itemType) {
              return of(null)
            }
            if ( data.itemType && ( (data.itemType.labelTypeID != 0 ) && printer.text ) ) {
                if (data.itemType.labelTypeID !=0 ) {
                  return   this.settingService.getSetting(site, data.itemType.labelTypeID)
                }
            } else {
              return this.orderItemService.setItemAsPrinted(site, item )
            }

        })).pipe(
          switchMap( data => {
            if (!data) { return of(null) }
            const content = this.renderingService.interpolateText(item, data.text)
            if (printer.text) {
              const result  = this.printLabelElectron(content, printer.text)
            }

            if (!item.printed || (data && !data.printed)) {
              return this.orderItemService.setItemAsPrinted(site, item )
            }

            return EMPTY
        })).subscribe( data => {
          this.orderMethodsService.refreshOrder(item.orderID);
      })
  }

  printLabelElectron(printString: string, printerName: string): boolean {
    const fileName = `c:\\pointless\\print.txt`;
    try {
      // window.fs.writeFileSync(fileName, printString);
    } catch (error) {
      this.snack.open(`File could not be written. Please make sure you have a writable folder ${fileName}`, 'Error')
    }

    const file = `file:///c://pointless//print.txt`
    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    } as printOptions

    try {
      this.printElectron( file, printerName, options)
      return true;
    } catch (error) {
      console.log(error)
      return false
    }
  }

  getPrintHTML(prtContent) {
    console.log('print')
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
    if (this.receiptStyles) {
      const styles =  this.receiptStyles.text;
    }
    let setting = {} as ISetting;
    setting.name = 'receiptStyles';
    setting.text = this.getTestData(prtContent);
    const observerable$ = await this.settingService.setText(site, setting)
  }

  getTestData(prtContent: any) {
    // var prtContent = document.getElementById('print-section');
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
      // {
        // next:
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

  previewReceipt() {
    //get device settings;
    if (this.uiSettingsService.posDeviceInfo) {
      if (this.platFormService.androidApp) {
        // console.log(this.uiSettingsService.posDeviceInfo)
        const device = this.uiSettingsService.posDeviceInfo;
        this.printingAndroidService.printAndroidPOSReceipt( this.orderService.currentOrder, null, device.btPrinter );
        return;
      }
    }
    //if android

    //if
    if (this.uiSettingsService.posDeviceInfo) {
      if (this.platFormService.androidApp) {
        const device = this.uiSettingsService.posDeviceInfo;
        this.printSub(device.receiptPrinter)
        return;
      }
    }

    this.printSub(null);

  };

  printSub(printerName: string) {
    const dialogRef = this.dialog.open(RecieptPopUpComponent,
      { width: '425px',
        height: '90vh',
        data: {autoPrint: true, printerName: printerName}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      if (this.router.url == 'pos-payment' ) {
        if (!this.platFormService.isApp()) {
          const user = this.userAuthService.currentUser()
          if (user && user.roles == 'user') {
            if (this.order.balanceRemaining == 0) {
              this.orderService.updateOrderSubscription(null)
            }
          }
        }
      }
    });
  }

}
