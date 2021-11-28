import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransferDataService } from 'src/app/_services/transactions/transfer-data.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ITaxReport} from 'src/app/_services/reporting/reporting-items-sales.service';
import { Subject } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { PrintingAndroidService } from 'src/app/_services/system/printing-android.service';

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

  constructor(
    private siteService        : SitesService,
    private transferDataService: TransferDataService,
    private balanceSheetService: BalanceSheetService,
    private router             : Router,
    private platFormService       : PlatformService,
    private printingService       : PrintingService,
    private printingAndroidService: PrintingAndroidService,

  ) {

    if (!this.site) {
      this.site = this.siteService.getAssignedSite();
    }

  }

  ngOnInit(): void {
    this.getUser();
    this.refreshSales();
  }

  refreshInfo(){
    this.localSite = {} as ISite;
    this.getUser();
    this.refreshSales();
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
      this.iBalanceSheet = data;
      this.zrunID = data.id;
    })
  }

  getUser() {
    this.localSite = this.siteService.getAssignedSite();

  }

  closeDay() {

    const result = window.confirm('Are you sure you want to close the day.');
    if (!result) {return}

    const site = this.siteService.getAssignedSite();
    this.runningClose = true;

    //run through checks. do all the closing checks on theWebapi.
    //return a can or not and reason why.
    const closingCheck$ = this.transferDataService.canCloseDay(site)
    this.balanceSheetsClosed = ''
    closingCheck$.pipe(
      switchMap( data => {
        console.log(data)
        //determine if the day can be closed.
        //if it can't then return what is told from the webapi
        if (data){
          if (!data.allowClose) {
            this.canCloseOrderResults = data
            this.runningClose = false
            return
          }
        }
        return this.transferDataService.closeAll(site);
      })).pipe(
        switchMap(
          data => {
            this.closeResult = 'Day closed.'
            this.runningClose = false;
            return this.balanceSheetService.closeAllSheets(site)
          }
      )).subscribe(data => {
        this.balanceSheetsClosed = 'All balance sheets closed'
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
    this.balanceSheetService.closeAllSheets(site).subscribe(data => {
      this.balanceSheets = data;
      this.runningClose = false;
     }, err => {
      this.closeResult = err
      this.runningClose = false;
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
