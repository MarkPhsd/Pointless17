import { Component, Input, OnInit, Output,EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, concatMap, delay, finalize, Observable, of, repeatWhen, Subject, switchMap, take, throwError, timer } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
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
  searchModel: IRequestMessageSearchModel;
  messages$: Observable<IRequestMessage[]>;
  message$: Observable<IRequestResponse>;
  refreshTime: number = 1
  order$: Observable<IPOSOrder>;
  printJobs$ : Observable<IPOSOrder>[];
  action$ : Observable<any>;
  user$: Observable<IUser>;
  printServerDevice: ITerminalSettings;
  printServerDevice$ : Observable<ITerminalSettings>;
  messageRefresh$: Observable<any>;
  initRefresh: boolean;
  private observablesQueue: Observable<any>[] = [];
  private queueSubject = new Subject<Observable<any>>();
  private isProcessing = false;

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
    const messages$ = this.requestMessageService.getOpenRequestMessagesByOrder(site, search);
    this.messages$ = messages$.pipe(switchMap(data => {
      return of(data)
    }))
    this.hideshowMessages = true;
  }

  refreshMessagingService(user) {
    return  this._refreshMessagingService(user)
  }

  // _refreshMessagingService(user) {
  //   let retryDelay = 1000; // 30 seconds
  //   if (!user) { return }
  //   retryDelay = 6000 * 1 //this.refreshTime;
  //   if (user?.id) {
  //     this.messageRefresh$ = this.getMessages().pipe(
  //       catchError(err => {
  //         console.error('Error fetching order, will retry in 30 seconds', err);
  //         // Use timer to delay the retry
  //         return timer(retryDelay);
  //       }),
  //       switchMap(() => this.getMessages()),
  //       // Repeat this process indefinitely
  //       repeatWhen(completed => completed.pipe(delay(retryDelay)))
  //     );
  //   }
  // }

  // _refreshMessagingService(user) {
  //   let retryDelay = 6000; // Assuming 6 seconds as the base retry delay
  //   if (!user) { return; }

  //   this.messageRefresh$ = this.getMessages('message A').pipe(
  //     catchError(err => {
  //       // console.error('Error fetching messages, will retry in 30 seconds', err);
  //       // Use timer to delay the retry
  //       return timer(retryDelay);
  //     }),
  //     switchMap(() => this.getMessages('message B ')),
  //     // Repeat this process indefinitely, with a conditional delay based on the queue state
  //     repeatWhen(completed => completed.pipe(
  //       delay(retryDelay),
  //       switchMap(() => {
  //         // Check if the process queue is active by examining `isProcessing`
  //         if (this.isProcessing) {
  //           // If the queue is active, you might want to introduce an additional delay
  //           // or handle it differently. Adjust this part as needed.
  //           const additionalDelay = 5000; // Example: Add an extra 30 seconds delay
  //           return timer(additionalDelay);
  //         } else {
  //           // If the queue is not active, proceed without additional delay
  //           return of(null);
  //         }
  //       })
  //     ))
  //   );
  // }

  _refreshMessagingService(user): void {
    if (!user) return;

    let retryDelay = 6000; // Base retry delay

    this.messageRefresh$ = this.getMessages().pipe(
      catchError(err => {
        console.error('Error fetching messages, will retry after delay', err);
        // Return an observable that emits once (like a placeholder) to trigger the repeat mechanism
        return of(null);
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
      console.log('no check')
      return of(null)
    }

    return messages$.pipe(
      concatMap(data => {
        console.log('process get messages', message, data)
        this.processMessages(data)
        this.emitCount.emit(data?.length)
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

  processMessages(list:IRequestMessage[]): Observable<IRequestMessage[]> {
    // copy the messages

    if (!list) { return of(null)}

    let messages = [... list];
    //filter out the
    const filteredMessages = messages.filter(data => !data.archived && data.subject === 'Printing');

    this.collectPrintOrders(filteredMessages)

    const resultList = list.filter(data => {
      if (!data.archived && data.subject != 'Printing') {
        return data
      }
    })

    return of(resultList)
  }

  get isPrintServer() {
    let isDevice = false
    if (!this.platFormService.isAppElectron) { return isDevice }
    if (!this.uiTransaction?.printServerDevice) { return isDevice}

    if (this.posDevice && (this.posDevice?.name === this.uiTransaction?.printServerDevice)) {
      this.printServerDevice = this.posDevice
    }
    if (this.printServerDevice && this.printServerDevice.printServerEnable) {

      if (this.initRefresh) {
        this.setPrintServer(this.printServerDevice)
        this.initRefresh = true
      }
      return true
    }

    const site = this.siteService.getAssignedSite()
    this.printServerDevice$ = this.settingsService.getPOSDeviceSettings(site, this.uiTransaction.printServerDevice).pipe(
      switchMap(data =>
      {
        isDevice =  this.setPrintServer(data)
        return of(data)
      }
    ))

    return isDevice
  }

  setPrintServer(data: ITerminalSettings) {
    if (data?.printServerEnable) {
      if (data?.printServerTime != 0) {
        this.refreshTime = +data?.printServerTime
        this._refreshMessagingService(this.user)
        return true
      }
    }
    return false
  }
  //depending on the type of job it is. we need to create an observable for each print job.

  collectPrintOrders(printMessages: IRequestMessage[]) {

    if (!this.uiTransaction.printServerDevice) { return }
    // console.log('collectPrintOrders', printMessages)
    const site = this.siteService.getAssignedSite()
    let printJobs$ : Observable<any>[]
    const cancelUpdate = true
    printMessages.forEach((data, index) => {
      if (data.method === 'printPrep') {
        const order$ = this.orderService.getOrder(site, data.orderID.toString(),false).pipe(concatMap(order => {
            return this.paymentsMethodsProcessService.sendToPrep(order, true, this.uiTransaction, cancelUpdate  )
          })).pipe(concatMap(order =>  {
            return this._archiveMessage(data)
          }))
        this.addObservable(order$)
      }
      // //need to fix this.
      // if (data.method === 'printPaymentReceipt') {
      //   const order$ = this.orderService.getOrder(site, data.orderID.toString(),false).pipe(switchMap(data => {
      //      return this.paymentsMethodsProcessService.sendToPrep(data, true, this.uiTransaction  )
      //     })).pipe(switchMap(data =>  {
      //       return this._archiveMessage(data)
      //     }))
      //   this.addObservable(order$)
      // }
      if (data.method === 'printReceipt') {
        if (!this.isStaff && !this.posDevice) { return }
        const order$ = this.orderService.getOrder(site, data.orderID.toString(),false).pipe(concatMap(data => {
           console.log('print receipt', index)
           this.printingService.printOrder = data;
           this.printingService.previewReceipt(true, data);
           return of(data)
        })).pipe(concatMap(order =>  {
          return this._archiveMessage(data)
        }))
        this.addObservable(order$)
      }
      // if (data.method === 'rePrintPrep') {
      //   const order$ = this.orderService.getOrder(site, data.orderID.toString(), false).pipe(switchMap(data => {
      //      return this.paymentsMethodsProcessService.sendToPrep(data, false, this.uiTransaction  )
      //     })).pipe(switchMap(data =>  {
      //       return this._archiveMessage(data)
      //     }))
      //   this.addObservable(order$)
      // }
    });
    printMessages = []
    // this.printJobs$ = printJobs$;
  }

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
    this.user$ =  this.authenticationService.user$.pipe(
      switchMap(data => {
        this.messages$ = null;
        this.isPrintServer
        return of(data)
    }))
  }

  //list out messages.
  constructor(private requestMessageService: RequestMessageService,
              private siteService: SitesService,
              private settingsService: SettingsService,
              private userAuthService: UserAuthorizationService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private orderMethodsService: OrderMethodsService,
              private orderService       : OrdersService,
              private platFormService: PlatformService,
              private dialogRef: MatDialogRef<RequestMessagesComponent>,
              private printingService: PrintingService,
              private paymentsMethodsProcessService: PaymentsMethodsProcessService,
              @Inject(MAT_DIALOG_DATA) public data: any
     )
  {

    if (data && data.id) {
      this.orderID = data.id;
      this.enableActions = false
      return;
    }
    this.enableActions = true
  }

  ngOnInit(): void {
    let user = this.userAuthService.user
    if (this.user) { user = this.user; }
    // get only order messages;

    this.initUserSubscriber();

    if (this.orderID) {
      this.refreshOrderMessages()
      return;
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

  archiveMessage(message){
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.messages$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    ).pipe(switchMap(data => {
      return this.getMessages('archive')
    }))
  }

  _archiveMessage(message){
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    return this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  _openOrderFromItemMessage(event: IRequestMessage) {
    //navigate to order
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

    // console.log('event', event?.type, event)
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
