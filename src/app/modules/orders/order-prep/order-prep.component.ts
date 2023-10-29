import { Component, OnInit, Input, HostListener,OnDestroy, Output ,EventEmitter} from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IServiceType, ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'app-order-prep',
  templateUrl: './order-prep.component.html',
  styleUrls: ['./order-prep.component.scss']
})

export class OrderPrepComponent implements OnInit,OnDestroy {
  action$ : Observable<any>;
  serviceColor: string;
  @Output() outPutSetVisibility  = new EventEmitter<any>();
  @Output() ouPutSetActive  = new EventEmitter<any>();
  @Input() site: ISite;
  @Input() order: IPOSOrder;
  @Input() index: number;
  itemCount: number;

  ordersInvisible = []
  orderItems    : IPOSOrder;
  smallDevice   : boolean;
  minutesOpen   : number;

  printLocation = 0;
  prepStatus    : number;

  _prepStatus   : Subscription;
  _printLocation: Subscription;

  orderItems$    : Observable<IPOSOrder>;
  serviceType$: Observable<IServiceType>;
  viewType: number;
  _viewType: Subscription;
  prepScreen: boolean;

  initStatusSubscriber() {
    this._prepStatus = this.printingService.prepStatus$.subscribe( data => {
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.printingService.printerLocation$.subscribe( data => {
      if (data) {
        this.printLocation = data;
      }
    })
  }

  initViewType() {
    this._viewType = this.orderMethodsService.viewOrderType$.subscribe(data => {
      this.viewType = data;
      this.prepScreen = false;
      if (this.viewType) {
        this.prepScreen = true;
      }
    })
  }

  initSubscriptions(){
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
    this.initViewType();
  }

  destroySubscriptions() {
    if (this._prepStatus) {
      this._prepStatus.unsubscribe()
    }
    if (this._printLocation) {
      this._printLocation.unsubscribe()
    }
    if (this._viewType) {
      this._viewType.unsubscribe()
    }
  }

  constructor(private orderService: OrdersService,
              private printingService: PrintingService,
              private siteService: SitesService,
              private serviceTypeService: ServiceTypeService,
              private orderMethodsService: OrderMethodsService,) {
    this.updateItemsPerPage();
  }

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 768) {
       this.smallDevice = true
     }
   }

  ngOnInit() {
    this.initSubscriptions();
    this.refreshOrder()
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroySubscriptions()
  }

  refreshOrder() {
    const printerLocation = this.printingService.printerLocation
    if (this.order) {
      if(!this.order.total) {  this.order.total = 0      }
      if(!this.order.itemCount) { this.order.itemCount = 0     }
      this.minutesOpen = this.getMinutesOpen(this.order)
      if (!this.order || !this.order.id) { return }

      this.orderService.getOrder(this.site , this.order?.id.toString(), false).subscribe( data => {
        this.order = data
        const items = data.posOrderItems
        let count = 0;
        data.posOrderItems = items.filter(item => {
            let display = false;
            let printLocation = false;

            this.setColor(data.serviceTypeID)

            if (this.prepStatus == 0) {
              if (!item.itemPrepped && !item.printed) {
                display = true;
              }
            }

            if (this.prepStatus == 1) {
              if (!item.itemPrepped && item.printed) {
                display = true;
              }
            }
            if (this.prepStatus == 2) {
              if (item.itemPrepped &&  item.printed) {
                display = true;
              }
            }

            if (printerLocation == item.printLocation )  {
              printLocation = true;
            }

            if (printerLocation == 0) {
              printLocation = true;
            }

            if (printLocation && display) {
              if (item.id == item.idRef) {
                count = item.quantity + count
                this.itemCount = count;
              }
              return item;
            }
          }
        )

        if (data.posOrderItems.length == 0) {
          const item = { index: this.index, count: count}
          this.outPutSetVisibility.emit(item);
        }

        this.orderItems = data;
      })
    }
  }

  setColor(id: number) {
    const site = this.siteService.getAssignedSite()
    if (this.serviceTypeService.list) {
      const item = this.serviceTypeService.list.filter(data => { return data.id == id } )
      if (item) {
        this.serviceColor = `background-color:${item[0].serviceColor};`
      }
    }

    this.serviceType$ = this.serviceTypeService.getType(site, id).pipe(switchMap(data => {
      this.serviceColor = `background-color:${data.serviceColor};`
      return of(data)
    }))
  }

  getMinutesOpen(order) : number {
    if (this.order.orderDate) {
      if (this.order.completionDate) {
        return this.getMinutesBetweenTimes(this.order.orderDate, this.order.completionDate)
      }
      const dateTime = new Date()
      return this.getMinutesBetweenTimes(this.order.orderDate, dateTime.toString())
    }
    return 0
  }

  getMinutesBetweenTimes(timeOne, timeTwo) : number {
    if (!timeOne || !timeTwo) { return 0}
    const startTime = new Date(timeOne)
    const endTime = new Date(timeTwo)
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor((diff/1000)/60);
    if (isNaN(minutes)) { return 0}
    return minutes
  }

  setItemsAsPrepped() {
    // console.log('set items as prepped', this.printLocation)
    if (!this.printLocation || this.printLocation == 0) {
      this.siteService.notify('Please first selct a print location.', 'close', 4000, 'red')
      return;
    }
    if (this.order && this.printLocation && this.printLocation != 0) {
      // console.log('set items as prepped')
      const order$ =  this.orderMethodsService.setItemsAsPrepped(this.order.id, this.printLocation);
      order$.subscribe( order => {
        if (order) {
          this.refreshOrder();
          this.orderMethodsService.updateOrderSubscription(order);
        }
      })
    }
  }

  openInNew() {
    this.setActiveOrderObs(this.order)
  }

  printOrder() {
    this.orderMethodsService.updateOrderSubscription(this.order)
    this.printingService.previewReceipt()
  }

  openOrder() {
    if (this.order) {
      this.ouPutSetActive.emit(this.order)
    }
  }

  setActiveOrderObs(order) {
    const site  = this.siteService.getAssignedSite();
    const order$ =  this.orderService.getOrder(site, order.id, order.history )
    this.action$ =  order$.pipe(switchMap(data =>
      {
        if (data) {
          // this.orderOutPut.emit(data)
          this.orderMethodsService.setActiveOrder(site, data)
        }
        return of(data)
      }
    ))
  }

}
