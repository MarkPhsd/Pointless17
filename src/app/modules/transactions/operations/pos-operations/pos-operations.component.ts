import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransferDataService } from 'src/app/_services/transactions/transfer-data.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ITaxReport} from 'src/app/_services/reporting/reporting-items-sales.service';
import { Observable, of, Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { BatchClose, BatchSummary, Transaction } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { ICanCloseOrder } from 'src/app/_interfaces/transactions/transferData';
import { Tray } from 'electron';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'pos-operations',
  templateUrl: './pos-operations.component.html',
  styleUrls: ['./pos-operations.component.scss']
})
export class PosOperationsComponent implements OnInit {

  @ViewChild('printsection') printsection: ElementRef;
  @Input() site    : ISite;
  @Input() notifier: Subject<boolean>
  localSite: ISite;
  dateFrom: any;
  dateTo  : any;

  printerName: string;

  closeResult     = '';
  runningClose :  boolean;
  balanceSheets:  IBalanceSheet[]

  balanceSheetsClosed    = '';
  canCloseOrderResults: any;
  sale: ITaxReport;

  iBalanceSheet: IBalanceSheet;
  zrunID: any;
  dsiEMVSettings      : Transaction;
  batchSummary: any;
  batchClose: BatchClose;

  closingCheck$ : Observable<ICanCloseOrder>;
  uiTransactions: TransactionUISettings;
  uiTransactions$: Observable<TransactionUISettings>;

  get isElectronApp() {
    return this.platFormService.isAppElectron
  }

  constructor(
    private siteService        : SitesService,
    private transferDataService: TransferDataService,
    private balanceSheetService: BalanceSheetService,
    private router             : Router,
    private orderMethodsService: OrderMethodsService,
    private platFormService    : PlatformService,
    private printingService    : PrintingService,
    private dsiProcess         : DSIProcessService,
    private printingAndroidService: PrintingAndroidService,
    private sendGridService     :   SendGridService,
    private matSnack           : MatSnackBar,
    private uISettingsService: UISettingsService,
    // private AuthService       : UserAuth
  ) {
    if (!this.site) {
      this.site = this.siteService.getAssignedSite();
    }
  }

  ngOnInit(): void {

    const item  = localStorage.getItem('DSIEMVSettings');
    if (item) {
      this.dsiEMVSettings = JSON.parse(item) as Transaction;
    }

    this.getUser();
    this.refreshSales();
    this.refreshClosingCheck();
    this.initTransactionUISettings();
  }

  initTransactionUISettings() {
      this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(
      switchMap(data => {
        if (data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          return of(this.uiTransactions)
        }
        if (!data) {
          this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
          return of(this.uiTransactions)
        }
    }))
  }

  refreshClosingCheck() {
    const site = this.siteService.getAssignedSite();
    this.closingCheck$ = this.transferDataService.canCloseDay(site)
  }

  email() {
    const site = this.siteService.getAssignedSite();
    const zRun$ =  this.balanceSheetService.getZRUNBalanceSheet(site);

    zRun$.pipe(
      switchMap( data => {
        if (data && data.id) {
          return this.sendGridService.sendSalesReport(data.id, null,null)
        }
        return null;
    })).subscribe(
      {next: data => {
      this.matSnack.open('Email Sent', 'Success', {duration: 1500})
      }, error: err => {
        this.matSnack.open('Email Not sent, check with administrator', 'Alert', {duration: 1500})
      }
    })

  }

  refreshInfo(){
    this.localSite = {} as ISite;
    this.getUser();
    this.refreshSales();
    this.refreshClosingCheck();
  }

  addDates(StartDate: any, NumberOfDays : number): Date{
    StartDate = StartDate
    StartDate.setDate(StartDate.getDate() + NumberOfDays);
    return StartDate;
  }

  refreshSales() {
    const site = this.siteService.getAssignedSite();
    this.site = site
    this.balanceSheetService.getZRUNBalanceSheet(site).subscribe( data => {
      this.dateFrom = data.startTime
      if (!data.endTime) {
        this.dateTo = data.endTime
      }
      if (data.endTime) {
        this.dateTo = new Date().toString()
      }
      this.iBalanceSheet = data;
      this.zrunID = data.id;
    })
  }

