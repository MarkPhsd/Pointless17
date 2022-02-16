import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import  html2canvas from 'html2canvas';
import  domtoimage from 'dom-to-image';
import { jsPDF } from "jspdf";
import { RenderingService } from './rendering.service';
import { LabelaryService, zplLabel } from '../labelary/labelary.service';
import { RecieptPopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { PlatformService } from './platform.service';
import { OrdersService } from '..';
import { UserAuthorizationService } from './user-authorization.service';

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

  constructor(  private electronService   : ElectronService,
                private snack             : MatSnackBar,
                private settingService    : SettingsService,
                private siteService       : SitesService,
                private renderingService  : RenderingService,
                private labelaryService   : LabelaryService,
                private orderService      : OrdersService,
                private router            : Router,
                private userAuthService         : UserAuthorizationService,
                private platFormService   : PlatformService,
                private dialog            : MatDialog,) {

    // if (this.electronService.remote != null) {
    //   this.isElectronServiceInitiated = true
    //   console.log('electron services initiated')
    // }
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

  async applyStyles(site: ISite): Promise<ISetting> {
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    const receiptStylePromise = await receiptStyle$.pipe().toPromise()
    if (receiptStylePromise) {
      const style = document.createElement('style');
      style.innerHTML = receiptStylePromise.text;
      document.head.appendChild(style);
      return receiptStylePromise
    }
  }

  async  appyStylesCached(site: ISite): Promise<ISetting> {
    const receiptStyle$       = this.settingService.getSettingByNameCached(site, 'ReceiptStyles')
    const receiptStylePromise = await receiptStyle$.pipe().toPromise()
    if (receiptStylePromise) {
      const style = document.createElement('style');
      style.innerHTML = receiptStylePromise.text;
      document.head.appendChild(style);
      return receiptStylePromise
    }
  }

  listPrinters(): any {
    try {
      let printWindow = new this.electronService.remote.BrowserWindow({ show:false })
      printWindow.loadURL('http://github.com')
      return printWindow.webContents.getPrinters();
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

    const printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })
    printWindow.loadURL(contents)
      .then((e) => {
        if (options.silent) {
          printWindow.hide();
        }
        if (!options) {
          options =
          { silent: true,
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
                return true
              }
            }
            if (data) {
              printWindow.close();
              return true
            }
          }
        )
        }).catch((err) => {
          // console.log(e);
          printWindow.close();
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

  printElectronReceipt(printerName: string, styles: ISetting, document) {
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
    return this.getSetting('electronLabelPrinter')
  }

  getElectronLabelPrinterCached(): Observable<ISetting> {
    return this.getSettingCached('electronLabelPrinter')
  }

  /////
  getElectronReceiptPrinterCached(): Observable<ISetting> {
    return this.getSettingCached('defaultElectronReceiptPrinterName')
  }

  getElectronReceiptPrinter(): Observable<ISetting> {
    return this.getSetting('defaultElectronReceiptPrinterName')
  }

  getSetting(settingName: string) {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByName(site, settingName)
  }

  getSettingCached(settingName: string): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByNameCached(site, settingName)
  }


  previewReceipt() {
    const dialogRef = this.dialog.open(RecieptPopUpComponent,
      { width: '425px',
        height: '90vh',
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      if (this.router.url == 'pos-payment') {
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
