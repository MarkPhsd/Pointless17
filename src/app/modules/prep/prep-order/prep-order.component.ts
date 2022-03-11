import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';

@Component({
  selector: 'app-prep-order',
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
