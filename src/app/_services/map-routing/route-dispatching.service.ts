import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { Observable, } from 'rxjs';
import { ISite, IRouteDispatchingFilter }   from 'src/app/_interfaces';
import { IRouteDispatch, RouteDetail } from '../../_interfaces/route-dispatching-filter/route-dispatch';

@Injectable({
  providedIn: 'root'
})
export class RouteDispatchingService {

  constructor(
              private http: HttpClient,
              private auth: AuthenticationService,
              private routeDispatch: RouteDispatchingService ) { }


  getRoutesByFilter(site: ISite, routeFilter: IRouteDispatchingFilter): Observable<IRouteDispatch[]> {

    const controller = '/Routes/'

    const endPoint = 'GetDispatcherListByRouteFilter'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IRouteDispatch[]>(url, routeFilter)

  }

  saveRoute(site: ISite, routeDispatch: IRouteDispatch): Observable<IRouteDispatch> {

    if (routeDispatch.id) {
     return  this.updateRoute(site, routeDispatch)
    } else {
      return this.addRoute(site, routeDispatch)
    }

  }

  addRoute(site: ISite, routeDispatch: IRouteDispatch): Observable<IRouteDispatch> {

    const controller = '/Routes/'

    const endPoint = 'postRoute'

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<IRouteDispatch>(url, routeDispatch)

  }

  deleteRoute(site: ISite, routeDispatch: IRouteDispatch) : Observable<IRouteDispatch> {

    const controller = '/Routes/'

    const endPoint = 'DeleteRoute'

    const parameters = `?id=${routeDispatch.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<IRouteDispatch>(url)

  }

  updateRoute(site: ISite, routeDispatch: IRouteDispatch): Observable<IRouteDispatch> {

    const controller = '/Routes/'

    const endPoint = 'postRoute'

    const parameters = `?id=${routeDispatch.id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<IRouteDispatch>(url, routeDispatch)

  }

  saveRouteDetail(site: ISite, routeDispatch: RouteDetail): Observable<RouteDetail> {

    if (routeDispatch.id) {
     return  this.updateRouteDetail(site, routeDispatch)
    } else {
      return this.addRouteDetail(site, routeDispatch)
    }

  }

  getRouteDetail(site: ISite, id: number): Observable<RouteDetail> {

    const controller = '/RoutesDetails/'

    const endPoint = 'postRouteDetail'

    const parameters = '?id=${routeDispatch.id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<RouteDetail>(url)

  }

  addRouteDetail(site: ISite, routeDispatch: RouteDetail): Observable<RouteDetail> {

    const controller = '/RoutesDetails/'

    const endPoint = 'postRouteDetail'

    const parameters = '?id=${routeDispatch.id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<RouteDetail>(url, routeDispatch)

  }

  deleteRouteDetail(site: ISite, routeDetail: RouteDetail): Observable<RouteDetail> {


    const controller = '/RoutesDetails/'

    const endPoint = 'deleteRoute'

    const parameters = '?id=${routeDispatch.id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<RouteDetail>(url)

  }

  updateRouteDetail(site: ISite, routeDetail: RouteDetail): Observable<RouteDetail> {

    const controller = '/RoutesDetails/'

    const endPoint = 'putRouteDetail'

    const parameters = '?id=${routeDispatch.id}'

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.put<RouteDetail>(url, routeDetail)

  }

}
