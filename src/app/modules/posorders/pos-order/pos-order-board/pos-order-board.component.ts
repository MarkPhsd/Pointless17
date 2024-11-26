import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, Observable, of, repeatWhen, switchMap, throwError } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PosOrderItemsComponent } from '../pos-order-items/pos-order-items.component';

@Component({
  selector: 'app-pos-order-board',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PosOrderItemsComponent,
  ],
  templateUrl: './pos-order-board.component.html',
  styleUrls: ['./pos-order-board.component.scss']
})
export class PosOrderBoardComponent implements OnInit {

  site    : ISite;
  posName : string;
  // order$  : Observable<IPOSOrder>;
  order$ = this.orderMethodsService.currentOrder$.pipe(switchMap(data => {
    return of(data)
  }))
  @Input() disableActions: boolean;
  @Input() chartHeight: string;
  @Input() refreshTime = 1;
  @Input() chartWidth: string;
  constructor(
    private siteService:  SitesService,
    private orderService: OrdersService,
    private orderMethodsService: OrderMethodsService,
    // private orderMethodsService: OrderMethodsService
    ) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()

    // this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
  }

  private getOrder() {
    return this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      return of(data)
    }))
  }
  // refreshOrderFromPOSDevice() {
  //   const seconds = 1000 * this.refreshTime;
  //   if (!this.posName) { return }
  //   this.order$  = this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(
  //     repeatWhen(notifications =>
  //       notifications.pipe(
  //         delay(seconds * 1)),
  //     ),
  //     catchError((err: any) => {
  //       return throwError(err);
  //     })
  //   )
  //   console.log('tracking')
  // }
  // refreshOrderFromPOSDevice() {
  //   const retryDelay = 30000; // 30 seconds
  //   if (!this.posName) { return; }
  //   this.order$ = this.getOrder().pipe(
  //     catchError(err => {
  //       console.error('Error fetching order, will retry in 30 seconds', err);
  //       // Use timer to delay the retry
  //       return timer(retryDelay);
  //     }),
  //     switchMap(() => this.getOrder()),
  //     // Repeat this process indefinitely
  //     repeatWhen(completed => completed.pipe(delay(retryDelay)))
  //   );
  //   console.log('tracking');
  // }
}
