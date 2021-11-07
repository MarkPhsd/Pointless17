import { Component, EventEmitter, OnInit,Input, Output  } from '@angular/core';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';

@Component({
  selector: 'default-receipt-selector',
  templateUrl: './default-receipt-selector.component.html',
  styleUrls: ['./default-receipt-selector.component.scss']
})
export class DefaultReceiptSelectorComponent implements OnInit {

  @Input()  receipt           : ISetting;
  @Input()  receiptName       : string;
  @Input()  receiptID         : any;
  @Input()  receiptList       : Observable<any>;
  @Output() outPutReceiptName : EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

  setReceipt() {
    console.log('item', this.receipt)
    this.outPutReceiptName.emit(event)
  }



}
