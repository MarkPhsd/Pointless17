import { Component,  OnInit,  Input, Inject } from '@angular/core';
import { IPOSOrder } from 'src/app/_interfaces';
import { printOptions } from 'src/app/_services/system/printing.service';
import { Subscription } from 'rxjs';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ReceiptViewComponent } from './reciept-pop-up/receipt-view/receipt-view.component';

@Component({
  selector: 'app-reciept-pop-up',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ReceiptViewComponent,
  ],
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

