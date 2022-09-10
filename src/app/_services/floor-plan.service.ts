import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClientCacheService, HttpOptions } from '../_http-interceptors/http-client-cache.service';
import { ISite } from '../_interfaces';
import { AuthenticationService } from './system/authentication.service';

export interface IFloorPlan {
  id            : number;
  name          : string;
  template      : any;
  sort          : number;
  enabled       : boolean;
  image         : string;
  height        : number;
  width         : number;
  templateBackup: string;
  UUIDList      : string;
}

@Injectable({
  providedIn: 'root'
})
export class FloorPlanService {

  constructor( private http: HttpClient,
              private httpCache: HttpClientCacheService,
               private auth: AuthenticationService) { }

  pageNumber = 1;
  pageSize  = 50;

  restoreBackup(site: ISite, id: number) {
    if (!id) {
      return
    }
    const backup$ = this.getFloorPlan(site,id)

    return backup$.pipe(
      switchMap(data => {
        const backup = data.templateBackup
        data.template = backup
        return this.putFloorPlan(site, data.id , data)
      })
    )

  }

  saveBackup(site: ISite, item: IFloorPlan ) {
    
    if (!item.template) { 
      return of('no template to save');
    }

    item.templateBackup = item.template;
    return this.putFloorPlan(site, item.id , item)

  }

  getFloorPlan(site: ISite, id: number) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `getFloorPlan`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IFloorPlan>(url)

  }
  getFloorPlanNoBackup(site: ISite, id: number) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `getFloorPlanNoBackup`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IFloorPlan>(url)

  }

  getFloorPlanNoBackupCached(site: ISite, id: number) : Observable<IFloorPlan> {

    const controller =  "/floorplans/"

    const endPoint = `getFloorPlanNoBackup`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    const options = {url: url, cacheMins: 5} as HttpOptions
    return  this.httpCache.get<IFloorPlan>( options)

  }

  // url: string
	// body?: any
	// cacheMins?: number

  pushUUIDToReset(site: ISite, id: number, uuID: string) : Observable<any> {

    const controller =  "/floorplans/"

    const endPoint = `PushUUIDToReset`

    const parameters = `?id=${id}&uuID=${uuID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

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
  
  alterObjectColor(uuID: string, color: string, view: any) {
    if (view) {
      // console.log(view)
      // console.log(JSON.parse(view))
      // view = JSON.parse(view);
      if (view.objects) {
          view. objects.forEach(data => {
            if (data && data?.type  && (data?.type === 'group' ) ) {
              const itemValue = data?.name.split(";")
              // console.log(data?.name, uuID);
              // console.log('itemValue', itemValue)
              if (itemValue.length>0){ 
                const itemUUID = itemValue[0];
                if (uuID === itemUUID ) {
                      // console.log('itemValue', itemValue)
                      let stroke = 5
                      if (color === 'red' || color ===  'rgb(200,10,10)') {
                        data.backgroundColor = color;
                        data.borderColor =  color
                        let stroke = 8
                      }

                      if (color === 'green' || color ===  'rgb(10,10,200)') {
                        data.backgroundColor = color;
                        data.borderColor =  color
                        let stroke = 5
                      }

                      if (color === 'yellow' || color ===  'rgb(10,10,200)') {
                        data.backgroundColor = color;
                        data.borderColor =  color
                        let stroke = 5
                      }

                      if (data?.backgroundColor === 'purple' ||
                          data?.backgroundColor === 'rgba(255,100,171,0.25)') {
                        // console.log('name successful setting color', name, data?.backgroundColor, color);
                        data.backgroundColor = color;
                        data.borderColor =  color
                        data.stroke = color
                        data.strokeWidth = stroke
                      }

                      if (data?.backgroundColor === 'purple' ||
                          data?.backgroundColor === 'rgba(255,100,171,0.25)') {
                        // console.log('name successful setting color 2', name, data?.backgroundColor, color);
                        data.backgroundColor = color;
                        data.borderColor =  color
                        data.stroke = color
                        data.strokeWidth = stroke
                      }

                      this.alterColor(color, data, stroke -3 )
                  //   }
                  // }
                };
              }
            }
          })
        }
      }
      return view;
  }

  alterColor(color, obj, stroke) {
    obj.borderColor =  color
    obj.stroke = color
    obj.strokeWidth = stroke
    if (obj.objects && obj.objects.length > 0 ) {
        obj.objects.forEach(item => {
          this.alterColor(color, item, stroke)
      })
    }
    return obj
  }


}
