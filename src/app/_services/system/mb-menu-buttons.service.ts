import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';

export interface IMenuButtonGroups {
  id: number
  name: string
  description: string;
  mb_MenuButton: mb_MenuButton[];
}

export interface mb_MenuButton {
  id: number
  mb_MenuButtonGroupID: number;
  name: string;
  sort: number;
  properties: string;
  icon: string;
}

export interface IMenuButtonProperties {
  orderHistory: boolean;
  balanceRemainingGreaterThanZero: boolean;
  method: string;
  requiresStaff: boolean;
  requiresUser: boolean;
  itemsPrinted: boolean;
  paymentsMade: boolean;
  isAuthorized: boolean;
  suspendedOrders: boolean;
  completedOrder: boolean;
  completedOrderAndUser: boolean;
  smallDeviceOnly: boolean;
  sidePanelOnly: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MBMenuButtonsService {

  constructor(
    private http: HttpClient,
    private httpCache: HttpClientCacheService,
    private auth: AuthenticationService,
    private sitesService: SitesService,
   )
{ }

  getGroups(site: ISite): Observable<IMenuButtonGroups[]> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "GetGroups"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuButtonGroups[]>(options)

  };

  getGroupsByName(site: ISite, name: string): Observable<IMenuButtonGroups[]> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "GetMenuItems"

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuButtonGroups[]>(options)

  };

  getGroupByID(site: ISite, id: number): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "GetGroup"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuButtonGroups>(options)

  };

  putGroupB(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PutGroup"

    const parameters = `?id=${menuButtonGroup.id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.put<IMenuButtonGroups>(uri , menuButtonGroup)

  };

  postGroup(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PutGroup"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.post<IMenuButtonGroups>(uri , menuButtonGroup)

  };

  deleteGroup(site: ISite, id: number): Observable<IMenuButtonGroups> {

    const controller ="/MB_MenuButtonGroups/"

    const endPoint = `deleteGroup`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }


  /////////////////////////////

  getButtonByName(site: ISite, name: string): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "GetMenuItems"

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuButtonGroups>(options)

  };

  getButtonsByID(site: ISite, id: number): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "GetGroup"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<IMenuButtonGroups>(options)

  };

  putButton(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PutGroup"

    const parameters = `?id=${menuButtonGroup.id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.put<IMenuButtonGroups>(uri , menuButtonGroup)

  };

  postButton(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PutGroup"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.post<IMenuButtonGroups>(uri , menuButtonGroup)

  };

  deleteButton(site: ISite, id: number): Observable<IMenuButtonGroups> {

    const controller ="/MB_MenuButtonGroups/"

    const endPoint = `deleteGroup`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<any>(url)

  }


  generateDefaultOrderButtons(): mb_MenuButton[] {
    //post up to API order buttons.

    const items = [] as mb_MenuButton[];

    let item = {} as mb_MenuButton;
    item.name = "Items"
    item.icon = "list"
    item.sort  = 1
    let prop = this.getOrderDefaultButtonProperties();
    prop.method = 'showItems()'
    prop.smallDeviceOnly = true;
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Suspsend"
    item.icon = ""
    item.sort  = 2
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'removeSuspension()'
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Delete"
    item.icon = "delete"
    item.sort  = 3
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'deleteOrder()'
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Check Out / Pay"
    item.icon = "credit_card"
    item.sort  = 4
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'makePayment()'
    prop.sidePanelOnly = true
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Labels"
    item.icon = "print"
    item.sort  = 5
    prop.method = 'printLabels()'
     prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Re-Print Labels"
    item.icon = "print"
    item.sort  = 6
    prop.method = 'rePrintLabels()'
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Void"
    item.icon = "delete"
    item.sort  = 7
    prop.method = 'voidOrder()'
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.name = "Leave"
    item.icon = ""
    item.sort  = 7
    prop.method = 'clearOrder()'
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    return items
  }

  private getOrderDefaultButtonProperties() : IMenuButtonProperties {
    const item           = {} as IMenuButtonProperties;
    item.completedOrder  = false;
    item.balanceRemainingGreaterThanZero = true;
    item.requiresStaff   = true;
    item.requiresUser    = true;
    item.itemsPrinted    = true;
    item.isAuthorized    = true;
    item.suspendedOrders = true;
    item.smallDeviceOnly = false;
    item.completedOrderAndUser = false;
    return item
  }

}


// orderHistory: boolean;
// balanceRemainingGreaterThanZero: boolean;
// method: string;
// requiresStaff: boolean;
// requiresUser: boolean;
// itemsPrinted: boolean;
// paymentsMade: boolean;
// isAuthorized: boolean;
// suspendedOrders: boolean;
// completedOrder: boolean;
