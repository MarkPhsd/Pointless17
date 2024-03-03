import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, delayWhen, Observable, of, repeatWhen, retryWhen, switchMap, tap, throwError, timer } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-order-total-board',
  templateUrl: './order-total-board.component.html',
  styleUrls: ['./order-total-board.component.scss']
})
export class OrderTotalBoardComponent implements OnInit {

  site    : ISite;
  posName : string;
  order$  : Observable<any>;
  order: IPOSOrder;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;

  constructor(
    private siteService:  SitesService,
    private orderMethodsService: OrderMethodsService,
    private orderService: OrdersService,) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()
    this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
  }

  private getOrder() {
    return this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      this.order = data;
      return of(data)
    }),catchError(data => {
      return of(data)
    }))
  }

  // refreshOrderFromPOSDevice() {
  //   const retryDelay = 1000; // 30 seconds
  //   if (!this.posName) { return; }
  //   this.order$ = of(null).pipe(
  //     tap(() => console.log('Attempting to fetch order...')),
  //     switchMap(() => this.getOrder()),
  //     catchError(error => {
  //       console.error('Error fetching order, will retry in 30 seconds', error);
  //       // Use timer to delay the next retry
  //       return timer(retryDelay).pipe(
  //         tap(() => this.refreshOrderFromPOSDevice()) // Restart the process after a delay
  //       );
  //     })
  //   );
  // }

  refreshOrderFromPOSDevice() {
    const retryDelay = 1000; // 30 seconds
    if (!this.posName) { return; }
    this.order$ = this.getOrder().pipe(
      catchError(err => {
        console.error('Error fetching order, will retry in 30 seconds', err);
        // Use timer to delay the retry
        return timer(retryDelay);
      }),
      switchMap(() => this.getOrder()),
      // Repeat this process indefinitely
      repeatWhen(completed => completed.pipe(delay(retryDelay)))
    );
    console.log('tracking');
  }
  // refreshOrderFromPOSDevice() {
  //   const retryDelay = 30000; // 30 seconds
  //   if (!this.posName) { return; }
  //   this.order$ = this.getOrder().pipe(
  //     retryWhen(errors =>
  //       errors.pipe(
  //         // Log the error or perform a side effect here if needed
  //         tap(err => console.error('Error fetching order, retrying...', err)),
  //         // Wait for a specified time before retrying
  //         delayWhen(() => timer(retryDelay)),
  //       )
  //     ),
  //   );
  //   console.log('tracking');
  // }
  // refreshOrderFromPOSDevice() {
  //   const seconds = 1000 * this.refreshTime;
  //   if (!this.posName) { return }
  //   this.order$  = this.getOrder().pipe(
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

}
