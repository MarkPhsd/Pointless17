import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { IPrintOrders } from 'src/app/_interfaces/transactions/printServiceOrder';
import { OrdersService } from 'src/app/_services';

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
              private orderService: OrdersService,
              @Inject(MAT_DIALOG_DATA) public data: any
              )
  {
    if (data) {
      this.printOrders = data as IPrintOrders[];
      this.printOrder  = this.printOrders[this.index]
      this.orderService._printOrder.next(this.printOrder)
      this.currentView = this.printTemplate;
    }
    // this.moveNextSectionSubscriber()
  }

  ngOnInit(): void {
    const i = 0;
  }

  exit() {
    this.dialogRef.close('true')
  }

  ngOnDestroy() {
    if (this._moveNext) { this._moveNext.unsubscribe()}
  }

  printingCompleted(event) {
    this.hideTemplate = true
    this.currentView = null;
    // if (this.printOrders.length > this.index + 1) {return}
    // if (this.printOrders.length == this.index )  { return }

    // if (this.index + 1 > this.printOrders.length) {
    //   this.exit
    //   return
    // }

    // this.index = this.index + 1;
    this.printOrder = this.printOrders[this.index+1]

    console.log('printingCompleted', this.printOrder)
    this.orderService._printOrder.next(this.printOrder)
    this.currentView = this.printTemplate;
    this.hideTemplate = false
    this.index = this.index + 1;
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

  printingComplete(){
    this.dialogRef.close('sucess')
  }

  // moveNextSectionSubscriber() {
  //   this.printTemplate = null;
  //   this.moveNext$.subscribe(index => {
  //     console.log('data', this.printOrders[index])
  //     console.log('data', index)
  //     if ( this.printOrders.length +1 > this.index ) {
  //       this.exit()
  //       return;
  //     }
  //     this.printOrder = this.printOrders[index];
  //   })
  // }



}

  // // this.printOrders[0].order.posOrderItems.length
  // get allSectionsPrinted() {
  //   if (this.printedArray.length == this.index) {
  //     this.printingComplete()
  //     return true;
  //   }
  //   return false
  // }