  getUser() {
    this.localSite = this.siteService.getAssignedSite();
  }

  async emvDatacapBatchCards(): Promise<boolean> {
    try {
      if (this.uiTransactions && this.uiTransactions.dsiEMVNeteEpayEnabled) {
        this.batchSummary  = null;
        const response =  await this.dsiProcess.emvBatch()
        this.batchClose = response
        return true
      }
    } catch (error) {
      console.log('error batch', error)
    }
    return false
  }

  async  emvDataCapBatchInquire() {
    if (this.uiTransactions && this.uiTransactions.dsiEMVNeteEpayEnabled) {
      const response    = await this.dsiProcess.emvBatchInquire();
      this.batchSummary = response;
    }
  }

  async closeDay() {

    const result = window.confirm('Are you sure you want to close the day.');
    if (!result) {return}

    const site = this.siteService.getAssignedSite();
    this.runningClose = true;

    //run through checks. do all the closing checks on theWebapi.
    //return a can or not and reason why.
    try {
      if (this.isElectronApp) {
        if (this.uiTransactions && this.uiTransactions.dsiEMVNeteEpayEnabled) {
          const batchResult =  await this.emvDatacapBatchCards();
          if (!batchResult) {
            const answer = window.confirm('Batch error, did you want to continue closing? You can batch separately.')
          }
        }
      }
    } catch (error) {
      const answer = window.confirm(`Batch error ${error}, did you want to continue closing? You can batch separately.`)
      if (!answer) { return }
    }

    const closingCheck$ = this.transferDataService.canCloseDay(site)

    this.balanceSheetsClosed = ''
    closingCheck$.pipe(
      switchMap( data => {
        //determine if the day can be closed.
        //if it can't then return what is told from the webapi
        if (data){
          if (!data.allowClose) {
            this.closeResult = `Day not closed.  Open Printed Orders ${data?.openPrintedOrders?.length}.
                                Open Paid Orders ${data?.openPaidOrders?.length}.
                                Open Balance Sheets ${data?.openBalanceSheets?.length}`
            const result = this.orderMethodsService.notifyEvent(`Date not closed. ${data}`, 'Alert');
            this.canCloseOrderResults = data
            this.runningClose = false
            return
          }
        }
        console.log('close all continue')
        return this.transferDataService.closeAll(site);
      })).pipe(
        switchMap(
           data => {
            this.closeResult = 'Day closed. Closing balance Sheets.'
            this.runningClose = false;
            return this.balanceSheetService.closeAllSheets(site)
          // },
          // error: error => {
          //   return of ('Error Occured')
          // }
        }
      )).subscribe(data => {
        // if (data === 'Error Occured') {
        //   this.balanceSheetsClosed = 'Balance sheet not closed.'
        //   this.runningClose = false;
        //   return
        // }
        this.closeResult = 'Day closed. All balance sheets closed.'
        this.balanceSheetsClosed = ''
        this.runningClose = false;
    })
  }

  ordersWindow() {
    this.router.navigateByUrl('/pos-orders')
  }

  async print() {
    if (this.platFormService.isAppElectron) {
      const result = this.printElectron()
      return
    }
    if (this.platFormService.androidApp) {this.printAndroid();}
    if (this.platFormService.webMode)    { this.convertToPDF();}
  }

  closeAllSheets() {
    const site = this.siteService.getAssignedSite();
    this.runningClose = true;
    this.balanceSheetService.closeAllSheets(site).subscribe(
      {
        next: data => {
          this.balanceSheets = data;
          this.runningClose = false;
        },
        error: err => {
          this.closeResult = err
          this.runningClose = false;
        }
     }
    )
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

  convertToPDF() {
    console.log('convertToPdf')
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  async printElectron() {
    const styles =  '' //this.receiptStyles.text;
    const contents = this.getReceiptContents(styles)

    const options = {
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

  setPrinter(event) {
    this.printerName = event;
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
    // this.printingAndroidService.printTestAndroidReceipt( this.btPrinter)
  }

}
