import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'posorder-schedule-card',
  templateUrl: './posorder-schedule-card.component.html',
  styleUrls: ['./posorder-schedule-card.component.scss']
})
export class POSOrderScheduleCardComponent implements OnInit, OnDestroy {

  order                : IPOSOrder;
  _order               : Subscription;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
    
  }

  constructor(
    private orderService      : OrdersService,
    private router:            Router,
   ) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  schedule() {
    this.router.navigate(['pos-order-schedule'])
  }

}
