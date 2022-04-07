import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel } from '../grid-models';

@Component({
  selector: 'app-dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss']
})
export class DashboardMenuComponent implements OnInit {

  _dashboardModel: Subscription
  collection: DashboardModel[]
  constructor(
    public layoutService       : GridsterLayoutService,
    public authService         : AuthenticationService,
  ) { }

  ngOnInit(): void {
    const i = 0;
    this.initCollection()
    this.initSubscriptions()
  }

  initCollection() {
    const collection$ = this.layoutService.getCollection();

    collection$.subscribe( {
      next: data => {
        this.layoutService.dashboardCollection = data;
        this.filterCollection(data);
      }
    })
  }

  initSubscriptions() {
    this._dashboardModel = this.layoutService.dashboardModel$.subscribe(data =>
      {
        console.log('initsubscription', data)
        this.filterCollection(this.layoutService.dashboardCollection)
      }
    )
  }

  filterCollection(dashBoardModels: DashboardModel[]) {
    if (!this.layoutService.dashboardCollection) { return }
    this.collection = null;
    if (this.authService.isAuthorized)  {
      this.collection = this.layoutService.dashboardCollection;
      return
    }
    this.collection = this.layoutService.dashboardCollection.filter(data => {
      if (data.type === 'Menu' || data.type === 'POSOrder'  || data.type === 'Order') {
        return data
      }
    })
  }

  // this.authser.isAuthorized

}
