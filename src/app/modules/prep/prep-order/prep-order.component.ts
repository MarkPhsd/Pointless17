import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-prep-order',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './prep-order.component.html',
  styleUrls: ['./prep-order.component.scss']
})
export class PrepOrderComponent implements OnInit {

  @Input() order : IPOSOrder;

  ordertime = 'order-time'
  constructor() { }

  ngOnInit(): void {
    const i = 0
  }

}
