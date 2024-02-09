import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransferDataService } from 'src/app/_services/transactions/transfer-data.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ITaxReport} from 'src/app/_services/reporting/reporting-items-sales.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService, printOptions } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { DSIProcessService } from 'src/app/_services/dsiEMV/dsiprocess.service';
import { BatchClose, Transaction } from 'src/app/_services/dsiEMV/dsiemvtransactions.service';
import { ICanCloseOrder } from 'src/app/_interfaces/transactions/transferData';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { AuthenticationService, OrdersService, ReportingService } from 'src/app/_services';
import { HttpClient } from '@angular/common/http';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { IPaymentSalesSummary, SalesPaymentsService } from 'src/app/_services/reporting/sales-payments.service';
import { DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'pos-operations',
  templateUrl: './pos-operations.component.html',
  styleUrls: ['./pos-operations.component.scss']
})
export class PosOperationsComponent implements OnInit, OnDestroy {

  closingProcedure$: Observable<any>
  @ViewChild('printsection') printsection: ElementRef;
  @ViewChild('metrcNetSalesSummary') metrcNetSalesSummary: TemplateRef<any>;

  //coaching
  @ViewChild('coachingCloseDay', {read: ElementRef}) coachingCloseDay: ElementRef;
  @ViewChild('coachingUnClosedBalanceSheets', {read: ElementRef}) coachingUnClosedBalanceSheets: ElementRef;
  @ViewChild('coachingUnpaidOrders', {read: ElementRef}) coachingUnpaidOrders: ElementRef;

  printAction$: Observable<any>
  styles: string;
  @Input() site    : ISite;
  @Input() notifier: Subject<boolean>
  localSite: ISite;
  dateFrom: any;
  dateTo  : any;

  value                  = false;
  childNotifier          : Subject<boolean> = new Subject<boolean>();

  printerName: string;
  printing   : boolean;

  closeResult     = '';
  runningClose :  boolean;
  balanceSheets:  IBalanceSheet[]
  user          : any;
  _user: Subscription;

