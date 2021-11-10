import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import * as _ from "lodash";
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Settings } from 'electron/main';
import { ISetting, ISite } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';
import { jsPDF } from "jspdf";
import * as  printJS from "print-js";
import { RenderingService } from './rendering.service';
import { LabelaryService, zplLabel } from '../labelary/labelary.service';
import { FakeDataService } from './fake-data.service';
import { BtPrintingService } from './bt-printing.service';
import { RecieptPopUpComponent } from 'src/app/modules/admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

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

  constructor(  private electronService   : ElectronService,
                private snack             : MatSnackBar,
                private settingService    : SettingsService,
                private siteService       : SitesService,
                private renderingService  : RenderingService,
                private labelaryService   : LabelaryService,
                private fakeDataService   : FakeDataService,
                private btPrintingService : BtPrintingService,
                private dialog            : MatDialog,
                private http              : HttpClient,) {

    if (this.electronService.remote != null) {
      this.isElectronServiceInitiated = true
      console.log('electron services initiated')
    }
  }

  async initDefaultLayouts() {
    const site = this.siteService.getAssignedSite();
    //initialize generic items for testing.
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
    console.log('initialized label')
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
      // const styles = this.renderingService.interporlateFromDB(receiptStyles.text)
      const style = document.createElement('style');
      style.innerHTML = receiptStylePromise.text;
      document.head.appendChild(style);
      return receiptStylePromise
    }
  }

  listPrinters(): any {
    const printWindow = new this.electronService.remote.BrowserWindow({ show:false })
    printWindow.loadURL('http://github.com')
    return printWindow.webContents.getPrinters();
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

  setLastLabelUsed(id: number) {
    localStorage.setItem('lastLabelUsed', id.toString())
  }

  async printElectron(contents: string, printerName: string, options: any,  hideWindow: boolean) {

    const site                = this.siteService.getAssignedSite();
    const receiptStyle$       = this.settingService.getSettingByName(site, 'ReceiptStyles')
    const printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })

    printWindow.loadURL(contents)
      .then((e) => {
        if (hideWindow) {
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
                return
              }
            }
            if (data) {
              printWindow.close();
              return
            }
          }
        )
        }).catch((e) => {
          console.log(e);
        }
    )
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
    }

    this.printElectron( contents, printerName, options, true)
  }

  printTestLabelElectron(printString: string, printerName: string): boolean {
    const fileName = `c:\\pointless\\print.txt`;
    try {
      window.fs.writeFileSync(fileName, printString);
    } catch (error) {
      this.snack.open(`File could not be written. Please make sure you have a writable folder ${fileName}`, 'Error')
      return false
    }

    const file = `file:///c://pointless//print.txt`
    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    }
    console.log('printerName',printerName)
    console.log('printString',printString)

    try {
      this.printElectron( printString, printerName, options, true)
      return true;
    } catch (error) {
      return false
    }

    return false
  }

  printLabelElectron(printString: string, printerName: string): boolean {
    const fileName = `c:\\pointless\\print.txt`;
    try {
      window.fs.writeFileSync(fileName, printString);
    } catch (error) {
      this.snack.open(`File could not be written. Please make sure you have a writable folder ${fileName}`, 'Error')
    }

    const file = `file:///c://pointless//print.txt`
    const options = {
      silent: true,
      printBackground: false,
      deviceName: printerName
    }

    try {
      this.printElectron( file, printerName, options, true)
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

  setDefaultElectronReceiptPrinter(setting: ISetting) : Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    return this.settingService.putSetting(site, setting.id, setting)
  }

  getDefaultElectronReceiptPrinter(): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByName(site, 'defaultElectronReceiptPrinterName')
  }

  previewReceipt() {
    const dialogRef = this.dialog.open(RecieptPopUpComponent,
      { width: '425px',
        height: '90vh',
      },
    )
  }

}
