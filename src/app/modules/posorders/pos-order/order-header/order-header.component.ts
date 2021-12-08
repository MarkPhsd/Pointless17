import { Component, OnInit,Input } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';

@Component({
  selector: 'app-order-header',
  templateUrl: './order-header.component.html',
  styleUrls: ['./order-header.component.scss']
})
export class OrderHeaderComponent  {
  @Input() order: IPOSOrder

  constructor() { }


}
