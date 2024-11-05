import { Component, ElementRef, OnInit,  ViewChild, Input, TemplateRef } from '@angular/core';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import * as  printJS from "print-js";
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { Observable, of, switchMap } from 'rxjs';
import { HTMLEditPrintingComponent } from '../htmledit-printing/htmledit-printing.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import   domtoimage from 'dom-to-image';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { EditCSSStylesComponent } from '../edit-cssstyles/edit-cssstyles.component';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { Router } from '@angular/router';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { Capacitor} from '@capacitor/core';
// https://github.com/Ans0n-Ti0/esc-pos-encoder-ionic-demo
// https://github.com/tojocky/node-printer
//https://stackblitz.com/edit/angular-ivy-13kwjp?file=src%2Fapp%2Fprint-component%2Fprint.component.ts
// https://stackoverflow.com/questions/55019343/how-to-generate-a-pdf-using-angular-7
// https://printjs.crabbly.com/#documentation
//alternative with app installed on computer:
//https://www.neodynamic.com/articles/Print-HTML-from-Javascript-to-client-printer-without-print-dialog-silently/
// https://stackoverflow.com/questions/54689968/angular-application-build-in-electron-print-a-div-shows-blank-window/
// https://www.npmjs.com/package/electron-print-dialog
//~ Best List to look up:
// https://stackoverflow.com/questions/27057816/alternative-to-jzebra-qz-java-raw-print-plugin-after-npapi-being-dropped-on-chro
// https://stackblitz.com/edit/angular-1zwnqh
// https://superuser.com/questions/477895/printing-from-windows-7-command-line
// https://sodocumentation.net/node-js/topic/2726/executing-files-or-commands-with-child-processes
// https://stackoverflow.com/questions/12941083/execute-and-get-the-output-of-a-shell-command-in-node-js
// https://www.codota.com/code/javascript/functions/child_process/exec
// https://jscomplete.com/learn/node-beyond-basics/child-processes


@Component({
  selector: 'app-installed-printers',
  templateUrl: './installed-printers.component.html',
  styleUrls: ['./installed-printers.component.scss'],
  // providers: [ SafeHtmlPipe ]
})
export class InstalledPrintersComponent implements OnInit {

  @ViewChild('webPrintingTemplate') webPrintingTemplate: TemplateRef<any>;
  @ViewChild('androidPrintingTemplate') androidPrintingTemplate: TemplateRef<any>;
  @ViewChild('electronPrintingTemplate') electronPrintingTemplate: TemplateRef<any>;
  @ViewChild('electronPrintingDesignTemplate') electronPrintingDesignTemplate: TemplateRef<any>;

  @Input() printerName     : string;
  @Input() labelID         : number;
  @Input() item            : IInventoryAssignment;
  @Input() product         : IProduct;

  imageToShow      : any;
  headerText       : string;
  itemsText        : string;
  footerText       : string;
  paymentsText     : string;
  subFooterText    : string;

  interpolatedHeaderTexts : string;
  interpolatedItemTexts : string;
  interpolatedFooterTexts : string;
  interpolatedPaymentsTexts : string;
  interpolatedSubFooterTexts : string;

  @ViewChild('canvas')       canvas: ElementRef;
  @ViewChild('labelImage')   labelImageCanvas: ElementRef;
  @ViewChild('printsection') printsection: ElementRef;
  @ViewChild('receiptImage') receiptImage: ElementRef;

  receiptImage64            : any;
  setting                   : ISetting[];
  receiptSaved              : boolean;
  zplSetting                : ISetting;
  receiptLayoutSetting      : ISetting;
  receiptLayoutSetting$     : Observable<ISetting>;
  receiptStyles$            : Observable<any>;
  receiptStyles             : ISetting;
  zplText                   : string;
  electronLabelPrinter$     : Observable<ISetting>;
  labelImage$               : Observable<any>;
  labelImage64              : string;
  printerList               : any;
  result                    : any;
  isElectronServiceInitiated = false;
  receiptTemplateSaving$            : Observable<any>;

