import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, Observable, repeatWhen, throwError } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-limit-values-card',
  templateUrl: './limit-values-card.component.html',
  styleUrls: ['./limit-values-card.component.scss']
})
export class LimitValuesCardComponent implements OnInit {

  site    : ISite;
  posName : string;
  order$  : Observable<IPOSOrder>;
  @Input() disableActions: boolean;
  @Input() refreshTime: 10;
  constructor(
    private siteService:  SitesService,
    private orderService: OrdersService,) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()
    this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
  }

  refreshOrderFromPOSDevice() {
    const delayTime = 1000 * this.refreshTime;
    if (!this.posName) { return }
    this.order$  = this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(
      repeatWhen(notifications =>
        notifications.pipe(
          delay(delayTime)),
      ),
      catchError((err: any) => {
        return throwError(err);
      })
    )
    console.log('tracking')
  }

}
