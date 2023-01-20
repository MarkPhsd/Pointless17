import { Component, OnInit, Output,OnDestroy, EventEmitter, HostListener, Input  } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { AuthenticationService, OrdersService} from 'src/app/_services';
import { catchError, delay, delayWhen, finalize,  repeatWhen, retryWhen, switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subject , Subscription, throwError, timer } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { IUser } from 'src/app/_interfaces';
import { Router } from '@angular/router';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss']
})
export class CartButtonComponent implements OnInit, OnDestroy {

  @Output() toggleOpenOrderBarForMe: EventEmitter<any> = new EventEmitter();
  id:           number
  @Input() smallDevice: boolean;
  refreshCurrentOrderCheck:  boolean; //checks if there is an order to refresh from the assigned POSName.
  orderItemCount      = null;
  openOrderBar        = false;
  timerID             : any;

  _orderBar           : Subscription;
  orderBar            : boolean;

  _order              : Subscription;
  order               : IPOSOrder;

  actionOrder$        : Observable<any>;
  _order$             : Observable<IPOSOrder>;
  order$              : Subject<Observable<IPOSOrder>> = new Subject();

  isUserStaff          : boolean;

  user$               : Observable<IUser>;
  _user               : Subscription;
  user                : IUser;

  gridflow            = 'grid-flow';
  @Input() hideAddNewOrder     = false

  href: string;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      if (data && data.id) {
        this.order = data
        return
      }
      this.order = null;
    })

    this._user = this.authenticationService.user$.subscribe(user => {
      this.user = user;
      this.isUserStaff = false;
      if (user) {
        if (user.roles == 'admin' || user.roles == 'manager' || user.roles == 'employee') {
          this.isUserStaff      = true
        }
      }
    })
  }

  constructor(
    private siteService:            SitesService,
    public orderService:            OrdersService,
    private authenticationService : AuthenticationService,
    private toolbarServiceUI:       ToolBarUIService,
    private router                : Router,
    private userSwitchingService: UserSwitchingService,
    ) {
   }

  ngOnInit(): void {
    this.href = this.router.url
    this.initSubscriptions();
    this.initOrderBarSubscription();
    this.assignCurrentOrder();
    this.refreshOrderCheck();
    this.updateItemsPerPage();
  }

  ngOnDestroy() {
    this.order                    = null;
    this.refreshCurrentOrderCheck = false
    this.openOrderBar             = false
    this.order                    = null

    if (this._order){
      this._order.unsubscribe()
    }
    if (this._orderBar) {
      this._orderBar.unsubscribe()
    }
    if (this.id) {
      clearInterval(this.id);
    }
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {

    this.smallDevice = false
    if (window.innerWidth >= 1200) {

    } else if (window.innerWidth >= 992) {

    } else if (window.innerWidth  >= 768) {

    } else if (window.innerWidth < 768) {
      this.smallDevice = true
    }

    if (!this.smallDevice) {
      this.gridflow = "grid-flow"
    }
    if (this.smallDevice) {
      this.gridflow = "grid-flow-small"
    }
  }

  addNewOrder() {
    const site = this.siteService.getAssignedSite();
     this.actionOrder$ = this.orderService.newOrderWithPayloadMethod(site, null).pipe(
      switchMap(data => {
        this.orderService.processOrderResult(data, site)
        return of(data)
      })
    )
  }

  initOrderBarSubscription() {
    this.toolbarServiceUI.orderBar$.subscribe(data => {
      this.openOrderBar = data
    })
  }

  isPosNameDefined(): boolean {
    if (this.orderService.posName != '' && this.orderService.posName != undefined  && this.orderService.posName != null)
    {return true}
  }

  async assignCurrentOrder() {
    let cartEnabled = false
    if (this.isPosNameDefined()) { cartEnabled = true }
    if (this.order)              { cartEnabled = true}
    if ( cartEnabled ) {
      this.refreshCurrentOrderCheck = true
      if (this.isPosNameDefined()) {
        this.refreshAssignedPOSOrder();
        this.order$.next(this._order$)
        this.order$.subscribe( data => {
          data.subscribe(data => {
            if (data && data.id) {
              this.order = data
              this.order$.next(this.orderService.currentOrder$)
              this.toolbarServiceUI.updateOrderBar(true)
            }
          })
        })
      }
    }

    if (this.isPosNameDefined()) {
      if ( this.openOrderBar) {
      }
    }
  }

  refreshAssignedPOSOrder() {

    const user = this.authenticationService.userValue
    if (!user) { return }

    const site   = this.siteService.getAssignedSite()
    const posName = this.orderService.posName
    this._order$  =  this.orderService.getCurrentPOSOrder(site, posName )
      .pipe(
        repeatWhen(notifications =>
          notifications.pipe(delay(1500)),
      ),
      catchError((err: any) => {
        this.refreshCurrentOrderCheck = false
        this.refreshOrderCheck()
        this.order$.subscribe().unsubscribe();
        return throwError(err);
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(`Value ${val} was too high!`)),
          //restart in 6 seconds
          delayWhen(val => timer(val * 1000))
        )
      )
    )
  }

  processOrder() {
    const site = this.siteService.getAssignedSite()
    if (this.isPosNameDefined()) {
      this._order$  =  this.orderService.getCurrentPOSOrder(site ,this.orderService.posName )
        .pipe(repeatWhen(notifications => notifications.pipe(
           delay(1500)),
        ),finalize(() => {
          console.log('finalized')
        }),catchError(err => {
          console.log(err);
          return throwError(err);
        })
      )
    }
  }

  refreshOrderCheck() {
    if (!this.refreshCurrentOrderCheck) {
      this.timerID = setInterval(
        () =>
        this.refreshOrder(),
        2000
      );
    }
  }


  refreshOrder() {
    if (!this.refreshCurrentOrderCheck) {  this.assignCurrentOrder() }
  }

  toggleOpenOrderBar() {
    if (this.router.url.substring(0, 28 ) === '/currentorder;mainPanel=true') {
      console.log('order bar setting false')
      this.openOrderBar = false
      this.toolbarServiceUI.updateOrderBar(this.openOrderBar)
      return;
    }

    if (this.userSwitchingService.swapMenuWithOrderBoolean) {
      this.openOrderBar = !this.openOrderBar
      const item = this.openOrderBar 
      this.toolbarServiceUI.updateOrderBar(item)
      this.toolbarServiceUI.updateToolBarSideBar(item)
      return
    }

    if (!this.userSwitchingService.swapMenuWithOrderBoolean) {
      this.openOrderBar = !this.openOrderBar
      this.toolbarServiceUI.updateOrderBar(this.openOrderBar)
      return;
    }

  }


  updateleftSideBarToggle(value: boolean) {
    this.toolbarServiceUI.updateleftSideBarToggle(value)
  }

  resizeWindow() {
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

}
