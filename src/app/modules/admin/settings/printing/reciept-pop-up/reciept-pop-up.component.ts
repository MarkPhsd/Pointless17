import { Component,  OnInit,  Input, Inject } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { printOptions } from 'src/app/_services/system/printing.service';
import { Subscription } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-reciept-pop-up',
  templateUrl: './reciept-pop-up.component.html',
  styleUrls: ['./reciept-pop-up.component.scss']
})
export class RecieptPopUpComponent implements OnInit {

  @Input() autoPrint: boolean;
  @Input() order    : IPOSOrder;

  printOptions = {} as printOptions;

  items             : any[];
  orders            : any;
  payments          : any[];
  _order            : Subscription;
  _printReady       : Subscription;
  printReady        : boolean;
  options           : printOptions;
  autoPrinted       = false;

  constructor(
    private dialogRef: MatDialogRef<RecieptPopUpComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data)  {
      this.autoPrint = data?.autoPrint;
      this.options = data
      if (data.order) {
        this.orders = [];
        this.order = data.order;
        this.orders.push(data.order)
      }
    }
  }

  ngOnInit() {

  }

  exit(event) {
    console.log('exit print: auto', this.autoPrint, event)
    if (this.autoPrint) {
      this.dialogRef.close('true');
      return;
    }
    this.dialogRef.close();
  }
}

