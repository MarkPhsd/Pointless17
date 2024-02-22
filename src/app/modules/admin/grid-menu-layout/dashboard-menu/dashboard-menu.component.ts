import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/_services';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel } from '../grid-models';

@Component({
  selector: 'app-dashboard-menu',
  templateUrl: './dashboard-menu.component.html',
  styleUrls: ['./dashboard-menu.component.scss']
})
export class DashboardMenuComponent implements OnInit, OnDestroy {

  _dashboardModel: Subscription;
  collection: DashboardModel[];

  @ViewChild('collectionView') collectionView  : TemplateRef<any>;
  
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

  get collectionViewEnabled() {
    // console.log('isnull',this.collection, this.checkIfIsNull(this.collection), this.collection == null,)
    if (!this.checkIfIsNull(this.collection)) { 
      if (this.collection ||this.collection.length>0) { 
        console.log('collection', this.collection)
        return this.collectionView
      }
    }
    return null;
  }

  checkIfIsNull(array) { 
    const collection = [null];

    const containsNull = collection.some(element => element === null);

    return containsNull // true if the array contains null, false otherwise

  }

  initSubscriptions() {
    this._dashboardModel = this.layoutService.dashboardModels$.subscribe(data =>
      {
        this.filterCollection(data)
      }
    )
  }

  ngOnDestroy(): void {
    if(this._dashboardModel) { this._dashboardModel.unsubscribe()}
  }

  filterCollection(dashBoardModels: DashboardModel[]) {
    if (!dashBoardModels) { return }
    this.collection = null;
    if (this.authService.isAuthorized)  {
      this.collection = dashBoardModels;
      return
    }
    this.collection = dashBoardModels.filter(data => {
      if (data.type === 'Menu' || data.type === 'POSOrder'  || data.type === 'Order') {
        this.layoutService._dashboardModel.next(data)
        return data
      }
    })
  }

  forceRefresh(item) {
    if (!item.id) {return }
    this.layoutService.forceRefresh(item.id)
    console.log('refresh')
  }


}
