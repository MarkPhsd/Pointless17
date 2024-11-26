import { Component, Input, OnInit } from '@angular/core';
import { IPOSOrder, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, delay, Observable, of, repeatWhen, switchMap, throwError } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { LimitValuesProgressBarsComponent } from '../limit-values-progress-bars/limit-values-progress-bars.component';

@Component({
  selector: 'app-limit-values-card',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    LimitValuesProgressBarsComponent,
  SharedPipesModule],
  templateUrl: './limit-values-card.component.html',
  styleUrls: ['./limit-values-card.component.scss']
})
export class LimitValuesCardComponent implements OnInit {

  site    : ISite;
  posName : string;
  order$ = this.orderMethodsService.currentOrder$.pipe(switchMap(data => {
    return of(data)
  }));
  @Input() disableActions: boolean;
  @Input() refreshTime: 10;
  constructor(
    private siteService:  SitesService,
    private orderMethodsService: OrderMethodsService,
    private orderService: OrdersService,) { }

  ngOnInit(): void {
    this.posName = localStorage.getItem('devicename')
    this.site    = this.siteService.getAssignedSite()
    // this.refreshOrderFromPOSDevice();
  }

  trackByFn(_, {id, total,balanceRemaining,itemCount,completionDate}: IPOSOrder): number {
    return id;
  }

  // refreshOrderFromPOSDevice() {
  //   const delayTime = 1000 * this.refreshTime;
  //   if (!this.posName) { return }
  //   this.order$  = this.orderService.getCurrentPOSOrder(this.site, this.posName).pipe(
  //     repeatWhen(notifications =>
  //       notifications.pipe(
  //         delay(delayTime)),
  //     ),
  //     catchError((err: any) => {
  //       return throwError(err);
  //     })
  //   )
  //   console.log('tracking')
  // }

}
