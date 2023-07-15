import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClientCacheService, HttpOptions } from '../_http-interceptors/http-client-cache.service';
import { ISite } from '../_interfaces';
import { AuthenticationService } from './system/authentication.service';
import { tableProperties } from '../modules/floor-plan/models/helpers';

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

  //this ensures that there aren't any leading or trailing quote's
  //surrounding the Template. Then the view can properly process the template
  //it also removes \ that can break the json of the template.
  replaceJSONText(template: any) {
    try {
      // return;
      // console.log('replaceJSON Text')
      if (template) {
        template = JSON.stringify(template) as string
        template = template.replace(/(^"|"$)/g, '');
        template = template.replaceAll('\\', '');
        return template
      }
    } catch (error) {
    console.log('error replace json text',error )
    }

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

  alterObjectColor(uuID: string, color: string, template: any) {
    // console.log('alter object color', template.objects)
    let view = JSON.parse(template)
    // console.log(view, template)
    // return;
    if (view) {

      if (view.objects) {
          view. objects.forEach(data => {
            // console.log('object', data )
            if (data && data?.type  && ( data?.type.toLowerCase() === 'group' ) ) {

              let itemValue =  parseJSONTable(data.name) as tableProperties;
              // console.log('altering color')
              if (uuID && itemValue &&  itemValue.uuid){
                if (uuID === itemValue.uuid ) {
                    // console.log('itemValue', itemValue.color , data?.backgroundColor, data?.borderColor)
                    let stroke = 4
                    data.borderColor =  color;
                    data.stroke = color;
                    data.strokeWidth = stroke;
                    data.fill = color;

                    this.alterColor(color, data, stroke )

                };
              }
            }
          })
        }
      }
      template   = this.replaceJSONText(JSON.stringify(view))
      return template;
  }

  alterColor(color, obj, stroke) {

    // if (color != obj.color) {
      obj.borderColor =  color
      obj.stroke = color
      obj.strokeWidth = stroke -1
      if (obj && obj.type) {
        // console.log('object type', obj?.type)
      }
      if (stroke == 5) {
        // stroke = stroke - 4
      }

      if (obj.objects && obj.objects.length > 0 ) {
        obj.objects.forEach(item => {
            if (obj.type === 'group') {
              this.alterColor(color, item, stroke)
            }
        })
      }
    // }
    return obj
  }


}
function parseJSONTable(str: string): any {
  // Remove the leading and trailing curly braces
  str = str.slice(1, -1);
  // Split the string into key-value pairs
  let pairs = str.split(', ');
  let obj: any = {};
  for (let pair of pairs) {
    // Split the key and value
    let [key, value] = pair.split(': ');
    obj[key] = value;
  }
  return obj;
}

function stringifyJSONTable(obj: any): string {
  let str = '{';
  for (let key in obj) {
    str += key + ': ' + obj[key] + ', ';
  }
  // Remove the trailing comma and space
  str = str.slice(0, -2);
  str += '}';
  return str;
}