  receiptList$    :  Observable<IItemBasic[]>;
  labelList$      :  Observable<IItemBasic[]>;
  prepReceiptList$:  Observable<IItemBasic[]>;
  receiptID       :  number;
  receipt$        :  Observable<any>;
  isElectronApp         : boolean;
  electronSetting       : ISetting;
  electronReceiptPrinter: string;
  electronReceipt       : string;
  electronReceiptID     : number;
  electronPrinter$ : Observable<any>
  electronPrinter  : ISetting;
  electronLabelPrinter: string;
  electronLabelPrinterSetting: ISetting;
  electrongLabelID     : number;
  electronLabel        : string;

  items           : any[];
  payments        : any[];
  orderTypes      : any[];
  platForm        = '';

  btPrinters      : any=[];
  btPrinters$     : any;
  btPrinter       : string;
  imageConversion : any;

  printOptions    : printOptions;
  hideWindow      : boolean;
  showElectronPrinters = false;
  electronPrinterList : any;
  terminal : ITerminalSettings;
  terminalSetting : ISetting;
  terminalSetting$: Observable<ISetting>;
  deviceName = localStorage.getItem('devicename')

  platFormMap = Capacitor.getPlatform();
  constructor(
              private printingService       : PrintingService,
              private printingAndroidService: PrintingAndroidService,
              private btPrinterService      : BtPrintingService,
              private settingService        : SettingsService,
              private siteService           : SitesService,
              private dialog                : MatDialog,
              private fakeData              : FakeDataService,
              private renderingService      : RenderingService,
              public  platFormService       : PlatformService,
              public  orderService          : OrdersService,
              public orderMethodsService: OrderMethodsService,
              private router: Router,
  ) {
  }

  async ngOnInit() {
    this.printOptions = {} as printOptions;
    this.platForm = this.platFormService.platForm;
    await this.listPrinters();

    this.isElectronApp = this.platFormService.isAppElectron;
    this.electronLabelPrinter$ = this.getElectronLabelPrinter();

    this.getElectronPrinterAssignent().subscribe(data => {
      this.electronPrinter = data;
    })

    this.refreshSelections()

    if (this.platFormService.androidApp) {
      await this.getAndroidPrinterAssignment()
    }
  }

  async listPrinters(): Promise<any> {
    this.electronPrinterList =  await this.printingService.listPrinters();
    // console.log('printer list', this.electronPrinterList)
  }

  saveTerminalSetting()  {
    //terminal
    const site = this.siteService.getAssignedSite();
    this.settingService.getSettingByName(site,this.deviceName).pipe(
      switchMap(data => {
        this.terminalSetting = data;
        this.terminal = JSON.parse(data.text)  as ITerminalSettings;
        this.terminal.btPrinter = this.btPrinter;
        data.text = JSON.stringify(this.terminal);
        return this.settingService.putSetting(site,data.id,data)
    })).subscribe
  }

  navPosDevices() {
    this.router.navigate(['posDevies'])
  }

  async  getAndroidPrinterAssignment() {
    if (this.platFormService.androidApp) {
      this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
      this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    }
  }

  getElectronPrinterAssignent() {
    return this.printingService.getElectronReceiptPrinter().pipe(
      switchMap( data => {
        if (data) {
          this.electronSetting        = data;
          this.electronReceiptPrinter = data.text;
          this.electronReceipt        = data.value ;
          this.electronReceiptID      = +data.option1;
          if (this.printOptions) {
            this.printOptions.deviceName = data.text
          }
        }
        if (!data) {
          this.electronSetting = {} as ISetting;
          this.electronSetting.text = 'not defined'
          this.electronSetting.option1 = '0'
          this.electronReceiptID    = 0;
        }
        return of(this.electronSetting)
    }))
  }

  getElectronLabelPrinter() {
    return this.printingService.getElectronLabelPrinter().pipe(
      switchMap(data => {
        this.electronLabelPrinterSetting        = data;
        this.electronLabelPrinter               = data.text;
        this.electrongLabelID                   = +data.option1
        return of(data)
    }))
  }

