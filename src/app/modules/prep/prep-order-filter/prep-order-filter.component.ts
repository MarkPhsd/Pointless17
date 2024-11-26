import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PrepOrdersService } from 'src/app/_services/transactions/prep-orders.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-prep-order-filter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
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
