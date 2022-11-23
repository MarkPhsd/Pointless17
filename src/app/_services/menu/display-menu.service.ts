import { Injectable, Input } from '@angular/core';
import { AuthenticationService } from '../system/authentication.service';
import { Observable  } from 'rxjs';
import { SitesService } from '../reporting/sites.service';
import { ISite  }  from 'src/app/_interfaces';
import { HttpClient } from '@angular/common/http';
import { IDisplayMenu, IDisplayMenuSearchResults } from 'src/app/_interfaces/menu/price-schedule';

@Injectable({
  providedIn: 'root'
})
export class DisplayMenuService {

  constructor( private http                    : HttpClient,
    private auth                    : AuthenticationService,
    private siteService             : SitesService,
   )
{ }


delete(site: ISite, id: number): Observable<IDisplayMenu> {

  const controller = "/displaymenu/"

  const endPoint = `DeleteMenu`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return this.http.delete<any>(url)

 }

 getMenus(site: ISite) : Observable<IDisplayMenu[]> {

  const controller = "/displaymenu/"

  const endPoint = `getMenus`

  const parameters = ``

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IDisplayMenu[]>(url)

}

 getMenu(site: ISite, id: any) : Observable<IDisplayMenu> {

  const controller = "/displaymenu/"

  const endPoint = `getMenu`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IDisplayMenu>(url)

}

postMenusList(site: ISite, list: IDisplayMenu[]): Observable<IDisplayMenu[]> {

  const controller = "/displaymenu/"

  const endPoint = `PostMenusList`;

  const parameters= ``;

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return this.http.post<IDisplayMenu[]>(url, list)

}

// /PostMenusList


save(site: ISite,  price: IDisplayMenu): Observable<IDisplayMenu> {
  if (price.id) {
    return  this.put(site, price.id, price);
  }
  if (!price.id) {
    return this.post(site, price);
  }
}

post(site: ISite,  item: IDisplayMenu): Observable<IDisplayMenu> {

  const controller = "/displaymenu/"

  const endPoint = `PostMenu`

  const parameters = ''

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return this.http.post<any>(url, item)

}

 put(site: ISite, id: number, item: IDisplayMenu): Observable<IDisplayMenu> {

    if (id && item) {

      const controller = "/displaymenu/"

      const endPoint = 'PutMenu'

      const parameters = `?id=${id}`

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.put<any>(url, item)

    }

  }

  searchMenuPrompts(site: ISite, searchName: string) : Observable<IDisplayMenuSearchResults> {

    if (searchName === 'undefined' || searchName === undefined) {
      searchName = '';
    }
    const controller = "/displaymenu/"

    const endPoint = 'searchMenus'

    const parameters = `?name=${searchName}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IDisplayMenuSearchResults>(url)

  }

}
