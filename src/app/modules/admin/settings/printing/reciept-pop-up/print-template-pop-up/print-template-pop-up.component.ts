import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { BehaviorSubject } from 'rxjs';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { OrdersService } from 'src/app/_services';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-print-template-pop-up',
  templateUrl: './print-template-pop-up.component.html',
  styleUrls: ['./print-template-pop-up.component.scss']
})
export class PrintTemplatePopUpComponent implements OnInit, OnDestroy {

  @ViewChild('printTemplate') printTemplate: TemplateRef<any>;
  currentView: TemplateRef<any>;

  private _moveNext        = new BehaviorSubject<number>(null);
  public moveNext$         = this._moveNext.asObservable();
  hideTemplate: boolean;
  printOrders : IPrintOrders[];
  printOrder  : IPrintOrders;
  printedArray = [];
  nextPrint: boolean;
  index = 0;

  constructor(private dialogRef: MatDialogRef<PrintTemplatePopUpComponent>,
              private printingService: PrintingService,
              @Inject(MAT_DIALOG_DATA) public data: any
              )
  {
    if (data) {
      // console.log('submiting this info for printing', data, data.length)
      this.printOrders = data as IPrintOrders[];
      this.printOrder  = this.printOrders[this.index]
      this.printingService._printOrder.next(this.printOrder)
      this.currentView = this.printTemplate;
    }
  }

  ngOnInit(): void {
    const i = 0;
    // console.log('open print template')
  }

  exit() {
    this.dialogRef.close('true')
  }

  ngOnDestroy() {
    if (this._moveNext) { this._moveNext.unsubscribe()}
  }

  printingCompleted(event) {
    this.index = event.index;
    this.index = this.index + 1;
    this.hideTemplate = true
    this.currentView = null;
    this.printOrder = this.printOrders[this.index]
    this.printingService._printOrder.next(this.printOrder)
    this.currentView = this.printTemplate;
    this.hideTemplate = false;
    if (this.index + 1 > this.printOrders.length) {
      this.exit()
      return;
    }
  }

  get templateCurrent() {
    if (this.hideTemplate) { return null }
    this.currentView = this.printTemplate;
    return this.currentView
  }

}

