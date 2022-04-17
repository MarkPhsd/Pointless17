import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';

@Component({
  selector: 'app-order-prep',
  templateUrl: './order-prep.component.html',
  styleUrls: ['./order-prep.component.scss']
})
export class OrderPrepComponent implements OnInit {

  @Input() site: ISite;
  @Input() order: IPOSOrder;
  smallDevice   : boolean;
  minutesOpen   : number;

  printLocation = 0;
  prepStatus    : boolean;

  _prepStatus   : Subscription;
  _printLocation: Subscription;

  orderItems$    : Observable<IPOSOrder>;

  initStatusSubscriber() { 
    this._prepStatus = this.orderService.printStatus$.subscribe( data => { 
      if (!data) { 
        this.prepStatus = false
      }
      this.prepStatus = data;
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.orderService.printerLocation$.subscribe( data => { 
      if (!data) { 
        this.printLocation = 0
      }
      this.printLocation = data;
    })
  }

  initSubscriptions(){ 
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
  }

  destroySubscriptions() {
    if (this._prepStatus) { 
      this._prepStatus.unsubscribe()
    }
    if (this._printLocation) { 
      this._printLocation.unsubscribe()
    }
  }

  constructor(private orderService: OrdersService,) {
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
    console.log('items')
    if (this.order) {
      if(!this.order.total) {  this.order.total = 0      }
      if(!this.order.itemCount) { this.order.itemCount = 0     }
      this.minutesOpen = this.getMinutesOpen(this.order)
      this.orderItems$ = this.orderService.getOrder(this.site , this.order.id.toString(), false)
    }
    // this.orderService.updatePrintStatus(false);
    // this.orderService.updateOrderPrinterLocation(0)
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

  openOrder() {
    if (this.order) {
      //open cart
      //slide card panel from right
      // this.order.serviceType
    }
  }

}
