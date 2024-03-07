import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, Subscription, of, switchMap } from 'rxjs';
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
  action$ : Observable<any>;

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
    this.action$ = this.layoutService.getCollection().pipe(switchMap(data => {
        this.layoutService.dashboardCollection = data;
        console.log('data', data)
        this.filterCollection(data);
        return of(data)
      }
    ))
  }

  get collectionViewEnabled() {
      if (this.collection && this.collection.length>0) {
        return this.collectionView
      }
    // }
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
    if (this.authService.isAuthorized) {
      this.collection = dashBoardModels;
      this.layoutService._dashboardModel.next(dashBoardModels[0])
      return
    }

    if (this.authService.isAdmin) {
      this.collection = dashBoardModels;
      this.layoutService._dashboardModel.next(dashBoardModels[0])
      return
    }

    this.collection = dashBoardModels.filter(data => {
      if (data?.type === 'Menu' || data?.type === 'POSOrder'  || data?.type === 'Order') {
        this.layoutService._dashboardModel.next(data)
        return
      }
    })

  }

  refresh() {
    this.initCollection()
  }

  selectMenu(item) {
    if (!item || !item.id) {return }
    this.action$ = this.layoutService.getDataOBS(item.id).pipe(switchMap(data =>
      {
        if (data.id) {
          this.layoutService.refreshDashBoard(data.id)
        }
        return of(data)
    }));
  }


}
