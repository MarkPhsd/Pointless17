import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from '../_interfaces';
import { AuthenticationService } from './system/authentication.service';

export interface IFloorPlan {
  id: number;
  name: string;
  template: any;
  sort: number;
  enabled: boolean;
  image: string;
  height: number;
  width: number;
}

@Injectable({
  providedIn: 'root'
})
export class FloorPlanService {

  constructor( private http: HttpClient,
               private auth: AuthenticationService) { }

  pageNumber = 1;
  pageSize  = 50;

  getFloorPlan(site: ISite, id: number) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `getFloorPlan`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IFloorPlan>(url)

  }

  listFloorPlansNames(site: ISite) : Observable<IFloorPlan[]> {

    const controller =  "/floorplans/"

    const endPoint = `ListFloorPlansNames`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IFloorPlan[]>(url)

  }

  delete(site: ISite, id: number) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `deleteFloorPlan`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IFloorPlan>(url)

  }

  deleteFloorPlans(site: ISite, items: IFloorPlan[]) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `deleteFloorPlans`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IFloorPlan>(url, items)

  }

  postFloorPlan(site: ISite, item: IFloorPlan): Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `postFloorPlan`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IFloorPlan>(url , item)

  };

  putFloorPlan(site: ISite, id: any, item: IFloorPlan): Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `PutFloorPlan`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IFloorPlan>(url , item)

  };


  saveFloorPlan(site: ISite, item: IFloorPlan): Observable<IFloorPlan>  {

    if (!item.id ) {
      // console.log('postFloorPlan', item);
      return this.postFloorPlan(site,item)
    }
    if (item.id) {
      // console.log('putFloorPlan', item);
      return this.putFloorPlan(site,item.id, item)
    }
  }

  clearTable(site: ISite, floorPlanID: number, orderID: string ) : Observable<any>  {
    const controller =  "/floorplans/"

    const endPoint = `clearTable`

    const parameters = `?floorPlanID=${floorPlanID}&orderID=${orderID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)
  }

}
