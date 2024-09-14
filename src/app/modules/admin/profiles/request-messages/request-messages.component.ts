import { Component, Input, OnInit, Output,EventEmitter, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { DATABASE } from '@faker-js/faker/definitions/database';
import { BehaviorSubject, catchError, concatMap, delay, finalize, forkJoin, Observable, of, repeatWhen, Subject, switchMap, take, throwError, timer } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { IRequestMessage, IRequestMessageSearchModel, IRequestResponse, RequestMessageService } from 'src/app/_services/system/request-message.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

@Component({
  selector: 'app-request-messages',
  templateUrl: './request-messages.component.html',
  styleUrls: ['./request-messages.component.scss']
})
export class RequestMessagesComponent implements OnInit {

  //keep track of new observables for print jobs
  private observablesArraySubject = new BehaviorSubject<Observable<any>[]>([]);
  public observablesArray$ = this.observablesArraySubject.asObservable();

  @Input() user: IUser;
  @Output() emitCount = new EventEmitter()
  @Input() hideshowMessages: boolean; //hideshowMessages
  @Input() enableActions: boolean;
  @Input() orderID: number;
  @Input() posDevice: ITerminalSettings
  @Input() uiTransaction  : TransactionUISettings;
  
  actions: string;

  searchModel: IRequestMessageSearchModel;
  messages$: Observable<IRequestMessage[]>;
  message$: Observable<IRequestResponse>;
  refreshTime: number = 1
  order$     : Observable<IPOSOrder>;
  printJobs$ : Observable<IPOSOrder>[];
  action$    : Observable<any>;
  user$      : Observable<IUser>;
  printServerDevice  : ITerminalSettings;
  printServerDevice$ : Observable<ITerminalSettings>;
  messageRefresh$    : Observable<any>;
  initRefresh        : boolean;
  private observablesQueue: Observable<any>[] = [];
  private queueSubject = new Subject<Observable<any>>();
  private isProcessing = false;
  posDevice$: Observable<ITerminalSettings>;
  archiveAllMessagesVisible: boolean;
  private _printServer: boolean;

  unSubscribeAll() {
    if (this.observablesArraySubject) {
      this.observablesArraySubject.unsubscribe()
    }
    if (this.queueSubject) {
      this.queueSubject.unsubscribe()
    }
  }

  addObservable(newObservable: Observable<any>): void {
    const observableWithFinalize = newObservable.pipe(
      take(1),
      finalize(() => this.onObservableComplete())
    );
    this.observablesQueue.push(observableWithFinalize);
    this.checkQueue();
  }

  private checkQueue(): void {
    if (!this.isProcessing && this.observablesQueue.length > 0) {
      this.isProcessing = true;
      const nextObservable = this.observablesQueue.shift();
      this.queueSubject.next(nextObservable);
    }
  }

  private onObservableComplete(): void {
    this.isProcessing = false;
    this.checkQueue();
  }

  private processQueue(): void {
    this.queueSubject.subscribe(observable => {
      observable.subscribe({
        complete: () => {
          // Observable completed its work
          console.log('process Que')
        },
        error: (err) => {
          console.error('Observable encountered an error: ', err);
          this.onObservableComplete(); // Ensure the queue continues even if an error occurs
        }
      });
    });
  }

  refreshOrderMessages() {
    const site     = this.siteService.getAssignedSite();
    const search   = {}   as IRequestMessageSearchModel;
    search.orderID = this.orderID;
    this.archiveAllMessagesVisible = false

    const messages$ = this.requestMessageService.getOpenRequestMessagesByOrder(site, search);
    this.messages$ = messages$.pipe(switchMap(data => {

      if (data && data.length>0) {
        this.archiveAllMessagesVisible = true
      }
      return of(data)
    }))
    this.hideshowMessages = true;
  }

  refreshMessagingService(user) {
    return  this._refreshMessagingService(user)
  }

  _refreshMessagingService(user): void {
    if (!user) return;

    let retryDelay = 3000; // Base retry delay

    this.messageRefresh$ = this.getMessages().pipe(
      catchError(err => {
        // console.error('Error fetching messages, will retry after delay', err);
        // Return an observable that emits once (like a placeholder) to trigger the repeat mechanism
        return of({});
      }),
      // Use repeatWhen to handle retries
      repeatWhen(notifications => notifications.pipe(
        // Decide on the delay based on the queue's active state
        switchMap(() => this.isQueueActive ? timer(retryDelay + 30000) : timer(retryDelay))
      ))
    );
  }

  get isQueueActive(): boolean {
    // Check the queue's active state
    // Assuming 'isProcessing' indicates the queue's state, replace with actual logic if different
    return this.isProcessing;
  }

  refreshMessages() {
    if (this.orderID) {
      this.refreshOrderMessages();
      return
    }
    this.messages$ = this.getMessages('refresh messages');
  }

  getMessages(message?: string): Observable<IRequestMessage[]> {
    const site      = this.siteService.getAssignedSite();
    const search    = {} as IRequestMessageSearchModel;
    search.userID   = this.authenticationService.userValue.id;
    let check: boolean;
    let messages$: Observable<IRequestMessage[]>;

    if (this.printServerDevice?.printServerEnable) {
      messages$ = this.getManagerMessages()
      check = true
    }

    if (this.user.roles === 'manager' || this.user.roles === 'admin') {
      messages$ = this.getManagerMessages()
      check = true
    }

    if (this.user.roles === 'user') {
      messages$ = this.requestMessageService.getRequestMessagesByCurrentUser(site, search)
      check = true
    }

    if (!check) {
      // console.log('no check')
      return of(null)
    }

    return messages$.pipe(
      concatMap(data => {
        console.log('messages: ', data?.length, data)
        if (data) {
          if (data?.length>0) {
            this.processMessages(data)
            this.emitCount.emit(data?.length)
          }
        }
        return of(data)
      })
    )
  }

  getManagerMessages(): Observable<IRequestMessage[]> {
    const site      = this.siteService.getAssignedSite();
    const search    = {} as IRequestMessageSearchModel;
    search.archived = false;
    return this.requestMessageService.getOpenRequestMessages(site, search).pipe(concatMap(data => {
      return of(data)
    }))
  }

  archiveVoids() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.requestMessageService.archiveMessageVoids(site).pipe(switchMap(data => {
      this.refreshOrderMessages()
      return of(data)
    }))
  }

  archiveAll() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.requestMessageService.archiveMessagesAllMessages(site).pipe(switchMap(data => {
      this.refreshOrderMessages()
      return of(data)
    }))
  }
  processMessages(list:IRequestMessage[]): Observable<IRequestMessage[]> {

    if (!list) { return of(null)}

    let messages = [... list];
    //filter out the

    const filteredMessages = messages.filter(data => !data?.archived && data?.subject === 'Printing');
    // console.log('request messages', filteredMessages)

    this.collectPrintOrders(filteredMessages)

    const resultList = list.filter(data => {
      if (!data.archived && data?.subject != 'Printing') {
        return data
      }
    })

    // console.log('request messages', resultList)
    return of(resultList)
  }

  get isPrintServerCheck() {
    return this._printServer
  }

  getIsPrintServer() {
    let isDevice = false;
    this._printServer = false;
    if (!this.platFormService.isAppElectron) { 
      console.log('Not running in Electron, skipping print server check.');
      return isDevice; 
    }
  
    if (!this.uiTransaction?.printServerDevice) {
      console.log('No print server device configured.');
      return isDevice;
    }
  
    const deviceName = localStorage.getItem('devicename')
    if (this.uiTransaction.printServerDevice != deviceName) {
      console.log(`${deviceName} is the current device. ${this.uiTransaction?.printServerDevice} is the print server.`);
      return false
    }

    console.log('Checking print server for device:', this.posDevice?.name);

    if (this.posDevice && (this.posDevice?.name === this.uiTransaction?.printServerDevice)) {
      console.log('Print server mathes this device name:', this.posDevice?.name);
      this.printServerDevice = this.posDevice;
    }
  
    if (this.printServerDevice && this.printServerDevice.printServerEnable) {
      if (!this.initRefresh) {
        console.log('Setting print server with device:', this.printServerDevice);
        this.setPrintServer(this.printServerDevice);
        this.initRefresh = true;
        this._printServer = true;
      }
      isDevice = true;
    }  
 
    return isDevice;
  
  }

  setPrintServer(data: ITerminalSettings) {
    if (data?.printServerEnable) {
      if (data?.printServerTime != 0) {
        this.printServerDevice = data;
        this.refreshTime = +data?.printServerTime
        this._refreshMessagingService(this.user)
        return true
      }
    }
    return false
  }
  //depending on the type of job it is. we need to create an observable for each print job.

  collectPrintOrders(printMessages: IRequestMessage[]) {
    console.log('collectPrintOrders', this.printServerDevice?.printServerEnable);
    if (!this.printServerDevice?.printServerEnable) { return; }
    const site = this.siteService.getAssignedSite();
  
    const printObservables: Observable<any>[] = [];
  
    printMessages.forEach((data, index) => {
      if (data.method === 'printPrep') {
        const order$ = this.orderService.getOrder(site, data.orderID.toString(), false).pipe(
          concatMap(order => {
            return this.paymentsMethodsProcessService.sendToPrep(order, true, this.uiTransaction, true);
          }),
          concatMap(order => this._archiveMessage(data, true))
        );
        printObservables.push(order$);
      }
  
      if (data.method === 'printReceipt') {
        if (!this.isStaff && !this.posDevice) { return; }
        const order$ = this.orderService.getOrder(site, data.orderID.toString(), false).pipe(
          concatMap(order => {
            this.printingService.printOrder = order;
            console.log('remote print receipt Order:', this.refreshTime, order.orderID, 
              order?.total, order?.posPayments[0]?.amountPaid);
            this.orderMethodsService.selectedPayment = null;
            this.printingService.previewReceipt(true, order, this.printServerDevice?.receiptPrinter);
            return of(order);
          }),
          concatMap(order => this._archiveMessage(data, true))
        );
        printObservables.push(order$);
      }
    });
  
    // Wait for all print jobs to complete
    if (printObservables.length > 0) {
      forkJoin(printObservables).subscribe({
        next: () => {
          console.log('All print jobs completed');
          this.forceRefreshMessage();  // Trigger refresh after all jobs are done
        },
        error: (err) => {
          console.error('Error in one or more print jobs:', err);
          this.forceRefreshMessage();  // Still trigger refresh even if there's an error
        }
      });
    }
  
    printMessages = [];
  }
  
  // collectPrintOrders(printMessages: IRequestMessage[]) {
  //   console.log('collectPrintOrders', this.printServerDevice?.printServerEnable)
  //   if (!this.printServerDevice?.printServerEnable) { return }
  //   const site = this.siteService.getAssignedSite()

  //   const cancelUpdate = true
  //   printMessages.forEach((data, index) => {
  //     console.log(data?.method, data?.orderID)
  //     if (data.method === 'printPrep') {
  //       const order$ = this.orderService.getOrder(site, data.orderID.toString(),false).pipe(concatMap(order => {
  //           return this.paymentsMethodsProcessService.sendToPrep(order, true, this.uiTransaction, cancelUpdate  )
  //         })).pipe(concatMap(order =>  {
  //           return this._archiveMessage(data, true)
  //         }))
  //       this.addObservable(order$)
  //     }

  //     if (data.method === 'printReceipt') {
  //       if (!this.isStaff && !this.posDevice) { return }
  //       const order$ = this.orderService.getOrder(site, data.orderID.toString(), false).pipe(concatMap(data => {
  //          this.printingService.printOrder = data;
  //          console.log('remote print receipt Orderr:', this.refreshTime, data.orderID, 
  //                        data?.total, data?.posPayments[0]?.amountPaid)
  //          this.orderMethodsService.selectedPayment = null;
  //          this.printingService.previewReceipt(true, data , this.printServerDevice?.receiptPrinter);
  //          return of(data)
  //       })).pipe(concatMap(order =>  {
  //         return this._archiveMessage(data, true)
  //       }))
  //       this.addObservable(order$)
  //     }
  //   });
  //   printMessages = []
  // }

  get isStaff() {
    if (!this.user || !this.user?.roles) { return false}
    if (this.user?.roles.toLowerCase() === 'admin' || this.user?.roles.toLowerCase() === 'manager' || this.user?.roles.toLowerCase() === 'employee') {
      return true
    }
    return false
  }

  archivePrintOrderMessages(printMessages: IRequestMessage[]) {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.requestMessageService.archiveMessages(site, printMessages)
    this.printJobs$ = []
  }

  forceRefreshMessage()  {
    this.getMessages('force refresh')
  }

  initUserSubscriber() {
   
    let user : IUser;;
    this.user$ =  this.authenticationService.user$.pipe(switchMap(data => { 
      user = data;
      this.user  = data;
      return of(data)
    }))

      //   switchMap(data => {
    // this.user$ =  this.authenticationService.user$.pipe(
    //   switchMap(data => {
    //     this.messages$ = null;
    //     user = data;
    //     const deviceName = localStorage.getItem('devicename');
    //     return this.getDeviceInfo(deviceName)
    // })).pipe(switchMap(data => { 
    //   return of(user)
    // }))
  }

  getDeviceInfo(devicename) { 
    const site = this.siteService.getAssignedSite();
    return this.settingService.getPOSDeviceBYName(site, devicename).pipe(switchMap(data => {
        if (!data) { return of(null)}
        const device = JSON.parse(data.text) as ITerminalSettings;
        this.settingService.updateTerminalSetting(device)
        this.getIsPrintServer()
        if (device.enableScale) {  }
        this.posDevice = device;
        return of(device)
    }))
}


  //list out messages.
  constructor(private requestMessageService: RequestMessageService,
              private siteService: SitesService,
              private settingsService: SettingsService,
              private userAuthService: UserAuthorizationService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private settingService: SettingsService,
              private orderMethodsService: OrderMethodsService,
              private orderService       : OrdersService,
              private platFormService: PlatformService,
              private dialogRef: MatDialogRef<RequestMessagesComponent>,
              private printingService: PrintingService,
              private paymentsMethodsProcessService: PaymentsMethodsProcessService,
              @Inject(MAT_DIALOG_DATA) public data: any
     )
  {
    console.log('data', data)
    if (data && data.action) {
      if (data.action === 'orderMessages') { 
        console.log('data', data)
        this.orderID = data.order.id;
        this.enableActions = false
        this.actions = data?.action
        return;
      }
    }
    if (data && data.id) { 
      this.orderID = data.order.id;
      this.enableActions = false
      return;
    }
    
    this.enableActions = true
  }

  ngOnInit(): void {
    let user = this.userAuthService?.user
    console.log('on init ', this.actions)
    if (this.actions === 'orderMessages') { 
      const orders$ = this._getOrderMessages()
      this.messages$ = orders$.pipe(switchMap(data => { 
        this.refreshMessages()
        return of(data)
      }))
      return;
    }
    if (!this.user) { this.user  = user  }
    this.initServices()
  }

  ngOnDestroy() {
    this.unSubscribeAll()
  }

  getOrderMessages() {
    this.messages$ = this._getOrderMessages()
  }

  
  _getOrderMessages() {
    const site = this.siteService.getAssignedSite()
    const search = {} as IRequestMessageSearchModel;
    search.orderID = this.orderID;
    console.log(search)
    return this.requestMessageService.getOpenRequestMessagesByOrder(site, search)
  }
    //we have to get these settings.
    //and for the printing if the device here is the same as the uitransactionserver
    //then we can use this as the print server
    //or if this is marked as the print server.
  initServices() {

    const deviceName = localStorage.getItem('devicename')
    if (!deviceName) { return }

    console.log('device exists', this.posDevice)
    if (this.posDevice)  {
      this.initServicesByDevice()
      return ;
    }

    if (!this.posDevice) {
      const site = this.siteService.getAssignedSite()
      this.posDevice$ = this.settingService.getPOSDeviceSettings(site, deviceName).pipe(switchMap(data => {
        if (data) {
          this.posDevice = data;
        }
        return of(data)
      })).pipe(switchMap(data => {
        this.initServicesByDevice()
        return of(data)
      }))
    } else { 
      // console.log('pos Device Init Services 2', this.posDevice)
      this.initServicesByDevice()
    }

  }

  initServicesByDevice() { 
    console.log('initServices')
    this.initUserSubscriber();
    this.getIsPrintServer()
    if (this.orderID) {
      this.refreshOrderMessages()
    }
    this.processQueue();
  }

  exit() {
    this.dialogRef.close();
  }

  toggleArchive(message) {
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.messages$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    ).pipe(switchMap(data => {
      return this.getMessages('toggle archive')
    }))
  }

  addMenuItem(message) {
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.messages$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    ).pipe(switchMap(data => {
      return this.getMessages('add menu item')
    }))
  }

  archiveMessage(message, archiveOverride?: boolean){
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;

    if (archiveOverride) {
      message.archived = archiveOverride;
    }
    this.messages$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    ).pipe(switchMap(data => {
      return this.getMessages('archive')
    }))
  }

  _archiveMessage(message: IRequestMessage, archiveOverride?: boolean){
    const site = this.siteService.getAssignedSite();
    message.archived = true;// !message.archived;
    if (archiveOverride) {
      message.archived = archiveOverride;
    }
    return this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  _openOrderFromItemMessage(event: IRequestMessage) {
    //navigate to order
    if (!event || !event?.method) {return }
    const methods  = event?.method.split('=');

    if (methods[1]) {
      const value = methods[1];
      this.orderMethodsService.setLastOrder()

      // console.log('event', value)
      if (!value) { return };
      const site = this.siteService.getAssignedSite();

      return this.orderMethodsService.getOrderFromItem(+value).pipe(
        switchMap(data => {
            // console.log('data', data)
            this.orderMethodsService.setActiveOrder( data)
            return of(data)
          }
        ),catchError(data => {
          this.siteService.notify(`Error ${data}`, 'close', 2000, 'red')
          return of({} as IPOSOrder)
          }
      )).pipe(switchMap(data => {
        return of({} as IPOSOrder)
      }))
    }

    return of({} as IPOSOrder)
  }

  _openOrderFromOrderMessage(event: IRequestMessage) {
    console.log('event', event)
    if (!event || !event?.method) {return }
    const methods  = event?.method.split('=');
    if (methods[1]) {
      const value =  methods[1] //event.orderID
      this.orderMethodsService.setLastOrder()
      if (!value) { return };
      const site = this.siteService.getAssignedSite();
      return this.orderService.getOrder(site, value.toString(), false).pipe(
        switchMap(data => {
            this.orderMethodsService.setActiveOrder(data)
            return of(data)
          }
        ),catchError(data => {
          this.siteService.notify(`Error ${data}`, 'close', 2000, 'red')
          return of({} as IPOSOrder)
        }
      )).pipe(switchMap(data => {
        return of({} as IPOSOrder)
      }))
    }

    return of({} as IPOSOrder);
  }

  activeEvent(event: IRequestMessage) {
    if (!event) { return  }
    if (!event.type) { return  }
    if (event.type.toLocaleLowerCase()  === "ir") {
      this.router.navigate(['menuitems',{id: event.method}])
    }
    if (event.type.toLocaleLowerCase()  === "csr") {
      //navigate to order
      this.archiveMessage(event)
    }
    if (event.type.toLocaleLowerCase()  === "oc") {
      this.order$ =   this._openOrderFromOrderMessage(event)
    }
    if (event.type.toLocaleLowerCase() === "pc") {
      this.order$ =   this._openOrderFromItemMessage(event)
    }
    if (event.type.toLocaleLowerCase()  === "payment") {
      //navigate to order
      const site = this.siteService.getAssignedSite()
      this.order$ =  this.orderService.getOrder(site, event.method, false).pipe(
        switchMap(data => {
          this.orderMethodsService.setActiveOrder( data)
          this.router.navigate(['pos-payment'])
          return of(data)
        })
      )
      this.archiveMessage(event)
    }

    if (event.type.toLocaleLowerCase()  === "tsr") {
      //navigate to order
      const site = this.siteService.getAssignedSite()
      this.order$ =  this.orderService.getOrder(site, event.method, false).pipe(
        switchMap(data => {
          this.orderMethodsService.setActiveOrder( data)
          return of(data)
        })
      )
      this.archiveMessage(event)
    }

  }

  clearMessage() {
    this.message$ = null;
  }

}
