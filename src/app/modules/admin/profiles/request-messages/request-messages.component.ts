import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ok } from 'assert';
import { RoundPipe } from 'ngx-pipes';
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

  messages$: Observable<IRequestMessage[]>;
  message$: Observable<IRequestResponse>;
  refreshTime = 1
  order$: Observable<IPOSOrder>;

  refreshMessagingService(user) {
    if (!user) { return }
    const seconds = 6000 * this.refreshTime;
    const site = this.siteService.getAssignedSite();
    const search = {} as IRequestMessageSearchModel;
    if (user?.id) {
      // console.log('refreshing user')
      search.userID = user.id;
      this.messages$  = this.getMessages().pipe(
        repeatWhen(notifications =>
          notifications.pipe(
            delay(seconds * 10)),
        ),
        catchError((err: any) => {
          return throwError(err);
        })
      )
    }
  }

  getMessages(): Observable<IRequestMessage[]> {
    const site      = this.siteService.getAssignedSite();
    const search    = {} as IRequestMessageSearchModel;
    search.userID   = this.authenticationService.userValue.id;
    return this.requestMessageService.getRequestMessagesByCurrentUser(site, search).pipe(
      switchMap(data => {
        this.emitCount.emit(data.length)
        return of(data)
      })
    )
  }

  forceRefreshMessage()  {
    this.refreshMessagingService(this.authenticationService.userValue)
    // this.messages$ = this.getMessages()
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
              private requestMessageMehodsService: RequestMessageMethodsService) { }

  ngOnInit(): void {
    let user = this.userAuthService.user
    if (this.user) {
      user = this.user;
    }
    this.refreshMessagingService(user)
    this.initUserSubscriber()
  }

  toggleArchive(message) {
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.message$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        // this.forceRefreshMessage();
        return of(data)
      })
    )
  }

  addMenuItem(message) {
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.message$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  archiveMessage(message){
    const site = this.siteService.getAssignedSite();
    message.archived = !message.archived;
    this.message$ = this.requestMessageService.saveMessage(site, message).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  activeEvent(event: IRequestMessage) {
    if (!event) { return  }
    if (!event.type) { return  }

    if (event.type === "IR") {
      this.router.navigate(['menuitems',{id: event.method}])
    }

    if (event.type === "CSR") {
      //navigate to order
      this.archiveMessage(event)
    }

    if (event.type === "payment") {
      //navigate to order
      const site = this.siteService.getAssignedSite()
      this.order$ =  this.orderService.getOrder(site, event.method, false).pipe(
        switchMap(data => {
          this.orderMethodsService.setActiveOrder(site, data)
          this.router.navigate(['pos-payment'])
          return of(data)
        })
      )
      this.archiveMessage(event)
    }

    if (event.type === "TSR") {
      //navigate to order
      const site = this.siteService.getAssignedSite()
      this.order$ =  this.orderService.getOrder(site, event.method, false).pipe(
        switchMap(data => {
          this.orderMethodsService.setActiveOrder(site, data)
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
