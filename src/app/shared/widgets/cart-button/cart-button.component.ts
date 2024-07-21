import { Component, OnInit, Output,OnDestroy, EventEmitter, HostListener, Input  } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { AuthenticationService, IDeviceInfo, OrdersService} from 'src/app/_services';
import { catchError, delay, delayWhen, finalize,  repeatWhen, retryWhen, switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subject , Subscription, throwError, timer } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { IServiceType, IUser } from 'src/app/_interfaces';
import { Router } from '@angular/router';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';

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

  isStaff : boolean = false;
  isUser  : boolean = false

  user$               : Observable<any>;
  _user               : Subscription;
  user                : IUser;

  gridflow            = 'grid-flow';
  @Input() hideAddNewOrder     = false
  posDevice           : ITerminalSettings
  _posDevice          : Subscription;
  href                : string;
  deviceInfo          : IDeviceInfo;

  quickServiceTypes$: Observable<IServiceType[]>;
  quickServiceTypes: IServiceType[];


  initSubscriptions() {

    const site = this.siteService.getAssignedSite();
    // this.orderMethodsService.updateOrderSubscription(this.order);

    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      if (data && data.id) {
        this.order = data
        return
      }
      this.order = null;
    })

    this.user$ = this.authenticationService.user$.pipe(
      switchMap(user => {
      this.user = user;
      this.isStaff = false;
      this.isUser = false;

      if (!user) {
        const stored = JSON.parse(localStorage.getItem('user')) as IUser;
        if (stored) {
          this.user = stored;
          user = stored;
        }
      }
      if (user) {
        if (user?.roles == 'admin' || user?.roles == 'manager' || user?.roles == 'employee') {
          this.isStaff      = true
        }
        if (user?.roles == 'user' || user?.roles == 'guest') {
          this.isUser = true;
        }
      }
      return this.serviceTypeService.getSaleTypes(site)
    })).pipe(switchMap(data => {
      this.quickServiceTypes = null;
      if (data) {
        if (this.user?.roles == 'admin' || this.user?.roles == 'manager') {
          this.quickServiceTypes = data.filter(data => {
            return data.headerOrder
          })
        }
        if (this.user?.roles == 'employee') {
          this.quickServiceTypes = data.filter(data => {
            return data.headerOrder && (data.filterType == 0 || !data.filterType)
          })
        }
      }
      return of(data)
    }))

    this._posDevice = this.uiSettings.posDevice$.subscribe(data => {
       this.posDevice = data;
    })
  }

  constructor(
    private siteService:            SitesService,
    public  orderService:            OrdersService,
    private authenticationService : AuthenticationService,
    private toolbarServiceUI:       ToolBarUIService,
    private router                : Router,
    private serviceTypeService: ServiceTypeService,
    private userSwitchingService: UserSwitchingService,
    public  platFormService: PlatformService,
    private uiSettings: UISettingsService,
    public  orderMethodsService: OrderMethodsService,
    private paymentMethodsService: PaymentsMethodsProcessService,
    public  paymentMethodsProcess: PaymentsMethodsProcessService,
    ) {
   }

  ngOnInit(): void {
    this.href = this.router.url
    this.initOrderBarSubscription();
    this.assignCurrentOrder();
    this.refreshOrderCheck();
    this.initUI();
    this.deviceInfo = this.authenticationService.deviceInfo;
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.order                    = null;
    this.refreshCurrentOrderCheck = false
    this.openOrderBar             = false
    this.order                    = null
    if (this._posDevice) {this._posDevice.unsubscribe()}
    if (this._order){
      this._order.unsubscribe()
    }
    if (this._orderBar) {
      this._orderBar.unsubscribe()
    }
    if (this.id) {
      clearInterval(this.id);
    }
    if (this.timerID) {
      clearInterval(this.timerID);
    }
  }

  @HostListener("window:resize", [])
  initUI() {

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
    const order = localStorage.getItem('orderSubscription')
    let defaultOrderTypeID = 0

    if (order && order != null) {
      this.paymentMethodsService.sendOrderProcessLockMethod(this.orderMethodsService.currentOrder)
    }
   
    let categoryID = 0
 
    if (this.posDevice) {
      if (this.posDevice?.defaultOrderTypeID  && this.posDevice?.defaultOrderTypeID != 0) {
        const serviceType$ = this.serviceTypeService.getType(site, this.posDevice.defaultOrderTypeID)
        this.actionOrder$ = serviceType$.pipe(switchMap(data => {
            return of(data)
        })).pipe(switchMap(data => {
            const order$ = this.addNewOrderByType(data)
            return order$
        }))
        return ;
      }
    }

    this.actionOrder$  = this.addNewOrderByType(null)
  }

  addNewOrderByType(serviceType) {
    const site = this.siteService.getAssignedSite();
    return this.paymentMethodsProcess.newOrderWithPayloadMethod(site, serviceType)
  }

  setOrderType(serviceType) {
    this.actionOrder$  = this.addNewOrderByType(serviceType)
  }

  initOrderBarSubscription() {
    this.toolbarServiceUI.orderBar$.subscribe(data => {
      this.openOrderBar = data
    })
  }

  isPosNameDefined(): boolean {
    const posName = localStorage.getItem('devicename')
    if (posName != '' && posName != undefined  && posName != null)
    {return true}
  }

  assignCurrentOrder() {
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
              this.order$.next(this.orderMethodsService.currentOrder$)
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
    const posName = localStorage.getItem('devicename')

    if (!posName) { return }

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
      const posName = localStorage.getItem('devicename')
      this._order$  =  this.orderService.getCurrentPOSOrder(site ,posName )
        .pipe(repeatWhen(notifications => notifications.pipe(
           delay(1500)),
        ),finalize(() => {
          // console.log('finalized')
        }),catchError(err => {
          console.log(err);
          return throwError(err);
        })
      )
    }
  }

  refreshOrderCheck() {
    try {
      if (!this.refreshCurrentOrderCheck) {
        this.timerID = setInterval(
          () =>  this.refreshOrder(),
          2000
        );
      }
    } catch (error) {
    }
  }


  refreshOrder() {
    if (!this.refreshCurrentOrderCheck) {  this.assignCurrentOrder() }
  }

  toggleOpenOrderBar() {

    if (this.router.url.substring(0, 28 ) === '/currentorder;mainPanel=true') {
      // console.log('order bar setting false')
      this.openOrderBar = false
      this.toolbarServiceUI.updateOrderBar(this.openOrderBar)
      return;
    }

    if (this.openOrderBar == undefined) {   this.openOrderBar = false;  }

    if (this.userSwitchingService.swapMenuWithOrderBoolean) {
      // console.log('order bar setting swapMenuWithOrderBoolean true')
      this.openOrderBar = !this.openOrderBar
      const item = this.openOrderBar
      this.toolbarServiceUI.updateOrderBar(item)
      this.toolbarServiceUI.updateToolBarSideBar(item)
      return
    }

    if (!this.userSwitchingService.swapMenuWithOrderBoolean) {
      // console.log('order bar setting false, swapMenuWithOrderBoolean false')
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
