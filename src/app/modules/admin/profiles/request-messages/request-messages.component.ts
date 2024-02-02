import { Component, Input, OnInit, Output,EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, delay, Observable, of, repeatWhen, switchMap, throwError } from 'rxjs';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { RequestMessageMethodsService } from 'src/app/_services/system/request-message-methods.service';
import { IRequestMessage, IRequestMessageSearchModel, IRequestResponse, RequestMessageService } from 'src/app/_services/system/request-message.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-request-messages',
  templateUrl: './request-messages.component.html',
  styleUrls: ['./request-messages.component.scss']
})
export class RequestMessagesComponent implements OnInit {

  @Input() user: IUser;
  @Output() emitCount = new EventEmitter()
  searchModel: IRequestMessageSearchModel;
  @Input() hideshowMessages: boolean; //hideshowMessages

  @Input() enableActions: boolean;
  @Input() orderID: number;

  // action$: Observable<any>;
  messages$: Observable<IRequestMessage[]>;
  message$: Observable<IRequestResponse>;
  refreshTime = 1
  order$: Observable<IPOSOrder>;


  refreshOrderMessages() {
    console.log("refreshOrderMessages")
    const site     = this.siteService.getAssignedSite();
    const search   = {  }   as IRequestMessageSearchModel;
    search.orderID = this.orderID;
    this.messages$ = this.requestMessageService.getOpenRequestMessagesByOrder(site, search).pipe(switchMap(data => {
      console.log('messages', data)
      return of(data)
    }))
    this.hideshowMessages = true;
  }

  refreshMessagingService(user) {
    this._refreshMessagingService(user)
  }

  _refreshMessagingService(user) {
    if (!user) { return }
    const seconds = 6000 * this.refreshTime;
    const site = this.siteService.getAssignedSite();
    const search = {} as IRequestMessageSearchModel;
    if (user?.id) {
      search.userID = user.id;
      return this.getMessages().pipe(
        repeatWhen(notifications =>
          notifications.pipe(
            delay(seconds * 10)),
        ),
        catchError((err: any) => {
         console.log('error messages', err)
         return of(null)
        })
      )
    }
    return of( [] as IRequestMessage[])
  }

  refreshMessages() {
    console.log("refreshMessages 1" )
    if (this.orderID) {
      this.refreshOrderMessages();
      return
    }
    console.log("refreshMessages 2" )
    this.messages$ = this.getMessages();
  }

  getMessages(): Observable<IRequestMessage[]> {
    const site      = this.siteService.getAssignedSite();
    const search    = {} as IRequestMessageSearchModel;
    search.userID   = this.authenticationService.userValue.id;
    let check: boolean;
    let messages$: Observable<IRequestMessage[]>;

    if (this.user.roles === 'manager' || this.user.roles === 'admin') {
      messages$ = this.getManagerMessages()
      check = true
    }

    if (this.user.roles === 'user') {
      messages$ = this.requestMessageService.getRequestMessagesByCurrentUser(site, search)
      check = true
    }

    if (!check) { return of(null)}

    return messages$.pipe(
      switchMap(data => {
        this.emitCount.emit(data?.length)
        return of(data)
      })
    )
  }

  getManagerMessages(): Observable<IRequestMessage[]> {
    const site      = this.siteService.getAssignedSite();
    const search    = {} as IRequestMessageSearchModel;
    search.archived = false;
    return this.requestMessageService.getOpenRequestMessages(site, search);
  }

  forceRefreshMessage()  {
    this.getMessages()
  }

  initUserSubscriber() {
    if (this.user) {
      return;
    }
    this.authenticationService.user$.subscribe(data => {
      this.messages$ = null;
      this.refreshMessagingService(data)
    })
  }

  //list out messages.
  constructor(private requestMessageService: RequestMessageService,
              private siteService: SitesService,
              private userAuthService: UserAuthorizationService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private orderMethodsService: OrderMethodsService,
              private orderService       : OrdersService,
              private dialogRef: MatDialogRef<RequestMessagesComponent>,
              private requestMessageMehodsService: RequestMessageMethodsService,
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
    if (this.orderID) {
      this.refreshOrderMessages()
      return;
    }

    this.refreshMessagingService(user)
    this.initUserSubscriber()
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
      return this._refreshMessagingService(this.user);
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
      return this._refreshMessagingService(this.user);
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
      return this._refreshMessagingService(this.user);
    }))
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
    //navigate to order
    // console.log('event', event)
    const methods  = event?.method.split('=');
    // console.log('event', methods)

    if (methods[1]) {

      const value =  methods[1] //event.orderID
      this.orderMethodsService.setLastOrder()
//
      // console.log('_openOrderFromOrderMessage', event, value, methods[1]);
      if (!value) { return };

      const site = this.siteService.getAssignedSite();

      return this.orderService.getOrder(site, value.toString(), false).pipe(
        switchMap(data => {
            // console.log('data', data)
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

    console.log('event', event?.type, event)
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
