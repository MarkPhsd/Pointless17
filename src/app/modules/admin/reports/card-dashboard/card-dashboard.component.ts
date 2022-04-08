import { Component, OnInit,Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-card-dashboard',
  templateUrl: './card-dashboard.component.html',
  styleUrls: ['./card-dashboard.component.scss']
})
export class CardDashboardComponent implements OnInit {

  site    : ISite;
  posName : string;
  sites$   : Observable<ISite[]>;
  @Input() disableActions: boolean;
  @Input() refreshTime = 1;

  @Input() name         = 'A Chart';
  @Input() chartType    = 'line';
  @Input() chartHeight  = '350px'
  @Input() menuType     : string;
  @Input() cardValueType: string;
  @Input() rangeType    : string;

  constructor(private siteService: SitesService,) { }

  ngOnInit(): void {
    const i = 0
  }

  // refreshData() {
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

  // trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
  //   return id;
  // }

}
