import { CommonModule } from '@angular/common';
import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPOSOrder} from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'posorder-schedule-card',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './posorder-schedule-card.component.html',
  styleUrls: ['./posorder-schedule-card.component.scss']
})
export class POSOrderScheduleCardComponent implements OnInit, OnDestroy {

  order                : IPOSOrder;
  _order               : Subscription;
  @Input() isStaff: boolean;

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    public  orderMethodsService: OrderMethodsService,
    private router:            Router,
    private dateService      : DateHelperService,
    public authenticationService: AuthenticationService,
   ) { }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  getOrderSchedule(order: IPOSOrder) {
    if (!order ||  !order.preferredScheduleDate) {
      return null
    }

    // console.log()
    try {
      return `Scheduled  ${this.dateService.format(order?.preferredScheduleDate, 'medium')}`
    } catch (error) {
    }

  }

  schedule() {
    this.router.navigate(['pos-order-schedule'])
  }

}
