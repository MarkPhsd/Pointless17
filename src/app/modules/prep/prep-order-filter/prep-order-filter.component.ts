import { Component, OnInit } from '@angular/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PrepOrdersService } from 'src/app/_services/transactions/prep-orders.service';

@Component({
  selector: 'app-prep-order-filter',
  templateUrl: './prep-order-filter.component.html',
  styleUrls: ['./prep-order-filter.component.scss']
})
export class PrepOrderFilterComponent implements OnInit {

  showScheduleDates: boolean;//inject transactionUI
  constructor(private orderMethodsService: OrderMethodsService,
              private prepOrdersService: PrepOrdersService) { }

  ngOnInit(): void {
    const i = 0
  }

}
