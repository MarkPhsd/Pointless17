import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { BehaviorSubject, Observable, } from 'rxjs';
import { ClientSearchModel, ClientSearchResults, ISite, IUserProfile }   from  'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { HttpClient } from '@angular/common/http';

// import { HttpClientService } from 'src/app/_http-interceptors/http-client.service';


@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  private _searchModel       = new BehaviorSubject<ClientSearchModel>(null);
  public searchModel$        = this._searchModel.asObservable();

  pageNumber = 1;
  pageSize   = 50;

  updateSearchModel(searchModel:  ClientSearchModel) {
    this._searchModel.next(searchModel);
  }

  constructor(
               private httpLive: HttpClient,
               private http: HttpClientCacheService,
               private auth: AuthenticationService) { }


  addClient(site: ISite, userProfile: IUserProfile): Observable<IUserProfile> {

    const  controller =  "/clients/"

    const endPoint = "postClient"

	  const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpLive.post<IUserProfile>(uri, userProfile)

  };

  deleteClient(site: ISite, id: number): Observable<IUserProfile> {

    const  controller =  "/clients/"

    const endPoint = "deleteClient"

	  const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpLive.delete<IUserProfile>(uri)

  };

  getLiveBrands(site: ISite, clientSearchModel: ClientSearchModel): Observable<ClientSearchResults> {

    const  controller =  "/clients/"

    const endPoint = "getBrands"

	  const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    return  this.httpLive.post<ClientSearchResults>(uri, clientSearchModel)

  };

  getBrands(site: ISite, clientSearchModel: ClientSearchModel): Observable<ClientSearchResults> {

    const  controller =  "/clients/"

    const endPoint = "getBrands"

	  const parameters = ''

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 30}

    return  this.http.post<ClientSearchResults>(url , clientSearchModel)

  };

  getBrandItemCountByType(itemTypeID: number, site: ISite): Observable<IUserProfile[]> {

    const  controller =  "/clients/"

    const endPoint = "getBrandItemCountByType"

	  const parameters = `?itemTypeID=${itemTypeID}`;

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 30}

    return  this.http.get<IUserProfile[]>(url)

  };


  getContacts(site: ISite): Observable<IUserProfile[]> {

    const   controller =  "/clients/"

    const endPoint = `GetClientByPage`

    const parameters = `?pageNumber=${this.pageNumber}&pageSize=${this.pageSize}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.get<IUserProfile[]>(url)

  };

  getContactBySearch(site: ISite, fields: string, pageNumber: number, pageSize: number): Observable<ClientSearchResults> {

    const  controller =  "/clients/"

    const endPoint = "GetClientBySearch"

    const parameters = `?fields=${fields}&pageNumber=${pageNumber}&PageSize=${pageSize}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.get<ClientSearchResults>(url)

  };

  getContactBySearchModel(site: ISite, searchModel: ClientSearchModel): Observable<ClientSearchResults> {

    const  controller =  "/clients/"

    const endPoint = "GetClientBySearchModel"

    const parameters = ``

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.post<ClientSearchResults>(url, searchModel)

  };

  getContact(site: ISite, id: string): Observable<IUserProfile> {

    const  controller =  "/clients/"

    const endPoint = `GetClientByID`

    const parameters = `?id=${id}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.get<IUserProfile>(url)

  };

  getContactByAccountNumber(site: ISite, accountNumber: string): Observable<IUserProfile> {

    const  controller =  "/clients/"

    const endPoint = `getContactByAccountNumber`

    const parameters = `?accountNumber=${accountNumber}`

    const uri = `${site.url}${controller}${endPoint}${parameters}`

    const url = { url: uri, cacheMins: 0}

    return  this.http.get<IUserProfile>(url)

  };

}
