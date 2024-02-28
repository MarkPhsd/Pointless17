import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, Observable, of, repeatWhen, switchMap, throwError } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-order-total-board',
  templateUrl: './order-total-board.component.html',
  styleUrls: ['./order-total-board.component.scss']
})
export class OrderTotalBoardComponent implements OnInit {

  site    : ISite;
  posName : string;
  order$  : Observable<IPOSOrder>;
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
      return of(data)
    }))
  }

  refreshOrderFromPOSDevice() {
    const seconds = 1000 * this.refreshTime;
    if (!this.posName) { return }
    this.order$  = this.getOrder().pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(seconds * 1)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )
    console.log('tracking')
  }

}
