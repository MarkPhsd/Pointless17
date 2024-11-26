import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { of, switchMap} from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { OrderHeaderDemoGraphicsComponent } from '../order-header-demo-graphics/order-header-demo-graphics.component';

@Component({
  selector: 'app-order-header-demographics-board',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    OrderHeaderDemoGraphicsComponent,
  SharedPipesModule],
  templateUrl: './order-header-demographics-board.component.html',
  styleUrls: ['./order-header-demographics-board.component.scss']
})
export class OrderHeaderDemographicsBoardComponent implements OnInit {

  @Input() disableActions: boolean;
  @Input() refreshTime: 10;

  site    : ISite;
  posName : string;
  order$ = this.orderMethodsService.currentOrder$.pipe(switchMap(data => {
    return of(data)
  }));

  constructor(
    private siteService:  SitesService,
    private orderMethodsService: OrderMethodsService,
    ) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()
    // this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
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

}
