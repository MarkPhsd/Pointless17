import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector   : 'pos-order-schedule',
  templateUrl: './posorder-schedule.component.html',
  styleUrls  : ['./posorder-schedule.component.scss']
})
export class POSOrderScheduleComponent implements OnInit,OnDestroy {
  inputForm   : FormGroup;
  order                : IPOSOrder;
  _order               : Subscription;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    private sitesService      : SitesService,
    private platFormService   : PlatformService,
    private serviceTypeService: ServiceTypeService,
    private fb :                FormBuilder ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) {
      this._order.unsubscribe()
    }
  }
  initForm() {
    if (this.order && this.order.clients_POSOrders) {
      const client = this.order.clients_POSOrders;
      this.fb.group({
        address  :[client.address],
        city     :[],
        address2 :[client.city],
        state    :[client.state],
        zip      :[client.zip],
      })
      return
    }
    this.fb.group({
      address  :[''],
      city     :[''],
      address2 :[''],
      state    :[''],
      zip      :[''],
    })
  }

}
