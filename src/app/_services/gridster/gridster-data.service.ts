import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';
import { ICompany, ISite } from   'src/app/_interfaces';
import { AppInitService } from '../system/app-init.service';
import { DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { Router } from '@angular/router';
import { AuthenticationService } from '..';
import { IItemBasic } from '../menu/meta-tags.service';

@Injectable({
  providedIn: 'root'
})
export class GridsterDataService {

  grid: DashboardModel
  apiUrl: any;

  constructor( private http: HttpClient,
               private appInitService  : AppInitService,
               private router: Router,
               private authService: AuthenticationService,
              ) {
    this.apiUrl  = this.appInitService.apiBaseUrl()
  }

  getUser()  {
    // console.log(this.authService.userValue)
    return this.authService.userValue;
  }

  getGrids(site: ISite): Observable<DashboardModel[]> {

    const controller = '/GR_DashboardController/'

    let endPoint = 'GetGR_Dashboards'
    const user = this.getUser();
    if (user) {
      endPoint = 'GetGR_Dashboards_User'
    }

    const parameters = ''

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<DashboardModel[]>(url)

  };

  getGridsOptimized(site: ISite): Observable<IItemBasic[]> {

    const controller = '/GR_DashboardController/'

    let endPoint = 'GetGR_Dashboards_Optimized'
    const user = this.getUser();
    if (user) {
      endPoint = 'GetGR_Dashboards_User_Optimized'
    }

    const parameters = ''

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<IItemBasic[]>(url)

  };

  //GetGR_DashboardByType
  getGridByType(site: ISite, type: string): Observable<DashboardModel[]> {

    const controller = '/GR_DashboardController/'

    let endPoint = 'GetGR_DashboardsByType'
    const user = this.getUser();
    if (user) {
      endPoint = 'GetGR_DashboardsByType_User'
    }

    const parameters = `?type=${type}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.get<DashboardModel[]>(url)

  };

  getGrid(site: ISite, id: number): Observable<DashboardModel> {

    if ( id == 0) {
      this.router.navigateByUrl('/menu-manager')
      return null;
    }
    const controller = '/GR_DashboardController/'

    let endPoint = 'GetGR_Dashboard'
    const user = this.getUser();
    if (user) {
      endPoint = 'GetGR_Dashboard_User'
    }

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

  deleteGrid(site: ISite, id: number): Observable<any> {

    const controller = '/GR_DashboardController/'

    const endPoint = 'DeleteGR_Dashboard'

    const parameters = `?id=${id}`

    const url = `${this.apiUrl}${controller}${endPoint}${parameters}`

    return  this.http.delete<any>(url)

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

    if (grid.id && grid.id != 0) {
     return this.updateGrid(site, grid)
    }
    if (!grid.id || grid.id == 0) {
      return this.addGrid(site, grid)
    }

  };

}
