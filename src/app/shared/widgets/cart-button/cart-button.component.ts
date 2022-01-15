import { Component, OnInit, Output,OnDestroy, EventEmitter, HostBinding, Renderer2, HostListener } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { CompanyService,AuthenticationService, OrdersService, MenuService, MessageService} from 'src/app/_services';
import { catchError, delay, delayWhen, finalize, first, map, repeatWhen, retryWhen, tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, throwError, timer } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss']
})
export class CartButtonComponent implements OnInit, OnDestroy {

  @Output() toggleOpenOrderBarForMe: EventEmitter<any> = new EventEmitter();
  id:           number

  refreshCurrentOrderCheck:  boolean; //checks if there is an order to refresh from the assigned POSName.
  orderItemCount      = null;
  openOrderBar        = false;
  timerID             : any;

  _orderBar           : Subscription;
  orderBar            : boolean;

  _order              : Subscription;
  order               : IPOSOrder;

  _order$             : Observable<IPOSOrder>;
  order$              : Subject<Observable<IPOSOrder>> = new Subject();

  constructor(
    private siteService:            SitesService,
    public orderService:            OrdersService,
    private toolbarServiceUI:       ToolBarUIService,
    ) {
   }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initOrderBarSubscription();
    this.assignCurrentOrder();
    this.refreshOrderCheck();
  }

  ngOnDestroy() {
    this._order.unsubscribe();
    this.refreshCurrentOrderCheck = false
    this.openOrderBar             = false
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

 async addNewOrder() {
    this.orderService.updateOrderSubscription(null);
    const site = this.siteService.getAssignedSite();
    await this.orderService.newDefaultOrder(site);
  }

  initOrderBarSubscription() {
    this.toolbarServiceUI.orderBar$.subscribe(data => {
      this.openOrderBar = data
    })
  }

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      if (data && data.id) {
        this.order = data
      }
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
        // this.toggleOpenOrderBar();
      }
    }

  }

  refreshAssignedPOSOrder() {
    this._order$  =  this.orderService.getCurrentPOSOrder(this.siteService.getAssignedSite() ,this.orderService.posName )
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

  async toggleOpenOrderBar() {
    // console.log('original this.openOrderBar', this.openOrderBar)
    // this.toolbarServiceUI.orderBar$.subscribe(data => {
    //     if (data) {
    //       console.log(this.openOrderBar, data)
    //     } else {
    //       this.openOrderBar = data
    //       console.log(this.openOrderBar, data)
    //     }
    //   }
    // )

    this.openOrderBar = !this.openOrderBar
    this.toolbarServiceUI.updateOrderBar(this.openOrderBar)
  }

  resizeWindow() {
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

}