  balanceSheetsClosed    = '';
  canCloseOrderResults: any;
  sale: ITaxReport;
  balanceSheet$  : Observable<any>;
  iBalanceSheet: IBalanceSheet;
  zrunID: any;
  dsiEMVSettings      : Transaction;
  batchSummary: any;
  batchClose: BatchClose;
  email$:         Observable<any>;
  emailSending   = false;
  closingCheck$ : Observable<ICanCloseOrder>;
  uiTransactions: TransactionUISettings;
  uiTransactions$: Observable<TransactionUISettings>;
  auths$: Observable<IUserAuth_Properties>;
  auths: IUserAuth_Properties;
  auditPayment$ : Observable<IPaymentSalesSummary>;
  auditPayment  : IPaymentSalesSummary;
  scheduleDateStart  = new Date
  scheduleDateEnd = new Date;
  autoPrint: boolean;
  printStyles: string;
  validateSales$: Observable<any>;
  batchSummary$: Observable<any>;
  terminalSettings$: Observable<ITerminalSettings>;
  terminalSettings: ITerminalSettings
  dsiEmv: DSIEMVSettings
  userSubscriber() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
  }
  get isElectronApp() {
    return this.platFormService.isAppElectron
  }

  constructor(
    private siteService        : SitesService,
    private transferDataService: TransferDataService,
    private balanceSheetService: BalanceSheetService,
    private router             : Router,
    private orderMethodsService: OrderMethodsService,
    private orderService       : OrdersService,
    private platFormService    : PlatformService,
    private printingService    : PrintingService,
    private dsiProcess         : DSIProcessService,
    private sendGridService    : SendGridService,
    private matSnack           : MatSnackBar,
    private uISettingsService  : UISettingsService,
    private settingsService: SettingsService,
    private httpClient: HttpClient,
    private coachMarksService: CoachMarksService,
    private authenticationService: AuthenticationService,
    private dcapService: DcapService,
    private paymentReportService: SalesPaymentsService,
    private cdr: ChangeDetectorRef
  ) {
    if (!this.site) {
      this.site = this.siteService.getAssignedSite();
    }
  }

  ngOnDestroy() {
    if (this._user) { this._user.unsubscribe()}
  }

  ngOnInit(): void {
    this.userSubscriber();
    const item  = localStorage.getItem('DSIEMVSettings');
    if (item) {
      this.dsiEMVSettings = JSON.parse(item) as Transaction;
    }
    this.printerName = localStorage.getItem('closeDayPrinter')
    this.printAction$ =  this.setPrintStyles().pipe(switchMap(data => {
      this.printStyles = data;
      return of(data)
    }))
    const site = this.siteService
    this.validateSales$ = this.balanceSheetService.validateDaysSales(this.site).pipe(switchMap(data => {
      this.refreshInit()
      return of(data)
    }),catchError(data => {
      this.refreshInit()
      return of(data)
    }))
    this.initTerminalSettings()
  }


  initTerminalSettings() {
    this.terminalSettings$ = this.settingsService.terminalSettings$.pipe(concatMap(data => {
      this.terminalSettings = data;
      this.dsiEmv = data?.dsiEMVSettings;
      if (!data) {
        const site = this.siteService.getAssignedSite();
        const device = localStorage.getItem('devicename');
        return this.getPOSDeviceSettings(site, device)
      }
      return of(data)
    }))
  }

  getPOSDeviceSettings(site, device) {
    return this.settingsService.getPOSDeviceSettings(site, device).pipe(concatMap(data => {
      this.settingsService.updateTerminalSetting(data)
      this.dsiEmv = data?.dsiEMVSettings;
      return of(data)
    }))
  }
  refreshInit() {
    this.getUser();
      this.refreshSales();
      this.refreshClosingCheck();
      this.initTransactionUISettings();
      this.setSchedulePeriod();
      this.initAuthentication();
      this.notifyChild();
  }

  refreshAudit(zrunID: number) {
    const site = this.siteService.getAssignedSite()
    return this.paymentReportService.getPaymentDiscrepancy(site, zrunID, '','')
  }

   initAuthentication() {
    this.auths$ =  this.authenticationService.userAuths$.pipe(
      switchMap(data => {
      this.auths = data;
      return of(data)
    }));
  }

  get isBlindClose() {
    return false
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

  get viewMetrcNetSales() {
    if (this.uiTransactions && (this.uiTransactions.recmedPricing || this.uiTransactions.enablMEDClients)) {
      return this.metrcNetSalesSummary;
    }
    return null
  }

  refreshClosingCheck() {
    const site = this.siteService.getAssignedSite();
    this.closingCheck$ = this.transferDataService.canCloseDay(site).pipe(
      switchMap( data => {
        return of(data)
      }
    ))
  }

  _email() {
    const site = this.siteService.getAssignedSite();
    const zRun$ =  this.balanceSheetService.getZRUNBalanceSheet(site);
    this.emailSending = true;
    const item$ = zRun$.pipe(
      switchMap( data => {
        if (data && data.id) {
          return this.sendGridService.sendSalesReport(site,data.id, null,null)
        }
        return null;
    })).pipe(
     switchMap( data => {
        this.emailSending = false;
        this.matSnack.open('Email Sent', 'Success', {duration: 1500})
        return of(data)
      }
    ))
    return item$
  }

  setPrintStyles() {
    const styles$ = this.httpClient.get('assets/htmlTemplates/salesreportStyles.html', {responseType: 'text'});
    styles$.pipe(
      switchMap(styles => {
        console.log('STYLes' , styles);
        this.styles = styles;
        return of(styles)
    }))
    return styles$
  }

  email() {
    this.email$ = this._email()
  }

  refreshInfo(){
    this.localSite = {} as ISite;
    this.getUser();
    this.refreshSales();
    this.refreshClosingCheck();
    const site = this.siteService.getAssignedSite()
    this.auditPayment$ = this.paymentReportService.getPaymentDiscrepancy(site, this.zrunID, '','')
  }

  setOrder(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.orderService.getOrder(site, id.toString(), false).subscribe(data => {
        this.orderMethodsService.setActiveOrder( data)
        }
      )
    }
  }

  addDates(StartDate: any, NumberOfDays : number): Date{
    StartDate = StartDate
    StartDate.setDate(StartDate.getDate() + NumberOfDays);
    return StartDate;
  }

  setSchedulePeriod() {
    this.scheduleDateStart  =  this.addDates(new Date, 30)
    this.scheduleDateEnd = this.addDates(this.scheduleDateStart, 30)
  }

  refreshSales() {
    const site = this.siteService.getAssignedSite();
    this.site = site
    this.balanceSheet$ = this.balanceSheetService.getZRUNBalanceSheet(site).pipe(
      switchMap(data => {
        this.dateFrom = data.startTime
        if (!data.endTime) {
          this.dateTo = data.endTime
        }
        if (data.endTime) {
          this.dateTo = new Date().toString()
        }
        this.iBalanceSheet = data;
        this.zrunID = data.id;
        console.log('balance Sheet', data)
        return of(data)
    }))
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
    }
    return false
  }

  async  emvDataCapBatchInquire() {
    if (this.uiTransactions && this.uiTransactions.dsiEMVNeteEpayEnabled) {
      const response    = await this.dsiProcess.emvBatchInquire();
      this.batchSummary = response;
    }
  }

  viewdcapBatchSummary() {
    this.batchSummary$ = this.dcapBatchSummary
  }
  forcedcapBatchClose() {
    this.batchSummary$ = this.dcapbatchClose
  }

  get dcapBatchSummary() {
    if (this.uiTransactions?.dCapEnabled) {
      const device = localStorage.getItem('devicename')
      return this.dcapService.batchSummary(device)
    }
    return of(null)
  }
  get dcapbatchClose() {
    if (this.uiTransactions?.dCapEnabled) {
      const device = localStorage.getItem('devicename')
      return this.dcapService.batchClose(device)
    }
    return of(null)
  }

  printEndOfDay() { 
    if (this.printStyles) { 
      if (this.platFormService.isAppElectron) {
        this.printElectron(this.printStyles)
        return
      }
    }
    return of(null)
  }

  async closeDay() {
    const result = window.confirm('Are you sure you want to close the day.');
    if (!result) {return}
    const site = this.siteService.getAssignedSite();
    this.runningClose = true;
    //run through checks. do all the closing checks on theWebapi.
    //return a can or not and reason why.

    if (this.uiTransactions?.dCapEnabled && !this.terminalSettings && !this.dsiEmv) {
      this.siteService.notify('To close the day, you must use a device attached to a credit card terminal', 'Close', 5000, 'red')
      return;
    }

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

    const dcapBatch$ = this.dcapbatchClose
    const email$ = this._email()
    const closingCheck$ = this.transferDataService.canCloseDay(site);

    this.orderMethodsService.clearOrderSubscription();
    this.balanceSheetsClosed = ''
    this.printEndOfDay() ;
    
    this.closingProcedure$ =
        dcapBatch$.pipe(switchMap(data => {
          return  email$
      })).pipe(switchMap(data => {
        return closingCheck$
        }
      )).pipe(switchMap( data => {
          //determine if the day can be closed.
          //if it can't then return what is told from the webapi
          if (data){
            if (!data.allowClose) {
              this.closeResult = `Day not closed.  Open Printed Orders ${data?.openPrintedOrders?.length}.
                                  Open Paid Orders ${data?.openPaidOrders?.length}.
                                  Open Balance Sheets ${data?.openBalanceSheets?.length}`
              const result = this.siteService.notify(`Date not closed.`, 'Close', 3000, 'red', 'top');
              this.canCloseOrderResults = data
              this.runningClose = false
              return of(null)
            }
          }
          if (!data) {
            this.closeResult = ' Check if can close not successfull.'
            return of(null)
          }
          return this.transferDataService.closeAll(site);
        }
      )).pipe(switchMap(data => {
        if (!data) {
          this.closeResult = this.closeResult + ' Data service not completed. '
          this.runningClose = false;
          return of(null)
        }
        return of(true)
      })).pipe(
        switchMap(data => {
          if (!data) {
            this.closeResult  =  this.closeResult + '.Email not sent.'
          }
          this.closeResult =  this.closeResult  + 'Email sent.'
          return this.balanceSheetService.closeAllSheets(site)
        }
      )).pipe(
        switchMap(data => {
          if (!data) {
            this.closeResult  =  this.closeResult + '.All balance sheets not closed.'
            this.runningClose = false;
            return of(null)
          }
          this.closeResult = this.closeResult  + 'Day closed. All balance sheets closed.'
          this.balanceSheetsClosed = ''
          this.runningClose = false;
          return of(data)
        }
      )
    )
  }

  notifyChild() {
    this.value = !this.value;
    this.childNotifier.next(this.value);
  }

  ordersWindow() {
    this.router.navigateByUrl('/pos-orders')
  }

  print(styles) {
    // this.autoPrint = true
    // this.cdr.detectChanges()
    if (!this.printerName) {
      this.siteService.notify('Please select a printer', 'Alert', 1000)
      return
    }
    if (this.platFormService.isAppElectron) {
      this.printElectron(styles)
      return
    }
    if (this.platFormService.androidApp) { this.printAndroid();}
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

    const content = this.printsection.nativeElement.innerHTML;
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
    this.printingService.convertToPDF( document.getElementById('printsection') )
  }

  printElectron(styles) {

    this.printing = true;
    this.cdr.detectChanges();

    const contents = this.getReceiptContents(styles)
    const options = {
      silent: true,
      printBackground: false,
      deviceName: this.printerName
    } as printOptions;

    if (!contents) {
      console.log('no contents in print electron')
      return
    }
    if (!options) {
      console.log('no options in print electron')
      return
    }
    if (!this.printerName) {
      console.log('no printerName in print electron')
      return
    }

    let result : boolean
    if (contents && this.printerName, options) {
      this.printing = true;
      let result = this.printingService.printElectron( contents, this.printerName, options)
      this.printing = false;
    }

    this.cdr.detectChanges();
    return result
  }

  setPrinter(event) {
    this.printerName = event;
    localStorage.setItem('closeDayPrinter', event)
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

  initPopOver() {
    if (this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      this.addCoachingList()
      this.coachMarksService.showCurrentPopover();
    }
  }

  addCoachingList() {
    this.coachMarksService.add(new CoachMarksClass(this.coachingCloseDay.nativeElement, "Close Day - Submits sales to Credit Card Batch, emails data. Clears Sales."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingUnClosedBalanceSheets.nativeElement, "Balance Sheets Open - If cashiers or servers haven't closed their balance sheets, buttons will appear that require they be closed before closing the day. The buttons will take you directly to the balance sheet to close."));
    this.coachMarksService.add(new CoachMarksClass(this.coachingUnpaidOrders.nativeElement, "Orders with Unpaid Items: If orders have been submitted with items unpaid on them, you will need to delete, void or remove those orders before you may close the day."));
  }

}