  async  initDefaultLayouts() {
    try {
      const site = this.siteService.getAssignedSite();
      await this.printingService.initDefaultLayouts();
      await this.applyStyles();
      this.receipt$ = this.settingService.getSettingByName(site, 'Receipt Default').pipe(
        switchMap(data => {
        if (data) {
          this.refreshReceipt(data.id);
        }
        this.refreshSelections();
        return of(data)
      }))

    } catch (error) {
    }
  }

  initializeReceipt() {
    const warn = window.confirm ("This will over-write your current default receipt settings, are you sure you want to?")
    if (!warn) {return}
    const site = this.siteService.getAssignedSite();
     this.receipt$ = this.printingService.initDefaultLayoutsOBS().pipe(switchMap(data => {
      return this.settingService.getSettingByName(site, 'Receipt Default')
     })).pipe(switchMap(data => {
      if (data) { this.refreshReceipt(data.id); }
      this.refreshSelections();
      return of(data)
    }))
  }

  initDefaultLayoutsObs() {
    const site    = this.siteService.getAssignedSite();
    let styles$   = this.applyStylesOBS();
    let receipt$  = this.settingService.getSettingByName(site, 'Receipt Default');
    this.receipt$ = styles$.pipe(
      switchMap(data => {
        return receipt$
    })).pipe(
      switchMap(data => {
      if (data) {
        this.refreshReceipt(data.id);
      }
      this.refreshSelections();
      return of(data)
    }))
  }

  refreshReceipt(id: any) {
    if (!id || id == 0) { return }
    this.receiptLayoutSetting   = null;
    const site                  = this.siteService.getAssignedSite();
    const receipt$              = this.settingService.getSetting(site, id)
    this.receiptLayoutSetting$  = receipt$.pipe(
      switchMap(data => {
        this.receiptID = id
        this.receiptLayoutSetting = data;
        this.initSubComponent( data, this.receiptStyles )
        return of(data)
      })
    )
  }

  async initDefaultLabel(){
    await this.printingService.initDefaultLabel()
    const site            = this.siteService.getAssignedSite();
    this.labelList$       =  this.settingService.getLabels(site);
  }

  refreshSelections() {
    const site            =  this.siteService.getAssignedSite();
    this.receiptList$     =  this.settingService.getReceipts(site);
    this.labelList$       =  this.settingService.getLabels(site);
    this.prepReceiptList$ =  this.settingService.getPrepReceipts(site);
  }

  initSubComponent(receiptPromise: ISetting, receiptStylePromise: ISetting) {
    try {

      if (receiptPromise && receiptStylePromise) {
        this.receiptLayoutSetting =  receiptPromise
        this.headerText           =  this.receiptLayoutSetting.option6
        this.footerText           =  this.receiptLayoutSetting.option5
        this.itemsText            =  this.receiptLayoutSetting.text
        this.paymentsText         =  this.receiptLayoutSetting.option7
        this.subFooterText        =  this.receiptLayoutSetting.option8
      }
    } catch (error) {
      // console.log(error)
    }
  }

  async refreshDefaultLabel() {
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSettingByName(site, 'ZPLTemplate');
    zplTemp$.subscribe(data => {
      if (!data) {return}
      this.zplSetting  = data
      this.refreshLabelImage(data.id);
    })
  }

  // moved to labvel view selector
  refreshLabelImage(id: any) {
    const site     = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSetting(site, id);
    zplTemp$.subscribe(data => {
      if (!data) { return }
      this.zplSetting  = data
      const item        =  this.fakeData.getInventoryItemTestData();
      this.printingService.refreshInventoryLabel(this.zplSetting.text, item).then(
           data => {  this.labelImage64 = data } )
      }
    )
  }

  get  isAndroidPrintingTemplate() {
    if (this.platForm === 'android' ) {
      return this.androidPrintingTemplate
    }
    return null
  }

