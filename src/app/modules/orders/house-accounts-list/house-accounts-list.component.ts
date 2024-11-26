import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit,Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'house-accounts-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './house-accounts-list.component.html',
  styleUrls: ['./house-accounts-list.component.scss']
})
export class HouseAccountsListComponent implements OnInit {

  loadingHouseAccounts: boolean;
  action$: Observable<any>;
  @Output() selectClient = new EventEmitter();

  constructor(private siteService: SitesService,
              private orderService: OrdersService,) { }

  ngOnInit(): void {
    this.refresh()
  }

  refresh() {
    const site = this.siteService.getAssignedSite();
    this.loadingHouseAccounts = true
    this.action$ = this.orderService.getHouseAccountPendingOrders(site).pipe(switchMap(data => {
      this.loadingHouseAccounts = false
      return of(data)
    }))
  }

  setClient(item: any) {
    console.log(item?.clientID)
    this.selectClient.emit(item?.clientID)
  }

}
