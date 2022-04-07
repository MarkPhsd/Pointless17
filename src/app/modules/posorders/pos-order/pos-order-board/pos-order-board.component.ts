import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, Observable, repeatWhen, throwError } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-pos-order-board',
  templateUrl: './pos-order-board.component.html',
  styleUrls: ['./pos-order-board.component.scss']
})
export class PosOrderBoardComponent implements OnInit {

  site    : ISite;
  posName : string;
  order$  : Observable<IPOSOrder>;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;
  constructor(
    private siteService:  SitesService,
    private orderService: OrdersService,
    // private orderMethodsService: OrderMethodsService
    ) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()

    this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
  }

  refreshOrderFromPOSDevice() {
    const seconds = 1000 * this.refreshTime;
    if (!this.posName) { return }
    this.order$  = this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(
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