  get  isWebPrintingTemplate() {
    if (this.isElectronApp) { return }

    if (this.platForm === 'web' && (!this.isElectronApp)) {
      return this.webPrintingTemplate
    }
    return null
  }

  get  isElectronPrintingTemplate() {
    if (this.isElectronApp) {
      return this.electronPrintingTemplate
    }
    return null
  }

  get  isElectronPrintingDesignTemplate() {
    return this.electronPrintingDesignTemplate
  }

  applyStyles() {
    this.receiptStyles$  = this.applyStylesOBS()
  }

  applyStylesOBS( ) {
    const site         = this.siteService.getAssignedSite();
    const styles$ =   this.printingService.applyStylesObservable(site)
    return styles$.pipe(switchMap(data => {
      if (data) {
        this.receiptStyles = data;
        const style     = document.createElement('style');
        style.innerHTML = this.receiptStyles.text;
        document.head.appendChild(style);
        return of(data)
      }
    }))
  }

  sendElectron() {
  }

  listReceipts() {
  }

  listZPLLabels() {
  }

  listPrepTickets() {
  }

  printerSelect(event) {
  }

  getReceiptContents() {
    const prtContent     = document.getElementById('printsection');
    const content        = `${prtContent.innerHTML}`

    const loadView = ({title}) => {
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

  testWindow() {
    const site           = this.siteService.getAssignedSite();
    const prtContent     = document.getElementById('printsection');
    const content        = `${prtContent.innerHTML}`
    const loadView       = ({title,scriptUrl}) => {
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
            <script src="${scriptUrl}"></script>
          </body>
        </html>
      `)
    }

    var file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(loadView({
      title: "Account",
      scriptUrl: ""
    }));

    // const printWindow = new this.electronService.remote.BrowserWindow({ width: 350, height: 600 })
    // const id          = printWindow.id
    // printWindow.webContents.insertCSS(`html body {${this.receiptStyles.text}}`)
    // printWindow.loadURL(file)
  }

  getPrintContent(htmlContent: any) {
    let styles  = ''
    if (this.receiptStyles) {
      const styles =  this.receiptStyles.text;
    }
    const htmlHeader = `<!DOCTYPE html <html><head>
                        <style>${styles}</style>
                        <title>print</title>
                        </head> <body>`
    const htmlFooter = '</body> </html>'
    const html = `${htmlHeader}  ${htmlContent} ${htmlFooter}`
    return html
  }

  printTestLabelElectron(){
    if (this.zplSetting?.text) { return }
    const content = this.renderingService.interpolateText(this.item, this.zplSetting?.text)
    this.printingService.printTestLabelElectron(content, this.printerName)
  }

  printAndroid() {
    //create fake date for order. - get order info from postman to use.
    //passorder info to new method PrintAndroidReceipt.'
    //save selected printer to local storage
    //set saved printer name /bt id to selection on load.
    const order = this.orderMethodsService.currentOrder
    let payment = null
    if (order.posPayments) {
       payment = order.posPayments[0]
    }
    this.printingAndroidService.printAndroidPOSReceipt( order, payment, this.btPrinter)

    // this.printingAndroidService.printTestAndroidReceipt(this.btPrinter)
  }

  async printAndroidImage() {
    //this method uses an existing file within the assests folder.
    // let img = new Image();
    // img.src = '/assets/receipt.png';
    // let img = new Image();
    // img.src = '/assets/receipt.jpg';
    // const img = this.putImageOnScreen();
    // if (!img) {
    //   this.snack.open('no image created', 'fail')
    //   return
    // }


    // let img = new Image();
    // // img.src = 'https://cafecartel.com/temp/logo.png';
    // img.src = '/assests/icons/icon-72x72.png'
    const options = { background: 'white', height: 800, width: 400 };
    domtoimage.toPng( this.receiptImage.nativeElement , options).then(
      data => {
        var img = new Image();
        img.src = data;
        this.printingAndroidService.printAndroidImage( img , this.btPrinter)
      })

    return

    // img.src = '/assests/icons/icon-72x72.png'
    // this.printingService.printAndroidImage( img, this.btPrinter)
    // return
    //we need to generate the iamge from the printSection
    // const options = { background: 'white', height: 1000, width: 600 };

    domtoimage.toPng(document.getElementById('printImage') , options).then(
      data => {
        var img = new Image();
        img.src = data;
        // const newImage = document.body.appendChild(img);
        // this.receiptImage.nativeElement = img
        this.receiptImage64 =   `${img.src}`

        // let img = new Image();
        // img.src =  this.receiptImage64
        this.printingAndroidService.printAndroidImage( img  , this.btPrinter)
      }
    )
  }

  putImageOnScreen(): HTMLImageElement {
    let node = document.getElementById('printsection') ;
    const options = { background: 'white',  height: 1000, width: 600 };
    domtoimage.toPng(node, options).then(
      data =>
      {
        if (!data) {return}
        let img = new Image();
        img.src = data;
        this.receiptImage64 =  `${img.src}`
        // this.snack.open(img.src, 'image')
        return img
      }, err => {
        // this.snack.open(err, 'Failed')
      }
    )
    return null;
  }

  async printElectron() {
    const contents = this.getReceiptContents()
    if (this.printOptions) {
      this.printOptions.deviceName = this.printerName
      this.printingService.printElectron( contents, this.printerName, this.printOptions)
    }
  }

  convertToPDF() {
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  printTestTolabelPrinter() {
    let printerName: string;
    if (this.printerName) { printerName = this.printerName  }
    if (!printerName) { printerName = 'ZebraLabel' }
    this.printToPrinter(printerName)
  }

  printReceiptPrinterTest() {
    this.printToPrinter('Receipt')
  }

  printToPrinter(printerName: string) {
    let styles = ''
    if (this.receiptStyles) {
      styles = this.receiptStyles.text;
    }
    printJS(
      {
        printable: 'printsection',
        type: 'html',
        css: styles,
        targetStyles: ['*']
      }
    )
  }

  async resetDefaultLayouts() {
    const site = this.siteService.getAssignedSite();
    const result = window.confirm('Are you sure? This will reset your printer settings.');
    if (result) {
      await this.settingService.deleteSettingByName(site, 'Receipt Default').pipe().toPromise();
      await this.settingService.setDefaultReceiptLayout(site)
      this.refreshSelections();
    }
  }

  async resetStyles() {
    //setDefaultReceiptStyles
    const site = this.siteService.getAssignedSite();
    const result = window.confirm('Are you sure? This will reset your CCS Styles that apply to receipts.');
    if (result) {
      await this.settingService.deleteSettingByName(site, 'ReceiptStyles').pipe().toPromise();
      await this.settingService.setDefaultReceiptStyles(site)
      this.refreshSelections();
    }
  }

  savePDF() {
    this.printingService.savePDF(this.printsection.nativeElement, this)
  }

  getDomToImage(elementName: any) {
    const node = document.getElementById(elementName);
    this.printingService.getDomToImage(node);
  }

  getReceiptText() {
    return ''
  }

  editReceiptStyles() {
    this.editCssStyles('receiptStyles')
  }

  editCssStyles(name: string) {
    const site = this.siteService.getAssignedSite();
    if (!name) { return }
    const obs$ = this.settingService.getSettingByName(site, name);
    obs$.subscribe( data => {
      let dialogRef: any;
      dialogRef = this.dialog.open(EditCSSStylesComponent,
          { width:        '800px',
            minWidth:     '800px',
            height:       '850px',
            minHeight:    '850px',
            data : data
          },
        )
        dialogRef.afterClosed().subscribe(result => {
          this.refreshSelections();
        });
      }
    )
  }

  openEditor(id: number, type?: number) {
    const site = this.siteService.getAssignedSite();

    let obs$ = this.settingService.getSetting(site, id)
    if (!id && type ==2) {
      const setting = {} as ISetting;
      setting.name = 'Label'
      setting.description = 'labels'
      obs$ = this.settingService.postSetting(site, setting)
    }


    // const obs$ = ;
    obs$.subscribe( data => {
      const dialogConfig = [
        { data: { id: id } }
      ]
      let dialogRef: any;
      dialogRef = this.dialog.open(HTMLEditPrintingComponent,
          { width:        '800px',
            minWidth:     '800px',
            height:       '850px',
            minHeight:    '850px',
            data : {setting: data}
          },
        )
        dialogRef.afterClosed().subscribe(result => {
          this.refreshSelections();
          if (this.receiptLayoutSetting) {
          this.refreshReceipt(this.receiptLayoutSetting.id);
          }
          if (this.labelID) {
            const labelID = this.labelID
            this.labelID = 0
            this.labelID = labelID;
          }
        });
      }
    )
  }

  setElectronReceiptID(event) {
    const site = this.siteService.getAssignedSite();
    const item$ = this.settingService.saveSettingObservable(site, event)
    console.log('setElectronReceiptID', event)
    this.receiptSaved = true
    this.receiptTemplateSaving$ = item$.pipe(
      switchMap( data=> {
        this.receiptSaved = false
        return of(data)
      })
    )
  }

  setElectronPrinterName(event) {
    this.electronReceiptPrinter = event
    const site = this.siteService.getAssignedSite();
    const printerSettingName = 'defaultElectronReceiptPrinterName'
    this.settingService.getSettingByNameNoRoles(site, printerSettingName).pipe(
      switchMap(list  => {
          const data = list[0]
          if (data) {
            this.electronSetting = data;
          }
          if (!this.electronSetting) {
            this.electronSetting = {} as ISetting;
          }
          if (data) {
            this.electronSetting = data;
          }
          this.electronSetting.name   = printerSettingName
          this.electronSetting.text   = event
          this.electronReceiptPrinter = event;
          const receipt$ = this.printingService.setElectronReceiptPrinter(this.electronSetting);
          return receipt$
      })).subscribe(data => {
        this.electronReceiptPrinter = data.text;
        this.electronReceiptID      = +data.option1;
        this.electronReceipt        = data.value;
      })
  }


  setElectronReceipt(electronSetting: ISetting) {
    if (!electronSetting) { return}
    const receipt$ = this.printingService.setElectronReceiptPrinter(this.electronSetting);
    receipt$.subscribe(data => {
      this.electronReceiptPrinter = data.text;
      this.electronReceiptID      = +data.option1;
      this.electronReceipt        = data.value;
    })
  }

  setElectronLabelPrinterName(event) {
    this.electronLabelPrinter = event
    if (!this.electronLabelPrinter) { return }
    if (!this.electronLabelPrinterSetting) { this.electronLabelPrinterSetting = {} as ISetting}
    this.electronLabelPrinterSetting.name   = 'defaultElectronLabelPrinter'
    this.electronLabelPrinterSetting.text   = event
    this.electronLabelPrinter               = event;
    this.setElectronLabel(this.electronLabelPrinterSetting);
  }

  showElectronPrinterSelection() {
    this.showElectronPrinters = true
  }

  setElectronLabel(setting: ISetting) {
    if (!setting) { return}
    const receipt$ = this.printingService.setElectronLabelPrinter(setting);
    receipt$.subscribe(data => {
      this.electronLabelPrinter = data.text;
      this.electrongLabelID     = +data.option1;
      this.electronLabel        = data.value;
    })
  }

  setAndroidReceiptPrinter(event) {
    console.log('')
  }

  // setDefaultElectronReceiptPrinterName(name: string) {
  //   this.printerName = name
  //   localStorage.setItem('defaultElectronReceiptPrinter', name)
  //   if (this.electronSetting) {
  //     this.electronSetting.text = name;
  //   }
  //   this.printingService.getDefaultElectronReceiptPrinter().pipe( switchMap( data =>  {
  //     data.text  = name;
  //     return  this.printingService.setDefaultElectronReceiptPrinter(data)
  //   })
  //   ).subscribe(data => {
  //     console.log('printer setting', data)
  //   })
  // }

  getLabelID(id: any) {
    this.labelID = parseInt(id)
  }


}
