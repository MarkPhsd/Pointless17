import { Component, OnInit, Input, HostListener,OnDestroy, Output ,EventEmitter} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';


@Component({
  selector: 'app-order-prep',
  templateUrl: './order-prep.component.html',
  styleUrls: ['./order-prep.component.scss']
})

export class OrderPrepComponent implements OnInit,OnDestroy {

  @Output() outPutSetVisibility  = new EventEmitter<any>();
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

  viewType: number;
  _viewType: Subscription;
  prepScreen: boolean;

  initStatusSubscriber() {
    this._prepStatus = this.orderService.prepStatus$.subscribe( data => {
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.orderService.printerLocation$.subscribe( data => {
      if (data) {
        this.printLocation = data;
      }
    })
  }

  initViewType() {
    this._viewType = this.orderService.viewOrderType$.subscribe(data => {
      this.viewType = data;
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

    const printerLocation = this.orderService.printerLocation
    if (this.order) {
      if(!this.order.total) {  this.order.total = 0      }
      if(!this.order.itemCount) { this.order.itemCount = 0     }
      this.minutesOpen = this.getMinutesOpen(this.order)
      if (!this.order || !this.order.id) { return }
      this.orderService.getOrder(this.site , this.order.id.toString(), false).subscribe( data => {
        this.order = data
        const items = data.posOrderItems
        let count = 0;
        data.posOrderItems = items.filter(item => {
            let display = false;
            let printLocation = false;

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

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroySubscriptions()
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
    if (this.order && this.printLocation && this.printLocation != 0)
    this.orderMethodsService.setItemsAsPrepped(this.order.id, this.printLocation)
  }

  openOrder() {
    if (this.order) {
      //open cart
      //slide card panel from right
      // this.order.serviceType
    }
  }

}
