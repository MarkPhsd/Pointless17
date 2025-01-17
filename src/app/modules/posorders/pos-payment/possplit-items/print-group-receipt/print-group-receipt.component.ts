import { CommonModule } from '@angular/common';
import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'print-group-receipt',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './print-group-receipt.component.html',
  styleUrls: ['./print-group-receipt.component.scss']
})
export class PrintGroupReceiptComponent implements OnInit {
  @Output() outPutPaymentAmount = new EventEmitter();
  @Input() orderID: number;
  @Input() groupID: number;
  @Input() order: IPOSOrder;

  printReceipt$    : Observable<IPOSOrder>;
  groupTotal = 0;

  constructor(
    private siteService: SitesService,
    public orderMethodsService: OrderMethodsService,
    private orderService: OrdersService,
    public printingService: PrintingService,) { }

  ngOnInit(): void {
    const i = 0
    const site = this.siteService.getAssignedSite()
    // this.orderGroupTotal$ = this.setGroupOrderTotal(site, this.orderID, this.groupID)
  }

  printReceipt()  {
    if (!this.groupID) { this.groupID = 0 }

    this.printReceipt$ = this.printingService.printReceipt(this.orderID, this.groupID).pipe(switchMap(data => {
      return of(data)
    }))
  }

  submitPaymentAmount() {
    const item = {amount: this.order.total, groupID: this.groupID}
    console.log(item)
    this.outPutPaymentAmount.emit(item)
  }

  setGroupOrderTotal(site, orderID, groupID) {
    return this.orderService.getPOSOrderGroupTotal(site, orderID, groupID).pipe(
      switchMap(data => {
        // this.groupTotal = data.total;
        return of(data)
      })
    )
  }

}
