import {Component, HostListener, OnInit, OnDestroy,
  ViewChild, ElementRef, QueryList, ViewChildren, Input}  from '@angular/core';
import { IPOSOrder,IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute} from '@angular/router';
import { Observable, Subscription} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
// import { share } from 'rxjs/operators';

@Component({
  selector: 'app-order-panel',
  templateUrl: './order-panel.component.html',
  styleUrls: ['./order-panel.component.scss']
})
export class OrderPanelComponent implements OnInit {

  @Input() order : IPOSOrder;
  smallDevice : boolean;
  minutesOpen: number;

  constructor() {
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
    if (this.order) {
      if(!this.order.total) {
        this.order.total = 0
      }
      if(!this.order.itemCount) {
        this.order.itemCount = 0
      }

      this.minutesOpen = this.getMinutesOpen(this.order)
    }

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
