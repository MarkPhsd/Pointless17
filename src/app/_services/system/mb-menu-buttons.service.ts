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
  mb_MenuButtons: mb_MenuButton[];
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
  allowStaff: boolean;
  allowUser: boolean;
  itemsPrinted: boolean;
  paymentsMade: boolean;
  isAuthorized: boolean;
  suspendedOrders: boolean;
  completedOrder: boolean;
  completedOrderAndUser: boolean;
  sidePanelOnly: boolean;
  mainPanelOnly: boolean;
  smallDeviceOnly: boolean;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class MBMenuButtonsService {

  functions = [
    {id: 0, name:'DRW 1', icon: 'register', function: 'openDrawer1',group: 'drawer'},
    {id: 1, name:'DRW 2', icon: 'register', function: 'openDrawer2',group: 'drawer'},
    {id: 2, name:'DRW 3', icon: 'register', function: 'openDrawer3',group: 'drawer'},
    {id: 3, name:'Suspend', icon: 'hold', function: 'suspendOrder',group: 'order'},
    {id: 4, name:'EmailOrder', icon: '', function: 'emailOrder',group: 'order'},
    {id: 5, name:'TextOrder', icon: '', function: 'textOrder',group: 'order'},
    {id: 5, name:'QRLink', icon: '', function: 'qrLink',group: 'order'},
  ]
//
  constructor(
    private http: HttpClient,
    private httpCache: HttpClientCacheService,
    private auth: AuthenticationService,
   )
{ }

  getGroups(site: ISite): Observable<IMenuButtonGroups[]> {

    const controller = "/mb_MenuButtonGroups/"

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

  putGroup(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PutGroup"

    const parameters = `?id=${menuButtonGroup.id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.put<IMenuButtonGroups>(uri , menuButtonGroup)

  };

  postGroup(site: ISite, menuButtonGroup: IMenuButtonGroups): Observable<IMenuButtonGroups> {

    const controller = "/MB_MenuButtonGroups/"

    const endPoint = "PostGroup"

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


  getButtonByName(site: ISite, name: string): Observable<mb_MenuButton> {

    const controller = "/MB_MenuButtons/"

    const endPoint = "GetMB_MenuButton"

    const parameters = `?name=${name}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<mb_MenuButton>(options)

  };

  getButtonsByID(site: ISite, id: number): Observable<mb_MenuButton> {

    const controller = "/MB_MenuButtons/"

    const endPoint = "GetMB_MenuButton"

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const options = { url: uri, cacheMins: 0}

    return  this.httpCache.get<mb_MenuButton>(options)

  };

  putButton(site: ISite, menuButton: mb_MenuButton): Observable<mb_MenuButton> {

    if (!menuButton || !menuButton.id) { return null}

    const controller = "/MB_MenuButtons/"

    const endPoint = "PutMB_MenuButton"

    const parameters = `?id=${menuButton.id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<mb_MenuButton>(uri , menuButton)

  };

  postButton(site: ISite, menuButton: mb_MenuButton): Observable<mb_MenuButton> {
    if (!menuButton ) { return null}
    const controller = "/mB_MenuButtons/"

    const endPoint = "PostMB_MenuButton"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<mb_MenuButton>(uri , menuButton)

  };

  postButtonList(site: ISite, menuButton: mb_MenuButton[], groupName: string, reset: boolean): Observable<mb_MenuButton[]> {

    const controller = "/mB_MenuButtons/"

    const endPoint = "PostmB_MenuButtons"

    const parameters = `?groupName=${groupName}&reset=${reset}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<mb_MenuButton[]>(uri , menuButton)

  };

  deleteButton(site: ISite, id: number): Observable<mb_MenuButton> {

    const controller ="/mB_MenuButtons/"

    const endPoint = `DeletemB_MenuButtons`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.delete<mb_MenuButton>(url)

  }

  generateDefaultOrderButtons(id: number): mb_MenuButton[] {
    //post up to API order buttons.
    const items = [] as mb_MenuButton[];

    let item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Items"
    item.icon = "list"
    item.sort  = 1
    let prop = this.getOrderDefaultButtonProperties();
    prop.method = 'showItems()'
    prop.smallDeviceOnly = true;
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Suspend"
    item.icon = ""
    item.sort  = 2
    prop.color      = "warn"
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'removeSuspension()'
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Delete"
    item.icon = "delete"
    item.sort  = 3
    prop.color      = "warn"
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'deleteOrder()'
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Check Out / Pay"
    item.icon = "credit_card"
    item.sort  = 4
    prop = this.getOrderDefaultButtonProperties();
    prop.method = 'makePayment()'
    prop.sidePanelOnly = true
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Labels"
    item.icon = "print"
    item.sort  = 5
    prop.method = 'printLabels()'
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Re-Print Labels"
    item.icon = "print"
    item.sort  = 6
    prop.method = 'rePrintLabels()'
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Void"
    item.icon = "delete"
    item.sort  = 7
    prop.method = 'voidOrder()'
    prop.color      = "warn"
    prop = this.getOrderDefaultButtonProperties();
    item.properties  = JSON.stringify(prop)
    items.push(item)

    item = {} as mb_MenuButton;
    item.mb_MenuButtonGroupID =id
    item.name = "Leave"
    item.icon = ""
    item.sort  = 7
    prop.method = 'clearOrder()'
    prop = this.getOrderDefaultButtonProperties();
    prop.color      = "warn"
    item.properties  = JSON.stringify(prop)
    items.push(item)


    return items
  }

  private getOrderDefaultButtonProperties() : IMenuButtonProperties {
    const item           = {} as IMenuButtonProperties;
    item.completedOrder  = false;
    item.completedOrderAndUser = false;
    item.balanceRemainingGreaterThanZero = true;
    item.allowUser       = true;
    item.allowStaff      = true;
    item.itemsPrinted    = true;
    item.isAuthorized    = true;
    item.suspendedOrders = true;
    item.sidePanelOnly   = false;
    item.mainPanelOnly   = false
    item.orderHistory    = false;
    item.smallDeviceOnly = false;
    item.color           = "primary"
    return item
  }

  resetOrderButtons(site: ISite, id: number): Observable<mb_MenuButton[]> {
    const list = this.generateDefaultOrderButtons(id);
    return this.postButtonList(site, list, 'Order Buttons', true)
    return null;
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
