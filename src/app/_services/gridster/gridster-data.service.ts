import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { ICompany, ISite } from   'src/app/_interfaces';
import { AppInitService } from '../system/app-init.service';
import { DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';

@Injectable({
  providedIn: 'root'
})
export class GridsterDataService {

  grid: DashboardModel
  apiUrl: any;

  constructor( private http: HttpClient,
               private appInitService  : AppInitService,
              ) {
    this.apiUrl  = this.appInitService.apiBaseUrl()
  }

  getGrids(site: ISite): Observable<DashboardModel[]> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'GetGR_Dashboards'

    const parameters = ''

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<DashboardModel[]>(url)

  };

  //GetGR_DashboardByType
  getGridByType(site: ISite, type: string): Observable<DashboardModel[]> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'GetGR_DashboardsByType'

    const parameters = `?type=${type}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<DashboardModel[]>(url)

  };

  getGrid(site: ISite, id: number): Observable<DashboardModel> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'GetGR_Dashboard'

    const parameters = `?id=${id}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<DashboardModel>(url)

  };

  addGrid(site: ISite, grid: DashboardModel): Observable<DashboardModel> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'PostGR_Dashboard'

    const parameters = ``

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.post<DashboardModel>(url,  grid)

  };

  updateGrid(site: ISite, grid: DashboardModel): Observable<DashboardModel> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'PutGR_Dashboard'

    const parameters = `?id=${grid.id}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.put<DashboardModel>(url,  grid)

  };


  saveGrid(site: ISite, grid: DashboardModel): Observable<DashboardModel> {

    if (!grid || !site) { return }

    if (grid.id) {
     return this.updateGrid(site, grid)
    }
    if (!grid.id) {
      return this.addGrid(site, grid)
    }

  };

}
