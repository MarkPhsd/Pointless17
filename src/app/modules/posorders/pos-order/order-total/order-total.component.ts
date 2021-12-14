import { Component, OnInit,Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces';

@Component({
  selector: 'app-order-total',
  templateUrl: './order-total.component.html',
  styleUrls: ['./order-total.component.scss']
})
export class OrderTotalComponent implements OnInit {

  @Input() order: IPOSOrder
  @Input() mainPanel = false;

  transactionDataClass ="transaction-data"
  constructor(  public  route: ActivatedRoute) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    console.log('OrderTotalComponent main panel', outPut, this.mainPanel )
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (!this.mainPanel) {
      this.transactionDataClass ="transaction-data-side-panel"
    }
  }

}
