import { Component, OnInit, Input, HostListener } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';

// https://www.freecodecamp.org/news/everything-you-need-to-know-about-ng-template-ng-content-ng-container-and-ngtemplateoutlet-4b7b51223691/

@Component({
  selector: 'app-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss']
})
export class OrderCardComponent implements OnInit {

  phoneDevice: boolean;
  @Input() order : IPOSOrder;
  smallDevice : boolean;
  minutesOpen: number;

  constructor() {
    this.updateItemsPerPage();
   }

  @HostListener("window:resize", [])
   updateItemsPerPage() {
     this.smallDevice = false
     if (window.innerWidth < 811) {
       this.smallDevice = true
     }
     if (window.innerWidth < 599) {
       this.phoneDevice = true
     }
   }

  ngOnInit() {
    if (this.order) {
      if(!this.order.total) {
        this.order.total = 0
      }
      if(!this.order.itemCount) {
        this.order.itemCount = 0
      }
      this.minutesOpen = this.getMinutesOpen(this.order)
    }
    // console.log('order?.clients_POSOrders?', this.order?.clients_POSOrders  )

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
