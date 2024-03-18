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


}
